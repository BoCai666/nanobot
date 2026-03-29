# nanobot/channels — Chat Platform Integrations

**Generated:** 2026-03-28

## OVERVIEW

基于插件的聊天平台集成（Telegram, Discord, Feishu, Slack, WhatsApp 等 12+ 平台），共享统一的消息总线接口。channels/ 是项目最大的模块（~8300 行，12 个平台集成）。

## WHERE TO LOOK

| 文件 | 行数 | 作用 |
|------|------|------|
| `base.py` | - | `BaseChannel` 抽象基类 |
| `manager.py` | - | `ChannelManager` — 生命周期管理、消息分发、重试 |
| `registry.py` | - | 插件发现 (pkgutil + entry_points) |
| `feishu.py` | 1250 | 飞书/Lark WebSocket 集成 |
| `telegram.py` | 945 | Telegram bot，流式/媒体支持 |
| `weixin.py` | 1033 | 微信 HTTP long-poll 集成 |
| `mochat.py` | 947 | MoChat (Claw IM) Socket.IO |
| `matrix.py` | 739 | Matrix/Element E2EE 协议 |
| `qq.py` | 639 | QQ bot (botpy SDK) |
| `dingtalk.py` | 580 | 钉钉 Stream Mode |
| `email.py` | 508 | Email IMAP/SMTP |
| `discord.py` | 395 | Discord bot，线程支持 |
| `slack.py` | 344 | Slack Socket Mode |
| `wecom.py` | 371 | 企业微信 WebSocket |
| `whatsapp.py` | 301 | WhatsApp (Node.js bridge) |

## CONVENTIONS

### Channel 插件模式

```python
class MyChannel(BaseChannel):
    name = "mychannel"
    display_name = "My Channel"

    async def start(self) -> None:
        """连接平台，开始监听。就绪时设置 self._running = True"""

    async def stop(self) -> None:
        """优雅断开。设置 self._running = False"""

    async def send(self, msg: OutboundMessage) -> None:
        """发送文本/媒体。失败时抛异常 — ChannelManager 自动重试"""

    async def send_delta(self, chat_id: str, delta: str, metadata: dict) -> None:
        """流式：递增文本块。可选 — 基类为 no-op"""
```

### 必需方法

| 方法 | 必需 | 用途 |
|------|------|------|
| `start()` | ✅ | 开始监听 (长连接) |
| `stop()` | ✅ | 优雅关闭 |
| `send()` | ✅ | 投递 `OutboundMessage` |
| `send_delta()` | ❌ | 流式文本块 |
| `is_allowed()` | ❌ | 自定义 ACL (默认检查 `allow_from`) |

### 插件发现

- **内置频道**: `pkgutil.iter_modules` 扫描 `nanobot/channels/`
- **外部插件**: `entry_points(group="nanobot.channels")`
- 内置优先 — 外部插件无法遮蔽

### 重试策略

`ChannelManager._send_with_retry()` — 最大重试次数由 `channels.sendMaxRetries` 控制 (默认 3，范围 0-10)。失败抛异常触发重试。

## ANTI-PATTERNS

- ❌ `send()` 静默失败 — 必须抛异常以触发重试策略
- ❌ 外部插件同名遮蔽内置 — 会被忽略
- ❌ `start()` 中阻塞 — 必须异步非阻塞
- ❌ 生产环境空 `allow_from` — 默认拒绝所有，设置 `["*"]` 或具体 ID

## SUPPORTED CHANNELS

Telegram, Discord, Feishu, Slack, DingTalk, WhatsApp, WeChat (Weixin), QQ, Matrix, Email, Wecom, Mochat (12 平台)
