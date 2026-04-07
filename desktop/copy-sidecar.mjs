/**
 * Copy sidecar binary to Tauri target directories.
 * 
 * Tauri looks for sidecar in:
 * - Dev mode: src-tauri/target/debug/nanobot-sidecar-{triple}.exe
 * - Debug bundle: src-tauri/target/debug/binaries/nanobot-sidecar-{triple}.exe
 * - Release bundle: src-tauri/target/release/binaries/nanobot-sidecar-{triple}.exe
 * 
 * But build_sidecar.py outputs to: desktop/binaries/
 */

import { cpSync, mkdirSync, existsSync } from 'fs';
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

// Target directories:
// - debug-root: Dev 模式使用 (tauri dev 直接查找)
// - debug: Debug bundle 使用
// - release: Release bundle 使用
const targets = [
  { name: 'debug-root', path: join(srcTauriDir, 'target', 'debug') },
  { name: 'debug', path: join(srcTauriDir, 'target', 'debug', 'binaries') },
  { name: 'release', path: join(srcTauriDir, 'target', 'release', 'binaries') },
];

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
