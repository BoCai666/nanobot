<script lang="ts">
	import { Copy, Check } from "$lib/components/ui/icons";
	import { highlightCode } from "$lib/utils/shiki";
	import { cn } from "$lib/utils/cn";

	// Props 定义
	interface Props {
		code: string;
		language: string;
		class?: string;
	}

	let { code, language, class: className }: Props = $props();

	// 状态
	let copied = $state(false);
	let highlightedHtml = $state<string>("");
	let isLoading = $state(true);

	// 高亮代码
	$effect(() => {
		isLoading = true;
		highlightCode(code, language).then((html) => {
			highlightedHtml = html;
			isLoading = false;
		});
	});

	// 复制功能
	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			// 2 秒后恢复图标
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error("复制失败:", err);
		}
	}
</script>

<div class={cn("relative rounded-lg overflow-hidden bg-[var(--code-bg)]", className)}>
	<!-- 顶部工具栏 -->
	<div class="flex items-center justify-between px-4 py-2 bg-[var(--code-header-bg)] border-b border-[var(--code-border)]">
		<!-- 语言标签 -->
		<span class="text-xs font-medium text-[var(--code-muted)] uppercase tracking-wide">
			{language}
		</span>

		<!-- 复制按钮 -->
		<button
			onclick={handleCopy}
			class="flex items-center gap-1.5 px-2 py-1 text-xs text-[var(--code-muted)] hover:text-[var(--code-text)] hover:bg-[var(--code-border)] rounded transition-colors"
			aria-label={copied ? "已复制" : "复制代码"}
			title={copied ? "已复制!" : "复制代码"}
		>
			{#if copied}
				<Check class="w-4 h-4 text-[var(--code-highlight)]" />
				<span class="text-[var(--code-highlight)]">已复制</span>
			{:else}
				<Copy class="w-4 h-4" />
				<span>复制</span>
			{/if}
		</button>
	</div>

	<!-- 代码内容 -->
	<div class="relative overflow-x-auto">
		{#if isLoading}
			<!-- 加载状态 -->
			<pre class="p-4 text-sm font-mono text-[var(--code-text)]"><code>{code}</code></pre>
		{:else}
			<!-- 高亮后的代码 -->
			<div class="shiki-wrapper">
				{@html highlightedHtml}
			</div>
		{/if}
	</div>
</div>

<style>
	/* Shiki 样式覆盖 */
	:global(.shiki-wrapper pre) {
		margin: 0;
		padding: 1rem;
		background-color: transparent !important;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		line-height: 1.6;
		overflow-x: auto;
	}

	:global(.shiki-wrapper code) {
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
	}

	/* 确保滚动条样式一致 */
	:global(.shiki-wrapper pre::-webkit-scrollbar) {
		height: 8px;
	}

	:global(.shiki-wrapper pre::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(.shiki-wrapper pre::-webkit-scrollbar-thumb) {
		background: var(--code-scrollbar);
		border-radius: 4px;
	}

	:global(.shiki-wrapper pre::-webkit-scrollbar-thumb:hover) {
		background: var(--code-scrollbar-hover);
	}
</style>
