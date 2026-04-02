<script lang="ts">
	/**
	 * AgentSettings 组件
	 * 
	 * 温暖亲切的设计风格，使用品牌色 #FF6B35
	 * 采用新的 Input 和 Button 组件
	 * 使用 CSS variables 确保一致性
	 */
	import { settingsStore } from './settingsStore.svelte';
	import { appState } from '$lib/stores/app';
	import { agentAPI } from '$lib/api/agent';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	// 温度滑块值
	let temperatureValue = $state(settingsStore.agent.temperature);

	// API 连接测试状态
	let testingConnection = $state(false);
	let connectionTestResult = $state<'success' | 'error' | null>(null);

	// API Base URL 本地状态（用于 Input 绑定）
	let apiBaseUrlValue = $state(settingsStore.agent.apiBaseUrl);

	// 最大 Token 本地状态
	let maxTokensValue = $state((settingsStore.agent.maxTokens ?? 4096).toString());

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
		maxTokensValue = value;
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
		apiBaseUrlValue = value;
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
	<!-- 温暖的提示区域 -->
	<div class="settings-welcome">
		<div class="welcome-icon">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
			</svg>
		</div>
		<p>配置 Agent 的默认行为和参数，打造属于你的智能助手</p>
	</div>

	<div class="settings-form">
		<!-- API 连接设置 - 核心配置 -->
		<section class="form-section api-section">
			<h3 class="section-title">
				<span class="title-icon">🔗</span>
				API 连接
			</h3>
			
			<div class="field-group">
				<label class="field-label" for="api-base-url">
					Gateway 端点
				</label>
				<div class="input-row">
					<div class="input-wrapper">
						<Input
							type="url"
							placeholder="http://localhost:18790"
							bind:value={apiBaseUrlValue}
							oninput={(e) => handleApiBaseUrlChange((e.target as HTMLInputElement).value)}
						/>
					</div>
					<Button
						variant="outline"
						size="md"
						disabled={testingConnection}
						onclick={testConnection}
					>
						{#if testingConnection}
							<span class="spinner"></span>
						{:else if connectionTestResult === 'success'}
							<span class="status-icon success">✓</span>
						{:else if connectionTestResult === 'error'}
							<span class="status-icon error">✗</span>
						{:else}
							测试连接
						{/if}
					</Button>
				</div>
				
				{#if connectionTestResult === 'success'}
					<p class="field-hint success">
						<span class="hint-icon">✓</span>
						连接成功，Gateway 运行正常
					</p>
				{:else if connectionTestResult === 'error'}
					<p class="field-hint error">
						<span class="hint-icon">!</span>
						无法连接，请检查 Gateway 是否运行
					</p>
				{:else}
					<p class="field-hint">
						nanobot Gateway 的 API 地址，默认 http://localhost:18790
					</p>
				{/if}
			</div>
		</section>

		<!-- Provider 和模型选择 -->
		<section class="form-section">
			<h3 class="section-title">
				<span class="title-icon">🤖</span>
				模型配置
			</h3>
			
			<div class="fields-grid">
				<div class="field-group">
					<label class="field-label" for="default-provider">
						默认 Provider
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

				<div class="field-group">
					<label class="field-label" for="default-model">
						默认模型
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
		</section>

		<!-- 温度设置 -->
		<section class="form-section">
			<h3 class="section-title">
				<span class="title-icon">🌡️</span>
				响应风格
			</h3>
			
			<div class="field-group">
				<div class="slider-header">
					<span class="slider-label">Temperature</span>
					<span class="slider-value" style="color: var(--color-primary)">
						{temperatureValue.toFixed(1)}
					</span>
				</div>
				
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
					<div class="slider-track">
						<div 
							class="slider-fill" 
							style="width: {(temperatureValue / 2) * 100}%"
						></div>
					</div>
				</div>
				
				<div class="slider-labels">
					<span class="label-item">
						<span class="label-dot precise"></span>
						精确 (0)
					</span>
					<span class="label-item">
						<span class="label-dot balanced"></span>
						平衡 (1)
					</span>
					<span class="label-item">
						<span class="label-dot creative"></span>
						创意 (2)
					</span>
				</div>
				
				<p class="field-hint">
					较低的值产生更确定的输出，较高的值产生更有创意的输出
				</p>
			</div>
		</section>

		{#if appState.appMode === 'advanced'}
			<!-- 高级选项 -->
			<section class="form-section advanced">
				<h3 class="section-title">
					<span class="title-icon">⚙️</span>
					高级选项
				</h3>

				<div class="fields-grid">
					<div class="field-group">
						<label class="field-label" for="max-tokens">
							最大 Token 数
						</label>
						<Input
							type="number"
							placeholder="4096"
							bind:value={maxTokensValue}
							oninput={(e) => handleMaxTokensChange((e.target as HTMLInputElement).value)}
						/>
						<p class="field-hint">单次响应的最大 Token 数量 (100-8192)</p>
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
			</section>
		{/if}
	</div>
</div>

<style>
	.agent-settings {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	/* 欢迎提示区域 */
	.settings-welcome {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-4) var(--space-5);
		background: linear-gradient(
			135deg,
			var(--color-primary-bg) 0%,
			var(--color-bg-secondary) 100%
		);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.welcome-icon {
		flex-shrink: 0;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-primary);
		border-radius: var(--radius-md);
		color: var(--color-fg-inverse);
	}

	.welcome-icon svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	.settings-welcome p {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.5;
		color: var(--color-fg-secondary);
	}

	/* 表单容器 */
	.settings-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	/* 表单分区 */
	.form-section {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-5);
		transition: border-color var(--transition-fast);
	}

	.form-section:hover {
		border-color: var(--color-border-hover);
	}

	/* API 配置区域特殊样式 */
	.api-section {
		border-color: var(--color-primary);
		background: linear-gradient(
			135deg,
			var(--color-primary-bg) 0%,
			var(--color-bg-secondary) 100%
		);
	}

	/* 高级选项区域 */
	.form-section.advanced {
		border-color: var(--color-warning);
		background: linear-gradient(
			135deg,
			var(--color-warning-bg) 0%,
			var(--color-bg-secondary) 100%
		);
	}

	/* 分区标题 */
	.section-title {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0 0 var(--space-4) 0;
		padding-bottom: var(--space-3);
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-fg-primary);
		border-bottom: 1px solid var(--color-border);
	}

	.title-icon {
		font-size: 1.125rem;
	}

	/* 字段网格布局 */
	.fields-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-4);
	}

	/* 字段组 */
	.field-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	/* 字段标签 */
	.field-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-fg-secondary);
	}

	/* 输入行（带按钮） */
	.input-row {
		display: flex;
		gap: var(--space-2);
		align-items: flex-start;
	}

	.input-row .input-wrapper {
		flex: 1;
		min-width: 0;
	}

	/* 下拉选择框 */
	.field-select {
		width: 100%;
		height: 2.5rem;
		padding: 0 var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background-color: var(--color-bg-elevated);
		color: var(--color-fg-primary);
		font-size: 0.875rem;
		font-family: inherit;
		cursor: pointer;
		transition: all var(--transition-fast);
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23A9A5A2' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.75rem center;
		padding-right: 2.5rem;
	}

	.field-select:focus {
		outline: none;
		border-color: var(--color-border-focus);
		box-shadow: 
			0 0 0 3px var(--color-primary-ring),
			0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.field-select:hover:not(:focus) {
		border-color: var(--color-border-hover);
	}

	/* 字段提示 */
	.field-hint {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		margin: 0;
		font-size: 0.75rem;
		color: var(--color-fg-tertiary);
	}

	.field-hint.success {
		color: var(--color-success);
	}

	.field-hint.error {
		color: var(--color-error);
	}

	.hint-icon {
		font-weight: 600;
	}

	/* 滑块样式 */
	.slider-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-2);
	}

	.slider-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-fg-secondary);
	}

	.slider-value {
		font-size: 0.875rem;
		font-weight: 600;
		font-family: ui-monospace, monospace;
	}

	.slider-container {
		position: relative;
		height: 6px;
		margin-bottom: var(--space-3);
	}

	.field-slider {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 6px;
		-webkit-appearance: none;
		appearance: none;
		background: transparent;
		cursor: pointer;
		z-index: 2;
	}

	.slider-track {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 6px;
		background-color: var(--color-bg-tertiary);
		border-radius: 3px;
		overflow: hidden;
	}

	.slider-fill {
		height: 100%;
		background: linear-gradient(
			90deg,
			var(--color-primary) 0%,
			var(--color-primary-light) 100%
		);
		border-radius: 3px;
		transition: width var(--transition-fast);
	}

	/* 滑块拇指样式 */
	.field-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background-color: var(--color-primary);
		border: 3px solid var(--color-bg-elevated);
		box-shadow: 
			0 1px 3px rgba(0, 0, 0, 0.1),
			0 0 0 0 var(--color-primary-ring);
		cursor: grab;
		transition: all var(--transition-fast);
	}

	.field-slider::-webkit-slider-thumb:hover {
		transform: scale(1.1);
		box-shadow: 
			0 2px 6px rgba(0, 0, 0, 0.15),
			0 0 0 4px var(--color-primary-ring);
	}

	.field-slider::-webkit-slider-thumb:active {
		cursor: grabbing;
		transform: scale(1.05);
	}

	.field-slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background-color: var(--color-primary);
		border: 3px solid var(--color-bg-elevated);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		cursor: grab;
	}

	/* 滑块标签 */
	.slider-labels {
		display: flex;
		justify-content: space-between;
		margin-top: var(--space-1);
	}

	.label-item {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-size: 0.75rem;
		color: var(--color-fg-tertiary);
	}

	.label-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
	}

	.label-dot.precise {
		background-color: var(--color-info);
	}

	.label-dot.balanced {
		background-color: var(--color-success);
	}

	.label-dot.creative {
		background-color: var(--color-primary);
	}

	/* 加载动画 */
	.spinner {
		display: inline-block;
		width: 14px;
		height: 14px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* 状态图标 */
	.status-icon {
		font-weight: 600;
	}

	.status-icon.success {
		color: var(--color-success);
	}

	.status-icon.error {
		color: var(--color-error);
	}

	/* Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.field-slider::-webkit-slider-thumb,
		.slider-fill,
		.spinner {
			transition: none;
			animation: none;
		}
	}
</style>
