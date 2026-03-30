/**
 * Agent API 模块
 * 封装与 nanobot gateway 的通信
 */

import { getGatewayPort, ensureSidecarRunning } from './tray';

// 默认 API 端点
const DEFAULT_API_BASE = 'http://localhost:18790';

// API 配置
export interface AgentAPIConfig {
	baseUrl: string;
	timeout?: number;
}

// 聊天请求
export interface ChatRequest {
	message: string;
	sessionId?: string;
	stream?: boolean;
}

// 聊天响应（非流式）
export interface ChatResponse {
	content: string;
	role: string;
}

// Agent 状态
export interface AgentStatus {
	running: boolean;
	model?: string;
	lastActivity?: string;
}

// Gateway 状态
export interface GatewayStatus {
	running: boolean;
	channels: Record<string, { enabled: boolean; running: boolean }>;
}

// SSE 回调
export interface StreamCallbacks {
	onDelta: (delta: string) => void;
	onThinking?: (thinking: string) => void;  // 新增：思考过程回调
	onDone: () => void;
	onError: (error: string) => void;
	onAbort: () => void;
}

// 检测是否在 Tauri 环境中
async function isTauriEnv(): Promise<boolean> {
	try {
		// Tauri 2.0 方式：尝试导入 @tauri-apps/api/core
		const { invoke } = await import('@tauri-apps/api/core');
		// 如果能导入，说明在 Tauri 环境中
		return true;
	} catch {
		return false;
	}
}

/**
 * Agent API 服务
 */
export class AgentAPI {
	private baseUrl: string;
	private abortController: AbortController | null = null;
	private sidecarStarted: boolean = false;

	constructor(config?: Partial<AgentAPIConfig>) {
		this.baseUrl = config?.baseUrl || DEFAULT_API_BASE;
	}

	/**
	 * 获取 API 基础 URL
	 * 优先使用 Tauri sidecar 端口，否则使用配置的 baseUrl
	 */
	private async getApiBase(): Promise<string> {
		// 如果在 Tauri 环境中，尝试使用 sidecar
		if (await isTauriEnv()) {
			try {
				// 确保 sidecar 正在运行
				if (!this.sidecarStarted) {
					const port = await ensureSidecarRunning();
					this.sidecarStarted = true;
					return `http://localhost:${port}`;
				}

				// 检查 sidecar 端口
				const port = await getGatewayPort();
				if (port) {
					return `http://localhost:${port}`;
				}
			} catch (error) {
				console.warn('Failed to use sidecar, falling back to configured URL:', error);
			}
		}
		return this.baseUrl;
	}

	/**
	 * 更新基础 URL
	 */
	setBaseUrl(url: string): void {
		this.baseUrl = url;
	}

	/**
	 * 重置 sidecar 状态（用于重新连接）
	 */
	resetSidecar(): void {
		this.sidecarStarted = false;
	}

	/**
	 * 检查 Gateway 健康状态
	 */
	async healthCheck(): Promise<boolean> {
		const isTauri = await isTauriEnv();
		console.log('[nanobot] Starting health check, isTauriEnv:', isTauri, 'sidecarStarted:', this.sidecarStarted);
		try {
			// 在 Tauri 环境中，确保 sidecar 正在运行
			if (isTauri && !this.sidecarStarted) {
				try {
					const port = await ensureSidecarRunning();
					this.sidecarStarted = true;
					const apiBase = `http://localhost:${port}`;
					console.log('[nanobot] Health check using sidecar URL:', apiBase);
					const response = await fetch(`${apiBase}/api/health`, {
						method: 'GET',
						signal: AbortSignal.timeout(10000),
					});
					console.log('[nanobot] Health check response:', response.ok);
					return response.ok;
				} catch (e) {
					console.error('[nanobot] Failed to start sidecar:', e);
					this.sidecarStarted = false;
					return false;
				}
			}

			const apiBase = await this.getApiBase();
			console.log('[nanobot] Health check using URL:', apiBase);
			const response = await fetch(`${apiBase}/api/health`, {
				method: 'GET',
				signal: AbortSignal.timeout(5000),
			});
			console.log('[nanobot] Health check response:', response.ok);
			return response.ok;
		} catch (e) {
			console.error('[nanobot] Health check failed:', e);
			return false;
		}
	}

	/**
	 * 获取 Agent 状态
	 */
	async getStatus(): Promise<AgentStatus> {
		const apiBase = await this.getApiBase();
		const response = await fetch(`${apiBase}/api/agent/status`, {
			method: 'GET',
		});

		if (!response.ok) {
			throw new Error(`Failed to get agent status: ${response.statusText}`);
		}

		return response.json();
	}

	/**
	 * 获取 Gateway 状态
	 */
	async getGatewayStatus(): Promise<GatewayStatus> {
		const apiBase = await this.getApiBase();
		const response = await fetch(`${apiBase}/api/gateway/status`, {
			method: 'GET',
		});

		if (!response.ok) {
			throw new Error(`Failed to get gateway status: ${response.statusText}`);
		}

		return response.json();
	}

	/**
	 * 发送聊天消息（流式响应）
	 */
	async chatStream(request: ChatRequest, callbacks: StreamCallbacks): Promise<void> {
		const apiBase = await this.getApiBase();

		// 创建新的 AbortController
		this.abortController = new AbortController();

		try {
			const response = await fetch(`${apiBase}/api/agent/chat`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'text/event-stream',
				},
				body: JSON.stringify({
					message: request.message,
					session_id: request.sessionId,
					stream: true,
				}),
				signal: this.abortController.signal,
			});

			if (!response.ok) {
				throw new Error(`Chat request failed: ${response.statusText}`);
			}

			// 解析 SSE 流
			await this.parseSSE(response, callbacks);
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				callbacks.onAbort();
			} else {
				callbacks.onError(error instanceof Error ? error.message : 'Unknown error');
			}
		} finally {
			this.abortController = null;
		}
	}

	/**
	 * 发送聊天消息（非流式响应）
	 */
	async chat(request: ChatRequest): Promise<ChatResponse> {
		const apiBase = await this.getApiBase();

		const response = await fetch(`${apiBase}/api/agent/chat`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message: request.message,
				session_id: request.sessionId,
				stream: false,
			}),
		});

		if (!response.ok) {
			throw new Error(`Chat request failed: ${response.statusText}`);
		}

		return response.json();
	}

	/**
	 * 中断当前生成
	 */
	async abort(): Promise<void> {
		if (this.abortController) {
			this.abortController.abort();
		}

		const apiBase = await this.getApiBase();
		await fetch(`${apiBase}/api/agent/abort`, {
			method: 'POST',
		});
	}

	/**
	 * 解析 SSE 流
	 */
	private async parseSSE(response: Response, callbacks: StreamCallbacks): Promise<void> {
		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error('Response body is not readable');
		}

		const decoder = new TextDecoder();
		let buffer = '';

		try {
			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					callbacks.onDone();
					break;
				}

				buffer += decoder.decode(value, { stream: true });

				// 解析 SSE 事件
				const lines = buffer.split('\n');
				buffer = lines.pop() || ''; // 保留最后一个不完整的行

				for (const line of lines) {
					// 处理数据事件（普通内容）
					if (line.startsWith('data: ')) {
						const data = line.slice(6).trim();

						if (data === '[DONE]') {
							callbacks.onDone();
							return;
						}

						if (data === '[ABORTED]') {
							callbacks.onAbort();
							return;
						}

						if (data.startsWith('[ERROR')) {
							callbacks.onError(data);
							return;
						}

						// 发送文本增量
						callbacks.onDelta(data);
					}

					// 处理思考过程事件
					if (line.startsWith('thinking: ')) {
						const thinking = line.slice(10).trim();
						// 调用 onThinking 回调（如果提供）
						if (callbacks.onThinking) {
							callbacks.onThinking(thinking);
						}
					}
				}
			}
		} finally {
			reader.releaseLock();
		}
	}
}

// 创建全局实例
export const agentAPI = new AgentAPI();
