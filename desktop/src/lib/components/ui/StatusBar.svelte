<script lang="ts">
	/**
	 * StatusBar 组件
	 * 显示连接状态、Agent 状态和主题切换
	 * 固定在页面底部
	 */

	import { agentStatus, apiConnectionStatus, checkApiConnection, type AgentStatus, type ConnectionStatus } from '$lib/stores/app';
	import { ThemeToggle } from '$lib/components/ui';
	import { Wifi, WifiOff, Loader2 } from 'lucide-svelte';
	import { cn } from '$lib/utils/cn';

	// Agent 状态配置
	const agentStatusConfig: Record<AgentStatus, { label: string; class: string }> = {
		idle: {
			label: 'Idle',
			class: 'status-idle'
		},
		running: {
			label: 'Thinking...',
			class: 'status-running'
		},
		error: {
			label: 'Error',
			class: 'status-error'
		}
	};

	// 连接状态配置
	const connectionStatusConfig: Record<ConnectionStatus, { label: string; class: string }> = {
		connected: {
			label: 'Connected',
			class: 'connection-connected'
		},
		disconnected: {
			label: 'Disconnected',
			class: 'connection-disconnected'
		},
		connecting: {
			label: 'Connecting...',
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
	<div class="status-section">
		<div class={cn('status-item', agentStatusConfig[$agentStatus]?.class)}>
			{#if $agentStatus === 'running'}
				<Loader2 class="h-4 w-4 animate-spin" />
			{/if}
			<span class="status-label">{agentStatusConfig[$agentStatus]?.label || 'Unknown'}</span>
		</div>
	</div>

	<!-- 右侧: 连接状态和主题切换 -->
	<div class="status-section">
		<!-- 连接状态 -->
		<button
			class={cn('status-item clickable', connectionStatusConfig[$apiConnectionStatus]?.class)}
			onclick={handleConnectionClick}
			title="点击重新检查连接"
		>
			{#if $apiConnectionStatus === 'connected'}
				<Wifi class="h-4 w-4" />
			{:else if $apiConnectionStatus === 'disconnected'}
				<WifiOff class="h-4 w-4" />
			{:else}
				<Loader2 class="h-4 w-4 animate-spin" />
			{/if}
			<span class="status-label">{connectionStatusConfig[$apiConnectionStatus]?.label || 'Unknown'}</span>
		</button>

		<!-- 主题切换 -->
		<ThemeToggle class="h-7 w-7" />
	</div>
</footer>

<style>
	.status-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--statusbar-height);
		padding: 0 var(--space-4);
		background-color: var(--color-bg-secondary);
		border-top: 1px solid var(--color-border);
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		flex-shrink: 0;
		position: relative;
	}

	.status-section {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.status-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
	}

	.status-item.clickable {
		cursor: pointer;
		border: none;
		background: transparent;
		font-size: inherit;
		font-family: inherit;
		color: inherit;
	}

	.status-item.clickable:hover {
		opacity: 0.8;
	}

	.status-label {
		font-weight: 500;
		white-space: nowrap;
	}

	/* Agent 状态样式 */
	.status-running {
		color: var(--color-success);
		background-color: var(--color-success-bg);
	}

	.status-idle {
		color: var(--color-text-tertiary);
		background-color: var(--color-bg-tertiary);
	}

	.status-error {
		color: var(--color-error);
		background-color: var(--color-error-bg);
	}

	/* 连接状态样式 */
	.connection-connected {
		color: var(--color-success);
		background-color: var(--color-success-bg);
	}

	.connection-disconnected {
		color: var(--color-error);
		background-color: var(--color-error-bg);
	}

	.connection-connecting {
		color: var(--color-warning);
		background-color: var(--color-warning-bg);
	}

	/* 动画 */
	:global(.animate-spin) {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
