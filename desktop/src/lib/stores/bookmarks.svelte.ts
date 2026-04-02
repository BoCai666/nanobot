/**
 * 收藏状态管理
 * 支持对话收藏功能，使用 localStorage 持久化
 * 使用 Svelte 5 Runes 语法
 */

import { browser } from '$app/environment';
import { logger } from '$lib/utils/logger';

// 收藏数据结构
export interface Bookmark {
	/** 收藏唯一标识符 */
	id: string;
	/** 对话 ID */
	conversationId: string;
	/** 收藏标题（通常是第一条消息的摘要） */
	title: string;
	/** 创建时间 */
	createdAt: Date | string;
	/** 所属频道 ID */
	channelId: string;
	/** 预览内容（可选，显示部分消息内容） */
	preview?: string;
}

// localStorage key
const STORAGE_KEY = 'nanobot-bookmarks';

// 最大收藏数量
const MAX_BOOKMARKS = 20;

/**
 * 生成唯一 ID
 */
function generateId(): string {
	return `bookmark-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * 创建收藏状态管理函数
 */
export function createBookmarksStore() {
	// 收藏列表状态
	let bookmarks = $state<Bookmark[]>([]);

	/**
	 * 从 localStorage 加载收藏
	 */
	function loadFromStorage(): void {
		if (!browser) return;

		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved) as Bookmark[];
				// 转换日期字符串为 Date 对象
				bookmarks = parsed.map(b => ({
					...b,
					createdAt: typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt
				}));
			}
		} catch (error) {
			logger.error('Failed to load bookmarks from storage:', error);
			bookmarks = [];
		}
	}

	/**
	 * 保存收藏到 localStorage
	 */
	function saveToStorage(): void {
		if (!browser) return;

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
		} catch (error) {
			logger.error('Failed to save bookmarks to storage:', error);
		}
	}

	/**
	 * 添加收藏
	 * @returns 成功返回 true，超过最大数量返回 false
	 */
	function addBookmark(
		conversationId: string,
		title: string,
		channelId: string,
		preview?: string
	): boolean {
		// 检查是否已存在
		if (bookmarks.some(b => b.conversationId === conversationId)) {
			return false;
		}

		// 检查是否超过最大数量
		if (bookmarks.length >= MAX_BOOKMARKS) {
			return false;
		}

		const newBookmark: Bookmark = {
			id: generateId(),
			conversationId,
			title: title.slice(0, 100), // 限制标题长度
			createdAt: new Date(),
			channelId,
			preview: preview?.slice(0, 200) // 限制预览长度
		};

		bookmarks = [newBookmark, ...bookmarks];
		saveToStorage();
		return true;
	}

	/**
	 * 移除收藏
	 */
	function removeBookmark(bookmarkId: string): void {
		bookmarks = bookmarks.filter(b => b.id !== bookmarkId);
		saveToStorage();
	}

	/**
	 * 通过对话 ID 移除收藏
	 */
	function removeByConversationId(conversationId: string): void {
		bookmarks = bookmarks.filter(b => b.conversationId !== conversationId);
		saveToStorage();
	}

	/**
	 * 检查对话是否已收藏
	 */
	function isBookmarked(conversationId: string): boolean {
		return bookmarks.some(b => b.conversationId === conversationId);
	}

	/**
	 * 获取收藏
	 */
	function getBookmark(conversationId: string): Bookmark | undefined {
		return bookmarks.find(b => b.conversationId === conversationId);
	}

	/**
	 * 获取指定频道的收藏
	 */
	function getBookmarksByChannel(channelId: string): Bookmark[] {
		return bookmarks.filter(b => b.channelId === channelId);
	}

	/**
	 * 清除所有收藏
	 */
	function clearAll(): void {
		bookmarks = [];
		saveToStorage();
	}

	/**
	 * 获取剩余可收藏数量
	 */
	function getRemainingSlots(): number {
		return MAX_BOOKMARKS - bookmarks.length;
	}

	/**
	 * 初始化收藏状态
	 */
	function initBookmarks(): void {
		loadFromStorage();
	}

	return {
		// 状态 getter
		get bookmarks() { return bookmarks; },
		get count() { return bookmarks.length; },
		get maxBookmarks() { return MAX_BOOKMARKS; },
		get remainingSlots() { return getRemainingSlots(); },

		// 方法
		addBookmark,
		removeBookmark,
		removeByConversationId,
		isBookmarked,
		getBookmark,
		getBookmarksByChannel,
		clearAll,
		initBookmarks,

		// 内部方法（供测试）
		_loadFromStorage: loadFromStorage,
		_saveToStorage: saveToStorage
	};
}

// 导出一个全局收藏状态实例
export const bookmarksStore = createBookmarksStore();

// 便捷方法导出
export function addBookmark(
	conversationId: string,
	title: string,
	channelId: string,
	preview?: string
): boolean {
	return bookmarksStore.addBookmark(conversationId, title, channelId, preview);
}

export function removeBookmark(bookmarkId: string): void {
	bookmarksStore.removeBookmark(bookmarkId);
}

export function isBookmarked(conversationId: string): boolean {
	return bookmarksStore.isBookmarked(conversationId);
}

export function initBookmarks(): void {
	bookmarksStore.initBookmarks();
}
