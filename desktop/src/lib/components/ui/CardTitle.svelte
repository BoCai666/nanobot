<script lang="ts">
	import { cn } from "$lib/utils/cn";

	interface Props {
		class?: string;
		children?: import("svelte").Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<h3
	class={cn(
		// 温暖的字体样式
		"text-lg font-semibold leading-tight tracking-tight",
		// 使用设计系统前景色
		"text-[var(--color-card-foreground)]",
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
</h3>
