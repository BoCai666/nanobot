<script lang="ts">
	import { settingsStore, type ChannelConfig } from './settingsStore.svelte';
	import { appState } from '$lib/stores/app';

	// Channel 图标组件
	function getChannelIcon(channelId: string): string {
		const icons: Record<string, string> = {
			telegram: '📱',
			discord: '🎮',
			whatsapp: '💬',
			feishu: '📋',
			slack: '💼',
			weixin: '💚',
			email: '📧',
			matrix: '🔷'
		};
		return icons[channelId] || '📡';
	}

	// 获取 Channel 描述
	function getChannelDescription(channelId: string): string {
		const descriptions: Record<string, string> = {
			telegram: '通过 Bot 与用户交互',
			discord: 'Discord 服务器 Bot',
			whatsapp: 'WhatsApp Web 集成',
			feishu: '飞书机器人',
			slack: 'Slack 工作区应用',
			weixin: '微信个人号',
			email: '邮件收发',
			matrix: 'Matrix 协议'
		};
		return descriptions[channelId] || '聊天平台集成';
	}

	// 处理 Token 变更
	function handleTokenChange(channel: ChannelConfig, value: string) {
		settingsStore.updateChannel(channel.id, { token: value });
	}

	// 处理 App ID 变更（Feishu 等）
	function handleAppIdChange(channel: ChannelConfig, value: string) {
		settingsStore.updateChannel(channel.id, { appId: value });
	}

	// 处理 App Secret 变更（Feishu 等）
	function handleAppSecretChange(channel: ChannelConfig, value: string) {
		settingsStore.updateChannel(channel.id, { appSecret: value });
	}

	// 处理启用状态变更
	function handleToggle(channel: ChannelConfig) {
		settingsStore.toggleChannel(channel.id);
	}

	// 是否需要 App ID/Secret 而非 Token
	function requiresAppCredentials(channelId: string): boolean {
		return ['feishu', 'dingtalk', 'qq', 'wecom'].includes(channelId);
	}
</script>

<div class="channel-settings">
	<div class="settings-description">
		<p>配置聊天平台的连接。启用后 nanobot 可以通过这些平台与用户交互。</p>
	</div>

	<div class="channels-grid">
		{#each settingsStore.channels as channel (channel.id)}
			<div class="channel-card" class:enabled={channel.enabled}>
				<div class="channel-header">
					<div class="channel-info">
						<span class="channel-icon">{getChannelIcon(channel.id)}</span>
						<div class="channel-details">
							<h4 class="channel-name">{channel.name}</h4>
							<span class="channel-desc">{getChannelDescription(channel.id)}</span>
						</div>
					</div>
					<label class="toggle-switch">
						<input
							type="checkbox"
							checked={channel.enabled}
							onchange={() => handleToggle(channel)}
						/>
						<span class="toggle-slider"></span>
					</label>
				</div>

				{#if channel.enabled}
					<div class="channel-fields">
						{#if requiresAppCredentials(channel.id)}
							<!-- App ID / App Secret 类型的配置 -->
							<div class="field-group">
								<label class="field-label" for="app-id-{channel.id}">
									App ID
								</label>
								<input
									id="app-id-{channel.id}"
									type="text"
									class="field-input"
									placeholder={`输入 ${channel.name} App ID`}
									value={channel.appId || ''}
									oninput={(e) => handleAppIdChange(channel, e.currentTarget.value)}
								/>
							</div>

							<div class="field-group">
								<label class="field-label" for="app-secret-{channel.id}">
									App Secret
								</label>
								<input
									id="app-secret-{channel.id}"
									type="password"
									class="field-input"
									placeholder={`输入 ${channel.name} App Secret`}
									value={channel.appSecret || ''}
									oninput={(e) => handleAppSecretChange(channel, e.currentTarget.value)}
								/>
							</div>
						{:else}
							<!-- Token 类型的配置 -->
							<div class="field-group">
								<label class="field-label" for="token-{channel.id}">
									Bot Token
								</label>
								<input
									id="token-{channel.id}"
									type="password"
									class="field-input"
									placeholder={`输入 ${channel.name} Bot Token`}
									value={channel.token || ''}
									oninput={(e) => handleTokenChange(channel, e.currentTarget.value)}
								/>
							</div>
						{/if}

						{#if appState.appMode === 'advanced'}
							<div class="advanced-options">
								<div class="option-row">
									<label class="checkbox-label">
										<input
											type="checkbox"
											checked={channel.connected}
											onchange={() => settingsStore.updateChannel(channel.id, { connected: !channel.connected })}
										/>
										<span>启动时自动连接</span>
									</label>
								</div>
							</div>
						{/if}

						<div class="connection-status">
							<span class="status-indicator" class:connected={channel.connected}></span>
							<span class="status-text">
								{channel.connected ? '已连接' : '未连接'}
							</span>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.channel-settings {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.settings-description {
		padding: var(--space-4);
		background-color: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		border-left: 4px solid var(--color-info);
	}

	.settings-description p {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.channels-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--space-4);
	}

	.channel-card {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		transition: all var(--transition-fast);
	}

	.channel-card.enabled {
		border-color: var(--color-primary);
		background-color: var(--color-bg-primary);
	}

	.channel-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.channel-info {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
	}

	.channel-icon {
		font-size: 1.5rem;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
	}

	.channel-details {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.channel-name {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.channel-desc {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
	}

	/* 开关样式 */
	.toggle-switch {
		position: relative;
		display: inline-block;
		width: 48px;
		height: 24px;
		cursor: pointer;
		flex-shrink: 0;
	}

	.toggle-switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--color-neutral-300);
		transition: var(--transition-fast);
		border-radius: 24px;
	}

	.toggle-slider:before {
		position: absolute;
		content: "";
		height: 18px;
		width: 18px;
		left: 3px;
		bottom: 3px;
		background-color: white;
		transition: var(--transition-fast);
		border-radius: 50%;
	}

	input:checked + .toggle-slider {
		background-color: var(--color-primary);
	}

	input:checked + .toggle-slider:before {
		transform: translateX(24px);
	}

	/* Channel 字段 */
	.channel-fields {
		margin-top: var(--space-4);
		padding-top: var(--space-4);
		border-top: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.field-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.field-input {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-primary);
		color: var(--color-text-primary);
		font-size: 0.875rem;
		transition: all var(--transition-fast);
		width: 100%;
	}

	.field-input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.1);
	}

	/* 高级选项 */
	.advanced-options {
		padding: var(--space-3);
		background-color: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
	}

	.option-row {
		display: flex;
		align-items: center;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		cursor: pointer;
	}

	.checkbox-label input[type="checkbox"] {
		width: 18px;
		height: 18px;
		accent-color: var(--color-primary);
	}

	/* 连接状态 */
	.connection-status {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border);
	}

	.status-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: var(--color-neutral-400);
	}

	.status-indicator.connected {
		background-color: var(--color-success);
	}

	.status-text {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
	}
</style>
