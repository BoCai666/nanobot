"""nanobot.api.routes.gateway - Gateway API routes.

Provides endpoints for controlling the Gateway (ChannelManager).
"""

from typing import Any

from fastapi import APIRouter, HTTPException

from nanobot.api.services.gateway import GatewayService, get_gateway_service
from nanobot.config.loader import load_config

router = APIRouter(prefix="/api/gateway", tags=["gateway"])


def _require_gateway_initialized() -> GatewayService:
    """Get the gateway service, raising HTTPException if not initialized."""
    service = get_gateway_service()
    if service.channel_manager is None:
        raise HTTPException(
            status_code=503,
            detail="Gateway not initialized. Call POST /api/gateway/start first.",
        )
    return service


@router.get("/status", response_model=dict[str, Any])
async def get_gateway_status() -> dict[str, Any]:
    """Get the current gateway status.

    Returns:
        Status dict with format:
        {
            "running": bool,
            "channels": {
                "telegram": {"enabled": true, "running": true},
                ...
            }
        }
    """
    service = get_gateway_service()
    return service.get_status()


@router.post("/start", response_model=dict[str, Any])
async def start_gateway() -> dict[str, Any]:
    """Start the gateway (all channels).

    Initializes the gateway service if not already initialized,
    then starts all configured channels.

    Returns:
        Status dict with running=True and channel details.

    Note:
        This operation is idempotent - starting an already running
        gateway returns success without errors.
    """
    service = get_gateway_service()

    # Initialize if not already done
    if service.channel_manager is None:
        config = load_config()
        await service.initialize(config)

    return await service.start()


@router.post("/stop", response_model=dict[str, Any])
async def stop_gateway() -> dict[str, Any]:
    """Stop the gateway (all channels).

    Stops all running channels and shuts down the dispatcher.

    Returns:
        Status dict with running=False.

    Note:
        This operation is idempotent - stopping an already stopped
        gateway returns success without errors.
    """
    service = _require_gateway_initialized()
    return await service.stop()
