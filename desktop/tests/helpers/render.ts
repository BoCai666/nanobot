/**
 * Svelte 组件测试渲染工具
 * 提供 Svelte 5 Runes 兼容的测试渲染辅助函数
 */

import { render as svelteRender, type RenderOptions } from '@testing-library/svelte';
import type { ComponentType } from 'svelte';

/**
 * 渲染 Svelte 组件的选项
 */
export interface RenderComponentOptions extends Omit<RenderOptions, 'queries'> {
	/** 组件属性 */
	props?: Record<string, unknown>;
	/** 是否挂载到 DOM */
	mount?: boolean;
}

/**
 * 渲染 Svelte 组件并返回测试工具
 * 
 * @example
 * ```typescript
 * import { render } from '$tests/helpers/render';
 * import MyComponent from '$lib/components/MyComponent.svelte';
 * 
 * test('renders with props', () => {
 *   const { getByText } = render(MyComponent, {
 *     props: { message: 'Hello World' }
 *   });
 *   expect(getByText('Hello World')).toBeInTheDocument();
 * });
 * ```
 */
export function render<T extends ComponentType>(
	component: T,
	options: RenderComponentOptions = {}
) {
	const { props = {}, mount = true, ...rest } = options;

	const result = svelteRender(component, { props, ...rest });

	return {
		...result,
		/** 组件实例 */
		component: result.container.firstChild,
	};
}

/**
 * 模拟用户事件辅助函数（简化实现，不依赖 @testing-library/user-event）
 */
export const userEvent = {
	/**
	 * 点击元素
	 */
	click: (element: Element | Node | Document | Window) => {
		const event = new MouseEvent('click', {
			bubbles: true,
			cancelable: true,
			view: window,
		});
		element.dispatchEvent(event);
	},

	/**
	 * 输入文本
	 */
	type: (element: HTMLElement, text: string, _options?: { skipClick?: boolean }) => {
		// 简化实现：直接设置 value 并触发 input 事件
		const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			'value'
		)?.set;
		const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
			HTMLTextAreaElement.prototype,
			'value'
		)?.set;

		if ('value' in element) {
			if (nativeInputValueSetter) {
				nativeInputValueSetter.call(element, text);
			} else if (nativeTextareaValueSetter) {
				nativeTextareaValueSetter.call(element, text);
			} else {
				(element as HTMLInputElement).value = text;
			}
		}

		element.dispatchEvent(new Event('input', { bubbles: true }));
		element.dispatchEvent(new Event('change', { bubbles: true }));
	},

	/**
	 * 清空输入
	 */
	clear: (element: HTMLElement) => {
		const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			'value'
		)?.set;
		const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
			HTMLTextAreaElement.prototype,
			'value'
		)?.set;

		if (nativeInputValueSetter) {
			nativeInputValueSetter.call(element, '');
		} else if (nativeTextareaValueSetter) {
			nativeTextareaValueSetter.call(element, '');
		} else {
			(element as HTMLInputElement).value = '';
		}

		element.dispatchEvent(new Event('input', { bubbles: true }));
		element.dispatchEvent(new Event('change', { bubbles: true }));
	},
};

/**
 * 等待指定时间
 */
export function wait(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 等待元素出现
 */
export async function waitForElement(
	callback: () => HTMLElement | null,
	options?: { timeout?: number; interval?: number }
): Promise<HTMLElement> {
	const module = await import('@testing-library/svelte');
	const waitFor = module.waitFor;
	return waitFor(() => {
		const element = callback();
		if (!element) throw new Error('Element not found');
		return element;
	}, options) as Promise<HTMLElement>;
}
