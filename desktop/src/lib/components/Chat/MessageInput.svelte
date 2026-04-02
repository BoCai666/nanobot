<script lang="ts">
	/**
	 * MessageInput 组件
	 * 温暖亲切的消息输入框，支持自动高度调整和多行输入
	 */

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
	<div class="input-wrapper" class:disabled>
		<textarea
			bind:this={textareaElement}
			class="message-textarea"
			{placeholder}
			value={inputText}
			oninput={handleInput}
			onkeydown={handleKeyDown}
			rows="1"
			maxlength={maxChars}
			{disabled}
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
				aria-label="发送消息"
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
		padding: 1rem;
		background-color: var(--color-bg-primary, #FFFCFA);
		border-top: 1px solid var(--color-border, #F0E6E0);
	}

	.input-wrapper {
		display: flex;
		gap: 0.75rem;
		align-items: flex-end;
		background-color: var(--color-bg-elevated, #FFFFFF);
		border: 1px solid var(--color-border, #F0E6E0);
		border-radius: var(--radius-xl, 1rem);
		padding: 0.75rem 1rem;
		transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
		box-shadow: var(--shadow-sm, 0 1px 3px -1px rgba(55, 53, 47, 0.04));
	}

	/* Focus 状态 - 温暖的橙色光晕 */
	.input-wrapper:focus-within {
		border-color: var(--color-border-focus, #FFB38A);
		background-color: var(--color-bg-elevated, #FFFFFF);
		box-shadow: 
			0 0 0 3px var(--color-primary-ring, rgba(255, 107, 53, 0.15)),
			0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.input-wrapper.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background-color: var(--color-bg-secondary, #FFF8F5);
	}

	.message-textarea {
		flex: 1;
		resize: none;
		border: none;
		background: transparent;
		color: var(--color-fg-primary, #1F1A17);
		font-size: 0.875rem;
		line-height: 1.5;
		min-height: 1.5rem;
		max-height: 12.5rem;
		padding: 0;
		outline: none;
		font-family: inherit;
	}

	.message-textarea::placeholder {
		color: var(--color-fg-muted, #A9A5A2);
		opacity: 1;
	}

	.message-textarea:disabled {
		cursor: not-allowed;
	}

	.input-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	.char-count {
		font-size: 0.75rem;
		color: var(--color-fg-tertiary, #8A8380);
		white-space: nowrap;
		opacity: 0.7;
		transition: opacity 0.15s ease, color 0.15s ease;
	}

	.char-count.near-limit {
		color: var(--color-warning, #F59E0B);
		opacity: 1;
		font-weight: 500;
	}

	/* 发送按钮 - 品牌色 */
	.send-btn {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: var(--radius-lg, 0.875rem);
		border: none;
		background-color: var(--color-primary, #FF6B35);
		color: var(--color-fg-inverse, #FFFCFA);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		box-shadow: 0 2px 8px -2px var(--color-primary-shadow, rgba(255, 107, 53, 0.20));
	}

	.send-btn:hover:not(.disabled) {
		background-color: var(--color-primary-hover, #E55A2B);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px -2px var(--color-primary-shadow-hover, rgba(255, 107, 53, 0.30));
	}

	.send-btn:active:not(.disabled) {
		transform: translateY(0) scale(0.96);
		box-shadow: 0 1px 4px var(--color-primary-shadow, rgba(255, 107, 53, 0.20));
	}

	.send-btn.disabled {
		background-color: var(--color-neutral-300, #D4CFC9);
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
		opacity: 0.6;
	}

	.send-icon {
		width: 1.25rem;
		height: 1.25rem;
		transition: transform 0.15s ease;
	}

	.send-btn:hover:not(.disabled) .send-icon {
		transform: translateX(1px);
	}

	.input-hint {
		display: flex;
		justify-content: center;
		margin-top: 0.5rem;
		opacity: 0.7;
		transition: opacity 0.15s ease;
	}

	.input-wrapper:focus-within ~ .input-hint {
		opacity: 1;
	}

	.hint-text {
		font-size: 0.75rem;
		color: var(--color-fg-tertiary, #8A8380);
		letter-spacing: 0.025em;
	}
</style>
