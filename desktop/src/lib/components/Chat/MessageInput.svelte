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
		padding: var(--space-4);
		background-color: var(--color-bg-primary);
		border-top: 1px solid var(--color-border);
	}

	.input-wrapper {
		display: flex;
		gap: var(--space-3);
		align-items: flex-end;
		background-color: var(--color-bg-tertiary);
		border: 1.5px solid transparent;
		border-radius: var(--radius-xl);
		padding: var(--space-3) var(--space-4);
		transition: all var(--transition-base);
		box-shadow: var(--shadow-sm);
	}

	.input-wrapper:focus-within {
		border-color: var(--color-primary);
		background-color: var(--color-bg-secondary);
		box-shadow: var(--shadow-md), 0 0 0 3px var(--color-primary-ring);
	}

	.message-textarea {
		flex: 1;
		resize: none;
		border: none;
		background: transparent;
		color: var(--color-text-primary);
		font-size: var(--text-base);
		line-height: var(--leading-relaxed);
		min-height: 24px;
		max-height: 200px;
		padding: 0;
		outline: none;
		font-family: var(--font-sans);
	}

	.message-textarea::placeholder {
		color: var(--color-text-tertiary);
		opacity: 0.8;
	}

	.message-textarea.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.input-actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-shrink: 0;
	}

	.char-count {
		font-size: var(--text-xs);
		color: var(--color-text-tertiary);
		white-space: nowrap;
		opacity: 0.7;
		transition: opacity var(--transition-fast);
	}

	.char-count.near-limit {
		color: var(--color-warning);
		opacity: 1;
		font-weight: 500;
	}

	.send-btn {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-xl);
		border: none;
		background-color: var(--color-primary);
		color: var(--color-text-inverse);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-base);
		box-shadow: 0 2px 8px -2px var(--color-primary-shadow);
	}

	.send-btn:hover:not(.disabled) {
		background-color: var(--color-primary-dark);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px -2px var(--color-primary-shadow-hover);
	}

	.send-btn:active:not(.disabled) {
		transform: translateY(0) scale(0.96);
		box-shadow: 0 1px 4px var(--color-primary-shadow);
	}

	.send-btn.disabled {
		background-color: var(--color-neutral-300);
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
		opacity: 0.6;
	}

	.send-icon {
		width: 20px;
		height: 20px;
		transition: transform var(--transition-fast);
	}

	.send-btn:hover:not(.disabled) .send-icon {
		transform: translateX(1px);
	}

	.input-hint {
		display: flex;
		justify-content: center;
		margin-top: var(--space-2);
		opacity: 0.7;
		transition: opacity var(--transition-fast);
	}

	.input-wrapper:focus-within ~ .input-hint {
		opacity: 1;
	}

	.hint-text {
		font-size: var(--text-xs);
		color: var(--color-text-tertiary);
		letter-spacing: var(--tracking-wide);
	}
</style>
