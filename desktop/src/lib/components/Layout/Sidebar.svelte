<script lang="ts">
	import { sidebarExpanded, selectedChannel, channels, currentView, toggleSidebar, selectChannel, setView } from '$lib/stores/app';

	// 图标组件 - Telegram
	function TelegramIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor">
			<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
		</svg>`;
	}

	// 图标组件 - Discord
	function DiscordIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor">
			<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
		</svg>`;
	}

	// 图标组件 - WhatsApp
	function WhatsAppIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor">
			<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
		</svg>`;
	}

	// 图标组件 - Feishu (使用通用消息图标)
	function FeishuIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
		</svg>`;
	}

	// 图标组件 - Slack
	function SlackIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor">
			<path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
		</svg>`;
	}

	// 图标组件 - 设置
	function SettingsIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="3"/>
			<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
		</svg>`;
	}

	// 图标组件 - 收起/展开
	function ChevronLeftIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="m15 18-6-6 6-6"/>
		</svg>`;
	}

	function ChevronRightIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="m9 18 6-6-6-6"/>
		</svg>`;
	}

	// Channel 图标映射
	const channelIcons: Record<string, (props: { class?: string }) => string> = {
		telegram: TelegramIcon,
		discord: DiscordIcon,
		whatsapp: WhatsAppIcon,
		feishu: FeishuIcon,
		slack: SlackIcon
	};

	// 获取图标函数
	function getChannelIcon(channelId: string, className: string): string {
		const iconFn = channelIcons[channelId];
		return iconFn ? iconFn({ class: className }) : FeishuIcon({ class: className });
	}
</script>

<aside
	class="sidebar"
	class:expanded={$sidebarExpanded}
	style:width={$sidebarExpanded ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)'}
>
	<!-- 头部: Logo 和折叠按钮 -->
	<div class="sidebar-header">
		<div class="logo">
			<span class="logo-icon">🤖</span>
			<span class="logo-text" class:hidden={!$sidebarExpanded}>nanobot</span>
		</div>
		<button
			class="toggle-btn"
			onclick={() => toggleSidebar()}
			title={$sidebarExpanded ? '收起侧边栏' : '展开侧边栏'}
			aria-label={$sidebarExpanded ? '收起侧边栏' : '展开侧边栏'}
		>
			{#if $sidebarExpanded}
				{@html ChevronLeftIcon({ class: 'w-4 h-4' })}
			{:else}
				{@html ChevronRightIcon({ class: 'w-4 h-4' })}
			{/if}
		</button>
	</div>

	<!-- Channel 列表 -->
	<nav class="channel-list" aria-label="频道列表">
		<div class="section-title" class:hidden={!$sidebarExpanded}>
			Channels
		</div>
		{#each $channels as channel (channel.id)}
			<button
				class="channel-item"
				class:active={$selectedChannel === channel.id}
				onclick={() => selectChannel(channel.id)}
				title={channel.name}
				aria-label="{channel.name}{channel.connected ? ' (已连接)' : ' (未连接)'}"
			>
				<div class="channel-icon">
					{@html getChannelIcon(channel.id, 'w-5 h-5')}
				</div>
				<span class="channel-name" class:hidden={!$sidebarExpanded}>{channel.name}</span>
				<span
					class="connection-indicator"
					class:connected={channel.connected}
					class:hidden={!$sidebarExpanded}
				></span>
			</button>
		{/each}
	</nav>

	<!-- 底部: 设置入口 -->
	<div class="sidebar-footer">
		<button
			class="settings-btn"
			class:active={$currentView === 'settings'}
			onclick={() => setView('settings')}
			title="设置"
			aria-label="设置"
		>
			<div class="settings-icon">
				{@html SettingsIcon({ class: 'w-5 h-5' })}
			</div>
			<span class="settings-text" class:hidden={!$sidebarExpanded}>设置</span>
		</button>
	</div>
</aside>

<style>
	/* 侧边栏容器 - 温暖柔和背景 */
	.sidebar {
		display: flex;
		flex-direction: column;
		background-color: var(--color-bg-secondary);
		border-right: 1px solid var(--color-border);
		transition: width var(--duration-base) var(--ease-out),
		            background-color var(--duration-base) var(--ease-out);
		overflow: hidden;
		flex-shrink: 0;
		/* GPU 加速优化 */
		transform: translateZ(0);
		will-change: width;
		/* 限制重排影响范围 */
		contain: layout style;
	}

	/* 头部区域 */
	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4);
		border-bottom: 1px solid var(--color-border);
		background-color: transparent;
	}

	/* Logo 区域 - 使用 Lato 字体 */
	.logo {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		overflow: hidden;
	}

	.logo-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
		transition: transform var(--transition-fast);
	}

	.logo:hover .logo-icon {
		transform: scale(1.05);
	}

	/* Logo 文字 - Lato 字体，温暖友好 */
	.logo-text {
		font-family: var(--font-sans); /* Lato */
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text-primary);
		white-space: nowrap;
		letter-spacing: var(--tracking-normal);
		transition: opacity var(--transition-fast), transform var(--transition-fast);
		transform-origin: left center;
	}

	/* 折叠状态下文字淡出 */
	.sidebar:not(.expanded) .logo-text {
		opacity: 0;
		transform: translateX(-8px);
	}

	/* 折叠按钮 - 友好圆角 */
	.toggle-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		flex-shrink: 0;
	}

	.toggle-btn:hover {
		background-color: var(--color-bg-tertiary);
		color: var(--color-text-primary);
		transform: scale(1.05);
	}

	.toggle-btn:active {
		transform: scale(0.95);
	}

	/* Channel 列表区域 */
	.channel-list {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-3);
		scrollbar-gutter: stable;
	}

	/* 区块标题 */
	.section-title {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wider);
		color: var(--color-text-tertiary);
		padding: var(--space-2) var(--space-2) var(--space-3);
		white-space: nowrap;
		transition: opacity var(--transition-fast);
	}

	.section-title.hidden {
		opacity: 0;
		pointer-events: none;
	}

	/* 频道项目 - 友好圆角和交互 */
	.channel-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-lg);
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: left;
		position: relative;
		overflow: hidden;
	}

	.channel-item:hover {
		background-color: var(--color-bg-tertiary);
		color: var(--color-text-primary);
		transform: translateX(2px);
	}

	.channel-item:active {
		transform: translateX(0) scale(0.98);
	}

	.channel-item.active {
		background-color: var(--color-primary);
		color: var(--color-text-inverse);
		box-shadow: var(--shadow-md);
	}

	.channel-item.active:hover {
		background-color: var(--color-primary-dark);
		transform: translateX(0);
	}

	/* 频道图标容器 */
	.channel-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-md);
		background-color: var(--color-bg-tertiary);
		flex-shrink: 0;
		transition: background-color var(--transition-fast), transform var(--transition-fast);
	}

	.channel-item:hover .channel-icon {
		transform: scale(1.05);
	}

	.channel-item.active .channel-icon {
		background-color: color-mix(in srgb, var(--color-text-inverse) 20%, transparent);
	}

	/* 频道名称 - 带过渡动画 */
	.channel-name {
		flex: 1;
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		transition: opacity var(--transition-fast);
	}

	/* 连接状态指示器 - 更明显，使用语义色 */
	.connection-indicator {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background-color: var(--color-error);
		flex-shrink: 0;
		transition: background-color var(--transition-base), transform var(--transition-fast);
		position: relative;
	}

	/* 连接状态 - 成功绿色 + 微妙脉动 */
	.connection-indicator.connected {
		background-color: var(--color-success);
		animation: pulse-glow 2s ease-in-out infinite;
	}

	/* 脉动动画 */
	@keyframes pulse-glow {
		0%, 100% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-success) 40%, transparent);
		}
		50% {
			box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-success) 0%, transparent);
		}
	}

	/* 底部区域 */
	.sidebar-footer {
		padding: var(--space-3);
		border-top: 1px solid var(--color-border);
		background-color: transparent;
	}

	/* 设置按钮 - 与频道项目风格一致 */
	.settings-btn {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-lg);
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: left;
	}

	.settings-btn:hover {
		background-color: var(--color-bg-tertiary);
		color: var(--color-text-primary);
		transform: translateX(2px);
	}

	.settings-btn:active {
		transform: translateX(0) scale(0.98);
	}

	.settings-btn.active {
		background-color: var(--color-bg-tertiary);
		color: var(--color-primary);
	}

	.settings-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-md);
		flex-shrink: 0;
		transition: transform var(--transition-fast);
	}

	.settings-btn:hover .settings-icon {
		transform: rotate(15deg);
	}

	.settings-text {
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: 500;
		white-space: nowrap;
		transition: opacity var(--transition-fast);
	}

	/* 通用隐藏类 - 配合 class:hidden 指令 */
	.hidden {
		opacity: 0;
		pointer-events: none;
	}

	/* Logo 文字隐藏状态 */
	.logo-text.hidden {
		opacity: 0;
		transform: translateX(-8px);
	}

	/* 频道名称隐藏状态 */
	.channel-name.hidden {
		opacity: 0;
		width: 0;
		padding: 0;
	}

	/* 设置文字隐藏状态 */
	.settings-text.hidden {
		opacity: 0;
		width: 0;
		padding: 0;
	}

	/* 连接状态指示器隐藏状态 */
	.connection-indicator.hidden {
		opacity: 0;
		transform: scale(0);
	}

	/* 区块标题隐藏状态 */
	.section-title.hidden {
		opacity: 0;
		height: 0;
		padding: 0;
		overflow: hidden;
	}

	/* 滚动条样式 - 温暖色调 */
	.channel-list::-webkit-scrollbar {
		width: 6px;
	}

	.channel-list::-webkit-scrollbar-track {
		background: transparent;
	}

	.channel-list::-webkit-scrollbar-thumb {
		background: var(--color-neutral-300);
		border-radius: 3px;
	}

	.channel-list::-webkit-scrollbar-thumb:hover {
		background: var(--color-neutral-400);
	}

	/* 深色模式滚动条 */
	@media (prefers-color-scheme: dark) {
		.channel-list::-webkit-scrollbar-thumb {
			background: var(--color-neutral-600);
		}

		.channel-list::-webkit-scrollbar-thumb:hover {
			background: var(--color-neutral-500);
		}
	}
</style>
