/**
 * 日志工具
 * 
 * 提供统一的日志接口，生产环境可控制日志输出
 * - warn: 仅在开发环境输出
 * - error: 始终输出（错误需要被记录）
 * - info: 仅在开发环境输出
 * - debug: 仅在开发环境输出
 */

const isDev = import.meta.env.DEV;

export const logger = {
	/**
	 * 警告日志 - 开发环境输出
	 */
	warn: (...args: unknown[]) => isDev && console.warn(...args),

	/**
	 * 错误日志 - 始终输出
	 */
	error: (...args: unknown[]) => console.error(...args),

	/**
	 * 信息日志 - 开发环境输出
	 */
	info: (...args: unknown[]) => isDev && console.info(...args),

	/**
	 * 调试日志 - 开发环境输出
	 */
	debug: (...args: unknown[]) => isDev && console.debug(...args)
};
