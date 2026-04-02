<script lang="ts">
	/**
	 * HistoryItem 组件
	 * 显示单个历史对话记录
	 * 温暖友好的卡片式设计，支持悬停效果和删除操作
	 */
	import { cn } from '$lib/utils/cn';
	import type { ConversationHistory } from '$lib/stores/history.svelte';

	interface Props {
		/** 历史对话数据 */
		conversation: ConversationHistory;
		/** 是否激活状态 */
		active?: boolean;
		/** 点击回调 */
		onclick?: () => void;
		/** 删除回调 */
		ondelete?: () => void;
		/** 自定义类名 */
		class?: string;
	}

	let { 
		conversation, 
		active = false, 
		onclick, 
		ondelete,
		class: className 
	}: Props = $props();

	// 悬停状态
	let isHovered = $state(false);

	// 确认删除状态
	let showConfirmDelete = $state(false);

	/**
	 * 格式化相对时间
	 */
	function formatRelativeTime(date: Date): string {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const seconds = Math.floor(diff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (seconds < 60) return '刚刚';
		if (minutes < 60) return `${minutes} 分钟前`;
		if (hours < 24) return `${hours} 小时前`;
		if (days < 7) return `${days} 天前`;
		
		// 超过一周显示具体日期
		return date.toLocaleDateString('zh-CN', {
			month: 'short',
			day: 'numeric'
		});
	}

	/**
	 * 格式化消息数量
	 */
	function formatMessageCount(count: number): string {
		if (count <= 0) return '无消息';
		if (count === 1) return '1 条消息';
		return `${count} 条消息`;
	}

	/**
	 * 处理删除点击
	 */
	function handleDeleteClick(e: Event): void {
		e.stopPropagation();
		if (showConfirmDelete) {
			ondelete?.();
			showConfirmDelete = false;
		} else {
			showConfirmDelete = true;
			// 3秒后自动取消确认状态
			setTimeout(() => {
				showConfirmDelete = false;
			}, 3000);
		}
	}

	/**
	 * 处理鼠标进入
	 */
	function handleMouseEnter(): void {
		isHovered = true;
	}

	/**
	 * 处理鼠标离开
	 */
	function handleMouseLeave(): void {
		isHovered = false;
	}
</script>

<div
	class="history-item"
	class:active
	class:hovered={isHovered}
	onclick={onclick}
	onkeydown={(e) => e.key === 'Enter' && onclick?.()}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	aria-label="打开对话: {conversation.title}"
	role="button"
	tabindex="0"
>
	<!-- 左侧装饰条 -->
	<div class="accent-bar" class:active></div>

	<!-- 主要内容区 -->
	<div class="content">
		<!-- 标题行 -->
		<div class="header">
			<h3 class="title">{conversation.title}</h3>
			<span class="time">{formatRelativeTime(conversation.updatedAt)}</span>
		</div>

		<!-- 预览文本 -->
		<p class="preview">{conversation.preview || '暂无预览'}</p>

		<!-- 底部信息 -->
		<div class="footer">
			<span class="channel-badge">{conversation.channelId}</span>
			<span class="message-count">{formatMessageCount(conversation.messageCount)}</span>
		</div>
	</div>

	<!-- 删除按钮 -->
	{#if isHovered}
		<button
			class="delete-btn"
			class:confirm={showConfirmDelete}
			onclick={handleDeleteClick}
			aria-label={showConfirmDelete ? '确认删除' : '删除对话'}
			title={showConfirmDelete ? '再次点击确认删除' : '删除此对话'}
		>
			{#if showConfirmDelete}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
					<path d="M20 6L9 17l-5-5"/>
				</svg>
			{:else}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
					<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
				</svg>
			{/if}
		</button>
	{/if}
</div>

<style>
	/* ============================================
	   历史记录项容器 - 温暖卡片设计
	   ============================================ */
	.history-item {
		position: relative;
		display: flex;
		align-items: flex-start;
		width: 100%;
		padding: var(--space-3) var(--space-4);
		padding-left: calc(var(--space-4) + 3px); /* 为装饰条留空间 */
		border: none;
		border-radius: var(--radius-lg);
		background-color: transparent;
		color: var(--color-fg-primary);
		cursor: pointer;
		text-align: left;
		overflow: hidden;
		transition: all var(--transition-fast);
		gap: var(--space-3);
	}

	/* 悬停效果 */
	.history-item:hover,
	.history-item.hovered {
		background-color: var(--color-bg-tertiary);
	}

	/* 激活状态 */
	.history-item.active {
		background: linear-gradient(
			135deg,
			var(--color-brand-500) 0%,
			var(--color-brand-600) 100%
		);
		color: var(--color-fg-inverse);
		box-shadow: var(--shadow-md);
	}

	/* 焦点状态 */
	.history-item:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	/* ============================================
	   左侧装饰条
	   ============================================ */
	.accent-bar {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 3px;
		background-color: transparent;
		border-radius: 0 2px 2px 0;
		transition: background-color var(--transition-fast);
	}

	.history-item:hover .accent-bar {
		background-color: var(--color-brand-300);
	}

	.history-item.active .accent-bar {
		background-color: color-mix(in srgb, var(--color-fg-inverse) 40%, transparent);
	}

	/* ============================================
	   内容区域
	   ============================================ */
	.content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	/* ============================================
	   标题行
	   ============================================ */
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.title {
		flex: 1;
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1.25rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.time {
		flex-shrink: 0;
		font-size: 0.75rem;
		color: var(--color-fg-tertiary);
		transition: color var(--transition-fast);
	}

	.history-item:hover .time {
		color: var(--color-fg-secondary);
	}

	.history-item.active .time {
		color: color-mix(in srgb, var(--color-fg-inverse) 70%, transparent);
	}

	/* ============================================
	   预览文本
	   ============================================ */
	.preview {
		margin: 0;
		font-size: 0.8125rem;
		line-height: 1.25rem;
		color: var(--color-fg-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		transition: color var(--transition-fast);
	}

	.history-item.active .preview {
		color: color-mix(in srgb, var(--color-fg-inverse) 80%, transparent);
	}

	/* ============================================
	   底部信息
	   ============================================ */
	.footer {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-top: var(--space-1);
	}

	.channel-badge {
		display: inline-flex;
		align-items: center;
		padding: 0.125rem var(--space-2);
		font-size: 0.6875rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		color: var(--color-fg-tertiary);
		background-color: var(--color-bg-secondary);
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
	}

	.history-item:hover .channel-badge {
		background-color: var(--color-bg-elevated);
	}

	.history-item.active .channel-badge {
		background-color: color-mix(in srgb, var(--color-fg-inverse) 20%, transparent);
		color: var(--color-fg-inverse);
	}

	.message-count {
		font-size: 0.6875rem;
		color: var(--color-fg-muted);
		transition: color var(--transition-fast);
	}

	.history-item:hover .message-count {
		color: var(--color-fg-tertiary);
	}

	.history-item.active .message-count {
		color: color-mix(in srgb, var(--color-fg-inverse) 60%, transparent);
	}

	/* ============================================
	   删除按钮
	   ============================================ */
	.delete-btn {
		position: absolute;
		right: var(--space-3);
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		border-radius: var(--radius-md);
		background-color: transparent;
		color: var(--color-fg-muted);
		cursor: pointer;
		opacity: 0;
		transition: all var(--transition-fast);
	}

	.history-item:hover .delete-btn {
		opacity: 1;
	}

	.delete-btn:hover {
		background-color: var(--color-error-bg);
		color: var(--color-error);
	}

	.delete-btn.confirm {
		background-color: var(--color-error);
		color: var(--color-fg-inverse);
		opacity: 1;
	}

	.delete-btn.confirm:hover {
		background-color: var(--color-error-dark);
	}

	.history-item.active .delete-btn {
		color: color-mix(in srgb, var(--color-fg-inverse) 60%, transparent);
	}

	.history-item.active .delete-btn:hover {
		background-color: color-mix(in srgb, var(--color-fg-inverse) 20%, transparent);
		color: var(--color-fg-inverse);
	}

	.delete-btn:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	.icon {
		width: 16px;
		height: 16px;
	}

	/* ============================================
	   Reduced Motion 支持
	   ============================================ */
	@media (prefers-reduced-motion: reduce) {
		.history-item,
		.accent-bar,
		.title,
		.preview,
		.time,
		.channel-badge,
		.message-count,
		.delete-btn {
			transition-duration: 0.01ms !important;
		}
	}
</style>
