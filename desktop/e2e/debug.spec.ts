import { test, expect } from '@playwright/test';

test('debug page content', async ({ page }) => {
	// 监听控制台消息
	const consoleMessages: string[] = [];
	page.on('console', msg => {
		consoleMessages.push(`${msg.type()}: ${msg.text()}`);
	});
	
	// 监听页面错误
	const pageErrors: string[] = [];
	page.on('pageerror', error => {
		pageErrors.push(error.message);
	});
	
	await page.goto('/');
	
	// 等待页面加载
	await page.waitForTimeout(5000);
	
	console.log('=== Console messages ===');
	consoleMessages.forEach(m => console.log(m));
	
	console.log('=== Page errors ===');
	pageErrors.forEach(e => console.log(e));
	
	// 获取页面上所有的类名
	const allClasses = await page.evaluate(() => {
		const all = document.querySelectorAll('*');
		const classes = new Set();
		all.forEach(el => el.classList.forEach(c => classes.add(c)));
		return Array.from(classes).sort();
	});
	
	console.log('=== All classes on page ===');
	console.log(allClasses.slice(0, 50).join(', '));
	
	// 获取 body 内容
	const bodyContent = await page.evaluate(() => {
		return document.body.innerHTML;
	});
	console.log('=== Body content (first 2000 chars) ===');
	console.log(bodyContent.substring(0, 2000));
	
	// 检查特定元素是否存在
	const appLayout = await page.$('.app-layout');
	const sidebar = await page.$('.sidebar');
	const messageTextarea = await page.$('.message-textarea');
	
	console.log('=== Element presence ===');
	console.log('app-layout:', !!appLayout);
	console.log('sidebar:', !!sidebar);
	console.log('message-textarea:', !!messageTextarea);
});
