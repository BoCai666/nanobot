<script lang="ts">
	/**
	 * 主题切换按钮组件
	 * 在亮色/暗色主题之间切换，带有平滑的图标过渡动画
	 */

	import { theme, toggleTheme, type Theme } from "$lib/stores/theme";
	import { Sun, Moon } from "$lib/components/ui/icons";
	import { cn } from "$lib/utils/cn";

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();

	// 当前主题状态
	let currentTheme: Theme = $state("light");

	// 订阅主题 store
	$effect(() => {
		const unsubscribe = theme.subscribe((value) => {
			currentTheme = value;
		});
		return unsubscribe;
	});

	// 点击切换主题
	function handleClick() {
		toggleTheme();
	}

	// 键盘支持
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			toggleTheme();
		}
	}
</script>

<button
	type="button"
	class={cn(
		"relative inline-flex h-9 w-9 items-center justify-center rounded-md",
		"text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
		"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
		className
	)}
	onclick={handleClick}
	onkeydown={handleKeyDown}
	aria-label={currentTheme === "dark" ? "切换到亮色主题" : "切换到暗色主题"}
>
	<!-- 太阳图标 - 在暗色模式下显示 -->
	<span
		class={cn(
			"pointer-events-none absolute inset-0 flex items-center justify-center",
			"transition-all duration-300 ease-in-out",
			currentTheme === "dark"
				? "opacity-100 scale-100 rotate-0"
				: "opacity-0 scale-50 -rotate-90"
		)}
	>
		<Sun class="h-5 w-5" />
	</span>

	<!-- 月亮图标 - 在亮色模式下显示 -->
	<span
		class={cn(
			"pointer-events-none absolute inset-0 flex items-center justify-center",
			"transition-all duration-300 ease-in-out",
			currentTheme === "light"
				? "opacity-100 scale-100 rotate-0"
				: "opacity-0 scale-50 rotate-90"
		)}
	>
		<Moon class="h-5 w-5" />
	</span>
</button>
