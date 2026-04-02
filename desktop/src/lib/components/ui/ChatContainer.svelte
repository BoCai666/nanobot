<script lang="ts">
	/**
	 * ChatContainer 组件
	 *
	 * 聊天容器组件，组合 MessageList 和 MessageInput
	 * - 管理本地消息状态
	 * - 处理发送/接收逻辑
	 * - 支持流式响应
	 *
	 * 用法:
	 * <ChatContainer {messages} {isLoading} {onSend} {onRetry} />
	 */
	import type { Message, MessageStatus } from "$lib/types/message";
	import MessageList from "./MessageList.svelte";
	import MessageInput from "./MessageInput.svelte";

	// Props
	interface Props {
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
	}

	let {
		messages = [],
		isLoading = false,
		onSend,
		onRetry,
		onAbort
	}: Props = $props();

	// 本地消息状态 - 初始化时复制传入的消息
	let localMessages = $state<Message[]>(messages ? [...messages] : []);

	/** 当前 placeholder 文本 */
	const placeholderText = $derived(isLoading ? "AI 正在思考..." : "输入消息...");

	/**
	 * 生成消息 ID
	 */
	function generateMessageId(): string {
		return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	}

	/**
	 * 添加用户消息
	 */
	function addUserMessage(content: string): Message {
		const message: Message = {
			id: generateMessageId(),
			role: "user",
			content,
			timestamp: new Date(),
			status: "sending"
		};
		localMessages = [...localMessages, message];
		return message;
	}

	/**
	 * 更新消息状态
	 */
	function updateMessageStatus(messageId: string, status: MessageStatus) {
		localMessages = localMessages.map((msg) =>
			msg.id === messageId ? { ...msg, status } : msg
		);
	}

	/**
	 * 更新消息内容
	 */
	function updateMessageContent(messageId: string, content: string) {
		localMessages = localMessages.map((msg) =>
			msg.id === messageId ? { ...msg, content } : msg
		);
	}

	/**
	 * 添加 AI 消息（用于流式响应）
	 */
	function addAssistantMessage(): Message {
		const message: Message = {
			id: generateMessageId(),
			role: "assistant",
			content: "",
			timestamp: new Date(),
			status: "sending"
		};
		localMessages = [...localMessages, message];
		return message;
	}

	/**
	 * 处理发送消息
	 */
	async function handleSend(content: string) {
		// 1. 添加用户消息
		const userMessage = addUserMessage(content);

		try {
			// 2. 调用 onSend 回调
			await onSend(content);

			// 3. 标记用户消息为已发送
			updateMessageStatus(userMessage.id, "sent");
		} catch (error) {
			// 4. 标记用户消息为失败
			updateMessageStatus(userMessage.id, "failed");
			console.error("发送消息失败:", error);
		}
	}

	/**
	 * 处理中断
	 */
	function handleAbort() {
		onAbort?.();
	}

	/**
	 * 开始流式响应
	 * 返回 assistant 消息的 ID，用于后续更新
	 */
	export function startStreamingResponse(): string {
		const message = addAssistantMessage();
		return message.id;
	}

	/**
	 * 更新流式响应内容
	 */
	export function appendStreamingContent(messageId: string, chunk: string) {
		const message = localMessages.find((msg) => msg.id === messageId);
		if (message) {
			updateMessageContent(messageId, message.content + chunk);
		}
	}

	/**
	 * 结束流式响应
	 */
	export function finishStreamingResponse(messageId: string) {
		updateMessageStatus(messageId, 'sent');
	}

	/**
	 * 追加思考过程内容
	 */
	export function appendStreamingThinking(messageId: string, thinking: string) {
		const message = localMessages.find((msg) => msg.id === messageId);
		if (message) {
			localMessages = localMessages.map((msg) =>
				msg.id === messageId
					? { ...msg, thinking: (msg.thinking || '') + thinking }
					: msg
			);
		}
	}

	/**
	 * 清空流式响应内容（用于替换初始提示）
	 */
	export function clearStreamingContent(messageId: string) {
		updateMessageContent(messageId, '');
	}

	/**
	 * 设置消息列表（用于外部更新）
	 */
	export function setMessages(newMessages: Message[]) {
		localMessages = newMessages;
	}

	/**
	 * 获取当前消息列表
	 */
	export function getMessages(): Message[] {
		return localMessages;
	}

	/**
	 * 清空消息
	 */
	export function clearMessages() {
		localMessages = [];
	}
</script>

<div class="chat-container flex h-full flex-col">
	<!-- 消息列表区域 -->
	<div class="flex-1 overflow-hidden">
		<MessageList messages={localMessages} {isLoading} />
	</div>

	<!-- 输入区域 -->
	<div class="border-t bg-background p-4">
		<!-- 中断按钮 -->
		{#if isLoading && onAbort}
			<div class="mb-2 flex justify-center">
				<button
					type="button"
					class="abort-btn inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
					onclick={handleAbort}
				>
					<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="6" y="6" width="12" height="12" rx="2"/>
					</svg>
					中断生成
				</button>
			</div>
		{/if}
		<MessageInput
			onSend={handleSend}
			disabled={isLoading}
			placeholder={placeholderText}
		/>
	</div>
</div>

<style>
	.chat-container {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
</style>
