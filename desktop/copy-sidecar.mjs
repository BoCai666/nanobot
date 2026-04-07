/**
 * Copy sidecar binary to Tauri target directories.
 * 
 * Tauri looks for sidecar in:
 * - Debug: src-tauri/target/debug/binaries/
 * - Release: src-tauri/target/release/binaries/
 * 
 * But build_sidecar.py outputs to: desktop/binaries/
 */

import { cpSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isDebug = process.argv.includes('--debug');

const binariesDir = join(__dirname, 'binaries');
const srcTauriDir = join(__dirname, 'src-tauri');

// Find the sidecar binary
const binaryPrefix = 'nanobot-sidecar-x86_64-pc-windows-msvc';
const suffix = isDebug ? '-debug.exe' : '.exe';
const binaryName = binaryPrefix + suffix;

// Source path
const sourcePath = join(binariesDir, binaryName);

if (!existsSync(sourcePath)) {
  console.error(`Sidecar binary not found: ${sourcePath}`);
  console.error('Run: python ../scripts/build_sidecar.py' + (isDebug ? ' --debug' : ''));
  process.exit(1);
}

console.log(`Found sidecar: ${sourcePath}`);

/**
 * Copy sidecar binary to Tauri target directories.
 * 
 * Tauri looks for sidecar in:
 * - Debug: src-tauri/target/debug/binaries/
* - Release: src-tauri/target/release/binaries/
 * - Debug bundle: src-tauri/target/debug/binaries/
 * - Release bundle: src-tauri/target/release/binaries/

Note: Tauri's externalBin always uses the release naming convention (no -debug suffix),
regardless of the build profile. Use separate builds if you need debug sidecars.

USAGE:
const binariesDir = join(__dirname, 'binaries');
const srcTauriDir = join(__dirname, 'src-tauri');

// Find the sidecar binary
const binaryPrefix = 'nanobot-sidecar-x86_64-pc-windows-msvc';
const suffix = isDebug ? '-debug.exe' : '.exe';
const binaryName = binaryPrefix + suffix;

// Source path
const sourcePath = join(binariesDir, binaryName)

if (!existsSync(sourcePath)) {
  console.error(`Sidecar binary not found: ${sourcePath}`);
  console.error('Run: python ../scripts/build_sidecar.py' + (isDebug ? ' --debug' : ''))
  process.exit(1)
}

console.log(`Found sidecar: ${sourcePath}`)

// Target directories
const targets = [
  { name: 'debug', path: join(srcTauriDir, 'target', 'debug', 'binaries') },
  { name: 'release', path: join(srcTauriDir, 'target', 'release', 'binaries') },
]

// Tauri expects the binary without -debug suffix
const targetBinaryName = binaryPrefix + '.exe'

for (const target of targets) {
  // Create directory if not exists
  mkdirSync(target.path, { recursive: true })
  
  // Copy binary
  const destPath = join(target.path, targetBinaryName)
  cpSync(sourcePath, destPath)
  console.log(`Copied to: ${destPath}`)
}

console.log('Sidecar copy complete!')

// Tauri expects the binary without -debug suffix
const targetBinaryName = binaryPrefix + '.exe';

for (const target of targets) {
  // Create directory if not exists
  mkdirSync(target.path, { recursive: true });
  
  // Copy binary
  const destPath = join(target.path, targetBinaryName);
  cpSync(sourcePath, destPath);
  console.log(`Copied to: ${destPath}`);
}

console.log('Sidecar copy complete!');
