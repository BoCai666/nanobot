<script lang="ts">
	/**
	 * MessageBubble 组件
	 * 
	 * 聊天消息气泡组件，区分用户和 AI 消息样式
	 * - 用户消息：右对齐，蓝色背景
	 * - AI 消息：左对齐，灰色背景
	 * - 支持显示时间戳和消息状态
	 * - 支持流式响应光标
	 */
	import type { Message } from "$lib/types/message";
	import MarkdownRenderer from "./MarkdownRenderer.svelte";
	import MessageStatus from "./MessageStatus.svelte";
	import StreamingCursor from "./StreamingCursor.svelte";
	import Avatar from "./Avatar.svelte";
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
			class={cn(isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700")}
		/>

		<!-- 消息内容区域 -->
		<div class={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
			<!-- 气泡 -->
			<div
				class={cn(
					"message-bubble relative rounded-2xl px-4 py-2.5",
					"shadow-sm transition-all duration-200",
					isUser
						? "user-message rounded-tr-sm"
						: "ai-message rounded-tl-sm"
				)}
			>
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
					"flex items-center gap-2 text-xs",
					isUser ? "flex-row-reverse" : "flex-row"
				)}
			>
				<!-- 时间戳 -->
				<time
					datetime={message.timestamp instanceof Date 
						? message.timestamp.toISOString() 
						: message.timestamp}
					class="timestamp text-muted-foreground"
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
	/* 用户消息气泡样式 */
	.user-message {
		background-color: #3b82f6;
		color: #ffffff;
	}

	/* AI 消息气泡样式 - 浅色模式 */
	.ai-message {
		background-color: var(--ai-bubble, #f1f5f9);
		color: var(--ai-bubble-foreground, #1e293b);
	}

	/* 用户消息中的 Markdown 样式覆盖 */
	.user-message .message-content :global(.markdown-content) {
		color: #ffffff;
	}

	.user-message .message-content :global(a) {
		color: rgba(255, 255, 255, 0.9);
		border-bottom-color: rgba(255, 255, 255, 0.5);
	}

	.user-message .message-content :global(a:hover) {
		color: #ffffff;
		border-bottom-color: #ffffff;
	}

	.user-message .message-content :global(code:not(pre code)) {
		background-color: rgba(255, 255, 255, 0.2);
		color: #ffffff;
	}

	.user-message .message-content :global(blockquote) {
		border-left-color: rgba(255, 255, 255, 0.5);
		background-color: rgba(255, 255, 255, 0.1);
	}

	.user-message .message-content :global(strong),
	.user-message .message-content :global(b) {
		color: #ffffff;
	}

	/* 暗色模式适配 */
	:global(.dark) .ai-message {
		background-color: var(--ai-bubble, #1e293b);
		color: var(--ai-bubble-foreground, #e2e8f0);
	}

	/* 时间戳悬停效果 */
	.timestamp {
		opacity: 0.7;
		transition: opacity 0.15s ease;
	}

	.message-bubble-wrapper:hover .timestamp {
		opacity: 1;
	}

	/* 响应式适配 */
	@media (max-width: 640px) {
		.message-bubble-wrapper > div {
			max-width: 90%;
		}
	}
</style>
