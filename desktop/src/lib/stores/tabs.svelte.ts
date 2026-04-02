/**
 * 标签页状态管理
 * 使用 Svelte 5 Runes 语法
 * 
 * 实现多对话窗口的标签页模式
 */

// 标签页数据结构
export interface Tab {
	id: string;
	title: string;
	channelId: string;
	isActive: boolean;
	createdAt: Date;
}

// 生成唯一 ID
function generateTabId(): string {
	return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// 创建标签页状态管理函数
export function createTabsStore() {
	// 标签页列表
	let tabs = $state<Tab[]>([]);

	// 当前激活的标签页 ID
	let activeTabId = $state<string | null>(null);

	// 获取当前激活的标签页
	let activeTab = $derived(() => {
		return tabs.find(tab => tab.id === activeTabId) || null;
	});

	// 标签页数量
	let tabCount = $derived(() => tabs.length);

	// 创建新标签页
	function createTab(channelId: string, title?: string): Tab {
		const tab: Tab = {
			id: generateTabId(),
			title: title || getDefaultTitle(channelId),
			channelId,
			isActive: false,
			createdAt: new Date()
		};
		
		tabs = [...tabs, tab];
		return tab;
	}

	// 获取默认标签标题
	function getDefaultTitle(channelId: string): string {
		const channelNames: Record<string, string> = {
			telegram: 'Telegram',
			discord: 'Discord',
			whatsapp: 'WhatsApp',
			feishu: 'Feishu',
			slack: 'Slack'
		};
		return channelNames[channelId] || '新对话';
	}

	// 激活标签页
	function activateTab(tabId: string): void {
		tabs = tabs.map(tab => ({
			...tab,
			isActive: tab.id === tabId
		}));
		activeTabId = tabId;
	}

	// 关闭标签页
	function closeTab(tabId: string): string | null {
		const tabIndex = tabs.findIndex(tab => tab.id === tabId);
		if (tabIndex === -1) return null;

		// 如果关闭的是当前激活的标签页，需要切换到其他标签页
		let nextActiveTabId: string | null = null;
		
		if (activeTabId === tabId) {
			// 优先切换到右边的标签页，否则切换到左边
			const nextTab = tabs[tabIndex + 1] || tabs[tabIndex - 1];
			nextActiveTabId = nextTab?.id || null;
		} else {
			nextActiveTabId = activeTabId;
		}

		// 移除标签页
		tabs = tabs.filter(tab => tab.id !== tabId);

		// 更新激活状态
		if (nextActiveTabId) {
			activateTab(nextActiveTabId);
		} else {
			activeTabId = null;
		}

		return nextActiveTabId;
	}

	// 更新标签页标题
	function updateTabTitle(tabId: string, title: string): void {
		tabs = tabs.map(tab => 
			tab.id === tabId ? { ...tab, title } : tab
		);
	}

	// 根据 Channel ID 查找标签页
	function findTabByChannelId(channelId: string): Tab | undefined {
		return tabs.find(tab => tab.channelId === channelId);
	}

	// 打开或切换到指定 Channel 的标签页
	function openChannelTab(channelId: string, title?: string): Tab {
		// 查找是否已有该 Channel 的标签页
		let tab = findTabByChannelId(channelId);
		
		if (!tab) {
			// 创建新标签页
			tab = createTab(channelId, title);
		}
		
		// 激活该标签页
		activateTab(tab.id);
		
		return tab;
	}

	// 关闭所有标签页
	function closeAllTabs(): void {
		tabs = [];
		activeTabId = null;
	}

	// 关闭其他标签页
	function closeOtherTabs(tabId: string): void {
		tabs = tabs.filter(tab => tab.id === tabId);
		activateTab(tabId);
	}

	// 获取标签页索引
	function getTabIndex(tabId: string): number {
		return tabs.findIndex(tab => tab.id === tabId);
	}

	// 移动标签页位置
	function moveTab(fromIndex: number, toIndex: number): void {
		if (fromIndex < 0 || fromIndex >= tabs.length || 
			toIndex < 0 || toIndex >= tabs.length) {
			return;
		}

		const newTabs = [...tabs];
		const [movedTab] = newTabs.splice(fromIndex, 1);
		newTabs.splice(toIndex, 0, movedTab);
		tabs = newTabs;
	}

	return {
		// 状态 getters
		get tabs() { return tabs; },
		get activeTabId() { return activeTabId; },
		get activeTab() { return activeTab; },
		get tabCount() { return tabCount; },

		// 方法
		createTab,
		activateTab,
		closeTab,
		updateTabTitle,
		findTabByChannelId,
		openChannelTab,
		closeAllTabs,
		closeOtherTabs,
		getTabIndex,
		moveTab
	};
}

// 导出全局标签页状态实例
export const tabsStore = createTabsStore();

// 便捷方法导出
export const tabs = {
	get: () => tabsStore.tabs,
	get activeTabId() { return tabsStore.activeTabId; },
	get activeTab() { return tabsStore.activeTab; },
	get count() { return tabsStore.tabCount; }
};

export function createTab(channelId: string, title?: string) {
	return tabsStore.createTab(channelId, title);
}

export function activateTab(tabId: string) {
	tabsStore.activateTab(tabId);
}

export function closeTab(tabId: string) {
	return tabsStore.closeTab(tabId);
}

export function updateTabTitle(tabId: string, title: string) {
	tabsStore.updateTabTitle(tabId, title);
}

export function openChannelTab(channelId: string, title?: string) {
	return tabsStore.openChannelTab(channelId, title);
}

export function closeAllTabs() {
	tabsStore.closeAllTabs();
}

export function closeOtherTabs(tabId: string) {
	tabsStore.closeOtherTabs(tabId);
}
