<script lang="ts">
	import { cn } from "$lib/utils/cn";

	type Variant = "default" | "secondary" | "success" | "warning" | "error" | "info";

	interface Props {
		variant?: Variant;
		class?: string;
		children?: import("svelte").Snippet;
	}

	let { variant = "default", class: className, children }: Props = $props();

	const variants = {
		default: "bg-primary-bg text-primary border-transparent",
		secondary: "bg-secondary-bg text-secondary border-transparent",
		success: "bg-success-bg text-success border-transparent",
		warning: "bg-warning-bg text-warning border-transparent",
		error: "bg-error-bg text-error border-transparent",
		info: "bg-info-bg text-info border-transparent"
	};
</script>

<div
	class={cn(
		"inline-flex items-center rounded-[var(--radius-sm)] border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
		variants[variant],
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
</div>
