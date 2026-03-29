/**
 * 键盘快捷键工具函数
 * 用于检测常见的键盘组合键
 */

/**
 * 检测是否为提交快捷键 (Ctrl+Enter 或 Cmd+Enter)
 * 支持 Windows/Linux (Ctrl) 和 macOS (Cmd)
 */
export function isSubmitShortcut(event: KeyboardEvent): boolean {
	return (event.ctrlKey || event.metaKey) && event.key === "Enter";
}

/**
 * 检测是否为 Shift+Enter 快捷键
 * 通常用于插入换行符
 */
export function isShiftEnter(event: KeyboardEvent): boolean {
	return event.shiftKey && event.key === "Enter";
}

/**
 * 快捷键处理器类型
 */
export type KeyboardShortcutHandler = (event: KeyboardEvent) => void;

/**
 * 为元素添加快捷键监听
 * 返回取消函数
 */
export function onShortcut(
	key: string,
	modifiers: { ctrl?: boolean; meta?: boolean; shift?: boolean },
	handler: KeyboardShortcutHandler
): () => void {
	const listener = (event: KeyboardEvent) => {
		const ctrlMatch = modifiers.ctrl ? event.ctrlKey : !event.ctrlKey;
		const metaMatch = modifiers.meta ? event.metaKey : !event.metaKey;
		const shiftMatch = modifiers.shift ? event.shiftKey : !event.shiftKey;

		if (event.key === key && ctrlMatch && metaMatch && shiftMatch) {
			handler(event);
		}
	};

	document.addEventListener("keydown", listener);
	return () => document.removeEventListener("keydown", listener);
}
