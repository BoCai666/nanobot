<script lang="ts">
	import { cn } from "$lib/utils/cn";

	interface Props {
		class?: string;
		children?: import("svelte").Snippet;
		/** 是否启用悬停效果 */
		hoverable?: boolean;
		/** 是否为可点击状态 */
		clickable?: boolean;
	}

	let { class: className, children, hoverable = false, clickable = false }: Props = $props();
</script>

<div
	class={cn(
		// 基础样式 - 使用设计系统 tokens
		"rounded-[var(--radius-lg)] border border-[var(--color-border)]",
		"bg-[var(--color-card)] text-[var(--color-card-foreground)]",
		"shadow-[var(--shadow-card)]",
		// 悬停效果
		hoverable && [
			"transition-all duration-[var(--transition-base)]",
			"hover:shadow-[var(--shadow-card-hover)]",
			"hover:border-[var(--color-border-hover)]",
			"hover:bg-[var(--color-card-hover)]",
		],
		// 可点击效果
		clickable && [
			"cursor-pointer",
			"active:scale-[0.99]",
			"active:bg-[var(--color-card-active)]",
		],
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
</div>
