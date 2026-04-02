<script lang="ts">
	/**
	 * MainContent 组件 - 主内容区域
	 * 
	 * 整合标签页系统和聊天视图
	 * - 支持多标签页切换
	 * - 标签页与 Channel 联动
	 */
	import { currentView, appMode, channels, selectedChannel, setView, setAppModeValue, setChannelConnected, currentChannelName } from '$lib/stores/app';
	import { tabsStore, type Tab } from '$lib/stores/tabs.svelte';
	import ChatView from '$lib/components/Chat/ChatView.svelte';
	import TabBar from '$lib/components/Tabs/TabBar.svelte';

	// 图标组件 - 聊天
	function MessageIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
		</svg>`;
	}

	// 图标组件 - 设置
	function SettingsIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="3"/>
			<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
		</svg>`;
	}

	// 当 selectedChannel 变化时，打开对应的标签页
	$effect(() => {
		if ($currentView === 'chat' && $selectedChannel) {
			tabsStore.openChannelTab($selectedChannel);
		}
	});

	// 获取当前激活标签页的标题
	let activeTabTitle = $derived(() => {
		return tabsStore.activeTab()?.title || $currentChannelName;
	});

	// 处理标签页切换
	function handleTabChange(tab: Tab | null) {
		if (tab) {
			// 更新 selectedChannel 以保持同步
			setChannelConnected(tab.channelId, $channels.find(ch => ch.id === tab.channelId)?.connected || false);
		}
	}
</script>

<main class="main-content">
	{#if $currentView === 'chat'}
		<!-- 聊天视图 -->
		<div class="view-header">
			<div class="header-icon">
				{@html MessageIcon({ class: 'w-5 h-5' })}
			</div>
			<h2 class="header-title">{$currentChannelName}</h2>
		</div>
		<div class="view-content chat-view-content">
			<ChatView channelName={$currentChannelName} />
		</div>
	{:else if $currentView === 'settings'}
		<!-- 设置视图 -->
		<div class="view-header">
			<div class="header-icon">
				{@html SettingsIcon({ class: 'w-5 h-5' })}
			</div>
			<h2 class="header-title">设置</h2>
		</div>
		<div class="view-content">
			<div class="settings-container">
				<section class="settings-section">
					<h3 class="section-title">应用模式</h3>
					<div class="mode-toggle">
						<button
							class="mode-btn"
							class:active={$appMode === 'simple'}
							onclick={() => setAppModeValue('simple')}
						>
							简单模式
						</button>
						<button
							class="mode-btn"
							class:active={$appMode === 'advanced'}
							onclick={() => setAppModeValue('advanced')}
						>
							高级模式
						</button>
					</div>
					<p class="mode-description">
						{$appMode === 'simple'
							? '简单模式：隐藏高级设置，适合日常使用'
							: '高级模式：显示所有选项，适合高级用户'}
					</p>
				</section>

				<section class="settings-section">
					<h3 class="section-title">Channels</h3>
					<div class="channels-list">
						{#each $channels as channel (channel.id)}
							<div class="channel-row">
								<div class="channel-info-row">
									<span class="channel-name-row">{channel.name}</span>
									<span
										class="channel-status"
										class:connected={channel.connected}
									>
										{channel.connected ? '已连接' : '未连接'}
									</span>
								</div>
								{#if $appMode === 'advanced'}
									<div class="channel-advanced">
										<label class="toggle-label">
											<input
												type="checkbox"
												checked={channel.connected}
												onchange={() => setChannelConnected(channel.id, !channel.connected)}
											/>
											<span class="toggle-text">自动连接</span>
										</label>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</section>

				{#if $appMode === 'advanced'}
					<section class="settings-section">
						<h3 class="section-title">高级选项</h3>
						<div class="advanced-options">
							<div class="option-row">
								<label class="option-label">
									<span>调试模式</span>
									<input type="checkbox" />
								</label>
							</div>
							<div class="option-row">
								<label class="option-label">
									<span>详细日志</span>
									<input type="checkbox" />
								</label>
							</div>
							<div class="option-row">
								<label class="option-label">
									<span>API 端点</span>
									<input type="text" class="option-input" placeholder="http://localhost:18790" />
								</label>
							</div>
						</div>
					</section>
				{/if}
			</div>
		</div>
	{/if}
</main>

<style>
	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		background-color: var(--color-bg-primary);
		overflow: hidden;
	}

	.view-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4);
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-bg-secondary);
	}

	.header-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-md);
		background-color: var(--color-primary);
		color: var(--color-text-inverse);
	}

	.header-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.view-content {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-4);
	}

	.chat-view-content {
		padding: 0;
		overflow: hidden;
	}

	/* 设置容器 */
	.settings-container {
		max-width: 600px;
		margin: 0 auto;
	}

	.settings-section {
		margin-bottom: var(--space-6);
		padding: var(--space-4);
		background-color: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.section-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 var(--space-4) 0;
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border);
	}

	/* 模式切换 */
	.mode-toggle {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.mode-btn {
		flex: 1;
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-primary);
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.mode-btn:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.mode-btn.active {
		background-color: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-text-inverse);
	}

	.mode-description {
		font-size: 0.875rem;
		color: var(--color-text-tertiary);
		margin: 0;
	}

	/* Channels 列表 */
	.channels-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.channel-row {
		padding: var(--space-3);
		background-color: var(--color-bg-primary);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	.channel-info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.channel-name-row {
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.channel-status {
		font-size: 0.75rem;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		background-color: var(--color-bg-tertiary);
		color: var(--color-text-tertiary);
	}

	.channel-status.connected {
		background-color: var(--color-success);
		color: white;
	}

	.channel-advanced {
		margin-top: var(--space-2);
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border);
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.toggle-text {
		user-select: none;
	}

	/* 高级选项 */
	.advanced-options {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.option-row {
		padding: var(--space-2) 0;
	}

	.option-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.option-label span {
		flex: 1;
	}

	.option-input {
		flex: 1;
		margin-left: var(--space-4);
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-primary);
		color: var(--color-text-primary);
		font-size: 0.875rem;
	}

	.option-input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	/* 输入框样式 */
	input[type="checkbox"] {
		width: 18px;
		height: 18px;
		accent-color: var(--color-primary);
		cursor: pointer;
	}
</style>
