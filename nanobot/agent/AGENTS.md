# nanobot/agent — Core Agent Logic

**Generated:** 2026-03-28

## OVERVIEW

核心 Agent 处理引擎：消息处理、LLM 循环、工具执行、记忆整合、技能加载。编排从入站消息到出站响应的完整生命周期。

## STRUCTURE

| 文件 | 行数 | 作用 |
|------|------|------|
| `loop.py` | 584 | `AgentLoop` — 主异步循环、消息分发、流式响应、会话锁 |
| `context.py` | - | `ContextBuilder` — 构建 system prompt、合并运行时上下文、处理 multimodal |
| `memory.py` | 366 | `MemoryStore` + `MemoryConsolidator` — 两层记忆 (MEMORY.md + HISTORY.md)、token 截断 |
| `skills.py` | - | `SkillsLoader` — 加载 workspace/builtin skills、渐进式披露 |
| `runner.py` | - | `AgentRunner` — LLM tool-call 迭代、重试、hook 回调 |
| `hook.py` | - | `AgentHook` + `AgentHookContext` — 流式、进度、工具调用生命周期钩子 |
| `subagent.py` | - | 后台任务分发，用于系统消息 |
| `tools/` | - | 内置工具实现 |

## WHERE TO LOOK

| 任务 | 位置 |
|------|------|
| 添加内置工具 | `tools/{name}.py` — 继承 `Tool`，注册到 `registry.py` |
| 修改 prompt 结构 | `context.py` — `build_system_prompt()`, `build_messages()` |
| 记忆整合逻辑 | `memory.py` — `MemoryConsolidator.maybe_consolidate_by_tokens()` |
| 工具执行流程 | `runner.py` — `AgentRunner.run()` |
| 流式/进度钩子 | `hook.py` — `AgentHook` 接口 |

## TOOLS SUBDIRECTORY

```
tools/
├── base.py        Tool ABC (name, description, parameters, execute, schema)
├── registry.py    ToolRegistry — 工具发现和注册
├── web.py         web_search, web_fetch (361行)
├── shell.py       exec (shell 命令，含禁用命令列表)
├── filesystem.py  read_file, write_file, edit_file, list_dir (410行)
├── cron.py        cron_schedule, cron_at, cron_list, cron_cancel
├── mcp.py         MCP 工具桥接 (外部 MCP 服务器)
├── spawn.py       spawn (后台子进程)
├── message.py     message (发送到聊天频道)
└── __init__.py    导出 Tool, ToolRegistry
```

## CONVENTIONS

- 所有工具继承 `Tool` (base.py)，实现 `name`, `description`, `parameters`, `execute`
- `cast_params()` 处理 JSON Schema 类型强制转换
- `validate_params()` 返回错误字符串列表（空 = 有效）
- 工具通过 `ToolRegistry` 注册；名称成为 LLM function-call 名称
- 工作区限制：`restrictToWorkspace: true` 将所有文件/shell 工具沙箱化

## ANTI-PATTERNS

- ❌ 在工具内调用 `exec` 或 shell 工具 — 使用 `spawn` 替代
- ❌ 直接写 MEMORY.md — 在整合期间使用 `save_memory` 工具调用
- ❌ 空的 assistant 消息 — 会污染会话上下文，`_save_turn()` 跳过它们
- ❌ 工具结果超过 `_TOOL_RESULT_MAX_CHARS` (32k) — 会在持久化前被截断
- ❌ 通过 `exec` 创建 cron 任务 — 使用内置 `cron` 工具
- ❌ 用 cron 创建周期任务 — 使用 HEARTBEAT.md
