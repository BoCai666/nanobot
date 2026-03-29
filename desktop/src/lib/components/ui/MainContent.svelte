<script lang="ts">
	/**
	 * MainContent 组件
	 *
	 * 主内容区域组件，包含头部和聊天容器
	 * - 支持主题切换（通过 .dark 类）
	 * - 使用 CSS 变量进行样式管理
	 * - 响应式 flexbox 布局
	 *
	 * 用法:
	 * <MainContent title="聊天" {messages} {isLoading} {onSend} {onRetry} />
	 */
	import type { Message } from "$lib/types/message";
	import ChatContainer from "./ChatContainer.svelte";

	// Props
	interface Props {
		/** 页面标题 */
		title?: string;
		/** 副标题或描述 */
		subtitle?: string;
		/** 初始消息列表（可选） */
		messages?: Message[];
		/** 是否处于加载状态 */
		isLoading?: boolean;
		/** 发送消息回调 */
		onSend: (message: string) => void | Promise<void>;
		/** 重试消息回调 */
		onRetry?: (messageId: string) => void;
		/** 中断生成回调 */
		onAbort?: () => void;
		/** 头部右侧额外操作 */
		headerActions?: import("svelte").Snippet;
	}

	let {
		title = "聊天",
		subtitle,
		messages = [],
		isLoading = false,
		onSend,
		onRetry,
		onAbort,
		headerActions
	}: Props = $props();

	// ChatContainer 实例引用
	let chatContainerRef: ChatContainer;

	/**
	 * 开始流式响应
	 * 暴露给父组件使用
	 */
	export function startStreamingResponse(): string {
		return chatContainerRef.startStreamingResponse();
	}

	/**
	 * 更新流式响应内容
	 * 暴露给父组件使用
	 */
	export function appendStreamingContent(messageId: string, chunk: string) {
		chatContainerRef.appendStreamingContent(messageId, chunk);
	}

	/**
	 * 结束流式响应
	 * 暴露给父组件使用
	 */
	export function finishStreamingResponse(messageId: string) {
		chatContainerRef.finishStreamingResponse(messageId);
	}

	/**
	 * 设置消息列表
	 * 暴露给父组件使用
	 */
	export function setMessages(newMessages: Message[]) {
		chatContainerRef.setMessages(newMessages);
	}

	/**
	 * 获取当前消息列表
	 * 暴露给父组件使用
	 */
	export function getMessages(): Message[] {
		return chatContainerRef.getMessages();
	}

	/**
	 * 清空消息
	 * 暴露给父组件使用
	 */
	export function clearMessages() {
		chatContainerRef.clearMessages();
	}
</script>

<main class="main-content">
	<!-- 头部区域 -->
	<header class="main-header">
		<div class="header-content">
			<div class="header-title-group">
				<h1 class="header-title">{title}</h1>
				{#if subtitle}
					<span class="header-subtitle">{subtitle}</span>
				{/if}
			</div>
			{#if headerActions}
				<div class="header-actions">
					{@render headerActions()}
				</div>
			{/if}
		</div>
	</header>

	<!-- 聊天内容区域 -->
	<div class="main-body">
		<ChatContainer
			bind:this={chatContainerRef}
			{messages}
			{isLoading}
			{onSend}
			{onRetry}
			{onAbort}
		/>
	</div>
</main>

<style>
	.main-content {
		display: flex;
		flex-direction: column;
		min-width: 0;
		height: 100%;
		flex: 1;
		background-color: var(--color-bg-primary);
		transition: background-color var(--transition-base);
	}

	/* 头部样式 */
	.main-header {
		flex-shrink: 0;
		padding: var(--space-4) var(--space-6);
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-bg-secondary);
		transition: background-color var(--transition-base), border-color var(--transition-base);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.header-title-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.header-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
		line-height: 1.4;
		margin: 0;
		transition: color var(--transition-base);
	}

	.header-subtitle {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		line-height: 1.4;
		transition: color var(--transition-base);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	/* 主体内容区域 */
	.main-body {
		flex: 1;
		min-height: 0;
		overflow: hidden;
		background-color: var(--color-bg-primary);
		transition: background-color var(--transition-base);
	}

	/* 暗色模式适配 */
	:global(.dark) .main-content {
		background-color: var(--color-bg-primary);
	}

	:global(.dark) .main-header {
		background-color: var(--color-bg-secondary);
		border-color: var(--color-border);
	}

	:global(.dark) .header-title {
		color: var(--color-text-primary);
	}

	:global(.dark) .header-subtitle {
		color: var(--color-text-secondary);
	}

	:global(.dark) .main-body {
		background-color: var(--color-bg-primary);
	}

	/* 响应式调整 */
	@media (max-width: 640px) {
		.main-header {
			padding: var(--space-3) var(--space-4);
		}

		.header-title {
			font-size: 1.125rem;
		}

		.header-subtitle {
			font-size: 0.8125rem;
		}
	}
</style>
