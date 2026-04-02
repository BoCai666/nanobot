<script lang="ts">
	import { cn } from "$lib/utils/cn";

	interface Props {
		class?: string;
		children?: import("svelte").Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<p class={cn("description", className)}>
	{#if children}
		{@render children()}
	{/if}
</p>

<style>
	.description {
		margin: 0;
		
		/* 使用设计 tokens - 柔和的描述文字 */
		font-size: 0.875rem; /* text-sm */
		line-height: 1.5;
		color: var(--color-fg-secondary);
	}
</style>
