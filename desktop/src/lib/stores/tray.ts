/**
 * 托盘状态管理
 * 使用 Svelte 5 runes 语法
 */

import { getSidecarStatus, startSidecar, stopSidecar, type SidecarStatus } from '$lib/api/tray';

/**
 * 通知类型
 */
export interface TrayNotification {
	id: string;
	title: string;
	message: string;
	timestamp: Date;
	read: boolean;
	type: 'info' | 'success' | 'warning' | 'error';
}

/**
 * 托盘菜单项类型
 */
export type TrayMenuItem =
	| { type: 'action'; id: string; label: string; enabled: boolean }
	| { type: 'separator' }
	| { type: 'status'; id: string; label: string; value: string };

/**
 * 创建托盘状态管理
 */
export function createTrayState() {
	// Gateway 运行状态
	let gatewayStatus = $state<SidecarStatus>({ type: 'stopped' });

	// 是否正在加载（启动/停止中）
	let isLoading = $state(false);

	// 错误信息
	let error = $state<string | null>(null);

	// 通知列表
	let notifications = $state<TrayNotification[]>([]);

	// 未读通知数量
	let unreadCount = $derived(notifications.filter(n => !n.read).length);

	// Gateway 是否正在运行
	let isRunning = $derived(gatewayStatus.type === 'running');

	// Gateway 端口号
	let gatewayPort = $derived(
		gatewayStatus.type === 'running' ? gatewayStatus.port : null
	);

	// 状态文本
	let statusText = $derived(getStatusText(gatewayStatus));

	// 状态样式类
	let statusClass = $derived(getStatusClass(gatewayStatus));

	/**
	 * 获取状态文本
	 */
	function getStatusText(status: SidecarStatus): string {
		switch (status.type) {
			case 'stopped':
				return 'Gateway 已停止';
			case 'starting':
				return 'Gateway 启动中...';
			case 'running':
				return `Gateway 运行中 (端口 ${status.port})`;
			case 'stopping':
				return 'Gateway 停止中...';
			case 'crashed':
				return `Gateway 异常: ${status.message}`;
			default:
				return '未知状态';
		}
	}

	/**
	 * 获取状态样式类
	 */
	function getStatusClass(status: SidecarStatus): string {
		switch (status.type) {
			case 'stopped':
				return 'status-stopped';
			case 'starting':
			case 'stopping':
				return 'status-transitioning';
			case 'running':
				return 'status-running';
			case 'crashed':
				return 'status-crashed';
			default:
				return '';
		}
	}

	/**
	 * 刷新 Gateway 状态
	 */
	async function refreshStatus(): Promise<void> {
		try {
			error = null;
			gatewayStatus = await getSidecarStatus();
		} catch (e) {
			error = e instanceof Error ? e.message : '获取状态失败';
			console.error('Failed to get sidecar status:', e);
		}
	}

	/**
	 * 启动 Gateway
	 */
	async function startGateway(): Promise<void> {
		if (isLoading || isRunning) return;

		isLoading = true;
		error = null;

		try {
			const port = await startSidecar();
			gatewayStatus = { type: 'running', port };
			addNotification({
				title: 'Gateway 已启动',
				message: `Gateway 正在端口 ${port} 上运行`,
				type: 'success'
			});
		} catch (e) {
			error = e instanceof Error ? e.message : '启动 Gateway 失败';
			gatewayStatus = { type: 'crashed', message: error };
			addNotification({
				title: 'Gateway 启动失败',
				message: error,
				type: 'error'
			});
		} finally {
			isLoading = false;
		}
	}

	/**
	 * 停止 Gateway
	 */
	async function stopGateway(): Promise<void> {
		if (isLoading || !isRunning) return;

		isLoading = true;
		error = null;

		try {
			await stopSidecar();
			gatewayStatus = { type: 'stopped' };
			addNotification({
				title: 'Gateway 已停止',
				message: 'Gateway 服务已成功停止',
				type: 'info'
			});
		} catch (e) {
			error = e instanceof Error ? e.message : '停止 Gateway 失败';
			addNotification({
				title: 'Gateway 停止失败',
				message: error,
				type: 'error'
			});
		} finally {
			isLoading = false;
		}
	}

	/**
	 * 切换 Gateway 状态
	 */
	async function toggleGateway(): Promise<void> {
		if (isRunning) {
			await stopGateway();
		} else {
			await startGateway();
		}
	}

	/**
	 * 添加通知
	 */
	function addNotification(options: {
		title: string;
		message: string;
		type?: 'info' | 'success' | 'warning' | 'error';
	}): void {
		const notification: TrayNotification = {
			id: crypto.randomUUID(),
			title: options.title,
			message: options.message,
			timestamp: new Date(),
			read: false,
			type: options.type ?? 'info'
		};
		notifications = [notification, ...notifications].slice(0, 50); // 最多保留 50 条
	}

	/**
	 * 标记通知为已读
	 */
	function markNotificationAsRead(id: string): void {
		notifications = notifications.map(n =>
			n.id === id ? { ...n, read: true } : n
		);
	}

	/**
	 * 标记所有通知为已读
	 */
	function markAllNotificationsAsRead(): void {
		notifications = notifications.map(n => ({ ...n, read: true }));
	}

	/**
	 * 清除通知
	 */
	function clearNotifications(): void {
		notifications = [];
	}

	/**
	 * 删除单条通知
	 */
	function removeNotification(id: string): void {
		notifications = notifications.filter(n => n.id !== id);
	}

	/**
	 * 清除错误
	 */
	function clearError(): void {
		error = null;
	}

	/**
	 * 开始自动刷新状态
	 * @param intervalMs 刷新间隔（毫秒）
	 * @returns 停止自动刷新的函数
	 */
	function startAutoRefresh(intervalMs: number = 5000): () => void {
		refreshStatus();
		const interval = setInterval(refreshStatus, intervalMs);
		return () => clearInterval(interval);
	}

	return {
		// 状态（使用 getters 保持响应式）
		get gatewayStatus() { return gatewayStatus; },
		get isLoading() { return isLoading; },
		get error() { return error; },
		get notifications() { return notifications; },
		get unreadCount() { return unreadCount; },
		get isRunning() { return isRunning; },
		get gatewayPort() { return gatewayPort; },
		get statusText() { return statusText; },
		get statusClass() { return statusClass; },

		// 方法
		refreshStatus,
		startGateway,
		stopGateway,
		toggleGateway,
		addNotification,
		markNotificationAsRead,
		markAllNotificationsAsRead,
		clearNotifications,
		removeNotification,
		clearError,
		startAutoRefresh
	};
}

/**
 * 创建全局托盘状态实例
 */
export const trayState = createTrayState();
