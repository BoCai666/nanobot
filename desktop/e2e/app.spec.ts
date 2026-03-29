import { test, expect } from '@playwright/test';

test.describe('nanobot Desktop App', () => {
	test('page loads successfully', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/nanobot/);
	});

	test('sidebar is visible', async ({ page }) => {
		await page.goto('/');
		const sidebar = page.locator('.sidebar');
		await expect(sidebar).toBeVisible();
	});

	test('channel list is visible', async ({ page }) => {
		await page.goto('/');
		const channelList = page.locator('.channel-list');
		await expect(channelList).toBeVisible();
	});

	test('settings button is visible', async ({ page }) => {
		await page.goto('/');
		const settingsBtn = page.locator('.settings-btn');
		await expect(settingsBtn).toBeVisible();
	});

	test('message input is visible on chat view', async ({ page }) => {
		await page.goto('/');
		const messageInput = page.locator('.message-input-container');
		await expect(messageInput).toBeVisible();
	});

	test('can toggle sidebar', async ({ page }) => {
		await page.goto('/');
		const sidebar = page.locator('.sidebar');
		const toggleBtn = page.locator('.toggle-btn');

		const initialWidth = await sidebar.evaluate(el => el.getAttribute('style'));

		await toggleBtn.click();

		const newWidth = await sidebar.evaluate(el => el.getAttribute('style'));
		expect(newWidth).not.toBe(initialWidth);
	});

	test('can type in message input', async ({ page }) => {
		await page.goto('/');
		const textarea = page.locator('.message-textarea');

		await textarea.fill('Hello, nanobot!');

		await expect(textarea).toHaveValue('Hello, nanobot!');
	});

	test('send button is disabled when input is empty', async ({ page }) => {
		await page.goto('/');
		const sendBtn = page.locator('.send-btn');

		await expect(sendBtn).toBeDisabled();
	});

	test('send button is enabled when input has text', async ({ page }) => {
		await page.goto('/');
		const textarea = page.locator('.message-textarea');
		const sendBtn = page.locator('.send-btn');

		await textarea.fill('Hello!');

		await expect(sendBtn).toBeEnabled();
	});

	test('navigate to settings view', async ({ page }) => {
		await page.goto('/');
		const settingsBtn = page.locator('.settings-btn');

		await settingsBtn.click();

		// After clicking settings, the view should change
		await expect(page.locator('.settings-btn')).toHaveClass(/active/);
	});

	// === Page Loading Tests ===

	test('page title contains app name', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/nanobot/i);
	});

	test('all main UI elements are visible on load', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('.sidebar')).toBeVisible();
		await expect(page.locator('.channel-list')).toBeVisible();
		await expect(page.locator('.message-input-container')).toBeVisible();
		await expect(page.locator('.settings-btn')).toBeVisible();
	});

	// === Sidebar Navigation Tests ===

	test('can click on channel in channel list', async ({ page }) => {
		await page.goto('/');
		const firstChannel = page.locator('.channel-list .channel-item').first();
		await expect(firstChannel).toBeVisible();
		await firstChannel.click();
		await expect(firstChannel).toHaveClass(/active/);
	});

	test('sidebar toggle changes sidebar width', async ({ page }) => {
		await page.goto('/');
		const sidebar = page.locator('.sidebar');
		const toggleBtn = page.locator('.toggle-btn');

		// Get initial state
		const initialClasses = await sidebar.getAttribute('class');

		// Click toggle
		await toggleBtn.click();

		// Verify class changed
		const newClasses = await sidebar.getAttribute('class');
		expect(newClasses).not.toBe(initialClasses);
	});

	// === Settings Panel Tests ===

	test('settings panel opens when settings button clicked', async ({ page }) => {
		await page.goto('/');
		const settingsBtn = page.locator('.settings-btn');

		await settingsBtn.click();

		// Verify settings panel is visible
		await expect(page.locator('.settings-panel')).toBeVisible();
	});

	test('can switch between settings tabs', async ({ page }) => {
		await page.goto('/');

		// Open settings
		await page.locator('.settings-btn').click();
		await expect(page.locator('.settings-panel')).toBeVisible();

		// Click on different tabs if they exist
		const tabs = page.locator('.settings-tabs .tab-item');
		const tabCount = await tabs.count();

		if (tabCount > 1) {
			await tabs.nth(1).click();
			await expect(tabs.nth(1)).toHaveClass(/active/);
		}
	});

	test('can close settings panel', async ({ page }) => {
		await page.goto('/');

		// Open settings
		await page.locator('.settings-btn').click();
		await expect(page.locator('.settings-panel')).toBeVisible();

		// Click close button if available
		const closeBtn = page.locator('.settings-panel .close-btn');
		if (await closeBtn.isVisible()) {
			await closeBtn.click();
			await expect(page.locator('.settings-panel')).not.toBeVisible();
		}
	});

	// === Responsive Tests ===

	test('layout adapts to mobile viewport', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');

		// Main elements should still be visible
		await expect(page.locator('.sidebar')).toBeVisible();
		await expect(page.locator('.message-input-container')).toBeVisible();
	});

	test('sidebar collapses on small viewport', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');

		// Toggle sidebar on mobile
		const toggleBtn = page.locator('.toggle-btn');
		await toggleBtn.click();

		// Sidebar should have collapsed class or be hidden
		const sidebar = page.locator('.sidebar');
		const sidebarClasses = await sidebar.getAttribute('class') || '';
		const hasCollapsedClass = sidebarClasses.includes('collapsed');
		expect(hasCollapsedClass || !(await sidebar.isVisible())).toBeTruthy();
	});

	test('message input remains functional on tablet', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto('/');

		const textarea = page.locator('.message-textarea');
		await textarea.fill('Test message on tablet');
		await expect(textarea).toHaveValue('Test message on tablet');
	});

	test('send button state is correct on different viewports', async ({ page }) => {
		// Test mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');

		const sendBtn = page.locator('.send-btn');
		await expect(sendBtn).toBeDisabled();

		const textarea = page.locator('.message-textarea');
		await textarea.fill('Hello');
		await expect(sendBtn).toBeEnabled();
	});
});
