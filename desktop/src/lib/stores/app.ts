/**
 * 应用状态管理
 * 使用 Svelte stores
 */

import { writable, derived, get } from 'svelte/store';
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

// 当前视图
export const currentView = writable<ViewType>('chat');

// 侧边栏展开状态
export const sidebarExpanded = writable<boolean>(true);

// Agent 状态
export const agentStatus = writable<AgentStatus>('idle');

// API 连接状态
export const apiConnectionStatus = writable<ConnectionStatus>('disconnected');

// Channel 连接状态（保留用于 Channel 管理）
export const connectionStatus = writable<ConnectionStatus>('disconnected');

// 应用模式 (简单/高级)
export const appMode = writable<AppMode>('simple');

// 当前选中的 Channel
export const selectedChannel = writable<string>('telegram');

// Channel 列表
export const channels = writable<Channel[]>([
	{ id: 'telegram', name: 'Telegram', icon: 'telegram', connected: false },
	{ id: 'discord', name: 'Discord', icon: 'discord', connected: false },
	{ id: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp', connected: false },
	{ id: 'feishu', name: 'Feishu', icon: 'feishu', connected: false },
	{ id: 'slack', name: 'Slack', icon: 'slack', connected: false }
]);

// 当前选中的 Channel 名称
export const currentChannelName = derived(
	[selectedChannel, channels],
	([$selectedChannel, $channels]) => {
		const channel = $channels.find(ch => ch.id === $selectedChannel);
		return channel?.name || 'Chat';
	}
);

// 响应式状态对象（用于组件中的响应式访问）
export const appState = {
	get view() { return get(currentView); },
	get sidebarExpanded() { return get(sidebarExpanded); },
	get agentStatus() { return get(agentStatus); },
	get apiConnectionStatus() { return get(apiConnectionStatus); },
	get connectionStatus() { return get(connectionStatus); },
	get appMode() { return get(appMode); },
	get selectedChannel() { return get(selectedChannel); },
	get channels() { return get(channels); },
	setView: (view: ViewType) => currentView.set(view),
	toggleSidebar: () => sidebarExpanded.update(v => !v),
	toggleAppMode: () => appMode.update(m => m === 'simple' ? 'advanced' : 'simple'),
	selectChannel: (channelId: string) => {
		selectedChannel.set(channelId);
		currentView.set('chat');
	},
};

// 辅助方法
export function setView(view: ViewType) {
	currentView.set(view);
}

export function toggleSidebar() {
	sidebarExpanded.update(v => !v);
}

export function setSidebarExpanded(expanded: boolean) {
	sidebarExpanded.set(expanded);
}

export function setAgentStatusValue(status: AgentStatus) {
	agentStatus.set(status);
}

export function setConnectionStatusValue(status: ConnectionStatus) {
	connectionStatus.set(status);
}

export function setApiConnectionStatus(status: ConnectionStatus) {
	apiConnectionStatus.set(status);
}

export function toggleAppMode() {
	appMode.update(m => m === 'simple' ? 'advanced' : 'simple');
}

export function setAppModeValue(mode: AppMode) {
	appMode.set(mode);
}

export function selectChannel(channelId: string) {
	selectedChannel.set(channelId);
	currentView.set('chat');
}

export function setChannelConnected(channelId: string, connected: boolean) {
	channels.update(list =>
		list.map(ch =>
			ch.id === channelId ? { ...ch, connected } : ch
		)
	);
}

// 检查 API 连接状态
export async function checkApiConnection(): Promise<boolean> {
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
