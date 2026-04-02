/**
 * 主题状态管理
 * 支持暗色/亮色主题切换，使用 localStorage 持久化
 * 使用 Svelte 5 Runes 语法
 */

import { browser } from '$app/environment';

// 主题类型
export type Theme = 'light' | 'dark';

// localStorage key
const STORAGE_KEY = 'nanobot-theme';

// 创建主题状态函数
export function createThemeStore() {
	// 主题状态
	let currentTheme = $state<Theme>('light');

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
	 * 切换主题
	 */
	function toggleTheme(): void {
		const next = currentTheme === 'light' ? 'dark' : 'light';
		if (browser) {
			localStorage.setItem(STORAGE_KEY, next);
			applyTheme(next);
		}
		currentTheme = next;
	}

	/**
	 * 设置指定主题（不切换，只设置）
	 */
	function setTheme(newTheme: Theme): void {
		if (browser) {
			localStorage.setItem(STORAGE_KEY, newTheme);
			applyTheme(newTheme);
		}
		currentTheme = newTheme;
	}

	/**
	 * 初始化主题
	 * 优先级：localStorage > 系统偏好 > 默认 light
	 */
	function initTheme(): void {
		if (!browser) {
			return;
		}

		// 优先读取保存的主题
		const savedTheme = getSavedTheme();
		if (savedTheme) {
			currentTheme = savedTheme;
			applyTheme(savedTheme);
			return;
		}

		// 其次使用系统偏好
		const systemTheme = getSystemTheme();
		currentTheme = systemTheme;
		applyTheme(systemTheme);

		// 监听系统主题变化，当没有保存的主题时跟随系统
		listenToSystemTheme((newSystemTheme) => {
			// 只有当用户没有手动设置过主题时，才跟随系统主题
			const currentSaved = getSavedTheme();
			if (!currentSaved) {
				currentTheme = newSystemTheme;
				applyTheme(newSystemTheme);
			}
		});
	}

	return {
		// 状态getter
		get theme() { return currentTheme; },

		// 方法
		toggleTheme,
		setTheme,
		initTheme,

		// 内部方法（供测试和高级用法）
		_applyTheme: applyTheme,
		_getSystemTheme: getSystemTheme,
		_getSavedTheme: getSavedTheme,
		_listenToSystemTheme: listenToSystemTheme
	};
}

// 导出一个全局主题状态实例
export const themeStore = createThemeStore();

// 保持向后兼容的导出
export const theme = {
	get: () => themeStore.theme,
	set: (t: Theme) => themeStore.setTheme(t)
};
export function toggleTheme(): void { themeStore.toggleTheme(); }
export function setTheme(newTheme: Theme): void { themeStore.setTheme(newTheme); }
export function initTheme(): void { themeStore.initTheme(); }
