"""nanobot.api.__main__ - Sidecar entry point for PyInstaller packaging.

This module serves as the entry point when running the nanobot API server
as a standalone executable (sidecar) for Tauri desktop integration.

Usage:
    python -m nanobot.api [OPTIONS]

Options:
    --host TEXT     Host to bind to [default: 127.0.0.1]
    --port INTEGER  Port to bind to [default: 8008]
    --help          Show this message and exit.

Example:
    python -m nanobot.api --host 127.0.0.1 --port 8008
"""

# Force UTF-8 on Windows BEFORE any other imports.
# This prevents GBK encoding errors when LLM responses contain emoji/unicode.
import os
import sys

if sys.platform == "win32":
    os.environ["PYTHONIOENCODING"] = "utf-8"
    os.environ["PYTHONUTF8"] = "1"
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, io.UnsupportedOperation):
        pass
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, io.UnsupportedOperation):
        pass

from nanobot.api.server import main

if __name__ == "__main__":
    main()
