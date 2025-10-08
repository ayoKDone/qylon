import axios, { AxiosInstance } from 'axios';
import {
  CommunicationMessage,
  IntegrationConfig,
  IntegrationType,
} from '../types';
import { logIntegrationEvent } from '../utils/logger';

interface TeamsMessage {
  body: {
    contentType: string;
    content: string;
  };
  mentions?: Array<{
    id: number;
    mentionText: string;
    mentioned: {
      user: {
        displayName: string;
        id: string;
      };
    };
  }>;
  attachments?: any[];
}

interface TeamsChannel {
  id: string;
  displayName: string;
  description?: string;
  email?: string;
  webUrl?: string;
  membershipType?: string;
  createdDateTime: string;
  lastMessagePreview?: {
    createdDateTime: string;
    from: {
      user: {
        displayName: string;
        id: string;
      };
    };
    body: {
      content: string;
    };
  };
}

interface TeamsTeam {
  id: string;
  displayName: string;
  description?: string;
  internalId?: string;
  classification?: string;
  specialization?: string;
  visibility?: string;
  webUrl?: string;
  createdDateTime: string;
  createdBy: {
    user: {
      displayName: string;
      id: string;
    };
  };
}

interface TeamsUser {
  id: string;
  displayName: string;
  givenName?: string;
  surname?: string;
  userPrincipalName: string;
  businessPhones?: string[];
  mobilePhone?: string;
  officeLocation?: string;
  preferredLanguage?: string;
  jobTitle?: string;
  mail?: string;
  department?: string;
  companyName?: string;
}

interface TeamsAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

export class TeamsService {
  private apiClient: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private config: IntegrationConfig;
  private authenticated: boolean = false;

  constructor(config: IntegrationConfig) {
    this.config = config;
    this.apiClient = axios.create({
      baseURL: 'https://graph.microsoft.com/v1.0',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  async authenticate(credentials: Record<string, any>): Promise<boolean> {
    try {
      const { clientId, clientSecret, tenantId, accessToken, refreshToken } =
        credentials;

      if (!clientId || !clientSecret || !tenantId) {
        throw new Error('Missing required Microsoft Teams credentials');
      }

      // If we have an access token, use it directly
      if (accessToken) {
        this.accessToken = accessToken;
        this.apiClient.defaults.headers.common['Authorization'] =
          `Bearer ${this.accessToken}`;

        // Test the connection
        try {
          await this.apiClient.get('/me');
          this.authenticated = true;

          await this.logOperation('authentication_success', {
            hasAccessToken: !!this.accessToken,
          });

          return true;
        } catch (error) {
          // If access token is invalid, try to refresh
          if (refreshToken) {
            return await this.refreshAccessToken(
              clientId,
              clientSecret,
              tenantId,
              refreshToken,
            );
          }
          throw error;
        }
      }

      // If we have a refresh token, use it to get a new access token
      if (refreshToken) {
        return await this.refreshAccessToken(
          clientId,
          clientSecret,
          tenantId,
          refreshToken,
        );
      }

      throw new Error('No valid authentication method provided');
    } catch (error) {
      await this.logOperation('authentication_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async refreshAccessToken(
    clientId: string,
    clientSecret: string,
    tenantId: string,
    refreshToken: string,
  ): Promise<boolean> {
    try {
      const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

      const response = await axios.post(
        tokenUrl,
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
          scope: 'https://graph.microsoft.com/.default',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const tokenData: TeamsAuthResponse = response.data;

      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token || refreshToken;
      this.apiClient.defaults.headers.common['Authorization'] =
        `Bearer ${this.accessToken}`;

      this.authenticated = true;

      await this.logOperation('token_refreshed', {
        hasAccessToken: !!this.accessToken,
        hasRefreshToken: !!this.refreshToken,
      });

      return true;
    } catch (error) {
      await this.logOperation('token_refresh_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async sendMessage(
    chatId: string,
    content: string,
    options: {
      mentions?: Array<{ userId: string; displayName: string }>;
      attachments?: any[];
    } = {},
  ): Promise<CommunicationMessage> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Microsoft Teams');
      }

      const message: TeamsMessage = {
        body: {
          contentType: 'text',
          content: content,
        },
      };

      if (options.mentions && options.mentions.length > 0) {
        message.mentions = options.mentions.map((mention, index) => ({
          id: index,
          mentionText: `<at>${mention.displayName}</at>`,
          mentioned: {
            user: {
              displayName: mention.displayName,
              id: mention.userId,
            },
          },
        }));
      }

      if (options.attachments) {
        message.attachments = options.attachments;
      }

      const response = await this.apiClient.post(
        `/chats/${chatId}/messages`,
        message,
      );

      const sentMessage: CommunicationMessage = {
        id: response.data.id,
        channel: chatId,
        platform: 'teams',
        content: content,
        sender: 'bot',
        recipient: chatId,
        timestamp: new Date(response.data.createdDateTime).toISOString(),
        metadata: {
          mentions: options.mentions,
          attachments: options.attachments,
        },
      };

      await this.logOperation('message_sent', {
        chatId,
        messageId: sentMessage.id,
        hasMentions: !!options.mentions?.length,
      });

      return sentMessage;
    } catch (error) {
      await this.logOperation('message_send_failed', {
        chatId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async sendChannelMessage(
    teamId: string,
    channelId: string,
    content: string,
    options: {
      mentions?: Array<{ userId: string; displayName: string }>;
      attachments?: any[];
    } = {},
  ): Promise<CommunicationMessage> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Microsoft Teams');
      }

      const message: TeamsMessage = {
        body: {
          contentType: 'text',
          content: content,
        },
      };

      if (options.mentions && options.mentions.length > 0) {
        message.mentions = options.mentions.map((mention, index) => ({
          id: index,
          mentionText: `<at>${mention.displayName}</at>`,
          mentioned: {
            user: {
              displayName: mention.displayName,
              id: mention.userId,
            },
          },
        }));
      }

      if (options.attachments) {
        message.attachments = options.attachments;
      }

      const response = await this.apiClient.post(
        `/teams/${teamId}/channels/${channelId}/messages`,
        message,
      );

      const sentMessage: CommunicationMessage = {
        id: response.data.id,
        channel: channelId,
        platform: 'teams',
        content: content,
        sender: 'bot',
        recipient: channelId,
        timestamp: new Date(response.data.createdDateTime).toISOString(),
        metadata: {
          teamId,
          mentions: options.mentions,
          attachments: options.attachments,
        },
      };

      await this.logOperation('channel_message_sent', {
        teamId,
        channelId,
        messageId: sentMessage.id,
      });

      return sentMessage;
    } catch (error) {
      await this.logOperation('channel_message_send_failed', {
        teamId,
        channelId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getTeams(): Promise<TeamsTeam[]> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Microsoft Teams');
      }

      const response = await this.apiClient.get('/me/joinedTeams');
      return response.data.value;
    } catch (error) {
      await this.logOperation('teams_fetch_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getTeamChannels(teamId: string): Promise<TeamsChannel[]> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Microsoft Teams');
      }

      const response = await this.apiClient.get(`/teams/${teamId}/channels`);
      return response.data.value;
    } catch (error) {
      await this.logOperation('team_channels_fetch_failed', {
        teamId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getChats(): Promise<any[]> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Microsoft Teams');
      }

      const response = await this.apiClient.get('/me/chats');
      return response.data.value;
    } catch (error) {
      await this.logOperation('chats_fetch_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getUsers(): Promise<TeamsUser[]> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Microsoft Teams');
      }

      const response = await this.apiClient.get('/users');
      return response.data.value;
    } catch (error) {
      await this.logOperation('users_fetch_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async createChannel(
    teamId: string,
    displayName: string,
    description?: string,
    membershipType: string = 'standard',
  ): Promise<TeamsChannel> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Microsoft Teams');
      }

      const response = await this.apiClient.post(`/teams/${teamId}/channels`, {
        displayName,
        description,
        membershipType,
      });

      const channel = response.data;

      await this.logOperation('channel_created', {
        teamId,
        channelId: channel.id,
        channelName: channel.displayName,
        membershipType,
      });

      return channel;
    } catch (error) {
      await this.logOperation('channel_create_failed', {
        teamId,
        channelName: displayName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async updateMessage(
    chatId: string,
    messageId: string,
    content: string,
  ): Promise<boolean> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Microsoft Teams');
      }

      await this.apiClient.patch(`/chats/${chatId}/messages/${messageId}`, {
        body: {
          contentType: 'text',
          content: content,
        },
      });

      await this.logOperation('message_updated', {
        chatId,
        messageId,
      });

      return true;
    } catch (error) {
      await this.logOperation('message_update_failed', {
        chatId,
        messageId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async deleteMessage(chatId: string, messageId: string): Promise<boolean> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Microsoft Teams');
      }

      await this.apiClient.delete(`/chats/${chatId}/messages/${messageId}`);

      await this.logOperation('message_deleted', {
        chatId,
        messageId,
      });

      return true;
    } catch (error) {
      await this.logOperation('message_delete_failed', {
        chatId,
        messageId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getChatMessages(
    chatId: string,
    options: {
      top?: number;
      skip?: number;
    } = {},
  ): Promise<CommunicationMessage[]> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Microsoft Teams');
      }

      const params: any = {};
      if (options.top) params.$top = options.top;
      if (options.skip) params.$skip = options.skip;

      const response = await this.apiClient.get(`/chats/${chatId}/messages`, {
        params,
      });

      const messages = response.data.value.map((msg: any) => ({
        id: msg.id,
        channel: chatId,
        platform: 'teams',
        content: msg.body.content,
        sender: msg.from?.user?.id || 'unknown',
        recipient: chatId,
        timestamp: new Date(msg.createdDateTime).toISOString(),
        metadata: {
          mentions: msg.mentions,
          attachments: msg.attachments,
          from: msg.from,
        },
      }));

      await this.logOperation('chat_messages_fetched', {
        chatId,
        messageCount: messages.length,
      });

      return messages;
    } catch (error) {
      await this.logOperation('chat_messages_fetch_failed', {
        chatId,
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
            integrationType: IntegrationType.COMMUNICATION_TEAMS,
            authenticated: false,
            lastCheck: new Date().toISOString(),
          },
        };
      }

      const response = await this.apiClient.get('/me');

      return {
        status: 'healthy',
        details: {
          integrationType: IntegrationType.COMMUNICATION_TEAMS,
          authenticated: this.authenticated,
          userId: response.data.id,
          displayName: response.data.displayName,
          lastCheck: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          integrationType: IntegrationType.COMMUNICATION_TEAMS,
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
      IntegrationType.COMMUNICATION_TEAMS,
      this.config.userId,
      data,
    );
  }
}
