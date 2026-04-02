<script lang="ts">
	import { cn } from "$lib/utils/cn";
	import { tv, type VariantProps } from "tailwind-variants";

	/**
	 * Button 组件 - 温暖亲切的设计风格
	 * 
	 * 设计理念：
	 * - 使用品牌色 #FF6B35 (温暖橙色)
	 * - 微交互动画：hover-lift, press-scale, ripple
	 * - 完整的设计系统 tokens 支持
	 * - 无障碍友好：focus ring, prefers-reduced-motion
	 */
	const buttonVariants = tv({
		base: cn(
			// 布局
			"inline-flex items-center justify-center whitespace-nowrap",
			"rounded-[var(--radius-md)] font-medium",
			
			// 字体
			"text-sm",
			
			// 过渡动画 - 使用设计系统 tokens
			"transition-all",
			"[transition-duration:var(--duration-fast)]",
			"[transition-timing-function:var(--ease-out)]",
			
			// 焦点环
			"focus-visible:outline-none",
			"focus-visible:ring-2",
			"focus-visible:ring-offset-2",
			"[focus-visible:ring-color:var(--color-primary-ring)]",
			
			// 禁用状态
			"disabled:pointer-events-none",
			"disabled:opacity-50",
			
			// 波纹效果容器
			"relative overflow-hidden"
		),
		variants: {
			variant: {
				// 主要按钮 - 品牌橙色
				primary: cn(
					"bg-[var(--color-primary)]",
					"text-[var(--color-fg-inverse)]",
					"shadow-sm",
					"hover:bg-[var(--color-primary-hover)]",
					"active:bg-[var(--color-primary-active)]",
					"hover:shadow-[var(--color-primary-shadow)]"
				),
				
				// 次要按钮 - 较浅的橙色
				secondary: cn(
					"bg-[var(--color-secondary)]",
					"text-[var(--color-fg-inverse)]",
					"shadow-sm",
					"hover:bg-[var(--color-secondary-hover)]",
					"active:bg-[var(--color-secondary-active)]"
				),
				
				// 轮廓按钮 - 边框样式
				outline: cn(
					"border-2",
					"border-[var(--color-border)]",
					"bg-transparent",
					"text-[var(--color-fg-primary)]",
					"hover:bg-[var(--color-primary-bg)]",
					"hover:border-[var(--color-primary)]",
					"hover:text-[var(--color-primary)]",
					"active:bg-[var(--color-primary-bg)]"
				),
				
				// 幽灵按钮 - 透明背景
				ghost: cn(
					"bg-transparent",
					"text-[var(--color-fg-primary)]",
					"hover:bg-[var(--color-primary-bg)]",
					"hover:text-[var(--color-primary)]",
					"active:bg-[var(--color-primary-bg)]"
				),
				
				// 危险按钮 - 红色警告
				destructive: cn(
					"bg-[var(--color-error)]",
					"text-white",
					"shadow-sm",
					"hover:bg-[var(--color-error-hover)]",
					"active:bg-[var(--color-error-active)]",
					"hover:shadow-[var(--color-error-shadow)]"
				)
			},
			size: {
				sm: "h-8 px-3 text-xs rounded-[var(--radius-sm)]",
				md: "h-9 px-4 py-2",
				lg: "h-10 px-8 rounded-[var(--radius-lg)]",
				icon: "h-9 w-9"
			}
		},
		defaultVariants: {
			variant: "primary",
			size: "md"
		}
	});

	type Variant = VariantProps<typeof buttonVariants>["variant"];
	type Size = VariantProps<typeof buttonVariants>["size"];

	interface Props {
		variant?: Variant;
		size?: Size;
		class?: string;
		disabled?: boolean;
		type?: "button" | "submit" | "reset";
		onclick?: (event: MouseEvent) => void;
		children?: import("svelte").Snippet;
	}

	let {
		variant = "primary",
		size = "md",
		class: className,
		disabled = false,
		type = "button",
		onclick,
		children
	}: Props = $props();

	// 波纹效果状态
	let ripples: Array<{ id: number; x: number; y: number }> = $state([]);
	let rippleId = 0;

	// 处理点击事件，创建波纹效果
	function handleClick(event: MouseEvent) {
		// 如果禁用，不执行任何操作
		if (disabled) return;

		const button = event.currentTarget as HTMLButtonElement;
		const rect = button.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		// 添加新波纹
		const id = rippleId++;
		ripples = [...ripples, { id, x, y }];

		// 600ms 后移除波纹（匹配动画时长）
		setTimeout(() => {
			ripples = ripples.filter((r) => r.id !== id);
		}, 600);

		// 调用外部点击处理器
		onclick?.(event);
	}
</script>

<button
	{type}
	{disabled}
	onclick={handleClick}
	class={cn(
		buttonVariants({ variant, size }),
		// hover-lift 效果（非禁用状态）
		!disabled && "hover:-translate-y-[1px]",
		// press-scale 效果（非禁用状态）
		!disabled && "active:scale-[0.97] active:translate-y-0",
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
	
	<!-- 波纹效果层 -->
	{#if ripples.length > 0}
		{#each ripples as ripple (ripple.id)}
			<span
				class="absolute rounded-full pointer-events-none animate-ripple"
				style="left: {ripple.x}px; top: {ripple.y}px; transform: translate(-50%, -50%);"
				aria-hidden="true"
			></span>
		{/each}
	{/if}
</button>

<style>
	/* 波纹动画 - 使用设计系统的 easing */
	.animate-ripple {
		width: 10px;
		height: 10px;
		background: currentColor;
		opacity: 0.3;
		animation: ripple-expand 0.6s var(--ease-out) forwards;
	}

	@keyframes ripple-expand {
		0% {
			transform: translate(-50%, -50%) scale(0);
			opacity: 0.5;
		}
		100% {
			transform: translate(-50%, -50%) scale(20);
			opacity: 0;
		}
	}

	/* Reduced Motion 支持 */
	@media (prefers-reduced-motion: reduce) {
		button {
			transition-duration: 0.01ms !important;
		}
		
		button:hover {
			transform: none !important;
		}
		
		button:active {
			transform: none !important;
		}
		
		.animate-ripple {
			animation: none !important;
		}
	}
</style>
