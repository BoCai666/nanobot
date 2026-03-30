/**
 * Message Types - 消息数据结构
 * 定义聊天消息的核心类型接口
 */

/**
 * 消息状态枚举
 * - sending: 消息发送中
 * - sent: 消息已发送
 * - failed: 消息发送失败
 */
export type MessageStatus = 'sending' | 'sent' | 'failed';

/**
 * 消息角色枚举
 * - user: 用户消息
 * - assistant: AI 助手消息
 * - system: 系统消息
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * 消息接口
 * 核心数据结构，用于描述聊天消息
 */
export interface Message {
  /** 消息唯一标识符 */
  id: string;
  /** 消息角色 */
  role: MessageRole;
  /** 消息内容 */
  content: string;
  /** 消息时间戳 */
  timestamp: Date | string;
  /** 消息状态 */
  status: MessageStatus;
  /** 思考过程内容（可选） */
  thinking?: string;
}
