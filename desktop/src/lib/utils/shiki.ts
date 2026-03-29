import { createHighlighter, type Highlighter } from "shiki";

/**
 * Shiki 代码语法高亮工具
 * 使用单例模式缓存 highlighter 实例，支持常用语言和深色主题
 */

// 常用语言列表
const COMMON_LANGUAGES = [
	"javascript",
	"typescript",
	"python",
	"rust",
	"html",
	"css",
	"json",
	"markdown",
	"bash",
	"shell",
] as const;

// 使用深色主题，兼容明暗模式
const THEME = "github-dark";

// 单例 highlighter 实例
let highlighterInstance: Highlighter | null = null;
let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * 获取或创建 Shiki highlighter 实例（单例模式）
 * 懒加载语言包，首次调用时初始化
 */
export async function getHighlighter(): Promise<Highlighter> {
	// 如果已有实例，直接返回
	if (highlighterInstance) {
		return highlighterInstance;
	}

	// 如果正在初始化，等待完成（防止并发重复初始化）
	if (highlighterPromise) {
		return highlighterPromise;
	}

	// 创建新的 highlighter 实例
	highlighterPromise = createHighlighter({
		themes: [THEME],
		langs: [...COMMON_LANGUAGES],
	});

	highlighterInstance = await highlighterPromise;
	return highlighterInstance;
}

/**
 * 语言别名映射（处理常见的语言变体名称）
 */
const LANGUAGE_ALIASES: Record<string, string> = {
	js: "javascript",
	ts: "typescript",
	py: "python",
	rb: "ruby",
	sh: "bash",
	shell: "bash",
	yml: "yaml",
	md: "markdown",
	"source.js": "javascript",
	"source.ts": "typescript",
	"source.py": "python",
};

/**
 * 规范化语言名称
 * @param lang - 原始语言名称
 * @returns 规范化后的语言名称，未知语言返回 "text"
 */
function normalizeLanguage(lang: string): string {
	const normalized = lang.toLowerCase().trim();
	return LANGUAGE_ALIASES[normalized] || normalized;
}

/**
 * 检查语言是否受支持
 * @param highlighter - Shiki highlighter 实例
 * @param lang - 语言名称
 * @returns 是否支持该语言
 */
function isLanguageSupported(highlighter: Highlighter, lang: string): boolean {
	const normalized = normalizeLanguage(lang);
	return (
		COMMON_LANGUAGES.includes(normalized as (typeof COMMON_LANGUAGES)[number]) ||
		highlighter.getLoadedLanguages().includes(normalized)
	);
}

/**
 * 高亮代码并返回 HTML
 * @param code - 要高亮的代码字符串
 * @param language - 代码语言
 * @returns 高亮后的 HTML 字符串
 */
export async function highlightCode(code: string, language: string): Promise<string> {
	const highlighter = await getHighlighter();
	const normalizedLang = normalizeLanguage(language);

	// 如果语言不支持，回退到纯文本
	const lang = isLanguageSupported(highlighter, normalizedLang) ? normalizedLang : "text";

	try {
		return highlighter.codeToHtml(code, {
			lang,
			theme: THEME,
		});
	} catch {
		// 如果高亮失败，返回纯文本包裹的代码
		return `<pre class="shiki" style="background-color: #0d1117"><code>${escapeHtml(code)}</code></pre>`;
	}
}

/**
 * 同步版本的高亮函数（需要先调用 getHighlighter 初始化）
 * @param code - 要高亮的代码字符串
 * @param language - 代码语言
 * @returns 高亮后的 HTML 字符串，如果 highlighter 未初始化则返回纯文本
 */
export function highlightCodeSync(code: string, language: string): string {
	if (!highlighterInstance) {
		return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
	}

	const normalizedLang = normalizeLanguage(language);
	const lang = isLanguageSupported(highlighterInstance, normalizedLang) ? normalizedLang : "text";

	try {
		return highlighterInstance.codeToHtml(code, {
			lang,
			theme: THEME,
		});
	} catch {
		return `<pre class="shiki" style="background-color: #0d1117"><code>${escapeHtml(code)}</code></pre>`;
	}
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

/**
 * 预加载 highlighter（可选，用于提前初始化）
 */
export function preloadHighlighter(): Promise<Highlighter> {
	return getHighlighter();
}
