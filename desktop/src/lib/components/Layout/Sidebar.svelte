<script lang="ts">
	/**
	 * Sidebar 组件
	 * 
	 * 显示历史对话记录面板
	 * - 新建对话按钮
	 * - 历史对话列表
	 * - 设置入口
	 */
	import { sidebarExpanded, currentView, toggleSidebar, setView } from '$lib/stores/app';
	import { appStore } from '$lib/stores/app.svelte';
	import { historyStore, type ConversationHistory } from '$lib/stores/history.svelte';
	import { onMount } from 'svelte';

	// 当前选中的对话 ID
	let activeConversationId = $state<string>('');

	// 组件挂载时初始化历史记录
	onMount(() => {
		historyStore.init();
	});

	// 图标组件 - 新建对话
	function NewChatIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M12 5v14M5 12h14"/>
		</svg>`;
	}

	// 图标组件 - 设置
	function SettingsIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="3"/>
			<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
		</svg>`;
	}

	// 图标组件 - 收起/展开
	function ChevronLeftIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="m15 18-6-6 6-6"/>
		</svg>`;
	}

	function ChevronRightIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="m9 18 6-6-6-6"/>
		</svg>`;
	}

	// 图标组件 - 历史
	function HistoryIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="10"/>
			<polyline points="12 6 12 12 16 14"/>
		</svg>`;
	}

	// 新建对话
	function handleNewChat() {
		// 清除当前选中的对话
		activeConversationId = '';
		// 请求新建对话（会触发 ChatView 清除消息）
		appStore.requestNewChat();
		console.log('新建对话');
	}

	// 选择对话
	function handleSelectConversation(conversation: ConversationHistory) {
		activeConversationId = conversation.id;
		// 同步到全局状态
		appStore.setCurrentConversationId(conversation.id);
		// 切换到聊天视图
		setView('chat');
		console.log('选择对话:', conversation.title);
		// TODO: 加载对话内容（需要持久化消息）
	}

	// 删除对话
	function handleDeleteConversation(id: string) {
		historyStore.deleteConversation(id);
		// 如果删除的是当前对话，清除选中状态
		if (activeConversationId === id) {
			activeConversationId = '';
		}
	}

	// 格式化相对时间
	function formatRelativeTime(date: Date): string {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (minutes < 1) return '刚刚';
		if (minutes < 60) return `${minutes}分钟前`;
		if (hours < 24) return `${hours}小时前`;
		if (days < 7) return `${days}天前`;
		return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
	}
</script>

<aside
	class="sidebar"
	class:expanded={$sidebarExpanded}
	style:width={$sidebarExpanded ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)'}
>
	<!-- 头部: Logo 和折叠按钮 -->
	<div class="sidebar-header">
		<div class="logo">
			<div class="logo-icon">
				<span class="logo-emoji">🤖</span>
			</div>
			<span class="logo-text" class:hidden={!$sidebarExpanded}>nanobot</span>
		</div>
		<button
			class="toggle-btn"
			onclick={() => toggleSidebar()}
			title={$sidebarExpanded ? '收起侧边栏' : '展开侧边栏'}
			aria-label={$sidebarExpanded ? '收起侧边栏' : '展开侧边栏'}
		>
			{#if $sidebarExpanded}
				{@html ChevronLeftIcon({ class: 'w-4 h-4' })}
			{:else}
				{@html ChevronRightIcon({ class: 'w-4 h-4' })}
			{/if}
		</button>
	</div>

	<!-- 新建对话按钮 -->
	<div class="new-chat-section">
		<button
			class="new-chat-btn"
			onclick={handleNewChat}
			title="新建对话"
			aria-label="新建对话"
		>
			<div class="btn-icon">
				{@html NewChatIcon({ class: 'w-5 h-5' })}
			</div>
			<span class="btn-text" class:hidden={!$sidebarExpanded}>新建对话</span>
		</button>
	</div>

	<!-- 历史记录列表 -->
	<nav class="history-list" aria-label="历史记录">
		<div class="section-title" class:hidden={!$sidebarExpanded}>
			{@html HistoryIcon({ class: 'w-3.5 h-3.5' })}
			<span>历史记录</span>
		</div>
		
		{#if $sidebarExpanded}
			{#if historyStore.isEmpty}
				<div class="empty-state">
					<span class="empty-icon">💬</span>
					<span class="empty-text">暂无历史记录</span>
				</div>
			{:else}
				<ul class="conversation-list">
					{#each historyStore.conversations as conversation (conversation.id)}
						<li>
							<div
								class="history-item"
								class:active={conversation.id === activeConversationId}
								onclick={() => handleSelectConversation(conversation)}
								onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectConversation(conversation); }}
								title={conversation.title}
								role="button"
								tabindex="0"
							>
								<div class="item-content">
									<span class="item-title">{conversation.title}</span>
									<span class="item-time">{formatRelativeTime(conversation.updatedAt)}</span>
								</div>
								<button
									class="delete-btn"
									onclick={(e) => { e.stopPropagation(); handleDeleteConversation(conversation.id); }}
									title="删除"
									aria-label="删除对话"
								>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5">
										<path d="M18 6L6 18M6 6l12 12"/>
									</svg>
								</button>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		{:else}
			<!-- 折叠状态：只显示图标按钮 -->
			<div class="collapsed-actions">
				<button
					class="collapsed-btn"
					onclick={handleNewChat}
					title="新建对话"
				>
					{@html NewChatIcon({ class: 'w-5 h-5' })}
				</button>
			</div>
		{/if}
	</nav>

	<!-- 底部: 设置入口 -->
	<div class="sidebar-footer">
		<button
			class="settings-btn"
			class:active={$currentView === 'settings'}
			onclick={() => setView('settings')}
			title="设置"
			aria-label="设置"
		>
			<div class="settings-icon">
				{@html SettingsIcon({ class: 'w-5 h-5' })}
			</div>
			<span class="settings-text" class:hidden={!$sidebarExpanded}>设置</span>
		</button>
	</div>
</aside>

<style>
	/* ============================================
	   侧边栏容器 - 温暖柔和背景
	   ============================================ */
	.sidebar {
		display: flex;
		flex-direction: column;
		background-color: var(--color-bg-secondary);
		border-right: 1px solid var(--color-border);
		transition: width var(--duration-normal) var(--ease-out);
		overflow: hidden;
		flex-shrink: 0;
		transform: translateZ(0);
		will-change: width;
		contain: layout style;
		box-shadow: var(--shadow-sm);
	}

	/* ============================================
	   头部区域
	   ============================================ */
	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4);
		border-bottom: 1px solid var(--color-border);
		background-image: linear-gradient(
			to bottom,
			transparent 0%,
			var(--color-bg-overlay) 100%
		);
	}

	/* ============================================
	   Logo 区域
	   ============================================ */
	.logo {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		overflow: hidden;
	}

	.logo-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-lg);
		background: linear-gradient(
			135deg,
			var(--color-brand-400) 0%,
			var(--color-brand-500) 50%,
			var(--color-brand-600) 100%
		);
		box-shadow: var(--shadow-md),
		            0 0 0 1px color-mix(in srgb, var(--color-brand-300) 30%, transparent);
		flex-shrink: 0;
		transition: transform var(--transition-fast),
		            box-shadow var(--transition-fast);
	}

	.logo:hover .logo-icon {
		transform: scale(1.05);
		box-shadow: var(--shadow-lg),
		            0 0 0 1px color-mix(in srgb, var(--color-brand-300) 50%, transparent);
	}

	.logo-emoji {
		font-size: 1.375rem;
		filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
	}

	.logo-text {
		font-family: var(--font-sans);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--color-fg-primary);
		white-space: nowrap;
		letter-spacing: var(--tracking-tight);
		transition: opacity var(--duration-fast) var(--ease-out),
		            transform var(--duration-fast) var(--ease-out);
		transform-origin: left center;
	}

	.sidebar:not(.expanded) .logo-text {
		opacity: 0;
		transform: translateX(-8px);
	}

	/* ============================================
	   折叠按钮
	   ============================================ */
	.toggle-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		border: none;
		background: transparent;
		color: var(--color-fg-tertiary);
		cursor: pointer;
		transition: all var(--transition-fast);
		flex-shrink: 0;
	}

	.toggle-btn:hover {
		background-color: var(--color-bg-tertiary);
		color: var(--color-fg-primary);
		transform: scale(1.05);
	}

	.toggle-btn:active {
		transform: scale(0.95);
	}

	.toggle-btn:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	/* ============================================
	   新建对话按钮区域
	   ============================================ */
	.new-chat-section {
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--color-border);
	}

	.new-chat-btn {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-lg);
		border: 1px dashed var(--color-border);
		background: transparent;
		color: var(--color-fg-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: left;
	}

	.new-chat-btn:hover {
		border-color: var(--color-brand-400);
		background-color: var(--color-brand-50);
		color: var(--color-brand-600);
	}

	.new-chat-btn:active {
		transform: scale(0.98);
	}

	.new-chat-btn:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	.btn-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		background-color: var(--color-bg-tertiary);
		flex-shrink: 0;
		transition: background-color var(--transition-fast);
	}

	.new-chat-btn:hover .btn-icon {
		background-color: var(--color-brand-100);
	}

	.btn-text {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: 500;
		white-space: nowrap;
		transition: opacity var(--transition-fast);
	}

	/* ============================================
	   历史记录列表区域
	   ============================================ */
	.history-list {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-2);
		scrollbar-gutter: stable;
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wider);
		color: var(--color-fg-tertiary);
		padding: var(--space-2) var(--space-3) var(--space-3);
		white-space: nowrap;
		transition: opacity var(--transition-fast);
	}

	.section-title.hidden {
		opacity: 0;
		pointer-events: none;
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-8) var(--space-4);
		gap: var(--space-2);
		text-align: center;
	}

	.empty-icon {
		font-size: 2rem;
		opacity: 0.5;
	}

	.empty-text {
		font-size: var(--text-sm);
		color: var(--color-fg-muted);
	}

	/* 对话列表 */
	.conversation-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	/* 历史记录项 */
	.history-item {
		display: flex;
		align-items: center;
		width: 100%;
		padding: var(--space-2) var(--space-3);
		padding-right: var(--space-8);
		border-radius: var(--radius-md);
		border: none;
		background: transparent;
		color: var(--color-fg-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: left;
		position: relative;
	}

	.history-item:hover {
		background-color: var(--color-bg-tertiary);
		color: var(--color-fg-primary);
	}

	.history-item.active {
		background: linear-gradient(
			135deg,
			var(--color-brand-500) 0%,
			var(--color-brand-600) 100%
		);
		color: var(--color-fg-inverse);
		box-shadow: var(--shadow-sm);
	}

	.history-item:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	.item-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.item-title {
		font-size: var(--text-sm);
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-time {
		font-size: var(--text-xs);
		color: var(--color-fg-muted);
	}

	.history-item.active .item-time {
		color: color-mix(in srgb, var(--color-fg-inverse) 70%, transparent);
	}

	/* 删除按钮 */
	.delete-btn {
		position: absolute;
		right: var(--space-2);
		top: 50%;
		transform: translateY(-50%);
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

	.history-item.active .delete-btn {
		color: color-mix(in srgb, var(--color-fg-inverse) 60%, transparent);
	}

	.history-item.active .delete-btn:hover {
		background-color: color-mix(in srgb, var(--color-fg-inverse) 20%, transparent);
		color: var(--color-fg-inverse);
	}

	/* 折叠状态的操作按钮 */
	.collapsed-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2);
	}

	.collapsed-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-md);
		border: none;
		background-color: var(--color-bg-tertiary);
		color: var(--color-fg-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.collapsed-btn:hover {
		background-color: var(--color-bg-elevated);
		color: var(--color-fg-primary);
		transform: scale(1.05);
	}

	.collapsed-btn:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	/* ============================================
	   底部区域
	   ============================================ */
	.sidebar-footer {
		padding: var(--space-3);
		border-top: 1px solid var(--color-border);
		background-image: linear-gradient(
			to top,
			transparent 0%,
			var(--color-bg-overlay) 100%
		);
	}

	/* ============================================
	   设置按钮
	   ============================================ */
	.settings-btn {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-lg);
		border: none;
		background: transparent;
		color: var(--color-fg-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: left;
	}

	.settings-btn:hover {
		background-color: var(--color-bg-tertiary);
		color: var(--color-fg-primary);
		transform: translateX(2px);
	}

	.settings-btn:active {
		transform: translateX(0) scale(0.98);
	}

	.settings-btn.active {
		background-color: var(--color-bg-tertiary);
		color: var(--color-primary);
	}

	.settings-btn:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	.settings-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-md);
		background-color: var(--color-bg-tertiary);
		flex-shrink: 0;
		transition: transform var(--transition-fast),
		            background-color var(--transition-fast);
	}

	.settings-btn:hover .settings-icon {
		transform: rotate(15deg);
		background-color: var(--color-bg-elevated);
	}

	.settings-text {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: 500;
		white-space: nowrap;
		transition: opacity var(--transition-fast);
	}

	/* ============================================
	   通用隐藏类
	   ============================================ */
	.hidden {
		opacity: 0;
		pointer-events: none;
	}

	.logo-text.hidden {
		opacity: 0;
		transform: translateX(-8px);
	}

	.btn-text.hidden {
		opacity: 0;
		width: 0;
		padding: 0;
	}

	.settings-text.hidden {
		opacity: 0;
		width: 0;
		padding: 0;
	}

	.section-title.hidden {
		opacity: 0;
		height: 0;
		padding: 0;
		overflow: hidden;
	}

	/* ============================================
	   滚动条样式
	   ============================================ */
	.history-list::-webkit-scrollbar {
		width: 6px;
	}

	.history-list::-webkit-scrollbar-track {
		background: transparent;
	}

	.history-list::-webkit-scrollbar-thumb {
		background: var(--color-neutral-300);
		border-radius: 3px;
	}

	.history-list::-webkit-scrollbar-thumb:hover {
		background: var(--color-neutral-400);
	}

	@media (prefers-color-scheme: dark) {
		.history-list::-webkit-scrollbar-thumb {
			background: var(--color-neutral-600);
		}

		.history-list::-webkit-scrollbar-thumb:hover {
			background: var(--color-neutral-500);
		}
	}

	/* ============================================
	   Reduced Motion 支持
	   ============================================ */
	@media (prefers-reduced-motion: reduce) {
		.sidebar,
		.logo-icon,
		.toggle-btn,
		.new-chat-btn,
		.history-item,
		.settings-btn,
		.settings-icon,
		.logo-text,
		.btn-text,
		.settings-text,
		.section-title {
			transition-duration: 0.01ms !important;
		}
	}
</style>
