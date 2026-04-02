<script lang="ts">
	import { settingsStore, type SettingsTab } from './settingsStore.svelte';
	import { appState } from '$lib/stores/app';
	import ProviderSettings from './ProviderSettings.svelte';
	import ChannelSettings from './ChannelSettings.svelte';
	import AgentSettings from './AgentSettings.svelte';
	import ToolsSettings from './ToolsSettings.svelte';

	// 保存状态
	let isSaving = $state(false);
	let saveMessage = $state('');
	let showSaveSuccess = $state(false);

	// 标签页配置
	const tabs: { id: SettingsTab; label: string; icon: string; description: string }[] = [
		{ id: 'providers', label: 'Providers', icon: '🔌', description: 'LLM Provider 配置' },
		{ id: 'channels', label: 'Channels', icon: '💬', description: '聊天平台连接' },
		{ id: 'agent', label: 'Agent', icon: '🤖', description: 'Agent 行为设置' },
		{ id: 'tools', label: 'Tools', icon: '🛠️', description: '工具和安全设置' }
	];

	// 切换标签页
	function switchTab(tab: SettingsTab) {
		settingsStore.setActiveTab(tab);
	}

	// 保存配置
	async function handleSave() {
		isSaving = true;
		saveMessage = '';
		showSaveSuccess = false;

		try {
			const success = await settingsStore.saveConfig();
			if (success) {
				saveMessage = '配置已保存';
				showSaveSuccess = true;
				setTimeout(() => {
					showSaveSuccess = false;
				}, 3000);
			}
		} catch (error) {
			saveMessage = '保存失败';
		} finally {
			isSaving = false;
		}
	}

	// 取消/重置
	function handleCancel() {
		settingsStore.resetConfig();
	}

	// 返回聊天
	function handleBackToChat() {
		appState.setView('chat');
	}
</script>

<div class="settings-panel">
	<!-- 头部 - 卡片式设计 -->
	<header class="settings-header">
		<div class="header-content">
			<div class="header-left">
				<button
					type="button"
					class="back-btn"
					onclick={handleBackToChat}
					title="返回聊天"
					aria-label="返回聊天界面"
				>
					<svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M19 12H5"/>
						<path d="M12 19l-7-7 7-7"/>
					</svg>
				</button>
				<div class="header-info">
					<h1 class="header-title">设置</h1>
					<p class="header-subtitle">
						<span class="mode-badge">
							{appState.appMode === 'simple' ? '简单模式' : '高级模式'}
						</span>
						{#if settingsStore.hasUnsavedChanges}
							<span class="unsaved-badge">未保存的更改</span>
						{/if}
					</p>
				</div>
			</div>

			<div class="header-actions">
				{#if showSaveSuccess}
					<div class="save-success-toast">
						<svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
							<path d="M20 6L9 17l-5-5"/>
						</svg>
						<span>{saveMessage}</span>
					</div>
				{/if}
				<button
					type="button"
					class="btn btn-secondary"
					onclick={handleCancel}
					disabled={!settingsStore.hasUnsavedChanges || isSaving}
				>
					取消更改
				</button>
				<button
					type="button"
					class="btn btn-primary"
					onclick={handleSave}
					disabled={!settingsStore.hasUnsavedChanges || isSaving}
				>
					{#if isSaving}
						<svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
							<circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
							<path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round">
								<animateTransform
									attributeName="transform"
									type="rotate"
									from="0 12 12"
									to="360 12 12"
									dur="1s"
									repeatCount="indefinite"
								/>
							</path>
						</svg>
						<span>保存中...</span>
					{:else}
						<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
							<polyline points="17,21 17,13 7,13 7,21"/>
							<polyline points="7,3 7,8 15,8"/>
						</svg>
						<span>保存配置</span>
					{/if}
				</button>
			</div>
		</div>
	</header>

	<!-- 标签页导航 - 温暖圆角设计 -->
	<div class="tabs-nav" role="tablist" aria-label="设置类别">
		<div class="tabs-container">
			{#each tabs as tab}
				<button
					type="button"
					role="tab"
					aria-selected={settingsStore.activeTab === tab.id}
					aria-controls={`tab-panel-${tab.id}`}
					class="tab-btn"
					class:active={settingsStore.activeTab === tab.id}
					class:hidden={appState.appMode === 'simple' && tab.id === 'tools'}
					onclick={() => switchTab(tab.id)}
				>
					<span class="tab-icon">{tab.icon}</span>
					<div class="tab-text">
						<span class="tab-label">{tab.label}</span>
						<span class="tab-desc">{tab.description}</span>
					</div>
				</button>
			{/each}
		</div>
	</div>

	<!-- 内容区域 - 卡片式容器 -->
	<main class="settings-main">
		<div class="content-card" role="tabpanel" id="tab-panel-{settingsStore.activeTab}">
			{#if settingsStore.activeTab === 'providers'}
				<ProviderSettings />
			{:else if settingsStore.activeTab === 'channels'}
				<ChannelSettings />
			{:else if settingsStore.activeTab === 'agent'}
				<AgentSettings />
			{:else if settingsStore.activeTab === 'tools'}
				<ToolsSettings />
			{/if}
		</div>
	</main>
</div>

<style>
	.settings-panel {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		background-color: var(--color-bg-primary);
		overflow: hidden;
	}

	/* ============================================
	   头部设计 - 温暖卡片式
	   ============================================ */
	.settings-header {
		flex-shrink: 0;
		background: linear-gradient(
			to bottom,
			var(--color-bg-secondary),
			var(--color-bg-primary)
		);
		border-bottom: 1px solid var(--color-border);
		box-shadow: var(--shadow-sm);
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4) var(--space-6);
		max-width: 100%;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	/* 返回按钮 - 温暖圆角 */
	.back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		padding: 0;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background-color: var(--color-card);
		color: var(--color-fg-secondary);
		cursor: pointer;
		transition: all var(--transition-base);
		box-shadow: var(--shadow-sm);
	}

	.back-btn:hover {
		background-color: var(--color-bg-tertiary);
		border-color: var(--color-primary);
		color: var(--color-primary);
		transform: translateX(-2px);
		box-shadow: var(--shadow-md);
	}

	.back-btn:active {
		transform: translateX(-1px);
	}

	.back-icon {
		width: 20px;
		height: 20px;
	}

	/* 标题区域 */
	.header-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.header-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-fg-primary);
		margin: 0;
		letter-spacing: -0.02em;
	}

	.header-subtitle {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: 0.8125rem;
		color: var(--color-fg-tertiary);
		margin: 0;
	}

	.mode-badge {
		display: inline-flex;
		align-items: center;
		padding: var(--space-1) var(--space-2);
		background-color: var(--color-primary-bg);
		color: var(--color-primary);
		border-radius: var(--radius-sm);
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.02em;
	}

	.unsaved-badge {
		display: inline-flex;
		align-items: center;
		padding: var(--space-1) var(--space-2);
		background-color: var(--color-warning-bg);
		color: var(--color-warning);
		border-radius: var(--radius-sm);
		font-size: 0.6875rem;
		font-weight: 600;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}

	/* 操作按钮区域 */
	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	/* 保存成功提示 */
	.save-success-toast {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		background-color: var(--color-success-bg);
		color: var(--color-success);
		border-radius: var(--radius-lg);
		font-size: 0.8125rem;
		font-weight: 500;
		animation: slideIn var(--transition-base) ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.success-icon {
		width: 16px;
		height: 16px;
	}

	/* ============================================
	   按钮设计 - 温暖圆角
	   ============================================ */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-5);
		border-radius: var(--radius-xl);
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-base);
		min-height: 42px;
		white-space: nowrap;
	}

	.btn-icon {
		width: 16px;
		height: 16px;
	}

	/* 次要按钮 */
	.btn-secondary {
		border: 1px solid var(--color-border);
		background-color: var(--color-card);
		color: var(--color-fg-secondary);
		box-shadow: var(--shadow-sm);
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: var(--color-bg-tertiary);
		border-color: var(--color-border-hover);
		color: var(--color-fg-primary);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.btn-secondary:active:not(:disabled) {
		transform: translateY(0);
	}

	/* 主要按钮 - 品牌色 */
	.btn-primary {
		border: none;
		background: linear-gradient(
			135deg,
			var(--color-primary) 0%,
			var(--color-primary-dark) 100%
		);
		color: var(--color-fg-inverse);
		box-shadow: var(--shadow-md), 0 2px 8px var(--color-primary-shadow);
	}

	.btn-primary:hover:not(:disabled) {
		background: linear-gradient(
			135deg,
			var(--color-primary-light) 0%,
			var(--color-primary) 100%
		);
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg), 0 4px 16px var(--color-primary-shadow-hover);
	}

	.btn-primary:active:not(:disabled) {
		transform: translateY(-1px);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none !important;
	}

	/* 加载动画 */
	.spinner {
		width: 16px;
		height: 16px;
	}

	/* ============================================
	   标签页导航 - 温暖设计
	   ============================================ */
	.tabs-nav {
		flex-shrink: 0;
		background-color: var(--color-bg-secondary);
		border-bottom: 1px solid var(--color-border);
	}

	.tabs-container {
		display: flex;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-6);
		overflow-x: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.tabs-container::-webkit-scrollbar {
		display: none;
	}

	/* 标签按钮 - 温暖圆角卡片式 */
	.tab-btn {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-5);
		border: 1px solid transparent;
		border-radius: var(--radius-xl);
		background-color: var(--color-card);
		color: var(--color-fg-secondary);
		cursor: pointer;
		transition: all var(--transition-base);
		white-space: nowrap;
		box-shadow: var(--shadow-sm);
		position: relative;
		overflow: hidden;
	}

	/* 悬停效果 */
	.tab-btn:hover:not(.active) {
		background-color: var(--color-bg-tertiary);
		border-color: var(--color-border);
		color: var(--color-fg-primary);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.tab-btn:active {
		transform: translateY(0);
	}

	/* 激活状态 - 品牌色背景 */
	.tab-btn.active {
		background: linear-gradient(
			135deg,
			var(--color-primary) 0%,
			var(--color-primary-dark) 100%
		);
		color: var(--color-fg-inverse);
		border-color: transparent;
		box-shadow: var(--shadow-lg), 0 4px 12px var(--color-primary-shadow);
		transform: translateY(-2px);
	}

	/* 激活状态图标动画 */
	.tab-btn.active .tab-icon {
		animation: iconBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes iconBounce {
		0% { transform: scale(1); }
		50% { transform: scale(1.2); }
		100% { transform: scale(1); }
	}

	.tab-btn.hidden {
		display: none;
	}

	/* 标签图标 */
	.tab-icon {
		font-size: 1.375rem;
		line-height: 1;
		transition: transform var(--transition-base);
	}

	.tab-btn:hover .tab-icon {
		transform: scale(1.1);
	}

	/* 标签文字 */
	.tab-text {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
	}

	.tab-label {
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.01em;
	}

	.tab-desc {
		font-size: 0.6875rem;
		opacity: 0.8;
		letter-spacing: 0.01em;
	}

	/* ============================================
	   内容区域 - 卡片式容器
	   ============================================ */
	.settings-main {
		flex: 1;
		width: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		padding: var(--space-6);
		background-color: var(--color-bg-primary);
		min-height: 0;
	}

	/* 内容卡片 - 温暖圆角阴影 */
	.content-card {
		width: 100%;
		background-color: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
		min-height: 100%;
		overflow: hidden;
		animation: fadeSlideUp var(--transition-slow) ease-out;
	}

	@keyframes fadeSlideUp {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ============================================
	   响应式设计
	   ============================================ */
	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			gap: var(--space-4);
			align-items: stretch;
		}

		.header-left {
			justify-content: space-between;
		}

		.header-actions {
			justify-content: flex-end;
		}

		.tabs-container {
			padding: var(--space-2) var(--space-4);
			gap: var(--space-1);
		}

		.tab-text {
			display: none;
		}

		.tab-btn {
			padding: var(--space-3);
			flex: 1;
			justify-content: center;
		}

		.tab-btn.active {
			transform: translateY(-1px);
		}

		.settings-main {
			padding: var(--space-4);
		}

		.content-card {
			border-radius: var(--radius-lg);
		}

		.btn {
			padding: var(--space-2) var(--space-4);
			min-height: 38px;
		}
	}

	@media (max-width: 480px) {
		.header-title {
			font-size: 1.25rem;
		}

		.btn-secondary {
			display: none;
		}

		.save-success-toast {
			position: fixed;
			bottom: var(--space-4);
			left: var(--space-4);
			right: var(--space-4);
			justify-content: center;
			z-index: 100;
		}
	}

	/* ============================================
	   深色模式优化
	   ============================================ */
	@media (prefers-color-scheme: dark) {
		.tab-btn:hover:not(.active) {
			background-color: var(--color-bg-tertiary);
		}

		.btn-secondary:hover:not(:disabled) {
			background-color: var(--color-bg-tertiary);
		}
	}

	/* ============================================
   减少动画偏好
	   ============================================ */
	@media (prefers-reduced-motion: reduce) {
		*,
		*::before,
		*::after {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}
	}
</style>
