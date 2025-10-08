import axios, { AxiosInstance } from 'axios';
import {
  CommunicationMessage,
  IntegrationConfig,
  IntegrationType,
} from '../types';
import { logIntegrationEvent } from '../utils/logger';

interface DiscordMessage {
  content: string;
  embeds?: any[];
  components?: any[];
  files?: any[];
  allowed_mentions?: {
    parse?: string[];
    roles?: string[];
    users?: string[];
  };
  reply?: {
    message_id: string;
    fail_if_not_exists?: boolean;
  };
}

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  guild_id?: string;
  position?: number;
  permission_overwrites?: any[];
  topic?: string;
  nsfw?: boolean;
  last_message_id?: string;
  parent_id?: string;
}

interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  splash?: string;
  discovery_splash?: string;
  features: string[];
  approximate_member_count?: number;
  approximate_presence_count?: number;
  stickers?: any[];
  banner?: string;
  premium_tier: number;
  premium_subscription_count?: number;
  preferred_locale: string;
  public_updates_channel_id?: string;
  max_video_channel_users?: number;
  max_stage_video_channel_users?: number;
  rules_channel_id?: string;
  max_presences?: number;
  max_members?: number;
  vanity_url_code?: string;
  verification_level: number;
  default_message_notifications: number;
  explicit_content_filter: number;
  mfa_level: number;
  application_id?: string;
  system_channel_id?: string;
  system_channel_flags: number;
  premium_progress_bar_enabled: boolean;
  safety_alerts_channel_id?: string;
}

// interface DiscordUser {
//   id: string;
//   username: string;
//   discriminator: string;
//   global_name?: string;
//   avatar?: string;
//   bot?: boolean;
//   system?: boolean;
//   mfa_enabled?: boolean;
//   banner?: string;
//   accent_color?: number;
//   locale?: string;
//   verified?: boolean;
//   email?: string;
//   flags?: number;
//   premium_type?: number;
//   public_flags?: number;
//   avatar_decoration?: string;
// }

export class DiscordService {
  private apiClient: AxiosInstance;
  private botToken: string | null = null;
  private config: IntegrationConfig;
  private authenticated: boolean = false;

  constructor(config: IntegrationConfig) {
    this.config = config;
    this.apiClient = axios.create({
      baseURL: 'https://discord.com/api/v10',
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
        throw new Error('Missing required Discord bot token');
      }

      this.botToken = botToken;
      this.apiClient.defaults.headers.common['Authorization'] =
        `Bot ${this.botToken}`;

      // Test the connection by fetching bot info
      const response = await this.apiClient.get('/users/@me');

      if (!response.data.id) {
        throw new Error('Discord authentication failed: Invalid bot token');
      }

      this.authenticated = true;

      await this.logOperation('authentication_success', {
        botId: response.data.id,
        botUsername: response.data.username,
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
    channelId: string,
    content: string,
    options: {
      embeds?: any[];
      components?: any[];
      files?: any[];
      replyToMessageId?: string;
      allowedMentions?: {
        parse?: string[];
        roles?: string[];
        users?: string[];
      };
    } = {},
  ): Promise<CommunicationMessage> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Discord');
      }

      const message: DiscordMessage = {
        content,
        embeds: options.embeds || [],
        components: options.components || [],
        files: options.files || [],
        allowed_mentions: options.allowedMentions || {},
      };

      if (options.replyToMessageId) {
        message.reply = {
          message_id: options.replyToMessageId,
          fail_if_not_exists: false,
        };
      }

      const response = await this.apiClient.post(
        `/channels/${channelId}/messages`,
        message,
      );

      const sentMessage: CommunicationMessage = {
        id: response.data.id,
        channel: channelId,
        platform: 'discord',
        content: content,
        sender: 'bot',
        recipient: channelId,
        timestamp: new Date(response.data.timestamp).toISOString(),
        metadata: {
          embeds: options.embeds,
          components: options.components,
          replyToMessageId: options.replyToMessageId,
        },
      };

      await this.logOperation('message_sent', {
        channelId,
        messageId: sentMessage.id,
        hasReply: !!options.replyToMessageId,
      });

      return sentMessage;
    } catch (error) {
      await this.logOperation('message_send_failed', {
        channelId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async sendDirectMessage(
    userId: string,
    content: string,
    options: any = {},
  ): Promise<CommunicationMessage> {
    try {
      // Create a DM channel with the user
      const dmResponse = await this.apiClient.post('/users/@me/channels', {
        recipient_id: userId,
      });

      const channelId = dmResponse.data.id;
      return await this.sendMessage(channelId, content, options);
    } catch (error) {
      await this.logOperation('dm_send_failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getGuilds(): Promise<DiscordGuild[]> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Discord');
      }

      const response = await this.apiClient.get('/users/@me/guilds');
      return response.data;
    } catch (error) {
      await this.logOperation('guilds_fetch_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getGuildChannels(guildId: string): Promise<DiscordChannel[]> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Discord');
      }

      const response = await this.apiClient.get(`/guilds/${guildId}/channels`);
      return response.data;
    } catch (error) {
      await this.logOperation('guild_channels_fetch_failed', {
        guildId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getChannel(channelId: string): Promise<DiscordChannel> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Discord');
      }

      const response = await this.apiClient.get(`/channels/${channelId}`);
      return response.data;
    } catch (error) {
      await this.logOperation('channel_fetch_failed', {
        channelId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async createChannel(
    guildId: string,
    name: string,
    type: number = 0, // 0 = text channel
    options: {
      topic?: string;
      nsfw?: boolean;
      parent_id?: string;
      permission_overwrites?: any[];
    } = {},
  ): Promise<DiscordChannel> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Discord');
      }

      const response = await this.apiClient.post(
        `/guilds/${guildId}/channels`,
        {
          name,
          type,
          ...options,
        },
      );

      const channel = response.data;

      await this.logOperation('channel_created', {
        guildId,
        channelId: channel.id,
        channelName: channel.name,
        type,
      });

      return channel;
    } catch (error) {
      await this.logOperation('channel_create_failed', {
        guildId,
        channelName: name,
        type,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async updateMessage(
    channelId: string,
    messageId: string,
    content: string,
    options: {
      embeds?: any[];
      components?: any[];
      files?: any[];
    } = {},
  ): Promise<boolean> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Discord');
      }

      await this.apiClient.patch(
        `/channels/${channelId}/messages/${messageId}`,
        {
          content,
          embeds: options.embeds,
          components: options.components,
          files: options.files,
        },
      );

      await this.logOperation('message_updated', {
        channelId,
        messageId,
      });

      return true;
    } catch (error) {
      await this.logOperation('message_update_failed', {
        channelId,
        messageId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async deleteMessage(channelId: string, messageId: string): Promise<boolean> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Discord');
      }

      await this.apiClient.delete(
        `/channels/${channelId}/messages/${messageId}`,
      );

      await this.logOperation('message_deleted', {
        channelId,
        messageId,
      });

      return true;
    } catch (error) {
      await this.logOperation('message_delete_failed', {
        channelId,
        messageId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getChannelMessages(
    channelId: string,
    options: {
      limit?: number;
      before?: string;
      after?: string;
      around?: string;
    } = {},
  ): Promise<CommunicationMessage[]> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Discord');
      }

      const params: any = {};
      if (options.limit) params.limit = options.limit;
      if (options.before) params.before = options.before;
      if (options.after) params.after = options.after;
      if (options.around) params.around = options.around;

      const response = await this.apiClient.get(
        `/channels/${channelId}/messages`,
        {
          params,
        },
      );

      const messages = response.data.map((msg: any) => ({
        id: msg.id,
        channel: channelId,
        platform: 'discord',
        content: msg.content,
        sender: msg.author.id,
        recipient: channelId,
        timestamp: new Date(msg.timestamp).toISOString(),
        metadata: {
          embeds: msg.embeds,
          components: msg.components,
          attachments: msg.attachments,
          mentions: msg.mentions,
          author: {
            id: msg.author.id,
            username: msg.author.username,
            discriminator: msg.author.discriminator,
          },
        },
      }));

      await this.logOperation('channel_messages_fetched', {
        channelId,
        messageCount: messages.length,
      });

      return messages;
    } catch (error) {
      await this.logOperation('channel_messages_fetch_failed', {
        channelId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async addReaction(
    channelId: string,
    messageId: string,
    emoji: string,
  ): Promise<boolean> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Discord');
      }

      // Encode emoji for URL
      const encodedEmoji = encodeURIComponent(emoji);

      await this.apiClient.put(
        `/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}/@me`,
      );

      await this.logOperation('reaction_added', {
        channelId,
        messageId,
        emoji,
      });

      return true;
    } catch (error) {
      await this.logOperation('reaction_add_failed', {
        channelId,
        messageId,
        emoji,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async removeReaction(
    channelId: string,
    messageId: string,
    emoji: string,
  ): Promise<boolean> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Discord');
      }

      // Encode emoji for URL
      const encodedEmoji = encodeURIComponent(emoji);

      await this.apiClient.delete(
        `/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}/@me`,
      );

      await this.logOperation('reaction_removed', {
        channelId,
        messageId,
        emoji,
      });

      return true;
    } catch (error) {
      await this.logOperation('reaction_remove_failed', {
        channelId,
        messageId,
        emoji,
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
            integrationType: IntegrationType.COMMUNICATION_DISCORD,
            authenticated: false,
            lastCheck: new Date().toISOString(),
          },
        };
      }

      const response = await this.apiClient.get('/users/@me');

      return {
        status: 'healthy',
        details: {
          integrationType: IntegrationType.COMMUNICATION_DISCORD,
          authenticated: this.authenticated,
          botId: response.data.id,
          botUsername: response.data.username,
          lastCheck: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          integrationType: IntegrationType.COMMUNICATION_DISCORD,
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
      IntegrationType.COMMUNICATION_DISCORD,
      this.config.userId,
      data,
    );
  }
}
