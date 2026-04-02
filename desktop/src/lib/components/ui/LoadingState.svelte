<script lang="ts">
	/**
	 * LoadingState - 加载状态组件
	 * 支持四种模式：spinner（默认）、skeleton（骨架屏）、dots（脉动点）、pulse-glow（脉冲发光）
	 */

	interface Props {
		mode?: 'spinner' | 'skeleton' | 'dots' | 'pulse-glow';
		message?: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { mode = 'spinner', message = '加载中...', size = 'md' }: Props = $props();

	// 尺寸映射
	const sizeMap = {
		sm: { spinner: '24px', skeleton: '40px', dots: '8px', glow: '20px' },
		md: { spinner: '32px', skeleton: '60px', dots: '12px', glow: '28px' },
		lg: { spinner: '48px', skeleton: '80px', dots: '16px', glow: '36px' }
	};
</script>

<div class="loading-state" class:loading-sm={size === 'sm'} class:loading-md={size === 'md'} class:loading-lg={size === 'lg'}>
	{#if mode === 'spinner'}
		<!-- 主色调 Spinner -->
		<div class="spinner" style="width: {sizeMap[size].spinner}; height: {sizeMap[size].spinner};">
			<div class="spinner-ring"></div>
		</div>
		{#if message}
			<p class="loading-message">{message}</p>
		{/if}

	{:else if mode === 'skeleton'}
		<!-- 骨架屏 - 模拟消息气泡 -->
		<div class="skeleton-container">
			<div class="skeleton-avatar" style="width: {sizeMap[size].skeleton}; height: {sizeMap[size].skeleton};"></div>
			<div class="skeleton-content">
				<div class="skeleton-line skeleton-title"></div>
				<div class="skeleton-line skeleton-text"></div>
				<div class="skeleton-line skeleton-text-short"></div>
			</div>
		</div>
		{#if message}
			<p class="loading-message skeleton-message">{message}</p>
		{/if}

	{:else if mode === 'dots'}
		<!-- 脉动点 -->
		<div class="dots-container">
			<div class="dot" style="width: {sizeMap[size].dots}; height: {sizeMap[size].dots};"></div>
			<div class="dot" style="width: {sizeMap[size].dots}; height: {sizeMap[size].dots}; animation-delay: 0.15s;"></div>
			<div class="dot" style="width: {sizeMap[size].dots}; height: {sizeMap[size].dots}; animation-delay: 0.3s;"></div>
		</div>
		{#if message}
			<p class="loading-message">{message}</p>
		{/if}

	{:else if mode === 'pulse-glow'}
		<!-- 脉冲发光效果 -->
		<div class="pulse-glow-container">
			<div class="pulse-glow-dot" style="width: {sizeMap[size].glow}; height: {sizeMap[size].glow};"></div>
		</div>
		{#if message}
			<p class="loading-message">{message}</p>
		{/if}
	{/if}
</div>

<style>
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-8);
		gap: var(--space-4);
	}

	.loading-message {
		font-size: var(--text-sm);
		color: var(--color-fg-tertiary);
		margin: 0;
		line-height: var(--leading-normal);
		animation: pulse-text 2s ease-in-out infinite;
	}

	/* Spinner 样式 */
	.spinner {
		position: relative;
	}

	.spinner-ring {
		width: 100%;
		height: 100%;
		border: 3px solid var(--color-bg-tertiary);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* 骨架屏样式 */
	.skeleton-container {
		display: flex;
		gap: var(--space-3);
		width: 100%;
		max-width: 400px;
	}

	.skeleton-avatar {
		flex-shrink: 0;
		border-radius: var(--radius-lg);
		background: linear-gradient(
			90deg,
			var(--color-bg-tertiary) 0%,
			var(--color-bg-secondary) 50%,
			var(--color-bg-tertiary) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
	}

	.skeleton-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.skeleton-line {
		height: 12px;
		border-radius: var(--radius-sm);
		background: linear-gradient(
			90deg,
			var(--color-bg-tertiary) 0%,
			var(--color-bg-secondary) 50%,
			var(--color-bg-tertiary) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
	}

	.skeleton-title {
		width: 40%;
		height: 16px;
	}

	.skeleton-text {
		width: 100%;
	}

	.skeleton-text-short {
		width: 60%;
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	.skeleton-message {
		margin-top: var(--space-2);
	}

	/* 脉动点样式 */
	.dots-container {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	.dot {
		border-radius: 50%;
		background-color: var(--color-primary);
		animation: pulse-dot 1.4s ease-in-out infinite;
	}

	@keyframes pulse-dot {
		0%, 80%, 100% {
			opacity: 0.3;
			transform: scale(0.8);
		}
		40% {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* 脉冲发光样式 */
	.pulse-glow-container {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pulse-glow-dot {
		border-radius: 50%;
		background-color: var(--color-primary);
		animation: pulse-glow 2s ease-in-out infinite;
	}

	@keyframes pulse-glow {
		0%, 100% {
			opacity: 1;
			box-shadow: 0 0 0 0 var(--color-primary-shadow);
		}
		50% {
			opacity: 0.7;
			box-shadow: 0 0 12px 4px var(--color-primary-shadow);
		}
	}

	@keyframes pulse-text {
		0%, 100% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
	}

	/* 响应 prefers-reduced-motion */
	@media (prefers-reduced-motion: reduce) {
		.spinner-ring,
		.skeleton-line,
		.skeleton-avatar,
		.dot,
		.pulse-glow-dot,
		.loading-message {
			animation: none;
		}

		.spinner-ring {
			border-top-color: var(--color-primary);
		}

		.skeleton-line,
		.skeleton-avatar {
			background: var(--color-bg-tertiary);
		}

		.dot {
			opacity: 0.6;
		}

		.pulse-glow-dot {
			opacity: 0.8;
			box-shadow: 0 0 8px 2px var(--color-primary-shadow);
		}

		.loading-message {
			opacity: 0.8;
		}
	}
</style>
