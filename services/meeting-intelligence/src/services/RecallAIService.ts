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
        Authorization: `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Qylon-MeetingIntelligence/1.0.0',
      },
      timeout: 30000,
    });

    // Add request/response interceptors for logging
    this.client.interceptors.request.use(
      config => {
        logger.debug('Recall.ai API request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
        });
        return config;
      },
      error => {
        logger.error('Recall.ai API request error', { error: error.message });
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      response => {
        logger.debug('Recall.ai API response', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });
        return response;
      },
      error => {
        logger.error('Recall.ai API response error', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create a new Recall.ai bot for a meeting with enhanced configuration
   */
  async createBot(
    meetingUrl: string,
    botName?: string,
    options?: {
      clientId?: string;
      teamId?: string;
      autoStart?: boolean;
      transcriptionProvider?: 'recallai_streaming' | 'deepgram' | 'meeting_captions';
      language?: string;
      webhookUrl?: string;
      joinAt?: Date; // Schedule bot to join at specific time (>=10 minutes in advance)
      automaticLeave?: {
        silenceDetection?: {
          timeout?: number; // seconds of continuous silence (default: 3600)
          activateAfter?: number; // buffer before activation (default: 1200)
        };
        botDetection?: {
          usingParticipantEvents?: {
            timeout?: number; // seconds after which bot leaves if all participants are bots (default: 600)
            activateAfter?: number; // buffer before activation (default: 1200)
          };
          usingParticipantNames?: {
            matches?: string[]; // strings to match participant names (e.g., ['notetaker', 'bot'])
            timeout?: number; // seconds after which bot leaves if all participants are bots
            activateAfter?: number; // buffer before activation
          };
        };
        everyoneLeftTimeout?: {
          timeout?: number; // seconds to wait after everyone leaves (default: 2)
          activateAfter?: number; // buffer before activation (default: 0)
        };
        waitingRoomTimeout?: number; // seconds in waiting room (default: 1200)
        nooneJoinedTimeout?: number; // seconds to wait if no one joins (default: 1200)
        inCallNotRecordingTimeout?: number; // seconds in call without recording (default: 3600)
        recordingPermissionDeniedTimeout?: number; // seconds after recording denied (default: 30)
      };
      recordingConfig?: {
        videoMixedMp4?: boolean;
        participantEvents?: boolean;
        meetingMetadata?: boolean;
        audioMixedRaw?: boolean;
        realtimeEndpoints?: string[];
        videoMixedLayout?: 'speaker_view' | 'gallery_view' | 'gallery_view_v2';
        videoMixedParticipantVideoWhenScreenshare?: 'overlap' | 'hide';
        startRecordingOn?: 'participant_join' | 'bot_join';
        includeBotInRecording?: {
          audio?: boolean;
          video?: boolean;
        };
        // Separate video per participant
        videoSeparateMp4?: boolean;
        videoSeparatePng?: boolean;
        videoSeparateH264?: boolean;
        // Separate audio per participant
        audioSeparateRaw?: boolean;
        // Transcription configuration
        transcript?: {
          provider: {
            recallai_streaming?: {
              language_code?: string;
              mode?: 'prioritize_accuracy' | 'prioritize_low_latency';
              spelling?: boolean;
              filter_profanity?: boolean;
            };
            meeting_captions?: {};
            assembly_ai_async_chunked?: {
              language?: string;
              language_detection?: boolean;
            };
            aws_transcribe_streaming?: {
              language_code?: string;
              language_identification?: boolean;
              language_options?: string[];
            };
            deepgram_streaming?: {
              model?: string;
              language?: string;
            };
          };
          diarization?: {
            use_separate_streams_when_available?: boolean;
          };
        };
      };
      // Bot variant (Native vs Web)
      variant?: {
        zoom?: 'native' | 'web';
        google_meet?: 'web' | 'web_4_core';
        microsoft_teams?: 'web' | 'web_4_core';
      };
    }
  ): Promise<RecallBot> {
    try {
      // Determine if this is a scheduled bot (>=10 minutes in advance) or ad-hoc
      const isScheduled =
        options?.joinAt && options.joinAt.getTime() - Date.now() >= 10 * 60 * 1000;

      const botConfig = {
        bot_name: botName || `Qylon Bot ${Date.now()}`,
        meeting_url: meetingUrl,
        ...(isScheduled && options.joinAt && { join_at: options.joinAt.toISOString() }),
        recording_config: {
          transcript: {
            provider: {
              [options?.transcriptionProvider || 'meeting_captions']:
                options?.transcriptionProvider === 'recallai_streaming'
                  ? {
                      mode: 'prioritize_low_latency',
                      language_code: options?.language || 'en',
                    }
                  : {},
            },
          },
          ...(options?.recordingConfig?.videoMixedMp4 !== false && {
            video_mixed_mp4: {
              metadata: {},
            },
          }),
          ...(options?.recordingConfig?.participantEvents !== false && {
            participant_events: {
              metadata: {},
            },
          }),
          ...(options?.recordingConfig?.meetingMetadata !== false && {
            meeting_metadata: {
              metadata: {},
            },
          }),
          ...(options?.recordingConfig?.audioMixedRaw && {
            audio_mixed_raw: {},
          }),
          ...(options?.recordingConfig?.videoSeparateMp4 && {
            video_separate_mp4: {},
          }),
          ...(options?.recordingConfig?.videoSeparatePng && {
            video_separate_png: {},
          }),
          ...(options?.recordingConfig?.videoSeparateH264 && {
            video_separate_h264: {},
          }),
          ...(options?.recordingConfig?.audioSeparateRaw && {
            audio_separate_raw: {},
          }),
          ...(options?.recordingConfig?.realtimeEndpoints && {
            realtime_endpoints: options.recordingConfig.realtimeEndpoints,
          }),
          ...(options?.recordingConfig?.transcript && {
            transcript: options.recordingConfig.transcript,
          }),
          video_mixed_layout: options?.recordingConfig?.videoMixedLayout || 'speaker_view',
          video_mixed_participant_video_when_screenshare:
            options?.recordingConfig?.videoMixedParticipantVideoWhenScreenshare || 'overlap',
          start_recording_on: options?.recordingConfig?.startRecordingOn || 'participant_join',
          include_bot_in_recording: {
            audio: options?.recordingConfig?.includeBotInRecording?.audio || false,
            video: options?.recordingConfig?.includeBotInRecording?.video || false,
          },
          metadata: {
            client_id: options?.clientId,
            team_id: options?.teamId,
            qylon_version: '1.0.0',
          },
        },
        ...(options?.automaticLeave && {
          automatic_leave: {
            ...(options.automaticLeave.silenceDetection && {
              silence_detection: {
                timeout: options.automaticLeave.silenceDetection.timeout || 3600,
                activate_after: options.automaticLeave.silenceDetection.activateAfter || 1200,
              },
            }),
            ...(options.automaticLeave.botDetection && {
              bot_detection: {
                ...(options.automaticLeave.botDetection.usingParticipantEvents && {
                  using_participant_events: {
                    timeout:
                      options.automaticLeave.botDetection.usingParticipantEvents.timeout || 600,
                    activate_after:
                      options.automaticLeave.botDetection.usingParticipantEvents.activateAfter ||
                      1200,
                  },
                }),
                ...(options.automaticLeave.botDetection.usingParticipantNames && {
                  using_participant_names: {
                    matches: options.automaticLeave.botDetection.usingParticipantNames.matches || [
                      'bot',
                      'notetaker',
                      'qylon',
                    ],
                    timeout:
                      options.automaticLeave.botDetection.usingParticipantNames.timeout || 600,
                    activate_after:
                      options.automaticLeave.botDetection.usingParticipantNames.activateAfter ||
                      1200,
                  },
                }),
              },
            }),
            ...(options.automaticLeave.everyoneLeftTimeout && {
              everyone_left_timeout: {
                timeout: options.automaticLeave.everyoneLeftTimeout.timeout || 2,
                activate_after: options.automaticLeave.everyoneLeftTimeout.activateAfter || 0,
              },
            }),
            waiting_room_timeout: options.automaticLeave.waitingRoomTimeout || 1200,
            noone_joined_timeout: options.automaticLeave.nooneJoinedTimeout || 1200,
            in_call_not_recording_timeout: options.automaticLeave.inCallNotRecordingTimeout || 3600,
            recording_permission_denied_timeout:
              options.automaticLeave.recordingPermissionDeniedTimeout || 30,
          },
        }),
        ...(options?.webhookUrl && {
          webhook_url: options.webhookUrl,
        }),
        ...(options?.variant && {
          variant: options.variant,
        }),
      };

      const response = await this.client.post('/bot', botConfig);

      const bot = response.data;

      logger.info('Recall.ai bot created successfully', {
        botId: bot.id,
        botName: bot.bot_name,
        meetingUrl,
      });

      return {
        id: bot.id,
        name: bot.bot_name,
        meeting_url: bot.meeting_url,
        bot_token: bot.bot_token,
        status: bot.status,
        created_at: new Date(bot.created_at),
      };
    } catch (error: any) {
      logger.error('Failed to create Recall.ai bot', {
        meetingUrl,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
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
        created_at: new Date(bot.created_at),
      };
    } catch (error: any) {
      logger.error('Failed to get Recall.ai bot', {
        botId,
        error: error.message,
        status: error.response?.status,
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
        status: error.response?.status,
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
        updated_at: new Date(recording.updated_at),
      }));
    } catch (error: any) {
      logger.error('Failed to get Recall.ai recordings', {
        botId,
        error: error.message,
        status: error.response?.status,
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
        recordingId,
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to get Recall.ai transcription', {
        recordingId,
        error: error.message,
        status: error.response?.status,
      });

      throw new RecallAIError(
        `Failed to get Recall.ai transcription: ${error.message}`,
        'TRANSCRIPTION_FETCH_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Get bot status with detailed status changes
   */
  async getBotStatus(botId: string): Promise<{
    status: string;
    statusChanges: Array<{
      code: string;
      message: string | null;
      created_at: string;
      sub_code: string | null;
    }>;
    hasFatalError: boolean;
    lastError?: {
      code: string;
      sub_code: string | null;
      message: string | null;
    };
  }> {
    try {
      const response = await this.client.get(`/bot/${botId}`);
      const bot = response.data;

      // Analyze status changes for errors
      const statusChanges = bot.status_changes || [];
      const fatalErrors = statusChanges.filter((change: any) => change.code === 'fatal');
      const hasFatalError = fatalErrors.length > 0;
      const lastError = hasFatalError ? fatalErrors[fatalErrors.length - 1] : undefined;

      logger.info('Bot status retrieved with troubleshooting info', {
        botId,
        status: bot.status,
        statusChangesCount: statusChanges.length,
        hasFatalError,
        lastError: lastError?.sub_code,
      });

      return {
        status: bot.status,
        statusChanges,
        hasFatalError,
        lastError,
      };
    } catch (error: any) {
      logger.error('Failed to get bot status', {
        botId,
        error: error.message,
      });

      throw new RecallAIError(
        `Failed to get bot status: ${error.message}`,
        'STATUS_FETCH_FAILED',
        500
      );
    }
  }

  /**
   * Get bot screenshots for debugging
   */
  async getBotScreenshots(botId: string): Promise<
    Array<{
      id: string;
      bot_id: string;
      screenshot_url: string;
      created_at: string;
      metadata: any;
    }>
  > {
    try {
      const response = await this.client.get(`/bot/${botId}/screenshots`);
      const screenshots = response.data;

      logger.info('Bot screenshots retrieved for debugging', {
        botId,
        screenshotsCount: screenshots.length,
      });

      return screenshots.map((screenshot: any) => ({
        id: screenshot.id,
        bot_id: screenshot.bot_id,
        screenshot_url: screenshot.screenshot_url,
        created_at: screenshot.created_at,
        metadata: screenshot.metadata,
      }));
    } catch (error: any) {
      logger.error('Failed to get bot screenshots', {
        botId,
        error: error.message,
        status: error.response?.status,
      });

      throw new RecallAIError(
        `Failed to get bot screenshots: ${error.message}`,
        'SCREENSHOTS_FETCH_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Get specific bot screenshot
   */
  async getBotScreenshot(
    botId: string,
    screenshotId: string
  ): Promise<{
    id: string;
    bot_id: string;
    screenshot_url: string;
    created_at: string;
    metadata: any;
  }> {
    try {
      const response = await this.client.get(`/bot/${botId}/screenshots/${screenshotId}`);
      const screenshot = response.data;

      logger.info('Bot screenshot retrieved', {
        botId,
        screenshotId,
      });

      return {
        id: screenshot.id,
        bot_id: screenshot.bot_id,
        screenshot_url: screenshot.screenshot_url,
        created_at: screenshot.created_at,
        metadata: screenshot.metadata,
      };
    } catch (error: any) {
      logger.error('Failed to get bot screenshot', {
        botId,
        screenshotId,
        error: error.message,
        status: error.response?.status,
      });

      throw new RecallAIError(
        `Failed to get bot screenshot: ${error.message}`,
        'SCREENSHOT_FETCH_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Diagnose bot issues and provide troubleshooting recommendations
   */
  async diagnoseBotIssues(botId: string): Promise<{
    botId: string;
    status: string;
    hasIssues: boolean;
    issues: Array<{
      type: 'fatal' | 'warning' | 'info';
      code: string;
      sub_code: string | null;
      message: string;
      recommendation: string;
      timestamp: string;
    }>;
    recommendations: string[];
    explorerUrl: string;
  }> {
    try {
      const botStatus = await this.getBotStatus(botId);
      const issues: Array<{
        type: 'fatal' | 'warning' | 'info';
        code: string;
        sub_code: string | null;
        message: string;
        recommendation: string;
        timestamp: string;
      }> = [];
      const recommendations: string[] = [];

      // Analyze status changes for issues
      for (const statusChange of botStatus.statusChanges) {
        if (statusChange.code === 'fatal') {
          const issue = this.analyzeFatalError(statusChange);
          issues.push(issue);
          recommendations.push(issue.recommendation);
        } else if (statusChange.code === 'call_ended') {
          const issue = this.analyzeCallEndedStatus(statusChange);
          issues.push(issue);
          recommendations.push(issue.recommendation);
        } else if (this.isWarningStatus(statusChange.code)) {
          const issue = this.analyzeWarningStatus(statusChange);
          issues.push(issue);
          recommendations.push(issue.recommendation);
        }
      }

      // Generate explorer URL for manual debugging
      const region = process.env.RECALL_AI_BASE_URL?.includes('us-west-2')
        ? 'us-west-2'
        : 'us-east-1';
      const explorerUrl = `https://${region}.recall.ai/dashboard/explorer/bot/${botId}`;

      const diagnosis = {
        botId,
        status: botStatus.status,
        hasIssues: issues.length > 0,
        issues,
        recommendations: [...new Set(recommendations)], // Remove duplicates
        explorerUrl,
      };

      logger.info('Bot diagnosis completed', {
        botId,
        hasIssues: diagnosis.hasIssues,
        issuesCount: issues.length,
        recommendationsCount: diagnosis.recommendations.length,
      });

      return diagnosis;
    } catch (error: any) {
      logger.error('Failed to diagnose bot issues', {
        botId,
        error: error.message,
      });

      throw new RecallAIError(
        `Failed to diagnose bot issues: ${error.message}`,
        'DIAGNOSIS_FAILED',
        500
      );
    }
  }

  /**
   * Analyze fatal error and provide recommendations
   */
  private analyzeFatalError(statusChange: any): {
    type: 'fatal';
    code: string;
    sub_code: string | null;
    message: string;
    recommendation: string;
    timestamp: string;
  } {
    const subCode = statusChange.sub_code;
    let recommendation = 'Contact Recall.ai support for assistance.';

    // Comprehensive sub-code mapping based on Recall.ai documentation
    const recommendations: Record<string, string> = {
      // General fatal errors
      bot_errored: 'The bot ran into an unexpected error. Try recreating the bot.',
      meeting_not_found:
        'No meeting was found at the given link. Verify the meeting URL is correct.',
      meeting_not_started: 'The meeting has not started yet. Wait for the meeting to begin.',
      meeting_requires_registration:
        'The meeting requires registration. Ensure bot is joining from an allowed webinar URL.',
      meeting_requires_sign_in:
        'The meeting requires sign-in. Configure authenticated bot credentials.',
      meeting_link_expired: 'The meeting link has expired. Generate a new meeting link.',
      meeting_link_invalid: 'The meeting does not exist or the link is invalid.',
      meeting_password_incorrect: 'The meeting password is incorrect.',
      meeting_locked: 'The meeting is locked. Ask the host to unlock the meeting.',
      meeting_full: 'The meeting is full. Wait for participants to leave or create a new meeting.',
      meeting_ended: 'The meeting has already ended and can no longer be joined.',
      failed_to_launch_in_time: 'The bot took too long to launch. Re-run the Create Bot endpoint.',

      // Zoom-specific fatal errors
      zoom_sdk_credentials_missing:
        'Zoom SDK credentials are not configured. Set up Zoom credentials in Recall dashboard.',
      zoom_sdk_update_required: 'A newer version of the Zoom SDK is required.',
      zoom_sdk_app_not_published: 'Zoom SDK credentials have not been approved by Zoom.',
      zoom_email_blocked_by_admin:
        'The Zoom account has been disallowed by the workspace administrator.',
      zoom_registration_required: 'Registration is required for this Zoom meeting.',
      zoom_captcha_required: 'Captcha is required for this Zoom meeting.',
      zoom_account_blocked:
        'The account has been blocked by Zoom. Generate ZAK token from a different account.',
      zoom_invalid_join_token:
        'Zoom SDK rejected the join token. Check token validity and permissions.',
      zoom_invalid_signature: 'Zoom SDK could not generate a valid meeting-join signature.',
      zoom_internal_error: 'Internal Zoom error occurred.',
      zoom_join_timeout: 'Request to join Zoom meeting timed out.',
      zoom_email_required: 'Email is required to join this Zoom meeting.',
      zoom_web_disallowed:
        'Host has disallowed joining from web. Disable E2E encryption or use Native bot.',
      zoom_connection_failed: 'Failed to join due to Zoom server error.',
      zoom_error_multiple_device_join:
        'Another participant with same credentials joined the meeting.',
      zoom_meeting_not_accessible: 'Meeting not accessible due to country restrictions.',
      zoom_meeting_host_inactive: 'Meeting host has been disabled or restricted.',
      zoom_invalid_webinar_invite: 'Invalid Zoom webinar invite. Check password and tokens.',
      zoom_another_meeting_in_progress: 'Host has another meeting in progress.',

      // Google Meet-specific fatal errors
      google_meet_internal_error: 'Google Meet internal issue occurred.',
      google_meet_sign_in_failed: 'Bot was not able to sign in to Google.',
      google_meet_sign_in_captcha_failed: 'Bot could not sign in due to captcha.',
      google_meet_bot_blocked: 'Bot was disallowed from joining the meeting.',
      google_meet_sso_sign_in_failed: 'Bot could not sign in with SSO.',
      google_meet_sign_in_missing_login_credentials:
        'Login credentials not configured for authenticated bot.',
      google_meet_sign_in_missing_recovery_credentials: 'Recovery credentials not configured.',
      google_meet_sso_sign_in_missing_login_credentials: 'SSO login credentials not configured.',
      google_meet_sso_sign_in_missing_totp_secret: 'TOTP secret missing from password.',
      google_meet_video_error: 'Google Meet video error occurred.',
      google_meet_meeting_room_not_ready: 'Meeting room was not ready.',
      google_meet_login_not_available: 'Not enough available Google logins.',
      google_meet_permission_denied_breakout: 'Bot tried to join active breakout room.',
      google_meet_knocking_disabled: 'Host has disabled knocking to join meeting.',
      google_meet_watermark_kicked: 'Watermark feature enabled and bot was not signed in.',

      // Microsoft Teams-specific fatal errors
      microsoft_teams_sign_in_credentials_missing: 'Teams sign-in credentials not configured.',
      microsoft_teams_call_dropped: 'Call dropped error from MS Teams.',
      microsoft_teams_sign_in_failed: 'Failed to sign in to Microsoft account.',
      microsoft_teams_internal_error: 'Microsoft Teams server error occurred.',
      microsoft_teams_captcha_error: 'Captcha enabled for anonymous participants.',
      microsoft_teams_bot_not_invited: 'Bot was not invited to the meeting.',
      microsoft_teams_breakout_room_unsupported: 'Bot was moved to unsupported breakout room.',
      microsoft_teams_event_not_started_for_external:
        'External participants cannot join before event begins.',
      microsoft_teams_2fa_required: '2FA is configured on signed-in Teams bot.',

      // Webex-specific fatal errors
      webex_join_meeting_error: 'Failed to join Webex meeting. Check credentials setup.',
    };

    if (subCode && recommendations[subCode]) {
      recommendation = recommendations[subCode];
    }

    return {
      type: 'fatal',
      code: statusChange.code,
      sub_code: subCode,
      message: statusChange.message || `Fatal error: ${subCode || 'Unknown error'}`,
      recommendation,
      timestamp: statusChange.created_at,
    };
  }

  /**
   * Analyze warning status and provide recommendations
   */
  private analyzeWarningStatus(statusChange: any): {
    type: 'warning';
    code: string;
    sub_code: string | null;
    message: string;
    recommendation: string;
    timestamp: string;
  } {
    let recommendation = 'Monitor the bot status for any further issues.';

    const recommendations: Record<string, string> = {
      in_waiting_room: 'The bot is in the waiting room. Ask the host to admit the bot.',
      in_call_not_recording:
        'The bot joined the call but is not recording. Check recording permissions.',
      recording_paused: 'Recording was paused. Check if recording was manually stopped.',
      low_audio_quality: 'Audio quality is low. Check microphone settings and network connection.',
      transcription_delayed: 'Transcription is delayed. This is normal for long meetings.',
    };

    if (recommendations[statusChange.code]) {
      recommendation = recommendations[statusChange.code];
    }

    return {
      type: 'warning',
      code: statusChange.code,
      sub_code: statusChange.sub_code,
      message: statusChange.message || `Warning: ${statusChange.code}`,
      recommendation,
      timestamp: statusChange.created_at,
    };
  }

  /**
   * Analyze call ended status and provide recommendations
   */
  private analyzeCallEndedStatus(statusChange: any): {
    type: 'info';
    code: string;
    sub_code: string | null;
    message: string;
    recommendation: string;
    timestamp: string;
  } {
    const subCode = statusChange.sub_code;
    let recommendation = 'Bot call ended normally.';

    // Comprehensive call-ended sub-code mapping
    const recommendations: Record<string, string> = {
      call_ended_by_host: 'The call was ended by the meeting host.',
      call_ended_by_platform_idle: 'The call was ended by the platform due to inactivity.',
      call_ended_by_platform_max_length:
        'The call reached the maximum meeting length (e.g., 40 minutes on free Zoom).',
      call_ended_by_platform_waiting_room_timeout:
        'Bot could not join due to platform waiting room timeout (Google Meet: 10 minutes).',
      timeout_exceeded_waiting_room:
        'Bot left due to waiting room timeout (automatic_leave.waiting_room_timeout).',
      timeout_exceeded_noone_joined: 'Bot left because nobody joined the call.',
      timeout_exceeded_everyone_left: 'Bot left because everyone else left the call.',
      timeout_exceeded_silence_detected: 'Bot left due to continuous silence detection.',
      timeout_exceeded_only_bots_detected_using_participant_names:
        'Bot left because only bots detected by name patterns.',
      timeout_exceeded_only_bots_detected_using_participant_events:
        'Bot left because only bots detected by activity patterns.',
      timeout_exceeded_in_call_not_recording: 'Bot left because it never started recording.',
      timeout_exceeded_in_call_recording: 'Bot exceeded maximum recording duration.',
      timeout_exceeded_recording_permission_denied: 'Bot left due to recording permission timeout.',
      timeout_exceeded_max_duration: 'Bot exceeded maximum duration (pay-as-you-go).',
      bot_kicked_from_call: 'Bot was removed from the call by the host.',
      bot_kicked_from_waiting_room: 'Bot was removed from the waiting room by the host.',
      bot_received_leave_call: 'Bot received a leave call request.',
      timeout_exceeded_only_bots_in_call:
        'Bot left because only bot participants remained in the call.',
    };

    if (subCode && recommendations[subCode]) {
      recommendation = recommendations[subCode];
    }

    return {
      type: 'info',
      code: statusChange.code,
      sub_code: subCode,
      message: statusChange.message || `Call ended: ${subCode || 'Unknown reason'}`,
      recommendation,
      timestamp: statusChange.created_at,
    };
  }

  /**
   * Check if a status code indicates a warning
   */
  private isWarningStatus(code: string): boolean {
    const warningStatuses = [
      'in_waiting_room',
      'in_call_not_recording',
      'recording_paused',
      'low_audio_quality',
      'transcription_delayed',
    ];
    return warningStatuses.includes(code);
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
        status: error.response?.status,
      });
      return false;
    }
  }

  /**
   * Create bot for scheduled calendar meeting
   */
  async createBotForScheduledMeeting(
    meetingUrl: string,
    meetingTitle: string,
    clientId: string,
    teamId?: string,
    scheduledTime?: Date
  ): Promise<RecallBot> {
    try {
      const botName = `Qylon Bot - ${meetingTitle} - ${new Date().toISOString()}`;
      const webhookUrl = `${process.env.API_GATEWAY_URL}/api/v1/meeting-intelligence/webhooks/recall-ai`;

      // Determine if this should be a scheduled bot (>=10 minutes in advance)
      const isScheduled = scheduledTime && scheduledTime.getTime() - Date.now() >= 10 * 60 * 1000;

      const bot = await this.createBot(meetingUrl, botName, {
        clientId,
        teamId,
        autoStart: true,
        transcriptionProvider: 'meeting_captions', // Use meeting captions for better accuracy
        language: 'en',
        webhookUrl,
        joinAt: isScheduled ? scheduledTime : undefined,
        automaticLeave: {
          silenceDetection: {
            timeout: 3600, // 60 minutes of silence
            activateAfter: 1200, // 20 minutes buffer
          },
          botDetection: {
            usingParticipantNames: {
              matches: ['bot', 'notetaker', 'qylon', 'recall'],
              timeout: 600, // 10 minutes
              activateAfter: 1200, // 20 minutes buffer
            },
          },
          everyoneLeftTimeout: {
            timeout: 2, // 2 seconds after everyone leaves
            activateAfter: 0,
          },
          waitingRoomTimeout: 1200, // 20 minutes in waiting room
          nooneJoinedTimeout: 1200, // 20 minutes if no one joins
          inCallNotRecordingTimeout: 3600, // 60 minutes without recording
          recordingPermissionDeniedTimeout: 30, // 30 seconds after permission denied
        },
        recordingConfig: {
          videoMixedMp4: true,
          participantEvents: true,
          meetingMetadata: true,
          audioMixedRaw: false,
          videoMixedLayout: 'speaker_view',
          videoMixedParticipantVideoWhenScreenshare: 'overlap',
          startRecordingOn: 'participant_join',
          includeBotInRecording: {
            audio: false,
            video: false,
          },
        },
      });

      logger.info('Bot created for scheduled meeting', {
        botId: bot.id,
        meetingTitle,
        clientId,
        teamId,
        scheduledTime,
      });

      return bot;
    } catch (error: any) {
      logger.error('Failed to create bot for scheduled meeting', {
        meetingUrl,
        meetingTitle,
        clientId,
        teamId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Create bot for on-the-fly meeting
   */
  async createBotForOnTheFlyMeeting(
    meetingUrl: string,
    clientId: string,
    teamId?: string,
    hostName?: string
  ): Promise<RecallBot> {
    try {
      const botName = `Qylon Bot - On-the-fly - ${hostName || 'Unknown Host'} - ${new Date().toISOString()}`;
      const webhookUrl = `${process.env.API_GATEWAY_URL}/api/v1/meeting-intelligence/webhooks/recall-ai`;

      // On-the-fly meetings are always ad-hoc (no join_at parameter)
      const bot = await this.createBot(meetingUrl, botName, {
        clientId,
        teamId,
        autoStart: true,
        transcriptionProvider: 'meeting_captions', // Use meeting captions for better accuracy
        language: 'en',
        webhookUrl,
        automaticLeave: {
          silenceDetection: {
            timeout: 1800, // 30 minutes of silence (shorter for on-the-fly)
            activateAfter: 600, // 10 minutes buffer
          },
          botDetection: {
            usingParticipantNames: {
              matches: ['bot', 'notetaker', 'qylon', 'recall'],
              timeout: 300, // 5 minutes (shorter for on-the-fly)
              activateAfter: 600, // 10 minutes buffer
            },
          },
          everyoneLeftTimeout: {
            timeout: 2, // 2 seconds after everyone leaves
            activateAfter: 0,
          },
          waitingRoomTimeout: 600, // 10 minutes in waiting room (shorter for on-the-fly)
          nooneJoinedTimeout: 600, // 10 minutes if no one joins
          inCallNotRecordingTimeout: 1800, // 30 minutes without recording
          recordingPermissionDeniedTimeout: 30, // 30 seconds after permission denied
        },
        recordingConfig: {
          videoMixedMp4: true,
          participantEvents: true,
          meetingMetadata: true,
          audioMixedRaw: false,
          videoMixedLayout: 'speaker_view',
          videoMixedParticipantVideoWhenScreenshare: 'overlap',
          startRecordingOn: 'participant_join',
          includeBotInRecording: {
            audio: false,
            video: false,
          },
        },
      });

      logger.info('Bot created for on-the-fly meeting', {
        botId: bot.id,
        clientId,
        teamId,
        hostName,
      });

      return bot;
    } catch (error: any) {
      logger.error('Failed to create bot for on-the-fly meeting', {
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
   * Bulk create bots for multiple meetings
   */
  async createBotsForMeetings(
    meetings: Array<{
      meetingUrl: string;
      title: string;
      clientId: string;
      teamId?: string;
      scheduledTime?: Date;
    }>
  ): Promise<Array<{ meeting: any; bot: RecallBot | null; error?: string }>> {
    const results = await Promise.allSettled(
      meetings.map(async meeting => {
        try {
          const bot = await this.createBotForScheduledMeeting(
            meeting.meetingUrl,
            meeting.title,
            meeting.clientId,
            meeting.teamId,
            meeting.scheduledTime
          );
          return { meeting, bot };
        } catch (error: any) {
          return {
            meeting,
            bot: null,
            error: error.message,
          };
        }
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          meeting: meetings[index],
          bot: null,
          error: result.reason?.message || 'Unknown error',
        };
      }
    });
  }

  /**
   * Get bots for a specific client
   */
  async getBotsForClient(clientId: string): Promise<RecallBot[]> {
    try {
      // Note: This would require implementing a bot tracking system
      // since Recall.ai doesn't provide direct client-based filtering
      logger.info('Getting bots for client', { clientId });

      // This is a placeholder - you'd need to implement bot tracking in your database
      // and query based on the metadata stored when bots were created
      return [];
    } catch (error: any) {
      logger.error('Failed to get bots for client', {
        clientId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Cleanup inactive bots for a client
   */
  async cleanupInactiveBots(clientId: string, olderThanHours: number = 24): Promise<number> {
    try {
      const bots = await this.getBotsForClient(clientId);
      const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

      let deletedCount = 0;

      for (const bot of bots) {
        if (bot.created_at < cutoffTime) {
          try {
            await this.deleteBot(bot.id);
            deletedCount++;
            logger.info('Cleaned up inactive bot', {
              botId: bot.id,
              clientId,
              createdAt: bot.created_at,
            });
          } catch (error: any) {
            logger.warn('Failed to delete inactive bot', {
              botId: bot.id,
              clientId,
              error: error.message,
            });
          }
        }
      }

      logger.info('Bot cleanup completed', {
        clientId,
        deletedCount,
        olderThanHours,
      });

      return deletedCount;
    } catch (error: any) {
      logger.error('Failed to cleanup inactive bots', {
        clientId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Pause bot recording
   */
  async pauseRecording(botId: string): Promise<void> {
    try {
      await this.client.post(`/bot/${botId}/pause_recording`);

      logger.info('Bot recording paused', {
        botId,
      });
    } catch (error: any) {
      logger.error('Failed to pause bot recording', {
        botId,
        error: error.message,
        status: error.response?.status,
      });

      throw new RecallAIError(
        `Failed to pause recording: ${error.message}`,
        'PAUSE_RECORDING_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Resume bot recording
   */
  async resumeRecording(botId: string): Promise<void> {
    try {
      await this.client.post(`/bot/${botId}/resume_recording`);

      logger.info('Bot recording resumed', {
        botId,
      });
    } catch (error: any) {
      logger.error('Failed to resume bot recording', {
        botId,
        error: error.message,
        status: error.response?.status,
      });

      throw new RecallAIError(
        `Failed to resume recording: ${error.message}`,
        'RESUME_RECORDING_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Start bot recording
   */
  async startRecording(botId: string): Promise<void> {
    try {
      await this.client.post(`/bot/${botId}/start_recording`);

      logger.info('Bot recording started', {
        botId,
      });
    } catch (error: any) {
      logger.error('Failed to start bot recording', {
        botId,
        error: error.message,
        status: error.response?.status,
      });

      throw new RecallAIError(
        `Failed to start recording: ${error.message}`,
        'START_RECORDING_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Stop bot recording
   */
  async stopRecording(botId: string): Promise<void> {
    try {
      await this.client.post(`/bot/${botId}/stop_recording`);

      logger.info('Bot recording stopped', {
        botId,
      });
    } catch (error: any) {
      logger.error('Failed to stop bot recording', {
        botId,
        error: error.message,
        status: error.response?.status,
      });

      throw new RecallAIError(
        `Failed to stop recording: ${error.message}`,
        'STOP_RECORDING_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Get recording status
   */
  async getRecordingStatus(botId: string): Promise<{
    botId: string;
    isRecording: boolean;
    recordingStatus: string;
    recordings: Array<{
      id: string;
      status: string;
      startedAt?: string;
      completedAt?: string;
    }>;
  }> {
    try {
      const response = await this.client.get(`/bot/${botId}`);
      const bot = response.data;

      const recordings = bot.recordings || [];
      const isRecording = bot.status === 'in_call_recording';
      const recordingStatus = bot.status;

      logger.info('Recording status retrieved', {
        botId,
        isRecording,
        recordingStatus,
        recordingsCount: recordings.length,
      });

      return {
        botId,
        isRecording,
        recordingStatus,
        recordings: recordings.map((recording: any) => ({
          id: recording.id,
          status: recording.status?.code || 'unknown',
          startedAt: recording.started_at,
          completedAt: recording.completed_at,
        })),
      };
    } catch (error: any) {
      logger.error('Failed to get recording status', {
        botId,
        error: error.message,
        status: error.response?.status,
      });

      throw new RecallAIError(
        `Failed to get recording status: ${error.message}`,
        'RECORDING_STATUS_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Get separate video per participant (async)
   */
  async getSeparateVideos(recordingId: string): Promise<
    Array<{
      id: string;
      recording: {
        id: string;
        metadata: any;
      };
      created_at: string;
      status: {
        code: string;
        sub_code: string | null;
        updated_at: string;
      };
      metadata: any;
      data: {
        download_url: string;
      };
      format: string;
    }>
  > {
    try {
      const response = await this.client.get(`/video_separate?recording_id=${recordingId}`);
      const separateVideos = response.data.results || [];

      logger.info('Separate videos retrieved', {
        recordingId,
        videosCount: separateVideos.length,
      });

      return separateVideos.map((video: any) => ({
        id: video.id,
        recording: {
          id: video.recording.id,
          metadata: video.recording.metadata,
        },
        created_at: video.created_at,
        status: {
          code: video.status.code,
          sub_code: video.status.sub_code,
          updated_at: video.status.updated_at,
        },
        metadata: video.metadata,
        data: {
          download_url: video.data.download_url,
        },
        format: video.format,
      }));
    } catch (error: any) {
      logger.error('Failed to get separate videos', {
        recordingId,
        error: error.message,
        status: error.response?.status,
      });

      throw new RecallAIError(
        `Failed to get separate videos: ${error.message}`,
        'SEPARATE_VIDEOS_FETCH_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Get separate video parts (participant data)
   */
  async getSeparateVideoParts(separateVideoData: any): Promise<
    Array<{
      participant: {
        id: number;
        name: string | null;
        is_host: boolean;
        platform: string | null;
        extra_data: any;
      };
      download_url: string;
      timestamp: {
        relative: number;
        absolute: string;
      };
      type: 'webcam' | 'screenshare';
    }>
  > {
    try {
      const videos = separateVideoData.results || [];
      const videoParts = [];

      for (const video of videos) {
        const response = await fetch(video.data.download_url);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const videoData = await response.json();
        videoParts.push(videoData);
      }

      logger.info('Separate video parts retrieved', {
        videosCount: videos.length,
        partsCount: videoParts.length,
      });

      return videoParts as Array<{
        participant: {
          id: number;
          name: string | null;
          is_host: boolean;
          platform: string | null;
          extra_data: any;
        };
        download_url: string;
        timestamp: {
          relative: number;
          absolute: string;
        };
        type: 'webcam' | 'screenshare';
      }>;
    } catch (error: any) {
      logger.error('Failed to get separate video parts', {
        error: error.message,
      });

      throw new RecallAIError(
        `Failed to get separate video parts: ${error.message}`,
        'SEPARATE_VIDEO_PARTS_FETCH_FAILED',
        500
      );
    }
  }

  /**
   * Get separate audio per participant (async)
   */
  async getSeparateAudios(recordingId: string): Promise<
    Array<{
      id: string;
      recording: {
        id: string;
        metadata: any;
      };
      created_at: string;
      status: {
        code: string;
        sub_code: string | null;
        updated_at: string;
      };
      metadata: any;
      data: {
        download_url: string;
      };
      format: string;
    }>
  > {
    try {
      const response = await this.client.get(`/audio_separate?recording_id=${recordingId}`);
      const separateAudios = response.data.results || [];

      logger.info('Separate audios retrieved', {
        recordingId,
        audiosCount: separateAudios.length,
      });

      return separateAudios.map((audio: any) => ({
        id: audio.id,
        recording: {
          id: audio.recording.id,
          metadata: audio.recording.metadata,
        },
        created_at: audio.created_at,
        status: {
          code: audio.status.code,
          sub_code: audio.status.sub_code,
          updated_at: audio.status.updated_at,
        },
        metadata: audio.metadata,
        data: {
          download_url: audio.data.download_url,
        },
        format: audio.format,
      }));
    } catch (error: any) {
      logger.error('Failed to get separate audios', {
        recordingId,
        error: error.message,
        status: error.response?.status,
      });

      throw new RecallAIError(
        `Failed to get separate audios: ${error.message}`,
        'SEPARATE_AUDIOS_FETCH_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Get separate audio parts (participant data)
   */
  async getSeparateAudioParts(separateAudioData: any): Promise<
    Array<{
      participant: {
        id: number;
        name: string | null;
        is_host: boolean;
        platform: string | null;
        extra_data: any;
      };
      download_url: string;
      timestamp: {
        relative: number;
        absolute: string;
      };
    }>
  > {
    try {
      const audios = separateAudioData.results || [];
      const audioParts = [];

      for (const audio of audios) {
        const response = await fetch(audio.data.download_url);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const audioData = await response.json();
        audioParts.push(audioData);
      }

      logger.info('Separate audio parts retrieved', {
        audiosCount: audios.length,
        partsCount: audioParts.length,
      });

      return audioParts as Array<{
        participant: {
          id: number;
          name: string | null;
          is_host: boolean;
          platform: string | null;
          extra_data: any;
        };
        download_url: string;
        timestamp: {
          relative: number;
          absolute: string;
        };
      }>;
    } catch (error: any) {
      logger.error('Failed to get separate audio parts', {
        error: error.message,
      });

      throw new RecallAIError(
        `Failed to get separate audio parts: ${error.message}`,
        'SEPARATE_AUDIO_PARTS_FETCH_FAILED',
        500
      );
    }
  }

  /**
   * Create async transcript for a recording
   */
  async createAsyncTranscript(
    recordingId: string,
    provider: any,
    diarization?: any
  ): Promise<{
    id: string;
    recording: {
      id: string;
      metadata: any;
    };
    created_at: string;
    expires_at: string;
    status: {
      code: string;
      sub_code: string | null;
      updated_at: string;
    };
    data: {
      download_url: string;
    };
    diarization: any;
    metadata: any;
    provider: any;
  }> {
    try {
      const requestBody: any = {
        provider,
      };

      if (diarization) {
        requestBody.diarization = diarization;
      }

      const response = await this.client.post(
        `/recording/${recordingId}/create_transcript`,
        requestBody
      );
      const transcript = response.data;

      logger.info('Async transcript created', {
        recordingId,
        transcriptId: transcript.id,
        provider: Object.keys(provider)[0],
      });

      return {
        id: transcript.id,
        recording: {
          id: transcript.recording.id,
          metadata: transcript.recording.metadata,
        },
        created_at: transcript.created_at,
        expires_at: transcript.expires_at,
        status: {
          code: transcript.status.code,
          sub_code: transcript.status.sub_code,
          updated_at: transcript.status.updated_at,
        },
        data: {
          download_url: transcript.data.download_url,
        },
        diarization: transcript.diarization,
        metadata: transcript.metadata,
        provider: transcript.provider,
      };
    } catch (error: any) {
      logger.error('Failed to create async transcript', {
        recordingId,
        error: error.message,
        status: error.response?.status,
      });

      throw new RecallAIError(
        `Failed to create async transcript: ${error.message}`,
        'ASYNC_TRANSCRIPT_CREATE_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Get transcript by ID
   */
  async getTranscript(transcriptId: string): Promise<{
    id: string;
    recording: {
      id: string;
      source: {
        bot: {
          id: string;
        };
      };
    };
    created_at: string;
    expires_at: string;
    status: {
      code: string;
      sub_code: string | null;
      updated_at: string;
    };
    data: {
      download_url: string;
    };
    diarization: any;
    metadata: any;
    provider: any;
  }> {
    try {
      const response = await this.client.get(`/transcript/${transcriptId}`);
      const transcript = response.data;

      logger.info('Transcript retrieved', {
        transcriptId,
        status: transcript.status.code,
      });

      return {
        id: transcript.id,
        recording: {
          id: transcript.recording.id,
          source: {
            bot: {
              id: transcript.recording.source.bot.id,
            },
          },
        },
        created_at: transcript.created_at,
        expires_at: transcript.expires_at,
        status: {
          code: transcript.status.code,
          sub_code: transcript.status.sub_code,
          updated_at: transcript.status.updated_at,
        },
        data: {
          download_url: transcript.data.download_url,
        },
        diarization: transcript.diarization,
        metadata: transcript.metadata,
        provider: transcript.provider,
      };
    } catch (error: any) {
      logger.error('Failed to get transcript', {
        transcriptId,
        error: error.message,
        status: error.response?.status,
      });

      throw new RecallAIError(
        `Failed to get transcript: ${error.message}`,
        'TRANSCRIPT_FETCH_FAILED',
        error.response?.status || 500
      );
    }
  }

  /**
   * Download transcript data
   */
  async downloadTranscript(downloadUrl: string): Promise<
    Array<{
      participant: {
        id: number;
        name: string | null;
        is_host: boolean;
        platform: string | null;
        extra_data: any;
      };
      words: Array<{
        text: string;
        start_timestamp: {
          relative: number;
          absolute: string;
        };
        end_timestamp: {
          relative: number;
          absolute: string;
        } | null;
      }>;
    }>
  > {
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const transcriptData = await response.json();

      logger.info('Transcript downloaded', {
        participantsCount: Array.isArray(transcriptData) ? transcriptData.length : 0,
      });

      return transcriptData as Array<{
        participant: {
          id: number;
          name: string | null;
          is_host: boolean;
          platform: string | null;
          extra_data: any;
        };
        words: Array<{
          text: string;
          start_timestamp: {
            relative: number;
            absolute: string;
          };
          end_timestamp: {
            relative: number;
            absolute: string;
          } | null;
        }>;
      }>;
    } catch (error: any) {
      logger.error('Failed to download transcript', {
        downloadUrl,
        error: error.message,
      });

      throw new RecallAIError(
        `Failed to download transcript: ${error.message}`,
        'TRANSCRIPT_DOWNLOAD_FAILED',
        500
      );
    }
  }
}
