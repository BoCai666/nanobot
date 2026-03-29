<script lang="ts">
	import { cn } from "$lib/utils/cn";

	interface Props {
		char?: string;
		class?: string;
	}

	let { char = "▋", class: className }: Props = $props();
</script>

<span class={cn("streaming-cursor", className)}>{char}</span>

<style>
	.streaming-cursor {
		display: inline-block;
		color: var(--streaming-cursor, var(--color-primary));
		font-family: monospace;
		user-select: none;
		animation: blink 1s step-end infinite;
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}
</style>
