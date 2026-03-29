<script lang="ts">
	import { cn } from "$lib/utils/cn";

	interface Props {
		type?: string;
		placeholder?: string;
		value?: string;
		disabled?: boolean;
		class?: string;
		oninput?: (event: Event) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		onfocus?: (event: FocusEvent) => void;
		onblur?: (event: FocusEvent) => void;
	}

	let {
		type = "text",
		placeholder = "",
		value = $bindable(""),
		disabled = false,
		class: className,
		oninput,
		onkeydown,
		onfocus,
		onblur
	}: Props = $props();
</script>

<input
	{type}
	{placeholder}
	{disabled}
	bind:value
	{oninput}
	{onkeydown}
	{onfocus}
	{onblur}
	class={cn(
		"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
/>
