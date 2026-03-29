/**
 * 设置面板状态管理
 * 使用 Svelte 5 runes 语法
 */

// 设置标签页类型
export type SettingsTab = 'providers' | 'channels' | 'agent' | 'tools';

// Provider 配置类型
export interface ProviderConfig {
	name: string;
	displayName: string;
	enabled: boolean;
	apiKey: string;
	apiBase?: string;  // 高级模式
	models?: string[]; // 支持的模型列表
}

// Channel 配置类型
export interface ChannelConfig {
	id: string;
	name: string;
	enabled: boolean;
	token?: string;
	appId?: string;
	appSecret?: string;
	connected: boolean;
}

// Agent 配置类型
export interface AgentConfig {
	defaultModel: string;
	defaultProvider: string;
	temperature: number;  // 高级模式
	maxTokens?: number;   // 高级模式
	timezone?: string;    // 高级模式
	apiBaseUrl: string;   // Gateway API 端点
}

// MCP Server 配置类型
export interface MCPServerConfig {
	name: string;
	command?: string;
	args?: string[];
	url?: string;
	enabled: boolean;
}

// Tools 配置类型
export interface ToolsConfig {
	mcpServers: MCPServerConfig[];
	restrictToWorkspace: boolean;
	execEnabled: boolean;
	searchProvider: string;
	searchApiKey?: string;
}

// 完整的应用配置
export interface AppConfig {
	providers: ProviderConfig[];
	channels: ChannelConfig[];
	agent: AgentConfig;
	tools: ToolsConfig;
}

// 创建设置状态
export function createSettingsStore() {
	// 当前激活的标签页
	let activeTab = $state<SettingsTab>('providers');

	// 是否有未保存的更改
	let hasUnsavedChanges = $state(false);

	// Provider 列表
	let providers = $state<ProviderConfig[]>([
		{
			name: 'openrouter',
			displayName: 'OpenRouter',
			enabled: true,
			apiKey: '',
			apiBase: 'https://openrouter.ai/api/v1',
			models: ['anthropic/claude-3-opus', 'anthropic/claude-3-sonnet', 'openai/gpt-4o']
		},
		{
			name: 'openai',
			displayName: 'OpenAI',
			enabled: false,
			apiKey: '',
			apiBase: 'https://api.openai.com/v1',
			models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo']
		},
		{
			name: 'anthropic',
			displayName: 'Anthropic',
			enabled: false,
			apiKey: '',
			apiBase: 'https://api.anthropic.com',
			models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
		},
		{
			name: 'deepseek',
			displayName: 'DeepSeek',
			enabled: false,
			apiKey: '',
			apiBase: 'https://api.deepseek.com',
			models: ['deepseek-chat', 'deepseek-coder']
		},
		{
			name: 'groq',
			displayName: 'Groq',
			enabled: false,
			apiKey: '',
			apiBase: 'https://api.groq.com/openai/v1',
			models: ['llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it']
		},
		{
			name: 'gemini',
			displayName: 'Google Gemini',
			enabled: false,
			apiKey: '',
			apiBase: 'https://generativelanguage.googleapis.com/v1beta',
			models: ['gemini-1.5-pro', 'gemini-1.5-flash']
		}
	]);

	// Channel 配置
	let channels = $state<ChannelConfig[]>([
		{
			id: 'telegram',
			name: 'Telegram',
			enabled: false,
			token: '',
			connected: false
		},
		{
			id: 'discord',
			name: 'Discord',
			enabled: false,
			token: '',
			connected: false
		},
		{
			id: 'whatsapp',
			name: 'WhatsApp',
			enabled: false,
			connected: false
		},
		{
			id: 'feishu',
			name: 'Feishu',
			enabled: false,
			appId: '',
			appSecret: '',
			connected: false
		},
		{
			id: 'slack',
			name: 'Slack',
			enabled: false,
			token: '',
			connected: false
		}
	]);

	// Agent 配置
	let agent = $state<AgentConfig>({
		defaultModel: 'anthropic/claude-3-opus',
		defaultProvider: 'openrouter',
		temperature: 0.7,
		maxTokens: 4096,
		timezone: 'UTC',
		apiBaseUrl: 'http://localhost:18790'
	});

	// Tools 配置
	let tools = $state<ToolsConfig>({
		mcpServers: [],
		restrictToWorkspace: false,
		execEnabled: true,
		searchProvider: 'brave',
		searchApiKey: ''
	});

	// 设置当前标签页
	function setActiveTab(tab: SettingsTab) {
		activeTab = tab;
	}

	// 更新 Provider
	function updateProvider(name: string, updates: Partial<ProviderConfig>) {
		providers = providers.map(p =>
			p.name === name ? { ...p, ...updates } : p
		);
		markAsChanged();
	}

	// 切换 Provider 启用状态
	function toggleProvider(name: string) {
		providers = providers.map(p =>
			p.name === name ? { ...p, enabled: !p.enabled } : p
		);
		markAsChanged();
	}

	// 更新 Channel
	function updateChannel(id: string, updates: Partial<ChannelConfig>) {
		channels = channels.map(c =>
			c.id === id ? { ...c, ...updates } : c
		);
		markAsChanged();
	}

	// 切换 Channel 启用状态
	function toggleChannel(id: string) {
		channels = channels.map(c =>
			c.id === id ? { ...c, enabled: !c.enabled } : c
		);
		markAsChanged();
	}

	// 更新 Agent 配置
	function updateAgent(updates: Partial<AgentConfig>) {
		agent = { ...agent, ...updates };
		markAsChanged();
	}

	// 更新 API Base URL
	function updateApiBaseUrl(url: string) {
		agent.apiBaseUrl = url;
		markAsChanged();
	}

	// 获取完整配置（供 API 服务使用）
	function getConfig(): AppConfig {
		return {
			providers,
			channels,
			agent,
			tools
		};
	}

	// 更新 Tools 配置
	function updateTools(updates: Partial<ToolsConfig>) {
		tools = { ...tools, ...updates };
		markAsChanged();
	}

	// 添加 MCP Server
	function addMCPServer(server: Omit<MCPServerConfig, 'enabled'>) {
		tools.mcpServers = [...tools.mcpServers, { ...server, enabled: true }];
		markAsChanged();
	}

	// 移除 MCP Server
	function removeMCPServer(name: string) {
		tools.mcpServers = tools.mcpServers.filter(s => s.name !== name);
		markAsChanged();
	}

	// 切换 MCP Server 启用状态
	function toggleMCPServer(name: string) {
		tools.mcpServers = tools.mcpServers.map(s =>
			s.name === name ? { ...s, enabled: !s.enabled } : s
		);
		markAsChanged();
	}

	// 标记为已更改
	function markAsChanged() {
		hasUnsavedChanges = true;
	}

	// 保存配置（模拟）
	async function saveConfig(): Promise<boolean> {
		// 模拟保存延迟
		await new Promise(resolve => setTimeout(resolve, 500));
		console.log('配置已保存:', { providers, channels, agent, tools });
		hasUnsavedChanges = false;
		return true;
	}

	// 重置配置
	function resetConfig() {
		// 重置为默认值
		hasUnsavedChanges = false;
	}

	// 获取可用的模型列表（根据选中的 provider）
	function getAvailableModels(providerName: string): string[] {
		const provider = providers.find(p => p.name === providerName);
		return provider?.models || [];
	}

	// 获取启用的 Providers
	function getEnabledProviders(): ProviderConfig[] {
		return providers.filter(p => p.enabled);
	}

	return {
		// 状态
		get activeTab() { return activeTab; },
		get hasUnsavedChanges() { return hasUnsavedChanges; },
		get providers() { return providers; },
		get channels() { return channels; },
		get agent() { return agent; },
		get tools() { return tools; },

		// 方法
		setActiveTab,
		updateProvider,
		toggleProvider,
		updateChannel,
		toggleChannel,
		updateAgent,
		updateApiBaseUrl,
		updateTools,
		addMCPServer,
		removeMCPServer,
		toggleMCPServer,
		saveConfig,
		resetConfig,
		getAvailableModels,
		getEnabledProviders,
		getConfig
	};
}

// 创建全局设置状态实例
export const settingsStore = createSettingsStore();
