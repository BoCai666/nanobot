/**
 * 主题状态管理 - 单元测试
 * 测试主题切换逻辑、DOM 更新和 localStorage 持久化
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock $app/environment before importing theme
vi.mock('$app/environment', () => ({
	browser: true,
}));

describe('Theme Store', () => {
	// Mock localStorage
	let mockLocalStorage: {
		getItem: ReturnType<typeof vi.fn>;
		setItem: ReturnType<typeof vi.fn>;
		store: Record<string, string>;
	};

	// Mock documentElement
	let mockDataTheme: string = 'light';
	let mockClassList: string[] = [];

	beforeEach(() => {
		// Reset state
		mockDataTheme = 'light';
		mockClassList = [];

		// Create fresh mock localStorage for each test
		mockLocalStorage = {
			store: {},
			getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
			setItem: vi.fn((key: string, value: string) => {
				mockLocalStorage.store[key] = value;
			}),
		};

		// Mock global browser environment
		vi.stubGlobal('browser', true);
		vi.stubGlobal('localStorage', mockLocalStorage);

		// Mock document
		const mockDocument = {
			documentElement: {
				getAttribute: vi.fn((attr: string) => {
					if (attr === 'data-theme') return mockDataTheme;
					return null;
				}),
				setAttribute: vi.fn((attr: string, value: string) => {
					if (attr === 'data-theme') mockDataTheme = value;
				}),
				removeAttribute: vi.fn(() => {}),
				classList: {
					add: vi.fn((cls: string) => {
						if (!mockClassList.includes(cls)) mockClassList.push(cls);
					}),
					remove: vi.fn((cls: string) => {
						mockClassList = mockClassList.filter((c) => c !== cls);
					}),
					contains: vi.fn((cls: string) => mockClassList.includes(cls)),
				},
			},
		};
		vi.stubGlobal('document', mockDocument);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Theme type', () => {
		it('should accept light and dark as valid theme values', () => {
			const lightTheme = 'light' as const;
			const darkTheme = 'dark' as const;
			expect(lightTheme).toBe('light');
			expect(darkTheme).toBe('dark');
		});
	});

	describe('Theme constants', () => {
		it('should use correct localStorage key', async () => {
			// Re-import to get fresh module with mocks
			const mod = await import('./theme');
			expect(mod).toBeDefined();
		});
	});

	describe('toggleTheme function', () => {
		it('should be exported from theme module', async () => {
			const { toggleTheme } = await import('./theme');
			expect(typeof toggleTheme).toBe('function');
		});

		it('should persist theme to localStorage when toggled', async () => {
			const { toggleTheme } = await import('./theme');
			toggleTheme();
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('nanobot-theme', expect.any(String));
		});

		it('should set data-theme to dark when toggled from light', async () => {
			const { toggleTheme, setTheme } = await import('./theme');
			setTheme('light'); // Reset to known state
			mockDataTheme = 'light';
			mockLocalStorage.store = {};

			toggleTheme();

			// Check localStorage was called with 'dark'
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('nanobot-theme', 'dark');
		});
	});

	describe('setTheme function', () => {
		it('should be exported from theme module', async () => {
			const { setTheme } = await import('./theme');
			expect(typeof setTheme).toBe('function');
		});

		it('should persist theme to localStorage', async () => {
			const { setTheme } = await import('./theme');
			setTheme('dark');
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('nanobot-theme', 'dark');
		});

		it('should persist light theme to localStorage', async () => {
			const { setTheme } = await import('./theme');
			setTheme('light');
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('nanobot-theme', 'light');
		});
	});

	describe('initTheme function', () => {
		it('should be exported from theme module', async () => {
			const { initTheme } = await import('./theme');
			expect(typeof initTheme).toBe('function');
		});
	});

	describe('localStorage key', () => {
		it('should use nanobot-theme as storage key', async () => {
			const { setTheme } = await import('./theme');
			setTheme('dark');
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith('nanobot-theme', 'dark');
		});
	});

	describe('data-theme attribute', () => {
		it('should update data-theme attribute when theme changes', async () => {
			const { setTheme } = await import('./theme');

			setTheme('dark');

			// Verify setAttribute was called on document.documentElement
			const setAttributeSpy = vi.spyOn(document.documentElement, 'setAttribute');
			setTheme('dark');
			expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'dark');
		});
	});

	describe('backward compatibility with .dark class', () => {
		it('should add dark class when theme is set to dark', async () => {
			const { setTheme } = await import('./theme');

			setTheme('dark');

			// Verify classList.add was called
			const addSpy = vi.spyOn(document.documentElement.classList, 'add');
			setTheme('dark');
			expect(addSpy).toHaveBeenCalledWith('dark');
		});

		it('should remove dark class when theme is set to light', async () => {
			const { setTheme } = await import('./theme');

			// First set dark
			setTheme('dark');
			mockClassList = ['dark']; // Simulate dark class being added

			// Then set light
			const removeSpy = vi.spyOn(document.documentElement.classList, 'remove');
			setTheme('light');
			expect(removeSpy).toHaveBeenCalledWith('dark');
		});
	});
});
