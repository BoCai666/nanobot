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
	}

	let { messages }: Props = $props();

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
		<div class="empty-state">
			<div class="empty-icon">💬</div>
			<p class="empty-text">开始一个新的对话</p>
			<p class="empty-hint">输入消息与 AI 助手交流</p>
		</div>
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

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		min-height: 300px;
		text-align: center;
		color: var(--color-text-secondary);
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: var(--space-4);
		opacity: 0.5;
	}

	.empty-text {
		font-size: 1.125rem;
		font-weight: 500;
		color: var(--color-text-primary);
		margin-bottom: var(--space-2);
	}

	.empty-hint {
		font-size: 0.875rem;
		color: var(--color-text-tertiary);
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
		font-size: 0.875rem;
		font-weight: 500;
	}

	.user-avatar {
		background-color: var(--color-primary);
		color: var(--color-text-inverse);
	}

	.assistant-avatar {
		background-color: var(--color-bg-tertiary);
		font-size: 1.25rem;
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
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.message-time {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
	}

	.message-body {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-lg);
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--color-text-primary);
		word-wrap: break-word;
		overflow-wrap: break-word;
	}

	.message.user .message-body {
		background-color: var(--color-primary);
		color: var(--color-text-inverse);
		border-color: var(--color-primary);
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
		font-size: 1.25rem;
	}

	.message-body :global(h2.md-heading) {
		font-size: 1.125rem;
	}

	.message-body :global(h3.md-heading) {
		font-size: 1rem;
	}

	.message-body :global(.code-block) {
		background-color: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-3);
		margin: var(--space-2) 0;
		overflow-x: auto;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		line-height: 1.5;
	}

	.message-body :global(.code-block code) {
		background: none;
		padding: 0;
		border: none;
	}

	.message-body :global(.inline-code) {
		background-color: var(--color-bg-tertiary);
		padding: 0.125rem 0.375rem;
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: 0.875em;
		border: 1px solid var(--color-border);
	}

	.message.user .message-body :global(.inline-code) {
		background-color: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.3);
	}

	.message.user .message-body :global(.code-block) {
		background-color: rgba(0, 0, 0, 0.2);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.message-body :global(a) {
		color: var(--color-primary);
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: border-color var(--transition-fast);
	}

	.message-body :global(a:hover) {
		border-bottom-color: var(--color-primary);
	}

	.message.user .message-body :global(a) {
		color: rgba(255, 255, 255, 0.9);
		border-bottom-color: rgba(255, 255, 255, 0.5);
	}

	.message.user .message-body :global(a:hover) {
		color: white;
		border-bottom-color: white;
	}

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

	.message-body :global(.md-hr) {
		border: none;
		border-top: 1px solid var(--color-border);
		margin: var(--space-3) 0;
	}

	.message-body :global(.md-quote) {
		border-left: 3px solid var(--color-primary);
		padding-left: var(--space-3);
		margin: var(--space-2) 0;
		color: var(--color-text-secondary);
		font-style: italic;
	}

	.message.user .message-body :global(.md-quote) {
		border-left-color: rgba(255, 255, 255, 0.5);
		color: rgba(255, 255, 255, 0.9);
	}

	/* 流式响应光标 */
	.streaming-cursor {
		display: inline-block;
		width: 2px;
		height: 1.2em;
		background-color: var(--color-primary);
		margin-left: 2px;
		vertical-align: text-bottom;
		animation: blink 1s step-end infinite;
	}

	.message.user .streaming-cursor {
		background-color: white;
	}

	@keyframes blink {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
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
