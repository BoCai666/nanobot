# 状态管理文档

## 概述

Nanobot Desktop 使用 Svelte 5 Runes 语法进行状态管理。本文档介绍状态管理的模式、最佳实践和 API 参考。

## 架构

### 文件结构

```
src/lib/stores/
├── app.svelte.ts      # 应用状态（视图、Agent、Channel）
├── theme.svelte.ts    # 主题状态（亮色/暗色）
└── components/Settings/
    └── settingsStore.svelte.ts  # 设置面板状态
```

### 状态管理模式

采用 **Svelte 5 Runes** 模式：

- `$state` - 响应式状态声明
- `$derived` - 派生状态（计算属性）
- `$effect` - 副作用处理

## 创建状态 Store

### 模式：工厂函数

使用工厂函数 `createXxxStore()` 创建设置状态，通过闭包实现状态封装：

```typescript
// 示例：app.svelte.ts
export function createAppStore() {
    // 响应式状态
    let currentView = $state<ViewType>('chat');
    let sidebarExpanded = $state<boolean>(true);
    
    // 派生状态
    let currentChannelName = $derived(() => {
        const channel = channels.find(ch => ch.id === selectedChannel);
        return channel?.name || 'Chat';
    });
    
    // 方法
    function setView(view: ViewType) {
        currentView = view;
    }
    
    // 返回带有getter的对象
    return {
        get view() { return currentView; },
        get sidebarExpanded() { return sidebarExpanded; },
        get currentChannelName() { return currentChannelName; },
        setView,
        // ...其他方法
    };
}

// 导出单例
export const appStore = createAppStore();
```

### 在组件中使用

```svelte
<script lang="ts">
    import { appStore } from '$lib/stores/app';
    
    // 直接访问
    let view = $derived(appStore.view);
    
    function handleClick() {
        appStore.setView('settings');
    }
</script>

<button onclick={handleClick}>
    当前视图: {view}
</button>
```

## API 参考

### appStore

应用全局状态管理。

#### 状态属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `view` | `ViewType` | 当前视图 ('chat' \| 'settings') |
| `sidebarExpanded` | `boolean` | 侧边栏展开状态 |
| `agentStatus` | `AgentStatus` | Agent 运行状态 ('idle' \| 'running' \| 'error') |
| `apiConnectionStatus` | `ConnectionStatus` | API 连接状态 |
| `connectionStatus` | `ConnectionStatus` | Channel 连接状态 |
| `appMode` | `AppMode` | 应用模式 ('simple' \| 'advanced') |
| `selectedChannel` | `string` | 当前选中的 Channel ID |
| `channels` | `Channel[]` | Channel 列表 |
| `currentChannelName` | `string` | 当前选中的 Channel 名称（派生） |

#### 方法

| 方法 | 描述 |
|------|------|
| `setView(view: ViewType)` | 设置当前视图 |
| `toggleSidebar()` | 切换侧边栏展开/收起 |
| `setSidebarExpanded(expanded: boolean)` | 设置侧边栏状态 |
| `setAgentStatusValue(status: AgentStatus)` | 设置 Agent 状态 |
| `setConnectionStatusValue(status: ConnectionStatus)` | 设置连接状态 |
| `setApiConnectionStatus(status: ConnectionStatus)` | 设置 API 连接状态 |
| `toggleAppMode()` | 切换简单/高级模式 |
| `setAppModeValue(mode: AppMode)` | 设置应用模式 |
| `selectChannel(channelId: string)` | 选择 Channel |
| `setChannelConnected(channelId: string, connected: boolean)` | 设置 Channel 连接状态 |
| `checkApiConnection()` | 检查 API 连接状态 |

### themeStore

主题状态管理。

#### 状态属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `theme` | `Theme` | 当前主题 ('light' \| 'dark') |

#### 方法

| 方法 | 描述 |
|------|------|
| `toggleTheme()` | 切换亮色/暗色主题 |
| `setTheme(theme: Theme)` | 设置指定主题 |
| `initTheme()` | 初始化主题（从 localStorage 或系统偏好读取） |

### settingsStore

设置面板状态管理（位于 `components/Settings/settingsStore.svelte.ts`）。

#### 状态属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `activeTab` | `SettingsTab` | 当前激活的设置标签页 |
| `hasUnsavedChanges` | `boolean` | 是否有未保存的更改 |
| `providers` | `ProviderConfig[]` | Provider 配置列表 |
| `channels` | `ChannelConfig[]` | Channel 配置列表 |
| `agent` | `AgentConfig` | Agent 配置 |
| `tools` | `ToolsConfig` | Tools 配置 |

#### 方法

| 方法 | 描述 |
|------|------|
| `setActiveTab(tab: SettingsTab)` | 设置当前标签页 |
| `updateProvider(name: string, updates: Partial<ProviderConfig>)` | 更新 Provider |
| `toggleProvider(name: string)` | 切换 Provider 启用状态 |
| `updateChannel(id: string, updates: Partial<ChannelConfig>)` | 更新 Channel |
| `toggleChannel(id: string)` | 切换 Channel 启用状态 |
| `updateAgent(updates: Partial<AgentConfig>)` | 更新 Agent 配置 |
| `saveConfig()` | 保存配置 |
| `resetConfig()` | 重置配置 |
| `addMCPServer(server)` | 添加 MCP Server |
| `removeMCPServer(name: string)` | 移除 MCP Server |
| `toggleMCPServer(name: string)` | 切换 MCP Server 启用状态 |

## 类型定义

### ViewType

```typescript
export type ViewType = 'chat' | 'settings';
```

### AgentStatus

```typescript
export type AgentStatus = 'idle' | 'running' | 'error';
```

### ConnectionStatus

```typescript
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';
```

### AppMode

```typescript
export type AppMode = 'simple' | 'advanced';
```

### Theme

```typescript
export type Theme = 'light' | 'dark';
```

### Channel

```typescript
export interface Channel {
    id: string;
    name: string;
    icon: string;
    connected: boolean;
}
```

## 向后兼容

为保持向后兼容，部分组件可能仍在使用 Svelte 4 的 store 订阅语法：

```svelte
<script>
    import { theme } from '$lib/stores/theme';
    
    // Svelte 4 风格 - 订阅 store
    $: currentTheme = $theme;
</script>
```

**注意**：新代码应使用 Runes 语法，直接访问 store 属性：

```svelte
<script>
    import { themeStore } from '$lib/stores/theme';
    
    // Svelte 5 风格
    let theme = $derived(themeStore.theme);
</script>
```

## 最佳实践

1. **使用导出的单例** - 使用 `appStore`、`themeStore` 等单例访问全局状态
2. **派生状态用 `$derived`** - 计算属性使用 `$derived` 声明
3. **避免直接修改状态** - 通过暴露的方法修改状态
4. **保持 UI 响应式** - 在组件中使用 `$derived` 访问派生状态
5. **主题初始化** - 在应用启动时调用 `themeStore.initTheme()`
