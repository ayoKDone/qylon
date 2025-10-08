import axios, { AxiosInstance } from 'axios';
import {
  CommunicationMessage,
  IntegrationConfig,
  IntegrationType,
} from '../types';
import { logIntegrationEvent } from '../utils/logger';

interface SlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
  attachments?: any[];
  thread_ts?: string;
  reply_broadcast?: boolean;
}

interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  is_private: boolean;
  is_member: boolean;
}

interface SlackUser {
  id: string;
  name: string;
  real_name: string;
  profile: {
    email: string;
    phone: string;
    image_24: string;
    image_32: string;
    image_48: string;
    image_72: string;
    image_192: string;
    image_512: string;
  };
}

interface SlackResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  warning?: string;
}

export class SlackService {
  private apiClient: AxiosInstance;
  private botToken: string | null = null;
  private config: IntegrationConfig;
  private authenticated: boolean = false;

  constructor(config: IntegrationConfig) {
    this.config = config;
    this.apiClient = axios.create({
      baseURL: 'https://slack.com/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  async authenticate(credentials: Record<string, any>): Promise<boolean> {
    try {
      const { botToken } = credentials;

      if (!botToken) {
        throw new Error('Missing required Slack bot token');
      }

      this.botToken = botToken;
      this.apiClient.defaults.headers.common['Authorization'] =
        `Bearer ${this.botToken}`;

      // Test the connection by fetching bot info
      const response = await this.apiClient.get('/auth.test');

      if (!response.data.ok) {
        throw new Error(`Slack authentication failed: ${response.data.error}`);
      }

      this.authenticated = true;

      await this.logOperation('authentication_success', {
        botUserId: response.data.user_id,
        teamId: response.data.team_id,
      });

      return true;
    } catch (error) {
      await this.logOperation('authentication_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async sendMessage(
    channel: string,
    text: string,
    options: {
      threadTs?: string;
      blocks?: any[];
      attachments?: any[];
      replyBroadcast?: boolean;
    } = {},
  ): Promise<CommunicationMessage> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Slack');
      }

      const message: SlackMessage = {
        channel,
        text,
        ...options,
      };

      const response = await this.apiClient.post<
        SlackResponse<{ ts: string; channel: string; message: any }>
      >('/chat.postMessage', message);

      if (!response.data.ok) {
        throw new Error(`Failed to send message: ${response.data.error}`);
      }

      const sentMessage: CommunicationMessage = {
        id: response.data.data!.ts,
        channel: response.data.data!.channel,
        platform: 'slack',
        content: text,
        sender: 'bot',
        recipient: channel,
        timestamp: new Date().toISOString(),
        metadata: {
          threadTs: options.threadTs,
          blocks: options.blocks,
          attachments: options.attachments,
        },
      };

      await this.logOperation('message_sent', {
        channel,
        messageId: sentMessage.id,
        hasThread: !!options.threadTs,
      });

      return sentMessage;
    } catch (error) {
      await this.logOperation('message_send_failed', {
        channel,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async sendDirectMessage(
    userId: string,
    text: string,
    options: any = {},
  ): Promise<CommunicationMessage> {
    try {
      // Open a direct message channel with the user
      const dmResponse = await this.apiClient.post('/conversations.open', {
        users: userId,
      });

      if (!dmResponse.data.ok) {
        throw new Error(`Failed to open DM channel: ${dmResponse.data.error}`);
      }

      const channelId = dmResponse.data.channel.id;
      return await this.sendMessage(channelId, text, options);
    } catch (error) {
      await this.logOperation('dm_send_failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getChannels(): Promise<SlackChannel[]> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Slack');
      }

      const response = await this.apiClient.get<
        SlackResponse<{ channels: SlackChannel[] }>
      >('/conversations.list', {
        params: {
          types: 'public_channel,private_channel',
          exclude_archived: true,
          limit: 1000,
        },
      });

      if (!response.data.ok) {
        throw new Error(`Failed to fetch channels: ${response.data.error}`);
      }

      return response.data.data!.channels;
    } catch (error) {
      await this.logOperation('channels_fetch_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getUsers(): Promise<SlackUser[]> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Slack');
      }

      const response = await this.apiClient.get<
        SlackResponse<{ members: SlackUser[] }>
      >('/users.list', {
        params: {
          limit: 1000,
        },
      });

      if (!response.data.ok) {
        throw new Error(`Failed to fetch users: ${response.data.error}`);
      }

      return response.data.data!.members;
    } catch (error) {
      await this.logOperation('users_fetch_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async joinChannel(channelId: string): Promise<boolean> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Slack');
      }

      const response = await this.apiClient.post('/conversations.join', {
        channel: channelId,
      });

      if (!response.data.ok) {
        throw new Error(`Failed to join channel: ${response.data.error}`);
      }

      await this.logOperation('channel_joined', {
        channelId,
      });

      return true;
    } catch (error) {
      await this.logOperation('channel_join_failed', {
        channelId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async leaveChannel(channelId: string): Promise<boolean> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Slack');
      }

      const response = await this.apiClient.post('/conversations.leave', {
        channel: channelId,
      });

      if (!response.data.ok) {
        throw new Error(`Failed to leave channel: ${response.data.error}`);
      }

      await this.logOperation('channel_left', {
        channelId,
      });

      return true;
    } catch (error) {
      await this.logOperation('channel_leave_failed', {
        channelId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async createChannel(
    name: string,
    isPrivate: boolean = false,
  ): Promise<SlackChannel> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Slack');
      }

      const response = await this.apiClient.post('/conversations.create', {
        name,
        is_private: isPrivate,
      });

      if (!response.data.ok) {
        throw new Error(`Failed to create channel: ${response.data.error}`);
      }

      const channel = response.data.channel;

      await this.logOperation('channel_created', {
        channelId: channel.id,
        channelName: channel.name,
        isPrivate,
      });

      return channel;
    } catch (error) {
      await this.logOperation('channel_create_failed', {
        channelName: name,
        isPrivate,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async updateMessage(
    channelId: string,
    messageTs: string,
    text: string,
    options: { blocks?: any[]; attachments?: any[] } = {},
  ): Promise<boolean> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Slack');
      }

      const response = await this.apiClient.post('/chat.update', {
        channel: channelId,
        ts: messageTs,
        text,
        ...options,
      });

      if (!response.data.ok) {
        throw new Error(`Failed to update message: ${response.data.error}`);
      }

      await this.logOperation('message_updated', {
        channelId,
        messageTs,
      });

      return true;
    } catch (error) {
      await this.logOperation('message_update_failed', {
        channelId,
        messageTs,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async deleteMessage(channelId: string, messageTs: string): Promise<boolean> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Slack');
      }

      const response = await this.apiClient.post('/chat.delete', {
        channel: channelId,
        ts: messageTs,
      });

      if (!response.data.ok) {
        throw new Error(`Failed to delete message: ${response.data.error}`);
      }

      await this.logOperation('message_deleted', {
        channelId,
        messageTs,
      });

      return true;
    } catch (error) {
      await this.logOperation('message_delete_failed', {
        channelId,
        messageTs,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getChannelHistory(
    channelId: string,
    options: {
      limit?: number;
      oldest?: string;
      latest?: string;
      inclusive?: boolean;
    } = {},
  ): Promise<CommunicationMessage[]> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Slack');
      }

      const response = await this.apiClient.get('/conversations.history', {
        params: {
          channel: channelId,
          limit: options.limit || 100,
          oldest: options.oldest,
          latest: options.latest,
          inclusive: options.inclusive,
        },
      });

      if (!response.data.ok) {
        throw new Error(
          `Failed to fetch channel history: ${response.data.error}`,
        );
      }

      const messages = response.data.messages.map((msg: any) => ({
        id: msg.ts,
        channel: channelId,
        platform: 'slack',
        content: msg.text,
        sender: msg.user,
        recipient: channelId,
        timestamp: new Date(parseFloat(msg.ts) * 1000).toISOString(),
        metadata: {
          threadTs: msg.thread_ts,
          blocks: msg.blocks,
          attachments: msg.attachments,
          subtype: msg.subtype,
        },
      }));

      await this.logOperation('channel_history_fetched', {
        channelId,
        messageCount: messages.length,
      });

      return messages;
    } catch (error) {
      await this.logOperation('channel_history_fetch_failed', {
        channelId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      if (!this.authenticated) {
        return {
          status: 'unhealthy',
          details: {
            integrationType: IntegrationType.COMMUNICATION_SLACK,
            authenticated: false,
            lastCheck: new Date().toISOString(),
          },
        };
      }

      const response = await this.apiClient.get('/auth.test');

      return {
        status: response.data.ok ? 'healthy' : 'unhealthy',
        details: {
          integrationType: IntegrationType.COMMUNICATION_SLACK,
          authenticated: this.authenticated,
          botUserId: response.data.user_id,
          teamId: response.data.team_id,
          lastCheck: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          integrationType: IntegrationType.COMMUNICATION_SLACK,
          authenticated: this.authenticated,
          error: error instanceof Error ? error.message : 'Unknown error',
          lastCheck: new Date().toISOString(),
        },
      };
    }
  }

  private async logOperation(
    operation: string,
    data: Record<string, any> = {},
  ): Promise<void> {
    logIntegrationEvent(
      operation,
      IntegrationType.COMMUNICATION_SLACK,
      this.config.userId,
      data,
    );
  }
}
