<script lang="ts">
	import { cn } from "$lib/utils/cn";

	interface Props {
		src?: string;
		alt?: string;
		fallback?: string;
		size?: "sm" | "md" | "lg";
		status?: "online" | "offline" | "busy" | "none";
		class?: string;
	}

	let { src, alt = "", fallback, size = "md", status = "none", class: className }: Props = $props();

	// 尺寸映射 - 温暖圆角设计
	const sizeClasses = {
		sm: "h-8 w-8 text-xs",
		md: "h-10 w-10 text-sm",
		lg: "h-12 w-12 text-base"
	};

	// 状态指示器尺寸映射
	const statusSizeClasses = {
		sm: "h-2.5 w-2.5 border",
		md: "h-3 w-3 border-[1.5px]",
		lg: "h-3.5 w-3.5 border-2"
	};

	// 状态颜色 - 使用 CSS 变量
	const statusColors = {
		online: "bg-[var(--color-success)] border-[var(--color-bg-elevated)]",
		offline: "bg-[var(--color-fg-muted)] border-[var(--color-bg-elevated)]",
		busy: "bg-[var(--color-warning)] border-[var(--color-bg-elevated)]"
	};

	let imageError = $state(false);

	// 计算 fallback 首字母
	const displayLetter = $derived(fallback || alt.charAt(0).toUpperCase() || "U");
</script>

<div
	class={cn(
		"relative inline-flex shrink-0 overflow-hidden rounded-full",
		// 使用 --radius-full (50%) 实现完美圆形
		"rounded-[var(--radius-full)]",
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
		<!-- Fallback: 温暖的品牌色渐变背景 -->
		<div class="flex h-full w-full items-center justify-center bg-[var(--color-secondary-bg)]">
			<span class="font-medium text-[var(--color-fg-secondary)]">
				{displayLetter}
			</span>
		</div>
	{/if}

	<!-- 状态指示器 -->
	{#if status !== "none"}
		<div
			class={cn(
				"absolute bottom-0 right-0 rounded-full shadow-sm",
				statusSizeClasses[size],
				statusColors[status]
			)}
		></div>
	{/if}
</div>
