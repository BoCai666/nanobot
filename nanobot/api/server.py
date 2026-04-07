"""nanobot.api.server - FastAPI server for nanobot.

This module provides the HTTP API server for external integrations.
"""

import asyncio
import os
import socket
import sys
import threading
from contextlib import asynccontextmanager
from typing import Any

# Force UTF-8 on Windows to avoid GBK encoding errors with emoji/unicode
if sys.platform == "win32":
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")
    os.environ.setdefault("PYTHONUTF8", "1")
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Use loguru if available, otherwise fall back to standard logging
try:
    from loguru import logger
except ImportError:
    import logging

    logger = logging.getLogger("nanobot.api.server")
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stderr)
        handler.setFormatter(
            logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        )
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)


def find_available_port(start_port: int = 8008, max_attempts: int = 10) -> int:
    """Find an available port starting from start_port.

    Args:
        start_port: The port to start checking from.
        max_attempts: Maximum number of ports to try.

    Returns:
        An available port number.

    Raises:
        RuntimeError: If no available port is found after max_attempts.
    """
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(("127.0.0.1", port))
                return port
        except OSError:
            continue
    raise RuntimeError(
        f"No available port found in range {start_port}-{start_port + max_attempts - 1}"
    )


class Server:
    """FastAPI server for nanobot with graceful shutdown support."""

    def __init__(self, host: str = "127.0.0.1", port: int = 8008):
        """Initialize the server.

        Args:
            host: Host to bind to.
            port: Port to bind to (will auto-select if unavailable).
        """
        self.host = host
        self.port = port
        self.should_exit = False
        self._shutdown_event = asyncio.Event()
        self._monitor_thread: threading.Thread | None = None

    def _monitor_stdin(self) -> None:
        """Monitor stdin for SHUTDOWN command in a separate thread."""
        try:
            if sys.stdin.isatty():
                # In interactive mode, use select to check for input
                import select

                while not self.should_exit:
                    if select.select([sys.stdin], [], [], 0.1)[0]:
                        line = sys.stdin.readline()
                        if line == "SHUTDOWN\n":
                            logger.info("Received SHUTDOWN command from stdin")
                            self.should_exit = True
                            self._shutdown_event.set()
                            break
            else:
                # In non-interactive mode, read from stdin pipe
                while not self.should_exit:
                    try:
                        line = sys.stdin.readline()
                        if not line:
                            # EOF reached
                            break
                        if line == "SHUTDOWN\n":
                            logger.info("Received SHUTDOWN command from stdin")
                            self.should_exit = True
                            self._shutdown_event.set()
                            break
                    except (IOError, OSError):
                        break
        except Exception as e:
            logger.debug(f"stdin monitor error: {e}")

    @asynccontextmanager
    async def lifespan(self, app: FastAPI):
        """Lifespan context manager for FastAPI."""
        # Start stdin monitor thread
        self._monitor_thread = threading.Thread(target=self._monitor_stdin, daemon=True)
        self._monitor_thread.start()

        logger.info(f"Server lifespan started, monitoring stdin for SHUTDOWN command")
        yield

        # Shutdown
        logger.info("Server lifespan ending")
        self.should_exit = True
        self._shutdown_event.set()

    def create_app(self) -> FastAPI:
        """Create and configure the FastAPI application."""
        app = FastAPI(
            title="nanobot API",
            description="HTTP API for nanobot integrations",
            version="0.1.0",
            lifespan=self.lifespan,
        )

        # Configure CORS for localhost access
        # Use allow_origin_regex to match all localhost variants including tauri.localhost
        import re

        app.add_middleware(
            CORSMiddleware,
            allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|tauri\.localhost)(:\d+)?",
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        # Health check endpoint
        @app.get("/api/health")
        async def health_check() -> dict[str, Any]:
            """Health check endpoint."""
            return {"status": "ok"}

        # Include API routers
        from nanobot.api.routes import api_router

        app.include_router(api_router)

        return app

    async def run_async(self) -> None:
        """Run the server asynchronously."""
        # Find available port if the default is in use
        actual_port = self.port
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind((self.host, self.port))
        except OSError:
            logger.warning(f"Port {self.port} is in use, trying to find available port")
            actual_port = find_available_port(self.port)
            logger.info(f"Using port {actual_port} instead")

        self.port = actual_port
        app = self.create_app()

        config = uvicorn.Config(
            app,
            host=self.host,
            port=self.port,
            log_level="info",
        )
        server = uvicorn.Server(config)

        # Run until shutdown event is set
        asyncio.create_task(server.serve())
        await self._shutdown_event.wait()

    def run(self) -> None:
        """Run the server synchronously."""
        logger.info(f"Starting nanobot API server on {self.host}:{self.port}")

        # Verify the port is available
        # Note: The sidecar manager (Rust) should have killed any process using this port
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind((self.host, self.port))
        except OSError:
            logger.error(f"Port {self.port} is already in use")
            raise RuntimeError(f"Port {self.port} is already in use")

        app = self.create_app()

        logger.info(f"Server will start on http://{self.host}:{self.port}")

        # Run uvicorn server
        uvicorn.run(
            app,
            host=self.host,
            port=self.port,
            log_level="info",
        )


def main() -> None:
    """CLI entry point for the API server."""
    import argparse

    parser = argparse.ArgumentParser(description="nanobot API server")
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Host to bind to (default: 127.0.0.1)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8008,
        help="Port to bind to (default: 8008, auto-selects if in use)",
    )
    args = parser.parse_args()

    server = Server(host=args.host, port=args.port)
    server.run()


if __name__ == "__main__":
    main()
