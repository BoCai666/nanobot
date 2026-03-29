/**
 * Markdown 解析工具
 * 使用 marked 解析 Markdown，DOMPurify 进行 XSS 防护
 */
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// 配置 marked 选项
marked.setOptions({
	breaks: true,     // 换行符转换为 <br>
	gfm: true,        // GitHub Flavored Markdown（支持表格、任务列表等）
});

/**
 * 将 Markdown 文本转换为安全的 HTML
 * 
 * 支持的功能：
 * - 表格（GFM tables）
 * - 任务列表（task lists）
 * - 引用块（blockquotes）
 * - 代码块（code blocks）
 * - 换行符转换为 <br>
 * 
 * @param content - Markdown 格式的文本
 * @returns 经过 XSS 防护处理的 HTML 字符串
 */
export function parseMarkdown(content: string): string {
	if (!content || typeof content !== 'string') {
		return '';
	}

	// 解析 Markdown 为 HTML
	const rawHtml = marked.parse(content) as string;

	// 使用 DOMPurify 进行 XSS 防护
	const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
		// 允许的标签（包含 GFM 特有标签）
		ALLOWED_TAGS: [
			// 基础标签
			'p', 'br', 'span', 'div',
			// 标题
			'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
			// 文本格式
			'strong', 'b', 'em', 'i', 'del', 's', 'code', 'pre',
			// 链接和图片
			'a', 'img',
			// 列表
			'ul', 'ol', 'li',
			// 引用
			'blockquote',
			// 表格
			'table', 'thead', 'tbody', 'tr', 'th', 'td',
			// 任务列表
			'input',
			// 水平线
			'hr',
		],
		// 允许的属性
		ALLOWED_ATTR: [
			'href', 'src', 'alt', 'title',
			'class', 'id',
			// 任务列表属性
			'type', 'checked', 'disabled',
			// 代码块语言标识
			'data-language',
		],
		// 允许 data-* 属性
		ALLOW_DATA_ATTR: true,
	});

	return sanitizedHtml;
}
