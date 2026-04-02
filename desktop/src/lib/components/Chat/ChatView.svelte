<script lang="ts">
	/**
	 * ChatView 组件
	 *
	 * 温暖亲切的聊天视图，整合消息列表和输入框
	 * - 温暖的背景渐变和品牌色点缀
	 * - 精致的微交互动画
	 * - 使用设计系统的 CSS variables
	 */
	import ChatContainer from '$lib/components/ui/ChatContainer.svelte';
	import ErrorState from '$lib/components/ui/ErrorState.svelte';
	import type { Message } from '$lib/types/message';
	import { agentAPI } from '$lib/api/agent';
	import { logUserMessage, logAiResponseStart, logAiDelta, logAiResponseEnd } from '$lib/api/tray';
	import { logger } from '$lib/utils/logger';
	import { appStore } from '$lib/stores/app.svelte';
	import { historyStore } from '$lib/stores/history.svelte';

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

	// 监听新建对话请求
	$effect(() => {
		// 读取 newChatCounter 触发响应式依赖
		const counter = appStore.newChatCounter;
		// 当 counter > 0 时清除消息（首次加载时 counter 为 0，不触发）
		if (counter > 0) {
			clearChat();
		}
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

			// 发送成功后，保存/更新历史记录
			saveCurrentConversation();

		} catch (error) {
			logger.error('Failed to generate response:', error);

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

	// 保存当前对话到历史记录
	function saveCurrentConversation() {
		if (!chatContainerRef) return;

		const messages = chatContainerRef.getMessages();
		if (messages.length === 0) return;

		const currentConvId = appStore.currentConversationId;
		const firstUserMsg = messages.find(m => m.role === 'user')?.content || '';
		const title = firstUserMsg.length > 30 ? firstUserMsg.substring(0, 30) + '...' : firstUserMsg;

		if (!currentConvId) {
			// 创建新对话
			const newConv = historyStore.addConversation(title, 'desktop', messages);
			appStore.setCurrentConversationId(newConv.id);
		} else {
			// 更新现有对话
			historyStore.updateConversation(currentConvId, {
				messages: messages,
				messageCount: messages.length,
				preview: firstUserMsg.substring(0, 100)
			});
		}
	}

	// 加载历史对话
	function loadConversation(convId: string) {
		const messages = historyStore.getConversationMessages(convId);
		if (messages.length > 0) {
			chatContainerRef?.setMessages(messages);
		} else {
			chatContainerRef?.clearMessages();
		}
	}

	// 监听当前对话 ID 变化（点击历史记录）
	$effect(() => {
		const convId = appStore.currentConversationId;
		if (convId) {
			loadConversation(convId);
		}
	});

	// 重试发送
	async function handleRetry() {
		// 重新检查连接
		await checkConnection();
		
		// 清除错误状态
		errorState = { hasError: false, title: '', message: '' };
	}
</script>

<div class="chat-view">
	<!-- 温暖的背景装饰 -->
	<div class="bg-decoration">
		<div class="warm-glow"></div>
	</div>
	
	<!-- 聊天头部 -->
	<header class="chat-header">
		<div class="header-left">
			<div class="channel-icon">
				<span class="icon-emoji">💬</span>
			</div>
			<div class="channel-info">
				<h3 class="channel-name">{channelName}</h3>
				<div class="connection-status" title={connectionStatus === 'connected' ? '已连接到 Gateway' : '未连接'}>
					<span class="status-dot" class:connected={connectionStatus === 'connected'}></span>
					<span class="status-text">{connectionStatus === 'connected' ? '已连接' : '离线'}</span>
				</div>
			</div>
		</div>
		
		<div class="header-actions">
			{#if isGenerating}
				<button class="action-btn abort-btn" onclick={handleAbort} title="中断生成">
					<svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<rect x="6" y="6" width="12" height="12" rx="2"/>
					</svg>
					<span class="action-label">停止</span>
				</button>
			{/if}
			{#if chatContainerRef && chatContainerRef.getMessages().length > 0}
				<button class="action-btn clear-btn" onclick={clearChat} title="清除对话">
					<svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 6h18"/>
						<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
					</svg>
					<span class="action-label">清空</span>
				</button>
			{/if}
		</div>
	</header>
	
	<!-- 聊天内容区 -->
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
	/* ============================================
	   主容器 - 温暖背景
	   ============================================ */
	.chat-view {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		background-color: var(--color-bg-primary);
		overflow: hidden;
	}

	/* 背景装饰 - 温暖光晕 */
	.bg-decoration {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		overflow: hidden;
		z-index: 0;
	}

	.warm-glow {
		position: absolute;
		top: -120px;
		right: -80px;
		width: 300px;
		height: 300px;
		background: radial-gradient(
			circle,
			var(--color-brand-200) 0%,
			var(--color-brand-100) 30%,
			transparent 70%
		);
		opacity: 0.6;
		filter: blur(40px);
		animation: float-glow 20s ease-in-out infinite;
	}

	@keyframes float-glow {
		0%, 100% {
			transform: translate(0, 0) scale(1);
			opacity: 0.6;
		}
		50% {
			transform: translate(-20px, 10px) scale(1.1);
			opacity: 0.4;
		}
	}

	/* ============================================
	   聊天头部 - 温暖精致
	   ============================================ */
	.chat-header {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		background: linear-gradient(
			to bottom,
			var(--color-bg-secondary) 0%,
			var(--color-bg-primary) 100%
		);
		border-bottom: 1px solid var(--color-border);
		backdrop-filter: blur(8px);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.channel-icon {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-lg);
		background: linear-gradient(
			135deg,
			var(--color-brand-400) 0%,
			var(--color-brand-500) 100%
		);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px -2px var(--color-primary-shadow);
	}

	.icon-emoji {
		font-size: var(--text-lg);
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
	}

	.channel-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.channel-name {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--color-fg-primary);
		margin: 0;
		line-height: var(--leading-tight);
	}

	/* 连接状态 */
	.connection-status {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: 2px var(--space-2);
		border-radius: var(--radius-sm);
		background-color: var(--color-bg-tertiary);
	}

	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: var(--color-error);
		transition: background-color var(--transition-base);
	}

	.status-dot.connected {
		background-color: var(--color-success);
		animation: pulse-dot 2s ease-in-out infinite;
	}

	@keyframes pulse-dot {
		0%, 100% {
			box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
		}
		50% {
			box-shadow: 0 0 0 4px rgba(34, 197, 94, 0);
		}
	}

	.status-text {
		font-size: var(--text-xs);
		color: var(--color-fg-tertiary);
		font-weight: 500;
	}

	/* 头部操作按钮 */
	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		background: var(--color-bg-elevated);
		color: var(--color-fg-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		box-shadow: var(--shadow-sm);
	}

	.action-btn:hover {
		background: var(--color-bg-tertiary);
		border-color: var(--color-border-hover);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.action-btn:active {
		transform: translateY(0) scale(0.98);
	}

	.action-icon {
		width: 16px;
		height: 16px;
	}

	.action-label {
		font-size: var(--text-xs);
		font-weight: 500;
	}

	.abort-btn {
		border-color: var(--color-warning);
		color: var(--color-warning);
	}

	.abort-btn:hover {
		background: var(--color-warning-bg);
		border-color: var(--color-warning);
		color: var(--color-warning-dark);
	}

	.clear-btn:hover {
		border-color: var(--color-error);
		color: var(--color-error);
		background: var(--color-error-bg);
	}

	/* ============================================
	   聊天内容区
	   ============================================ */
	.chat-content {
		position: relative;
		z-index: 1;
		flex: 1;
		width: 100%;
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

	/* ============================================
	   响应式适配
	   ============================================ */
	@media (max-width: 640px) {
		.chat-header {
			padding: var(--space-2) var(--space-3);
		}

		.channel-icon {
			width: 36px;
			height: 36px;
		}

		.action-label {
			display: none;
		}

		.action-btn {
			padding: var(--space-2);
		}
	}

	/* ============================================
	   Reduced Motion 支持
	   ============================================ */
	@media (prefers-reduced-motion: reduce) {
		.status-dot.connected {
			animation: none;
		}

		.warm-glow {
			animation: none;
		}

		.action-btn {
			transition: none;
		}
	}
</style>
