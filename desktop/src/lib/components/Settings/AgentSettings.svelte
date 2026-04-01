<script lang="ts">
	import { settingsStore } from './settingsStore.svelte';
	import { appState } from '$lib/stores/app';
	import { agentAPI } from '$lib/api/agent';

	// 温度滑块值
	let temperatureValue = $state(settingsStore.agent.temperature);

	// API 连接测试状态
	let testingConnection = $state(false);
	let connectionTestResult = $state<'success' | 'error' | null>(null);

	// 更新温度
	function handleTemperatureChange(value: number) {
		temperatureValue = value;
		settingsStore.updateAgent({ temperature: value });
	}

	// 更新默认模型
	function handleModelChange(value: string) {
		settingsStore.updateAgent({ defaultModel: value });
	}

	// 更新默认 Provider
	function handleProviderChange(value: string) {
		settingsStore.updateAgent({ defaultProvider: value });
		// 更新模型列表
		const availableModels = settingsStore.getAvailableModels(value);
		if (availableModels.length > 0) {
			settingsStore.updateAgent({ defaultModel: availableModels[0] });
		}
	}

	// 更新最大 Token
	function handleMaxTokensChange(value: string) {
		const numValue = parseInt(value, 10);
		if (!isNaN(numValue) && numValue > 0) {
			settingsStore.updateAgent({ maxTokens: numValue });
		}
	}

	// 更新时区
	function handleTimezoneChange(value: string) {
		settingsStore.updateAgent({ timezone: value });
	}

	// 更新 API Base URL
	function handleApiBaseUrlChange(value: string) {
		settingsStore.updateApiBaseUrl(value);
		// 更新 agentAPI 实例
		agentAPI.setBaseUrl(value);
		// 重置测试结果
		connectionTestResult = null;
	}

	// 测试 API 连接
	async function testConnection() {
		testingConnection = true;
		connectionTestResult = null;
		try {
			// 临时设置 URL 进行测试
			const originalUrl = agentAPI['baseUrl'];
			agentAPI.setBaseUrl(settingsStore.agent.apiBaseUrl);
			const isHealthy = await agentAPI.healthCheck();
			connectionTestResult = isHealthy ? 'success' : 'error';
		} catch {
			connectionTestResult = 'error';
		} finally {
			testingConnection = false;
		}
	}

	// 获取启用的 Providers
	let enabledProviders = $derived(settingsStore.getEnabledProviders());

	// 获取当前 Provider 可用的模型
	let availableModels = $derived(
		settingsStore.getAvailableModels(settingsStore.agent.defaultProvider)
	);

	// 常用时区列表
	const timezones = [
		{ value: 'UTC', label: 'UTC (协调世界时)' },
		{ value: 'Asia/Shanghai', label: 'Asia/Shanghai (北京时间)' },
		{ value: 'Asia/Tokyo', label: 'Asia/Tokyo (东京时间)' },
		{ value: 'Asia/Singapore', label: 'Asia/Singapore (新加坡时间)' },
		{ value: 'America/New_York', label: 'America/New_York (纽约时间)' },
		{ value: 'America/Los_Angeles', label: 'America/Los_Angeles (洛杉矶时间)' },
		{ value: 'Europe/London', label: 'Europe/London (伦敦时间)' },
		{ value: 'Europe/Berlin', label: 'Europe/Berlin (柏林时间)' },
		{ value: 'Australia/Sydney', label: 'Australia/Sydney (悉尼时间)' }
	];
</script>

<div class="agent-settings">
	<div class="settings-description">
		<p>配置 Agent 的默认行为和参数。</p>
	</div>

	<div class="settings-form">
		<!-- API 连接设置 -->
		<div class="form-section api-section">
			<h4 class="section-title">API 连接</h4>
			<div class="field-group">
				<label class="field-label" for="api-base-url">
					Gateway 端点
				</label>
				<div class="input-with-button">
					<input
						id="api-base-url"
						type="url"
						class="field-input"
						placeholder="http://localhost:18790"
						value={settingsStore.agent.apiBaseUrl}
						oninput={(e) => handleApiBaseUrlChange(e.currentTarget.value)}
					/>
					<button
						type="button"
						class="test-btn"
						onclick={testConnection}
						disabled={testingConnection}
					>
						{#if testingConnection}
							<span class="spinner"></span>
						{:else if connectionTestResult === 'success'}
							✓
						{:else if connectionTestResult === 'error'}
							✗
						{:else}
							测试
						{/if}
					</button>
				</div>
				{#if connectionTestResult === 'success'}
					<p class="field-hint success">✓ 连接成功</p>
				{:else if connectionTestResult === 'error'}
					<p class="field-hint error">✗ 无法连接，请检查 Gateway 是否运行</p>
				{:else}
					<p class="field-hint">nanobot Gateway 的 API 地址（默认: http://localhost:18790）</p>
				{/if}
			</div>
		</div>

		<!-- Provider 选择 -->
		<div class="form-section">
			<h4 class="section-title">默认 Provider</h4>
			<div class="field-group">
				<label class="field-label" for="default-provider">
					选择 Provider
				</label>
				<select
					id="default-provider"
					class="field-select"
					value={settingsStore.agent.defaultProvider}
					onchange={(e) => handleProviderChange(e.currentTarget.value)}
				>
					{#each enabledProviders as provider}
						<option value={provider.name}>{provider.displayName}</option>
					{:else}
						<option value="" disabled>请先启用至少一个 Provider</option>
					{/each}
					{#if enabledProviders.length === 0}
						{#each settingsStore.providers as provider}
							<option value={provider.name}>{provider.displayName} (未启用)</option>
						{/each}
					{/if}
				</select>
				<p class="field-hint">选择默认使用的 LLM Provider</p>
			</div>
		</div>

		<!-- 模型选择 -->
		<div class="form-section">
			<h4 class="section-title">默认模型</h4>
			<div class="field-group">
				<label class="field-label" for="default-model">
					选择模型
				</label>
				<select
					id="default-model"
					class="field-select"
					value={settingsStore.agent.defaultModel}
					onchange={(e) => handleModelChange(e.currentTarget.value)}
				>
					{#each availableModels as model}
						<option value={model}>{model}</option>
					{:else}
						<option value={settingsStore.agent.defaultModel}>{settingsStore.agent.defaultModel}</option>
					{/each}
				</select>
				<p class="field-hint">选择默认使用的 AI 模型</p>
			</div>
		</div>

		<!-- 温度设置 -->
		<div class="form-section">
			<h4 class="section-title">Temperature (温度)</h4>
			<div class="field-group">
				<div class="slider-container">
					<input
						type="range"
						min="0"
						max="2"
						step="0.1"
						value={temperatureValue}
						class="field-slider"
						oninput={(e) => handleTemperatureChange(parseFloat(e.currentTarget.value))}
					/>
					<span class="slider-value">{temperatureValue.toFixed(1)}</span>
				</div>
				<div class="slider-labels">
					<span>精确 (0)</span>
					<span>平衡 (1)</span>
					<span>创意 (2)</span>
				</div>
				<p class="field-hint">
					较低的值产生更确定性的输出，较高的值产生更有创意的输出
				</p>
			</div>
		</div>

		{#if appState.appMode === 'advanced'}
			<!-- 高级选项 -->
			<div class="form-section advanced">
				<h4 class="section-title">高级选项</h4>

				<div class="field-group">
					<label class="field-label" for="max-tokens">
						最大 Token 数
					</label>
					<input
						id="max-tokens"
						type="number"
						class="field-input"
						value={settingsStore.agent.maxTokens}
						min="100"
						max="8192"
						step="100"
						oninput={(e) => handleMaxTokensChange(e.currentTarget.value)}
					/>
					<p class="field-hint">单次响应的最大 Token 数量</p>
				</div>

				<div class="field-group">
					<label class="field-label" for="timezone">
						时区
					</label>
					<select
						id="timezone"
						class="field-select"
						value={settingsStore.agent.timezone}
						onchange={(e) => handleTimezoneChange(e.currentTarget.value)}
					>
						{#each timezones as tz}
							<option value={tz.value}>{tz.label}</option>
						{/each}
					</select>
					<p class="field-hint">Agent 使用的时区</p>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.agent-settings {
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

	.settings-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.form-section {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
	}

	.form-section.advanced {
		border-color: var(--color-warning);
		background-color: var(--color-warning-bg);
	}

	.section-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 var(--space-4) 0;
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border);
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

	.field-select,
	.field-input {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-primary);
		color: var(--color-text-primary);
		font-size: 0.875rem;
		transition: all var(--transition-fast);
	}

	.field-select:focus,
	.field-input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px var(--color-primary-ring);
	}

	.field-hint {
		margin: 0;
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
	}

	.field-hint.success {
		color: var(--color-success);
	}

	.field-hint.error {
		color: var(--color-error);
	}

	/* API 配置区域 */
	.api-section {
		border-color: var(--color-primary);
		background-color: var(--color-primary-bg);
	}

	.input-with-button {
		display: flex;
		gap: var(--space-2);
	}

	.input-with-button .field-input {
		flex: 1;
	}

	.test-btn {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-secondary);
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all var(--transition-fast);
		min-width: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.test-btn:hover:not(:disabled) {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.test-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* 滑块样式 */
	.slider-container {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.field-slider {
		flex: 1;
		-webkit-appearance: none;
		appearance: none;
		height: 6px;
		border-radius: 3px;
		background: var(--color-bg-tertiary);
		outline: none;
	}

	.field-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.field-slider::-webkit-slider-thumb:hover {
		transform: scale(1.1);
		box-shadow: 0 0 0 4px var(--color-primary-ring-hover);
	}

	.field-slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: none;
	}

	.slider-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-primary);
		min-width: 40px;
		text-align: center;
	}

	.slider-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
		margin-top: var(--space-1);
	}
</style>
