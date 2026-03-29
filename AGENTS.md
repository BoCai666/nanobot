# nanobot 项目知识库

**Generated:** 2026-03-28
**Commit:** 5bf0f6f
**Branch:** main

## OVERVIEW

nanobot 是一个**超轻量级个人 AI 助手框架**，使用 Python 3.11+ 构建。核心特点：99% 代码量少于 OpenClaw，支持 12+ 聊天平台，原生 OpenAI/Anthropic SDK（无 litellm 依赖）。项目采用扁平布局（主包在根目录而非 `src/`），包含跨语言组件（TypeScript WhatsApp bridge、Tauri 桌面应用）。

## STRUCTURE

```
nanobot/
├── nanobot/           # 主 Python 包
│   ├── agent/         # 🧠 核心 Agent (loop, context, memory, tools, hook)
│   ├── channels/      # 📱 12+ 聊天平台 (telegram, discord, feishu, slack...)
│   ├── providers/     # 🤖 20+ LLM 提供商 (openai, anthropic, openrouter...)
│   ├── skills/        # 🎯 内置技能 (github, weather, tmux...)
│   ├── cli/           # 🖥️ Typer CLI (onboard, agent, gateway, status)
│   ├── config/        # ⚙️ Pydantic 配置 schema
│   ├── bus/           # 🚌 异步消息队列
│   ├── cron/          # ⏰ 定时任务服务
│   ├── api/           # 🌐 FastAPI sidecar 服务器
│   ├── security/      # 🔒 SSRF 保护、命令过滤
│   ├── session/       # 💬 会话管理
│   ├── templates/     # 📄 工作区模板 (AGENTS.md, USER.md...)
│   └── utils/         # 🛠️ 共享工具函数
├── bridge/            # 📦 TypeScript WhatsApp Web 桥接 (Node.js)
├── desktop/           # 🖥️ Tauri + Svelte 桌面应用 (独立子项目)
├── tests/             # 🧪 pytest 测试套件 (镜像 nanobot/ 结构)
└── docs/              # 📚 文档
```

## WHERE TO LOOK

| 任务 | 位置 | 说明 |
|------|------|------|
| **CLI 入口** | `nanobot/cli/commands.py` | Typer 应用：onboard, agent, gateway, status |
| **Agent 核心** | `nanobot/agent/loop.py` | AgentLoop：消息处理、工具执行、流式响应 |
| **添加工具** | `nanobot/agent/tools/` | 继承 `Tool` ABC，注册到 `ToolRegistry` |
| **添加频道** | `nanobot/channels/` | 继承 `BaseChannel`，实现 start/stop/send |
| **添加 Provider** | `nanobot/providers/registry.py` | 添加 `ProviderSpec` + `config/schema.py` 字段 |
| **添加 Skill** | `nanobot/skills/` | 创建目录 + `SKILL.md` + `scripts/` |
| **共享工具** | `nanobot/utils/helpers.py` | token 估算、模板同步、消息分片等 |
| **消息总线** | `nanobot/bus/` | `MessageBus` 异步队列、消息 DTO |
| **测试** | `tests/` | pytest + pytest-asyncio，镜像源码结构 |

## CODE MAP

| Symbol | Type | Location | Lines | Role |
|--------|------|----------|-------|------|
| `AgentLoop` | class | `nanobot/agent/loop.py` | 584 | 核心 Agent 处理循环 |
| `app` | Typer | `nanobot/cli/commands.py` | 1233 | CLI 入口点 |
| `ChannelManager` | class | `nanobot/channels/manager.py` | - | 频道生命周期管理 |
| `BaseChannel` | ABC | `nanobot/channels/base.py` | - | 频道基类 |
| `ProviderSpec` | dataclass | `nanobot/providers/registry.py` | 354 | Provider 注册条目 |
| `LLMProvider` | ABC | `nanobot/providers/base.py` | 368 | LLM 提供商基类 |
| `Tool` | ABC | `nanobot/agent/tools/base.py` | - | 工具基类 |
| `ToolRegistry` | class | `nanobot/agent/tools/registry.py` | - | 动态工具注册 |
| `MemoryStore` | class | `nanobot/agent/memory.py` | 366 | 两层记忆系统 |
| `MessageBus` | class | `nanobot/bus/queue.py` | - | 异步消息队列 |
| `Config` | Pydantic | `nanobot/config/schema.py` | - | 配置模型 |

## CONVENTIONS

### Python 风格
- **行宽**: 100 字符 (ruff)
- **Linter**: `ruff` rules `E, F, I, N, W` (ignore E501)
- **格式化**: `ruff format nanobot/`
- **异步**: 全面使用 asyncio
- **类型**: 积极使用类型注解
- **日志**: 统一使用 `loguru`

### 命名约定
| 类型 | 约定 | 示例 |
|------|------|------|
| 类名 | PascalCase | `AgentLoop`, `LLMProvider` |
| 函数 | snake_case | `chat_with_retry`, `_sanitize_empty_content` |
| 私有方法 | `_` 前缀 | `_is_transient_error` |
| 常量 | UPPER_SNAKE_CASE | `_CHAT_RETRY_DELAYS` |
| 配置字段 | snake_case (Py) / camelCase (JSON) | `send_progress`, `apiBase` |

### 分支策略
- `main` — 稳定发布 (bug修复、文档)
- `nightly` — 实验功能 (新功能、重构)

### 测试约定
- 测试文件：`test_<模块>.py`
- 测试函数：`test_<功能>_<场景>`
- 异步测试：`@pytest.mark.asyncio` + `asyncio_mode = "auto"`
- Fixture：在测试文件中用 `@pytest.fixture` 定义
- Mock：`unittest.mock` + `@patch` 装饰器

## ANTI-PATTERNS (THIS PROJECT)

### 安全 (FORBIDDEN)
- ❌ API key 提交到版本控制
- ❌ 以 root 用户运行 nanobot
- ❌ 空的 `allowFrom` 配置 (v0.1.4.post4+ 默认拒绝所有)
- ❌ 生产环境不设置 `restrictToWorkspace: true`
- ❌ 访问私有 IP (SSRF 保护：阻止 10.x, 127.x, 192.168.x 等)

### 阻塞的 Shell 命令 (`nanobot/agent/tools/shell.py`)
```bash
rm -rf, rm -r, del /f, rmdir /s, format, mkfs, diskpart, dd if=, shutdown, reboot, :(){ :|:& };:
```

### Agent 行为
- ❌ 在工具内调用 `exec` — 使用 `spawn` 替代
- ❌ 直接写 MEMORY.md 创建提醒 — 用 `cron` 工具
- ❌ 用 `exec` 调用 `nanobot cron` — 用内置 cron 工具
- ❌ 用 cron 创建周期任务 — 用 HEARTBEAT.md
- ❌ 空的 assistant 消息 — 会污染会话上下文

### Channel 开发
- ❌ `send()` 静默失败 — 必须抛异常触发重试
- ❌ 外部插件同名遮蔽内置 — 会被忽略
- ❌ `start()` 中阻塞 — 必须异步非阻塞

### Skill 创建
- ❌ 创建 README.md — 只允许 SKILL.md + scripts/references/assets
- ❌ 在 SKILL.md body 中放大型参考 — 用 `references/` 目录
- ❌ 不检查 `metadata.nanobot.requires` — 可能依赖缺失

### 代码风格
- ❌ 隐藏复杂度或制造不必要的抽象
- ❌ 大范围重写 — 优先小范围 patch

## UNIQUE STYLES

### Provider 注册系统
添加新 Provider 只需 2 步：
1. `nanobot/providers/registry.py` 添加 `ProviderSpec`
2. `nanobot/config/schema.py` 添加字段到 `ProvidersConfig`

自动获得：环境变量、模型路由、配置匹配、`nanobot status` 显示。

### Channel 插件系统
频道通过 `BaseChannel` 继承 + `ChannelManager` 动态加载：
- `start()` 阻塞式启动
- `send_delta()` 流式响应 (可选)
- `send()` 发送消息，失败时抛异常触发重试

### 工具抽象
`Tool` ABC 统一接口：`name`, `description`, `parameters`, `execute()`。`ToolRegistry` 提供 JSON Schema 参数校验。

### 模板同步
`sync_workspace_templates()` 自动同步 `nanobot/templates/` 到工作区。

### 跨语言组件
- **bridge/**: TypeScript WhatsApp 桥接，通过 `hatch force-include` 嵌入 Python 包
- **desktop/**: Tauri + Svelte 桌面应用，独立构建流程

## COMMANDS

```bash
# 开发
uv sync --all-extras          # 安装所有依赖
uv run pytest tests/          # 运行测试
uv run pytest -v tests/agent/ # 详细输出
uv run ruff check .           # Lint 检查
uv run ruff format nanobot/   # 格式化

# 运行
nanobot onboard               # 初始化配置
nanobot onboard --wizard      # 交互式向导
nanobot agent                 # 交互式对话
nanobot gateway               # 启动网关服务
nanobot status                # 查看状态
nanobot channels login whatsapp  # WhatsApp 认证

# Docker
docker compose up -d nanobot-gateway
docker compose run --rm nanobot-cli agent -m "Hello!"

# 打包
pip install -e .              # 本地安装
pip install build && python -m build  # 构建 wheel/sdist
```

## NOTES

- **WhatsApp bridge**: 独立 Node.js 进程，由 `nanobot channels login whatsapp` 自动构建。升级后需 `rm -rf ~/.nanobot/bridge` 重建。
- **多实例**: 用 `--config` 和 `--workspace` 参数支持多个独立实例
- **测试镜像**: `tests/` 目录结构与 `nanobot/` 一一对应
- **Bridge 构建**: `hatch build` 通过 `force-include` 将 `bridge/` 嵌入 Python 包
- **大型文件**: channels/ 占比最大（12 个平台集成，~8300 行），cli/commands.py 是第二大文件（1233 行）
- **配置格式**: JSON 配置使用 camelCase，Python 代码使用 snake_case，Pydantic 自动转换
