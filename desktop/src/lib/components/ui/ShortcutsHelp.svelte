<script lang="ts">
	/**
	 * ShortcutsHelp 组件
	 * 
	 * 键盘快捷键帮助面板
	 * - 显示所有已注册的快捷键
	 * - 支持分组显示
	 * - 平台感知的快捷键显示
	 * - 优雅的动画效果
	 */

	import { cn } from "$lib/utils/cn";
	import {
		ShortcutManager,
		type ShortcutDefinition,
		formatShortcut,
		getModifierKey,
		isMacOS
	} from "$lib/utils/shortcuts";

	// Props
	interface Props {
		/** 是否显示面板 */
		open?: boolean;
		/** 打开状态变化回调 */
		onOpenChange?: (open: boolean) => void;
		/** 快捷键管理器实例 */
		manager?: ShortcutManager;
		/** 自定义样式 */
		class?: string;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		manager,
		class: className
	}: Props = $props();

	// 使用默认管理器或传入的管理器
	let shortcutManager = $state(manager ?? new ShortcutManager());

	// 快捷键列表
	let shortcuts = $state<ShortcutDefinition[]>([]);
	let groupedShortcuts = $state<Map<string, ShortcutDefinition[]>>(new Map());

	// 平台信息
	let platformInfo = $state({
		isMac: false,
		modifierKey: { ctrl: "Ctrl", alt: "Alt", meta: "Win" }
	});

	// 搜索过滤
	let searchQuery = $state("");

	// 过滤后的快捷键
	let filteredShortcuts = $derived(() => {
		if (!searchQuery.trim()) return shortcuts;
		const query = searchQuery.toLowerCase();
		return shortcuts.filter(
			(s) =>
				s.label.toLowerCase().includes(query) ||
				s.description?.toLowerCase().includes(query) ||
				s.group?.toLowerCase().includes(query)
		);
	});

	// 初始化
	$effect(() => {
		// 获取平台信息
		platformInfo = {
			isMac: isMacOS(),
			modifierKey: getModifierKey()
		};

		// 获取快捷键列表
		shortcuts = shortcutManager.getShortcuts();
		groupedShortcuts = shortcutManager.getGroupedShortcuts();
	});

	// 关闭面板
	function closePanel() {
		open = false;
		onOpenChange?.(false);
	}

	// 处理背景点击
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closePanel();
		}
	}

	// 处理键盘事件
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			closePanel();
		}
	}

	// 获取分组排序
	function getSortedGroups(): string[] {
		const order = ["导航", "界面", "帮助", "通用"];
		const groups = Array.from(groupedShortcuts.keys());
		return groups.sort((a, b) => {
			const aIndex = order.indexOf(a);
			const bIndex = order.indexOf(b);
			if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
			if (aIndex === -1) return 1;
			if (bIndex === -1) return -1;
			return aIndex - bIndex;
		});
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="shortcuts-backdrop"
		onclick={handleBackdropClick}
		onkeydown={handleKeyDown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="shortcuts-title"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class={cn("shortcuts-panel", className)}
			onkeydown={handleKeyDown}
		>
			<!-- 头部 -->
			<header class="shortcuts-header">
				<h2 id="shortcuts-title" class="shortcuts-title">
					键盘快捷键
				</h2>
				<p class="shortcuts-subtitle">
					使用快捷键提高效率
					{#if platformInfo.isMac}
						<span class="platform-hint">· macOS</span>
					{:else}
						<span class="platform-hint">· Windows/Linux</span>
					{/if}
				</p>
			</header>

			<!-- 搜索框 -->
			<div class="shortcuts-search">
				<svg
					class="search-icon"
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.3-4.3" />
				</svg>
				<input
					type="text"
					class="search-input"
					placeholder="搜索快捷键..."
					bind:value={searchQuery}
				/>
				{#if searchQuery}
					<button
						class="search-clear"
						onclick={() => (searchQuery = "")}
						aria-label="清除搜索"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
					</button>
				{/if}
			</div>

			<!-- 快捷键列表 -->
			<div class="shortcuts-content">
				{#if filteredShortcuts().length === 0}
					<div class="shortcuts-empty">
						<svg
							class="empty-icon"
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="12" r="10" />
							<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
							<path d="M12 17h.01" />
						</svg>
						<p>未找到匹配的快捷键</p>
					</div>
				{:else if searchQuery}
					<!-- 搜索结果: 平铺显示 -->
					<div class="shortcuts-list">
						{#each filteredShortcuts() as shortcut (shortcut.id)}
							<div class="shortcut-item">
								<div class="shortcut-info">
									<span class="shortcut-label">{shortcut.label}</span>
									{#if shortcut.description}
										<span class="shortcut-desc">{shortcut.description}</span>
									{/if}
								</div>
								<kbd class="shortcut-key">
									{formatShortcut(shortcut)}
								</kbd>
							</div>
						{/each}
					</div>
				{:else}
					<!-- 分组显示 -->
					<div class="shortcuts-groups">
						{#each getSortedGroups() as group}
							<section class="shortcut-group">
								<h3 class="group-title">{group}</h3>
								<div class="group-items">
									{#each groupedShortcuts.get(group) || [] as shortcut (shortcut.id)}
										<div class="shortcut-item">
											<div class="shortcut-info">
												<span class="shortcut-label">{shortcut.label}</span>
												{#if shortcut.description}
													<span class="shortcut-desc">{shortcut.description}</span>
												{/if}
											</div>
											<kbd class="shortcut-key">
												{formatShortcut(shortcut)}
											</kbd>
										</div>
									{/each}
								</div>
							</section>
						{/each}
					</div>
				{/if}
			</div>

			<!-- 底部提示 -->
			<footer class="shortcuts-footer">
				<div class="footer-hint">
					<kbd class="hint-key">Esc</kbd>
					<span>关闭</span>
				</div>
			</footer>

			<!-- 关闭按钮 -->
			<button
				class="shortcuts-close"
				onclick={closePanel}
				aria-label="关闭"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
			</button>
		</div>
	</div>
{/if}

<style>
	/* ============================================
	   Backdrop - 背景遮罩
	   ============================================ */
	.shortcuts-backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;

		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);

		animation: fadeIn 0.15s ease-out;
	}

	/* ============================================
	   Panel - 主面板
	   ============================================ */
	.shortcuts-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 28rem;
		max-height: 80vh;
		overflow: hidden;

		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-xl);

		animation: scaleIn 0.2s ease-out;
	}

	/* ============================================
	   Header - 头部
	   ============================================ */
	.shortcuts-header {
		padding: 1.25rem 1.5rem 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.shortcuts-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-fg-primary);
		letter-spacing: -0.02em;
	}

	.shortcuts-subtitle {
		margin: 0.25rem 0 0;
		font-size: 0.8125rem;
		color: var(--color-fg-secondary);
	}

	.platform-hint {
		color: var(--color-fg-muted);
	}

	/* ============================================
	   Search - 搜索框
	   ============================================ */
	.shortcuts-search {
		position: relative;
		display: flex;
		align-items: center;
		padding: 0.75rem 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.search-icon {
		position: absolute;
		left: 1.5rem;
		color: var(--color-fg-muted);
		pointer-events: none;
	}

	.search-input {
		flex: 1;
		padding: 0.5rem 0.75rem 0.5rem 2rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background-color: var(--color-bg-secondary);
		color: var(--color-fg-primary);
		font-size: 0.875rem;
		outline: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.search-input::placeholder {
		color: var(--color-fg-muted);
	}

	.search-input:focus {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px var(--color-primary-ring);
	}

	.search-clear {
		position: absolute;
		right: 1.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-fg-muted);
		cursor: pointer;
		transition: color 0.15s ease, background-color 0.15s ease;
	}

	.search-clear:hover {
		color: var(--color-fg-primary);
		background-color: var(--color-bg-tertiary);
	}

	/* ============================================
	   Content - 内容区
	   ============================================ */
	.shortcuts-content {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem 0;
	}

	.shortcuts-list,
	.shortcuts-groups {
		padding: 0 0.5rem;
	}

	/* ============================================
	   Groups - 分组
	   ============================================ */
	.shortcut-group {
		margin-bottom: 0.75rem;
	}

	.group-title {
		margin: 0;
		padding: 0.5rem 1rem 0.375rem;
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--color-fg-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.group-items {
		padding: 0 0.5rem;
	}

	/* ============================================
	   Shortcut Item - 快捷键项
	   ============================================ */
	.shortcut-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.625rem 1rem;
		border-radius: var(--radius-sm);
		transition: background-color 0.15s ease;
	}

	.shortcut-item:hover {
		background-color: var(--color-bg-tertiary);
	}

	.shortcut-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.shortcut-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-fg-primary);
	}

	.shortcut-desc {
		font-size: 0.75rem;
		color: var(--color-fg-tertiary);
		line-height: 1.4;
	}

	/* ============================================
	   Keyboard Key - 按键样式
	   ============================================ */
	.shortcut-key {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.5rem;
		height: 1.5rem;
		padding: 0.125rem 0.5rem;
		flex-shrink: 0;

		font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
		font-size: 0.6875rem;
		font-weight: 500;
		line-height: 1.4;
		color: var(--color-fg-secondary);

		background-color: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		box-shadow: 0 1px 0 var(--color-border);

		transition: all 0.15s ease;
	}

	.shortcut-item:hover .shortcut-key {
		background-color: var(--color-primary-bg);
		border-color: var(--color-primary-light);
		color: var(--color-primary);
	}

	/* ============================================
	   Empty State - 空状态
	   ============================================ */
	.shortcuts-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 3rem 1.5rem;
		color: var(--color-fg-muted);
	}

	.empty-icon {
		opacity: 0.5;
	}

	.shortcuts-empty p {
		margin: 0;
		font-size: 0.875rem;
	}

	/* ============================================
	   Footer - 底部
	   ============================================ */
	.shortcuts-footer {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.75rem 1.5rem;
		border-top: 1px solid var(--color-border);
	}

	.footer-hint {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: var(--color-fg-muted);
	}

	.hint-key {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 0.375rem;
		font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
		font-size: 0.625rem;
		font-weight: 500;
		color: var(--color-fg-secondary);
		background-color: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: 0.25rem;
	}

	/* ============================================
	   Close Button - 关闭按钮
	   ============================================ */
	.shortcuts-close {
		position: absolute;
		right: 0.75rem;
		top: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-fg-muted);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.shortcuts-close:hover {
		color: var(--color-fg-primary);
		background-color: var(--color-bg-tertiary);
	}

	.shortcuts-close:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	/* ============================================
	   Animations - 动画
	   ============================================ */
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* ============================================
	   Reduced Motion - 减少动画
	   ============================================ */
	@media (prefers-reduced-motion: reduce) {
		.shortcuts-backdrop,
		.shortcuts-panel {
			animation: none;
		}

		.shortcut-item,
		.shortcut-key,
		.shortcuts-close {
			transition: none;
		}
	}

	/* ============================================
	   Scrollbar - 滚动条
	   ============================================ */
	.shortcuts-content::-webkit-scrollbar {
		width: 6px;
	}

	.shortcuts-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.shortcuts-content::-webkit-scrollbar-thumb {
		background-color: var(--color-border);
		border-radius: 3px;
	}

	.shortcuts-content::-webkit-scrollbar-thumb:hover {
		background-color: var(--color-border-hover);
	}
</style>
