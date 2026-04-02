<script lang="ts">
	/**
	 * MessageList 组件
	 * 
	 * 消息列表组件，用于显示聊天记录
	 * - 使用 MessageBubble 渲染每条消息
	 * - 使用 MarkdownRenderer 渲染消息内容
	 * - 自动滚动到底部
	 * - 支持骨架屏加载状态
	 * - 处理空状态
	 * 
	 * 用法:
	 * <MessageList {messages} {isLoading} />
	 */
	import { onMount, tick } from "svelte";
	import type { Message, MessageRole, MessageStatus } from "$lib/types/message";
	import MarkdownRenderer from "./MarkdownRenderer.svelte";
	import Skeleton from "./Skeleton.svelte";
	import Avatar from "./Avatar.svelte";
	import ThinkingBlock from "./ThinkingBlock.svelte";
	import { cn } from "$lib/utils/cn";

	// Props
	interface Props {
		/** 消息列表 */
		messages: Message[];
		/** 是否处于加载状态 */
		isLoading?: boolean;
	}

	let { messages = [], isLoading = false }: Props = $props();

	// 引用
	let containerRef: HTMLDivElement;
	let bottomRef = $state<HTMLDivElement | null>(null);
	let shouldAutoScroll = $state(true);

	/**
	 * 格式化时间戳
	 */
	function formatTimestamp(timestamp: Date | string): string {
		const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
		return date.toLocaleTimeString("zh-CN", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}

	/**
	 * 获取角色标签
	 */
	function getRoleLabel(role: MessageRole): string {
		switch (role) {
			case "user":
				return "用户";
			case "assistant":
				return "助手";
			case "system":
				return "系统";
			default:
				return "";
		}
	}

	/**
	 * 获取状态图标
	 */
	function getStatusIcon(status: MessageStatus): string {
		switch (status) {
			case "sending":
				return "◌";
			case "sent":
				return "✓";
			case "failed":
				return "✗";
			default:
				return "";
		}
	}

	/**
	 * 检查是否应该自动滚动
	 */
	function checkShouldAutoScroll(): boolean {
		if (!containerRef) return true;
		const threshold = 100; // 距离底部 100px 内才自动滚动
		const distanceFromBottom = 
			containerRef.scrollHeight - containerRef.scrollTop - containerRef.clientHeight;
		return distanceFromBottom < threshold;
	}

	/**
	 * 滚动到底部
	 */
	async function scrollToBottom() {
		await tick();
		if (bottomRef && shouldAutoScroll) {
			bottomRef.scrollIntoView({ behavior: "smooth", block: "end" });
		}
	}

	/**
	 * 处理滚动事件
	 */
	function handleScroll() {
		shouldAutoScroll = checkShouldAutoScroll();
	}

	// 当消息变化时自动滚动到底部
	$effect(() => {
		if (messages.length > 0 || isLoading) {
			scrollToBottom();
		}
	});

	onMount(() => {
		scrollToBottom();
	});
</script>

<div
	bind:this={containerRef}
	class="message-list flex flex-col gap-4 overflow-y-auto p-4"
	onscroll={handleScroll}
	role="log"
	aria-live="polite"
	aria-label="消息列表"
>
	{#if messages.length === 0 && !isLoading}
		<!-- 空状态 -->
		<div class="empty-state flex flex-col items-center justify-center py-12 text-center">
			<div class="text-4xl mb-4 opacity-50">💬</div>
			<p class="empty-text text-muted-foreground text-sm">
				开始一个新的对话
			</p>
		</div>
	{:else}
		<!-- 消息列表 -->
		<div class="messages-container flex flex-col gap-4">
		{#each messages as message, index (message.id)}
			{@const isUser = message.role === "user"}
			{@const isAssistant = message.role === "assistant"}
			{@const isSystem = message.role === "system"}
			{@const showAvatar = index === 0 || messages[index - 1]?.role !== message.role}

			<div
				class={cn(
					"message-item flex gap-3 min-w-0 w-full",
					isUser && "flex-row-reverse"
				)}
			>
				<!-- 头像 -->
				{#if showAvatar}
					<div class="flex-shrink-0">
						<Avatar
							fallback={isUser ? "U" : isAssistant ? "AI" : "S"}
							size="md"
							class={cn(
								isUser && "bg-primary text-primary-foreground",
								isAssistant && "bg-secondary text-secondary-foreground",
								isSystem && "bg-muted text-muted-foreground"
							)}
						/>
					</div>
				{:else}
					<div class="flex-shrink-0 w-10"></div>
				{/if}

				<!-- 消息内容 -->
				<div
					class={cn(
						"message-bubble flex flex-col gap-1 max-w-[85%] min-w-0",
						isUser ? "items-end" : "items-start"
					)}
				>
					<!-- 消息头部 -->
					{#if showAvatar}
						<div class="flex items-center gap-2 text-xs text-muted-foreground px-1">
							<span class="font-medium">{getRoleLabel(message.role)}</span>
							<span>·</span>
							<span>{formatTimestamp(message.timestamp)}</span>
							{#if message.status !== "sent"}
								<span class={cn(
									"ml-1",
									message.status === "failed" && "text-destructive"
								)}>
									{getStatusIcon(message.status)}
								</span>
							{/if}
						</div>
					{/if}

                    <!-- 消息气泡 -->
                    <div
                        class={cn(
                            "message-content message-body rounded-2xl px-4 py-3 min-w-0 w-full",
                            isUser
                                ? "bg-primary text-primary-foreground rounded-br-sm" 
                                : "bg-muted text-foreground rounded-bl-sm"
                        )}
                    >
						{#if isUser || isSystem}
							<!-- 用户和系统消息显示纯文本 -->
							<p class="whitespace-pre-wrap">{message.content}</p>
						{:else}
							<!-- AI 消息：先显示思考过程（如果有），再显示内容 -->
							{#if message.thinking}
								<ThinkingBlock thinking={message.thinking} />
							{/if}
							<MarkdownRenderer 
								content={message.content} 
								streaming={message.status === "sending"}
							/>
						{/if}
					</div>
				</div>
			</div>
		{/each}

		<!-- 加载状态骨架屏 -->
		{#if isLoading}
			<div class="message-item flex gap-3">
				<div class="flex-shrink-0">
					<Skeleton class="h-10 w-10 rounded-full" />
				</div>
				<div class="flex flex-col gap-2 flex-1 max-w-[80%]">
					<Skeleton class="h-4 w-20" />
					<Skeleton class="h-16 w-full rounded-xl" />
				</div>
			</div>
		{/if}

		<!-- 底部锚点 -->
		<div bind:this={bottomRef} class="h-0"></div>
		</div>
	{/if}
</div>

<style>
	.message-list {
		width: 100%;
		height: 100%;
		scroll-behavior: smooth;
		overflow-x: hidden; /* 添加水平溢出隐藏 */
    }

    .messages-container {
        width: 100%;
        max-width: 100%;
    }

    .messages-container {
        max-width: 100%;
    }

	/* 自定义滚动条 */
	.message-list::-webkit-scrollbar {
		width: 6px;
	}

	.message-list::-webkit-scrollbar-track {
		background: transparent;
	}

	.message-list::-webkit-scrollbar-thumb {
		background-color: hsl(var(--muted-foreground) / 0.3);
		border-radius: 3px;
	}

	.message-list::-webkit-scrollbar-thumb:hover {
		background-color: hsl(var(--muted-foreground) / 0.5);
	}

	:global(.dark) .message-list::-webkit-scrollbar-thumb {
		background-color: hsl(var(--muted-foreground) / 0.2);
	}

	:global(.dark) .message-list::-webkit-scrollbar-thumb:hover {
		background-color: hsl(var(--muted-foreground) / 0.4);
	}

	/* 消息内容换行优化 */
	.message-content {
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	/* 暗色模式适配 */
	:global(.dark) .message-list::-webkit-scrollbar-thumb {
		background-color: hsl(var(--muted-foreground) / 0.2);
	}

	:global(.dark) .message-list::-webkit-scrollbar-thumb:hover {
		background-color: hsl(var(--muted-foreground) / 0.4);
	}

	/* 消息动画 */
	.message-item {
		animation: fadeInUp 0.2s ease-out;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* 空状态样式 */
	.empty-state {
		opacity: 0.7;
		transition: opacity 0.3s ease;
	}

	.empty-state:hover {
		opacity: 1;
	}
</style>
