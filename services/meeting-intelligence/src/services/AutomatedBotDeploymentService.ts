import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { RecallAIService } from './RecallAIService';

export interface CalendarMeeting {
  id: string;
  title: string;
  start_time: Date;
  end_time: Date;
  meeting_url: string;
  platform: 'zoom' | 'teams' | 'google_meet' | 'webex';
  client_id: string;
  team_id?: string;
  participants: Array<{
    name: string;
    email: string;
    role?: string;
  }>;
}

export interface BotDeploymentConfig {
  clientId: string;
  teamId?: string;
  autoDeploy: boolean;
  platforms: string[];
  transcriptionProvider: 'recallai_streaming' | 'deepgram';
  language: string;
  webhookUrl?: string;
  cleanupAfterHours: number;
}

export class AutomatedBotDeploymentService {
  private supabase;
  private recallAIService: RecallAIService;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    this.recallAIService = new RecallAIService();
  }

  /**
   * Deploy bots for all upcoming calendar meetings for a client
   */
  async deployBotsForUpcomingMeetings(
    clientId: string,
    teamId?: string,
    hoursAhead: number = 24,
  ): Promise<
    Array<{
      meeting: CalendarMeeting;
      bot: any;
      success: boolean;
      error?: string;
    }>
  > {
    try {
      // Get upcoming meetings from calendar integration
      const upcomingMeetings = await this.getUpcomingMeetings(
        clientId,
        teamId,
        hoursAhead,
      );

      if (upcomingMeetings.length === 0) {
        logger.info('No upcoming meetings found for bot deployment', {
          clientId,
          teamId,
        });
        return [];
      }

      // Get client's bot deployment configuration
      const config = await this.getBotDeploymentConfig(clientId);

      if (!config.autoDeploy) {
        logger.info('Auto-deployment disabled for client', { clientId });
        return [];
      }

      // Deploy bots for each meeting
      const deploymentResults = await Promise.allSettled(
        upcomingMeetings.map(async meeting => {
          try {
            // Check if bot already exists for this meeting
            const existingBot = await this.getExistingBotForMeeting(meeting.id);
            if (existingBot) {
              logger.info('Bot already exists for meeting', {
                meetingId: meeting.id,
                botId: existingBot.id,
              });
              return { meeting, bot: existingBot, success: true };
            }

            // Create new bot
            const bot = await this.recallAIService.createBotForScheduledMeeting(
              meeting.meeting_url,
              meeting.title,
              clientId,
              teamId,
              meeting.start_time,
            );

            // Store bot information in database
            await this.storeBotInformation(meeting.id, bot, clientId, teamId);

            logger.info('Bot deployed successfully for meeting', {
              meetingId: meeting.id,
              botId: bot.id,
              clientId,
              teamId,
            });

            return { meeting, bot, success: true };
          } catch (error: any) {
            logger.error('Failed to deploy bot for meeting', {
              meetingId: meeting.id,
              clientId,
              teamId,
              error: error.message,
            });
            return { meeting, bot: null, success: false, error: error.message };
          }
        }),
      );

      const results = deploymentResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            meeting: upcomingMeetings[index],
            bot: null,
            success: false,
            error: result.reason?.message || 'Unknown error',
          };
        }
      });

      const successCount = results.filter(r => r.success).length;
      logger.info('Bot deployment batch completed', {
        clientId,
        teamId,
        totalMeetings: upcomingMeetings.length,
        successfulDeployments: successCount,
        failedDeployments: results.length - successCount,
      });

      return results;
    } catch (error: any) {
      logger.error('Failed to deploy bots for upcoming meetings', {
        clientId,
        teamId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Deploy bot for on-the-fly meeting
   */
  async deployBotForOnTheFlyMeeting(
    meetingUrl: string,
    clientId: string,
    teamId?: string,
    hostName?: string,
  ): Promise<{ bot: any; success: boolean; error?: string }> {
    try {
      // Get client's bot deployment configuration
      const config = await this.getBotDeploymentConfig(clientId);

      if (!config.autoDeploy) {
        return {
          bot: null,
          success: false,
          error: 'Auto-deployment disabled for client',
        };
      }

      // Create meeting record for on-the-fly meeting
      const meeting = await this.createOnTheFlyMeetingRecord(
        meetingUrl,
        clientId,
        teamId,
        hostName,
      );

      // Deploy bot
      const bot = await this.recallAIService.createBotForOnTheFlyMeeting(
        meetingUrl,
        clientId,
        teamId,
        hostName,
      );

      // Store bot information
      await this.storeBotInformation(meeting.id, bot, clientId, teamId);

      logger.info('Bot deployed for on-the-fly meeting', {
        meetingId: meeting.id,
        botId: bot.id,
        clientId,
        teamId,
        hostName,
      });

      return { bot, success: true };
    } catch (error: any) {
      logger.error('Failed to deploy bot for on-the-fly meeting', {
        meetingUrl,
        clientId,
        teamId,
        hostName,
        error: error.message,
      });
      return { bot: null, success: false, error: error.message };
    }
  }

  /**
   * Get upcoming meetings from calendar integration
   */
  public async getUpcomingMeetings(
    clientId: string,
    teamId?: string,
    hoursAhead: number = 24,
  ): Promise<CalendarMeeting[]> {
    try {
      const now = new Date();
      const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

      // Query meetings from database that are scheduled in the future
      const { data: meetings, error } = await this.supabase
        .from('meetings')
        .select(
          `
          id,
          title,
          start_time,
          end_time,
          meeting_url,
          platform,
          client_id,
          metadata,
          meeting_participants (
            name,
            email,
            role
          )
        `,
        )
        .eq('client_id', clientId)
        .gte('start_time', now.toISOString())
        .lte('start_time', futureTime.toISOString())
        .eq('status', 'scheduled')
        .not('meeting_url', 'is', null);

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      return meetings.map(meeting => ({
        id: meeting.id,
        title: meeting.title,
        start_time: new Date(meeting.start_time),
        end_time: new Date(meeting.end_time),
        meeting_url: meeting.meeting_url,
        platform: meeting.platform,
        client_id: meeting.client_id,
        team_id: meeting.metadata?.team_id,
        participants: meeting.meeting_participants || [],
      }));
    } catch (error: any) {
      logger.error('Failed to get upcoming meetings', {
        clientId,
        teamId,
        hoursAhead,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get bot deployment configuration for a client
   */
  public async getBotDeploymentConfig(
    clientId: string,
  ): Promise<BotDeploymentConfig> {
    try {
      const { data: config, error } = await this.supabase
        .from('client_settings')
        .select('bot_deployment_config')
        .eq('client_id', clientId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw new Error(
          `Failed to get bot deployment config: ${error.message}`,
        );
      }

      // Return default configuration if none exists
      return (
        config?.bot_deployment_config || {
          clientId,
          autoDeploy: true,
          platforms: ['zoom', 'teams', 'google_meet', 'webex'],
          transcriptionProvider: 'recallai_streaming',
          language: 'en',
          cleanupAfterHours: 24,
        }
      );
    } catch (error: any) {
      logger.error('Failed to get bot deployment config', {
        clientId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Check if bot already exists for a meeting
   */
  public async getExistingBotForMeeting(meetingId: string): Promise<any> {
    try {
      const { data: meeting, error } = await this.supabase
        .from('meetings')
        .select('metadata')
        .eq('id', meetingId)
        .single();

      if (error) {
        throw new Error(`Failed to get meeting: ${error.message}`);
      }

      const botId = meeting.metadata?.recall_bot_id;
      if (!botId) {
        return null;
      }

      // Verify bot still exists in Recall.ai
      try {
        return await this.recallAIService.getBot(botId);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // Bot doesn't exist in Recall.ai, remove from metadata
        await this.supabase
          .from('meetings')
          .update({
            metadata: {
              ...meeting.metadata,
              recall_bot_id: null,
              recall_bot_token: null,
            },
          })
          .eq('id', meetingId);

        return null;
      }
    } catch (error: any) {
      logger.error('Failed to check existing bot for meeting', {
        meetingId,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Store bot information in database
   */
  private async storeBotInformation(
    meetingId: string,
    bot: any,
    clientId: string,
    teamId?: string,
  ): Promise<void> {
    try {
      await this.supabase
        .from('meetings')
        .update({
          metadata: {
            recall_bot_id: bot.id,
            recall_bot_token: bot.bot_token,
            recall_bot_name: bot.name,
            recall_bot_created_at: bot.created_at.toISOString(),
            client_id: clientId,
            team_id: teamId,
          },
        })
        .eq('id', meetingId);

      logger.info('Bot information stored in database', {
        meetingId,
        botId: bot.id,
        clientId,
        teamId,
      });
    } catch (error: any) {
      logger.error('Failed to store bot information', {
        meetingId,
        botId: bot.id,
        clientId,
        teamId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Create meeting record for on-the-fly meeting
   */
  private async createOnTheFlyMeetingRecord(
    meetingUrl: string,
    clientId: string,
    teamId?: string,
    hostName?: string,
  ): Promise<any> {
    try {
      const { data: meeting, error } = await this.supabase
        .from('meetings')
        .insert({
          client_id: clientId,
          title: `On-the-fly Meeting - ${hostName || 'Unknown Host'}`,
          description: 'Automatically created for on-the-fly meeting',
          platform: this.detectPlatformFromUrl(meetingUrl),
          meeting_url: meetingUrl,
          start_time: new Date().toISOString(),
          status: 'recording',
          metadata: {
            is_on_the_fly: true,
            host_name: hostName,
            team_id: teamId,
            created_via: 'automated_bot_deployment',
          },
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create meeting record: ${error.message}`);
      }

      return meeting;
    } catch (error: any) {
      logger.error('Failed to create on-the-fly meeting record', {
        meetingUrl,
        clientId,
        teamId,
        hostName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Detect platform from meeting URL
   */
  private detectPlatformFromUrl(
    meetingUrl: string,
  ): 'zoom' | 'teams' | 'google_meet' | 'webex' | 'other' {
    const url = meetingUrl.toLowerCase();

    if (url.includes('zoom.us')) return 'zoom';
    if (url.includes('teams.microsoft.com')) return 'teams';
    if (url.includes('meet.google.com')) return 'google_meet';
    if (url.includes('webex.com')) return 'webex';

    return 'other';
  }

  /**
   * Cleanup inactive bots for a client
   */
  async cleanupInactiveBots(
    clientId: string,
    olderThanHours: number = 24,
  ): Promise<number> {
    try {
      return await this.recallAIService.cleanupInactiveBots(
        clientId,
        olderThanHours,
      );
    } catch (error: any) {
      logger.error('Failed to cleanup inactive bots', {
        clientId,
        olderThanHours,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update bot deployment configuration for a client
   */
  async updateBotDeploymentConfig(
    clientId: string,
    config: Partial<BotDeploymentConfig>,
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from('client_settings').upsert({
        client_id: clientId,
        bot_deployment_config: config,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new Error(
          `Failed to update bot deployment config: ${error.message}`,
        );
      }

      logger.info('Bot deployment config updated', { clientId, config });
    } catch (error: any) {
      logger.error('Failed to update bot deployment config', {
        clientId,
        config,
        error: error.message,
      });
      throw error;
    }
  }
}
