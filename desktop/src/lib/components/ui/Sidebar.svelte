<script lang="ts">
	/**
	 * Sidebar 组件
	 * 使用 shadcn-svelte 风格的侧边栏导航
	 * 支持暗色主题、可折叠
	 */

	import { cn } from "$lib/utils/cn";
	import { Button } from "$lib/components/ui";
	import { ThemeToggle } from "$lib/components/ui";
	import {
		MessageSquare,
		Plus,
		Settings,
		Menu,
		ChevronLeft,
		ChevronRight
	} from "$lib/components/ui/icons";
	import {
		sidebarExpanded,
		selectedChannel,
		channels,
		currentView,
		toggleSidebar,
		selectChannel,
		setView,
		type Channel
	} from "$lib/stores/app";

	// Props
	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();

	// 展开/折叠状态
	let expanded = $state(true);

	// 订阅 store
	$effect(() => {
		const unsubscribe = sidebarExpanded.subscribe((value) => {
			expanded = value;
		});
		return unsubscribe;
	});

	// 当前选中的 channel
	let currentChannel = $state("telegram");

	$effect(() => {
		const unsubscribe = selectedChannel.subscribe((value) => {
			currentChannel = value;
		});
		return unsubscribe;
	});

	// 当前视图
	let view = $state<"chat" | "settings">("chat");

	$effect(() => {
		const unsubscribe = currentView.subscribe((value) => {
			view = value;
		});
		return unsubscribe;
	});

	// Channel 列表
	let channelList: Channel[] = $state([]);

	$effect(() => {
		const unsubscribe = channels.subscribe((value) => {
			channelList = value;
		});
		return unsubscribe;
	});

	// 获取 channel 图标颜色
	function getChannelColor(channelId: string): string {
		const colors: Record<string, string> = {
			telegram: "bg-sky-500",
			discord: "bg-indigo-500",
			whatsapp: "bg-green-500",
			feishu: "bg-blue-500",
			slack: "bg-purple-500"
		};
		return colors[channelId] || "bg-gray-500";
	}

	// 获取 channel 首字母
	function getChannelInitial(channelName: string): string {
		return channelName.charAt(0).toUpperCase();
	}

	// 处理新建对话
	function handleNewChat() {
		// TODO: 实现新建对话逻辑
		// 清空当前会话或创建新会话
	}

	// 处理 channel 选择
	function handleSelectChannel(channelId: string) {
		selectChannel(channelId);
	}

	// 处理设置点击
	function handleSettings() {
		setView("settings");
	}

	// 处理折叠/展开
	function handleToggle() {
		toggleSidebar();
	}
</script>

<aside
	class={cn(
		"sidebar flex flex-col h-full bg-background border-r border-border transition-all duration-300 ease-in-out",
		expanded ? "w-[var(--sidebar-width)]" : "w-[var(--sidebar-collapsed-width)]",
		!expanded && "collapsed",
		className
	)}
>
	<!-- 头部: Logo 和折叠按钮 -->
	<div
		class={cn(
			"flex items-center border-b border-border shrink-0",
			expanded ? "justify-between p-4" : "justify-center p-3"
		)}
	>
		{#if expanded}
			<!-- Logo -->
			<div class="flex items-center gap-2">
				<div
					class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm"
				>
					🤖
				</div>
				<span class="font-semibold text-foreground text-base">nanobot</span>
			</div>
		{/if}

		<!-- 折叠按钮 -->
		<button
			onclick={handleToggle}
			class={cn(
				"toggle-btn shrink-0 inline-flex items-center justify-center rounded-md text-sm font-medium",
				"transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
				"hover:bg-accent hover:text-accent-foreground text-foreground h-9 w-9"
			)}
			aria-label={expanded ? "收起侧边栏" : "展开侧边栏"}
		>
			{#if expanded}
				<ChevronLeft class="h-4 w-4" />
			{:else}
				<ChevronRight class="h-4 w-4" />
			{/if}
		</button>
	</div>

	<!-- 新建对话按钮 -->
	<div class={cn("shrink-0", expanded ? "p-3" : "p-2")}>
		<Button
			variant="default"
			class={cn(
				"w-full transition-all duration-200",
				expanded ? "" : "px-2"
			)}
			onclick={handleNewChat}
		>
			<Plus class={cn("h-4 w-4", expanded && "mr-2")} />
			{#if expanded}
				<span>新建对话</span>
			{/if}
		</Button>
	</div>

	<!-- Channel 列表 -->
	<nav class="channel-list flex-1 overflow-y-auto py-2 px-2">
		{#if expanded}
			<div class="px-3 py-2">
				<h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
					Channels
				</h3>
			</div>
		{/if}

		<div class="space-y-1">
			{#each channelList as channel (channel.id)}
				<button
					onclick={() => handleSelectChannel(channel.id)}
					class={cn(
						"channel-item flex items-center w-full rounded-md transition-colors duration-200",
						"hover:bg-accent hover:text-accent-foreground",
						currentChannel === channel.id && view === "chat"
							? "bg-primary text-primary-foreground hover:bg-primary/90 active"
							: "text-foreground",
						expanded ? "gap-3 px-3 py-2" : "justify-center p-2"
					)}
				>
					<!-- Channel 图标 -->
					<div
						class={cn(
							"shrink-0 flex items-center justify-center rounded-md font-bold text-xs text-white",
							getChannelColor(channel.id),
							expanded ? "w-7 h-7" : "w-8 h-8"
						)}
					>
						{getChannelInitial(channel.name)}
					</div>

					{#if expanded}
						<span class="flex-1 text-sm font-medium truncate">{channel.name}</span>

						<!-- 连接状态指示器 -->
						<span
							class={cn(
								"w-2 h-2 rounded-full",
								channel.connected ? "bg-green-400" : "bg-muted-foreground/30"
							)}
						></span>
					{/if}
				</button>
			{/each}
		</div>
	</nav>

	<!-- 底部: 设置和主题切换 -->
	<div
		class={cn(
			"border-t border-border shrink-0",
			expanded ? "p-3 space-y-2" : "p-2 space-y-2"
		)}
	>
		<!-- 设置按钮 -->
		<button
			onclick={handleSettings}
			class={cn(
				"settings-btn flex items-center w-full rounded-md transition-colors duration-200",
				"hover:bg-accent hover:text-accent-foreground",
				view === "settings"
					? "bg-accent text-accent-foreground active"
					: "text-foreground",
				expanded ? "gap-3 px-3 py-2" : "justify-center p-2"
			)}
		>
			<Settings class={cn("h-5 w-5 shrink-0", expanded && "mr-0")} />
			{#if expanded}
				<span class="text-sm font-medium">设置</span>
			{/if}
		</button>

		<!-- 主题切换 -->
		<div class={cn("flex", expanded ? "justify-start px-1" : "justify-center")}>
			<ThemeToggle />
		</div>
	</div>
</aside>
