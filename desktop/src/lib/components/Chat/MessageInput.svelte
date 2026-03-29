<script lang="ts">
	// Props
	interface Props {
		disabled?: boolean;
		placeholder?: string;
		onSend?: (message: string) => void;
	}

	let {
		disabled = false,
		placeholder = '输入消息...',
		onSend
	}: Props = $props();

	// 输入文本
	let inputText = $state('');

	// 字符计数
	let charCount = $derived(inputText.length);
	let maxChars = 4000;

	// 发送按钮是否可用
	let canSend = $derived(inputText.trim().length > 0 && !disabled);

	// 处理发送
	function handleSend() {
		const trimmed = inputText.trim();
		if (!trimmed || disabled) return;

		onSend?.(trimmed);
		inputText = '';
	}

	// 处理键盘事件
	function handleKeyDown(event: KeyboardEvent) {
		// Ctrl+Enter 发送
		if (event.key === 'Enter' && event.ctrlKey) {
			event.preventDefault();
			handleSend();
		}
		// 单独 Enter 是换行 (默认行为)
	}

	// 处理输入
	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		inputText = target.value;
	}

	// 自动调整高度
	let textareaElement: HTMLTextAreaElement;

	$effect(() => {
		if (textareaElement) {
			// 重置高度以获取正确的 scrollHeight
			textareaElement.style.height = 'auto';
			// 设置新高度 (有最大高度限制)
			const newHeight = Math.min(textareaElement.scrollHeight, 200);
			textareaElement.style.height = `${newHeight}px`;
		}
	});
</script>

<div class="message-input-container">
	<div class="input-wrapper">
		<textarea
			bind:this={textareaElement}
			class="message-textarea"
			class:disabled
			{placeholder}
			value={inputText}
			oninput={handleInput}
			onkeydown={handleKeyDown}
			rows="1"
			maxlength={maxChars}
			disabled={disabled}
		></textarea>
		<div class="input-actions">
			<span class="char-count" class:near-limit={charCount > maxChars * 0.9}>
				{charCount}/{maxChars}
			</span>
			<button
				class="send-btn"
				class:disabled={!canSend}
				onclick={handleSend}
				disabled={!canSend}
				title="Ctrl+Enter 发送"
			>
				<svg class="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m22 2-7 20-4-9-9-4 20-7z"/>
				</svg>
			</button>
		</div>
	</div>
	<div class="input-hint">
		<span class="hint-text">Ctrl + Enter 发送</span>
	</div>
</div>

<style>
	.message-input-container {
		padding: var(--space-3) var(--space-4);
		background-color: var(--color-bg-primary);
		border-top: 1px solid var(--color-border);
	}

	.input-wrapper {
		display: flex;
		gap: var(--space-3);
		align-items: flex-end;
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-3);
		transition: border-color var(--transition-fast);
	}

	.input-wrapper:focus-within {
		border-color: var(--color-primary);
	}

	.message-textarea {
		flex: 1;
		resize: none;
		border: none;
		background: transparent;
		color: var(--color-text-primary);
		font-size: 0.9375rem;
		line-height: 1.5;
		min-height: 24px;
		max-height: 200px;
		padding: 0;
		outline: none;
		font-family: inherit;
	}

	.message-textarea::placeholder {
		color: var(--color-text-tertiary);
	}

	.message-textarea.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.input-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	.char-count {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
		white-space: nowrap;
	}

	.char-count.near-limit {
		color: var(--color-warning);
	}

	.send-btn {
		width: 36px;
		height: 36px;
		border-radius: var(--radius-md);
		border: none;
		background-color: var(--color-primary);
		color: var(--color-text-inverse);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-fast);
	}

	.send-btn:hover:not(.disabled) {
		background-color: var(--color-primary-dark);
		transform: scale(1.05);
	}

	.send-btn:active:not(.disabled) {
		transform: scale(0.95);
	}

	.send-btn.disabled {
		background-color: var(--color-neutral-300);
		cursor: not-allowed;
		transform: none;
	}

	.send-icon {
		width: 18px;
		height: 18px;
	}

	.input-hint {
		display: flex;
		justify-content: center;
		margin-top: var(--space-2);
	}

	.hint-text {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
	}
</style>
