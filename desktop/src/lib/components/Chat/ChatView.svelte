<script lang="ts">
	import ChatContainer from '$lib/components/ui/ChatContainer.svelte';
	import ErrorState from '$lib/components/ui/ErrorState.svelte';
	import type { Message } from '$lib/types/message';
	import { agentAPI } from '$lib/api/agent';
	import { logUserMessage, logAiResponseStart, logAiDelta, logAiResponseEnd } from '$lib/api/tray';

	// Props
	interface Props {
		channelName?: string;
		onSendMessage?: (message: string) => Promise<string>;
		sessionId?: string;
	}

	let {
		channelName = 'Chat',
		onSendMessage,
		sessionId = 'desktop:default'
	}: Props = $props();

	// ChatContainer 组件引用
	let chatContainerRef = $state<ChatContainer>();

	// 是否正在生成回复
	let isGenerating = $state(false);

	// API 连接状态
	let connectionStatus = $state<'connected' | 'disconnected' | 'connecting'>('disconnected');

	// 错误状态
	let errorState = $state<{
		hasError: boolean;
		title: string;
		message: string;
	}>({
		hasError: false,
		title: '',
		message: ''
	});

	// 检查 API 连接状态
	async function checkConnection() {
		connectionStatus = 'connecting';
		try {
			const isHealthy = await agentAPI.healthCheck();
			connectionStatus = isHealthy ? 'connected' : 'disconnected';
		} catch {
			connectionStatus = 'disconnected';
		}
	}

	// 组件挂载时检查连接
	$effect(() => {
		checkConnection();
		// 定期检查连接状态
		const interval = setInterval(checkConnection, 30000);
		return () => clearInterval(interval);
	});

	// 使用真实 API 发送消息
	async function sendMessageToAPI(content: string): Promise<void> {
		if (!chatContainerRef) return;

		// 开始流式响应，获取 AI 消息 ID
		const aiMessageId = chatContainerRef.startStreamingResponse();

		// 先显示思考提示
		chatContainerRef.appendStreamingContent(aiMessageId, '🤔 正在思考...');

		// 记录 AI 回复开始
		await logAiResponseStart();

		// 跟踪是否收到了实际内容
		let receivedContent = false;

		await agentAPI.chatStream(
			{
				message: content,
				sessionId: sessionId,
				stream: true,
			},
			{
				onThinking: async (thinking: string) => {
					// 收到思考过程内容
					chatContainerRef?.appendStreamingThinking(aiMessageId, thinking);
				},
				onDelta: async (delta: string) => {
					// 第一次收到内容时，清除思考提示
					if (!receivedContent) {
						receivedContent = true;
						// 清空之前的提示，重新开始
						chatContainerRef?.clearStreamingContent(aiMessageId);
					}
					chatContainerRef?.appendStreamingContent(aiMessageId, delta);
					// 记录流式回复到控制台
					await logAiDelta(delta);
				},
				onDone: async () => {
					// 如果没有收到任何内容，显示任务完成提示
					if (!receivedContent) {
						chatContainerRef?.clearStreamingContent(aiMessageId);
						chatContainerRef?.appendStreamingContent(aiMessageId, '✅ 任务已完成');
					}
					chatContainerRef?.finishStreamingResponse(aiMessageId);
					// 记录 AI 回复结束
					await logAiResponseEnd();
				},
				onError: async (error: string) => {
					chatContainerRef?.clearStreamingContent(aiMessageId);
					chatContainerRef?.appendStreamingContent(aiMessageId, `❌ 错误: ${error}`);
					chatContainerRef?.finishStreamingResponse(aiMessageId);
					await logAiResponseEnd();
				},
				onAbort: async () => {
					chatContainerRef?.finishStreamingResponse(aiMessageId);
					await logAiResponseEnd();
				},
			}
		);
	}

	// 模拟流式响应 (打字机效果) - 作为备用方案
	async function simulateStreamingResponse(
		messageId: string,
		fullText: string,
		chunkSize: number = 2,
		delayMs: number = 30
	) {
		if (!chatContainerRef) return;

		let currentIndex = 0;

		while (currentIndex < fullText.length) {
			const chunk = fullText.slice(currentIndex, currentIndex + chunkSize);
			chatContainerRef.appendStreamingContent(messageId, chunk);
			currentIndex += chunkSize;

			// 等待下一个字符
			await new Promise(resolve => setTimeout(resolve, delayMs));
		}
	}

	// 模拟 AI 回复 - 作为备用方案
	async function simulateAIResponse(userMessage: string): Promise<string> {
		// 模拟网络延迟
		await new Promise(resolve => setTimeout(resolve, 500));

		return `⚠️ **无法连接到 nanobot Gateway**

请确保：
1. Gateway 正在运行 (\`nanobot gateway\`)
2. API 端点配置正确

您的消息: "${userMessage.slice(0, 50)}${userMessage.length > 50 ? '...' : ''}"

---

*提示: 在设置中配置正确的 API 端点*`;
	}

	// 处理发送消息（由 ChatContainer 调用）
	async function handleSend(content: string) {
		if (!chatContainerRef) return;

		// 清除之前的错误状态
		errorState = { hasError: false, title: '', message: '' };

		// 记录用户消息到控制台
		await logUserMessage(content);

		// 开始生成回复
		isGenerating = true;

		try {
			if (onSendMessage) {
				// 使用外部提供的回调
				const responseText = await onSendMessage(content);
				const aiMessageId = chatContainerRef.startStreamingResponse();
				await simulateStreamingResponse(aiMessageId, responseText);
				chatContainerRef.finishStreamingResponse(aiMessageId);
			} else if (connectionStatus === 'connected') {
				// 使用真实 API
				await sendMessageToAPI(content);
			} else {
				// 使用模拟回复（显示错误提示）
				const aiMessageId = chatContainerRef.startStreamingResponse();
				const responseText = await simulateAIResponse(content);
				await simulateStreamingResponse(aiMessageId, responseText);
				chatContainerRef.finishStreamingResponse(aiMessageId);
			}

		} catch (error) {
			console.error('Failed to generate response:', error);

			// 显示错误状态
			errorState = {
				hasError: true,
				title: '生成回复失败',
				message: '抱歉，生成回复时遇到问题。请检查网络连接并重试。'
			};
		} finally {
			isGenerating = false;
		}
	}

	// 中断生成
	async function handleAbort() {
		await agentAPI.abort();
		isGenerating = false;
	}

	// 清除对话
	function clearChat() {
		chatContainerRef?.clearMessages();
		// 同时清除错误状态
		errorState = { hasError: false, title: '', message: '' };
	}

	// 重试发送
	async function handleRetry() {
		// 重新检查连接
		await checkConnection();
		
		// 清除错误状态
		errorState = { hasError: false, title: '', message: '' };
	}
</script>

<div class="chat-view">
	<div class="chat-header">
		<h3 class="chat-title">{channelName}</h3>
		<div class="header-actions">
			<!-- 连接状态指示器 -->
			<div class="connection-status" title={connectionStatus === 'connected' ? '已连接到 Gateway' : '未连接'}>
				<span class="status-dot" class:connected={connectionStatus === 'connected'}></span>
				<span class="status-text">{connectionStatus === 'connected' ? '已连接' : '离线'}</span>
			</div>
			{#if isGenerating}
				<button class="abort-btn" onclick={handleAbort} title="中断生成">
					<svg class="abort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="6" y="6" width="12" height="12" rx="2"/>
					</svg>
				</button>
			{/if}
			{#if chatContainerRef && chatContainerRef.getMessages().length > 0}
				<button class="clear-btn" onclick={clearChat} title="清除对话">
					<svg class="clear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 6h18"/>
						<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
					</svg>
				</button>
			{/if}
		</div>
	</div>
	<div class="chat-content">
		{#if errorState.hasError}
			<!-- 错误状态 -->
			<div class="error-container">
				<ErrorState
					title={errorState.title}
					message={errorState.message}
					icon="⚠️"
					showRetry={true}
					retryText="重试连接"
					onRetry={handleRetry}
				/>
			</div>
		{:else}
			<!-- 正常聊天界面 -->
			<ChatContainer
				bind:this={chatContainerRef}
				isLoading={isGenerating}
				onSend={handleSend}
			/>
		{/if}
	</div>
</div>

<style>
	.chat-view {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: var(--color-bg-primary);
	}

	.chat-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-bg-secondary);
	}

	.chat-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	/* 连接状态 */
	.connection-status {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-tertiary);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: var(--color-error);
	}

	.status-dot.connected {
		background-color: var(--color-success);
	}

	.status-text {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
	}

	.clear-btn,
	.abort-btn {
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		border: none;
		background: transparent;
		color: var(--color-text-tertiary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-fast);
	}

	.clear-btn:hover {
		background-color: var(--color-bg-tertiary);
		color: var(--color-error);
	}

	.abort-btn:hover {
		background-color: var(--color-bg-tertiary);
		color: var(--color-warning);
	}

	.clear-icon,
	.abort-icon {
		width: 18px;
		height: 18px;
	}

	.chat-content {
		flex: 1;
		overflow: hidden;
	}

	/* 错误状态容器 */
	.error-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-8);
		background-color: var(--color-bg-primary);
	}

	/* 响应 prefers-reduced-motion */
	@media (prefers-reduced-motion: reduce) {
		.status-dot.connected {
			animation: none;
		}
	}
</style>
