"""nanobot.api.routes.agent - Agent API routes.

This module provides HTTP API endpoints for agent interaction:
- POST /api/agent/chat - Send message (supports SSE streaming)
- POST /api/agent/abort - Abort current generation
- GET /api/agent/status - Get agent status
"""

import asyncio
from typing import Any, AsyncGenerator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from nanobot.api.services.agent import AgentService, get_agent_service


router = APIRouter(prefix="/api/agent", tags=["agent"])


class ChatRequest(BaseModel):
    """Request body for chat endpoint."""

    message: str
    session_id: str | None = None
    stream: bool = True


@router.post("/chat", response_model=None)
async def chat(
    request: ChatRequest,
    config: Any = None,
) -> StreamingResponse | dict[str, Any]:
    """Send a message to the agent.

    Supports both streaming (SSE) and non-streaming responses.

    Args:
        request: Chat request containing message and options.
        config: Injected configuration (set by dependency).

    Returns:
        StreamingResponse for SSE stream, or dict for non-streaming.
    """
    if not request.message:
        raise HTTPException(status_code=400, detail="message is required")

    agent_service = await get_agent_service(config)

    if request.stream:
        return StreamingResponse(
            _stream_chat(agent_service, request.message, request.session_id),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    else:
        result = await agent_service.process_chat_non_stream(
            message=request.message,
            session_id=request.session_id,
        )
        return result


async def _stream_chat(
    agent_service: AgentService,
    message: str,
    session_id: str | None,
) -> AsyncGenerator[str, None]:
    """Internal generator for streaming chat responses.

    Args:
        agent_service: The agent service instance.
        message: User message.
        session_id: Optional session identifier.

    Yields:
        SSE-formatted response chunks:
        - "data: ..." for regular content
        - "thinking: ..." for thinking content
    """
    session_key = session_id or "api:direct"

    # Unified queue for all events: (event_type, content)
    # event_type: "data", "thinking", or "control"
    event_queue: asyncio.Queue[tuple[str, str]] = asyncio.Queue()
    done_event = asyncio.Event()

    async def on_stream(delta: str) -> None:
        """Callback to collect streaming content deltas."""
        await event_queue.put(("data", delta))

    async def on_thinking(delta: str) -> None:
        """Callback to collect thinking content deltas."""
        await event_queue.put(("thinking", delta))

    async def on_stream_end(*, resuming: bool = False) -> None:
        """Callback when streaming ends.

        Args:
            resuming: If True, tool calls follow and stream should continue.
                      If False, this is the final response and stream should end.
        """
        if not resuming:
            await event_queue.put(("control", "[DONE]"))
            done_event.set()

    async def process_task():
        """Run the agent processing in background."""
        try:
            # Access the internal agent instance for direct processing
            agent = agent_service.agent
            if agent is None:
                await event_queue.put(("control", "[ERROR: Agent not initialized]"))
                done_event.set()
                return

            result = await agent.process_direct(
                content=message,
                session_key=session_key,
                channel="api",
                chat_id="direct",
                on_stream=on_stream,
                on_stream_end=on_stream_end,
                on_thinking=on_thinking,
            )
            # Note: result.content is already sent via on_stream callback during streaming.
            # We only need to handle the case where streaming didn't happen (no on_stream_end called).
            # The on_stream_end callback already sends [DONE] when resuming=False.
            done_event.set()
        except asyncio.CancelledError:
            await event_queue.put(("control", "[ABORTED]"))
            done_event.set()
            raise
        except Exception as e:
            await event_queue.put(("control", f"[ERROR: {str(e)}]"))
            done_event.set()

    # Start processing task
    process_coroutine = process_task()
    task = asyncio.create_task(process_coroutine)

    try:
        while not done_event.is_set():
            try:
                # Wait for next item with timeout to allow checking abort
                event_type, content = await asyncio.wait_for(event_queue.get(), timeout=0.5)

                if event_type == "control":
                    if content == "[DONE]":
                        yield "data: [DONE]\n\n"
                        break
                    elif content == "[ABORTED]":
                        yield "data: [ABORTED]\n\n"
                        break
                    elif content.startswith("[ERROR"):
                        yield f"data: {content}\n\n"
                        break
                elif event_type == "thinking":
                    # Thinking content - use "thinking:" event type
                    yield f"thinking: {content}\n\n"
                else:
                    # Regular content - use "data:" event type
                    yield f"data: {content}\n\n"

            except asyncio.TimeoutError:
                # Check if task was cancelled externally
                if task.done():
                    yield "data: [ABORTED]\n\n"
                    break
                continue

        # Drain any remaining items
        while not event_queue.empty():
            event_type, content = await event_queue.get()
            if event_type == "thinking":
                yield f"thinking: {content}\n\n"
            elif event_type == "data":
                yield f"data: {content}\n\n"

    finally:
        if not task.done():
            task.cancel()
            try:
                await asyncio.wait_for(asyncio.shield(task), timeout=1.0)
            except (asyncio.CancelledError, asyncio.TimeoutError):
                pass


@router.post("/abort")
async def abort(config: Any = None) -> dict[str, str]:
    """Abort the currently running generation.

    Args:
        config: Injected configuration (set by dependency).

    Returns:
        Status message indicating result.
    """
    agent_service = await get_agent_service(config)
    result = await agent_service.abort()
    return result


@router.get("/status")
async def status(config: Any = None) -> dict[str, Any]:
    """Get the current agent status.

    Args:
        config: Injected configuration (set by dependency).

    Returns:
        Dictionary containing running state, model, and last activity.
    """
    agent_service = await get_agent_service(config)
    return agent_service.get_status()
