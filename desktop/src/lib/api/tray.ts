/**
 * 托盘 API 模块
 * 封装 Tauri command 调用，用于与 Rust 后端通信
 */

import { invoke } from '@tauri-apps/api/core';

/**
 * Sidecar 状态类型
 * 对应 Rust 中的 SidecarStatus 枚举
 */
export type SidecarStatus =
	| { type: 'stopped' }
	| { type: 'starting' }
	| { type: 'running'; port: number }
	| { type: 'stopping' }
	| { type: 'crashed'; message: string };

/**
 * 获取 Sidecar 当前状态
 * @returns SidecarStatus 状态对象
 */
export async function getSidecarStatus(): Promise<SidecarStatus> {
	try {
		const status = await invoke<SidecarStatus>('cmd_get_sidecar_status');
		console.log('[nanobot] Sidecar status:', status);
		return status;
	} catch (error) {
		// Tauri not available (browser environment)
		console.error('[nanobot] Failed to get sidecar status:', error);
		return { type: 'stopped' };
	}
}

/**
 * 启动 Sidecar (Gateway)
 * @returns 启动的端口号
 */
export async function startSidecar(): Promise<number> {
	return await invoke<number>('cmd_start_sidecar');
}

/**
 * 停止 Sidecar (Gateway)
 */
export async function stopSidecar(): Promise<void> {
	await invoke('cmd_stop_sidecar');
}

/**
 * 检查 Sidecar 是否正在运行
 * @returns 是否正在运行
 */
export async function isSidecarRunning(): Promise<boolean> {
	const status = await getSidecarStatus();
	return status.type === 'running';
}

/**
 * 获取 Gateway 端口
 * @returns 端口号，如果未运行则返回 null
 */
export async function getGatewayPort(): Promise<number | null> {
	const status = await getSidecarStatus();
	return status.type === 'running' ? status.port : null;
}

/**
 * 确保 Sidecar 正在运行
 * 如果未运行则启动，如果已运行则返回端口
 * @returns 端口号
 */
export async function ensureSidecarRunning(): Promise<number> {
	console.log('[nanobot] Ensuring sidecar is running...');
	const status = await getSidecarStatus();

	if (status.type === 'running') {
		console.log('[nanobot] Sidecar already running on port:', status.port);
		return status.port;
	}

	if (status.type === 'starting') {
		console.log('[nanobot] Sidecar is starting, waiting...');
		// 等待启动完成
		for (let i = 0; i < 30; i++) {
			await new Promise(resolve => setTimeout(resolve, 1000));
			const newStatus = await getSidecarStatus();
			if (newStatus.type === 'running') {
				console.log('[nanobot] Sidecar started on port:', newStatus.port);
				return newStatus.port;
			}
			if (newStatus.type === 'crashed') {
				throw new Error(`Sidecar crashed: ${newStatus.message}`);
			}
		}
		throw new Error('Sidecar startup timeout');
	}

	if (status.type === 'crashed') {
		throw new Error(`Sidecar crashed: ${status.message}`);
	}

	// 启动 sidecar
	console.log('[nanobot] Starting sidecar...');
	const port = await startSidecar();
	console.log('[nanobot] Sidecar started on port:', port);
	return port;
}

// ============================================================================
// 聊天日志 API
// ============================================================================

/**
 * 打印用户消息到控制台
 * @param message 用户消息
 */
export async function logUserMessage(message: string): Promise<void> {
	try {
		await invoke('log_user_message', { message });
	} catch {
		// 非阻塞，忽略错误
	}
}

/**
 * 打印 AI 回复到控制台
 * @param response AI 回复
 */
export async function logAiResponse(response: string): Promise<void> {
	try {
		await invoke('log_ai_response', { response });
	} catch {
		// 非阻塞，忽略错误
	}
}

/**
 * 打印流式 AI 回复片段
 * @param delta 回复片段
 */
export async function logAiDelta(delta: string): Promise<void> {
	try {
		await invoke('log_ai_delta', { delta });
	} catch {
		// 非阻塞，忽略错误
	}
}

/**
 * 打印流式回复开始
 */
export async function logAiResponseStart(): Promise<void> {
	try {
		await invoke('log_ai_response_start');
	} catch {
		// 非阻塞，忽略错误
	}
}

/**
 * 打印流式回复结束
 */
export async function logAiResponseEnd(): Promise<void> {
	try {
		await invoke('log_ai_response_end');
	} catch {
		// 非阻塞，忽略错误
	}
}

// ============================================================================
// 窗口管理 API
// ============================================================================

/**
 * 显示主窗口
 */
export async function showWindow(): Promise<void> {
	try {
		const { getCurrentWindow } = await import('@tauri-apps/api/window');
		const window = getCurrentWindow();
		await window.show();
		await window.setFocus();
	} catch {
		// Not in Tauri environment
	}
}

/**
 * 隐藏主窗口
 */
export async function hideWindow(): Promise<void> {
	try {
		const { getCurrentWindow } = await import('@tauri-apps/api/window');
		const window = getCurrentWindow();
		await window.hide();
	} catch {
		// Not in Tauri environment
	}
}

/**
 * 退出应用
 */
export async function quitApp(): Promise<void> {
	try {
		await stopSidecar().catch(() => {});
	} finally {
		window.close();
	}
}
