<script lang="ts">
	/**
	 * MarkdownRenderer 组件
	 * 
	 * 使用 marked + Shiki 渲染 Markdown 内容
	 * - 支持流式 Markdown（处理未完成的标签）
	 * - 自动语法高亮代码块
	 * - 支持明暗主题切换
	 * 
	 * 用法:
	 * <MarkdownRenderer content="# Hello\n\nThis is **bold** text." />
	 */
	import { parseMarkdown } from "$lib/utils/markdown";
	import { highlightCode } from "$lib/utils/shiki";
	import { onMount, tick } from "svelte";

	// Props
	interface Props {
		/** Markdown 格式的文本内容 */
		content: string;
		/** 是否处于流式模式（处理未完成的标签） */
		streaming?: boolean;
	}

	let { content = "", streaming = false }: Props = $props();

	// 存储处理后的 HTML
	let renderedHtml = $state("");
	let containerRef: HTMLDivElement;

	/**
	 * 处理 Markdown 中的代码块，使用 Shiki 进行高亮
	 */
	async function processCodeBlocks(html: string): Promise<string> {
		// 创建临时 DOM 来解析 HTML
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = html;

		// 查找所有代码块
		const codeBlocks = tempDiv.querySelectorAll("pre code");

		for (const codeBlock of codeBlocks) {
			const code = codeBlock.textContent || "";
			const pre = codeBlock.closest("pre");
			
			// 获取语言标识（从 class 中提取，如 "language-javascript"）
			const langClass = Array.from(codeBlock.classList).find((cls) =>
				cls.startsWith("language-")
			);
			const language = langClass ? langClass.replace("language-", "") : "text";

			try {
				// 使用 Shiki 高亮代码
				const highlightedHtml = await highlightCode(code, language);
				
				if (pre) {
					pre.outerHTML = highlightedHtml;
				}
			} catch (error) {
				// 高亮失败时保留原始代码块
				console.warn("代码高亮失败:", error);
			}
		}

		return tempDiv.innerHTML;
	}

	/**
	 * 处理流式 Markdown，修复未完成的标签
	 */
	function sanitizeStreamingMarkdown(text: string): string {
		if (!streaming) return text;

		// 简单的标签补全逻辑
		let sanitized = text;

		// 统计未闭合的标签
		const openTags: string[] = [];
		const tagRegex = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)[^>]*?\/?>/g;
		let match;

		while ((match = tagRegex.exec(text)) !== null) {
			const isClosing = match[1] === "/";
			const tagName = match[2].toLowerCase();

			if (!isClosing) {
				// 开标签（排除自闭合标签）
				if (!match[0].endsWith("/>") && !["br", "hr", "img", "input", "meta", "link"].includes(tagName)) {
					openTags.push(tagName);
				}
			} else {
				// 闭标签
				const lastIndex = openTags.lastIndexOf(tagName);
				if (lastIndex !== -1) {
					openTags.splice(lastIndex, 1);
				}
			}
		}

		// 闭合未闭合的标签（从后往前）
		for (let i = openTags.length - 1; i >= 0; i--) {
			sanitized += `</${openTags[i]}>`;
		}

		// 处理未闭合的代码块标记
		const codeBlockCount = (sanitized.match(/```/g) || []).length;
		if (codeBlockCount % 2 !== 0) {
			sanitized += "\n```";
		}

		// 处理未闭合的行内代码
		const inlineCodeCount = (sanitized.match(/(?<!`)`[^`]*$/g) || []).length;
		if (inlineCodeCount > 0) {
			sanitized += "`";
		}

		// 处理未闭合的加粗/斜体标记
		const boldCount = (sanitized.match(/\*\*/g) || []).length;
		if (boldCount % 2 !== 0) {
			sanitized += "**";
		}

		const italicCount = (sanitized.match(/(?<!\*)\*(?!\*)/g) || []).length;
		if (italicCount % 2 !== 0) {
			sanitized += "*";
		}

		return sanitized;
	}

	/**
	 * 渲染 Markdown 内容
	 */
	async function renderMarkdown() {
		if (!content) {
			renderedHtml = "";
			return;
		}

		try {
			// 处理流式 Markdown
			const sanitizedContent = streaming ? sanitizeStreamingMarkdown(content) : content;

			// 解析 Markdown
			const rawHtml = parseMarkdown(sanitizedContent);

			// 高亮代码块
			renderedHtml = await processCodeBlocks(rawHtml);
		} catch (error) {
			console.error("Markdown 渲染失败:", error);
			// 出错时显示原始文本
			renderedHtml = `<p class="text-error">${escapeHtml(content)}</p>`;
		}
	}

	/**
	 * 转义 HTML 特殊字符
	 */
	function escapeHtml(str: string): string {
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");
	}

	// 当内容变化时重新渲染
	$effect(() => {
		renderMarkdown();
	});

	// 初始化时预加载 Shiki
	onMount(() => {
		renderMarkdown();
	});
</script>

<div
	bind:this={containerRef}
	class="markdown-content"
	class:streaming
>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html renderedHtml}
</div>

<style>
	.markdown-content {
		/* 基础样式 */
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--color-text-primary);
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	/* 段落 */
	.markdown-content :global(p) {
		margin: 0 0 0.75rem 0;
	}

	.markdown-content :global(p:last-child) {
		margin-bottom: 0;
	}

	/* 标题 */
	.markdown-content :global(h1),
	.markdown-content :global(h2),
	.markdown-content :global(h3),
	.markdown-content :global(h4),
	.markdown-content :global(h5),
	.markdown-content :global(h6) {
		font-weight: 600;
		line-height: 1.3;
		margin: 1.5rem 0 0.75rem 0;
		color: var(--color-text-primary);
	}

	.markdown-content :global(h1) {
		font-size: 1.5rem;
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 0.5rem;
	}

	.markdown-content :global(h2) {
		font-size: 1.25rem;
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 0.375rem;
	}

	.markdown-content :global(h3) {
		font-size: 1.125rem;
	}

	.markdown-content :global(h4) {
		font-size: 1rem;
	}

	.markdown-content :global(h5) {
		font-size: 0.875rem;
	}

	.markdown-content :global(h6) {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.markdown-content :global(h1:first-child),
	.markdown-content :global(h2:first-child),
	.markdown-content :global(h3:first-child),
	.markdown-content :global(h4:first-child),
	.markdown-content :global(h5:first-child),
	.markdown-content :global(h6:first-child) {
		margin-top: 0;
	}

	/* 粗体和斜体 */
	.markdown-content :global(strong),
	.markdown-content :global(b) {
		font-weight: 600;
	}

	.markdown-content :global(em),
	.markdown-content :global(i) {
		font-style: italic;
	}

	.markdown-content :global(del),
	.markdown-content :global(s) {
		text-decoration: line-through;
		color: var(--color-text-secondary);
	}

	/* 链接 */
	.markdown-content :global(a) {
		color: var(--color-primary);
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: border-color var(--transition-fast);
	}

	.markdown-content :global(a:hover) {
		border-bottom-color: var(--color-primary);
	}

	/* 列表 */
	.markdown-content :global(ul),
	.markdown-content :global(ol) {
		margin: 0.75rem 0;
		padding-left: 1.5rem;
	}

	.markdown-content :global(ul) {
		list-style-type: disc;
	}

	.markdown-content :global(ol) {
		list-style-type: decimal;
	}

	.markdown-content :global(li) {
		margin: 0.25rem 0;
	}

	.markdown-content :global(li > ul),
	.markdown-content :global(li > ol) {
		margin: 0.25rem 0;
	}

	/* 任务列表 */
	.markdown-content :global(li input[type="checkbox"]) {
		margin-right: 0.5rem;
		accent-color: var(--color-primary);
	}

	/* 引用块 */
	.markdown-content :global(blockquote) {
		margin: 0.75rem 0;
		padding: 0.5rem 1rem;
		border-left: 4px solid var(--color-primary);
		background-color: var(--color-bg-secondary);
		border-radius: 0 var(--radius-md) var(--radius-md) 0;
	}

	.markdown-content :global(blockquote p) {
		margin: 0.25rem 0;
	}

	.markdown-content :global(blockquote p:first-child) {
		margin-top: 0;
	}

	.markdown-content :global(blockquote p:last-child) {
		margin-bottom: 0;
	}

	/* 代码块 */
	.markdown-content :global(pre) {
		margin: 0.75rem 0;
		padding: 1rem;
		background-color: #0d1117;
		border-radius: var(--radius-md);
		overflow-x: auto;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.markdown-content :global(pre code) {
		background: none;
		padding: 0;
		border-radius: 0;
		font-size: inherit;
		color: inherit;
	}

	/* 行内代码 */
	.markdown-content :global(code:not(pre code)) {
		font-family: var(--font-mono);
		font-size: 0.875em;
		padding: 0.125rem 0.375rem;
		background-color: var(--color-bg-tertiary);
		border-radius: var(--radius-sm);
		color: var(--color-primary);
	}

	/* 表格 */
	.markdown-content :global(table) {
		width: 100%;
		margin: 0.75rem 0;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.markdown-content :global(th),
	.markdown-content :global(td) {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border);
		text-align: left;
	}

	.markdown-content :global(th) {
		background-color: var(--color-bg-secondary);
		font-weight: 600;
	}

	.markdown-content :global(tr:nth-child(even)) {
		background-color: var(--color-bg-secondary);
	}

	.markdown-content :global(tr:hover) {
		background-color: var(--color-bg-tertiary);
	}

	/* 水平线 */
	.markdown-content :global(hr) {
		border: none;
		border-top: 1px solid var(--color-border);
		margin: 1.5rem 0;
	}

	/* 图片 */
	.markdown-content :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: var(--radius-md);
	}

	/* 换行 */
	.markdown-content :global(br) {
		display: block;
		content: "";
		margin: 0.25rem 0;
	}

	/* Shiki 代码高亮样式适配 */
	.markdown-content :global(.shiki) {
		margin: 0;
		padding: 1rem;
		border-radius: var(--radius-md);
		font-family: var(--font-mono);
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.markdown-content :global(.shiki code) {
		font-family: inherit;
		background: none;
		padding: 0;
		border-radius: 0;
		color: inherit;
	}

	/* 流式模式下的光标闪烁效果 */
	.markdown-content.streaming::after {
		content: "▋";
		display: inline-block;
		margin-left: 0.125rem;
		color: var(--streaming-cursor);
		animation: blink 1s step-end infinite;
		vertical-align: baseline;
	}

	@keyframes blink {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}

	/* 暗色模式适配 */
	:global(.dark) .markdown-content :global(pre) {
		background-color: #161b22;
	}

	:global(.dark) .markdown-content :global(code:not(pre code)) {
		background-color: var(--color-bg-tertiary);
	}

	/* 响应式 */
	@media (max-width: 640px) {
		.markdown-content {
			font-size: 0.875rem;
		}

		.markdown-content :global(pre) {
			padding: 0.75rem;
			font-size: 0.8125rem;
		}

		.markdown-content :global(table) {
			font-size: 0.8125rem;
		}

		.markdown-content :global(th),
		.markdown-content :global(td) {
			padding: 0.375rem 0.5rem;
		}
	}
</style>
