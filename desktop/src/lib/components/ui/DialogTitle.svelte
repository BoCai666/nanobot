<script lang="ts">
	import { cn } from "$lib/utils/cn";

	interface Props {
		class?: string;
		children?: import("svelte").Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<h2 class={cn("title", className)}>
	{#if children}
		{@render children()}
	{/if}
</h2>

<style>
	.title {
		margin: 0;
		
		/* 使用设计 tokens - 温暖亲切的标题样式 */
		font-size: 1.125rem; /* text-lg */
		font-weight: 600;
		line-height: 1.5;
		letter-spacing: -0.025em; /* tracking-tight */
		color: var(--color-fg-primary);
	}
</style>
