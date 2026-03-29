<script lang="ts">
	import { cn } from "$lib/utils/cn";

	interface Props {
		src?: string;
		alt?: string;
		fallback?: string;
		size?: "sm" | "md" | "lg";
		class?: string;
	}

	let { src, alt = "", fallback, size = "md", class: className }: Props = $props();

	const sizeClasses = {
		sm: "h-8 w-8 text-xs",
		md: "h-10 w-10 text-sm",
		lg: "h-12 w-12 text-base"
	};

	let imageError = $state(false);
</script>

<div
	class={cn(
		"relative flex shrink-0 overflow-hidden rounded-full",
		sizeClasses[size],
		className
	)}
>
	{#if src && !imageError}
		<img
			{src}
			{alt}
			class="aspect-square h-full w-full object-cover"
			onerror={() => imageError = true}
		/>
	{:else}
		<div class="flex h-full w-full items-center justify-center rounded-full bg-muted">
			<span class="font-medium text-muted-foreground">
				{fallback || alt.charAt(0).toUpperCase() || "U"}
			</span>
		</div>
	{/if}
</div>
