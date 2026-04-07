<script lang="ts">
	/**
	 * MarkdownRenderer 组件
	 * 
	 * 使用 marked + Shiki 渲染 Markdown 内容
	 * - 支持流式 Markdown（处理未完成的标签）
	 * - 自动语法高亮代码块
	 * - 支持明暗主题切换
	 * - 支持图片点击预览
	 * - 图片加载状态和错误处理
	 * 
	 * 用法:
	 * <MarkdownRenderer content="# Hello\n\nThis is **bold** text." />
	 */
	import { parseMarkdown } from "$lib/utils/markdown";
	import { highlightCode } from "$lib/utils/shiki";
	import { onMount, tick } from "svelte";
	import ImagePreview from "./ImagePreview.svelte";

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

	// 图片预览状态
	let previewImage = $state<{
		src: string;
		alt: string;
		open: boolean;
		images: Array<{ src: string; alt: string }>;
		currentIndex: number;
	}>({
		src: "",
		alt: "",
		open: false,
		images: [],
		currentIndex: 0
	});

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
	 * 处理图片，添加包装器和加载状态
	 */
	function processImages(html: string): string {
		// 创建临时 DOM 来解析 HTML
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = html;

		// 查找所有图片
		const images = tempDiv.querySelectorAll("img");

		for (const img of images) {
			const src = img.getAttribute("src") || "";
			const alt = img.getAttribute("alt") || "";

			// 创建图片包装器
			const wrapper = document.createElement("span");
			wrapper.className = "image-wrapper";
			wrapper.setAttribute("data-image-src", src);
			wrapper.setAttribute("data-image-alt", alt);

			// 添加加载占位符
			const placeholder = document.createElement("span");
			placeholder.className = "image-placeholder";
			placeholder.innerHTML = `
				<span class="image-loading-spinner"></span>
				<span class="image-loading-text">加载中...</span>
			`;

			// 包装原图
			img.classList.add("markdown-image");
			img.setAttribute("loading", "lazy");
			
			wrapper.appendChild(placeholder);
			wrapper.appendChild(img);

			// 替换原图
			img.parentNode?.insertBefore(wrapper, img);
			img.parentNode?.removeChild(img);
		}

		return tempDiv.innerHTML;
	}

	/**
	 * 处理图片点击事件（事件委托）
	 */
	function handleImageClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const wrapper = target.closest(".image-wrapper") as HTMLElement;
		
		if (wrapper) {
			const src = wrapper.getAttribute("data-image-src") || "";
			const alt = wrapper.getAttribute("data-image-alt") || "";
			
			if (src) {
				// 收集所有图片
				const allImages = containerRef.querySelectorAll(".image-wrapper");
				const images: Array<{ src: string; alt: string }> = [];
				let clickedIndex = 0;

				allImages.forEach((imgWrapper, index) => {
					const imgSrc = imgWrapper.getAttribute("data-image-src") || "";
					const imgAlt = imgWrapper.getAttribute("data-image-alt") || "";
					if (imgSrc) {
						images.push({ src: imgSrc, alt: imgAlt });
						if (imgWrapper === wrapper) {
							clickedIndex = index;
						}
					}
				});

				// 打开图片预览
				previewImage = {
					src,
					alt,
					open: true,
					images,
					currentIndex: clickedIndex
				};
			}
		}
	}

	/**
	 * 关闭图片预览
	 */
	function closeImagePreview() {
		previewImage = {
			...previewImage,
			open: false
		};
	}

	/**
	 * 处理图片导航
	 */
	function handleImageNavigate(index: number) {
		if (previewImage.images[index]) {
			previewImage = {
				...previewImage,
				src: previewImage.images[index].src,
				alt: previewImage.images[index].alt,
				currentIndex: index
			};
		}
	}

	/**
	 * 处理图片加载事件
	 */
	function handleImageLoad(event: Event) {
		const img = event.target as HTMLImageElement;
		const wrapper = img.closest(".image-wrapper");
		
		if (wrapper) {
			// 隐藏加载占位符
			const placeholder = wrapper.querySelector(".image-placeholder");
			if (placeholder) {
				(placeholder as HTMLElement).style.display = "none";
			}
			// 显示图片
			img.style.opacity = "1";
		}
	}

	/**
	 * 处理图片加载错误
	 */
	function handleImageError(event: Event) {
		const img = event.target as HTMLImageElement;
		const wrapper = img.closest(".image-wrapper");
		
		if (wrapper) {
			// 替换占位符为错误提示
			const placeholder = wrapper.querySelector(".image-placeholder");
			if (placeholder) {
				placeholder.innerHTML = `
					<svg class="image-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
						<circle cx="8.5" cy="8.5" r="1.5"/>
						<polyline points="21 15 16 10 5 21"/>
					</svg>
					<span class="image-error-text">图片加载失败</span>
				`;
				placeholder.classList.add("error");
			}
			// 隐藏原图
			img.style.display = "none";
		}
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

            // 先立即渲染基础 HTML（不含代码高亮）
            // 这样即使 Shiki 加载失败，用户也能看到格式化的内容
            renderedHtml = rawHtml;

            // 异步高亮代码块（不阻塞渲染）
            processCodeBlocks(rawHtml)
                .then((highlightedHtml) => {
                    const processedHtml = processImages(highlightedHtml);
                    renderedHtml = processedHtml;
                })
                .catch((error) => {
                    console.warn("代码高亮失败，使用原始 HTML:", error);
                    // 高亮失败时，至少处理图片
                    const processedHtml = processImages(rawHtml);
                    renderedHtml = processedHtml;
                });
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

	// 设置图片事件监听器
	$effect(() => {
		if (containerRef && renderedHtml) {
			// 使用事件委托监听图片点击
			containerRef.addEventListener("click", handleImageClick);

			// 监听所有图片的加载事件
			const images = containerRef.querySelectorAll(".markdown-image");
			images.forEach((img) => {
				img.addEventListener("load", handleImageLoad);
				img.addEventListener("error", handleImageError);
			});

			return () => {
				containerRef.removeEventListener("click", handleImageClick);
				images.forEach((img) => {
					img.removeEventListener("load", handleImageLoad);
					img.removeEventListener("error", handleImageError);
				});
			};
		}
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

<!-- 图片预览模态框 -->
<ImagePreview
	src={previewImage.src}
	alt={previewImage.alt}
	open={previewImage.open}
	onClose={closeImagePreview}
	images={previewImage.images}
	currentIndex={previewImage.currentIndex}
	onNavigate={handleImageNavigate}
/>

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
		background-color: var(--code-bg);
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

	/* 图片包装器 */
	.markdown-content :global(.image-wrapper) {
		position: relative;
		display: inline-block;
		max-width: 100%;
		margin: var(--space-2) 0;
		border-radius: var(--radius-md);
		overflow: hidden;
		cursor: pointer;
		transition: transform var(--transition-fast);
	}

	.markdown-content :global(.image-wrapper:hover) {
		transform: scale(1.01);
	}

	.markdown-content :global(.image-wrapper:hover::after) {
		content: "🔍";
		position: absolute;
		top: var(--space-2);
		right: var(--space-2);
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.6);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		animation: fadeIn 0.2s ease-out;
	}

	.markdown-content :global(.image-wrapper:hover::before) {
		content: "Ctrl+滚轮缩放";
		position: absolute;
		bottom: var(--space-2);
		left: 50%;
		transform: translateX(-50%);
		padding: var(--space-1) var(--space-2);
		background: rgba(0, 0, 0, 0.7);
		color: rgba(255, 255, 255, 0.9);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		white-space: nowrap;
		opacity: 0;
		animation: fadeInDelayed 0.5s ease-out 1s forwards;
	}

	@keyframes fadeInDelayed {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* 图片加载占位符 */
	.markdown-content :global(.image-placeholder) {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-width: 200px;
		min-height: 150px;
		padding: var(--space-4);
		background: var(--color-bg-secondary);
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-md);
	}

	.markdown-content :global(.image-placeholder.error) {
		border-color: var(--color-error);
		background: var(--color-error-bg);
	}

	.markdown-content :global(.image-loading-spinner) {
		width: 24px;
		height: 24px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-brand-500);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.markdown-content :global(.image-loading-text) {
		font-size: var(--text-xs);
		color: var(--color-fg-secondary);
	}

	/* 图片错误图标 */
	.markdown-content :global(.image-error-icon) {
		width: 32px;
		height: 32px;
		color: var(--color-error);
	}

	.markdown-content :global(.image-error-text) {
		font-size: var(--text-sm);
		color: var(--color-error);
	}

	/* Markdown 图片 */
	.markdown-content :global(.markdown-image) {
		display: block;
		max-width: 100%;
		height: auto;
		opacity: 0;
		transition: opacity var(--duration-normal) var(--ease-out);
		border-radius: var(--radius-md);
	}

	/* 加载动画 */
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
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

	/* 暗色模式适配 - 保持温暖暗色调一致性 */
	:global(.dark) .markdown-content :global(pre),
	:global([data-theme="dark"]) .markdown-content :global(pre) {
		background-color: var(--code-bg);
		border: 1px solid var(--code-border);
	}

	:global(.dark) .markdown-content :global(code:not(pre code)),
	:global([data-theme="dark"]) .markdown-content :global(code:not(pre code)) {
		background-color: var(--color-bg-tertiary);
		color: var(--code-highlight);
	}

	/* 代码块语法高亮优化 - 使用温暖的强调色 */
	.markdown-content :global(.shiki .highlight) {
		color: var(--code-highlight);
	}

	.markdown-content :global(.shiki .muted) {
		color: var(--code-muted);
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
