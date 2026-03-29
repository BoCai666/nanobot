# nanobot/providers — LLM Provider Abstraction

**Generated:** 2026-03-28

## OVERVIEW

LLM 提供商抽象层。`ProviderSpec` 注册表是 20+ 提供商的单一真相来源 — 环境变量、配置匹配、模型路由均从此派生。原生 OpenAI/Anthropic SDK（无 litellm 依赖）。

## WHERE TO LOOK

| 文件 | 行数 | 作用 |
|------|------|------|
| `registry.py` | 354 | `ProviderSpec` dataclass + `PROVIDERS` tuple（顺序=优先级） |
| `base.py` | 368 | `LLMProvider` ABC, `LLMResponse`, `GenerationSettings` |
| `openai_compat_provider.py` | 572 | OpenAI-compatible 后端（大多数提供商） |
| `anthropic_provider.py` | 441 | 原生 Anthropic SDK（支持 prompt caching） |
| `azure_openai_provider.py` | 308 | Azure OpenAI 后端 |
| `openai_codex_provider.py` | 320 | OAuth-based Codex provider |
| `config/schema.py` | - | `ProvidersConfig` — 在此添加新提供商字段 |

## 2-STEP REGISTRATION

添加新提供商只需修改 2 个文件：

**Step 1.** 在 `registry.py` 的 `PROVIDERS` 添加 `ProviderSpec`：
```python
ProviderSpec(
    name="myprovider",                   # snake_case 配置字段
    keywords=("myprovider", "mymodel"), # 模型名关键词用于自动检测
    env_key="MYPROVIDER_API_KEY",       # 环境变量名
    display_name="My Provider",
    backend="openai_compat",             # 或 "anthropic", "azure_openai"
    default_api_base="https://api.example.com/v1",
)
```

**Step 2.** 在 `config/schema.py` 的 `ProvidersConfig` 添加字段：
```python
myprovider: ProviderConfig = Field(default_factory=ProviderConfig)
```

完成。环境变量、配置匹配、模型路由、`nanobot status` 显示自动生效。

## PROVIDERSPEC FIELDS

| 字段 | 用途 |
|------|------|
| `name` | 配置字段名 (snake_case) |
| `keywords` | 模型名关键词用于自动检测 |
| `env_key` | API key 环境变量名 |
| `backend` | 实现: `openai_compat`, `anthropic`, `azure_openai` |
| `default_api_base` | 默认 OpenAI-compatible base URL |
| `is_gateway` | 可路由任意模型 (OpenRouter) |
| `is_local` | 本地部署 (Ollama, vLLM) |
| `is_direct` | 无需 API key (OVMS) |
| `is_oauth` | OAuth-based (Codex, GitHub Copilot) |
| `detect_by_key_prefix` | 按 api_key 前缀检测 (如 `"sk-or-"`) |
| `detect_by_base_keyword` | 按 api_base 子串检测 (如 `"11434"`) |
| `strip_model_prefix` | 发送前去除 `"provider/"` 前缀 |
| `env_extras` | 额外环境变量 |
| `model_overrides` | 按模型覆盖参数 |
| `supports_prompt_caching` | 支持 Anthropic 风格 prompt caching |

## AUTO-DETECTION PRIORITY

检测遵循 `PROVIDERS` 顺序：

1. **显式前缀** — `provider/model` 格式匹配 `spec.name`
2. **关键词匹配** — 模型名包含 `spec.keywords` 中的词
3. **本地回退** — `is_local=True` + `detect_by_base_keyword` 匹配 api_base
4. **Gateway 回退** — `is_gateway=True` + 已配置 api_key
5. **已配置提供商** — 第一个有 api_key 的提供商

## BACKEND TYPES

| Backend | 使用场景 |
|---------|----------|
| `openai_compat` | 大多数提供商 — OpenAI-compatible REST API |
| `anthropic` | 原生 Anthropic SDK，支持 prompt caching |
| `azure_openai` | Azure OpenAI，API version 2024-10-21 |

## ANTI-PATTERNS

- ❌ **Moonshot K2.5 temperature** — Kimi K2.5 强制 `temperature >= 1.0`，需用 `model_overrides`
- ❌ **Zhipu 双环境变量** — 配置用 `ZAI_API_KEY`，SDK 期望 `ZHIPUAI_API_KEY`，需 `env_extras`
- ❌ **Gateway 前缀混淆** — 某些 gateway 不理解 `provider/model`，需 `strip_model_prefix=True`
- ❌ **OAuth 提供商自动检测** — Codex/GitHub Copilot 不参与自动检测，用户必须显式选择
