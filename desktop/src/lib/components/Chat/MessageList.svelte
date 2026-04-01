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
			<!-- 空状态 - 友好欢迎引导界面 -->
			<div class="empty-state">
				<div class="empty-icon">💬</div>
				<h3 class="empty-title">开始对话</h3>
				<p class="empty-text">向 AI 助手提问，获取帮助、创意灵感或技术支持</p>
				<p class="empty-hint">在下方输入框中输入您的问题</p>
			</div>
		{/if}
	{:else}
		<div class="messages-container">
			{#each messages as message (message.id)}
				<div
					class="message"
					class:user={message.role === 'user'}
					class:assistant={message.role === 'assistant'}
				>
					<div class="message-avatar">
						{#if message.role === 'user'}
							<div class="avatar user-avatar">我</div>
						{:else}
							<div class="avatar assistant-avatar">🤖</div>
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
		padding: var(--space-4);
		scroll-behavior: smooth;
	}

	/* 空状态 - 友好欢迎引导界面 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		min-height: 300px;
		text-align: center;
		padding: var(--space-8);
		animation: fadeIn var(--transition-slow);
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: var(--space-5);
		opacity: 0.6;
		filter: drop-shadow(0 2px 8px var(--color-warm-shadow));
	}

	.empty-title {
		font-size: var(--text-h3);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--space-2);
		line-height: var(--leading-snug);
	}

	.empty-text {
		font-size: var(--text-base);
		font-weight: 500;
		color: var(--color-text-secondary);
		margin-bottom: var(--space-6);
		line-height: var(--leading-relaxed);
		max-width: 320px;
	}

	.empty-hint {
		font-size: var(--text-sm);
		color: var(--color-text-tertiary);
		padding: var(--space-3) var(--space-4);
		background-color: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		line-height: var(--leading-normal);
	}

	/* 加载状态骨架屏 */
	.loading-skeleton-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		padding: var(--space-6);
		animation: fadeIn var(--transition-base);
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
		width: 40px;
		height: 40px;
		border-radius: var(--radius-lg);
		background: linear-gradient(
			90deg,
			var(--color-bg-tertiary) 0%,
			var(--color-bg-secondary) 50%,
			var(--color-bg-tertiary) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
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
			var(--color-bg-tertiary) 0%,
			var(--color-bg-secondary) 50%,
			var(--color-bg-tertiary) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
	}

	.skeleton-title {
		width: 30%;
		height: 18px;
	}

	.skeleton-text {
		width: 100%;
	}

	.skeleton-text-short {
		width: 70%;
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	.messages-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.message {
		display: flex;
		gap: var(--space-3);
		animation: fadeIn 0.3s ease;
	}

	.message.user {
		flex-direction: row-reverse;
	}

	.message-avatar {
		flex-shrink: 0;
	}

	.avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-sm);
		font-weight: 500;
		transition: transform var(--transition-fast);
	}

	.user-avatar {
		background-color: var(--user-bubble);
		color: var(--user-bubble-foreground);
	}

	.user-avatar:hover {
		transform: scale(1.05);
	}

	.assistant-avatar {
		background-color: var(--color-bg-tertiary);
		font-size: var(--text-lg);
	}

	.message-content {
		flex: 1;
		max-width: calc(100% - 60px);
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
	}

	.message.user .message-header {
		flex-direction: row-reverse;
	}

	.message-role {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.message-time {
		font-size: var(--text-xs);
		color: var(--color-text-tertiary);
	}

	/* 消息气泡样式 - 温暖友好设计 */
	.message-body {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-xl); /* 18px - 温暖圆润感 */
		font-size: var(--text-base);
		line-height: var(--leading-relaxed);
		word-wrap: break-word;
		overflow-wrap: break-word;
		box-shadow: var(--shadow-sm);
		transition: box-shadow var(--transition-fast);
	}

	/* AI 消息气泡 - 柔和背景 */
	.message.assistant .message-body {
		background-color: var(--ai-bubble);
		color: var(--ai-bubble-foreground);
		border: 1px solid var(--color-border);
	}

	/* 用户消息气泡 - 温暖主色调 */
	.message.user .message-body {
		background-color: var(--user-bubble);
		color: var(--user-bubble-foreground);
		border: 1px solid transparent;
	}

	.message.user .message-body:hover {
		box-shadow: var(--shadow-md);
	}

	/* Markdown 样式 */
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

	/* 代码块 - 使用设计系统变量 */
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
		color: var(--color-primary);
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: all var(--transition-fast);
	}

	.message-body :global(a:hover) {
		border-bottom-color: var(--color-primary);
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
		color: var(--color-text-tertiary);
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

	/* 引用块 */
	.message-body :global(.md-quote) {
		border-left: 3px solid var(--color-primary);
		padding-left: var(--space-3);
		margin: var(--space-2) 0;
		color: var(--color-text-secondary);
		font-style: italic;
	}

	.message.user .message-body :global(.md-quote) {
		border-left-color: var(--user-bubble-overlay-40);
		color: var(--user-bubble-overlay-90);
	}

	/* 流式响应光标 - 柔和脉冲动画 */
	.streaming-cursor {
		display: inline-block;
		width: 2px;
		height: 1.2em;
		background-color: var(--streaming-cursor);
		margin-left: 2px;
		vertical-align: text-bottom;
		border-radius: 1px;
		animation: pulse-cursor var(--transition-slow) ease-in-out infinite;
	}

	.message.user .streaming-cursor {
		background-color: var(--user-bubble-foreground);
	}

	/* 柔和脉冲动画 */
	@keyframes pulse-cursor {
		0%, 100% {
			opacity: 1;
			transform: scaleY(1);
		}
		50% {
			opacity: 0.3;
			transform: scaleY(0.9);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
