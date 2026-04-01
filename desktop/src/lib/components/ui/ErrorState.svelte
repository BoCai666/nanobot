<script lang="ts">
	/**
	 * ErrorState - 错误状态组件
	 * 友好的错误提示 + 重试按钮
	 */

	interface Props {
		title?: string;
		message?: string;
		icon?: string;
		showRetry?: boolean;
		retryText?: string;
		onRetry?: () => void | Promise<void>;
	}

	let {
		title = '出错了',
		message = '抱歉，发生了一些问题',
		icon = '❌',
		showRetry = true,
		retryText = '重试',
		onRetry
	}: Props = $props();

	// 重试状态
	let isRetrying = $state(false);

	// 处理重试
	async function handleRetry() {
		if (!onRetry || isRetrying) return;

		isRetrying = true;
		try {
			await onRetry();
		} catch (error) {
			console.error('Retry failed:', error);
		} finally {
			isRetrying = false;
		}
	}
</script>

<div class="error-state">
	<div class="error-icon">{icon}</div>
	<h3 class="error-title">{title}</h3>
	<p class="error-message">{message}</p>
	{#if showRetry && onRetry}
		<button
			class="retry-btn"
			onclick={handleRetry}
			disabled={isRetrying}
		>
			{#if isRetrying}
				<div class="retry-spinner"></div>
				<span>重试中...</span>
			{:else}
				<svg class="retry-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
					<path d="M3 3v5h5"/>
				</svg>
				<span>{retryText}</span>
			{/if}
		</button>
	{/if}
</div>

<style>
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-8);
		text-align: center;
		max-width: 400px;
		margin: 0 auto;
		animation: fadeIn var(--transition-slow);
	}

	.error-icon {
		font-size: 3rem;
		margin-bottom: var(--space-4);
		opacity: 0.8;
		filter: drop-shadow(0 2px 8px var(--color-error-shadow));
	}

	.error-title {
		font-size: var(--text-h4);
		font-weight: 600;
		color: var(--color-error);
		margin: 0 0 var(--space-2);
		line-height: var(--leading-snug);
	}

	.error-message {
		font-size: var(--text-base);
		color: var(--color-text-secondary);
		margin: 0 0 var(--space-6);
		line-height: var(--leading-relaxed);
	}

	.retry-btn {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-5);
		border-radius: var(--radius-xl);
		border: 2px solid transparent;
		background-color: var(--color-primary);
		color: var(--color-text-inverse);
		font-size: var(--text-base);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-fast);
		min-height: 44px;
	}

	.retry-btn:hover:not(:disabled) {
		background-color: var(--color-primary-dark);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px var(--color-primary-shadow);
	}

	.retry-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.retry-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.retry-icon {
		width: 18px;
		height: 18px;
	}

	.retry-spinner {
		width: 18px;
		height: 18px;
		border: 2px solid var(--user-bubble-overlay-40);
		border-top-color: var(--color-text-inverse);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* 响应 prefers-reduced-motion */
	@media (prefers-reduced-motion: reduce) {
		.error-state,
		.retry-spinner {
			animation: none;
		}

		.retry-btn {
			transition: none;
		}
	}

	/* 深色模式优化 */
	:global(.dark) .retry-btn:hover:not(:disabled) {
		box-shadow: 0 4px 12px var(--color-primary-shadow-hover);
	}
</style>
