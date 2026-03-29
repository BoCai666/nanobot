# nanobot/skills — Modular Instruction Packages

**Generated:** 2026-03-28

## OVERVIEW

Skills 是模块化指令包，教 agent 专业工作流。内置 skills 在 `nanobot/skills/`，工作区 skills 在 `<workspace>/skills/`。`SkillsLoader` 在运行时合并两者。

## STRUCTURE

```
skill-name/
├── SKILL.md           # 必需：YAML frontmatter + markdown 指令
└── scripts/           # 可选：可执行助手脚本
    ├── script1.py
    └── script2.sh
```

**SKILL.md 格式：**
```markdown
---
name: skill-name
description: "单行触发描述"
metadata: {"nanobot":{"emoji":"...","requires":{"bins":["cmd"]}}}
---

# Skill Title

指令内容...
```

## BUNDLED SKILLS

| Skill | 用途 | 依赖 |
|-------|------|------|
| `github` | GitHub PRs, issues, CI | `gh` CLI |
| `weather` | 天气预报 (wttr.in/Open-Meteo) | `curl` |
| `summarize` | URL/文件/YouTube 摘要 | `summarize` CLI |
| `tmux` | 远程控制 tmux 会话 | `tmux` (仅 darwin/linux) |
| `cron` | 定时提醒 | 内置 cron 工具 |
| `memory` | 两层记忆系统 | 始终加载 |
| `clawhub` | 搜索/安装 skills | Node.js (`npx`) |
| `skill-creator` | 创建新 skills | - |

## SKILL LOADING

`SkillsLoader` (`nanobot/agent/skills.py`) 从两处发现 skills：

1. **Workspace skills** — `<workspace>/skills/<name>/SKILL.md` (用户安装，最高优先)
2. **Built-in skills** — `<nanobot>/skills/<name>/SKILL.md` (内置，回退)

Workspace skills 覆盖同名内置 skills。

**渐进式加载**：metadata (触发匹配) → body (触发时) → scripts (直接执行)

## ADDING NEW SKILLS

**Workspace (用户):** 放置于 `<workspace>/skills/<name>/SKILL.md`

**Bundled (开发者):**
1. 创建目录 `nanobot/skills/<skill-name>/`
2. 包含 `SKILL.md`（YAML frontmatter 必须有 name + description）
3. 添加可选 `scripts/` 存放可执行脚本
4. 在 `metadata.nanobot.requires.bins` 记录二进制依赖

## ANTI-PATTERNS

- ❌ 创建 README.md 或额外文档 — 只允许 SKILL.md + scripts/references/assets
- ❌ 在 SKILL.md body 放大型参考文档 — 用 `references/` 子目录
- ❌ 假设所有 skills 可用 — 检查 `metadata.nanobot.requires`
- ❌ 不用 YAML frontmatter 创建 skill — name 和 description 是触发匹配必需
- ❌ 在错误 OS 使用平台特定 skill — `tmux` 需要 darwin/linux
