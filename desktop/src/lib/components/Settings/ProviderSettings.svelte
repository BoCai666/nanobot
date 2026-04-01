<script lang="ts">
	import { settingsStore, type ProviderConfig } from './settingsStore.svelte';
	import { appState } from '$lib/stores/app';

	// 密码可见性状态
	let visibleKeys = $state<Record<string, boolean>>({});

	// 切换 API Key 可见性
	function toggleKeyVisibility(providerName: string) {
		visibleKeys[providerName] = !visibleKeys[providerName];
	}

	// 获取 Provider 图标
	function getProviderIcon(providerName: string): string {
		const icons: Record<string, string> = {
			openrouter: '🔌',
			openai: '🤖',
			anthropic: '🧠',
			deepseek: '🔮',
			groq: '⚡',
			gemini: '✨',
			siliconflow: '🌊',
			dashscope: '🌟',
			moonshot: '🌙',
			zhipu: '📊'
		};
		return icons[providerName] || '🔧';
	}

	// 处理 API Key 变更
	function handleApiKeyChange(provider: ProviderConfig, value: string) {
		settingsStore.updateProvider(provider.name, { apiKey: value });
	}

	// 处理 API Base 变更（高级模式）
	function handleApiBaseChange(provider: ProviderConfig, value: string) {
		settingsStore.updateProvider(provider.name, { apiBase: value });
	}

	// 处理启用状态变更
	function handleToggle(provider: ProviderConfig) {
		settingsStore.toggleProvider(provider.name);
	}
</script>

<div class="provider-settings">
	<div class="settings-description">
		<p>配置 LLM Provider 的 API 密钥。启用至少一个 Provider 才能使用 Agent 功能。</p>
	</div>

	<div class="providers-list">
		{#each settingsStore.providers as provider (provider.name)}
			<div class="provider-card" class:enabled={provider.enabled}>
				<div class="provider-header">
					<div class="provider-info">
						<span class="provider-icon">{getProviderIcon(provider.name)}</span>
						<div class="provider-details">
							<h4 class="provider-name">{provider.displayName}</h4>
							<span class="provider-status">
								{provider.enabled ? '已启用' : '未启用'}
							</span>
						</div>
					</div>
					<label class="toggle-switch">
						<input
							type="checkbox"
							checked={provider.enabled}
							onchange={() => handleToggle(provider)}
						/>
						<span class="toggle-slider"></span>
					</label>
				</div>

				{#if provider.enabled}
					<div class="provider-fields">
						<div class="field-group">
							<label class="field-label" for="api-key-{provider.name}">
								API Key
							</label>
							<div class="input-with-button">
								<input
									id="api-key-{provider.name}"
									type={visibleKeys[provider.name] ? 'text' : 'password'}
									class="field-input"
									placeholder={`输入 ${provider.displayName} API Key`}
									value={provider.apiKey}
									oninput={(e) => handleApiKeyChange(provider, e.currentTarget.value)}
								/>
								<button
									type="button"
									class="visibility-btn"
									onclick={() => toggleKeyVisibility(provider.name)}
									title={visibleKeys[provider.name] ? '隐藏' : '显示'}
								>
									{#if visibleKeys[provider.name]}
										<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
											<line x1="1" y1="1" x2="23" y2="23"/>
										</svg>
									{:else}
										<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
											<circle cx="12" cy="12" r="3"/>
										</svg>
									{/if}
								</button>
							</div>
						</div>

						{#if appState.appMode === 'advanced' && provider.apiBase !== undefined}
							<div class="field-group">
								<label class="field-label" for="api-base-{provider.name}">
									API Base URL (可选)
								</label>
								<input
									id="api-base-{provider.name}"
									type="text"
									class="field-input"
									placeholder={provider.apiBase}
									value={provider.apiBase}
									oninput={(e) => handleApiBaseChange(provider, e.currentTarget.value)}
								/>
							</div>
						{/if}

						{#if appState.appMode === 'advanced' && provider.models && provider.models.length > 0}
							<div class="field-group">
								<label class="field-label">支持的模型</label>
								<div class="models-list">
									{#each provider.models as model}
										<span class="model-tag">{model}</span>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.provider-settings {
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

	.providers-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.provider-card {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		transition: all var(--transition-fast);
	}

	.provider-card.enabled {
		border-color: var(--color-primary);
		background-color: var(--color-bg-primary);
	}

	.provider-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.provider-info {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.provider-icon {
		font-size: 1.5rem;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
	}

	.provider-details {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.provider-name {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.provider-status {
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

	/* Provider 字段 */
	.provider-fields {
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
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	.input-with-button {
		display: flex;
		gap: var(--space-2);
	}

	.input-with-button .field-input {
		flex: 1;
	}

	.visibility-btn {
		padding: var(--space-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-secondary);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.visibility-btn:hover {
		background-color: var(--color-bg-tertiary);
		color: var(--color-text-primary);
	}

	/* 模型标签 */
	.models-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.model-tag {
		padding: var(--space-1) var(--space-2);
		background-color: var(--color-bg-tertiary);
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
	}
</style>
