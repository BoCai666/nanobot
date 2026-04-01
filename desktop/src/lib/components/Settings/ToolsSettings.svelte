<script lang="ts">
	import { settingsStore, type MCPServerConfig } from './settingsStore.svelte';
	import { appState } from '$lib/stores/app';

	// 新建 MCP Server 表单状态
	let showAddForm = $state(false);
	let newServerName = $state('');
	let newServerCommand = $state('');
	let newServerArgs = $state('');
	let newServerUrl = $state('');
	let serverType: 'stdio' | 'http' = $state('stdio');

	// 添加新 MCP Server
	function handleAddServer() {
		if (!newServerName.trim()) return;

		const server: Omit<MCPServerConfig, 'enabled'> = {
			name: newServerName.trim(),
			...(serverType === 'stdio' ? {
				command: newServerCommand.trim() || 'npx',
				args: newServerArgs.split(' ').map(s => s.trim()).filter(Boolean)
			} : {
				url: newServerUrl.trim()
			})
		};

		settingsStore.addMCPServer(server);
		resetForm();
	}

	// 重置表单
	function resetForm() {
		newServerName = '';
		newServerCommand = '';
		newServerArgs = '';
		newServerUrl = '';
		serverType = 'stdio';
		showAddForm = false;
	}

	// 移除 MCP Server
	function handleRemoveServer(name: string) {
		settingsStore.removeMCPServer(name);
	}

	// 切换 MCP Server 启用状态
	function handleToggleServer(name: string) {
		settingsStore.toggleMCPServer(name);
	}

	// 更新限制到工作区
	function handleRestrictToWorkspace(enabled: boolean) {
		settingsStore.updateTools({ restrictToWorkspace: enabled });
	}

	// 更新执行启用状态
	function handleExecEnabled(enabled: boolean) {
		settingsStore.updateTools({ execEnabled: enabled });
	}

	// 更新搜索 Provider
	function handleSearchProviderChange(value: string) {
		settingsStore.updateTools({ searchProvider: value });
	}

	// 更新搜索 API Key
	function handleSearchApiKeyChange(value: string) {
		settingsStore.updateTools({ searchApiKey: value });
	}

	// 搜索 Provider 列表
	const searchProviders = [
		{ value: 'brave', label: 'Brave Search', description: '快速准确的搜索结果' },
		{ value: 'tavily', label: 'Tavily', description: '专为 AI 优化的搜索' },
		{ value: 'jina', label: 'Jina AI', description: '免费额度充足' },
		{ value: 'duckduckgo', label: 'DuckDuckGo', description: '无需 API Key' },
		{ value: 'searxng', label: 'SearXNG', description: '自托管搜索' }
	];
</script>

<div class="tools-settings">
	<div class="settings-description">
		<p>配置 Agent 可以使用的工具。包括 MCP 服务器、网页搜索等。</p>
	</div>

	<div class="settings-sections">
		<!-- 安全设置 -->
		<div class="tools-section">
			<h4 class="section-title">安全设置</h4>

			<div class="option-list">
				<label class="option-item">
					<div class="option-info">
						<span class="option-name">限制在工作区</span>
						<span class="option-desc">所有文件操作限制在工作区目录内</span>
					</div>
					<input
						type="checkbox"
						checked={settingsStore.tools.restrictToWorkspace}
						onchange={(e) => handleRestrictToWorkspace(e.currentTarget.checked)}
					/>
				</label>

				<label class="option-item">
					<div class="option-info">
						<span class="option-name">启用 Shell 执行</span>
						<span class="option-desc">允许 Agent 执行 shell 命令</span>
					</div>
					<input
						type="checkbox"
						checked={settingsStore.tools.execEnabled}
						onchange={(e) => handleExecEnabled(e.currentTarget.checked)}
					/>
				</label>
			</div>
		</div>

		<!-- 网页搜索设置 -->
		<div class="tools-section">
			<h4 class="section-title">网页搜索</h4>

			<div class="field-group">
				<label class="field-label" for="search-provider">
					搜索 Provider
				</label>
				<select
					id="search-provider"
					class="field-select"
					value={settingsStore.tools.searchProvider}
					onchange={(e) => handleSearchProviderChange(e.currentTarget.value)}
				>
					{#each searchProviders as provider}
						<option value={provider.value}>
							{provider.label} - {provider.description}
						</option>
					{/each}
				</select>
			</div>

			{#if settingsStore.tools.searchProvider !== 'duckduckgo'}
				<div class="field-group">
					<label class="field-label" for="search-api-key">
						搜索 API Key
					</label>
					<input
						id="search-api-key"
						type="password"
						class="field-input"
						placeholder="输入搜索 API Key"
						value={settingsStore.tools.searchApiKey || ''}
						oninput={(e) => handleSearchApiKeyChange(e.currentTarget.value)}
					/>
				</div>
			{/if}
		</div>

		<!-- MCP Servers -->
		{#if appState.appMode === 'advanced'}
			<div class="tools-section">
				<div class="section-header">
					<h4 class="section-title">MCP 服务器</h4>
					<button
						type="button"
						class="add-btn"
						onclick={() => showAddForm = !showAddForm}
					>
						{showAddForm ? '取消' : '+ 添加'}
					</button>
				</div>

				{#if showAddForm}
					<div class="add-server-form">
						<div class="form-row">
							<div class="field-group">
								<label class="field-label" for="server-name">名称</label>
								<input
									id="server-name"
									type="text"
									class="field-input"
									placeholder="例如: filesystem"
									bind:value={newServerName}
								/>
							</div>
						</div>

						<div class="form-row">
							<label class="field-label">连接类型</label>
							<div class="radio-group">
								<label class="radio-label">
									<input
										type="radio"
										value="stdio"
										bind:group={serverType}
									/>
									<span>Stdio (本地命令)</span>
								</label>
								<label class="radio-label">
									<input
										type="radio"
										value="http"
										bind:group={serverType}
									/>
									<span>HTTP (远程)</span>
								</label>
							</div>
						</div>

						{#if serverType === 'stdio'}
							<div class="form-row">
								<div class="field-group">
									<label class="field-label" for="server-command">命令</label>
									<input
										id="server-command"
										type="text"
										class="field-input"
										placeholder="例如: npx"
										bind:value={newServerCommand}
									/>
								</div>
							</div>
							<div class="form-row">
								<div class="field-group">
									<label class="field-label" for="server-args">参数 (空格分隔)</label>
									<input
										id="server-args"
										type="text"
										class="field-input"
										placeholder="例如: -y @modelcontextprotocol/server-filesystem /path/to/dir"
										bind:value={newServerArgs}
									/>
								</div>
							</div>
						{:else}
							<div class="form-row">
								<div class="field-group">
									<label class="field-label" for="server-url">URL</label>
									<input
										id="server-url"
										type="url"
										class="field-input"
										placeholder="https://example.com/mcp"
										bind:value={newServerUrl}
									/>
								</div>
							</div>
						{/if}

						<div class="form-actions">
							<button
								type="button"
								class="btn-secondary"
								onclick={resetForm}
							>
								取消
							</button>
							<button
								type="button"
								class="btn-primary"
								onclick={handleAddServer}
								disabled={!newServerName.trim()}
							>
								添加
							</button>
						</div>
					</div>
				{/if}

				<div class="mcp-servers-list">
					{#each settingsStore.tools.mcpServers as server (server.name)}
						<div class="mcp-server-item">
							<div class="server-info">
								<span class="server-name">{server.name}</span>
								<span class="server-type">{server.url ? 'HTTP' : 'Stdio'}</span>
							</div>
							<div class="server-actions">
								<label class="toggle-switch small">
									<input
										type="checkbox"
										checked={server.enabled}
										onchange={() => handleToggleServer(server.name)}
									/>
									<span class="toggle-slider"></span>
								</label>
								<button
									type="button"
									class="remove-btn"
									onclick={() => handleRemoveServer(server.name)}
									title="删除"
								>
									<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M18 6L6 18M6 6l12 12"/>
									</svg>
								</button>
							</div>
						</div>
					{:else}
						<div class="empty-state">
							<p>暂无 MCP 服务器</p>
							<p class="empty-hint">点击 "+ 添加" 添加 MCP 服务器</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.tools-settings {
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

	.settings-sections {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.tools-section {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-4);
	}

	.section-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.add-btn {
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--color-primary);
		border-radius: var(--radius-md);
		background-color: transparent;
		color: var(--color-primary);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.add-btn:hover {
		background-color: var(--color-primary);
		color: var(--color-text-inverse);
	}

	/* 选项列表 */
	.option-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.option-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3);
		background-color: var(--color-bg-primary);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.option-item:hover {
		border-color: var(--color-primary);
	}

	.option-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.option-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.option-desc {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
	}

	.option-item input[type="checkbox"] {
		width: 20px;
		height: 20px;
		accent-color: var(--color-primary);
	}

	/* 字段样式 */
	.field-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
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

	/* 添加服务器表单 */
	.add-server-form {
		padding: var(--space-4);
		background-color: var(--color-bg-primary);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		margin-bottom: var(--space-4);
	}

	.form-row {
		margin-bottom: var(--space-3);
	}

	.radio-group {
		display: flex;
		gap: var(--space-4);
	}

	.radio-label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		cursor: pointer;
	}

	.radio-label input[type="radio"] {
		accent-color: var(--color-primary);
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		margin-top: var(--space-4);
	}

	.btn-secondary,
	.btn-primary {
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.btn-secondary {
		border: 1px solid var(--color-border);
		background-color: transparent;
		color: var(--color-text-secondary);
	}

	.btn-secondary:hover {
		background-color: var(--color-bg-tertiary);
	}

	.btn-primary {
		border: 1px solid var(--color-primary);
		background-color: var(--color-primary);
		color: var(--color-text-inverse);
	}

	.btn-primary:hover:not(:disabled) {
		background-color: var(--color-primary-dark);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* MCP 服务器列表 */
	.mcp-servers-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.mcp-server-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3);
		background-color: var(--color-bg-primary);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	.server-info {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.server-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.server-type {
		font-size: 0.75rem;
		padding: var(--space-1) var(--space-2);
		background-color: var(--color-bg-tertiary);
		border-radius: var(--radius-sm);
		color: var(--color-text-tertiary);
	}

	.server-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.remove-btn {
		padding: var(--space-1);
		border: none;
		background: transparent;
		color: var(--color-error);
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
	}

	.remove-btn:hover {
		background-color: var(--color-error-bg);
	}

	/* 小开关 */
	.toggle-switch.small {
		width: 40px;
		height: 20px;
	}

	.toggle-switch.small .toggle-slider:before {
		height: 14px;
		width: 14px;
		left: 3px;
		bottom: 3px;
	}

	.toggle-switch.small input:checked + .toggle-slider:before {
		transform: translateX(20px);
	}

	/* 空状态 */
	.empty-state {
		text-align: center;
		padding: var(--space-6);
		color: var(--color-text-tertiary);
	}

	.empty-state p {
		margin: 0;
	}

	.empty-hint {
		font-size: 0.75rem;
		margin-top: var(--space-1);
	}

	/* 开关样式 (复用) */
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
</style>
