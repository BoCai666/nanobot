/**
 * Tauri API Mock
 * 模拟 @tauri-apps/api 的核心功能
 */

import { vi } from 'vitest';

/**
 * Mock Invoke 函数
 */
export const mockInvoke = vi.fn();

/**
 * Mock Tauri 事件监听器
 */
const eventListeners = new Map<string, Set<(...args: unknown[]) => void>>();

/**
 * Mock emit 函数
 */
export const mockEmit = vi.fn(async (event: string, payload?: unknown) => {
	const listeners = eventListeners.get(event);
	if (listeners) {
		listeners.forEach(callback => callback(payload));
	}
});

/**
 * Mock listen 函数
 */
export const mockListen = vi.fn(async (event: string, callback: (...args: unknown[]) => void) => {
	if (!eventListeners.has(event)) {
		eventListeners.set(event, new Set());
	}
	eventListeners.get(event)!.add(callback);

	// 返回取消订阅函数
	return () => {
		eventListeners.get(event)?.delete(callback);
	};
});

/**
 * Mock Tauri API 核心模块
 */
export const tauriCore = {
	invoke: mockInvoke,
	emit: mockEmit,
	listen: mockListen,
};

/**
 * Mock Tauri 应用信息
 */
export const mockAppInfo = {
	name: 'nanobot-desktop',
	version: '0.1.0',
};

/**
 * Mock Tauri 路径
 */
export const mockPath = {
	appDataDir: vi.fn(async () => '/tmp/nanobot-desktop'),
	appConfigDir: vi.fn(async () => '/tmp/nanobot-desktop/config'),
	appLogDir: vi.fn(async () => '/tmp/nanobot-desktop/logs'),
};

/**
 * Mock Tauri 进程
 */
export const mockProcess = {
	exit: vi.fn((code: number) => code),
};

/**
 * 创建一个完整的 Tauri API mock
 */
export function createTauriMock() {
	return {
		core: tauriCore,
		path: mockPath,
		process: mockProcess,
		app: {
			getName: () => mockAppInfo.name,
			getVersion: () => mockAppInfo.version,
		},
	};
}

/**
 * 重置所有 Tauri mocks
 */
export function resetTauriMocks() {
	mockInvoke.mockReset();
	mockEmit.mockReset();
	mockListen.mockReset();
	eventListeners.clear();
	mockPath.appDataDir.mockClear();
	mockPath.appConfigDir.mockClear();
	mockPath.appLogDir.mockClear();
	mockProcess.exit.mockClear();
}

/**
 * 设置 Tauri mock 实现
 */
export function setupTauriMock(handlers: Record<string, unknown>) {
	mockInvoke.mockImplementation(async (cmd: string, args?: Record<string, unknown>) => {
		const handler = handlers[cmd];
		if (typeof handler === 'function') {
			return handler(args);
		}
		if (handler !== undefined) {
			return handler;
		}
		throw new Error(`No mock handler for Tauri command: ${cmd}`);
	});
}

/**
 * 导出默认的 Tauri mock
 */
export default {
	invoke: mockInvoke,
	emit: mockEmit,
	listen: mockListen,
	path: mockPath,
	process: mockProcess,
	app: {
		getName: () => mockAppInfo.name,
		getVersion: () => mockAppInfo.version,
	},
};
