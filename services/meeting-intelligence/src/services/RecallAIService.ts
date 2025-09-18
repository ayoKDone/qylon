import axios, { AxiosInstance } from 'axios';
import { RecallAIError, RecallBot, RecallRecording } from '../types';
import { logger } from '../utils/logger';

export class RecallAIService {
  private client: AxiosInstance;
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.RECALL_AI_API_KEY!;
    this.baseURL = process.env.RECALL_AI_BASE_URL || 'https://api.recall.ai/api/v1';

    if (!this.apiKey) {
      throw new Error('RECALL_AI_API_KEY environment variable is required');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Qylon-MeetingIntelligence/1.0.0'
      },
      timeout: 30000
    });

    // Add request/response interceptors for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('Recall.ai API request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data
        });
        return config;
      },
      (error) => {
        logger.error('Recall.ai API request error', { error: error.message });
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug('Recall.ai API response', {
          status: response.status,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      (error) => {
        logger.error('Recall.ai API response error', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create a new Recall.ai bot for a meeting
   */
  async createBot(meetingUrl: string, botName?: string): Promise<RecallBot> {
    try {
      const response = await this.client.post('/bot', {
        bot_name: botName || `Qylon Bot ${Date.now()}`,
        meeting_url: meetingUrl,
        transcription_options: {
          provider: 'deepgram',
          language: 'en',
          model: 'nova-2'
        },
        recording_options: {
          auto_start: true,
          auto_stop: true
        }
      });

      const bot = response.data;

      logger.info('Recall.ai bot created successfully', {
        botId: bot.id,
        botName: bot.bot_name,
        meetingUrl
      });

      return {
        id: bot.id,
        name: bot.bot_name,
        meeting_url: bot.meeting_url,
        bot_token: bot.bot_token,
        status: bot.status,
        created_at: new Date(bot.created_at)
      };

    } catch (error: any) {
      logger.error('Failed to create Recall.ai bot', {
        meetingUrl,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      throw new RecallAIError(
        `Failed to create Recall.ai bot: ${error.message}`,
        'BOT_CREATION_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Get bot information
   */
  async getBot(botId: string): Promise<RecallBot> {
    try {
      const response = await this.client.get(`/bot/${botId}`);
      const bot = response.data;

      return {
        id: bot.id,
        name: bot.bot_name,
        meeting_url: bot.meeting_url,
        bot_token: bot.bot_token,
        status: bot.status,
        created_at: new Date(bot.created_at)
      };

    } catch (error: any) {
      logger.error('Failed to get Recall.ai bot', {
        botId,
        error: error.message,
        status: error.response?.status
      });

      throw new RecallAIError(
        `Failed to get Recall.ai bot: ${error.message}`,
        'BOT_FETCH_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Delete a Recall.ai bot
   */
  async deleteBot(botId: string): Promise<void> {
    try {
      await this.client.delete(`/bot/${botId}`);

      logger.info('Recall.ai bot deleted successfully', { botId });

    } catch (error: any) {
      logger.error('Failed to delete Recall.ai bot', {
        botId,
        error: error.message,
        status: error.response?.status
      });

      throw new RecallAIError(
        `Failed to delete Recall.ai bot: ${error.message}`,
        'BOT_DELETION_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Get recordings for a bot
   */
  async getRecordings(botId: string): Promise<RecallRecording[]> {
    try {
      const response = await this.client.get(`/bot/${botId}/recording`);
      const recordings = response.data;

      return recordings.map((recording: any) => ({
        id: recording.id,
        bot_id: recording.bot_id,
        meeting_id: recording.meeting_id,
        recording_url: recording.recording_url,
        transcription_url: recording.transcription_url,
        status: recording.status,
        created_at: new Date(recording.created_at),
        updated_at: new Date(recording.updated_at)
      }));

    } catch (error: any) {
      logger.error('Failed to get Recall.ai recordings', {
        botId,
        error: error.message,
        status: error.response?.status
      });

      throw new RecallAIError(
        `Failed to get Recall.ai recordings: ${error.message}`,
        'RECORDINGS_FETCH_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Get transcription for a recording
   */
  async getTranscription(recordingId: string): Promise<any> {
    try {
      const response = await this.client.get(`/recording/${recordingId}/transcript`);

      logger.info('Recall.ai transcription retrieved successfully', {
        recordingId
      });

      return response.data;

    } catch (error: any) {
      logger.error('Failed to get Recall.ai transcription', {
        recordingId,
        error: error.message,
        status: error.response?.status
      });

      throw new RecallAIError(
        `Failed to get Recall.ai transcription: ${error.message}`,
        'TRANSCRIPTION_FETCH_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Start recording for a bot
   */
  async startRecording(botId: string): Promise<void> {
    try {
      await this.client.post(`/bot/${botId}/recording/start`);

      logger.info('Recall.ai recording started successfully', { botId });

    } catch (error: any) {
      logger.error('Failed to start Recall.ai recording', {
        botId,
        error: error.message,
        status: error.response?.status
      });

      throw new RecallAIError(
        `Failed to start Recall.ai recording: ${error.message}`,
        'RECORDING_START_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Stop recording for a bot
   */
  async stopRecording(botId: string): Promise<void> {
    try {
      await this.client.post(`/bot/${botId}/recording/stop`);

      logger.info('Recall.ai recording stopped successfully', { botId });

    } catch (error: any) {
      logger.error('Failed to stop Recall.ai recording', {
        botId,
        error: error.message,
        status: error.response?.status
      });

      throw new RecallAIError(
        `Failed to stop Recall.ai recording: ${error.message}`,
        'RECORDING_STOP_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Get bot status
   */
  async getBotStatus(botId: string): Promise<string> {
    try {
      const bot = await this.getBot(botId);
      return bot.status;

    } catch (error: any) {
      logger.error('Failed to get bot status', {
        botId,
        error: error.message
      });

      throw new RecallAIError(
        `Failed to get bot status: ${error.message}`,
        'STATUS_FETCH_FAILED',
        500
      );
    }
  }

  /**
   * Health check for Recall.ai service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;

    } catch (error: any) {
      logger.error('Recall.ai health check failed', {
        error: error.message,
        status: error.response?.status
      });
      return false;
    }
  }
}
