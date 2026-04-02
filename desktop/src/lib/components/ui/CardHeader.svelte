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
		// 使用设计系统间距和布局
		"flex flex-col gap-2 p-5",
		// 底部分隔线 - 温暖色调
		"border-b border-[var(--color-border)]",
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
</div>
