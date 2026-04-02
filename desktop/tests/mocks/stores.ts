/**
 * 应用 Stores Mock
 * 模拟应用中使用的全局状态
 */

import { createMockWritable, createMockReadable, createMockStoreFactory } from '../helpers/mock-store.js';

/**
 * 消息类型定义
 */
export interface Message {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: number;
	thinking?: string;
	status?: 'sending' | 'sent' | 'error';
}

/**
 * 连接状态
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

/**
 * 创建 Mock Messages Store
 */
export function createMockMessagesStore(initialMessages: Message[] = []) {
	return createMockWritable<Message[]>(initialMessages);
}

/**
 * 创建 Mock Connection Status Store
 */
export function createMockConnectionStore(initialStatus: ConnectionStatus = 'disconnected') {
	return createMockWritable<ConnectionStatus>(initialStatus);
}

/**
 * 创建 Mock UI State Store
 */
export interface UIState {
	sidebarOpen: boolean;
	theme: 'light' | 'dark' | 'system';
	isLoading: boolean;
}

export function createMockUIStore(initialState: Partial<UIState> = {}) {
	const defaults: UIState = {
		sidebarOpen: true,
		theme: 'system',
		isLoading: false,
		...initialState,
	};
	return createMockWritable<UIState>(defaults);
}

/**
 * 创建 Mock Settings Store
 */
export interface Settings {
	apiBaseUrl: string;
	streamEnabled: boolean;
	autoConnect: boolean;
	timeout: number;
}

export function createMockSettingsStore(initialSettings: Partial<Settings> = {}) {
	const defaults: Settings = {
		apiBaseUrl: 'http://localhost:18790',
		streamEnabled: true,
		autoConnect: true,
		timeout: 30000,
		...initialSettings,
	};
	return createMockWritable<Settings>(defaults);
}

/**
 * 创建 Mock Agent Status Store
 */
export interface AgentStatus {
	running: boolean;
	model?: string;
	lastActivity?: string;
	channels: Record<string, { enabled: boolean; running: boolean }>;
}

export function createMockAgentStore(initialStatus: Partial<AgentStatus> = {}) {
	const defaults: AgentStatus = {
		running: false,
		channels: {},
		...initialStatus,
	};
	return createMockWritable<AgentStatus>(defaults);
}

/**
 * 创建 Mock Chat Session Store
 */
export interface ChatSession {
	id: string;
	name: string;
	messages: Message[];
	createdAt: number;
	updatedAt: number;
}

export function createMockSessionStore(initialSessions: ChatSession[] = []) {
	return createMockWritable<ChatSession[]>(initialSessions);
}

/**
 * 应用 Stores 工厂
 */
export const createAppStores = () => {
	const messages = createMockMessagesStore();
	const connection = createMockConnectionStore();
	const ui = createMockUIStore();
	const settings = createMockSettingsStore();
	const agent = createMockAgentStore();
	const sessions = createMockSessionStore();

	return {
		messages,
		connection,
		ui,
		settings,
		agent,
		sessions,
	};
};

/**
 * 预设的 Mock Stores
 */
export const mockStores = createAppStores();

/**
 * 重置所有 Stores 到默认值
 */
export function resetMockStores() {
	mockStores.messages.reset();
	mockStores.connection.reset();
	mockStores.ui.reset();
	mockStores.settings.reset();
	mockStores.agent.reset();
	mockStores.sessions.reset();
}

/**
 * 辅助函数：添加消息到 messages store
 */
export function addMockMessage(
	store: ReturnType<typeof createMockMessagesStore>,
	message: Omit<Message, 'id' | 'timestamp'>
) {
	const newMessage: Message = {
		...message,
		id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
		timestamp: Date.now(),
	};
	store.update(messages => [...messages, newMessage]);
	return newMessage;
}

/**
 * 辅助函数：清除所有消息
 */
export function clearMockMessages(store: ReturnType<typeof createMockMessagesStore>) {
	store.set([]);
}

/**
 * 辅助函数：设置连接状态
 */
export function setMockConnectionStatus(
	store: ReturnType<typeof createMockConnectionStore>,
	status: ConnectionStatus
) {
	store.set(status);
}
