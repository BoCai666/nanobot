/**
 * 键盘快捷键管理系统
 * 
 * 功能：
 * - 全局快捷键注册与监听
 * - 平台感知 (Mac vs Windows/Linux)
 * - 快捷键冲突检测
 * - 可访问性支持
 */

import { logger } from '$lib/utils/logger';

/**
 * 快捷键定义
 */
export interface ShortcutDefinition {
	/** 快捷键唯一标识 */
	id: string;
	/** 显示名称 */
	label: string;
	/** 描述信息 */
	description?: string;
	/** 按键组合 (不包含修饰键) */
	key: string;
	/** 需要 Ctrl/Cmd 修饰键 */
	ctrl?: boolean;
	/** 需要 Shift 修饰键 */
	shift?: boolean;
	/** 需要 Alt/Option 修饰键 */
	alt?: boolean;
	/** 回调函数 */
	action: () => void;
	/** 是否在输入框内也触发 */
	enableInInput?: boolean;
	/** 分组名称 */
	group?: string;
}

/**
 * 快捷键状态
 */
export interface ShortcutState {
	/** 是否已注册 */
	registered: boolean;
	/** 触发次数 */
	triggerCount: number;
	/** 最后触发时间 */
	lastTriggered?: number;
}

/**
 * 检测是否为 macOS 平台
 */
export function isMacOS(): boolean {
	if (typeof navigator === "undefined") return false;
	return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

/**
 * 获取平台特定的修饰键显示名称
 */
export function getModifierKey(): {
	ctrl: string;
	alt: string;
	meta: string;
} {
	return isMacOS()
		? { ctrl: "⌘", alt: "⌥", meta: "⌘" }
		: { ctrl: "Ctrl", alt: "Alt", meta: "Win" };
}

/**
 * 格式化快捷键显示文本
 */
export function formatShortcut(shortcut: ShortcutDefinition): string {
	const mods = getModifierKey();
	const parts: string[] = [];

	if (shortcut.ctrl) {
		parts.push(isMacOS() ? mods.ctrl : "Ctrl");
	}
	if (shortcut.alt) {
		parts.push(mods.alt);
	}
	if (shortcut.shift) {
		parts.push("Shift");
	}

	// 格式化主键
	let keyDisplay = shortcut.key.toUpperCase();
	// 特殊键名映射
	const keyMap: Record<string, string> = {
		" ": "Space",
		ArrowUp: "↑",
		ArrowDown: "↓",
		ArrowLeft: "←",
		ArrowRight: "→",
		Escape: "Esc",
		"/": "/",
		",": ",",
		".": "."
	};
	keyDisplay = keyMap[shortcut.key] || keyDisplay;
	parts.push(keyDisplay);

	return parts.join(isMacOS() ? "" : "+");
}

/**
 * 检测按键事件是否匹配快捷键定义
 */
function matchesShortcut(event: KeyboardEvent, shortcut: ShortcutDefinition): boolean {
	// 检查主键 (忽略大小写)
	if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
		return false;
	}

	// 检查修饰键
	// macOS: metaKey 对应 Cmd，Windows/Linux: ctrlKey 对应 Ctrl
	const isMac = isMacOS();
	const ctrlMatch = shortcut.ctrl
		? isMac
			? event.metaKey
			: event.ctrlKey
		: !(event.metaKey || event.ctrlKey);

	const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
	const altMatch = shortcut.alt ? event.altKey : !event.altKey;

	return ctrlMatch && shiftMatch && altMatch;
}

/**
 * 检测是否在可编辑元素中
 */
function isEditableElement(element: EventTarget | null): boolean {
	if (!element || !(element instanceof HTMLElement)) return false;

	const tagName = element.tagName.toLowerCase();
	const isEditable = element.isContentEditable;
	const isInput = tagName === "input" || tagName === "textarea";
	const isEditableInput = isInput && (element as HTMLInputElement).type !== "checkbox";

	return isEditable || isEditableInput;
}

/**
 * 快捷键管理器
 * 
 * 使用方式：
 * ```ts
 * const manager = new ShortcutManager();
 * 
 * manager.register({
 *   id: "new-chat",
 *   label: "新建对话",
 *   key: "n",
 *   ctrl: true,
 *   action: () => createNewChat()
 * });
 * 
 * manager.start();
 * ```
 */
export class ShortcutManager {
	private shortcuts: Map<string, ShortcutDefinition> = new Map();
	private states: Map<string, ShortcutState> = new Map();
	private listener: ((event: KeyboardEvent) => void) | null = null;
	private isRunning = false;

	/**
	 * 注册快捷键
	 */
	register(definition: ShortcutDefinition): void {
		if (this.shortcuts.has(definition.id)) {
			logger.warn(`快捷键 "${definition.id}" 已存在，将被覆盖`);
		}

		this.shortcuts.set(definition.id, definition);
		this.states.set(definition.id, {
			registered: true,
			triggerCount: 0
		});
	}

	/**
	 * 批量注册快捷键
	 */
	registerAll(definitions: ShortcutDefinition[]): void {
		definitions.forEach((def) => this.register(def));
	}

	/**
	 * 注销快捷键
	 */
	unregister(id: string): boolean {
		const deleted = this.shortcuts.delete(id);
		this.states.delete(id);
		return deleted;
	}

	/**
	 * 启动全局监听
	 */
	start(): void {
		if (this.isRunning) return;

		this.listener = this.handleKeyDown.bind(this);
		document.addEventListener("keydown", this.listener);
		this.isRunning = true;
	}

	/**
	 * 停止全局监听
	 */
	stop(): void {
		if (!this.isRunning || !this.listener) return;

		document.removeEventListener("keydown", this.listener);
		this.listener = null;
		this.isRunning = false;
	}

	/**
	 * 获取所有注册的快捷键
	 */
	getShortcuts(): ShortcutDefinition[] {
		return Array.from(this.shortcuts.values());
	}

	/**
	 * 获取按分组的快捷键
	 */
	getGroupedShortcuts(): Map<string, ShortcutDefinition[]> {
		const groups = new Map<string, ShortcutDefinition[]>();

		this.shortcuts.forEach((shortcut) => {
			const group = shortcut.group || "通用";
			const items = groups.get(group) || [];
			items.push(shortcut);
			groups.set(group, items);
		});

		return groups;
	}

	/**
	 * 获取快捷键状态
	 */
	getState(id: string): ShortcutState | undefined {
		return this.states.get(id);
	}

	/**
	 * 触发指定快捷键
	 */
	trigger(id: string): boolean {
		const shortcut = this.shortcuts.get(id);
		if (!shortcut) return false;

		shortcut.action();

		const state = this.states.get(id);
		if (state) {
			state.triggerCount++;
			state.lastTriggered = Date.now();
		}

		return true;
	}

	/**
	 * 键盘事件处理
	 */
	private handleKeyDown(event: KeyboardEvent): void {
		// 检查是否有活动的组合输入 (如输入法)
		if (event.isComposing) return;

		// 检查目标元素
		const target = event.target;

		this.shortcuts.forEach((shortcut, id) => {
			// 检查是否匹配
			if (!matchesShortcut(event, shortcut)) return;

			// 检查是否在输入框内
			if (!shortcut.enableInInput && isEditableElement(target)) {
				return;
			}

			// 阻止默认行为
			event.preventDefault();
			event.stopPropagation();

			// 执行动作
			try {
				shortcut.action();

				// 更新状态
				const state = this.states.get(id);
				if (state) {
					state.triggerCount++;
					state.lastTriggered = Date.now();
				}
			} catch (error) {
				logger.error(`快捷键 "${id}" 执行失败:`, error);
			}
		});
	}

	/**
	 * 清理所有注册
	 */
	destroy(): void {
		this.stop();
		this.shortcuts.clear();
		this.states.clear();
	}
}

/**
 * 默认快捷键定义
 */
export const DEFAULT_SHORTCUTS: Omit<ShortcutDefinition, "action">[] = [
	{
		id: "new-chat",
		label: "新建对话",
		description: "创建一个新的对话会话",
		key: "n",
		ctrl: true,
		group: "导航"
	},
	{
		id: "search-history",
		label: "搜索历史",
		description: "快速搜索历史记录",
		key: "k",
		ctrl: true,
		group: "导航"
	},
	{
		id: "toggle-sidebar",
		label: "切换侧边栏",
		description: "显示或隐藏侧边栏",
		key: "b",
		ctrl: true,
		group: "界面"
	},
	{
		id: "open-settings",
		label: "打开设置",
		description: "打开应用设置面板",
		key: "t",
		ctrl: true,
		shift: true,
		group: "界面"
	},
	{
		id: "show-shortcuts",
		label: "快捷键帮助",
		description: "显示所有快捷键列表",
		key: "/",
		ctrl: true,
		group: "帮助"
	},
	{
		id: "close-dialog",
		label: "关闭对话框",
		description: "关闭当前对话框或面板",
		key: "Escape",
		group: "界面"
	}
];

/**
 * 创建全局快捷键管理器实例
 */
export const shortcutManager = new ShortcutManager();
