#!/usr/bin/env python3
"""
Build nanobot sidecar binary for Tauri desktop integration.

This script uses PyInstaller to package the nanobot API server
as a standalone executable that can be embedded in the Tauri app.

Usage:
    python scripts/build_sidecar.py [--platform PLATFORM] [--debug]

Options:
    --platform PLATFORM   Target platform (windows, macos-intel, macos-arm, linux, auto)
    --debug              Build debug version (no compression, debug symbols)

Platforms:
    - windows: Build for Windows x64
    - macos-intel: Build for macOS Intel
    - macos-arm: Build for macOS ARM (Apple Silicon)
    - linux: Build for Linux x64
    - all: Build for all platforms (requires appropriate build environments)
    - auto: Auto-detect current platform (default)

Output:
    Binaries are placed in desktop/binaries/ with Tauri-compatible naming:
    - Windows: nanobot-sidecar-x86_64-pc-windows-msvc.exe
    - macOS Intel: nanobot-sidecar-x86_64-apple-darwin
    - macOS ARM: nanobot-sidecar-aarch64-apple-darwin
    - Linux: nanobot-sidecar-x86_64-unknown-linux-gnu

    Debug builds add '-debug' suffix:
    - Windows: nanobot-sidecar-x86_64-pc-windows-msvc-debug.exe
"""

import argparse
import platform
import shutil
import subprocess
import sys
from pathlib import Path

# Project root
PROJECT_ROOT = Path(__file__).parent.parent.resolve()

# Output directory
BINARIES_DIR = PROJECT_ROOT / "desktop" / "binaries"

# Platform-specific binary names (Tauri sidecar naming convention)
BINARY_NAMES = {
    "windows": "nanobot-sidecar-x86_64-pc-windows-msvc",
    "macos-intel": "nanobot-sidecar-x86_64-apple-darwin",
    "macos-arm": "nanobot-sidecar-aarch64-apple-darwin",
    "linux": "nanobot-sidecar-x86_64-unknown-linux-gnu",
}

# Excluded modules for release build
EXCLUDE_MODULES = [
    "tkinter",
    "matplotlib",
    "numpy",
    "pandas",
    "scipy",
    "PIL",
    "cv2",
    "torch",
    "tensorflow",
]


def get_spec_content(debug: bool = False) -> str:
    """Generate PyInstaller spec content based on build mode."""
    excludes = [] if debug else EXCLUDE_MODULES
    excludes_str = ",\n        ".join(f"'{m}'" for m in excludes)

    return f"""
# -*- mode: python ; coding: utf-8 -*-
import sys
from pathlib import Path

block_cipher = None

# Project root
project_root = Path(SPECPATH).parent

# Data files to include
datas = []
templates_dir = project_root / 'nanobot' / 'templates'
if templates_dir.exists():
    datas.append((str(templates_dir), 'nanobot/templates'))

a = Analysis(
    ['nanobot/api/__main__.py'],
    pathex=[str(project_root)],
    binaries=[],
    datas=datas,
    hiddenimports=[
        'nanobot',
        'nanobot.api',
        'nanobot.api.server',
        'nanobot.api.routes',
        'nanobot.api.routes.agent',
        'nanobot.api.routes.gateway',
        'nanobot.api.routes.channels',
        'nanobot.api.routes.config',
        'nanobot.api.services',
        'nanobot.api.services.agent',
        'nanobot.api.services.gateway',
        'nanobot.agent',
        'nanobot.agent.loop',
        'nanobot.agent.context',
        'nanobot.agent.memory',
        'nanobot.agent.tools',
        'nanobot.agent.skills',
        'nanobot.channels',
        'nanobot.providers',
        'nanobot.config',
        'nanobot.cli',
        'nanobot.bus',
        'nanobot.cron',
        'nanobot.session',
        'nanobot.utils',
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'httpcore',
        'httpcore._backends',
        'httpcore._backends.auto',
        'anyio',
        'anyio._backends',
        'anyio._backends._asyncio',
    ],
    hookspath=[],
    hooksconfig={{}},
    runtime_hooks=[],
    excludes=[
        {excludes_str}
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='nanobot-sidecar',
    debug={debug},
    bootloader_ignore_signals=False,
    strip={not debug},
    upx={not debug},
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # Keep console for stdin SHUTDOWN signal
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
"""


def get_current_platform() -> str:
    """Detect the current platform."""
    system = platform.system().lower()
    machine = platform.machine().lower()

    if system == "windows":
        return "windows"
    elif system == "darwin":
        if machine in ("arm64", "aarch64"):
            return "macos-arm"
        else:
            return "macos-intel"
    elif system == "linux":
        return "linux"
    else:
        raise RuntimeError(f"Unsupported platform: {system} {machine}")


def check_pyinstaller():
    """Check if PyInstaller is installed."""
    try:
        import PyInstaller  # noqa: F401

        print("[OK] PyInstaller found")
    except ImportError:
        print("[..] PyInstaller not found. Installing...")
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "pyinstaller"],
            check=True,
        )
        print("[OK] PyInstaller installed")


def build_sidecar(target_platform: str, debug: bool = False):
    """Build sidecar binary for the specified platform."""
    # Check PyInstaller
    check_pyinstaller()

    # Create output directory
    BINARIES_DIR.mkdir(parents=True, exist_ok=True)

    # Create spec file
    spec_file = PROJECT_ROOT / "nanobot-sidecar.spec"
    spec_file.write_text(get_spec_content(debug).strip())
    print(f"[OK] Created spec file: {spec_file}")

    # Build with PyInstaller
    mode = "DEBUG" if debug else "RELEASE"
    print(f"\nBuilding sidecar for {target_platform} ({mode})...")
    print("-" * 50)

    try:
        subprocess.run(
            [sys.executable, "-m", "PyInstaller", str(spec_file), "--clean", "--noconfirm"],
            cwd=PROJECT_ROOT,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        print(f"[ERR] PyInstaller build failed: {e}")
        raise

    # Find built binary
    dist_dir = PROJECT_ROOT / "dist"
    built_binary = (
        dist_dir / "nanobot-sidecar.exe"
        if target_platform == "windows"
        else dist_dir / "nanobot-sidecar"
    )

    if not built_binary.exists():
        # Try without .exe extension on Windows
        built_binary = dist_dir / "nanobot-sidecar"

    if not built_binary.exists():
        raise FileNotFoundError(f"Built binary not found at {built_binary}")

    # Generate output name
    base_name = BINARY_NAMES[target_platform]
    if debug:
        base_name += "-debug"
    if target_platform == "windows":
        base_name += ".exe"

    output_path = BINARIES_DIR / base_name

    # Copy binary
    shutil.copy2(built_binary, output_path)

    # Make executable on Unix
    if target_platform != "windows":
        output_path.chmod(0o755)

    print("-" * 50)
    print(f"[OK] Sidecar built successfully: {output_path}")
    print(f"     Size: {output_path.stat().st_size / 1024 / 1024:.1f} MB")
    if debug:
        print(f"     Mode: DEBUG (with debug symbols)")

    # Clean up
    spec_file.unlink(missing_ok=True)
    shutil.rmtree(PROJECT_ROOT / "build", ignore_errors=True)

    return output_path


def main():
    parser = argparse.ArgumentParser(
        description="Build nanobot sidecar binary for Tauri desktop integration"
    )
    parser.add_argument(
        "--platform",
        choices=["windows", "macos-intel", "macos-arm", "linux", "auto"],
        default="auto",
        help="Target platform (default: auto-detect)",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Build debug version (no compression, debug symbols)",
    )

    args = parser.parse_args()

    # Determine target platform
    if args.platform == "auto":
        target_platform = get_current_platform()
        print(f"Auto-detected platform: {target_platform}")
    else:
        target_platform = args.platform

    mode = "DEBUG" if args.debug else "RELEASE"
    print(f"\n{'=' * 50}")
    print(f"Building nanobot sidecar for: {target_platform}")
    print(f"Mode: {mode}")
    print(f"Output directory: {BINARIES_DIR}")
    print(f"{'=' * 50}\n")

    output_path = build_sidecar(target_platform, args.debug)

    print(f"\n{'=' * 50}")
    print("Build complete!")
    print(f"Binary: {output_path}")
    print(f"\nNext steps:")
    if args.debug:
        print("1. Build Tauri app (debug): cd desktop && pnpm tauri:build:debug")
    else:
        print("1. Build Tauri app: cd desktop && pnpm tauri:build")
    print(f"{'=' * 50}")


if __name__ == "__main__":
    main()
