<script lang="ts">
	import { agentStatus, apiConnectionStatus, appMode, toggleAppMode, checkApiConnection } from '$lib/stores/app';

	// 图标组件 - 播放/运行中
	function PlayIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor">
			<path d="M8 5v14l11-7z"/>
		</svg>`;
	}

	// 图标组件 - 暂停/空闲
	function PauseIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor">
			<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
		</svg>`;
	}

	// 图标组件 - 错误
	function ErrorIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
		</svg>`;
	}

	// 图标组件 - 连接/在线
	function WifiIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor">
			<path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
		</svg>`;
	}

	// 图标组件 - 断开连接
	function WifiOffIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor">
			<path d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.49L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.05C1.91 5.76.59 6.82.36 7l10.08 12.56c.18.22.58.22.76 0l3.65-4.56c.38.63.67 1.31.83 2.03l1.9-.95c-.51-1.55-1.38-2.93-2.54-4.08zM.88 9.47l2.05 2.05C2.92 12.37 2.23 13.15 1.68 14l1.9.95c.64-1.24 1.46-2.37 2.44-3.35l2.05 2.05c-.88.84-1.64 1.79-2.27 2.82l1.9.95c.75-1.25 1.65-2.4 2.7-3.4l6.17 7.68c.18.22.58.22.76 0l.82-1.02L2.1 7.13.88 9.47z"/>
		</svg>`;
	}

	// 图标组件 - 加载中
	function LoaderIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className} animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
		</svg>`;
	}

	// 图标组件 - 简单模式
	function SimpleIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="10"/>
			<path d="M8 12h8"/>
		</svg>`;
	}

	// 图标组件 - 高级模式
	function AdvancedIcon({ class: className = '' }: { class?: string }) {
		return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="3"/>
			<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
		</svg>`;
	}

	// Agent 状态配置
	const agentStatusConfig: Record<string, { icon: typeof PlayIcon; label: string; class: string }> = {
		running: {
			icon: PlayIcon,
			label: 'Agent 运行中',
			class: 'status-running'
		},
		idle: {
			icon: PauseIcon,
			label: 'Agent 空闲',
			class: 'status-idle'
		},
		error: {
			icon: ErrorIcon,
			label: 'Agent 错误',
			class: 'status-error'
		}
	};

	// API 连接状态配置
	const connectionStatusConfig: Record<string, { icon: typeof PlayIcon; label: string; class: string }> = {
		connected: {
			icon: WifiIcon,
			label: 'API 已连接',
			class: 'connection-connected'
		},
		disconnected: {
			icon: WifiOffIcon,
			label: 'API 未连接',
			class: 'connection-disconnected'
		},
		connecting: {
			icon: LoaderIcon,
			label: '连接中...',
			class: 'connection-connecting'
		}
	};

	// 点击连接状态重新检查
	async function handleConnectionClick() {
		if ($apiConnectionStatus !== 'connecting') {
			await checkApiConnection();
		}
	}
</script>

<footer class="status-bar">
	<!-- 左侧: Agent 状态 -->
	<div class="status-left">
		<div class="status-badge {agentStatusConfig[$agentStatus]?.class || ''}">
			<span class="status-dot"></span>
			<span class="status-icon">
				{@html agentStatusConfig[$agentStatus]?.icon({ class: 'w-3.5 h-3.5' }) || ''}
			</span>
			<span class="status-label">{agentStatusConfig[$agentStatus]?.label || '未知'}</span>
		</div>
	</div>

	<!-- 中间: 模式切换 -->
	<div class="status-center">
		<button
			class="mode-toggle-btn"
			onclick={() => toggleAppMode()}
			title={$appMode === 'simple' ? '切换到高级模式' : '切换到简单模式'}
		>
			<span class="mode-icon">
				{#if $appMode === 'simple'}
					{@html SimpleIcon({ class: 'w-3.5 h-3.5' })}
				{:else}
					{@html AdvancedIcon({ class: 'w-3.5 h-3.5' })}
				{/if}
			</span>
			<span class="mode-label">{$appMode === 'simple' ? '简单' : '高级'}</span>
		</button>
	</div>

	<!-- 右侧: API 连接状态 -->
	<div class="status-right">
		<button
			class="status-badge clickable {connectionStatusConfig[$apiConnectionStatus]?.class || ''}"
			onclick={handleConnectionClick}
			title="点击重新检查连接"
		>
			<span class="status-dot"></span>
			<span class="status-icon">
				{@html connectionStatusConfig[$apiConnectionStatus]?.icon({ class: 'w-3.5 h-3.5' }) || ''}
			</span>
			<span class="status-label">{connectionStatusConfig[$apiConnectionStatus]?.label || '未知'}</span>
		</button>
	</div>
</footer>

<style>
	/* 状态栏容器 - 温暖背景 */
	.status-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--statusbar-height);
		padding: 0 var(--space-4);
		background: linear-gradient(
			180deg,
			var(--color-bg-secondary) 0%,
			var(--color-bg-primary) 100%
		);
		border-top: 1px solid var(--color-border);
		font-size: 0.8125rem;
		color: var(--color-fg-secondary);
		position: relative;
	}

	/* 顶部细线 - 品牌色渐变 */
	.status-bar::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(
			90deg,
			var(--color-brand-400) 0%,
			var(--color-primary) 50%,
			var(--color-brand-400) 100%
		);
		opacity: 0.6;
	}

	.status-left,
	.status-right {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.status-center {
		display: flex;
		align-items: center;
	}

	/* 状态徽章 - 圆角胶囊形状 */
	.status-badge {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1.5) var(--space-3);
		border-radius: var(--radius-full);
		background-color: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		transition: all var(--transition-base);
		box-shadow: var(--shadow-sm);
	}

	/* 状态指示点 */
	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: var(--color-fg-muted);
		transition: all var(--transition-base);
	}

	.status-badge.clickable {
		cursor: pointer;
		border: none;
		background: transparent;
		font-size: inherit;
		font-family: inherit;
		padding: var(--space-1.5) var(--space-2);
	}

	.status-badge.clickable:hover {
		background-color: var(--color-bg-tertiary);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.status-badge.clickable:active {
		transform: translateY(0);
	}

	.status-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform var(--transition-fast);
	}

	.status-label {
		font-weight: 500;
		white-space: nowrap;
		letter-spacing: 0.01em;
	}

	/* ===== Agent 状态样式 ===== */
	.status-running {
		background-color: var(--color-success-bg);
		border-color: var(--color-success);
		color: var(--color-success-dark);
	}

	.status-running .status-dot {
		background-color: var(--color-success);
		box-shadow: 0 0 6px var(--color-success);
		animation: pulse-glow 2s ease-in-out infinite;
	}

	.status-running .status-icon {
		color: var(--color-success);
	}

	.status-idle {
		background-color: var(--color-bg-tertiary);
		border-color: var(--color-border);
		color: var(--color-fg-secondary);
	}

	.status-idle .status-dot {
		background-color: var(--color-fg-muted);
	}

	.status-error {
		background-color: var(--color-error-bg);
		border-color: var(--color-error);
		color: var(--color-error-dark);
	}

	.status-error .status-dot {
		background-color: var(--color-error);
		box-shadow: 0 0 6px var(--color-error);
	}

	.status-error .status-icon {
		color: var(--color-error);
	}

	/* ===== 连接状态样式 ===== */
	.connection-connected {
		background-color: var(--color-success-bg);
		border-color: var(--color-success);
		color: var(--color-success-dark);
	}

	.connection-connected .status-dot {
		background-color: var(--color-success);
		box-shadow: 0 0 6px var(--color-success);
		animation: pulse-glow 3s ease-in-out infinite;
	}

	.connection-connected .status-icon {
		color: var(--color-success);
	}

	.connection-disconnected {
		background-color: var(--color-error-bg);
		border-color: var(--color-error);
		color: var(--color-error-dark);
	}

	.connection-disconnected .status-dot {
		background-color: var(--color-error);
		box-shadow: 0 0 6px var(--color-error);
	}

	.connection-disconnected .status-icon {
		color: var(--color-error);
	}

	.connection-connecting {
		background-color: var(--color-warning-bg);
		border-color: var(--color-warning);
		color: var(--color-warning-dark);
	}

	.connection-connecting .status-dot {
		background-color: var(--color-warning);
		animation: pulse-glow 1s ease-in-out infinite;
	}

	.connection-connecting .status-icon {
		color: var(--color-warning);
	}

	/* ===== 模式切换按钮 ===== */
	.mode-toggle-btn {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		background: linear-gradient(
			180deg,
			var(--color-bg-elevated) 0%,
			var(--color-bg-secondary) 100%
		);
		color: var(--color-fg-secondary);
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-base);
		box-shadow: var(--shadow-sm);
		letter-spacing: 0.02em;
	}

	.mode-toggle-btn:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
		background: linear-gradient(
			180deg,
			var(--color-bg-elevated) 0%,
			var(--color-primary-bg) 100%
		);
		box-shadow: var(--shadow-md), 0 0 12px var(--color-primary-shadow);
		transform: translateY(-1px);
	}

	.mode-toggle-btn:active {
		transform: translateY(0);
		box-shadow: var(--shadow-sm);
	}

	.mode-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform var(--transition-fast);
	}

	.mode-toggle-btn:hover .mode-icon {
		transform: scale(1.1);
	}

	.mode-label {
		text-transform: capitalize;
	}

	/* ===== 动画 ===== */
	@keyframes pulse-glow {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.6;
			transform: scale(1.2);
		}
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	:global(.animate-spin) {
		animation: spin 1s linear infinite;
	}
</style>
