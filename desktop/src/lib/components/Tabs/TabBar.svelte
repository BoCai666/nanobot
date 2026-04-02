<script lang="ts">
	/**
	 * TabBar 组件 - 标签栏容器
	 * 
	 * 管理多个标签页的显示和交互
	 * - 新增标签页按钮
	 * - 标签页列表
	 * - 溢出处理
	 */
	import { tabsStore, type Tab } from '$lib/stores/tabs.svelte';
	import { channels } from '$lib/stores/app';
	import TabComponent from './Tab.svelte';

	// Props
	interface Props {
		onTabChange?: (tab: Tab | null) => void;
		onNewTab?: () => void;
	}

	let { onTabChange, onNewTab }: Props = $props();

	// 滚动容器引用
	let scrollContainer: HTMLElement | undefined = $state();

	// 处理标签页激活
	function handleActivate(tabId: string) {
		tabsStore.activateTab(tabId);
		onTabChange?.(tabsStore.activeTab());
	}

	// 处理标签页关闭
	function handleClose(tabId: string) {
		tabsStore.closeTab(tabId);
		onTabChange?.(tabsStore.activeTab());
	}

	// 处理新建标签页
	function handleNewTab() {
		// 找到第一个可用的 channel
		const availableChannels = $channels.filter(ch => ch.connected);
		const defaultChannel = availableChannels[0]?.id || 'telegram';
		
		tabsStore.openChannelTab(defaultChannel);
		onTabChange?.(tabsStore.activeTab());
		onNewTab?.();
	}

	// 向左滚动
	function scrollLeft() {
		if (scrollContainer) {
			scrollContainer.scrollBy({ left: -150, behavior: 'smooth' });
		}
	}

	// 向右滚动
	function scrollRight() {
		if (scrollContainer) {
			scrollContainer.scrollBy({ left: 150, behavior: 'smooth' });
		}
	}
</script>

<div class="tab-bar">
	<!-- 标签页列表 -->
	<div class="tabs-scroll-container" bind:this={scrollContainer}>
		<div class="tabs-list" role="tablist">
			{#each tabsStore.tabs as tab (tab.id)}
				<TabComponent
					{tab}
					onActivate={handleActivate}
					onClose={handleClose}
				/>
			{/each}
		</div>
	</div>

	<!-- 新建标签页按钮 -->
	<button
		class="new-tab-btn"
		onclick={handleNewTab}
		title="新建对话标签页"
		aria-label="新建对话标签页"
	>
		<svg class="new-tab-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M8 2v12M2 8h12"/>
		</svg>
	</button>

	<!-- 底部装饰线 -->
	<div class="tab-bar-border"></div>
</div>

<style>
	/* ============================================
	   标签栏容器 - 温暖背景
	   ============================================ */
	.tab-bar {
		position: relative;
		display: flex;
		align-items: flex-end;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-3);
		padding-bottom: 0;
		background: linear-gradient(
			to bottom,
			var(--color-bg-primary) 0%,
			var(--color-bg-secondary) 100%
		);
		/* 底部阴影 */
		box-shadow: inset 0 -1px 0 var(--color-border);
	}

	/* ============================================
	   标签页滚动容器
	   ============================================ */
	.tabs-scroll-container {
		flex: 1;
		overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* IE/Edge */
	}

	.tabs-scroll-container::-webkit-scrollbar {
		display: none; /* Chrome/Safari */
	}

	/* 标签页列表 */
	.tabs-list {
		display: flex;
		align-items: flex-end;
		gap: 2px;
		min-width: min-content;
	}

	/* ============================================
	   新建标签页按钮 - 温润精致
	   ============================================ */
	.new-tab-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		border-radius: var(--radius-md);
		background-color: transparent;
		color: var(--color-fg-tertiary);
		cursor: pointer;
		transition: all var(--transition-fast);
		flex-shrink: 0;
	}

	.new-tab-btn:hover {
		background-color: var(--color-bg-tertiary);
		color: var(--color-primary);
		transform: scale(1.05);
	}

	.new-tab-btn:active {
		transform: scale(0.95);
	}

	.new-tab-btn:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	.new-tab-icon {
		width: 16px;
		height: 16px;
	}

	/* ============================================
	   底部装饰线 - 连接标签页与内容区
	   ============================================ */
	.tab-bar-border {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: var(--color-border);
		z-index: 0;
	}

	/* ============================================
	   响应式适配
	   ============================================ */
	@media (max-width: 640px) {
		.tab-bar {
			padding: var(--space-1) var(--space-2);
		}

		.new-tab-btn {
			width: 32px;
			height: 32px;
		}
	}

	/* ============================================
	   Reduced Motion 支持
	   ============================================ */
	@media (prefers-reduced-motion: reduce) {
		.new-tab-btn {
			transition-duration: 0.01ms !important;
		}
	}
</style>
