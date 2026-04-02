<script lang="ts">
	import { cn } from "$lib/utils/cn";

	interface Props {
		class?: string;
		children?: import("svelte").Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<div class={cn("header", className)}>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.header {
		display: flex;
		flex-direction: column;
		gap: 0.125rem; /* 2px */
		
		/* 使用设计 tokens */
		font-size: 1.125rem; /* text-lg */
		font-weight: 600;
		line-height: 1.5;
		letter-spacing: -0.025em;
		color: var(--color-fg-primary);
	}
</style>
