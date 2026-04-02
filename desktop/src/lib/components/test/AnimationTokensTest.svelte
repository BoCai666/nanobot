<script lang="ts">
	/**
	 * 动画 Tokens 测试页面
	 * 验证所有动画变量和工具类是否正确工作
	 */
	import { onMount } from 'svelte';

	let reducedMotion = false;

	onMount(() => {
		// 检测 prefers-reduced-motion
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = mediaQuery.matches;

		mediaQuery.addEventListener('change', (e) => {
			reducedMotion = e.matches;
		});
	});
</script>

<div class="p-8 space-y-8">
	<h1 class="text-h1 mb-8">动画 Tokens 测试</h1>

	<!-- Duration Tokens -->
	<section class="space-y-4">
		<h2 class="text-h2">Duration Tokens</h2>
		<div class="grid grid-cols-3 gap-4">
			<div class="p-4 bg-neutral-100 rounded-lg">
				<div class="text-sm text-neutral-500">--duration-instant</div>
				<div class="text-lg font-semibold">100ms</div>
			</div>
			<div class="p-4 bg-neutral-100 rounded-lg">
				<div class="text-sm text-neutral-500">--duration-fast</div>
				<div class="text-lg font-semibold">150ms</div>
			</div>
			<div class="p-4 bg-neutral-100 rounded-lg">
				<div class="text-sm text-neutral-500">--duration-normal</div>
				<div class="text-lg font-semibold">200ms</div>
			</div>
			<div class="p-4 bg-neutral-100 rounded-lg">
				<div class="text-sm text-neutral-500">--duration-slow</div>
				<div class="text-lg font-semibold">300ms</div>
			</div>
			<div class="p-4 bg-neutral-100 rounded-lg">
				<div class="text-sm text-neutral-500">--duration-slower</div>
				<div class="text-lg font-semibold">400ms</div>
			</div>
			<div class="p-4 bg-neutral-100 rounded-lg">
				<div class="text-sm text-neutral-500">--duration-slowest</div>
				<div class="text-lg font-semibold">500ms</div>
			</div>
		</div>
	</section>

	<!-- Easing Tokens -->
	<section class="space-y-4">
		<h2 class="text-h2">Easing Tokens</h2>
		<div class="grid grid-cols-2 gap-4">
			<div class="p-4 bg-neutral-100 rounded-lg">
				<div class="text-sm text-neutral-500">--ease-out</div>
				<div class="text-xs font-mono">cubic-bezier(0.16, 1, 0.3, 1)</div>
			</div>
			<div class="p-4 bg-neutral-100 rounded-lg">
				<div class="text-sm text-neutral-500">--ease-in</div>
				<div class="text-xs font-mono">cubic-bezier(0.7, 0, 0.84, 0)</div>
			</div>
			<div class="p-4 bg-neutral-100 rounded-lg">
				<div class="text-sm text-neutral-500">--ease-in-out</div>
				<div class="text-xs font-mono">cubic-bezier(0.65, 0, 0.35, 1)</div>
			</div>
			<div class="p-4 bg-neutral-100 rounded-lg">
				<div class="text-sm text-neutral-500">--ease-spring</div>
				<div class="text-xs font-mono">cubic-bezier(0.34, 1.56, 0.64, 1)</div>
			</div>
			<div class="p-4 bg-neutral-100 rounded-lg">
				<div class="text-sm text-neutral-500">--ease-bounce</div>
				<div class="text-xs font-mono">cubic-bezier(0.34, 1.56, 0.64, 1)</div>
			</div>
			<div class="p-4 bg-neutral-100 rounded-lg">
				<div class="text-sm text-neutral-500">--ease-elastic</div>
				<div class="text-xs font-mono">cubic-bezier(0.68, -0.55, 0.265, 1.55)</div>
			</div>
		</div>
	</section>

	<!-- Delay Tokens -->
	<section class="space-y-4">
		<h2 class="text-h2">Delay Tokens</h2>
		<div class="flex gap-4">
			<div class="p-4 bg-neutral-100 rounded-lg">
				<div class="text-sm text-neutral-500">--delay-fast</div>
				<div class="text-lg font-semibold">50ms</div>
			</div>
			<div class="p-4 bg-neutral-100 rounded-lg">
				<div class="text-sm text-neutral-500">--delay-normal</div>
				<div class="text-lg font-semibold">100ms</div>
			</div>
			<div class="p-4 bg-neutral-100 rounded-lg">
				<div class="text-sm text-neutral-500">--delay-slow</div>
				<div class="text-lg font-semibold">150ms</div>
			</div>
		</div>
	</section>

	<!-- 过渡动画测试 -->
	<section class="space-y-4">
		<h2 class="text-h2">过渡动画</h2>
		<div class="grid grid-cols-3 gap-4">
			<div class="p-6 bg-white rounded-lg border hover:shadow-lg transition-[transform] hover:-translate-y-1" 
			     style="transition-duration: var(--duration-fast); transition-timing-function: var(--ease-out);">
				<div class="text-sm text-neutral-500 mb-2">fadeIn</div>
				<div class="animate-fade-in">淡入效果</div>
			</div>
			<div class="p-6 bg-white rounded-lg border">
				<div class="text-sm text-neutral-500 mb-2">fadeInUp</div>
				<div class="animate-fade-in-up">淡入向上</div>
			</div>
			<div class="p-6 bg-white rounded-lg border">
				<div class="text-sm text-neutral-500 mb-2">fadeInDown</div>
				<div class="animate-fade-in-down">淡入向下</div>
			</div>
			<div class="p-6 bg-white rounded-lg border">
				<div class="text-sm text-neutral-500 mb-2">slideInLeft</div>
				<div class="animate-slide-in-left">左侧滑入</div>
			</div>
			<div class="p-6 bg-white rounded-lg border">
				<div class="text-sm text-neutral-500 mb-2">slideInRight</div>
				<div class="animate-slide-in-right">右侧滑入</div>
			</div>
			<div class="p-6 bg-white rounded-lg border">
				<div class="text-sm text-neutral-500 mb-2">scaleIn</div>
				<div class="animate-scale-in">缩放淡入</div>
			</div>
		</div>
	</section>

	<!-- 微交互动画测试 -->
	<section class="space-y-4">
		<h2 class="text-h2">微交互动画</h2>
		<div class="flex gap-4 flex-wrap">
			<button class="btn-interactive px-4 py-2 bg-primary text-white rounded-lg">
				悬停上浮 + 按压缩放
			</button>
			<button class="hover-lift px-4 py-2 bg-neutral-200 rounded-lg">
				仅悬停上浮
			</button>
			<button class="press-scale px-4 py-2 bg-neutral-200 rounded-lg">
				仅按压缩放
			</button>
			<button class="ripple-container px-4 py-2 bg-primary text-white rounded-lg overflow-hidden">
				波纹效果 (需 JS)
			</button>
		</div>
	</section>

	<!-- 加载动画测试 -->
	<section class="space-y-4">
		<h2 class="text-h2">加载动画</h2>
		<div class="flex gap-8 items-center">
			<div class="flex flex-col items-center gap-2">
				<div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
				<div class="text-sm text-neutral-500">spin</div>
			</div>
			<div class="flex flex-col items-center gap-2">
				<div class="w-4 h-4 bg-primary rounded-full animate-pulse-soft"></div>
				<div class="text-sm text-neutral-500">pulse-soft</div>
			</div>
			<div class="flex flex-col items-center gap-2">
				<div class="w-4 h-4 bg-primary rounded-full animate-pulse-glow"></div>
				<div class="text-sm text-neutral-500">pulse-glow</div>
			</div>
			<div class="flex flex-col items-center gap-2">
				<div class="animate-bounce text-2xl">↓</div>
				<div class="text-sm text-neutral-500">bounce</div>
			</div>
		</div>

		<!-- 骨架屏 -->
		<div class="mt-4">
			<div class="text-sm text-neutral-500 mb-2">骨架屏闪烁</div>
			<div class="space-y-2">
				<div class="h-4 w-48 animate-skeleton rounded"></div>
				<div class="h-4 w-32 animate-skeleton rounded"></div>
				<div class="h-4 w-40 animate-skeleton rounded"></div>
			</div>
		</div>
	</section>

	<!-- 错开动画测试 -->
	<section class="space-y-4">
		<h2 class="text-h2">错开动画 (Staggered)</h2>
		<div class="stagger-list space-y-2">
			{#each Array(5) as _, i}
				<div class="animate-fade-in-up p-3 bg-neutral-100 rounded">
					项目 {i + 1} (延迟: {i * 50}ms)
				</div>
			{/each}
		</div>
	</section>

	<!-- Reduced Motion 状态 -->
	<section class="space-y-4">
		<h2 class="text-h2">Reduced Motion 状态</h2>
		<div class="p-4 rounded-lg {reducedMotion ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
			{#if reducedMotion}
				⚠️ 检测到 prefers-reduced-motion: reduce — 动画已禁用或简化
			{:else}
				✅ 动画正常启用
			{/if}
		</div>
	</section>

	<!-- 向后兼容性测试 -->
	<section class="space-y-4">
		<h2 class="text-h2">向后兼容性</h2>
		<div class="grid grid-cols-2 gap-4">
			<div class="p-4 bg-neutral-100 rounded-lg">
				<div class="text-sm text-neutral-500 mb-2">--duration-base (别名)</div>
				<div class="text-lg font-semibold">等于 --duration-normal</div>
			</div>
			<div class="p-4 bg-neutral-100 rounded-lg">
				<div class="text-sm text-neutral-500 mb-2">--transition-base (别名)</div>
				<div class="text-lg font-semibold">等于 --transition-normal</div>
			</div>
		</div>
		<button class="mt-4 px-4 py-2 bg-neutral-200 rounded transition-all hover:bg-neutral-300"
		        style="transition-duration: var(--duration-base); transition-timing-function: var(--ease-out);">
			使用 --transition-base 的按钮
		</button>
	</section>
</div>

<style>
	/* 测试特定样式 */
	.bg-primary {
		background-color: var(--color-primary);
	}

	.bg-neutral-100 {
		background-color: var(--color-neutral-100);
	}

	.bg-neutral-200 {
		background-color: var(--color-neutral-200);
	}

	.bg-green-100 {
		background-color: #dcfce7;
	}

	.bg-yellow-100 {
		background-color: #fef9c3;
	}

	.text-neutral-500 {
		color: var(--color-neutral-500);
	}

	.text-green-800 {
		color: #166534;
	}

	.text-yellow-800 {
		color: #854d0e;
	}

	.text-white {
		color: white;
	}

	.border {
		border: 1px solid var(--color-border);
	}

	.rounded-lg {
		border-radius: var(--radius-lg);
	}

	.rounded {
		border-radius: var(--radius-sm);
	}

	.p-3 {
		padding: 0.75rem;
	}

	.p-4 {
		padding: 1rem;
	}

	.p-6 {
		padding: 1.5rem;
	}

	.p-8 {
		padding: 2rem;
	}

	.px-4 {
		padding-left: 1rem;
		padding-right: 1rem;
	}

	.py-2 {
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
	}

	.mt-4 {
		margin-top: 1rem;
	}

	.mb-2 {
		margin-bottom: 0.5rem;
	}

	.mb-8 {
		margin-bottom: 2rem;
	}

	.w-4 {
		width: 1rem;
	}

	.w-8 {
		width: 2rem;
	}

	.w-32 {
		width: 8rem;
	}

	.w-40 {
		width: 10rem;
	}

	.w-48 {
		width: 12rem;
	}

	.h-4 {
		height: 1rem;
	}

	.h-8 {
		height: 2rem;
	}

	.space-y-2 > * + * {
		margin-top: 0.5rem;
	}

	.space-y-4 > * + * {
		margin-top: 1rem;
	}

	.space-y-8 > * + * {
		margin-top: 2rem;
	}

	.gap-2 {
		gap: 0.5rem;
	}

	.gap-4 {
		gap: 1rem;
	}

	.gap-8 {
		gap: 2rem;
	}

	.flex {
		display: flex;
	}

	.flex-col {
		flex-direction: column;
	}

	.flex-wrap {
		flex-wrap: wrap;
	}

	.items-center {
		align-items: center;
	}

	.grid {
		display: grid;
	}

	.grid-cols-2 {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.grid-cols-3 {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.overflow-hidden {
		overflow: hidden;
	}

	.border-t-transparent {
		border-top-color: transparent;
	}

	.border-2 {
		border-width: 2px;
	}

	.text-2xl {
		font-size: 1.5rem;
	}

	.text-xs {
		font-size: 0.75rem;
	}

	.text-sm {
		font-size: 0.875rem;
	}

	.text-lg {
		font-size: 1.125rem;
	}

	.font-semibold {
		font-weight: 600;
	}

	.font-mono {
		font-family: var(--font-mono);
	}

	.transition-all {
		transition-property: all;
		transition-timing-function: var(--ease-out);
		transition-duration: var(--duration-normal);
	}

	.hover\:bg-neutral-300:hover {
		background-color: var(--color-neutral-300);
	}

	.hover\:shadow-lg:hover {
		box-shadow: var(--shadow-lg);
	}

	.hover\:-translate-y-1:hover {
		transform: translateY(-0.25rem);
	}

	.border-2 {
		border-width: 2px;
	}
</style>
