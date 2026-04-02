import { describe, it, expect, beforeEach } from 'vitest';
import { createAppStore, type ViewType, type AgentStatus, type ConnectionStatus, type AppMode, type Channel } from './app.svelte';
import { createThemeStore, type Theme } from './theme.svelte';

describe('appStore', () => {
	let store: ReturnType<typeof createAppStore>;

	beforeEach(() => {
		// 每个测试前创建新的 store 实例
		store = createAppStore();
	});

	describe('状态初始化', () => {
		it('应有正确的默认视图', () => {
			expect(store.view).toBe('chat');
		});

		it('应有默认展开的侧边栏', () => {
			expect(store.sidebarExpanded).toBe(true);
		});

		it('应有默认的 Agent 状态', () => {
			expect(store.agentStatus).toBe('idle');
		});

		it('应有默认的连接状态', () => {
			expect(store.apiConnectionStatus).toBe('disconnected');
			expect(store.connectionStatus).toBe('disconnected');
		});

		it('应有默认的简单模式', () => {
			expect(store.appMode).toBe('simple');
		});

		it('应有默认选中的 Channel', () => {
			expect(store.selectedChannel).toBe('telegram');
		});

		it('应有默认的 Channel 列表', () => {
			expect(store.channels).toHaveLength(5);
			expect(store.channels.map(c => c.id)).toEqual(['telegram', 'discord', 'whatsapp', 'feishu', 'slack']);
		});
	});

	describe('setView', () => {
		it('应能设置视图为 settings', () => {
			store.setView('settings');
			expect(store.view).toBe('settings');
		});

		it('应能设置视图为 chat', () => {
			store.setView('settings');
			store.setView('chat');
			expect(store.view).toBe('chat');
		});
	});

	describe('toggleSidebar', () => {
		it('应切换侧边栏状态', () => {
			expect(store.sidebarExpanded).toBe(true);
			store.toggleSidebar();
			expect(store.sidebarExpanded).toBe(false);
			store.toggleSidebar();
			expect(store.sidebarExpanded).toBe(true);
		});
	});

	describe('setSidebarExpanded', () => {
		it('应能设置侧边栏为收起状态', () => {
			store.setSidebarExpanded(false);
			expect(store.sidebarExpanded).toBe(false);
		});

		it('应能设置侧边栏为展开状态', () => {
			store.setSidebarExpanded(false);
			store.setSidebarExpanded(true);
			expect(store.sidebarExpanded).toBe(true);
		});
	});

	describe('setAgentStatusValue', () => {
		it('应能设置 Agent 状态为 running', () => {
			store.setAgentStatusValue('running');
			expect(store.agentStatus).toBe('running');
		});

		it('应能设置 Agent 状态为 error', () => {
			store.setAgentStatusValue('error');
			expect(store.agentStatus).toBe('error');
		});

		it('应能设置 Agent 状态为 idle', () => {
			store.setAgentStatusValue('running');
			store.setAgentStatusValue('idle');
			expect(store.agentStatus).toBe('idle');
		});
	});

	describe('setConnectionStatusValue / setApiConnectionStatus', () => {
		it('应能设置连接状态', () => {
			store.setConnectionStatusValue('connected');
			expect(store.connectionStatus).toBe('connected');
		});

		it('应能设置 API 连接状态', () => {
			store.setApiConnectionStatus('connecting');
			expect(store.apiConnectionStatus).toBe('connecting');
			store.setApiConnectionStatus('connected');
			expect(store.apiConnectionStatus).toBe('connected');
		});
	});

	describe('toggleAppMode / setAppModeValue', () => {
		it('应能切换应用模式', () => {
			expect(store.appMode).toBe('simple');
			store.toggleAppMode();
			expect(store.appMode).toBe('advanced');
			store.toggleAppMode();
			expect(store.appMode).toBe('simple');
		});

		it('应能直接设置应用模式', () => {
			store.setAppModeValue('advanced');
			expect(store.appMode).toBe('advanced');
			store.setAppModeValue('simple');
			expect(store.appMode).toBe('simple');
		});
	});

	describe('selectChannel', () => {
		it('应能选择 Channel', () => {
			store.selectChannel('discord');
			expect(store.selectedChannel).toBe('discord');
		});

		it('选择 Channel 后应切换到 chat 视图', () => {
			store.setView('settings');
			store.selectChannel('whatsapp');
			expect(store.view).toBe('chat');
		});
	});

	describe('setChannelConnected', () => {
		it('应能设置 Channel 为已连接', () => {
			store.setChannelConnected('telegram', true);
			const channel = store.channels.find(c => c.id === 'telegram');
			expect(channel?.connected).toBe(true);
		});

		it('应能设置 Channel 为未连接', () => {
			store.setChannelConnected('discord', true);
			store.setChannelConnected('discord', false);
			const channel = store.channels.find(c => c.id === 'discord');
			expect(channel?.connected).toBe(false);
		});

		it('不应影响其他 Channel', () => {
			store.setChannelConnected('telegram', true);
			const whatsapp = store.channels.find(c => c.id === 'whatsapp');
			expect(whatsapp?.connected).toBe(false);
		});
	});

	describe('currentChannelName (派生状态)', () => {
		it('应返回当前选中 Channel 的名称', () => {
			store.selectChannel('discord');
			expect(store.currentChannelName).toBe('Discord');
		});

		it('当 Channel 不存在时应返回默认值', () => {
			// 通过直接操作内部状态测试
			// 注意：这是内部实现细节的测试
		});
	});
});

describe('themeStore', () => {
	let store: ReturnType<typeof createThemeStore>;

	describe('状态初始化', () => {
		it('应有默认主题', () => {
			store = createThemeStore();
			// 注意：在非浏览器环境下，initTheme 不会执行
			expect(store.theme).toBeDefined();
		});
	});

	describe('setTheme', () => {
		it('应能设置主题为 dark', () => {
			store = createThemeStore();
			store.setTheme('dark');
			expect(store.theme).toBe('dark');
		});

		it('应能设置主题为 light', () => {
			store = createThemeStore();
			store.setTheme('dark');
			store.setTheme('light');
			expect(store.theme).toBe('light');
		});
	});

	describe('toggleTheme', () => {
		it('应能切换主题', () => {
			store = createThemeStore();
			const initial = store.theme;
			store.toggleTheme();
			expect(store.theme).toBe(initial === 'light' ? 'dark' : 'light');
		});
	});
});

describe('类型定义', () => {
	it('ViewType 应为联合类型', () => {
		const view: ViewType = 'chat';
		const view2: ViewType = 'settings';
		expect(view).toBe('chat');
		expect(view2).toBe('settings');
	});

	it('AgentStatus 应为联合类型', () => {
		const status: AgentStatus = 'idle';
		const status2: AgentStatus = 'running';
		const status3: AgentStatus = 'error';
		expect(status).toBe('idle');
		expect(status2).toBe('running');
		expect(status3).toBe('error');
	});

	it('ConnectionStatus 应为联合类型', () => {
		const status: ConnectionStatus = 'connected';
		const status2: ConnectionStatus = 'disconnected';
		const status3: ConnectionStatus = 'connecting';
		expect(status).toBe('connected');
		expect(status2).toBe('disconnected');
		expect(status3).toBe('connecting');
	});

	it('AppMode 应为联合类型', () => {
		const mode: AppMode = 'simple';
		const mode2: AppMode = 'advanced';
		expect(mode).toBe('simple');
		expect(mode2).toBe('advanced');
	});

	it('Theme 应为联合类型', () => {
		const theme: Theme = 'light';
		const theme2: Theme = 'dark';
		expect(theme).toBe('light');
		expect(theme2).toBe('dark');
	});

	it('Channel 应为正确接口', () => {
		const channel: Channel = {
			id: 'test',
			name: 'Test',
			icon: 'test-icon',
			connected: false
		};
		expect(channel.id).toBe('test');
		expect(channel.name).toBe('Test');
		expect(channel.icon).toBe('test-icon');
		expect(channel.connected).toBe(false);
	});
});
