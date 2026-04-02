<script lang="ts">
	/**
	 * HistoryPanel 组件
	 * 
	 * 历史记录主面板 - 温暖亲切的设计风格
	 * - 显示历史对话列表（最近 100 条）
	 * - 支持搜索过滤
	 * - 删除单个对话（硬删除）
	 * - 清空所有历史
	 * - 使用设计系统的 CSS variables
	 */
	import { historyStore, type ConversationHistory } from '$lib/stores/history.svelte';
	import HistoryItem from './HistoryItem.svelte';
	import { onMount } from 'svelte';

	// Props
	interface Props {
		/** 当前激活的对话 ID */
		activeConversationId?: string;
		/** 点击对话的回调 */
		onSelectConversation?: (conversation: ConversationHistory) => void;
		/** 自定义类名 */
		class?: string;
	}

	let {
		activeConversationId = '',
		onSelectConversation,
		class: className = ''
	}: Props = $props();

	// 搜索关键词
	let searchInput = $state('');

	// 加载状态
	let isLoading = $state(true);

	// 初始化
	onMount(() => {
		historyStore.init();
		isLoading = false;
	});

	// 获取过滤后的对话列表
	let filteredConversations = $derived(() => {
		historyStore.setSearchQuery(searchInput);
		return historyStore.filteredConversations;
	});

	// 获取总数
	let totalCount = $derived(historyStore.totalCount);

	// 是否为空
	let isEmpty = $derived(historyStore.isEmpty);

	// 处理搜索输入
	function handleSearchInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		searchInput = target.value;
	}

	// 清空搜索
	function clearSearch(): void {
		searchInput = '';
	}

	// 处理对话点击
	function handleConversationClick(conversation: ConversationHistory): void {
		onSelectConversation?.(conversation);
	}

	// 处理删除对话
	function handleDeleteConversation(id: string): void {
		historyStore.deleteConversation(id);
	}

	// 清空所有历史
	function handleClearAll(): void {
		if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
			historyStore.clearAll();
		}
	}

	// 格式化统计信息
	function formatStats(): string {
		if (searchInput) {
			const filtered = filteredConversations();
			return `显示 ${filtered.length} / ${totalCount} 条`;
		}
		return `共 ${totalCount} 条记录`;
	}
</script>

<div class="history-panel {className}">
	<!-- 头部区域 -->
	<header class="panel-header">
		<div class="header-top">
			<h2 class="panel-title">历史记录</h2>
			{#if totalCount > 0}
				<span class="stats-badge">{formatStats()}</span>
			{/if}
		</div>

		<!-- 搜索框 -->
		{#if totalCount > 0}
			<div class="search-container">
				<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8"/>
					<path d="m21 21-4.35-4.35"/>
				</svg>
				<input
					type="text"
					class="search-input"
					placeholder="搜索对话..."
					value={searchInput}
					oninput={handleSearchInput}
					aria-label="搜索历史记录"
				/>
				{#if searchInput}
					<button
						class="clear-search-btn"
						onclick={clearSearch}
						aria-label="清空搜索"
						title="清空搜索"
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="18" y1="6" x2="6" y2="18"/>
							<line x1="6" y1="6" x2="18" y2="18"/>
						</svg>
					</button>
				{/if}
			</div>
		{/if}
	</header>

	<!-- 内容区域 -->
	<div class="panel-content">
		{#if isLoading}
			<!-- 加载状态 -->
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<p class="loading-text">加载中...</p>
			</div>
		{:else if isEmpty}
			<!-- 空状态 -->
			<div class="empty-state">
				<div class="empty-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
				</div>
				<p class="empty-title">暂无历史记录</p>
				<p class="empty-hint">开始新对话后，历史记录将显示在这里</p>
			</div>
		{:else if filteredConversations().length === 0}
			<!-- 搜索无结果 -->
			<div class="no-results-state">
				<div class="no-results-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
					</svg>
				</div>
				<p class="no-results-title">未找到匹配的对话</p>
				<p class="no-results-hint">尝试其他关键词或清空搜索</p>
				<button class="retry-btn" onclick={clearSearch}>
					清空搜索
				</button>
			</div>
		{:else}
			<!-- 对话列表 -->
			<ul class="conversation-list" role="list">
				{#each filteredConversations() as conversation (conversation.id)}
					<li class="conversation-item">
						<HistoryItem
							conversation={conversation}
							active={conversation.id === activeConversationId}
							onclick={() => handleConversationClick(conversation)}
							ondelete={() => handleDeleteConversation(conversation.id)}
						/>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<!-- 底部操作区 -->
	{#if totalCount > 0}
		<footer class="panel-footer">
			<button
				class="clear-all-btn"
				onclick={handleClearAll}
				disabled={isEmpty}
				title="清空所有历史记录"
			>
				<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
				</svg>
				<span>清空全部</span>
			</button>
		</footer>
	{/if}
</div>

<style>
	/* ============================================
	   主容器
	   ============================================ */
	.history-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: var(--color-bg-primary);
		border-radius: var(--radius-xl);
		overflow: hidden;
	}

	/* ============================================
	   头部区域
	   ============================================ */
	.panel-header {
		flex-shrink: 0;
		padding: var(--space-4);
		border-bottom: 1px solid var(--color-border);
		background: linear-gradient(
			to bottom,
			var(--color-bg-secondary) 0%,
			var(--color-bg-primary) 100%
		);
	}

	.header-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-3);
	}

	.panel-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-fg-primary);
		margin: 0;
		letter-spacing: -0.01em;
	}

	.stats-badge {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-fg-tertiary);
		padding: 0.25rem var(--space-2);
		background-color: var(--color-bg-tertiary);
		border-radius: var(--radius-sm);
	}

	/* ============================================
	   搜索框
	   ============================================ */
	.search-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: var(--space-3);
		width: 18px;
		height: 18px;
		color: var(--color-fg-muted);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		height: 40px;
		padding: 0 var(--space-3);
		padding-left: calc(var(--space-3) + 24px);
		padding-right: calc(var(--space-3) + 24px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-elevated);
		color: var(--color-fg-primary);
		font-size: 0.875rem;
		transition: all var(--transition-fast);
	}

	.search-input::placeholder {
		color: var(--color-fg-muted);
	}

	.search-input:hover {
		border-color: var(--color-border-hover);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px var(--color-primary-ring);
	}

	.clear-search-btn {
		position: absolute;
		right: var(--space-2);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border: none;
		border-radius: var(--radius-sm);
		background-color: transparent;
		color: var(--color-fg-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.clear-search-btn:hover {
		background-color: var(--color-bg-tertiary);
		color: var(--color-fg-primary);
	}

	.clear-search-btn:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	.clear-search-btn svg {
		width: 14px;
		height: 14px;
	}

	/* ============================================
	   内容区域
	   ============================================ */
	.panel-content {
		flex: 1;
		overflow-y: auto;
		scrollbar-gutter: stable;
		overscroll-behavior: contain;
	}

	/* ============================================
	   加载状态
	   ============================================ */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-12) var(--space-4);
		gap: var(--space-3);
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-bg-tertiary);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.loading-text {
		font-size: 0.875rem;
		color: var(--color-fg-secondary);
		margin: 0;
	}

	/* ============================================
	   空状态
	   ============================================ */
	.empty-state,
	.no-results-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-12) var(--space-4);
		text-align: center;
	}

	.empty-icon,
	.no-results-icon {
		width: 64px;
		height: 64px;
		margin-bottom: var(--space-4);
		color: var(--color-fg-muted);
		opacity: 0.5;
	}

	.empty-title,
	.no-results-title {
		font-size: 1rem;
		font-weight: 500;
		color: var(--color-fg-primary);
		margin: 0 0 var(--space-2);
	}

	.empty-hint,
	.no-results-hint {
		font-size: 0.875rem;
		color: var(--color-fg-tertiary);
		margin: 0;
		max-width: 240px;
	}

	.retry-btn {
		margin-top: var(--space-4);
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: transparent;
		color: var(--color-fg-secondary);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.retry-btn:hover {
		background-color: var(--color-bg-tertiary);
		border-color: var(--color-border-hover);
		color: var(--color-fg-primary);
	}

	.retry-btn:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	/* ============================================
	   对话列表
	   ============================================ */
	.conversation-list {
		list-style: none;
		margin: 0;
		padding: var(--space-2);
	}

	.conversation-item {
		margin-bottom: var(--space-1);
	}

	.conversation-item:last-child {
		margin-bottom: 0;
	}

	/* ============================================
	   底部操作区
	   ============================================ */
	.panel-footer {
		flex-shrink: 0;
		padding: var(--space-3) var(--space-4);
		border-top: 1px solid var(--color-border);
		background-color: var(--color-bg-secondary);
	}

	.clear-all-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: transparent;
		color: var(--color-fg-tertiary);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.clear-all-btn:hover:not(:disabled) {
		background-color: var(--color-error-bg);
		border-color: var(--color-error);
		color: var(--color-error);
	}

	.clear-all-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.clear-all-btn:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	.btn-icon {
		width: 16px;
		height: 16px;
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
		.loading-spinner {
			animation-duration: 0.01ms !important;
		}

		.search-input,
		.clear-search-btn,
		.clear-all-btn,
		.retry-btn,
		.conversation-item {
			transition-duration: 0.01ms !important;
		}
	}
</style>
