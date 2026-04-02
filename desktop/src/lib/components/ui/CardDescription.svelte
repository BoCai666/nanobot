<script lang="ts">
	import { cn } from "$lib/utils/cn";

	interface Props {
		class?: string;
		children?: import("svelte").Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<p
	class={cn(
		// 温暖的描述文字样式
		"text-sm leading-relaxed",
		// 使用设计系统次要前景色
		"text-[var(--color-fg-secondary)]",
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
</p>
