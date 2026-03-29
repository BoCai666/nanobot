# Design System

nanobot desktop 应用的样式系统，基于 CSS 变量和 Tailwind CSS 构建。

## 颜色系统

### 主色调

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--color-primary` | `#0d9488` | `#0d9488` | 主色调（青绿色） |
| `--color-primary-light` | `#14b8a6` | `#14b8a6` | 浅色主色 |
| `--color-primary-dark` | `#0f766e` | `#0f766e` | 深色主色 |

### shadcn-svelte 兼容变量

这些变量与 shadcn-svelte 组件库兼容，用于控制组件的语义颜色。

| Token | Light (HSL) | Dark (HSL) | 用途 |
|-------|-------------|------------|------|
| `--background` | `0 0% 100%` | `222 47% 11%` | 页面背景 |
| `--foreground` | `0 0% 9%` | `210 40% 98%` | 主文字 |
| `--card` | `0 0% 100%` | `222 47% 11%` | 卡片背景 |
| `--card-foreground` | `0 0% 9%` | `210 40% 98%` | 卡片文字 |
| `--primary` | `168 84% 34%` | `168 84% 41%` | 主要操作 |
| `--primary-foreground` | `0 0% 100%` | `0 0% 100%` | 主色文字 |
| `--secondary` | `210 40% 96%` | `217 33% 17%` | 次要背景 |
| `--secondary-foreground` | `0 0% 9%` | `210 40% 98%` | 次要文字 |
| `--muted` | `210 40% 96%` | `217 33% 17%` | 静音背景 |
| `--muted-foreground` | `215 16% 47%` | `215 20% 65%` | 静音文字 |
| `--accent` | `210 40% 96%` | `217 33% 17%` | 强调背景 |
| `--accent-foreground` | `0 0% 9%` | `210 40% 98%` | 强调文字 |
| `--destructive` | `0 84% 60%` | `0 62% 30%` | 危险/错误 |
| `--destructive-foreground` | `0 0% 100%` | `210 40% 98%` | 危险文字 |
| `--border` | `214 32% 91%` | `217 33% 17%` | 边框色 |
| `--input` | `214 32% 91%` | `217 33% 17%` | 输入框边框 |
| `--ring` | `168 84% 34%` | `168 84% 41%` | 焦点环 |

### 中性色

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--color-neutral-50` | `#fafafa` | — | 最浅灰 |
| `--color-neutral-100` | `#f5f5f5` | — | 浅灰 |
| `--color-neutral-200` | `#e5e5e5` | — | 边框浅 |
| `--color-neutral-300` | `#d4d4d4` | — | 占位符 |
| `--color-neutral-400` | `#a3a3a3` | — | 次要文字 |
| `--color-neutral-500` | `#737373` | — | 静音文字 |
| `--color-neutral-600` | `#525252` | — | 深灰 |
| `--color-neutral-700` | `#404040` | — | 深色 |
| `--color-neutral-800` | `#262626` | — | 更深 |
| `--color-neutral-900` | `#171717` | — | 最深 |

### 语义色

| Token | 颜色 | 用途 |
|-------|------|------|
| `--color-success` | `#22c55e` | 成功状态 |
| `--color-warning` | `#f59e0b` | 警告状态 |
| `--color-error` | `#ef4444` | 错误状态 |
| `--color-info` | `#3b82f6` | 信息提示 |

### 背景色

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--color-bg-primary` | `#ffffff` | `#0a0a0a` | 主背景 |
| `--color-bg-secondary` | `#f8fafc` | `#171717` | 次背景 |
| `--color-bg-tertiary` | `#f1f5f9` | `#262626` | 第三背景 |

### 文字色

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--color-text-primary` | `#171717` | `#fafafa` | 主文字 |
| `--color-text-secondary` | `#525252` | `#a3a3a3` | 次要文字 |
| `--color-text-tertiary` | `#737373` | `#737373` | 静音文字 |
| `--color-text-inverse` | `#ffffff` | — | 反色文字 |

### 边框色

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--color-border` | `#e5e5e5` | `#334155` | 默认边框 |
| `--color-border-hover` | `#d4d4d4` | `#475569` | 悬停边框 |

### 消息气泡色

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--user-bubble` | `#3b82f6` | `#3b82f6` | 用户消息 |
| `--user-bubble-foreground` | `#ffffff` | `#ffffff` | 用户消息文字 |
| `--ai-bubble` | `#f1f5f9` | `#1e293b` | AI 消息 |
| `--ai-bubble-foreground` | `#0f172a` | `#f8fafc` | AI 消息文字 |

## 字体系统

| Token | 值 | 用途 |
|-------|---|------|
| `--font-sans` | `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | 正文字体 |
| `--font-mono` | `"JetBrains Mono", "Fira Code", Consolas, Monaco, monospace` | 代码字体 |

## 间距系统

基于 4px 网格系统。

| Token | 值 | 用途 |
|-------|---|------|
| `--space-1` | `0.25rem` (4px) | 紧凑间距 |
| `--space-2` | `0.5rem` (8px) | 小间距 |
| `--space-3` | `0.75rem` (12px) | 中等间距 |
| `--space-4` | `1rem` (16px) | 标准间距 |
| `--space-5` | `1.25rem` (20px) | 中大间距 |
| `--space-6` | `1.5rem` (24px) | 大间距 |
| `--space-8` | `2rem` (32px) | 特大间距 |

## 圆角系统

| Token | 值 | 用途 |
|-------|---|------|
| `--radius-sm` | `0.375rem` (6px) | 小圆角 |
| `--radius-md` | `0.5rem` (8px) | 默认圆角 |
| `--radius-lg` | `0.75rem` (12px) | 大圆角 |
| `--radius-xl` | `1rem` (16px) | 特大圆角 |

## 阴影系统

| Token | Light | Dark | 用途 |
|-------|-------|------|------|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | `0 1px 2px 0 rgb(0 0 0 / 0.3)` | 小阴影 |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | 同左，opacity 更高 | 中阴影 |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | 同左，opacity 更高 | 大阴影 |

## 过渡动画

| Token | 值 | 用途 |
|-------|---|------|
| `--transition-fast` | `150ms ease` | 快速过渡 |
| `--transition-base` | `200ms ease` | 默认过渡 |
| `--transition-slow` | `300ms ease` | 慢速过渡 |

## 布局常量

| Token | 值 | 用途 |
|-------|------|------|
| `--sidebar-width` | `240px` | 侧边栏宽度 |
| `--sidebar-collapsed-width` | `64px` | 收起状态宽度 |
| `--statusbar-height` | `36px` | 状态栏高度 |

## 主题切换

### 自动切换（媒体查询）

默认通过 `prefers-color-scheme` 媒体查询自动检测系统主题：

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* 暗色变量 */
  }
}
```

### 手动切换（Class）

在 `<html>` 或 `<body>` 上添加 `.dark` class 强制启用暗色模式，优先级高于媒体查询：

```javascript
// 启用暗色
document.documentElement.classList.add('dark');

// 禁用暗色
document.documentElement.classList.remove('dark');

// 切换主题
document.documentElement.classList.toggle('dark');
```

### Tailwind 暗色模式

项目配置为 class-based 暗色模式，Tailwind 的 `dark:` 变体会自动响应 `.dark` class。

## 组件使用示例

### Button

按钮组件，支持多种变体和尺寸。

```svelte
<script>
  import Button from "$lib/components/ui/Button.svelte";
</script>

<!-- 主要按钮 -->
<Button variant="default">Default</Button>

<!-- 危险按钮 -->
<Button variant="destructive">Destructive</Button>

<!-- 轮廓按钮 -->
<Button variant="outline">Outline</Button>

<!-- 次要按钮 -->
<Button variant="secondary">Secondary</Button>

<!-- 幽灵按钮 -->
<Button variant="ghost">Ghost</Button>

<!-- 链接按钮 -->
<Button variant="link">Link</Button>

<!-- 小尺寸 -->
<Button size="sm">Small</Button>

<!-- 大尺寸 -->
<Button size="lg">Large</Button>

<!-- 图标按钮 -->
<Button size="icon">👤</Button>

<!-- 禁用状态 -->
<Button disabled>Disabled</Button>

<!-- 点击事件 -->
<Button onclick={() => console.log('clicked')}>Click Me</Button>
```

**Props:**

| Prop | Type | Default | 描述 |
|------|------|---------|------|
| `variant` | `"default"` \| `"destructive"` \| `"outline"` \| `"secondary"` \| `"ghost"` \| `"link"` | `"default"` | 按钮样式变体 |
| `size` | `"default"` \| `"sm"` \| `"lg"` \| `"icon"` | `"default"` | 按钮尺寸 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `type` | `"button"` \| `"submit"` \| `"reset"` | `"button"` | HTML button type |
| `onclick` | `() => void` | — | 点击回调 |

### Badge

徽章组件，用于显示标签或状态。

```svelte
<script>
  import Badge from "$lib/components/ui/Badge.svelte";
</script>

<!-- 默认徽章 -->
<Badge variant="default">Default</Badge>

<!-- 次要徽章 -->
<Badge variant="secondary">Secondary</Badge>

<!-- 危险徽章 -->
<Badge variant="destructive">Destructive</Badge>

<!-- 轮廓徽章 -->
<Badge variant="outline">Outline</Badge>
```

**Props:**

| Prop | Type | Default | 描述 |
|------|------|---------|------|
| `variant` | `"default"` \| `"secondary"` \| `"destructive"` \| `"outline"` | `"default"` | 徽章样式变体 |

### Input

输入框组件。

```svelte
<script>
  import Input from "$lib/components/ui/Input.svelte";
  let value = $state("");
</script>

<!-- 基本输入框 -->
<Input placeholder="Enter text..." />

<!-- 绑定值 -->
<Input bind:value placeholder="Type here..." />
<p>Current: {value}</p>

<!-- 密码输入 -->
<Input type="password" placeholder="Password" />

<!-- 禁用状态 -->
<Input disabled placeholder="Disabled" />

<!-- 事件处理 -->
<Input 
  placeholder="With events..."
  oninput={(e) => console.log(e.target.value)}
  onfocus={() => console.log('focused')}
  onblur={() => console.log('blurred')}
/>
```

**Props:**

| Prop | Type | Default | 描述 |
|------|------|---------|------|
| `type` | `string` | `"text"` | input type 属性 |
| `placeholder` | `string` | `""` | 占位符文本 |
| `value` | `string` | `""` | 输入值（可绑定） |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `oninput` | `(event: Event) => void` | — | 输入事件回调 |
| `onkeydown` | `(event: KeyboardEvent) => void` | — | 键盘事件回调 |
| `onfocus` | `(event: FocusEvent) => void` | — | 聚焦事件回调 |
| `onblur` | `(event: FocusEvent) => void` | — | 失焦事件回调 |

### Textarea

文本域组件，支持自动高度调整。

```svelte
<script>
  import Textarea from "$lib/components/ui/Textarea.svelte";
  let value = $state("");
</script>

<!-- 基本文本域 -->
<Textarea placeholder="Enter long text..." />

<!-- 绑定值 -->
<Textarea bind:value placeholder="Type here..." />

<!-- 指定行数 -->
<Textarea rows={5} placeholder="5 rows" />

<!-- 最大行数限制 -->
<Textarea maxRows={10} placeholder="Max 10 rows auto-height" />

<!-- 禁用状态 -->
<Textarea disabled placeholder="Disabled" />
```

**Props:**

| Prop | Type | Default | 描述 |
|------|------|---------|------|
| `placeholder` | `string` | `""` | 占位符文本 |
| `value` | `string` | `""` | 输入值（可绑定） |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `rows` | `number` | `1` | 初始行数 |
| `maxRows` | `number` | `10` | 最大行数（控制自动高度） |
| `oninput` | `(event: Event) => void` | — | 输入事件回调 |
| `onkeydown` | `(event: KeyboardEvent) => void` | — | 键盘事件回调 |
| `onfocus` | `(event: FocusEvent) => void` | — | 聚焦事件回调 |
| `onblur` | `(event: FocusEvent) => void` | — | 失焦事件回调 |

### Card

卡片组件，包含多个子组件。

```svelte
<script>
  import Card from "$lib/components/ui/Card.svelte";
  import CardHeader from "$lib/components/ui/CardHeader.svelte";
  import CardTitle from "$lib/components/ui/CardTitle.svelte";
  import CardDescription from "$lib/components/ui/CardDescription.svelte";
  import CardContent from "$lib/components/ui/CardContent.svelte";
</script>

<!-- 基本卡片 -->
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>This is a card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
</Card>

<!-- 简洁用法 -->
<Card>
  <p>Just content without header.</p>
</Card>
```

**Card Props:**

| Prop | Type | 默认值 | 描述 |
|------|------|--------|------|
| `class` | `string` | — | 自定义 class |

### Dialog

对话框组件，支持模态框显示。

```svelte
<script>
  import Dialog from "$lib/components/ui/Dialog.svelte";
  import DialogHeader from "$lib/components/ui/DialogHeader.svelte";
  import DialogTitle from "$lib/components/ui/DialogTitle.svelte";
  import DialogDescription from "$lib/components/ui/DialogDescription.svelte";
  
  let open = $state(false);
</script>

<!-- 触发按钮 -->
<Button onclick={() => open = true}>Open Dialog</Button>

<!-- 对话框 -->
<Dialog bind:open>
  <DialogHeader>
    <DialogTitle>Dialog Title</DialogTitle>
    <DialogDescription>
      This is a dialog description. It explains what this dialog is about.
    </DialogDescription>
  </DialogHeader>
  <p>Dialog content here.</p>
</Dialog>
```

**Dialog Props:**

| Prop | Type | 默认值 | 描述 |
|------|------|--------|------|
| `open` | `boolean` | `false` | 对话框打开状态（可绑定） |
| `onOpenChange` | `(open: boolean) => void` | — | 状态变化回调 |

### Skeleton

骨架屏组件，用于加载占位。

```svelte
<script>
  import Skeleton from "$lib/components/ui/Skeleton.svelte";
</script>

<!-- 基本骨架屏 -->
<Skeleton class="h-4 w-full" />

<!-- 卡片骨架屏 -->
<Card>
  <CardHeader>
    <Skeleton class="h-4 w-1/2" />
    <Skeleton class="h-3 w-3/4" />
  </CardHeader>
  <CardContent>
    <Skeleton class="h-20 w-full" />
  </CardContent>
</Card>

<!-- 头像骨架屏 -->
<Skeleton class="h-12 w-12 rounded-full" />
```

**Props:**

| Prop | Type | 默认值 | 描述 |
|------|------|--------|------|
| `class` | `string` | — | 自定义 class，控制尺寸 |

### Spinner

加载旋转图标。

```svelte
<script>
  import Spinner from "$lib/components/ui/Spinner.svelte";
</script>

<!-- 默认尺寸 -->
<Spinner />

<!-- 小尺寸 -->
<Spinner size="sm" />

<!-- 大尺寸 -->
<Spinner size="lg" />

<!-- 自定义样式 -->
<Spinner class="text-blue-500" />
```

**Props:**

| Prop | Type | 默认值 | 描述 |
|------|------|--------|------|
| `size` | `"sm"` \| `"md"` \| `"lg"` | `"md"` | 旋转图标尺寸 |
| `class` | `string` | — | 自定义 class |

### Avatar

头像组件，支持图片和回退显示。

```svelte
<script>
  import Avatar from "$lib/components/ui/Avatar.svelte";
</script>

<!-- 文字头像 -->
<Avatar fallback="JD" />
<Avatar alt="John Doe" />

<!-- 图片头像 -->
<Avatar src="https://example.com/avatar.jpg" alt="User" />

<!-- 尺寸变体 -->
<Avatar size="sm" fallback="S" />
<Avatar size="md" fallback="M" />
<Avatar size="lg" fallback="L" />

<!-- 图片加载失败时自动回退 -->
<Avatar src="invalid-url.jpg" fallback="F" alt="Failed" />
```

**Props:**

| Prop | Type | 默认值 | 描述 |
|------|------|--------|------|
| `src` | `string` | — | 图片 URL |
| `alt` | `string` | `""` | 图片 alt 文本 |
| `fallback` | `string` | — | 备用文字（无图片或加载失败时显示） |
| `size` | `"sm"` \| `"md"` \| `"lg"` | `"md"` | 头像尺寸 |
| `class` | `string` | — | 自定义 class |

**尺寸规格：**

| Size | 尺寸 | 字体大小 |
|------|------|----------|
| `sm` | 32x32px | 12px (text-xs) |
| `md` | 40x40px | 14px (text-sm) |
| `lg` | 48x48px | 16px (text-base) |
