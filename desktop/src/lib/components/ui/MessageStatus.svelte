<script lang="ts">
	import { Loader2, Check, AlertCircle } from "$lib/components/ui/icons";
	import Spinner from "./Spinner.svelte";
	import { cn } from "$lib/utils/cn";

	interface Props {
		status: "sending" | "sent" | "failed";
		size?: "sm" | "md";
		onRetry?: () => void;
		class?: string;
	}

	let { status, size = "sm", onRetry, class: className }: Props = $props();

	const sizeClasses = {
		sm: "h-3.5 w-3.5",
		md: "h-4 w-4"
	};

	// 使用 $derived 创建响应式计算值
	const iconSize = $derived(size === "sm" ? "sm" : "md");
</script>

<div
	class={cn(
		"flex items-center gap-1.5 transition-all duration-200",
		className
	)}
	role="status"
	aria-label={`Message status: ${status}`}
>
	{#if status === "sending"}
		<Spinner size={iconSize} class="text-muted-foreground" />
		<span class="sr-only">发送中...</span>
	{:else if status === "sent"}
		<Check class={cn("text-green-500", sizeClasses[size])} aria-hidden="true" />
		<span class="sr-only">已发送</span>
	{:else if status === "failed"}
		<div class="flex items-center gap-1.5">
			<AlertCircle class={cn("text-red-500", sizeClasses[size])} aria-hidden="true" />
			{#if onRetry}
				<button
					type="button"
					onclick={onRetry}
					class="text-xs font-medium text-red-500 hover:text-red-600 
					       underline underline-offset-2 transition-colors
					       focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1
					       rounded-sm px-1 -mx-1"
					aria-label="重试发送消息"
				>
					重试
				</button>
			{/if}
		</div>
		<span class="sr-only">发送失败</span>
	{/if}
</div>
