/**
 * 应用状态管理
 * 使用 Svelte 5 Runes 语法
 */

import { agentAPI } from '$lib/api/agent';

// 视图类型
export type ViewType = 'chat' | 'settings';

// Agent 状态
export type AgentStatus = 'idle' | 'running' | 'error';

// 连接状态
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

// 模式类型
export type AppMode = 'simple' | 'advanced';

// Channel 类型
export interface Channel {
	id: string;
	name: string;
	icon: string;
	connected: boolean;
}

// 当前对话信息
export interface CurrentConversation {
	id: string;
	title: string;
	channelId: string;
}

// 创建立即调用的应用状态函数
export function createAppStore() {
	// 当前视图
	let currentView = $state<ViewType>('chat');

	// 侧边栏展开状态
	let sidebarExpanded = $state<boolean>(true);

	// Agent 状态
	let agentStatus = $state<AgentStatus>('idle');

	// API 连接状态
	let apiConnectionStatus = $state<ConnectionStatus>('disconnected');

	// Channel 连接状态（保留用于 Channel 管理）
	let connectionStatus = $state<ConnectionStatus>('disconnected');

	// 应用模式 (简单/高级)
	let appMode = $state<AppMode>('simple');

	// 当前选中的 Channel
	let selectedChannel = $state<string>('telegram');

	// Channel 列表
	let channels = $state<Channel[]>([
		{ id: 'telegram', name: 'Telegram', icon: 'telegram', connected: false },
		{ id: 'discord', name: 'Discord', icon: 'discord', connected: false },
		{ id: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp', connected: false },
		{ id: 'feishu', name: 'Feishu', icon: 'feishu', connected: false },
		{ id: 'slack', name: 'Slack', icon: 'slack', connected: false }
	]);

	// 当前选中的对话
	let currentConversation = $state<CurrentConversation | null>(null);

	// 当前选中的 Channel 名称（使用 $derived.by）
	let currentChannelName = $derived.by(() => {
		const channel = channels.find(ch => ch.id === selectedChannel);
		return channel?.name || 'Chat';
	});

	// 设置视图
	function setView(view: ViewType) {
		currentView = view;
	}

	// 切换侧边栏
	function toggleSidebar() {
		sidebarExpanded = !sidebarExpanded;
	}

	// 设置侧边栏展开状态
	function setSidebarExpanded(expanded: boolean) {
		sidebarExpanded = expanded;
	}

	// 设置 Agent 状态
	function setAgentStatusValue(status: AgentStatus) {
		agentStatus = status;
	}

	// 设置连接状态
	function setConnectionStatusValue(status: ConnectionStatus) {
		connectionStatus = status;
	}

	// 设置 API 连接状态
	function setApiConnectionStatus(status: ConnectionStatus) {
		apiConnectionStatus = status;
	}

	// 切换应用模式
	function toggleAppMode() {
		appMode = appMode === 'simple' ? 'advanced' : 'simple';
	}

	// 设置应用模式
	function setAppModeValue(mode: AppMode) {
		appMode = mode;
	}

	// 选择 Channel
	function selectChannel(channelId: string) {
		selectedChannel = channelId;
		currentView = 'chat';
	}

	// 设置 Channel 连接状态
	function setChannelConnected(channelId: string, connected: boolean) {
		channels = channels.map(ch =>
			ch.id === channelId ? { ...ch, connected } : ch
		);
	}

	// 检查 API 连接状态
	async function checkApiConnection(): Promise<boolean> {
		setApiConnectionStatus('connecting');
		try {
			const isHealthy = await agentAPI.healthCheck();
			setApiConnectionStatus(isHealthy ? 'connected' : 'disconnected');
			return isHealthy;
		} catch {
			setApiConnectionStatus('disconnected');
			return false;
		}
	}

	return {
		// 状态getters（保持响应式）
		get view() { return currentView; },
		get sidebarExpanded() { return sidebarExpanded; },
		get agentStatus() { return agentStatus; },
		get apiConnectionStatus() { return apiConnectionStatus; },
		get connectionStatus() { return connectionStatus; },
		get appMode() { return appMode; },
		get selectedChannel() { return selectedChannel; },
		get channels() { return channels; },
		get currentChannelName() { return currentChannelName; },

		// 方法
		setView,
		toggleSidebar,
		setSidebarExpanded,
		setAgentStatusValue,
		setConnectionStatusValue,
		setApiConnectionStatus,
		toggleAppMode,
		setAppModeValue,
		selectChannel,
		setChannelConnected,
		checkApiConnection
	};
}

// 导出一个全局应用状态实例
export const appStore = createAppStore();

// 保持向后兼容的导出（使用 appStore）
export const currentView = {
	get: () => appStore.view,
	set: (v: ViewType) => appStore.setView(v)
};
export const sidebarExpanded = {
	get: () => appStore.sidebarExpanded,
	set: (v: boolean) => appStore.setSidebarExpanded(v)
};
export const agentStatus = {
	get: () => appStore.agentStatus,
	set: (v: AgentStatus) => appStore.setAgentStatusValue(v)
};
export const apiConnectionStatus = {
	get: () => appStore.apiConnectionStatus,
	set: (v: ConnectionStatus) => appStore.setApiConnectionStatus(v)
};
export const connectionStatus = {
	get: () => appStore.connectionStatus,
	set: (v: ConnectionStatus) => appStore.setConnectionStatusValue(v)
};
export const appMode = {
	get: () => appStore.appMode,
	set: (v: AppMode) => appStore.setAppModeValue(v)
};
export const selectedChannel = {
	get: () => appStore.selectedChannel,
	set: (v: string) => appStore.selectChannel(v)
};
export const channels = {
	get: () => appStore.channels,
	set: (v: Channel[]) => { appStore.setChannelConnected; }
};

// 辅助函数（保持向后兼容）
export { appStore as appState };
export function setView(view: ViewType) { appStore.setView(view); }
export function toggleSidebar() { appStore.toggleSidebar(); }
export function setSidebarExpanded(expanded: boolean) { appStore.setSidebarExpanded(expanded); }
export function setAgentStatusValue(status: AgentStatus) { appStore.setAgentStatusValue(status); }
export function setConnectionStatusValue(status: ConnectionStatus) { appStore.setConnectionStatusValue(status); }
export function setApiConnectionStatus(status: ConnectionStatus) { appStore.setApiConnectionStatus(status); }
export function toggleAppMode() { appStore.toggleAppMode(); }
export function setAppModeValue(mode: AppMode) { appStore.setAppModeValue(mode); }
export function selectChannel(channelId: string) { appStore.selectChannel(channelId); }
export function setChannelConnected(channelId: string, connected: boolean) { appStore.setChannelConnected(channelId, connected); }
export async function checkApiConnection(): Promise<boolean> { return appStore.checkApiConnection(); }
