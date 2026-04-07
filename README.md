# nanobot Desktop

桌面 AI 助手，基于 Tauri + SvelteKit 构建，将 nanobot 核心封装为独立可执行文件，无需 Python/Node.js 环境即可运行。

## 功能特性

- **开箱即用** — 一键安装，自动配置，无需手动搭建 Python/Node.js 环境
- **流式响应** — 实时渲染 Markdown，支持代码高亮（Shiki）
- **25+ LLM 提供者** — OpenRouter、OpenAI、Anthropic、DeepSeek、Gemini、Ollama 本地模型等
- **对话历史** — 侧边栏展示会话记录，上下文自动持久化
- **MCP 工具支持** — 可配置 MCP 服务器，扩展 AI 能力
- **配置面板** — 提供者、Agent、工具等设置均有图形界面

## 快速开始

### 环境要求

- Windows 10/11
- Node.js 20+
- Python 3.11+（仅构建时需要）

### 安装依赖

```bash
cd desktop
pnpm install
```

### 构建 Sidecar（Python → exe）

```bash
# Release 版本
pnpm build:sidecar

# Debug 版本
pnpm build:sidecar:debug
```

### 运行

```bash
# 开发模式（前端热重载 + Sidecar 自动重启）
pnpm tauri:dev

# 构建生产安装包
pnpm tauri:build
```

## 配置

配置文件位于 `~/.nanobot/config.json`。应用启动后会自动读取。

### 基本配置示例

```json
{
  "providers": {
    "openrouter": {
      "apiKey": "sk-or-v1-..."
    }
  },
  "agents": {
    "defaults": {
      "model": "anthropic/claude-opus-4-5",
      "provider": "openrouter"
    }
  }
}
```

### 使用本地 Ollama

```json
{
  "providers": {
    "ollama": {
      "apiBase": "http://localhost:11434/v1"
    }
  },
  "agents": {
    "defaults": {
      "model": "llama3",
      "provider": "ollama"
    }
  }
}
```

### MCP 工具配置

```json
{
  "tools": {
    "mcpServers": {
      "filesystem": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"]
      }
    }
  }
}
```

详细配置说明请参考 [nanobot 上游文档](https://github.com/HKUDS/nanobot)。

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Tauri 2.0 (Rust) |
| 前端框架 | SvelteKit 5 |
| AI 运行时 | Python sidecar (PyInstaller) |
| 会话管理 | nanobot core |
| LLM 路由 | Provider Registry 模式 |
| 代码高亮 | Shiki |

## 许可证

MIT
