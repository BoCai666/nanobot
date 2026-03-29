# nanobot 桌面应用

nanobot 桌面应用基于 Tauri v2 构建，提供原生的跨平台桌面体验。

## 安装

### 系统要求

**Windows**
- Windows 10 (64-bit) 或更高版本
- 至少 4GB 内存
- 至少 200MB 可用磁盘空间
- WebView2 运行时（Windows 11 已内置）

### 下载和安装

从 GitHub Releases 页面下载最新版本的安装包：

```bash
# 或使用 winget 安装
winget install nanobot-ai
```

安装完成后，在开始菜单中找到 "nanobot" 并启动。

### 首次启动

首次启动时，桌面应用会引导你完成初始化配置：

1. 选择语言和主题
2. 配置 LLM Provider（如果已有 `~/.nanobot/config.json`，会自动导入）
3. 连接聊天平台（如 Telegram、Discord 等）

## 配置

桌面应用的配置文件位于 `~/.nanobot/config.json`，可以在桌面应用的设置面板中修改。

### Provider 设置

在设置面板中选择 "Provider" 标签页：

| Provider | 说明 | 获取方式 |
|----------|------|----------|
| OpenRouter | 推荐，支持多种模型 | [openrouter.ai/keys](https://openrouter.ai/keys) |
| Anthropic | Claude 系列模型 | [console.anthropic.com](https://console.anthropic.com) |
| OpenAI | GPT 系列模型 | [platform.openai.com](https://platform.openai.com) |
| DeepSeek | DeepSeek 系列模型 | [platform.deepseek.com](https://platform.deepseek.com) |

添加 Provider 时需要提供：
- API Key
- 模型名称（可选，留空则使用默认模型）

### Channel 设置

在设置面板中选择 "Channels" 标签页，可以管理已连接的聊天平台：

| 平台 | 配置项 |
|------|--------|
| Telegram | Bot Token |
| Discord | Bot Token |
| WhatsApp | QR 码登录 |
| Feishu | App ID + App Secret |
| Slack | Bot Token + App Token |
| QQ | App ID + App Secret |

点击 "添加 Channel" 按钮，按提示完成配置。

### Agent 设置

在设置面板中选择 "Agent" 标签页：

- **默认模型**：选择使用的 AI 模型
- **Temperature**：生成文本的随机性（0-1）
- **System Prompt**：自定义系统提示词
- **Timezone**：设置时区

## 使用

### 主界面介绍

```
┌─────────────────────────────────────────────┐
│ [≡] nanobot                    [_] [□] [X]  │  ← 标题栏
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │         聊天消息区域                │   │
│  │                                     │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 输入消息...                     [📤] │   │  ← 输入框
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│ [💬 聊天] [⚙️ 设置] [📊 状态] [📁 文件]   │  ← 底部导航
└─────────────────────────────────────────────┘
```

**标题栏**：包含菜单按钮和窗口控制按钮

**聊天区域**：显示与 nanobot 的对话历史

**输入框**：输入消息并发送

**底部导航**：
- 聊天：主聊天界面
- 设置：应用配置
- 状态：系统状态和日志
- 文件：工作区文件管理

### 聊天功能

**发送消息**
- 在输入框中输入文字，按 Enter 或点击发送按钮
- 支持多行输入（Shift + Enter）

**Markdown 支持**
- 代码块：使用 ``` 包裹
- 链接：[文字](URL)
- 粗体：**文字**
- 斜体：*文字*

**工具调用**
- nanobot 可以调用各种工具完成任务
- 工具调用会在聊天区域显示为特殊卡片

### 设置面板

**常规设置**
- 主题：浅色/深色/跟随系统
- 语言：选择界面语言
- 启动：开机自启、最小化到托盘

**通知设置**
- 消息通知：开启/关闭
- 声音提醒：开启/关闭
- 仅 @提及时通知（群聊）

**连接设置**
- 查看所有已连接的 Channel
- 添加/移除 Channel
- 测试 Channel 连接状态

### 系统托盘

关闭主窗口时，应用会最小化到系统托盘：

**托盘图标菜单**：
- 打开主界面
- 快速发送消息
- 查看状态
- 退出应用

**托盘通知**：
- 新消息提醒
- 系统状态变化

## 故障排除

### 常见问题和解决方案

**问题：应用无法启动**

解决方案：
1. 检查是否已安装 WebView2 运行时
2. 删除 `~/.nanobot` 目录后重新初始化：`nanobot onboard`
3. 查看日志文件获取详细信息

**问题：无法连接 LLM Provider**

解决方案：
1. 检查 API Key 是否正确
2. 确认网络可以访问 Provider 的 API 地址
3. 查看日志中的具体错误信息
4. 尝试更换 Provider 或模型

**问题：Channel 连接失败**

解决方案：
1. Telegram：检查 Bot Token 是否正确
2. Discord：确认已开启 Message Content Intent
3. WhatsApp：重新扫码登录
4. Feishu：确认 App 已发布

**问题：消息发送失败**

解决方案：
1. 检查网络连接
2. 重启应用
3. 确认 Channel 配置中的 `allowFrom` 设置正确

### 日志位置

桌面应用日志文件位于：

```
Windows: %APPDATA%\nanobot\logs\
```

日志文件：
- `nanobot.log` - 主日志
- `gateway.log` - Gateway 日志
- `channel-{name}.log` - 各 Channel 日志

### 重置配置

如果需要重置所有配置：

1. 关闭应用
2. 删除 `~/.nanobot` 目录
3. 重新启动应用，按向导完成初始化

```bash
# Windows 命令行
rmdir /s /q %USERPROFILE%\.nanobot

# PowerShell
Remove-Item -Recurse -Force ~/.nanobot
```

### 获取帮助

- GitHub Issues：[github.com/HKUDS/nanobot/issues](https://github.com/HKUDS/nanobot/issues)
- Discord 社区：[discord.gg/MnCvHqpUGB](https://discord.gg/MnCvHqpUGB)
- 飞书群：参见 [COMMUNICATION.md](./COMMUNICATION.md)
