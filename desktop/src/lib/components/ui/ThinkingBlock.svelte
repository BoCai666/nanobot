<script lang="ts">
	/**
	 * ThinkingBlock 组件
	 *
	 * 可折叠的思考过程显示组件
	 * - 默认折叠，显示 "💭 思考过程" 标题
	 * - 点击展开显示完整思考内容
	 * - 支持 markdown 渲染
	 * - 带有展开/折叠动画效果
	 *
	 * 用法:
	 * <ThinkingBlock thinking={message.thinking} defaultExpanded={false} />
	 */
	import MarkdownRenderer from './MarkdownRenderer.svelte';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	interface Props {
		/** 思考过程内容 */
		thinking: string;
		/** 默认是否展开 */
		defaultExpanded?: boolean;
	}

	let { thinking, defaultExpanded = false }: Props = $props();

	// 展开状态
	let expanded = $state(defaultExpanded ?? false);

	/**
	 * 切换展开/折叠状态
	 */
	function toggleExpanded() {
		expanded = !expanded;
	}
</script>

<div class="thinking-block">
	<button
		type="button"
		class="thinking-header"
		onclick={toggleExpanded}
		aria-expanded={expanded}
	>
		<span class="thinking-icon">💭</span>
		<span class="thinking-title">思考过程</span>
		<span class="thinking-toggle" class:expanded>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polyline points="6 9 12 15 18 9" />
			</svg>
		</span>
	</button>

	{#if expanded}
		<div
			class="thinking-content-wrapper"
			transition:slide={{ duration: 250, easing: quintOut }}
		>
			<div class="thinking-content">
				<MarkdownRenderer content={thinking} />
			</div>
		</div>
	{/if}
</div>

<style>
	.thinking-block {
		margin: 0.75rem 0;
		border-radius: var(--radius-lg);
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		overflow: hidden;
	}

	.thinking-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.625rem 0.875rem;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.thinking-header:hover {
		background-color: var(--color-bg-tertiary);
	}

	.thinking-header:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: -2px;
	}

	.thinking-icon {
		font-size: 0.875rem;
		flex-shrink: 0;
	}

	.thinking-title {
		flex: 1;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		text-align: left;
	}

	.thinking-toggle {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: var(--color-text-tertiary);
		transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.thinking-toggle svg {
		width: 100%;
		height: 100%;
	}

	.thinking-toggle.expanded {
		transform: rotate(180deg);
	}

	.thinking-content-wrapper {
		overflow: hidden;
	}

	.thinking-content {
		padding: 0.75rem 1rem;
		padding-top: 0.25rem;
		font-size: 0.8125rem;
		line-height: 1.6;
		color: var(--color-text-secondary);
		border-top: 1px solid var(--color-border);
		background-color: var(--color-bg-tertiary);
	}

	/* 思考内容内的 Markdown 样式微调 */
	.thinking-content :global(.markdown-content) {
		font-size: 0.8125rem;
	}

	.thinking-content :global(p) {
		margin: 0 0 0.5rem 0;
	}

	.thinking-content :global(p:last-child) {
		margin-bottom: 0;
	}

	.thinking-content :global(code) {
		font-size: 0.75rem;
	}

	.thinking-content :global(pre) {
		font-size: 0.75rem;
		padding: 0.75rem;
	}

	/* 暗色模式适配 */
	:global(.dark) .thinking-block {
		background-color: rgba(30, 41, 59, 0.5);
		border-color: var(--color-border);
	}

	:global(.dark) .thinking-header:hover {
		background-color: rgba(51, 65, 85, 0.5);
	}

	:global(.dark) .thinking-content {
		background-color: rgba(15, 23, 42, 0.5);
	}

	/* 响应式适配 */
	@media (max-width: 640px) {
		.thinking-block {
			margin: 0.5rem 0;
		}

		.thinking-header {
			padding: 0.5rem 0.75rem;
		}

		.thinking-content {
			padding: 0.625rem 0.875rem;
			font-size: 0.75rem;
		}
	}
</style>
