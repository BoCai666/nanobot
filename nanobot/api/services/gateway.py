"""nanobot.api.services.gateway - Gateway service layer.

This module provides the GatewayService class that manages the ChannelManager
lifecycle and provides an abstraction for starting/stopping the gateway.
"""

from __future__ import annotations

import asyncio
from typing import Any

from loguru import logger

from nanobot.bus.queue import MessageBus
from nanobot.channels.manager import ChannelManager
from nanobot.config.schema import Config


class GatewayService:
    """Service for managing the Gateway (ChannelManager) lifecycle.

    This class is responsible for:
    - Managing the ChannelManager instance
    - Starting/stopping channels asynchronously
    - Providing gateway status information

    The service is designed to be a singleton that persists for the
    lifetime of the API server process.
    """

    def __init__(self):
        """Initialize the GatewayService."""
        self._channel_manager: ChannelManager | None = None
        self._start_task: asyncio.Task | None = None
        self._config: Config | None = None
        self._bus: MessageBus | None = None

    def _ensure_initialized(self) -> None:
        """Ensure ChannelManager is initialized."""
        if self._channel_manager is None:
            raise RuntimeError("Gateway not initialized. Call initialize() first.")

    async def initialize(self, config: Config) -> None:
        """Initialize the GatewayService with configuration.

        Args:
            config: The nanobot configuration object.
        """
        if self._channel_manager is not None:
            logger.warning("GatewayService already initialized")
            return

        self._config = config
        self._bus = MessageBus()
        self._channel_manager = ChannelManager(config, self._bus)
        logger.info(
            "GatewayService initialized with {} channels", len(self._channel_manager.channels)
        )

    @property
    def is_running(self) -> bool:
        """Check if the gateway is currently running."""
        if self._channel_manager is None:
            return False
        # Check if any channel is running
        return any(ch.is_running for ch in self._channel_manager.channels.values())

    @property
    def channel_manager(self) -> ChannelManager | None:
        """Get the ChannelManager instance."""
        return self._channel_manager

    async def start(self) -> dict[str, Any]:
        """Start the gateway (all channels).

        Returns:
            Status dict with running=True and channel details.

        Note:
            This operation is idempotent - starting an already running
            gateway returns success without errors.
        """
        self._ensure_initialized()
        cm = self._channel_manager
        assert cm is not None

        if self.is_running:
            logger.info("Gateway already running")
            return self.get_status()

        if self._start_task is not None and not self._start_task.done():
            logger.info("Gateway start already in progress")
            return self.get_status()

        logger.info("Starting gateway...")
        self._start_task = asyncio.create_task(cm.start_all())

        # Give channels a moment to start
        await asyncio.sleep(0.1)

        status = self.get_status()
        logger.info("Gateway started with {} channels", len(status.get("channels", {})))
        return status

    async def stop(self) -> dict[str, Any]:
        """Stop the gateway (all channels).

        Returns:
            Status dict with running=False.

        Note:
            This operation is idempotent - stopping an already stopped
            gateway returns success without errors.
        """
        if self._channel_manager is None:
            logger.warning("Gateway not initialized, cannot stop")
            return {"running": False, "channels": {}}

        cm = self._channel_manager

        if not self.is_running:
            logger.info("Gateway already stopped")
            return {"running": False, "channels": cm.get_status()}

        logger.info("Stopping gateway...")

        # Cancel the start task if it's still running
        if self._start_task is not None and not self._start_task.done():
            self._start_task.cancel()
            try:
                await self._start_task
            except asyncio.CancelledError:
                pass
            self._start_task = None

        await cm.stop_all()

        status = {"running": False, "channels": cm.get_status()}
        logger.info("Gateway stopped")
        return status

    def get_status(self) -> dict[str, Any]:
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
        if self._channel_manager is None:
            return {"running": False, "channels": {}}

        return {
            "running": self.is_running,
            "channels": self._channel_manager.get_status(),
        }


# Global singleton instance
_gateway_service: GatewayService | None = None


def get_gateway_service() -> GatewayService:
    """Get the global GatewayService singleton.

    Returns:
        The global GatewayService instance.

    Raises:
        RuntimeError: If the service hasn't been initialized.
    """
    global _gateway_service
    if _gateway_service is None:
        _gateway_service = GatewayService()
    return _gateway_service
