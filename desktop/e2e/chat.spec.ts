import { test, expect } from '@playwright/test';

test.describe('Chat Send Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('user can type in message input', async ({ page }) => {
		const textarea = page.locator('.message-textarea');

		await textarea.fill('Hello, nanobot!');

		await expect(textarea).toHaveValue('Hello, nanobot!');
	});

	test('send button is disabled when input is empty', async ({ page }) => {
		const sendBtn = page.locator('.send-btn');

		await expect(sendBtn).toBeDisabled();
	});

	test('send button is enabled when input has text', async ({ page }) => {
		const textarea = page.locator('.message-textarea');
		const sendBtn = page.locator('.send-btn');

		await textarea.fill('Hello!');

		await expect(sendBtn).toBeEnabled();
	});

	test('user can send message via button click', async ({ page }) => {
		const textarea = page.locator('.message-textarea');
		const sendBtn = page.locator('.send-btn');

		await textarea.fill('Test message');
		await sendBtn.click();

		// 消息发送后输入框应该被清空
		await expect(textarea).toHaveValue('');
	});

	test('user can send message via Ctrl+Enter shortcut', async ({ page }) => {
		const textarea = page.locator('.message-textarea');

		await textarea.fill('Test message via Ctrl+Enter');
		await textarea.press('Control+Enter');

		// 消息发送后输入框应该被清空
		await expect(textarea).toHaveValue('');
	});

	test('message appears in message list after sending', async ({ page }) => {
		const textarea = page.locator('.message-textarea');
		const sendBtn = page.locator('.send-btn');

		await textarea.fill('Hello AI');
		await sendBtn.click();

		// 等待消息出现在列表中
		const messageList = page.locator('.message-list');
		await expect(messageList).toBeVisible();

		// 检查消息气泡是否存在
		const messageBubble = page.locator('.message-body').first();
		await expect(messageBubble).toBeVisible();
	});

	test('input hint shows Ctrl+Enter shortcut', async ({ page }) => {
		const hintText = page.locator('.hint-text');

		await expect(hintText).toContainText('Ctrl + Enter');
	});

	test('character count displays correctly', async ({ page }) => {
		const textarea = page.locator('.message-textarea');
		const charCount = page.locator('.char-count');

		// 空输入时显示 0
		await expect(charCount).toContainText('0/4000');

		// 输入文字后更新计数
		await textarea.fill('Hello');
		await expect(charCount).toContainText('5/4000');
	});

	test('textarea auto-resize works with multiline content', async ({ page }) => {
		const textarea = page.locator('.message-textarea');

		// 输入多行内容
		const multiLineText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
		await textarea.fill(multiLineText);

		// 验证多行文本被正确输入
		await expect(textarea).toHaveValue(multiLineText);
	});

	test('send button shows disabled state styling when input is empty', async ({ page }) => {
		const sendBtn = page.locator('.send-btn');

		// 验证禁用状态有 disabled class
		await expect(sendBtn).toHaveClass(/disabled/);
		await expect(sendBtn).toBeDisabled();
	});

	test('send button shows enabled state styling when input has text', async ({ page }) => {
		const textarea = page.locator('.message-textarea');
		const sendBtn = page.locator('.send-btn');

		await textarea.fill('Hello!');

		// 验证启用状态没有 disabled class
		await expect(sendBtn).not.toHaveClass(/disabled/);
		await expect(sendBtn).toBeEnabled();
	});

	test.describe('Loading State', () => {
		test('input is disabled when generating response', async ({ page }) => {
			const textarea = page.locator('.message-textarea');

			// 发送消息触发 loading
			await textarea.fill('Long response request');
			await page.locator('.send-btn').click();

			// 等待输入框被禁用（正在生成回复）
			await expect(textarea).toBeDisabled();
		});

		test('placeholder changes when generating', async ({ page }) => {
			const textarea = page.locator('.message-textarea');

			// 发送消息
			await textarea.fill('Test');
			await page.locator('.send-btn').click();

			// 等待 placeholder 变化
			await expect(textarea).toHaveAttribute('placeholder', 'AI 正在思考...');
		});

		test('abort button appears when generating', async ({ page }) => {
			const textarea = page.locator('.message-textarea');

			// 发送消息
			await textarea.fill('Test abort');
			await page.locator('.send-btn').click();

			// 验证中断按钮出现
			const abortBtn = page.locator('.abort-btn');
			await expect(abortBtn).toBeVisible();
		});
	});

	test.describe('Message List Behavior', () => {
		test('empty state shows before any message', async ({ page }) => {
			const emptyState = page.locator('.empty-state');
			const emptyText = page.locator('.empty-text');

			await expect(emptyState).toBeVisible();
			await expect(emptyText).toContainText('开始一个新的对话');
		});

		test('message list shows messages after sending', async ({ page }) => {
			const textarea = page.locator('.message-textarea');

			await textarea.fill('First message');
			await page.locator('.send-btn').click();

			// 空状态应该消失
			const emptyState = page.locator('.empty-state');
			await expect(emptyState).not.toBeVisible();

			// 消息容器应该可见
			const messagesContainer = page.locator('.messages-container');
			await expect(messagesContainer).toBeVisible();
		});

	test('multiple messages appear in correct order', async ({ page }) => {
		const textarea = page.locator('.message-textarea');
		const sendBtn = page.locator('.send-btn');

		// 发送第一条消息
		await textarea.fill('First');
		await sendBtn.click();

		// 等待消息出现
		await expect(page.locator('.message')).toHaveCount(2, { timeout: 10000 }); // 1 user + 1 assistant

		// 发送第二条消息
		await textarea.fill('Second');
		await sendBtn.click();

		// 等待第二条消息出现 (1 user + 1 assistant = 2 more)
		await expect(page.locator('.message')).toHaveCount(4, { timeout: 10000 }); // 2 user + 2 assistant
	});
	});
});
