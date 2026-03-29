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
	<!-- 头部 -->
	<div class="settings-header">
		<div class="header-left">
			<button
				type="button"
				class="back-btn close-btn"
				onclick={handleBackToChat}
				title="返回聊天"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 12H5M12 19l-7-7 7-7"/>
				</svg>
			</button>
			<div class="header-info">
				<h2 class="header-title">设置</h2>
				<p class="header-subtitle">
					{appState.appMode === 'simple' ? '简单模式' : '高级模式'}
					{#if settingsStore.hasUnsavedChanges}
						<span class="unsaved-indicator">• 未保存</span>
					{/if}
				</p>
			</div>
		</div>

		<div class="header-actions">
			{#if showSaveSuccess}
				<span class="save-success">✓ {saveMessage}</span>
			{/if}
			<button
				type="button"
				class="btn-secondary"
				onclick={handleCancel}
				disabled={!settingsStore.hasUnsavedChanges || isSaving}
			>
				取消
			</button>
			<button
				type="button"
				class="btn-primary"
				onclick={handleSave}
				disabled={!settingsStore.hasUnsavedChanges || isSaving}
			>
				{#if isSaving}
					<svg class="spinner w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
					</svg>
					保存中...
				{:else}
					保存
				{/if}
			</button>
		</div>
	</div>

	<!-- 标签页导航 -->
	<nav class="settings-tabs">
		{#each tabs as tab}
			<button
				type="button"
				class="tab-btn tab-item"
				class:active={settingsStore.activeTab === tab.id}
				class:hidden={appState.appMode === 'simple' && tab.id === 'tools'}
				onclick={() => switchTab(tab.id)}
			>
				<span class="tab-icon">{tab.icon}</span>
				<div class="tab-info">
					<span class="tab-label">{tab.label}</span>
					<span class="tab-desc">{tab.description}</span>
				</div>
			</button>
		{/each}
	</nav>

	<!-- 内容区域 -->
	<div class="settings-content">
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
</div>

<style>
	.settings-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: var(--color-bg-primary);
	}

	/* 头部 */
	.settings-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4) var(--space-6);
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-bg-secondary);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.back-btn {
		padding: var(--space-2);
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.back-btn:hover {
		background-color: var(--color-bg-tertiary);
		color: var(--color-text-primary);
	}

	.header-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.header-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.header-subtitle {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
		margin: 0;
	}

	.unsaved-indicator {
		color: var(--color-warning);
		margin-left: var(--space-2);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.save-success {
		font-size: 0.875rem;
		color: var(--color-success);
		animation: fadeIn var(--transition-fast);
	}

	/* 按钮样式 */
	.btn-secondary,
	.btn-primary {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.btn-secondary {
		border: 1px solid var(--color-border);
		background-color: transparent;
		color: var(--color-text-secondary);
	}

	.btn-secondary:hover:not(:disabled) {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.btn-primary {
		border: 1px solid var(--color-primary);
		background-color: var(--color-primary);
		color: var(--color-text-inverse);
	}

	.btn-primary:hover:not(:disabled) {
		background-color: var(--color-primary-dark);
	}

	.btn-secondary:disabled,
	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* 加载动画 */
	.spinner {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* 标签页导航 */
	.settings-tabs {
		display: flex;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-6);
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-bg-secondary);
		overflow-x: auto;
	}

	.tab-btn {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
		white-space: nowrap;
	}

	.tab-btn:hover {
		background-color: var(--color-bg-tertiary);
		color: var(--color-text-primary);
	}

	.tab-btn.active {
		background-color: var(--color-primary);
		color: var(--color-text-inverse);
	}

	.tab-btn.hidden {
		display: none;
	}

	.tab-icon {
		font-size: 1.25rem;
	}

	.tab-info {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-1);
	}

	.tab-label {
		font-size: 0.875rem;
		font-weight: 500;
	}

	.tab-desc {
		font-size: 0.6875rem;
		opacity: 0.8;
	}

	/* 内容区域 */
	.settings-content {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-6);
	}

	/* 响应式 */
	@media (max-width: 640px) {
		.settings-header {
			flex-direction: column;
			gap: var(--space-3);
			align-items: flex-start;
		}

		.header-actions {
			width: 100%;
			justify-content: flex-end;
		}

		.tab-info {
			display: none;
		}

		.tab-btn {
			padding: var(--space-2);
		}
	}
</style>
