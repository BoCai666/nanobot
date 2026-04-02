<script lang="ts">
	/**
	 * MessageBubble 组件
	 *
	 * 聊天消息气泡组件，区分用户和 AI 消息样式
	 * - 用户消息：右对齐，温暖橙色背景 (#FF6B35)
	 * - AI 消息：左对齐，温暖浅色背景 (#FFF8F5)
	 * - 支持显示时间戳和消息状态
	 * - 支持流式响应光标
	 */
	import type { Message } from "$lib/types/message";
	import MarkdownRenderer from "./MarkdownRenderer.svelte";
	import MessageStatus from "./MessageStatus.svelte";
	import StreamingCursor from "./StreamingCursor.svelte";
	import Avatar from "./Avatar.svelte";
	import ThinkingBlock from "./ThinkingBlock.svelte";
	import { cn } from "$lib/utils/cn";

	interface Props {
		/** 消息对象 */
		message: Message;
		/** 是否处于流式模式（显示光标） */
		streaming?: boolean;
	}

	let { message, streaming = false }: Props = $props();

	/**
	 * 判断是否为当前用户发送的消息
	 */
	const isUser = $derived(message.role === "user");

	/**
	 * 格式化时间戳为人类可读格式
	 * 例如："14:30" 或 "2 min ago"
	 */
	function formatTimestamp(timestamp: Date | string): string {
		const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		// 小于1分钟：显示刚刚
		if (diffMins < 1) {
			return "刚刚";
		}

		// 小于1小时：显示分钟前
		if (diffMins < 60) {
			return `${diffMins} 分钟前`;
		}

		// 小于24小时：显示小时前
		if (diffHours < 24) {
			return `${diffHours} 小时前`;
		}

		// 小于7天：显示天前
		if (diffDays < 7) {
			return `${diffDays} 天前`;
		}

		// 否则显示具体日期时间
		return date.toLocaleString("zh-CN", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	}

	/**
	 * 格式化时间显示为 HH:MM
	 */
	function formatTime(timestamp: Date | string): string {
		const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
		return date.toLocaleTimeString("zh-CN", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}
</script>

<div
	class={cn(
		"message-bubble-wrapper flex w-full",
		isUser ? "justify-end" : "justify-start"
	)}
	data-role={message.role}
>
	<div class={cn("flex max-w-[85%] gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
		<!-- 头像 -->
		<Avatar
			src={isUser ? undefined : "/ai-avatar.png"}
			alt={isUser ? "用户" : "AI"}
			fallback={isUser ? "U" : "AI"}
			size="md"
			class={cn(
				isUser
					? "user-avatar bg-brand text-fg-inverse"
					: "ai-avatar bg-secondary text-fg-secondary"
			)}
		/>

		<!-- 消息内容区域 -->
		<div class={cn("flex flex-col gap-1.5", isUser ? "items-end" : "items-start")}>
			<!-- 气泡 -->
			<div
				class={cn(
					"message-bubble relative px-4 py-3",
					"transition-all duration-200 ease-out",
					isUser ? "user-message" : "ai-message"
				)}
			>
				<!-- 思考过程（仅 AI 消息显示） -->
				{#if !isUser && message.thinking}
					<ThinkingBlock thinking={message.thinking} />
				{/if}

				<!-- 消息内容 -->
				<div class="message-content">
					<MarkdownRenderer content={message.content} {streaming} />
					{#if streaming && message.role === "assistant"}
						<StreamingCursor />
					{/if}
				</div>
			</div>

			<!-- 元信息（时间戳和状态） -->
			<div
				class={cn(
					"flex items-center gap-2 px-1",
					isUser ? "flex-row-reverse" : "flex-row"
				)}
			>
				<!-- 时间戳 -->
				<time
					datetime={message.timestamp instanceof Date
						? message.timestamp.toISOString()
						: message.timestamp}
					class="timestamp"
					title={message.timestamp instanceof Date
						? message.timestamp.toLocaleString("zh-CN")
						: new Date(message.timestamp).toLocaleString("zh-CN")}
				>
					{formatTime(message.timestamp)}
				</time>

				<!-- 消息状态（仅用户消息显示） -->
				{#if isUser}
					<MessageStatus status={message.status} size="sm" />
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	/* ============================================
	   用户消息气泡样式 - 温暖的品牌橙色
	   ============================================ */
	.user-message {
		background-color: var(--user-bubble);
		color: var(--user-bubble-foreground);
		border-radius: var(--radius-lg);
		border-bottom-right-radius: var(--radius-sm);
		box-shadow: var(--shadow-md);
	}

	.user-message:hover {
		box-shadow: var(--shadow-lg);
	}

	/* ============================================
	   AI 消息气泡样式 - 温暖的浅色背景
	   ============================================ */
	.ai-message {
		background-color: var(--ai-bubble);
		color: var(--ai-bubble-foreground);
		border-radius: var(--radius-lg);
		border-bottom-left-radius: var(--radius-sm);
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--color-border);
	}

	.ai-message:hover {
		background-color: var(--color-card-hover);
		box-shadow: var(--shadow-md);
	}

	/* ============================================
	   用户消息中的 Markdown 样式覆盖
	   ============================================ */
	.user-message .message-content :global(.markdown-content) {
		color: var(--user-bubble-foreground);
	}

	.user-message .message-content :global(a) {
		color: var(--user-bubble-overlay-90);
		border-bottom-color: var(--user-bubble-overlay-40);
		transition: all var(--transition-fast);
	}

	.user-message .message-content :global(a:hover) {
		color: var(--user-bubble-foreground);
		border-bottom-color: var(--user-bubble-foreground);
	}

	.user-message .message-content :global(code:not(pre code)) {
		background-color: var(--user-bubble-code-bg);
		color: var(--user-bubble-foreground);
		border-radius: var(--radius-sm);
		padding: 0.125rem 0.375rem;
	}

	.user-message .message-content :global(pre) {
		background-color: var(--user-bubble-code-bg);
		border-radius: var(--radius-md);
	}

	.user-message .message-content :global(blockquote) {
		border-left-color: var(--user-bubble-overlay-40);
		background-color: var(--user-bubble-overlay-15);
		border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
	}

	.user-message .message-content :global(strong),
	.user-message .message-content :global(b) {
		color: var(--user-bubble-foreground);
		font-weight: 600;
	}

	/* ============================================
	   AI 消息中的 Markdown 样式优化
	   ============================================ */
	.ai-message .message-content :global(code:not(pre code)) {
		background-color: var(--color-bg-tertiary);
		border-radius: var(--radius-sm);
		padding: 0.125rem 0.375rem;
	}

	.ai-message .message-content :global(pre) {
		background-color: var(--code-bg);
		border-radius: var(--radius-md);
	}

	.ai-message .message-content :global(blockquote) {
		border-left-color: var(--color-brand-300);
		background-color: var(--color-brand-50);
		border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
	}

	/* ============================================
	   头像样式
	   ============================================ */
	.user-avatar {
		background-color: var(--color-brand-500);
		color: var(--color-fg-inverse);
		box-shadow: var(--shadow-sm);
	}

	.ai-avatar {
		background-color: var(--color-bg-secondary);
		color: var(--color-fg-secondary);
		border: 1px solid var(--color-border);
	}

	/* ============================================
	   时间戳样式
	   ============================================ */
	.timestamp {
		font-size: 0.75rem;
		color: var(--color-fg-tertiary);
		opacity: 0.7;
		transition: opacity var(--transition-fast);
	}

	.message-bubble-wrapper:hover .timestamp {
		opacity: 1;
	}

	/* ============================================
	   响应式适配
	   ============================================ */
	@media (max-width: 640px) {
		.message-bubble-wrapper > div {
			max-width: 90%;
		}

		.message-bubble {
			padding-left: 0.875rem;
			padding-right: 0.875rem;
		}
	}

	/* ============================================
	   暗色模式适配
	   ============================================ */
	:global(.dark) .ai-message {
		border-color: var(--color-border);
	}

	:global(.dark) .ai-message:hover {
		background-color: var(--color-card-hover);
	}

	:global(.dark) .ai-avatar {
		background-color: var(--color-bg-secondary);
		border-color: var(--color-border);
	}
</style>
