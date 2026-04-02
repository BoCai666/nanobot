<script lang="ts">
	/**
	 * Input 组件
	 * 温暖亲切的输入框设计，支持 focus、error、disabled 状态
	 */
	import { cn } from "$lib/utils/cn";

	interface Props {
		type?: string;
		placeholder?: string;
		value?: string;
		disabled?: boolean;
		error?: boolean;
		errorMessage?: string;
		class?: string;
		oninput?: (event: Event) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		onfocus?: (event: FocusEvent) => void;
		onblur?: (event: FocusEvent) => void;
	}

	let {
		type = "text",
		placeholder = "",
		value = $bindable(""),
		disabled = false,
		error = false,
		errorMessage = "",
		class: className,
		oninput,
		onkeydown,
		onfocus,
		onblur
	}: Props = $props();
</script>

<div class="input-wrapper">
	<input
		{type}
		{placeholder}
		{disabled}
		bind:value
		{oninput}
		{onkeydown}
		{onfocus}
		{onblur}
		aria-invalid={error || undefined}
		aria-describedby={error && errorMessage ? "input-error" : undefined}
		class={cn("input-base", error && "input-error", className)}
	/>

	{#if error && errorMessage}
		<p id="input-error" class="error-message">
			{errorMessage}
		</p>
	{/if}
</div>

<style>
	.input-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		width: 100%;
	}

	.input-base {
		/* 布局 */
		display: flex;
		align-items: center;
		width: 100%;
		height: 2.5rem;
		padding: 0 0.875rem;

		/* 边框和圆角 */
		border: 1px solid var(--color-border);
		border-radius: var(--radius, 0.625rem);

		/* 背景 */
		background-color: var(--color-bg-elevated, #ffffff);
		color: var(--color-fg-primary);

		/* 字体 */
		font-size: 0.875rem;
		line-height: 1.25rem;
		font-family: inherit;

		/* 过渡动画 */
		transition: border-color 0.2s ease, box-shadow 0.2s ease;

		/* 占位符样式 */
		&::placeholder {
			color: var(--color-fg-muted, #a9a5a2);
			opacity: 1;
		}
	}

	/* Focus 状态 - 温暖的橙色光晕 */
	.input-base:focus {
		outline: none;
		border-color: var(--color-border-focus, #ffb38a);
		box-shadow: 
			0 0 0 3px var(--color-primary-ring, rgba(255, 107, 53, 0.15)),
			0 1px 3px rgba(0, 0, 0, 0.05);
	}

	/* Error 状态 - 红色边框和光晕 */
	.input-base.input-error {
		border-color: var(--color-error, #ef4444);
	}

	.input-base.input-error:focus {
		border-color: var(--color-error, #ef4444);
		box-shadow: 
			0 0 0 3px var(--color-error-ring, rgba(239, 68, 68, 0.20)),
			0 1px 3px rgba(0, 0, 0, 0.05);
	}

	/* Disabled 状态 */
	.input-base:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background-color: var(--color-bg-secondary, #fff8f5);
	}

	/* 错误提示信息 */
	.error-message {
		margin: 0;
		padding: 0 0.125rem;
		font-size: 0.75rem;
		line-height: 1rem;
		color: var(--color-error, #ef4444);
	}

	/* 暗色模式自动适配 - 通过 CSS variables */
</style>
