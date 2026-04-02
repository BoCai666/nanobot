/**
 * 历史记录状态管理
 * 支持历史对话的存储、搜索、删除功能
 * 使用 Svelte 5 Runes 语法
 */

import { browser } from '$app/environment';
import { logger } from '$lib/utils/logger';

// ============================================
// 类型定义
// ============================================

/**
 * 历史对话数据结构
 */
export interface ConversationHistory {
	/** 唯一标识符 */
	id: string;
	/** 对话标题 */
	title: string;
	/** 创建时间 */
	createdAt: Date;
	/** 最后更新时间 */
	updatedAt: Date;
	/** 频道 ID */
	channelId: string;
	/** 消息数量 */
	messageCount: number;
	/** 对话预览（前100字符） */
	preview: string;
}

/**
 * 历史记录存储数据结构
 */
interface HistoryStoreData {
	conversations: ConversationHistory[];
	version: number;
}

// ============================================
// 常量定义
// ============================================

const STORAGE_KEY = 'nanobot-history';
const MAX_CONVERSATIONS = 100;
const PREVIEW_MAX_LENGTH = 100;
const CURRENT_VERSION = 1;

// ============================================
// 辅助函数
// ============================================

/**
 * 生成唯一 ID
 */
function generateId(): string {
	return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 截断预览文本
 */
function truncatePreview(text: string): string {
	if (!text) return '';
	const cleaned = text.replace(/\s+/g, ' ').trim();
	return cleaned.length > PREVIEW_MAX_LENGTH 
		? cleaned.substring(0, PREVIEW_MAX_LENGTH) + '...' 
		: cleaned;
}

/**
 * 从 localStorage 读取历史记录
 */
function loadFromStorage(): HistoryStoreData {
	if (!browser) {
		return { conversations: [], version: CURRENT_VERSION };
	}

	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (!saved) {
			return { conversations: [], version: CURRENT_VERSION };
		}

		const data = JSON.parse(saved) as HistoryStoreData;
		
		// 转换日期字符串为 Date 对象
		data.conversations = data.conversations.map(conv => ({
			...conv,
			createdAt: new Date(conv.createdAt),
			updatedAt: new Date(conv.updatedAt)
		}));

		return data;
	} catch (error) {
		logger.error('加载历史记录失败:', error);
		return { conversations: [], version: CURRENT_VERSION };
	}
}

/**
 * 保存历史记录到 localStorage
 */
function saveToStorage(data: HistoryStoreData): void {
	if (!browser) return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch (error) {
		logger.error('保存历史记录失败:', error);
	}
}

// ============================================
// Store 工厂函数
// ============================================

/**
 * 创建历史记录状态管理
 */
export function createHistoryStore() {
	// 历史记录列表
	let conversations = $state<ConversationHistory[]>([]);
	
	// 搜索关键词
	let searchQuery = $state<string>('');
	
	// 是否已初始化
	let initialized = $state<boolean>(false);

	/**
	 * 初始化历史记录
	 */
	function init(): void {
		if (initialized || !browser) return;
		
		const data = loadFromStorage();
		conversations = data.conversations;
		initialized = true;
	}

	/**
	 * 添加新对话
	 */
	function addConversation(
		title: string,
		channelId: string,
		firstMessage: string
	): ConversationHistory {
		const now = new Date();
		const newConversation: ConversationHistory = {
			id: generateId(),
			title: title || '新对话',
			createdAt: now,
			updatedAt: now,
			channelId,
			messageCount: 1,
			preview: truncatePreview(firstMessage)
		};

		// 添加到列表开头
		conversations = [newConversation, ...conversations];

		// 限制最大数量
		if (conversations.length > MAX_CONVERSATIONS) {
			conversations = conversations.slice(0, MAX_CONVERSATIONS);
		}

		// 持久化
		saveToStorage({ conversations, version: CURRENT_VERSION });

		return newConversation;
	}

	/**
	 * 更新对话
	 */
	function updateConversation(
		id: string,
		updates: Partial<Pick<ConversationHistory, 'title' | 'messageCount' | 'preview'>>
	): void {
		const index = conversations.findIndex(c => c.id === id);
		if (index === -1) return;

		const updated: ConversationHistory = {
			...conversations[index],
			...updates,
			updatedAt: new Date()
		};

		// 如果有预览更新，进行截断
		if (updates.preview) {
			updated.preview = truncatePreview(updates.preview);
		}

		// 更新列表
		conversations = [
			updated,
			...conversations.slice(0, index),
			...conversations.slice(index + 1)
		];

		// 持久化
		saveToStorage({ conversations, version: CURRENT_VERSION });
	}

	/**
	 * 删除对话（硬删除）
	 */
	function deleteConversation(id: string): void {
		conversations = conversations.filter(c => c.id !== id);
		saveToStorage({ conversations, version: CURRENT_VERSION });
	}

	/**
	 * 批量删除对话
	 */
	function deleteConversations(ids: string[]): void {
		const idSet = new Set(ids);
		conversations = conversations.filter(c => !idSet.has(c.id));
		saveToStorage({ conversations, version: CURRENT_VERSION });
	}

	/**
	 * 清空所有历史记录
	 */
	function clearAll(): void {
		conversations = [];
		saveToStorage({ conversations: [], version: CURRENT_VERSION });
	}

	/**
	 * 设置搜索关键词
	 */
	function setSearchQuery(query: string): void {
		searchQuery = query.trim().toLowerCase();
	}

	/**
	 * 根据关键词搜索对话
	 */
	function searchConversations(query: string): ConversationHistory[] {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return conversations;

		return conversations.filter(conv => 
			conv.title.toLowerCase().includes(normalizedQuery) ||
			conv.preview.toLowerCase().includes(normalizedQuery) ||
			conv.channelId.toLowerCase().includes(normalizedQuery)
		);
	}

	/**
	 * 根据 ID 获取对话
	 */
	function getConversation(id: string): ConversationHistory | undefined {
		return conversations.find(c => c.id === id);
	}

	/**
	 * 根据频道 ID 获取对话列表
	 */
	function getConversationsByChannel(channelId: string): ConversationHistory[] {
		return conversations.filter(c => c.channelId === channelId);
	}

	// 计算属性：过滤后的对话列表
	const filteredConversations = $derived(() => {
		if (!searchQuery) return conversations;
		return searchConversations(searchQuery);
	});

	// 计算属性：对话总数
	const totalCount = $derived(() => conversations.length);

	// 计算属性：是否为空
	const isEmpty = $derived(() => conversations.length === 0);

	return {
		// 状态 getters
		get conversations() { return conversations; },
		get searchQuery() { return searchQuery; },
		get filteredConversations() { return filteredConversations(); },
		get totalCount() { return totalCount(); },
		get isEmpty() { return isEmpty(); },
		get initialized() { return initialized; },

		// 方法
		init,
		addConversation,
		updateConversation,
		deleteConversation,
		deleteConversations,
		clearAll,
		setSearchQuery,
		searchConversations,
		getConversation,
		getConversationsByChannel
	};
}

// ============================================
// 导出全局实例
// ============================================

/** 全局历史记录状态实例 */
export const historyStore = createHistoryStore();

// ============================================
// 向后兼容的导出
// ============================================

export const conversations = {
	get: () => historyStore.conversations
};

export function initHistory(): void { historyStore.init(); }
export function addConversation(title: string, channelId: string, firstMessage: string): ConversationHistory {
	return historyStore.addConversation(title, channelId, firstMessage);
}
export function updateConversation(id: string, updates: Partial<Pick<ConversationHistory, 'title' | 'messageCount' | 'preview'>>): void {
	historyStore.updateConversation(id, updates);
}
export function deleteConversation(id: string): void { historyStore.deleteConversation(id); }
export function clearHistory(): void { historyStore.clearAll(); }
export function searchHistory(query: string): ConversationHistory[] { return historyStore.searchConversations(query); }
