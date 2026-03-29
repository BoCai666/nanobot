# nanobot/templates — Workspace Templates

**Generated:** 2026-03-28

## OVERVIEW

工作区模板文件，由 `sync_workspace_templates()` 自动同步到用户工作区。包含 agent 运行时所需的默认配置文件。

## FILES

| 文件 | 用途 |
|------|------|
| `AGENTS.md` | Agent 行为指令模板 |
| `USER.md` | 用户偏好配置模板 |
| `TOOLS.md` | 可用工具文档模板 |
| `HEARTBEAT.md` | 周期任务定义模板 |

## SYNC MECHANISM

`nanobot/utils/helpers.py::sync_workspace_templates()` — 自动将模板同步到 `<workspace>/` 目录。

## ANTI-PATTERNS

- ❌ 不要手动修改 `nanobot/templates/` 中的文件以定制单个工作区 — 修改 `<workspace>/` 中的副本
