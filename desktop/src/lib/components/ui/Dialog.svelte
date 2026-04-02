<script lang="ts">
	import { cn } from "$lib/utils/cn";

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		children?: import("svelte").Snippet;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		children
	}: Props = $props();

	function closeDialog() {
		open = false;
		onOpenChange?.(false);
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeDialog();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			closeDialog();
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="dialog-backdrop"
		onclick={handleBackdropClick}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="dialog-content"
			onkeydown={handleKeyDown}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			{#if children}
				{@render children()}
			{/if}
			<button
				class="dialog-close"
				onclick={closeDialog}
				aria-label="Close"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="dialog-close-icon"
				>
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
			</button>
		</div>
	</div>
{/if}

<style>
	/* ============================================
	   Dialog Backdrop - 背景遮罩层
	   - 半透明黑色背景
	   - 模糊效果增加层次感
	   - 淡入动画
	   ============================================ */
	.dialog-backdrop {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		
		/* 背景样式 - 使用设计 tokens */
		background-color: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		
		/* 入场动画 */
		animation: fadeIn var(--duration-fast) var(--ease-out);
	}

	/* ============================================
	   Dialog Content - 对话框主体
	   - 温暖圆角和柔和阴影
	   - 缩放入场动画
	   - 响应式宽度
	   ============================================ */
	.dialog-content {
		position: relative;
		display: grid;
		width: 100%;
		max-width: 32rem; /* 512px - max-w-lg */
		gap: 1rem;
		padding: 1.5rem;
		
		/* 温暖设计 tokens */
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
		
		/* 入场动画 - scale + fade */
		animation: scaleIn var(--duration-normal) var(--ease-out);
	}

	/* ============================================
	   Dialog Close Button - 关闭按钮
	   - 右上角定位
	   - 悬停效果
	   - 焦点环
	   ============================================ */
	.dialog-close {
		position: absolute;
		right: 1rem;
		top: 1rem;
		
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		
		border-radius: var(--radius-sm);
		border: none;
		background: transparent;
		
		/* 使用设计 tokens */
		color: var(--color-fg-muted);
		opacity: 0.7;
		
		/* 过渡效果 */
		transition: opacity var(--transition-fast),
		            background-color var(--transition-fast),
		            color var(--transition-fast);
		cursor: pointer;
	}

	.dialog-close:hover {
		opacity: 1;
		background-color: var(--color-bg-tertiary);
		color: var(--color-fg-primary);
	}

	.dialog-close:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	.dialog-close:active {
		transform: scale(0.95);
	}

	.dialog-close-icon {
		width: 1rem;
		height: 1rem;
	}

	/* ============================================
	   动画关键帧 - 淡入
	   ============================================ */
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* ============================================
	   响应式设计
	   ============================================ */
	@media (min-width: 640px) {
		.dialog-content {
			padding: 1.5rem;
		}
	}

	/* ============================================
	   Reduced Motion 支持
	   ============================================ */
	@media (prefers-reduced-motion: reduce) {
		.dialog-backdrop,
		.dialog-content {
			animation: none;
		}
		
		.dialog-close {
			transition: none;
		}
	}
</style>
