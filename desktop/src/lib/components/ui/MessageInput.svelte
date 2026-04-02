<script lang="ts">
	import { cn } from "$lib/utils/cn";
	import Textarea from "./Textarea.svelte";
	import { Send } from "./icons/index.js";

	interface Props {
		/** 输入框的值（可绑定） */
		value?: string;
		/** 占位符文本 */
		placeholder?: string;
		/** 是否禁用 */
		disabled?: boolean;
		/** 发送回调函数 */
		onSend: (message: string) => void;
		/** 额外的 CSS 类名 */
		class?: string;
	}

	let {
		value = $bindable(""),
		placeholder = "输入消息...",
		disabled = false,
		onSend,
		class: className
	}: Props = $props();

	/** 最大字符数 */
	const maxChars = 4000;

	/** 字符计数 */
	const charCount = $derived(value.length);

	/** 发送按钮是否可用 */
	const canSend = $derived(value.trim().length > 0 && !disabled);

	/**
	 * 处理发送消息
	 */
	function handleSend() {
		const trimmedMessage = value.trim();
		if (trimmedMessage && !disabled) {
			onSend(trimmedMessage);
			value = ""; // 发送后清空输入
		}
	}

	/**
	 * 处理键盘事件
	 * Enter 发送，Shift+Enter 换行
	 */
	function handleKeyDown(event: KeyboardEvent) {
		// Enter 发送，Shift+Enter 换行
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}
	}
</script>

<div
	class={cn(
		"message-input-container relative flex items-end gap-2 rounded-xl p-2.5",
		"border border-[var(--color-border)]",
		"bg-[var(--color-bg-secondary)]",
		"focus-within:border-[var(--color-brand-400)] focus-within:ring-2 focus-within:ring-[var(--color-primary-ring)]",
		"shadow-sm transition-all duration-200",
		disabled && "opacity-50",
		className
	)}
>
	<Textarea
		bind:value
		{placeholder}
		{disabled}
		rows={1}
		maxRows={6}
		onkeydown={handleKeyDown}
		class="message-textarea min-h-[44px] flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)] !px-4 !py-2.5"
	/>
	<div class="flex items-center gap-2">
		<!-- 字符计数 -->
		<span class="char-count text-xs text-[var(--color-fg-tertiary)]">
			{charCount}/{maxChars}
		</span>
		<button
			type="button"
			onclick={handleSend}
			disabled={!canSend}
			class={cn(
				"send-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
				"bg-[var(--color-brand-500)] text-white",
				"hover:bg-[var(--color-brand-600)] hover:shadow-md",
				"active:scale-95",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)]",
				!canSend && "disabled cursor-not-allowed opacity-50 bg-[var(--color-neutral-300)]"
			)}
			aria-label="发送消息"
		>
			<Send class="h-4 w-4" />
		</button>
	</div>
</div>

<!-- 快捷键提示 -->
<div class="input-hint mt-1.5 text-center">
	<span class="hint-text text-xs text-[var(--color-fg-tertiary)]">Enter 发送 · Shift+Enter 换行</span>
</div>

<style>
	/* 确保 textarea 和按钮对齐 */
	:global(.MessageInput textarea) {
		display: flex;
		align-items: center;
	}
</style>
