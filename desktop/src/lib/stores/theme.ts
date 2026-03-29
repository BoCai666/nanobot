/**
 * 主题状态管理
 * 支持暗色/亮色主题切换，使用 localStorage 持久化
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// 主题类型
export type Theme = 'light' | 'dark';

// localStorage key
const STORAGE_KEY = 'nanobot-theme';

/**
 * 创建主题 store
 * 初始值为 'light'，实际主题由 initTheme() 初始化
 */
export const theme = writable<Theme>('light');

/**
 * 切换主题
 */
export function toggleTheme(): void {
	theme.update((current) => {
		const next = current === 'light' ? 'dark' : 'light';
		if (browser) {
			localStorage.setItem(STORAGE_KEY, next);
			applyTheme(next);
		}
		return next;
	});
}

/**
 * 将主题应用到 document
 */
function applyTheme(theme: Theme): void {
	if (browser && document.documentElement) {
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
			document.documentElement.setAttribute('data-theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			document.documentElement.setAttribute('data-theme', 'light');
		}
	}
}

/**
 * 获取系统主题偏好
 */
function getSystemTheme(): Theme {
	if (browser) {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return 'light';
}

/**
 * 从 localStorage 读取保存的主题
 */
function getSavedTheme(): Theme | null {
	if (browser) {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved === 'light' || saved === 'dark') {
			return saved;
		}
	}
	return null;
}

/**
 * 监听系统主题变化
 */
function listenToSystemTheme(callback: (theme: Theme) => void): () => void {
	if (!browser) {
		return () => {};
	}

	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	const handler = (e: MediaQueryListEvent) => {
		callback(e.matches ? 'dark' : 'light');
	};

	mediaQuery.addEventListener('change', handler);
	return () => {
		mediaQuery.removeEventListener('change', handler);
	};
}

/**
 * 初始化主题
 * 优先级：localStorage > 系统偏好 > 默认 light
 */
export function initTheme(): void {
	if (!browser) {
		return;
	}

	// 优先读取保存的主题
	const savedTheme = getSavedTheme();
	if (savedTheme) {
		theme.set(savedTheme);
		applyTheme(savedTheme);
		return;
	}

	// 其次使用系统偏好
	const systemTheme = getSystemTheme();
	theme.set(systemTheme);
	applyTheme(systemTheme);

	// 监听系统主题变化，当没有保存的主题时跟随系统
	const unsubscribe = listenToSystemTheme((newSystemTheme) => {
		// 只有当用户没有手动设置过主题时，才跟随系统主题
		const currentSaved = getSavedTheme();
		if (!currentSaved) {
			theme.set(newSystemTheme);
			applyTheme(newSystemTheme);
		}
	});

	// 注意：在 Svelte 组件中使用时，需在 onDestroy 中调用 unsubscribe()
}

/**
 * 设置指定主题（不切换，只设置）
 */
export function setTheme(newTheme: Theme): void {
	theme.set(newTheme);
	if (browser) {
		localStorage.setItem(STORAGE_KEY, newTheme);
		applyTheme(newTheme);
	}
}
