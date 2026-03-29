<script lang="ts">
	import { cn } from "$lib/utils/cn";

	interface Props {
		placeholder?: string;
		value?: string;
		disabled?: boolean;
		rows?: number;
		maxRows?: number;
		class?: string;
		oninput?: (event: Event) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		onfocus?: (event: FocusEvent) => void;
		onblur?: (event: FocusEvent) => void;
	}

	let {
		placeholder = "",
		value = $bindable(""),
		disabled = false,
		rows = 1,
		maxRows = 10,
		class: className,
		oninput,
		onkeydown,
		onfocus,
		onblur
	}: Props = $props();

	let textareaElement: HTMLTextAreaElement | undefined = $state();

	// 自动调整高度
	function adjustHeight() {
		if (textareaElement) {
			textareaElement.style.height = "auto";
			const lineHeight = parseInt(getComputedStyle(textareaElement).lineHeight) || 24;
			const maxHeight = lineHeight * maxRows;
			const newHeight = Math.min(textareaElement.scrollHeight, maxHeight);
			textareaElement.style.height = `${newHeight}px`;
		}
	}

	$effect(() => {
		if (value !== undefined) {
			adjustHeight();
		}
	});

	function handleInput(event: Event) {
		adjustHeight();
		oninput?.(event);
	}
</script>

<textarea
	bind:this={textareaElement}
	{placeholder}
	{disabled}
	{rows}
	bind:value
	oninput={handleInput}
	{onkeydown}
	{onfocus}
	{onblur}
	class={cn(
		"flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none",
		"transition-all duration-150",
		className
	)}
	style="max-height: 200px; overflow-y: auto;"
></textarea>
