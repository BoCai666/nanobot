<script lang="ts">
	import { tick } from 'svelte';

	// 消息类型
	export interface Message {
		id: string;
		role: 'user' | 'assistant';
		content: string;
		timestamp: Date;
		isStreaming?: boolean;
	}

	// Props
	interface Props {
		messages: Message[];
		isLoading?: boolean;
	}

	let { messages, isLoading = false }: Props = $props();

	// 消息列表容器引用
	let messageContainer: HTMLDivElement;

	// 简单的 Markdown 渲染函数
	function renderMarkdown(text: string): string {
		if (!text) return '';

		let html = text
			// 转义 HTML 特殊字符
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			// 代码块 (```...```)
			.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
				const language = lang || 'text';
				return `<pre class="code-block"><code class="language-${language}">${code.trim()}</code></pre>`;
			})
			// 行内代码 (`...`)
			.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
			// 粗体 (**...**)
			.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
			// 斜体 (*...*)
			.replace(/\*([^*]+)\*/g, '<em>$1</em>')
			// 删除线 (~~...~~)
			.replace(/~~([^~]+)~~/g, '<del>$1</del>')
			// 链接 [text](url)
			.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
			// 无序列表
			.replace(/^- (.+)$/gm, '<li class="list-item">$1</li>')
			// 有序列表
			.replace(/^\d+\. (.+)$/gm, '<li class="list-item ordered">$1</li>')
			// 标题
			.replace(/^### (.+)$/gm, '<h3 class="md-heading">$1</h3>')
			.replace(/^## (.+)$/gm, '<h2 class="md-heading">$1</h2>')
			.replace(/^# (.+)$/gm, '<h1 class="md-heading">$1</h1>')
			// 分隔线
			.replace(/^---$/gm, '<hr class="md-hr">')
			// 引用
			.replace(/^> (.+)$/gm, '<blockquote class="md-quote">$1</blockquote>')
			// 段落 (处理换行)
			.replace(/\n\n/g, '</p><p class="md-paragraph">')
			// 单个换行转为 <br>
			.replace(/\n/g, '<br>');

		// 包裹在段落标签中
		if (!html.startsWith('<')) {
			html = `<p class="md-paragraph">${html}</p>`;
		}

		return html;
	}

	// 格式化时间戳
	function formatTime(date: Date): string {
		return new Intl.DateTimeFormat('zh-CN', {
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}

	// 自动滚动到底部
	export async function scrollToBottom(behavior: ScrollBehavior = 'smooth') {
		await tick();
		if (messageContainer) {
			messageContainer.scrollTo({
				top: messageContainer.scrollHeight,
				behavior
			});
		}
	}

	// 当消息变化时自动滚动
	$effect(() => {
		if (messages.length > 0) {
			scrollToBottom('smooth');
		}
	});
</script>

<div class="message-list" bind:this={messageContainer}>
	{#if messages.length === 0}
		{#if isLoading}
			<!-- 加载状态 - 骨架屏 -->
			<div class="loading-skeleton-container">
				<div class="skeleton-message">
					<div class="skeleton-avatar"></div>
					<div class="skeleton-content">
						<div class="skeleton-line skeleton-title"></div>
						<div class="skeleton-line skeleton-text"></div>
						<div class="skeleton-line skeleton-text-short"></div>
					</div>
				</div>
				<div class="skeleton-message user">
					<div class="skeleton-content">
						<div class="skeleton-line skeleton-text"></div>
						<div class="skeleton-line skeleton-text-short"></div>
					</div>
					<div class="skeleton-avatar"></div>
				</div>
			</div>
		{:else}
			<!-- 空状态 - 温暖欢迎界面 -->
			<div class="empty-state">
				<div class="empty-icon-wrapper">
					<span class="empty-icon">💬</span>
				</div>
				<h3 class="empty-title">开始对话</h3>
				<p class="empty-text">向 AI 助手提问，获取帮助、创意灵感或技术支持</p>
				<div class="empty-suggestions">
					<div class="suggestion-chip">✨ 写一段代码</div>
					<div class="suggestion-chip">📝 总结文章</div>
					<div class="suggestion-chip">🤔 解答问题</div>
				</div>
				<p class="empty-hint">在下方输入框中输入您的问题</p>
			</div>
		{/if}
	{:else}
		<div class="messages-container">
			{#each messages as message, index (message.id)}
				<div
					class="message"
					class:user={message.role === 'user'}
					class:assistant={message.role === 'assistant'}
					style="animation-delay: {Math.min(index * 30, 150)}ms"
				>
					<div class="message-avatar">
						{#if message.role === 'user'}
							<div class="avatar user-avatar">我</div>
						{:else}
							<div class="avatar assistant-avatar">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="assistant-icon">
									<path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
									<circle cx="9" cy="13" r="1"/>
									<circle cx="15" cy="13" r="1"/>
									<path d="M9 17h6"/>
								</svg>
							</div>
						{/if}
					</div>
					<div class="message-content">
						<div class="message-header">
							<span class="message-role">
								{message.role === 'user' ? '我' : 'AI 助手'}
							</span>
							<span class="message-time">{formatTime(message.timestamp)}</span>
						</div>
						<div class="message-body">
							{@html renderMarkdown(message.content)}
							{#if message.isStreaming}
								<span class="streaming-cursor"></span>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.message-list {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: var(--space-4);
		scroll-behavior: smooth;
		/* 平滑滚动优化 */
		scrollbar-width: thin;
		scrollbar-color: var(--color-neutral-300) transparent;
	}

	/* 自定义滚动条 */
	.message-list::-webkit-scrollbar {
		width: 6px;
	}

	.message-list::-webkit-scrollbar-track {
		background: transparent;
	}

	.message-list::-webkit-scrollbar-thumb {
		background-color: var(--color-neutral-300);
		border-radius: var(--radius-full);
		transition: background-color var(--transition-fast);
	}

	.message-list::-webkit-scrollbar-thumb:hover {
		background-color: var(--color-neutral-400);
	}

	/* ============================================
	   空状态 - 温暖欢迎界面
	   ============================================ */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		min-height: 320px;
		text-align: center;
		padding: var(--space-6);
		animation: fadeIn var(--duration-slow) var(--ease-out);
	}

	.empty-icon-wrapper {
		position: relative;
		margin-bottom: var(--space-5);
	}

	.empty-icon-wrapper::before {
		content: '';
		position: absolute;
		inset: -12px;
		background: linear-gradient(
			135deg,
			var(--color-brand-100) 0%,
			var(--color-brand-200) 50%,
			var(--color-brand-100) 100%
		);
		border-radius: var(--radius-2xl);
		opacity: 0.6;
		animation: pulse-glow var(--duration-pulse) var(--ease-in-out) infinite;
	}

	.empty-icon {
		position: relative;
		font-size: 3.5rem;
		filter: drop-shadow(0 2px 8px var(--color-warm-shadow));
	}

	.empty-title {
		font-size: var(--text-h3);
		font-weight: 600;
		color: var(--color-fg-primary);
		margin: 0 0 var(--space-2);
		line-height: var(--leading-snug);
		letter-spacing: var(--tracking-tight);
	}

	.empty-text {
		font-size: var(--text-base);
		font-weight: 450;
		color: var(--color-fg-secondary);
		margin: 0 0 var(--space-5);
		line-height: var(--leading-relaxed);
		max-width: 280px;
	}

	.empty-suggestions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		justify-content: center;
		margin-bottom: var(--space-5);
	}

	.suggestion-chip {
		padding: var(--space-2) var(--space-3);
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		font-size: var(--text-sm);
		color: var(--color-fg-secondary);
		transition: all var(--transition-fast);
		cursor: default;
	}

	.suggestion-chip:hover {
		background-color: var(--color-bg-tertiary);
		border-color: var(--color-brand-300);
		color: var(--color-fg-primary);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.empty-hint {
		font-size: var(--text-xs);
		color: var(--color-fg-tertiary);
		padding: var(--space-2) var(--space-3);
		background-color: var(--color-bg-secondary);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		line-height: var(--leading-normal);
		margin: 0;
	}

	/* ============================================
	   加载状态骨架屏
	   ============================================ */
	.loading-skeleton-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		padding: var(--space-6);
		animation: fadeIn var(--duration-normal) var(--ease-out);
	}

	.skeleton-message {
		display: flex;
		gap: var(--space-3);
	}

	.skeleton-message.user {
		flex-direction: row-reverse;
	}

	.skeleton-avatar {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-lg);
		background: linear-gradient(
			90deg,
			var(--color-neutral-100) 0%,
			var(--color-bg-secondary) 50%,
			var(--color-neutral-100) 100%
		);
		background-size: 200% 100%;
		animation: skeleton-shimmer var(--duration-shimmer) linear infinite;
	}

	.skeleton-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		max-width: 60%;
	}

	.skeleton-line {
		height: 14px;
		border-radius: var(--radius-sm);
		background: linear-gradient(
			90deg,
			var(--color-neutral-100) 0%,
			var(--color-bg-secondary) 50%,
			var(--color-neutral-100) 100%
		);
		background-size: 200% 100%;
		animation: skeleton-shimmer var(--duration-shimmer) linear infinite;
	}

	.skeleton-title {
		width: 30%;
		height: 16px;
	}

	.skeleton-text {
		width: 100%;
	}

	.skeleton-text-short {
		width: 65%;
	}

	/* ============================================
	   消息容器
	   ============================================ */
	.messages-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	/* ============================================
	   消息项
	   ============================================ */
	.message {
		display: flex;
		gap: var(--space-3);
		animation: fadeInUp var(--duration-normal) var(--ease-out) both;
	}

	.message.user {
		flex-direction: row-reverse;
	}

	/* ============================================
	   头像
	   ============================================ */
	.message-avatar {
		flex-shrink: 0;
	}

	.avatar {
		width: 36px;
		height: 36px;
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-sm);
		font-weight: 600;
		transition: transform var(--transition-fast),
		            box-shadow var(--transition-fast);
	}

	.user-avatar {
		background: linear-gradient(
			135deg,
			var(--color-brand-500) 0%,
			var(--color-brand-600) 100%
		);
		color: var(--user-bubble-foreground);
		box-shadow: 0 2px 8px var(--color-primary-shadow);
	}

	.user-avatar:hover {
		transform: scale(1.05);
		box-shadow: 0 4px 12px var(--color-primary-shadow-hover);
	}

	.assistant-avatar {
		background-color: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		color: var(--color-fg-secondary);
	}

	.assistant-icon {
		width: 20px;
		height: 20px;
	}

	/* ============================================
	   消息内容区
	   ============================================ */
	.message-content {
		flex: 1;
		max-width: calc(100% - 56px);
		min-width: 80px;
	}

	.message.user .message-content {
		align-items: flex-end;
		display: flex;
		flex-direction: column;
	}

	.message-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-1);
		padding: 0 var(--space-1);
	}

	.message.user .message-header {
		flex-direction: row-reverse;
	}

	.message-role {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--color-fg-secondary);
		letter-spacing: var(--tracking-wide);
	}

	.message-time {
		font-size: var(--text-xs);
		color: var(--color-fg-tertiary);
	}

	/* ============================================
	   消息气泡 - 温暖圆润设计
	   ============================================ */
	.message-body {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-xl);
		font-size: var(--text-base);
		line-height: var(--leading-relaxed);
		word-wrap: break-word;
		overflow-wrap: break-word;
		box-shadow: var(--shadow-sm);
		transition: box-shadow var(--transition-fast),
		            transform var(--transition-fast);
	}

	/* AI 消息气泡 - 柔和背景 */
	.message.assistant .message-body {
		background-color: var(--ai-bubble);
		color: var(--ai-bubble-foreground);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		border-top-left-radius: var(--radius-sm);
	}

	.message.assistant .message-body:hover {
		box-shadow: var(--shadow-md);
	}

	/* 用户消息气泡 - 温暖主色调渐变 */
	.message.user .message-body {
		background: linear-gradient(
			135deg,
			var(--color-brand-500) 0%,
			var(--color-brand-600) 100%
		);
		color: var(--user-bubble-foreground);
		border: none;
		border-top-right-radius: var(--radius-sm);
		box-shadow: 0 2px 8px var(--color-primary-shadow);
	}

	.message.user .message-body:hover {
		box-shadow: 0 4px 12px var(--color-primary-shadow-hover);
		transform: translateY(-1px);
	}

	/* ============================================
	   Markdown 样式
	   ============================================ */
	.message-body :global(.md-paragraph) {
		margin: 0 0 var(--space-2) 0;
	}

	.message-body :global(.md-paragraph:last-child) {
		margin-bottom: 0;
	}

	.message-body :global(.md-heading) {
		margin: var(--space-3) 0 var(--space-2);
		font-weight: 600;
		color: inherit;
	}

	.message-body :global(.md-heading:first-child) {
		margin-top: 0;
	}

	.message-body :global(h1.md-heading) {
		font-size: var(--text-h4);
	}

	.message-body :global(h2.md-heading) {
		font-size: var(--text-h5);
	}

	.message-body :global(h3.md-heading) {
		font-size: var(--text-base);
	}

	/* 代码块 */
	.message-body :global(.code-block) {
		background-color: var(--code-bg);
		border: 1px solid var(--code-border);
		border-radius: var(--radius-md);
		padding: var(--space-3);
		margin: var(--space-2) 0;
		overflow-x: auto;
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		line-height: var(--leading-normal);
		color: var(--code-text);
	}

	.message-body :global(.code-block code) {
		background: none;
		padding: 0;
		border: none;
		color: inherit;
	}

	/* 行内代码 */
	.message-body :global(.inline-code) {
		background-color: var(--code-bg);
		padding: 0.125rem 0.375rem;
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.875em;
		border: 1px solid var(--code-border);
		color: var(--code-text);
	}

	/* 用户消息中的代码块和行内代码 - 半透明背景 */
	.message.user .message-body :global(.inline-code) {
		background-color: var(--user-bubble-overlay-15);
		border-color: var(--user-bubble-overlay-25);
		color: var(--user-bubble-foreground);
	}

	.message.user .message-body :global(.code-block) {
		background-color: var(--user-bubble-code-bg);
		border-color: var(--user-bubble-overlay-20);
	}

	/* 链接样式 */
	.message-body :global(a) {
		color: var(--color-brand-500);
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: all var(--transition-fast);
	}

	.message-body :global(a:hover) {
		border-bottom-color: var(--color-brand-500);
	}

	/* 用户消息中的链接 */
	.message.user .message-body :global(a) {
		color: var(--user-bubble-overlay-95);
		border-bottom-color: var(--user-bubble-overlay-40);
	}

	.message.user .message-body :global(a:hover) {
		color: var(--user-bubble-foreground);
		border-bottom-color: var(--user-bubble-foreground);
	}

	/* 列表样式 */
	.message-body :global(.list-item) {
		margin: var(--space-1) 0;
		padding-left: var(--space-4);
		position: relative;
	}

	.message-body :global(.list-item::before) {
		content: '•';
		position: absolute;
		left: var(--space-1);
		color: var(--color-fg-tertiary);
	}

	.message.user .message-body :global(.list-item::before) {
		color: var(--user-bubble-overlay-40);
	}

	.message-body :global(.list-item.ordered::before) {
		content: attr(data-index);
		counter-increment: list-counter;
	}

	/* 分隔线 */
	.message-body :global(.md-hr) {
		border: none;
		border-top: 1px solid var(--color-border);
		margin: var(--space-3) 0;
	}

	.message.user .message-body :global(.md-hr) {
		border-top-color: var(--user-bubble-overlay-25);
	}

	/* 引用块 */
	.message-body :global(.md-quote) {
		border-left: 3px solid var(--color-brand-400);
		padding-left: var(--space-3);
		margin: var(--space-2) 0;
		color: var(--color-fg-secondary);
		font-style: italic;
	}

	.message.user .message-body :global(.md-quote) {
		border-left-color: var(--user-bubble-overlay-40);
		color: var(--user-bubble-overlay-90);
	}

	/* ============================================
	   流式响应光标
	   ============================================ */
	.streaming-cursor {
		display: inline-block;
		width: 2px;
		height: 1.2em;
		background-color: var(--streaming-cursor);
		margin-left: 2px;
		vertical-align: text-bottom;
		border-radius: 1px;
		animation: pulse-soft var(--duration-pulse) var(--ease-in-out) infinite;
	}

	.message.user .streaming-cursor {
		background-color: var(--user-bubble-foreground);
	}

	/* ============================================
	   动画关键帧
	   ============================================ */
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes skeleton-shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	@keyframes pulse-soft {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.4;
			transform: scale(0.98);
		}
	}

	@keyframes pulse-glow {
		0%, 100% {
			opacity: 0.5;
			transform: scale(1);
		}
		50% {
			opacity: 0.7;
			transform: scale(1.02);
		}
	}

	/* ============================================
	   Reduced Motion 支持
	   ============================================ */
	@media (prefers-reduced-motion: reduce) {
		.message {
			animation: none;
		}

		.empty-state {
			animation: none;
		}

		.empty-icon-wrapper::before {
			animation: none;
		}

		.streaming-cursor {
			animation: none;
			opacity: 1;
		}

		.skeleton-avatar,
		.skeleton-line {
			animation: none;
			background: var(--color-neutral-100);
		}

		.message.user .message-body:hover {
			transform: none;
		}
	}
</style>
