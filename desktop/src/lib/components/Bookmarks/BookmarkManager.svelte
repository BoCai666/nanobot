<script lang="ts">
	/**
	 * BookmarkManager 组件
	 * 
	 * 消息收藏管理器 - 温暖亲切的设计风格
	 * - 收藏图标按钮
	 * - 收藏列表面板
	 * - 添加/删除收藏交互
	 * - 使用设计系统的 CSS variables
	 */
	import { bookmarksStore, type Bookmark } from '$lib/stores/bookmarks.svelte';
	import { selectedChannel } from '$lib/stores/app';
	import { onMount } from 'svelte';
	import { logger } from '$lib/utils/logger';

	// Props
	interface Props {
		/** 当前对话 ID */
		conversationId?: string;
		/** 对话标题 */
		title?: string;
		/** 预览内容 */
		preview?: string;
		/** 点击收藏项的回调 */
		onSelectBookmark?: (bookmark: Bookmark) => void;
	}

	let {
		conversationId = '',
		title = '新对话',
		preview = '',
		onSelectBookmark
	}: Props = $props();

	// 面板展开状态
	let isPanelOpen = $state(false);

	// 初始化收藏
	onMount(() => {
		bookmarksStore.initBookmarks();
	});

	// 当前对话是否已收藏
	let isCurrentBookmarked = $derived(
		conversationId ? bookmarksStore.isBookmarked(conversationId) : false
	);

	// 当前频道下的收藏
	let channelBookmarks = $derived(
		bookmarksStore.getBookmarksByChannel($selectedChannel)
	);

	// 所有收藏
	let allBookmarks = $derived(bookmarksStore.bookmarks);

	// 切换收藏状态
	function toggleBookmark() {
		if (!conversationId) return;

		if (isCurrentBookmarked) {
			bookmarksStore.removeByConversationId(conversationId);
		} else {
			const success = bookmarksStore.addBookmark(
				conversationId,
				title,
				$selectedChannel,
				preview
			);
			if (!success && bookmarksStore.remainingSlots === 0) {
				// 可以在这里显示 toast 提示
				logger.warn('已达到最大收藏数量限制');
			}
		}
	}

	// 切换面板
	function togglePanel() {
		isPanelOpen = !isPanelOpen;
	}

	// 选择收藏
	function handleSelectBookmark(bookmark: Bookmark) {
		onSelectBookmark?.(bookmark);
		isPanelOpen = false;
	}

	// 删除收藏
	function handleRemoveBookmark(event: MouseEvent, bookmarkId: string) {
		event.stopPropagation();
		bookmarksStore.removeBookmark(bookmarkId);
	}

	// 格式化日期
	function formatDate(date: Date | string): string {
		const d = typeof date === 'string' ? new Date(date) : date;
		const now = new Date();
		const diffMs = now.getTime() - d.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
		} else if (diffDays === 1) {
			return '昨天';
		} else if (diffDays < 7) {
			return `${diffDays} 天前`;
		} else {
			return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
		}
	}
</script>

<div class="bookmark-manager">
	<!-- 收藏按钮 -->
	<button
		class="bookmark-btn"
		class:active={isCurrentBookmarked}
		onclick={toggleBookmark}
		disabled={!conversationId}
		title={isCurrentBookmarked ? '取消收藏' : '收藏对话'}
		aria-label={isCurrentBookmarked ? '取消收藏' : '收藏对话'}
	>
		<svg
			class="bookmark-icon"
			viewBox="0 0 24 24"
			fill={isCurrentBookmarked ? 'currentColor' : 'none'}
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
		</svg>
	</button>

	<!-- 收藏列表按钮 -->
	<button
		class="list-btn"
		class:active={isPanelOpen}
		onclick={togglePanel}
		title="收藏列表"
		aria-label="收藏列表"
		aria-expanded={isPanelOpen}
	>
		<svg
			class="list-icon"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<line x1="8" y1="6" x2="21" y2="6"/>
			<line x1="8" y1="12" x2="21" y2="12"/>
			<line x1="8" y1="18" x2="21" y2="18"/>
			<line x1="3" y1="6" x2="3.01" y2="6"/>
			<line x1="3" y1="12" x2="3.01" y2="12"/>
			<line x1="3" y1="18" x2="3.01" y2="18"/>
		</svg>
		{#if allBookmarks.length > 0}
			<span class="count-badge">{allBookmarks.length}</span>
		{/if}
	</button>

	<!-- 收藏列表面板 -->
	{#if isPanelOpen}
		<div class="bookmarks-panel" role="dialog" aria-label="收藏列表">
			<!-- 面板头部 -->
			<div class="panel-header">
				<h3 class="panel-title">收藏对话</h3>
				<span class="count-info">{allBookmarks.length} / {bookmarksStore.maxBookmarks}</span>
			</div>

			<!-- 面板内容 -->
			<div class="panel-content">
				{#if allBookmarks.length === 0}
					<!-- 空状态 -->
					<div class="empty-state">
						<div class="empty-icon">📚</div>
						<p class="empty-text">暂无收藏</p>
						<p class="empty-hint">点击书签图标收藏重要对话</p>
					</div>
				{:else}
					<!-- 收藏列表 -->
					<ul class="bookmark-list" role="listbox">
						{#each allBookmarks as bookmark (bookmark.id)}
							<li
								class="bookmark-item"
								class:current={bookmark.conversationId === conversationId}
								onclick={() => handleSelectBookmark(bookmark)}
								onkeydown={(e) => e.key === 'Enter' && handleSelectBookmark(bookmark)}
								role="option"
								aria-selected={bookmark.conversationId === conversationId}
								tabindex="0"
							>
								<div class="item-content">
									<span class="item-title">{bookmark.title}</span>
									{#if bookmark.preview}
										<p class="item-preview">{bookmark.preview}</p>
									{/if}
									<span class="item-meta">
										<span class="item-channel">{bookmark.channelId}</span>
										<span class="item-date">{formatDate(bookmark.createdAt)}</span>
									</span>
								</div>
								<button
									class="remove-btn"
									onclick={(e) => handleRemoveBookmark(e, bookmark.id)}
									title="移除收藏"
									aria-label="移除收藏"
								>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<line x1="18" y1="6" x2="6" y2="18"/>
										<line x1="6" y1="6" x2="18" y2="18"/>
									</svg>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<!-- 面板底部 -->
			{#if allBookmarks.length > 0}
				<div class="panel-footer">
					<button
						class="clear-btn"
						onclick={() => bookmarksStore.clearAll()}
					>
						清除全部
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* ============================================
	   主容器
	   ============================================ */
	.bookmark-manager {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	/* ============================================
	   按钮通用样式 - 温暖亲切
	   ============================================ */
	.bookmark-btn,
	.list-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-md);
		border: none;
		background: transparent;
		color: var(--color-fg-tertiary);
		cursor: pointer;
		transition: all var(--transition-fast);
		position: relative;
	}

	.bookmark-btn:hover,
	.list-btn:hover {
		background-color: var(--color-bg-tertiary);
		color: var(--color-fg-primary);
		transform: scale(1.05);
	}

	.bookmark-btn:active,
	.list-btn:active {
		transform: scale(0.95);
	}

	.bookmark-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		transform: none;
	}

	/* 焦点状态 */
	.bookmark-btn:focus-visible,
	.list-btn:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	/* 激活状态 - 收藏按钮 */
	.bookmark-btn.active {
		color: var(--color-primary);
		background-color: var(--color-primary-bg);
	}

	.bookmark-btn.active:hover {
		background-color: var(--color-primary-bg);
		color: var(--color-primary-dark);
	}

	/* 激活状态 - 列表按钮 */
	.list-btn.active {
		background-color: var(--color-bg-tertiary);
		color: var(--color-fg-primary);
	}

	/* 图标样式 */
	.bookmark-icon,
	.list-icon {
		width: 20px;
		height: 20px;
		transition: transform var(--transition-fast);
	}

	.bookmark-btn:hover .bookmark-icon {
		transform: scale(1.1);
	}

	/* ============================================
	   计数徽章
	   ============================================ */
	.count-badge {
		position: absolute;
		top: -2px;
		right: -2px;
		min-width: 18px;
		height: 18px;
		padding: 0 4px;
		border-radius: var(--radius-full);
		background: var(--color-primary);
		color: var(--color-fg-inverse);
		font-size: 11px;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-sm);
	}

	/* ============================================
	   收藏列表面板 - 温暖精致
	   ============================================ */
	.bookmarks-panel {
		position: absolute;
		top: calc(100% + var(--space-2));
		right: 0;
		width: 320px;
		max-height: 400px;
		border-radius: var(--radius-lg);
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-lg);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		z-index: 100;
		animation: slide-in 0.2s var(--ease-out);
	}

	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* 面板头部 */
	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border);
		background: linear-gradient(
			to bottom,
			var(--color-bg-secondary) 0%,
			var(--color-bg-elevated) 100%
		);
	}

	.panel-title {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-fg-primary);
		margin: 0;
	}

	.count-info {
		font-size: var(--text-xs);
		color: var(--color-fg-tertiary);
		padding: 2px var(--space-2);
		border-radius: var(--radius-sm);
		background: var(--color-bg-tertiary);
	}

	/* 面板内容 */
	.panel-content {
		flex: 1;
		overflow-y: auto;
		scrollbar-gutter: stable;
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-8) var(--space-4);
		text-align: center;
	}

	.empty-icon {
		font-size: 2.5rem;
		margin-bottom: var(--space-3);
		opacity: 0.6;
	}

	.empty-text {
		font-size: var(--text-sm);
		color: var(--color-fg-secondary);
		margin: 0 0 var(--space-1);
	}

	.empty-hint {
		font-size: var(--text-xs);
		color: var(--color-fg-tertiary);
		margin: 0;
	}

	/* 收藏列表 */
	.bookmark-list {
		list-style: none;
		margin: 0;
		padding: var(--space-2);
	}

	.bookmark-item {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		padding: var(--space-3);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-fast);
		position: relative;
	}

	.bookmark-item:hover {
		background-color: var(--color-bg-tertiary);
	}

	.bookmark-item.current {
		background-color: var(--color-primary-bg);
	}

	.bookmark-item:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 2px var(--color-primary-ring);
	}

	.item-content {
		flex: 1;
		min-width: 0;
	}

	.item-title {
		display: block;
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--color-fg-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-preview {
		font-size: var(--text-xs);
		color: var(--color-fg-tertiary);
		margin: var(--space-1) 0 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.item-meta {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-top: var(--space-1);
	}

	.item-channel {
		font-size: 11px;
		color: var(--color-primary);
		padding: 1px var(--space-1);
		border-radius: var(--radius-sm);
		background: var(--color-primary-bg);
		text-transform: capitalize;
	}

	.item-date {
		font-size: 11px;
		color: var(--color-fg-muted);
	}

	/* 删除按钮 */
	.remove-btn {
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		border-radius: var(--radius-sm);
		border: none;
		background: transparent;
		color: var(--color-fg-muted);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: all var(--transition-fast);
	}

	.bookmark-item:hover .remove-btn {
		opacity: 1;
	}

	.remove-btn:hover {
		background-color: var(--color-error-bg);
		color: var(--color-error);
	}

	.remove-btn:focus-visible {
		opacity: 1;
		outline: none;
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	.remove-btn svg {
		width: 14px;
		height: 14px;
	}

	/* 面板底部 */
	.panel-footer {
		padding: var(--space-2) var(--space-3);
		border-top: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
	}

	.clear-btn {
		width: 100%;
		padding: var(--space-2);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		background: transparent;
		color: var(--color-fg-tertiary);
		font-size: var(--text-xs);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.clear-btn:hover {
		background-color: var(--color-error-bg);
		border-color: var(--color-error);
		color: var(--color-error);
	}

	/* ============================================
	   滚动条样式
	   ============================================ */
	.panel-content::-webkit-scrollbar {
		width: 6px;
	}

	.panel-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.panel-content::-webkit-scrollbar-thumb {
		background: var(--color-neutral-300);
		border-radius: 3px;
	}

	.panel-content::-webkit-scrollbar-thumb:hover {
		background: var(--color-neutral-400);
	}

	/* ============================================
	   Reduced Motion 支持
	   ============================================ */
	@media (prefers-reduced-motion: reduce) {
		.bookmark-btn,
		.list-btn,
		.bookmark-icon,
		.list-icon,
		.bookmarks-panel,
		.bookmark-item,
		.remove-btn {
			transition-duration: 0.01ms !important;
		}

		.bookmarks-panel {
			animation: none;
		}
	}
</style>
