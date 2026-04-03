<script lang="ts">
	/**
	 * ImagePreview 组件
	 *
	 * 全屏图片预览模态框
	 * - 点击图片放大预览
	 * - 支持缩放控制（放大/缩小/适应屏幕）
	 * - 支持图片拖拽（放大后移动查看）
	 * - 支持图片旋转（90度）
	 * - 支持多图片切换（左右箭头键）
	 * - 支持键盘操作（ESC 关闭）
	 * - 支持下载图片
	 * - 支持复制图片链接
	 * - 平滑动画过渡
	 * - 从点击位置展开动画
	 */

	interface ImageData {
		src: string;
		alt: string;
	}

	interface Props {
		/** 图片源地址 */
		src: string;
		/** 图片替代文本 */
		alt?: string;
		/** 是否显示预览 */
		open: boolean;
		/** 关闭回调 */
		onClose: () => void;
		/** 所有图片列表（用于多图切换） */
		images?: ImageData[];
		/** 当前图片索引 */
		currentIndex?: number;
		/** 切换图片回调 */
		onNavigate?: (index: number) => void;
	}

	let { 
		src, 
		alt = "", 
		open, 
		onClose,
		images = [],
		currentIndex = 0,
		onNavigate
	}: Props = $props();

	// 缩放状态
	let scale = $state(1);
	let translateX = $state(0);
	let translateY = $state(0);
	let rotation = $state(0);
	let imageLoaded = $state(false);
	let imageError = $state(false);

	// 拖拽状态
	let isDragging = $state(false);
	let dragStartX = $state(0);
	let dragStartY = $state(0);
	let dragOffsetX = $state(0);
	let dragOffsetY = $state(0);

	// 动画状态
	let animationOrigin = $state<{ x: number; y: number } | null>(null);

	// 图片索引
	let imageIndex = $state(0);

	// 缩放级别
	const ZOOM_LEVELS = [0.5, 0.75, 1, 1.5, 2, 3];
	let currentZoomIndex = $state(2); // 默认 1x

	// 是否有多张图片
	const hasMultipleImages = $derived(images.length > 1);

	// 当前图片
	const currentImage = $derived(
		hasMultipleImages && images[imageIndex] 
			? images[imageIndex] 
			: { src, alt }
	);

	// 同步 currentIndex prop
	$effect(() => {
		imageIndex = currentIndex;
	});

	// 重置状态
	function resetState() {
		scale = 1;
		translateX = 0;
		translateY = 0;
		rotation = 0;
		currentZoomIndex = 2;
		imageLoaded = false;
		imageError = false;
		isDragging = false;
		imageIndex = currentIndex;
	}

	// 放大
	function zoomIn() {
		if (currentZoomIndex < ZOOM_LEVELS.length - 1) {
			currentZoomIndex++;
			scale = ZOOM_LEVELS[currentZoomIndex];
		}
	}

	// 缩小
	function zoomOut() {
		if (currentZoomIndex > 0) {
			currentZoomIndex--;
			scale = ZOOM_LEVELS[currentZoomIndex];
		}
	}

	// 适应屏幕
	function fitToScreen() {
		scale = 1;
		translateX = 0;
		translateY = 0;
		rotation = 0;
		currentZoomIndex = 2;
	}

	// 旋转（顺时针 90 度）
	function rotateRight() {
		rotation = (rotation + 90) % 360;
	}

	// 旋转（逆时针 90 度）
	function rotateLeft() {
		rotation = (rotation - 90 + 360) % 360;
	}

	// 下载图片
	async function downloadImage() {
		try {
			const response = await fetch(currentImage.src);
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = currentImage.alt || "image.png";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("下载图片失败:", error);
		}
	}

	// 复制图片链接
	async function copyImageLink() {
		try {
			await navigator.clipboard.writeText(currentImage.src);
			// 可以添加一个提示
		} catch (error) {
			console.error("复制链接失败:", error);
		}
	}

	// 上一张图片
	function previousImage() {
		if (hasMultipleImages && imageIndex > 0) {
			imageIndex--;
			resetState();
			onNavigate?.(imageIndex);
		}
	}

	// 下一张图片
	function nextImage() {
		if (hasMultipleImages && imageIndex < images.length - 1) {
			imageIndex++;
			resetState();
			onNavigate?.(imageIndex);
		}
	}

	// 处理背景点击（关闭）
	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	// 开始拖拽
	function handleDragStart(e: MouseEvent) {
		if (scale > 1) {
			isDragging = true;
			dragStartX = e.clientX;
			dragStartY = e.clientY;
			dragOffsetX = translateX;
			dragOffsetY = translateY;
			e.preventDefault();
		}
	}

	// 拖拽中
	function handleDragMove(e: MouseEvent) {
		if (isDragging) {
			const deltaX = e.clientX - dragStartX;
			const deltaY = e.clientY - dragStartY;
			translateX = dragOffsetX + deltaX;
			translateY = dragOffsetY + deltaY;
		}
	}

	// 结束拖拽
	function handleDragEnd() {
		isDragging = false;
	}

	// 处理键盘事件
	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;

		switch (e.key) {
			case "Escape":
				onClose();
				break;
			case "+":
			case "=":
				zoomIn();
				break;
			case "-":
				zoomOut();
				break;
			case "0":
				fitToScreen();
				break;
			case "ArrowLeft":
				previousImage();
				break;
			case "ArrowRight":
				nextImage();
				break;
			case "r":
			case "R":
				if (e.shiftKey) {
					rotateLeft();
				} else {
					rotateRight();
				}
				break;
		}
	}

	// 处理图片加载
	function handleImageLoad() {
		imageLoaded = true;
		imageError = false;
	}

	// 处理图片加载错误
	function handleImageError() {
		imageLoaded = true;
		imageError = true;
	}

	// 鼠标滚轮缩放
	function handleWheel(e: WheelEvent) {
		if (e.ctrlKey || e.metaKey) {
			e.preventDefault();
			if (e.deltaY < 0) {
				zoomIn();
			} else {
				zoomOut();
			}
		}
	}

	// 监听 open 状态变化
	$effect(() => {
		if (open) {
			resetState();
			document.addEventListener("keydown", handleKeydown);
			document.body.style.overflow = "hidden";
		} else {
			document.removeEventListener("keydown", handleKeydown);
			document.body.style.overflow = "";
		}

		return () => {
			document.removeEventListener("keydown", handleKeydown);
			document.body.style.overflow = "";
		};
	});
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="image-preview-backdrop"
		class:dragging={isDragging}
		onclick={handleBackdropClick}
		onmousemove={handleDragMove}
		onmouseup={handleDragEnd}
		onmouseleave={handleDragEnd}
		onwheel={handleWheel}
		role="dialog"
		aria-modal="true"
		aria-label="图片预览"
		tabindex="-1"
	>
		<!-- 顶部工具栏 -->
		<div class="preview-toolbar">
			<div class="toolbar-left">
				<!-- 缩放控制 -->
				<button
					class="toolbar-btn"
					onclick={zoomOut}
					disabled={currentZoomIndex === 0}
					title="缩小 (-)"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="11" cy="11" r="8"/>
						<line x1="21" y1="21" x2="16.65" y2="16.65"/>
						<line x1="8" y1="11" x2="14" y2="11"/>
					</svg>
				</button>

				<span class="zoom-level">{Math.round(scale * 100)}%</span>

				<button
					class="toolbar-btn"
					onclick={zoomIn}
					disabled={currentZoomIndex === ZOOM_LEVELS.length - 1}
					title="放大 (+)"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="11" cy="11" r="8"/>
						<line x1="21" y1="21" x2="16.65" y2="16.65"/>
						<line x1="11" y1="8" x2="11" y2="14"/>
						<line x1="8" y1="11" x2="14" y2="11"/>
					</svg>
				</button>

				<div class="toolbar-divider"></div>

				<button
					class="toolbar-btn"
					onclick={fitToScreen}
					title="适应屏幕 (0)"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M8 3H5a2 2 0 0 0-2 2v3"/>
						<path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
						<path d="M3 16v3a2 2 0 0 0 2 2h3"/>
						<path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
					</svg>
				</button>

				<!-- 旋转控制 -->
				<button
					class="toolbar-btn"
					onclick={rotateLeft}
					title="逆时针旋转 (Shift+R)"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="1 4 1 10 7 10"/>
						<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
					</svg>
				</button>

				<button
					class="toolbar-btn"
					onclick={rotateRight}
					title="顺时针旋转 (R)"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="23 4 23 10 17 10"/>
						<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
					</svg>
				</button>
			</div>

			<!-- 图片计数 -->
			{#if hasMultipleImages}
				<div class="toolbar-center">
					<span class="image-counter">{imageIndex + 1} / {images.length}</span>
				</div>
			{/if}

			<div class="toolbar-right">
				<!-- 复制链接 -->
				<button
					class="toolbar-btn"
					onclick={copyImageLink}
					title="复制链接"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
						<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
					</svg>
				</button>

				<!-- 下载按钮 -->
				<button
					class="toolbar-btn"
					onclick={downloadImage}
					title="下载图片"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
						<polyline points="7 10 12 15 17 10"/>
						<line x1="12" y1="15" x2="12" y2="3"/>
					</svg>
				</button>

				<div class="toolbar-divider"></div>

				<!-- 关闭按钮 -->
				<button
					class="toolbar-btn close-btn"
					onclick={onClose}
					title="关闭 (Esc)"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"/>
						<line x1="6" y1="6" x2="18" y2="18"/>
					</svg>
				</button>
			</div>
		</div>

		<!-- 图片容器 -->
		<div class="image-container">
			<!-- 上一张按钮 -->
			{#if hasMultipleImages && imageIndex > 0}
				<button
					class="nav-btn prev-btn"
					onclick={previousImage}
					title="上一张 (←)"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="15 18 9 12 15 6"/>
					</svg>
				</button>
			{/if}

			{#if !imageLoaded}
				<!-- 加载状态 -->
				<div class="loading-placeholder">
					<div class="loading-spinner"></div>
					<p class="loading-text">加载中...</p>
				</div>
			{:else if imageError}
				<!-- 错误状态 -->
				<div class="error-placeholder">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="error-icon">
						<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
						<circle cx="8.5" cy="8.5" r="1.5"/>
						<polyline points="21 15 16 10 5 21"/>
					</svg>
					<p class="error-text">图片加载失败</p>
					<button class="retry-btn" onclick={resetState}>
						重试
					</button>
				</div>
			{:else}
				<!-- 图片 -->
				<!-- svelte-ignore a11y_mouse_events_have_key_events -->
				<img
					src={currentImage.src}
					alt={currentImage.alt}
					class="preview-image"
					class:draggable={scale > 1}
					style="transform: scale({scale}) translate({translateX}px, {translateY}px) rotate({rotation}deg);"
					onload={handleImageLoad}
					onerror={handleImageError}
					onmousedown={handleDragStart}
					draggable="false"
				/>
			{/if}

			<!-- 下一张按钮 -->
			{#if hasMultipleImages && imageIndex < images.length - 1}
				<button
					class="nav-btn next-btn"
					onclick={nextImage}
					title="下一张 (→)"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6"/>
					</svg>
				</button>
			{/if}
		</div>

		<!-- 底部信息 -->
		{#if currentImage.alt && imageLoaded && !imageError}
			<div class="preview-footer">
				<p class="image-alt">{currentImage.alt}</p>
				{#if scale > 1}
					<p class="drag-hint">💡 拖拽图片移动查看</p>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	/* 背景遮罩 */
	.image-preview-backdrop {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 0, 0, 0.9);
		backdrop-filter: blur(8px);
		animation: fadeIn var(--duration-normal) var(--ease-out);
	}

	.image-preview-backdrop.dragging {
		cursor: grabbing;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* 工具栏 */
	.preview-toolbar {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.7) 0%,
			transparent 100%
		);
		z-index: 10;
	}

	.toolbar-left,
	.toolbar-right {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.toolbar-center {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}

	.image-counter {
		font-size: var(--text-sm);
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
		padding: var(--space-1) var(--space-3);
		background: rgba(255, 255, 255, 0.1);
		border-radius: var(--radius-md);
	}

	.toolbar-divider {
		width: 1px;
		height: 24px;
		background: rgba(255, 255, 255, 0.2);
		margin: 0 var(--space-1);
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		border-radius: var(--radius-md);
		background-color: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.toolbar-btn:hover:not(:disabled) {
		background-color: rgba(255, 255, 255, 0.2);
		transform: scale(1.05);
	}

	.toolbar-btn:active:not(:disabled) {
		transform: scale(0.95);
	}

	.toolbar-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.toolbar-btn svg {
		width: 20px;
		height: 20px;
	}

	.zoom-level {
		min-width: 50px;
		text-align: center;
		font-size: var(--text-sm);
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
	}

	.close-btn:hover {
		background-color: rgba(239, 68, 68, 0.8);
	}

	/* 图片容器 */
	.image-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		padding: var(--space-16) var(--space-4);
	}

	.preview-image {
		max-width: 90%;
		max-height: 90%;
		object-fit: contain;
		border-radius: var(--radius-lg);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		transition: transform var(--duration-normal) var(--ease-out);
		user-select: none;
	}

	.preview-image.draggable {
		cursor: grab;
	}

	.preview-image.draggable:active {
		cursor: grabbing;
	}

	/* 导航按钮 */
	.nav-btn {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border: none;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
		cursor: pointer;
		transition: all var(--transition-fast);
		z-index: 5;
	}

	.nav-btn:hover {
		background-color: rgba(255, 255, 255, 0.2);
		transform: translateY(-50%) scale(1.1);
	}

	.nav-btn:active {
		transform: translateY(-50%) scale(0.95);
	}

	.nav-btn svg {
		width: 24px;
		height: 24px;
	}

	.prev-btn {
		left: var(--space-4);
	}

	.next-btn {
		right: var(--space-4);
	}

	/* 加载状态 */
	.loading-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
	}

	.loading-spinner {
		width: 48px;
		height: 48px;
		border: 3px solid rgba(255, 255, 255, 0.1);
		border-top-color: var(--color-brand-400);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		font-size: var(--text-sm);
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
	}

	/* 错误状态 */
	.error-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
	}

	.error-icon {
		width: 64px;
		height: 64px;
		color: rgba(255, 255, 255, 0.3);
	}

	.error-text {
		font-size: var(--text-base);
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
	}

	.retry-btn {
		margin-top: var(--space-2);
		padding: var(--space-2) var(--space-4);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: var(--radius-md);
		background: transparent;
		color: rgba(255, 255, 255, 0.9);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.retry-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.5);
	}

	/* 底部信息 */
	.preview-footer {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: var(--space-4);
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.7) 0%,
			transparent 100%
		);
		text-align: center;
	}

	.image-alt {
		font-size: var(--text-sm);
		color: rgba(255, 255, 255, 0.8);
		margin: 0 0 var(--space-1);
		max-width: 80%;
		margin: 0 auto;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.drag-hint {
		font-size: var(--text-xs);
		color: rgba(255, 255, 255, 0.5);
		margin: var(--space-1) 0 0;
	}

	/* 响应式 */
	@media (max-width: 640px) {
		.preview-toolbar {
			padding: var(--space-2) var(--space-3);
		}

		.toolbar-btn {
			width: 32px;
			height: 32px;
		}

		.toolbar-btn svg {
			width: 18px;
			height: 18px;
		}

		.toolbar-divider {
			display: none;
		}

		.image-container {
			padding: var(--space-14) var(--space-3);
		}

		.nav-btn {
			width: 40px;
			height: 40px;
		}

		.nav-btn svg {
			width: 20px;
			height: 20px;
		}

		.prev-btn {
			left: var(--space-2);
		}

		.next-btn {
			right: var(--space-2);
		}
	}

	/* Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.image-preview-backdrop {
			animation: none;
		}

		.preview-image {
			transition: none;
		}

		.loading-spinner {
			animation: none;
		}
	}
</style>
