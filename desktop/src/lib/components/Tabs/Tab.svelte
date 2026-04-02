<script lang="ts">
	/**
	 * Tab 组件 - 单个标签页
	 * 
	 * 温暖精致的标签页设计
	 * - 激活状态：品牌色渐变背景
	 * - 悬停效果：微妙上浮
	 * - 关闭按钮：悬停时显示
	 */
	import type { Tab as TabType } from '$lib/stores/tabs.svelte';

	// Props
	interface Props {
		tab: TabType;
		onActivate: (tabId: string) => void;
		onClose: (tabId: string) => void;
		showCloseButton?: boolean;
	}

	let {
		tab,
		onActivate,
		onClose,
		showCloseButton = true
	}: Props = $props();

	// 悬停状态
	let isHovered = $state(false);

	// 处理点击
	function handleClick(e: MouseEvent) {
		e.stopPropagation();
		onActivate(tab.id);
	}

	// 处理关闭
	function handleClose(e: MouseEvent) {
		e.stopPropagation();
		onClose(tab.id);
	}

	// 阻止关闭按钮的双击选中
	function handleCloseMouseDown(e: MouseEvent) {
		e.preventDefault();
	}
</script>

<div
	class="tab"
	class:active={tab.isActive}
	class:hovered={isHovered}
	onclick={handleClick}
	onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onActivate(tab.id); } }}
	onmouseenter={() => isHovered = true}
	onmouseleave={() => isHovered = false}
	role="tab"
	aria-selected={tab.isActive}
	aria-label="{tab.title} 标签页"
	tabindex="0"
>
	<!-- 标签标题 -->
	<span class="tab-title">{tab.title}</span>
	
	<!-- 关闭按钮 -->
	{#if showCloseButton}
		<button
			class="close-btn"
			class:visible={isHovered || tab.isActive}
			onclick={handleClose}
			onmousedown={handleCloseMouseDown}
			aria-label="关闭 {tab.title} 标签页"
			title="关闭标签页"
		>
			<svg class="close-icon" viewBox="0 0 16 16" fill="currentColor">
				<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
			</svg>
		</button>
	{/if}
</div>

<style>
	/* ============================================
	   标签页容器 - 温暖精致
	   ============================================ */
	.tab {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		min-width: 100px;
		max-width: 180px;
		height: 36px;
		border: none;
		border-radius: var(--radius-lg) var(--radius-lg) 0 0;
		background-color: var(--color-bg-secondary);
		color: var(--color-fg-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		overflow: hidden;
		/* 底部连接线 */
		box-shadow: inset 0 -1px 0 var(--color-border);
	}

	/* 悬停效果 - 温暖上浮 */
	.tab:hover {
		background-color: var(--color-bg-tertiary);
		color: var(--color-fg-primary);
		transform: translateY(-2px);
		box-shadow: inset 0 -1px 0 var(--color-border),
		            0 2px 8px -4px var(--color-primary-shadow);
	}

	/* 激活状态 - 品牌色渐变 */
	.tab.active {
		background: linear-gradient(
			135deg,
			var(--color-brand-500) 0%,
			var(--color-brand-600) 100%
		);
		color: var(--color-fg-inverse);
		box-shadow: inset 0 -1px 0 transparent,
		            0 2px 8px -2px var(--color-primary-shadow);
		z-index: 1;
	}

	.tab.active:hover {
		background: linear-gradient(
			135deg,
			var(--color-brand-600) 0%,
			var(--color-brand-700) 100%
		);
		transform: translateY(0);
	}

	/* ============================================
	   标签标题
	   ============================================ */
	.tab-title {
		flex: 1;
		font-size: var(--text-sm);
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-align: left;
	}

	/* ============================================
	   关闭按钮 - 温润精致
	   ============================================ */
	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		padding: 0;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: inherit;
		cursor: pointer;
		opacity: 0;
		transform: scale(0.8);
		transition: all var(--transition-fast);
		flex-shrink: 0;
	}

	/* 悬停或激活时显示关闭按钮 */
	.close-btn.visible {
		opacity: 0.6;
		transform: scale(1);
	}

	.close-btn:hover {
		opacity: 1;
		background-color: rgba(0, 0, 0, 0.1);
	}

	/* 激活状态下关闭按钮样式 */
	.tab.active .close-btn:hover {
		background-color: rgba(255, 255, 255, 0.2);
	}

	.close-icon {
		width: 12px;
		height: 12px;
	}

	/* ============================================
	   焦点状态
	   ============================================ */
	.tab:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	.close-btn:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	/* ============================================
	   Reduced Motion 支持
	   ============================================ */
	@media (prefers-reduced-motion: reduce) {
		.tab,
		.close-btn {
			transition-duration: 0.01ms !important;
		}
	}
</style>
