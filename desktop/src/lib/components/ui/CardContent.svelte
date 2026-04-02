<script lang="ts">
	import { cn } from "$lib/utils/cn";

	interface Props {
		class?: string;
		children?: import("svelte").Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<div
	class={cn(
		// 使用设计系统间距
		"p-5 pt-0",
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
</div>
