# Sidecar Binary Directory

This directory contains the nanobot-sidecar executable for the Tauri desktop application.

## Binary Naming Convention

The sidecar binary follows Tauri sidecar naming conventions:
- Windows: `nanobot-sidecar-x86_64-pc-windows-msvc.exe`
- macOS Intel: `nanobot-sidecar-x86_64-apple-darwin`
- macOS ARM: `nanobot-sidecar-aarch64-apple-darwin`
- Linux: `nanobot-sidecar-x86_64-unknown-linux-gnu`

## Building the Sidecar

### Quick Start

From the project root, run:

```bash
# Auto-detect platform and build
python scripts/build_sidecar.py

# Or specify platform
python scripts/build_sidecar.py --platform windows
python scripts/build_sidecar.py --platform macos-arm
python scripts/build_sidecar.py --platform linux
```

### Requirements

- Python 3.11+
- PyInstaller (will be auto-installed if missing)

### Build Output

The built binary will be placed in this directory (`desktop/binaries/`).

## Building the Complete Desktop App

### Step 1: Build Sidecar

```bash
python scripts/build_sidecar.py
```

### Step 2: Build Tauri App

```bash
cd desktop
pnpm install
pnpm tauri build
```

### Output

The final executable will be in `desktop/src-tauri/target/release/bundle/`:
- Windows: `.exe` installer and `.msi`
- macOS: `.dmg` and `.app`
- Linux: `.deb`, `.AppImage`, etc.

## How It Works

1. **Tauri App** starts and loads the frontend
2. **Frontend** calls `ensureSidecarRunning()` which starts the Python sidecar
3. **Sidecar** runs the nanobot API server on a dynamic port (8008-8010)
4. **Frontend** connects to `http://localhost:{port}/api/agent/chat` for AI conversations
5. **On Exit** Tauri sends `SHUTDOWN\n` to sidecar for graceful termination

## Development

For development without building the sidecar:

```bash
# Terminal 1: Run nanobot gateway
nanobot gateway --port 18790

# Terminal 2: Run Tauri dev
cd desktop
pnpm tauri dev
```

The frontend will fall back to `http://localhost:18790` if sidecar is not available.
