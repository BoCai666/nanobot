<script lang="ts">
	import { cn } from "$lib/utils/cn";

	/**
	 * Spinner 组件 - 温暖的加载指示器
	 * 支持旋转和脉冲两种变体
	 */
	interface Props {
		/** 尺寸大小 */
		size?: "sm" | "md" | "lg";
		/** 动画变体：spin（旋转）或 pulse-soft（柔和脉冲） */
		variant?: "spin" | "pulse-soft";
		class?: string;
	}

	let { size = "md", variant = "spin", class: className }: Props = $props();

	// 尺寸映射（使用 CSS 变量）
	const sizeMap = {
		sm: { size: "16px", stroke: "3px" },
		md: { size: "24px", stroke: "3px" },
		lg: { size: "32px", stroke: "4px" }
	};
</script>

{#if variant === "spin"}
	<!-- 旋转 Spinner -->
	<svg
		class={cn("spinner-spin", className)}
		style="width: {sizeMap[size].size}; height: {sizeMap[size].size};"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		role="status"
		aria-label="加载中"
	>
		<circle
			class="spinner-track"
			cx="12"
			cy="12"
			r="10"
			stroke="currentColor"
			stroke-width={sizeMap[size].stroke}
		></circle>
		<path
			class="spinner-indicator"
			fill="currentColor"
			d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
		></path>
	</svg>
{:else}
	<!-- 脉冲 Spinner -->
	<svg
		class={cn("spinner-pulse", className)}
		style="width: {sizeMap[size].size}; height: {sizeMap[size].size};"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		role="status"
		aria-label="加载中"
	>
		<circle
			cx="12"
			cy="12"
			r="10"
			stroke="currentColor"
			stroke-width={sizeMap[size].stroke}
			opacity="0.25"
		></circle>
		<circle
			class="spinner-pulse-dot"
			cx="12"
			cy="12"
			r="10"
			fill="currentColor"
		></circle>
	</svg>
{/if}

<style>
	/* 旋转动画 */
	.spinner-spin {
		color: var(--color-primary);
		animation: spin 1s linear infinite;
	}

	.spinner-track {
		opacity: 0.25;
	}

	.spinner-indicator {
		opacity: 1;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* 脉冲动画 */
	.spinner-pulse {
		color: var(--color-primary);
	}

	.spinner-pulse-dot {
		animation: pulse-soft 2s ease-in-out infinite;
	}

	@keyframes pulse-soft {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(0.85);
		}
	}

	/* 支持 prefers-reduced-motion */
	@media (prefers-reduced-motion: reduce) {
		.spinner-spin {
			animation: none;
		}

		.spinner-pulse-dot {
			animation: none;
			opacity: 0.6;
		}
	}
</style>
