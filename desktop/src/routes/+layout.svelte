<script lang="ts">
	import "../app.css";
	import { onMount, onDestroy } from "svelte";
	import { Sidebar, StatusBar, ShortcutsHelp } from "$lib/components/ui";
	import { SettingsPanel } from "$lib/components/Settings";
	import { ChatView } from "$lib/components/Chat";
	import { initTheme } from "$lib/stores/theme";
	import { currentView, toggleSidebar, setView } from "$lib/stores/app";
	import {
		shortcutManager,
		type ShortcutDefinition
	} from "$lib/utils/shortcuts";

	// 快捷键帮助面板状态
	let shortcutsHelpOpen = $state(false);

	onMount(() => {
		initTheme();
		initShortcuts();
	});

	onDestroy(() => {
		shortcutManager.destroy();
	});

	/**
	 * 初始化快捷键系统
	 */
	function initShortcuts() {
		// 定义快捷键并连接到 app actions
		const shortcuts: ShortcutDefinition[] = [
			{
				id: "new-chat",
				label: "新建对话",
				description: "创建一个新的对话会话",
				key: "n",
				ctrl: true,
				action: () => {
					// TODO: 实现新建对话功能
					console.log("新建对话");
				},
				group: "导航"
			},
			{
				id: "search-history",
				label: "搜索历史",
				description: "快速搜索历史记录",
				key: "k",
				ctrl: true,
				action: () => {
					// TODO: 实现搜索历史功能
					console.log("搜索历史");
				},
				group: "导航"
			},
			{
				id: "toggle-sidebar",
				label: "切换侧边栏",
				description: "显示或隐藏侧边栏",
				key: "b",
				ctrl: true,
				action: () => {
					toggleSidebar();
				},
				group: "界面"
			},
			{
				id: "open-settings",
				label: "打开设置",
				description: "打开应用设置面板",
				key: "t",
				ctrl: true,
				shift: true,
				action: () => {
					setView("settings");
				},
				group: "界面"
			},
			{
				id: "show-shortcuts",
				label: "快捷键帮助",
				description: "显示所有快捷键列表",
				key: "/",
				ctrl: true,
				action: () => {
					shortcutsHelpOpen = true;
				},
				group: "帮助"
			},
			{
				id: "close-dialog",
				label: "关闭对话框",
				description: "关闭当前对话框或面板",
				key: "Escape",
				action: () => {
					// 关闭快捷键帮助面板
					if (shortcutsHelpOpen) {
						shortcutsHelpOpen = false;
						return;
					}
					// 如果在设置视图，返回聊天视图
					if ($currentView === "settings") {
						setView("chat");
					}
				},
				group: "界面"
			}
		];

		// 注册所有快捷键
		shortcutManager.registerAll(shortcuts);

		// 启动全局监听
		shortcutManager.start();
	}
</script>

<div class="app-layout">
	<div class="app-body">
		<Sidebar />
		<div class="main-area">
			{#if $currentView === "settings"}
				<SettingsPanel />
			{:else}
				<ChatView channelName="nanobot" />
			{/if}
		</div>
	</div>
	<StatusBar />
</div>

<!-- 快捷键帮助面板 -->
<ShortcutsHelp bind:open={shortcutsHelpOpen} manager={shortcutManager} />

<style>
	.app-layout {
		display: flex;
		flex-direction: column;
		height: 100vh;
		height: 100dvh; /* 支持动态视口高度 */
		overflow: hidden;
	}

	.app-body {
		display: flex;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	.main-area {
		display: flex;
		flex: 1;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
	}
</style>
