"""nanobot.api.services.agent - Agent service for API routes.

This module provides the AgentService class that manages AgentLoop
instances for the HTTP API.
"""

import asyncio
from datetime import datetime
from typing import Any

from nanobot.agent.loop import AgentLoop
from nanobot.bus.queue import MessageBus


class AgentService:
    """Service class that manages AgentLoop instances for API usage.

    This service provides a high-level interface for the HTTP API to interact
    with the agent, handling message processing, streaming responses, and
    task cancellation.
    """

    def __init__(self, config: Any):
        """Initialize the AgentService.

        Args:
            config: Configuration object containing agent, provider, and workspace settings.
        """
        self._config = config
        self._agent: AgentLoop | None = None
        self._bus: MessageBus | None = None
        self._running_task: asyncio.Task | None = None
        self._abort_event: asyncio.Event = asyncio.Event()
        self._current_stream_task: asyncio.Task | None = None
        self._start_time: datetime | None = None

    async def initialize(self) -> None:
        """Initialize the AgentLoop and message bus."""
        if self._agent is not None:
            return

        from nanobot.cron.service import CronService

        self._bus = MessageBus()

        # Create provider
        provider = self._make_provider()

        # Create cron service
        cron_store_path = self._config.workspace_path / "cron" / "jobs.json"
        cron_store_path.parent.mkdir(parents=True, exist_ok=True)
        cron = CronService(cron_store_path)

        # Create agent
        self._agent = AgentLoop(
            bus=self._bus,
            provider=provider,
            workspace=self._config.workspace_path,
            model=self._config.agents.defaults.model,
            max_iterations=self._config.agents.defaults.max_tool_iterations,
            context_window_tokens=self._config.agents.defaults.context_window_tokens,
            web_search_config=self._config.tools.web.search,
            web_proxy=self._config.tools.web.proxy or None,
            exec_config=self._config.tools.exec,
            cron_service=cron,
            restrict_to_workspace=self._config.tools.restrict_to_workspace,
            session_manager=self._create_session_manager(),
            mcp_servers=self._config.tools.mcp_servers,
            channels_config=self._config.channels,
            timezone=self._config.agents.defaults.timezone,
        )

        self._start_time = datetime.now()

        # Start agent loop in background
        self._running_task = asyncio.create_task(self._agent.run())

    def _make_provider(self) -> Any:
        """Create the LLM provider from config."""
        from nanobot.providers.base import GenerationSettings
        from nanobot.providers.registry import find_by_name

        model = self._config.agents.defaults.model
        provider_name = self._config.get_provider_name(model)
        p = self._config.get_provider(model)
        spec = find_by_name(provider_name) if provider_name else None
        backend = spec.backend if spec else "openai_compat"

        if backend == "anthropic":
            from nanobot.providers.anthropic_provider import AnthropicProvider

            return AnthropicProvider(
                api_key=p.api_key if p else None,
                api_base=self._config.get_api_base(model),
                default_model=model,
                extra_headers=p.extra_headers if p else None,
            )
        elif backend == "azure_openai":
            from nanobot.providers.azure_openai_provider import AzureOpenAIProvider

            return AzureOpenAIProvider(
                api_key=p.api_key,
                api_base=p.api_base,
                default_model=model,
            )
        elif backend == "openai_codex":
            from nanobot.providers.openai_codex_provider import OpenAICodexProvider

            return OpenAICodexProvider(default_model=model)
        else:
            from nanobot.providers.openai_compat_provider import OpenAICompatProvider

            return OpenAICompatProvider(
                api_key=p.api_key if p else None,
                api_base=self._config.get_api_base(model),
                default_model=model,
                extra_headers=p.extra_headers if p else None,
                spec=spec,
            )

    def _create_session_manager(self) -> Any:
        """Create session manager for the agent."""
        from nanobot.session.manager import SessionManager

        return SessionManager(self._config.workspace_path)

    @property
    def agent(self) -> AgentLoop | None:
        """Get the underlying AgentLoop instance."""
        return self._agent

    async def process_chat_non_stream(
        self,
        message: str,
        session_id: str | None = None,
    ) -> dict[str, Any]:
        """Process a chat message without streaming.

        Args:
            message: The user's message content.
            session_id: Optional session key (defaults to "api:direct").

        Returns:
            Dictionary containing the response content and metadata.
        """
        if self._agent is None:
            await self.initialize()

        session_key = session_id or "api:direct"

        result = await self._agent.process_direct(
            content=message,
            session_key=session_key,
            channel="api",
            chat_id="direct",
        )

        return {
            "content": result.content if result else None,
            "metadata": result.metadata if result else None,
        }

    async def abort(self) -> dict[str, str]:
        """Abort the currently running generation.

        Returns:
            Dictionary with status message.
        """
        if self._current_stream_task is not None:
            self._current_stream_task.cancel()
            try:
                await asyncio.wait_for(asyncio.shield(self._current_stream_task), timeout=5.0)
            except (asyncio.CancelledError, asyncio.TimeoutError):
                pass
            self._current_stream_task = None
            return {"status": "aborted"}

        return {"status": "no_active_generation"}

    def get_status(self) -> dict[str, Any]:
        """Get the current status of the agent.

        Returns:
            Dictionary containing agent status information.
        """
        is_running = self._running_task is not None and not self._running_task.done()

        return {
            "running": is_running,
            "model": self._config.agents.defaults.model if self._config else None,
            "last_activity": self._start_time.isoformat() if self._start_time else None,
        }

    async def shutdown(self) -> None:
        """Shutdown the agent service gracefully."""
        if self._running_task is not None:
            self._running_task.cancel()
            try:
                await asyncio.wait_for(asyncio.shield(self._running_task), timeout=5.0)
            except (asyncio.CancelledError, asyncio.TimeoutError):
                pass

        if self._agent is not None:
            await self._agent.close_mcp()
            self._agent.stop()

        self._agent = None
        self._bus = None
        self._running_task = None


# Global agent service instance (initialized per-app)
_agent_service: AgentService | None = None


async def get_agent_service(config: Any = None) -> AgentService:
    """Get or create the global AgentService instance.

    Args:
        config: Configuration object. If None, loads from default path.

    Returns:
        The global AgentService instance.
    """
    global _agent_service
    if _agent_service is None:
        if config is None:
            from nanobot.config.loader import load_config

            config = load_config()

        _agent_service = AgentService(config)
        await _agent_service.initialize()
    return _agent_service


async def shutdown_agent_service() -> None:
    """Shutdown the global AgentService instance."""
    global _agent_service
    if _agent_service is not None:
        await _agent_service.shutdown()
        _agent_service = None
