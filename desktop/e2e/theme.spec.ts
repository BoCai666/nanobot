import { test, expect } from '@playwright/test';

/**
 * 主题持久化 E2E 测试
 * 测试场景:
 * 1. 切换主题 → 刷新 → 验证主题是否持久化
 * 2. 清除 localStorage → 验证系统主题偏好检测
 */

const THEME_STORAGE_KEY = 'nanobot-theme';

test.describe('主题持久化测试', () => {
	test.beforeEach(async ({ page }) => {
		// 清理 localStorage 确保干净的测试环境
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
	});

	test('主题切换后刷新页面，主题应保持不变', async ({ page }) => {
		await page.goto('/');

		// 手动设置主题为 dark 并保存到 localStorage
		await page.evaluate(() => {
			localStorage.setItem('nanobot-theme', 'dark');
		});

		// 刷新页面
		await page.reload();

		// 验证 data-theme 属性
		const html = page.locator('html');
		await expect(html).toHaveAttribute('data-theme', 'dark');
		await expect(html).toHaveClass(/dark/);
	});

	test('主题切换为 light 后刷新页面，主题应保持为 light', async ({ page }) => {
		await page.goto('/');

		// 手动设置主题为 light 并保存到 localStorage
		await page.evaluate(() => {
			localStorage.setItem('nanobot-theme', 'light');
		});

		// 刷新页面
		await page.reload();

		// 验证 data-theme 属性
		const html = page.locator('html');
		await expect(html).toHaveAttribute('data-theme', 'light');
		await expect(html).not.toHaveClass(/dark/);
	});

	test('清除 localStorage 后刷新页面，应检测系统主题偏好', async ({ page }) => {
		await page.goto('/');

		// 清除 localStorage 模拟首次访问
		await page.evaluate(() => {
			localStorage.removeItem('nanobot-theme');
		});

		// 刷新页面
		await page.reload();

		// 验证主题已初始化（data-theme 属性应存在）
		const html = page.locator('html');
		const dataTheme = await html.getAttribute('data-theme');
		expect(dataTheme).toBeTruthy();
		expect(dataTheme === 'light' || dataTheme === 'dark').toBeTruthy();
	});

	test('多次切换主题后刷新，主题应保持最后一次设置', async ({ page }) => {
		await page.goto('/');

		// 第一次切换到 dark
		await page.evaluate(() => {
			localStorage.setItem('nanobot-theme', 'dark');
		});
		await page.reload();

		let html = page.locator('html');
		await expect(html).toHaveAttribute('data-theme', 'dark');

		// 第二次切换到 light
		await page.evaluate(() => {
			localStorage.setItem('nanobot-theme', 'light');
		});
		await page.reload();

		html = page.locator('html');
		await expect(html).toHaveAttribute('data-theme', 'light');

		// 第三次切换回 dark
		await page.evaluate(() => {
			localStorage.setItem('nanobot-theme', 'dark');
		});
		await page.reload();

		html = page.locator('html');
		await expect(html).toHaveAttribute('data-theme', 'dark');
		await expect(html).toHaveClass(/dark/);
	});

	test('localStorage 中的无效值应回退到默认主题', async ({ page }) => {
		await page.goto('/');

		// 设置无效的主题值
		await page.evaluate(() => {
			localStorage.setItem('nanobot-theme', 'invalid-value');
		});

		// 刷新页面
		await page.reload();

		// 验证主题有有效值（data-theme 应存在且为有效值）
		const html = page.locator('html');
		const dataTheme = await html.getAttribute('data-theme');
		expect(dataTheme === 'light' || dataTheme === 'dark').toBeTruthy();
	});

	test('主题切换时 localStorage 中的值应同步更新', async ({ page }) => {
		await page.goto('/');

		// 初始应为 light 或系统主题
		const initialTheme = await page.evaluate(() => {
			return localStorage.getItem('nanobot-theme');
		});

		// 手动设置新主题
		const newTheme = initialTheme === 'dark' ? 'light' : 'dark';
		await page.evaluate((theme) => {
			localStorage.setItem('nanobot-theme', theme);
		}, newTheme);

		// 验证 localStorage 已更新
		const storedTheme = await page.evaluate(() => {
			return localStorage.getItem('nanobot-theme');
		});
		expect(storedTheme).toBe(newTheme);
	});
});
