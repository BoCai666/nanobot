/**
 * Message Types - 单元测试
 * 测试消息数据结构的类型和接口
 */

import { describe, it, expect } from 'vitest';
import type { Message, MessageRole, MessageStatus } from './message';

describe('MessageTypes', () => {
  describe('MessageStatus', () => {
    it('should have correct status values', () => {
      // 验证 MessageStatus 包含所有预期状态
      const statuses: MessageStatus[] = ['sending', 'sent', 'failed'];
      
      expect(statuses).toContain('sending');
      expect(statuses).toContain('sent');
      expect(statuses).toContain('failed');
      expect(statuses).toHaveLength(3);
    });

    it('should allow sending status', () => {
      const message: Message = {
        id: '1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
        status: 'sending',
      };
      expect(message.status).toBe('sending');
    });

    it('should allow sent status', () => {
      const message: Message = {
        id: '2',
        role: 'assistant',
        content: 'Hi there',
        timestamp: new Date(),
        status: 'sent',
      };
      expect(message.status).toBe('sent');
    });

    it('should allow failed status', () => {
      const message: Message = {
        id: '3',
        role: 'user',
        content: 'Test',
        timestamp: new Date(),
        status: 'failed',
      };
      expect(message.status).toBe('failed');
    });
  });

  describe('MessageRole', () => {
    it('should have correct role values', () => {
      // 验证 MessageRole 包含所有预期角色
      const roles: MessageRole[] = ['user', 'assistant', 'system'];
      
      expect(roles).toContain('user');
      expect(roles).toContain('assistant');
      expect(roles).toContain('system');
      expect(roles).toHaveLength(3);
    });

    it('should allow user role', () => {
      const message: Message = {
        id: '1',
        role: 'user',
        content: 'User message',
        timestamp: new Date(),
        status: 'sent',
      };
      expect(message.role).toBe('user');
    });

    it('should allow assistant role', () => {
      const message: Message = {
        id: '2',
        role: 'assistant',
        content: 'Assistant message',
        timestamp: new Date(),
        status: 'sent',
      };
      expect(message.role).toBe('assistant');
    });

    it('should allow system role', () => {
      const message: Message = {
        id: '3',
        role: 'system',
        content: 'System message',
        timestamp: new Date(),
        status: 'sent',
      };
      expect(message.role).toBe('system');
    });
  });

  describe('Message interface', () => {
    it('should require id field', () => {
      const message: Message = {
        id: 'msg-123',
        role: 'user',
        content: 'Test',
        timestamp: new Date(),
        status: 'sent',
      };
      expect(message.id).toBe('msg-123');
    });

    it('should require role field', () => {
      const message: Message = {
        id: 'msg-123',
        role: 'user',
        content: 'Test',
        timestamp: new Date(),
        status: 'sent',
      };
      expect(message.role).toBe('user');
    });

    it('should require content field', () => {
      const message: Message = {
        id: 'msg-123',
        role: 'assistant',
        content: 'Hello world',
        timestamp: new Date(),
        status: 'sent',
      };
      expect(message.content).toBe('Hello world');
    });

    it('should require timestamp field', () => {
      const timestamp = new Date('2026-03-29T10:00:00Z');
      const message: Message = {
        id: 'msg-123',
        role: 'user',
        content: 'Test',
        timestamp,
        status: 'sent',
      };
      expect(message.timestamp).toEqual(timestamp);
    });

    it('should accept Date timestamp', () => {
      const timestamp = new Date();
      const message: Message = {
        id: 'msg-1',
        role: 'user',
        content: 'Test',
        timestamp,
        status: 'sent',
      };
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    it('should accept string timestamp', () => {
      const timestamp = '2026-03-29T10:00:00Z';
      const message: Message = {
        id: 'msg-1',
        role: 'user',
        content: 'Test',
        timestamp,
        status: 'sent',
      };
      expect(typeof message.timestamp).toBe('string');
    });

    it('should require status field', () => {
      const message: Message = {
        id: 'msg-123',
        role: 'user',
        content: 'Test',
        timestamp: new Date(),
        status: 'sent',
      };
      expect(message.status).toBe('sent');
    });

    it('should support complete message structure', () => {
      const message: Message = {
        id: 'msg-complete',
        role: 'assistant',
        content: 'Complete message with all fields',
        timestamp: new Date('2026-03-29T10:00:00Z'),
        status: 'sent',
      };

      expect(message.id).toBe('msg-complete');
      expect(message.role).toBe('assistant');
      expect(message.content).toBe('Complete message with all fields');
      expect(message.timestamp).toBeInstanceOf(Date);
      expect(message.status).toBe('sent');
    });
  });

  describe('Status transitions', () => {
    it('should model sending to sent transition', () => {
      // 模拟消息状态变化：sending → sent
      const sendingMessage: Message = {
        id: 'msg-1',
        role: 'user',
        content: 'Sending...',
        timestamp: new Date(),
        status: 'sending',
      };

      const sentMessage: Message = {
        ...sendingMessage,
        status: 'sent',
      };

      expect(sendingMessage.status).toBe('sending');
      expect(sentMessage.status).toBe('sent');
    });

    it('should model sending to failed transition', () => {
      // 模拟消息状态变化：sending → failed
      const sendingMessage: Message = {
        id: 'msg-1',
        role: 'user',
        content: 'Sending...',
        timestamp: new Date(),
        status: 'sending',
      };

      const failedMessage: Message = {
        ...sendingMessage,
        status: 'failed',
      };

      expect(sendingMessage.status).toBe('sending');
      expect(failedMessage.status).toBe('failed');
    });

    it('should track message status changes', () => {
      // 模拟完整的状态变化流程
      const statusHistory: MessageStatus[] = [];
      
      // Initial state
      const message: Message = {
        id: 'msg-1',
        role: 'user',
        content: 'Test message',
        timestamp: new Date(),
        status: 'sending',
      };
      statusHistory.push(message.status);

      // Simulate sent
      message.status = 'sent';
      statusHistory.push(message.status);

      expect(statusHistory).toEqual(['sending', 'sent']);
    });
  });

  describe('User/Assistant message differentiation', () => {
    it('should distinguish user messages from assistant messages', () => {
      const userMessage: Message = {
        id: 'user-1',
        role: 'user',
        content: 'User input',
        timestamp: new Date(),
        status: 'sent',
      };

      const assistantMessage: Message = {
        id: 'assistant-1',
        role: 'assistant',
        content: 'Assistant response',
        timestamp: new Date(),
        status: 'sent',
      };

      expect(userMessage.role).not.toBe(assistantMessage.role);
      expect(userMessage.role).toBe('user');
      expect(assistantMessage.role).toBe('assistant');
    });

    it('should handle multiple user messages in sequence', () => {
      const userMessages: Message[] = [
        {
          id: 'user-1',
          role: 'user',
          content: 'First message',
          timestamp: new Date(),
          status: 'sent',
        },
        {
          id: 'user-2',
          role: 'user',
          content: 'Second message',
          timestamp: new Date(),
          status: 'sent',
        },
      ];

      expect(userMessages).toHaveLength(2);
      expect(userMessages.every((m) => m.role === 'user')).toBe(true);
    });

    it('should handle multiple assistant messages in sequence', () => {
      const assistantMessages: Message[] = [
        {
          id: 'assistant-1',
          role: 'assistant',
          content: 'First response',
          timestamp: new Date(),
          status: 'sent',
        },
        {
          id: 'assistant-2',
          role: 'assistant',
          content: 'Second response',
          timestamp: new Date(),
          status: 'sent',
        },
      ];

      expect(assistantMessages).toHaveLength(2);
      expect(assistantMessages.every((m) => m.role === 'assistant')).toBe(true);
    });
  });

  describe('Streaming response simulation', () => {
    it('should model streaming message creation', () => {
      // 流式响应开始时创建消息
      const streamingMessage: Message = {
        id: 'stream-1',
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        status: 'sending',
      };

      expect(streamingMessage.status).toBe('sending');
      expect(streamingMessage.content).toBe('');

      // 模拟内容逐渐累积
      streamingMessage.content = 'Hello';
      expect(streamingMessage.content).toBe('Hello');

      streamingMessage.content = 'Hello world';
      expect(streamingMessage.content).toBe('Hello world');

      // 流式响应完成
      streamingMessage.status = 'sent';
      expect(streamingMessage.status).toBe('sent');
    });

    it('should handle partial message updates', () => {
      const partialMessage: Message = {
        id: 'partial-1',
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        status: 'sending',
      };

      // 模拟流式更新
      const updates = ['He', 'Hel', 'Hell', 'Hello', 'Hello!'];
      
      updates.forEach((content) => {
        partialMessage.content = content;
        expect(partialMessage.content).toBe(content);
      });

      partialMessage.status = 'sent';
      expect(partialMessage.status).toBe('sent');
    });
  });
});
