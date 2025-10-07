import { createClient } from '@supabase/supabase-js';
import { Request, Response, Router } from 'express';
import { EventBusService } from '../services/EventBusService';
import { logger } from '../utils/logger';

const router: Router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const eventBusService = new EventBusService();

/**
 * Handle Recall.ai webhook events
 */
router.post(
  '/recall-ai',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const event = req.body;

      logger.info('Received Recall.ai webhook event', {
        eventType: event.event_type,
        botId: event.bot_id,
        meetingId: event.meeting_id,
        timestamp: new Date().toISOString()
      });

      // Verify webhook signature if configured
      if (process.env.RECALL_AI_WEBHOOK_SECRET) {
        const rawBody = JSON.stringify(event);
        if (!verifyWebhookSignature(rawBody, req.headers)) {
          logger.warn('Invalid webhook signature', {
            headers: req.headers,
            hasSecret: !!process.env.RECALL_AI_WEBHOOK_SECRET
          });
          res.status(401).json({ error: 'Invalid signature' });
          return;
        }
      }

      // Process different event types
      switch (event.event_type) {
        case 'bot.joining_call':
          await handleBotJoiningCall(event);
          break;
        case 'bot.in_waiting_room':
          await handleBotInWaitingRoom(event);
          break;
        case 'bot.in_call_not_recording':
          await handleBotInCallNotRecording(event);
          break;
        case 'bot.recording_permission_allowed':
          await handleRecordingPermissionAllowed(event);
          break;
        case 'bot.recording_permission_denied':
          await handleRecordingPermissionDenied(event);
          break;
        case 'bot.in_call_recording':
          await handleBotInCallRecording(event);
          break;
        case 'bot.call_ended':
          await handleBotCallEnded(event);
          break;
        case 'bot.done':
          await handleBotDone(event);
          break;
        case 'bot.fatal':
          await handleBotFatal(event);
          break;
        case 'transcript.data':
          await handleTranscriptData(event);
          break;
        case 'transcript.partial_data':
          await handleTranscriptPartialData(event);
          break;
        case 'transcript.done':
          await handleTranscriptDone(event);
          break;
        case 'transcript.failed':
          await handleTranscriptFailed(event);
          break;
        case 'audio_separate_raw.data':
          await handleAudioSeparateData(event);
          break;
        case 'video_separate_png.data':
          await handleVideoSeparatePngData(event);
          break;
        case 'video_separate_h264.data':
          await handleVideoSeparateH264Data(event);
          break;
        case 'recording.started':
          await handleRecordingStarted(event);
          break;
        case 'recording.stopped':
          await handleRecordingStopped(event);
          break;
        case 'transcription.completed':
          await handleTranscriptionCompleted(event);
          break;
        default:
          logger.info('Unhandled webhook event type', { eventType: event.event_type });
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      logger.error('Failed to process Recall.ai webhook', {
        error: error.message,
        body: req.body
      });
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

/**
 * Handle bot joined call event
 */
async function handleBotJoinedCall(event: any): Promise<void> {
  try {
    const { bot_id, meeting_id, meeting_url } = event;

    // Update meeting status to recording
    const { error } = await supabase
      .from('meetings')
      .update({
        status: 'recording',
        processing_started_at: new Date().toISOString()
      })
      .eq('metadata->>recall_bot_id', bot_id);

    if (error) {
      throw new Error(`Failed to update meeting status: ${error.message}`);
    }

    logger.info('Bot joined call - meeting status updated', {
      botId: bot_id,
      meetingId: meeting_id,
      meetingUrl: meeting_url
    });
  } catch (error: any) {
    logger.error('Failed to handle bot joined call event', {
      event,
      error: error.message
    });
  }
}

/**
 * Handle bot left call event
 */
async function handleBotLeftCall(event: any): Promise<void> {
  try {
    const { bot_id, meeting_id } = event;

    // Update meeting status to processing
    const { error } = await supabase
      .from('meetings')
      .update({
        status: 'processing',
        end_time: new Date().toISOString()
      })
      .eq('metadata->>recall_bot_id', bot_id);

    if (error) {
      throw new Error(`Failed to update meeting status: ${error.message}`);
    }

    logger.info('Bot left call - meeting status updated', {
      botId: bot_id,
      meetingId: meeting_id
    });
  } catch (error: any) {
    logger.error('Failed to handle bot left call event', {
      event,
      error: error.message
    });
  }
}

/**
 * Handle recording started event
 */
async function handleRecordingStarted(event: any): Promise<void> {
  try {
    const { bot_id, recording_id } = event;

    // Update meeting with recording information
    const { error } = await supabase
      .from('meetings')
      .update({
        metadata: {
          recall_bot_id: bot_id,
          recall_recording_id: recording_id,
          recording_started_at: new Date().toISOString()
        }
      })
      .eq('metadata->>recall_bot_id', bot_id);

    if (error) {
      throw new Error(`Failed to update meeting with recording info: ${error.message}`);
    }

    logger.info('Recording started - meeting updated', {
      botId: bot_id,
      recordingId: recording_id
    });
  } catch (error: any) {
    logger.error('Failed to handle recording started event', {
      event,
      error: error.message
    });
  }
}

/**
 * Handle recording stopped event
 */
async function handleRecordingStopped(event: any): Promise<void> {
  try {
    const { bot_id, recording_id, recording_url } = event;

    // Update meeting with recording URL
    const { error } = await supabase
      .from('meetings')
      .update({
        raw_audio_url: recording_url,
        metadata: {
          recall_bot_id: bot_id,
          recall_recording_id: recording_id,
          recording_stopped_at: new Date().toISOString()
        }
      })
      .eq('metadata->>recall_bot_id', bot_id);

    if (error) {
      throw new Error(`Failed to update meeting with recording URL: ${error.message}`);
    }

    logger.info('Recording stopped - meeting updated', {
      botId: bot_id,
      recordingId: recording_id,
      recordingUrl: recording_url
    });
  } catch (error: any) {
    logger.error('Failed to handle recording stopped event', {
      event,
      error: error.message
    });
  }
}

/**
 * Handle transcription completed event
 */
async function handleTranscriptionCompleted(event: any): Promise<void> {
  try {
    const { bot_id, recording_id, transcript_url } = event;

    // Get meeting information for event publishing
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('metadata->>recall_bot_id', bot_id)
      .single();

    if (meetingError || !meeting) {
      throw new Error(`Failed to get meeting for bot ${bot_id}: ${meetingError?.message}`);
    }

    // Update meeting with transcription information
    const { error } = await supabase
      .from('meetings')
      .update({
        status: 'completed',
        processing_completed_at: new Date().toISOString(),
        metadata: {
          recall_bot_id: bot_id,
          recall_recording_id: recording_id,
          transcript_url: transcript_url,
          transcription_completed_at: new Date().toISOString()
        }
      })
      .eq('metadata->>recall_bot_id', bot_id);

    if (error) {
      throw new Error(`Failed to update meeting with transcription: ${error.message}`);
    }

    // Publish meeting completed event to Event Bus
    await eventBusService.publishMeetingEvent(
      'meeting.completed',
      meeting.id,
      {
        meeting_id: meeting.id,
        client_id: meeting.client_id,
        bot_id: bot_id,
        recording_id: recording_id,
        transcript_url: transcript_url,
        meeting_data: meeting,
        completed_at: new Date().toISOString()
      },
      meeting.client_id, // Using client_id as userId for now
      `meeting_${meeting.id}`,
      `transcription_${recording_id}`
    );

    // Publish transcription completed event
    await eventBusService.publishTranscriptionEvent(
      'transcription.completed',
      recording_id,
      {
        transcript_id: recording_id,
        meeting_id: meeting.id,
        bot_id: bot_id,
        transcript_url: transcript_url,
        completed_at: new Date().toISOString()
      },
      meeting.client_id,
      `meeting_${meeting.id}`,
      `transcription_${recording_id}`
    );

    logger.info('Transcription completed - meeting updated and events published', {
      botId: bot_id,
      recordingId: recording_id,
      transcriptUrl: transcript_url,
      meetingId: meeting.id
    });
  } catch (error: any) {
    logger.error('Failed to handle transcription completed event', {
      event,
      error: error.message
    });
  }
}

/**
 * Handle bot error event with detailed troubleshooting
 */
async function handleBotError(event: any): Promise<void> {
  try {
    const { bot_id, error_message, error_code, sub_code } = event;

    // Get detailed bot status for troubleshooting
    const recallService = new (await import('../services/RecallAIService')).RecallAIService();
    let diagnosis = null;

    try {
      diagnosis = await recallService.diagnoseBotIssues(bot_id);
    } catch (diagError: any) {
      logger.warn('Failed to get bot diagnosis', {
        botId: bot_id,
        error: diagError.message
      });
    }

    // Update meeting with comprehensive error information
    const { error } = await supabase
      .from('meetings')
      .update({
        status: 'failed',
        error_message: error_message,
        error_code: error_code,
        metadata: {
          recall_bot_id: bot_id,
          bot_error_occurred_at: new Date().toISOString(),
          error_sub_code: sub_code,
          bot_diagnosis: diagnosis,
          troubleshooting_url: diagnosis?.explorerUrl
        }
      })
      .eq('metadata->>recall_bot_id', bot_id);

    if (error) {
      throw new Error(`Failed to update meeting with error: ${error.message}`);
    }

    // Send alert to monitoring system if fatal error
    if (sub_code && isFatalError(sub_code)) {
      await sendFatalErrorAlert(bot_id, error_message, error_code, sub_code, diagnosis);
    }

    logger.error('Bot error occurred - meeting updated with troubleshooting info', {
      botId: bot_id,
      errorMessage: error_message,
      errorCode: error_code,
      subCode: sub_code,
      hasDiagnosis: !!diagnosis,
      explorerUrl: diagnosis?.explorerUrl
    });
  } catch (error: any) {
    logger.error('Failed to handle bot error event', {
      event,
      error: error.message
    });
  }
}

/**
 * Handle bot joining call event
 */
async function handleBotJoiningCall(event: any): Promise<void> {
  const { bot_id } = event.data.bot;

  logger.info('Bot is joining call', {
    botId: bot_id,
    eventType: event.event_type
  });

  // Update bot status in database
  await updateBotStatus(bot_id, 'joining_call');
}

/**
 * Handle bot in waiting room event
 */
async function handleBotInWaitingRoom(event: any): Promise<void> {
  const { bot_id } = event.data.bot;
  const { sub_code } = event.data.data;

  logger.warn('Bot is in waiting room', {
    botId: bot_id,
    subCode: sub_code,
    eventType: event.event_type
  });

  // Update bot status in database
  await updateBotStatus(bot_id, 'in_waiting_room', sub_code);

  // Notify client about waiting room situation
  await notifyClientAboutWaitingRoom(bot_id, sub_code);
}

/**
 * Handle bot in call but not recording event
 */
async function handleBotInCallNotRecording(event: any): Promise<void> {
  const { bot_id } = event.data.bot;
  const { sub_code } = event.data.data;

  logger.info('Bot is in call but not recording', {
    botId: bot_id,
    subCode: sub_code,
    eventType: event.event_type
  });

  // Update bot status in database
  await updateBotStatus(bot_id, 'in_call_not_recording', sub_code);
}

/**
 * Handle recording permission allowed event
 */
async function handleRecordingPermissionAllowed(event: any): Promise<void> {
  const { bot_id } = event.data.bot;

  logger.info('Recording permission allowed', {
    botId: bot_id,
    eventType: event.event_type
  });

  // Update bot status in database
  await updateBotStatus(bot_id, 'recording_permission_allowed');
}

/**
 * Handle recording permission denied event
 */
async function handleRecordingPermissionDenied(event: any): Promise<void> {
  const { bot_id } = event.data.bot;
  const { sub_code } = event.data.data;

  logger.error('Recording permission denied', {
    botId: bot_id,
    subCode: sub_code,
    eventType: event.event_type
  });

  // Update bot status in database
  await updateBotStatus(bot_id, 'recording_permission_denied', sub_code);

  // Notify client about recording permission issue
  await notifyClientAboutRecordingPermission(bot_id, sub_code);
}

/**
 * Handle bot in call recording event
 */
async function handleBotInCallRecording(event: any): Promise<void> {
  const { bot_id } = event.data.bot;

  logger.info('Bot is recording', {
    botId: bot_id,
    eventType: event.event_type
  });

  // Update bot status in database
  await updateBotStatus(bot_id, 'in_call_recording');
}

/**
 * Handle bot call ended event
 */
async function handleBotCallEnded(event: any): Promise<void> {
  const { bot_id } = event.data.bot;
  const { sub_code } = event.data.data;

  logger.info('Bot call ended', {
    botId: bot_id,
    subCode: sub_code,
    eventType: event.event_type
  });

  // Update bot status in database
  await updateBotStatus(bot_id, 'call_ended', sub_code);
}

/**
 * Handle bot done event
 */
async function handleBotDone(event: any): Promise<void> {
  const { bot_id } = event.data.bot;

  logger.info('Bot processing completed', {
    botId: bot_id,
    eventType: event.event_type
  });

  // Update bot status in database
  await updateBotStatus(bot_id, 'done');

  // Get meeting information for event publishing
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('*')
    .eq('metadata->>recall_bot_id', bot_id)
    .single();

  if (meetingError || !meeting) {
    logger.warn('Could not find meeting for bot done event', {
      botId: bot_id,
      error: meetingError?.message
    });
    return;
  }

  // Publish bot processing completed event
  await eventBusService.publishBotEvent(
    'bot.processing_completed',
    bot_id,
    {
      bot_id: bot_id,
      meeting_id: meeting.id,
      client_id: meeting.client_id,
      processing_completed_at: new Date().toISOString(),
      meeting_data: meeting
    },
    meeting.client_id,
    `meeting_${meeting.id}`,
    `bot_${bot_id}`
  );

  // Publish meeting ended event
  await eventBusService.publishMeetingEvent(
    'meeting.ended',
    meeting.id,
    {
      meeting_id: meeting.id,
      client_id: meeting.client_id,
      bot_id: bot_id,
      ended_at: new Date().toISOString(),
      meeting_data: meeting
    },
    meeting.client_id,
    `meeting_${meeting.id}`,
    `bot_${bot_id}`
  );
}

/**
 * Handle bot fatal error event
 */
async function handleBotFatal(event: any): Promise<void> {
  const { bot_id } = event.data.bot;
  const { sub_code } = event.data.data;

  logger.error('Bot encountered fatal error', {
    botId: bot_id,
    subCode: sub_code,
    eventType: event.event_type
  });

  // Update bot status in database
  await updateBotStatus(bot_id, 'fatal', sub_code);

  // Get detailed bot status for troubleshooting
  const recallService = new (await import('../services/RecallAIService')).RecallAIService();
  let diagnosis = null;

  try {
    diagnosis = await recallService.diagnoseBotIssues(bot_id);
  } catch (diagError: any) {
    logger.warn('Failed to get bot diagnosis', {
      botId: bot_id,
      error: diagError.message
    });
  }

  // Update meeting with comprehensive error information
  const { error } = await supabase
    .from('meetings')
    .update({
      metadata: {
        recall_bot_status: 'fatal',
        recall_bot_error_code: sub_code,
        recall_bot_error_timestamp: new Date().toISOString(),
        recall_bot_diagnosis: diagnosis,
        recall_bot_troubleshooting_url: diagnosis?.explorerUrl
      }
    })
    .eq('metadata->recall_bot_id', bot_id);

  if (error) {
    logger.error('Failed to update meeting with bot error', {
      botId: bot_id,
      error: error.message
    });
  }

  // Notify client about fatal error
  await notifyClientAboutFatalError(bot_id, sub_code, diagnosis);
}

/**
 * Handle bot status change events for monitoring
 */
async function handleBotStatusChange(event: any): Promise<void> {
  try {
    const { bot_id, status_change } = event;

    // Log status change for monitoring
    logger.info('Bot status change detected', {
      botId: bot_id,
      statusChange: status_change
    });

    // Update bot tracking table with status change
    const { error } = await supabase
      .from('bot_tracking')
      .update({
        last_activity_at: new Date().toISOString(),
        metadata: {
          last_status_change: status_change,
          status_change_at: new Date().toISOString()
        }
      })
      .eq('recall_bot_id', bot_id);

    if (error) {
      logger.warn('Failed to update bot tracking with status change', {
        botId: bot_id,
        error: error.message
      });
    }

    // Handle specific status changes
    if (status_change.code === 'fatal') {
      await handleFatalStatusChange(bot_id, status_change);
    } else if (status_change.code === 'in_waiting_room') {
      await handleWaitingRoomStatus(bot_id, status_change);
    }
  } catch (error: any) {
    logger.error('Failed to handle bot status change', {
      event,
      error: error.message
    });
  }
}

/**
 * Handle fatal status changes
 */
async function handleFatalStatusChange(botId: string, statusChange: any): Promise<void> {
  try {
    // Get meeting information
    const { data: meeting, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('metadata->>recall_bot_id', botId)
      .single();

    if (error || !meeting) {
      logger.warn('Could not find meeting for fatal bot status', {
        botId,
        error: error?.message
      });
      return;
    }

    // Update meeting status to failed
    await supabase
      .from('meetings')
      .update({
        status: 'failed',
        error_message: statusChange.message,
        error_code: statusChange.code,
        metadata: {
          ...meeting.metadata,
          fatal_error_sub_code: statusChange.sub_code,
          fatal_error_at: new Date().toISOString()
        }
      })
      .eq('id', meeting.id);

    // Send alert to client
    await sendClientAlert(meeting.client_id, {
      type: 'bot_fatal_error',
      meetingId: meeting.id,
      botId,
      errorCode: statusChange.code,
      subCode: statusChange.sub_code,
      message: statusChange.message
    });

    logger.error('Fatal bot status change handled', {
      botId,
      meetingId: meeting.id,
      clientId: meeting.client_id,
      errorCode: statusChange.code,
      subCode: statusChange.sub_code
    });
  } catch (error: any) {
    logger.error('Failed to handle fatal status change', {
      botId,
      statusChange,
      error: error.message
    });
  }
}

/**
 * Handle waiting room status
 */
async function handleWaitingRoomStatus(botId: string, statusChange: any): Promise<void> {
  try {
    // Get meeting information
    const { data: meeting, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('metadata->>recall_bot_id', botId)
      .single();

    if (error || !meeting) {
      return;
    }

    // Send notification to client about waiting room
    await sendClientNotification(meeting.client_id, {
      type: 'bot_in_waiting_room',
      meetingId: meeting.id,
      botId,
      message: 'Bot is waiting to be admitted to the meeting. Please admit the bot from the waiting room.'
    });

    logger.info('Bot waiting room status handled', {
      botId,
      meetingId: meeting.id,
      clientId: meeting.client_id
    });
  } catch (error: any) {
    logger.error('Failed to handle waiting room status', {
      botId,
      statusChange,
      error: error.message
    });
  }
}

/**
 * Check if error code is fatal
 */
function isFatalError(subCode: string): boolean {
  const fatalErrors = [
    'meeting_not_found',
    'meeting_ended',
    'insufficient_permissions',
    'recording_disabled',
    'network_error',
    'platform_error',
    'bot_crashed',
    'timeout'
  ];
  return fatalErrors.includes(subCode);
}

/**
 * Send fatal error alert
 */
async function sendFatalErrorAlert(
  botId: string,
  errorMessage: string,
  errorCode: string,
  subCode: string,
  diagnosis: any
): Promise<void> {
  try {
    // Send to monitoring system
    const alertPayload = {
      type: 'recall_bot_fatal_error',
      botId,
      errorMessage,
      errorCode,
      subCode,
      diagnosis,
      timestamp: new Date().toISOString()
    };

    // Call notification service
    await fetch(`${process.env.NOTIFICATION_SERVICE_URL}/api/v1/alerts/fatal-error`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTER_SERVICE_TOKEN}`
      },
      body: JSON.stringify(alertPayload)
    });

    logger.info('Fatal error alert sent', {
      botId,
      errorCode,
      subCode
    });
  } catch (error: any) {
    logger.error('Failed to send fatal error alert', {
      botId,
      error: error.message
    });
  }
}

/**
 * Send client alert
 */
async function sendClientAlert(clientId: string, alert: any): Promise<void> {
  try {
    await fetch(`${process.env.NOTIFICATION_SERVICE_URL}/api/v1/notifications/client-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTER_SERVICE_TOKEN}`
      },
      body: JSON.stringify({
        clientId,
        alert,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error: any) {
    logger.error('Failed to send client alert', {
      clientId,
      alert,
      error: error.message
    });
  }
}

/**
 * Send client notification
 */
async function sendClientNotification(clientId: string, notification: any): Promise<void> {
  try {
    await fetch(`${process.env.NOTIFICATION_SERVICE_URL}/api/v1/notifications/client-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTER_SERVICE_TOKEN}`
      },
      body: JSON.stringify({
        clientId,
        notification,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error: any) {
    logger.error('Failed to send client notification', {
      clientId,
      notification,
      error: error.message
    });
  }
}

// Note: triggerWorkflowAutomation function removed - now using event-driven workflow triggers

/**
 * Update bot status in database
 */
async function updateBotStatus(botId: string, status: string, subCode?: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('meetings')
      .update({
        metadata: {
          recall_bot_status: status,
          recall_bot_sub_code: subCode,
          recall_bot_status_updated_at: new Date().toISOString()
        }
      })
      .eq('metadata->recall_bot_id', botId);

    if (error) {
      logger.error('Failed to update bot status', {
        botId,
        status,
        subCode,
        error: error.message
      });
    }
  } catch (error: any) {
    logger.error('Error updating bot status', {
      botId,
      status,
      subCode,
      error: error.message
    });
  }
}

/**
 * Notify client about waiting room situation
 */
async function notifyClientAboutWaitingRoom(botId: string, subCode?: string): Promise<void> {
  try {
    // Get meeting and client information
    const { data: meeting } = await supabase
      .from('meetings')
      .select('id, client_id, title, metadata')
      .eq('metadata->recall_bot_id', botId)
      .single();

    if (!meeting) {
      logger.warn('Meeting not found for bot', { botId });
      return;
    }

    // Send notification to client
    const notificationPayload = {
      type: 'bot_waiting_room',
      meetingId: meeting.id,
      clientId: meeting.client_id,
      botId,
      message: 'Your meeting bot is waiting to be admitted to the meeting. Please ask the host to admit the bot.',
      subCode,
      timestamp: new Date().toISOString()
    };

    // Call notification service
    await fetch(`${process.env.NOTIFICATION_SERVICE_URL}/api/v1/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTER_SERVICE_TOKEN}`
      },
      body: JSON.stringify(notificationPayload)
    });

    logger.info('Client notified about waiting room', {
      botId,
      meetingId: meeting.id,
      clientId: meeting.client_id
    });
  } catch (error: any) {
    logger.error('Failed to notify client about waiting room', {
      botId,
      subCode,
      error: error.message
    });
  }
}

/**
 * Notify client about recording permission issue
 */
async function notifyClientAboutRecordingPermission(botId: string, subCode?: string): Promise<void> {
  try {
    // Get meeting and client information
    const { data: meeting } = await supabase
      .from('meetings')
      .select('id, client_id, title, metadata')
      .eq('metadata->recall_bot_id', botId)
      .single();

    if (!meeting) {
      logger.warn('Meeting not found for bot', { botId });
      return;
    }

    // Send notification to client
    const notificationPayload = {
      type: 'bot_recording_permission_denied',
      meetingId: meeting.id,
      clientId: meeting.client_id,
      botId,
      message: 'Recording permission was denied for your meeting bot. Please check meeting settings.',
      subCode,
      timestamp: new Date().toISOString()
    };

    // Call notification service
    await fetch(`${process.env.NOTIFICATION_SERVICE_URL}/api/v1/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTER_SERVICE_TOKEN}`
      },
      body: JSON.stringify(notificationPayload)
    });

    logger.info('Client notified about recording permission', {
      botId,
      meetingId: meeting.id,
      clientId: meeting.client_id
    });
  } catch (error: any) {
    logger.error('Failed to notify client about recording permission', {
      botId,
      subCode,
      error: error.message
    });
  }
}

/**
 * Notify client about fatal error
 */
async function notifyClientAboutFatalError(botId: string, subCode?: string, diagnosis?: any): Promise<void> {
  try {
    // Get meeting and client information
    const { data: meeting } = await supabase
      .from('meetings')
      .select('id, client_id, title, metadata')
      .eq('metadata->recall_bot_id', botId)
      .single();

    if (!meeting) {
      logger.warn('Meeting not found for bot', { botId });
      return;
    }

    // Send notification to client
    const notificationPayload = {
      type: 'bot_fatal_error',
      meetingId: meeting.id,
      clientId: meeting.client_id,
      botId,
      message: 'Your meeting bot encountered a fatal error and could not join the meeting.',
      subCode,
      diagnosis,
      troubleshootingUrl: diagnosis?.explorerUrl,
      timestamp: new Date().toISOString()
    };

    // Call notification service
    await fetch(`${process.env.NOTIFICATION_SERVICE_URL}/api/v1/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTER_SERVICE_TOKEN}`
      },
      body: JSON.stringify(notificationPayload)
    });

    logger.info('Client notified about fatal error', {
      botId,
      meetingId: meeting.id,
      clientId: meeting.client_id,
      subCode
    });
  } catch (error: any) {
    logger.error('Failed to notify client about fatal error', {
      botId,
      subCode,
      error: error.message
    });
  }
}

/**
 * Verify webhook signature using Svix-compatible verification
 */
function verifyWebhookSignature(payload: string, headers: any): boolean {
  try {
    const crypto = require('crypto');

    // Get headers
    const svixId = headers['svix-id'] || headers['webhook-id'];
    const svixTimestamp = headers['svix-timestamp'] || headers['webhook-timestamp'];
    const svixSignature = headers['svix-signature'] || headers['webhook-signature'];

    if (!svixId || !svixTimestamp || !svixSignature) {
      logger.warn('Missing required webhook headers', {
        hasId: !!svixId,
        hasTimestamp: !!svixTimestamp,
        hasSignature: !!svixSignature
      });
      return false;
    }

    // Get signing secret from environment
    const signingSecret = process.env.RECALL_AI_WEBHOOK_SECRET;
    if (!signingSecret) {
      logger.error('Webhook signing secret not configured');
      return false;
    }

    // Extract secret from whsec_ format
    const secret = signingSecret.startsWith('whsec_')
      ? signingSecret.split('_')[1]
      : signingSecret;

    // Construct signed content
    const signedContent = `${svixId}.${svixTimestamp}.${payload}`;

    // Calculate expected signature
    const secretBytes = Buffer.from(secret, 'base64');
    const expectedSignature = crypto
      .createHmac('sha256', secretBytes)
      .update(signedContent)
      .digest('base64');

    // Parse signatures from header (space delimited)
    const signatures = svixSignature.split(' ');

    // Verify timestamp (within 5 minutes)
    const timestamp = parseInt(svixTimestamp);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(currentTime - timestamp);

    if (timeDiff > 300) { // 5 minutes
      logger.warn('Webhook timestamp too old', {
        timestamp,
        currentTime,
        timeDiff
      });
      return false;
    }

    // Check if any signature matches (constant-time comparison)
    for (const signature of signatures) {
      // Remove version prefix (e.g., "v1,")
      const cleanSignature = signature.includes(',')
        ? signature.split(',')[1]
        : signature;

      if (constantTimeCompare(cleanSignature, expectedSignature)) {
        return true;
      }
    }

    logger.warn('Webhook signature verification failed', {
      expectedSignature,
      receivedSignatures: signatures
    });

    return false;
  } catch (error: any) {
    logger.error('Error verifying webhook signature', {
      error: error.message
    });
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Handle transcript data webhook
 */
async function handleTranscriptData(event: any): Promise<void> {
  try {
    const { bot_id, transcript_id, recording_id } = event;
    const transcriptData = event.data;

    logger.info('Transcript data received', {
      botId: bot_id,
      transcriptId: transcript_id,
      recordingId: recording_id,
      participantId: transcriptData.participant?.id,
      wordsCount: transcriptData.words?.length || 0
    });

    // Store transcript data in database
    await storeTranscriptData(bot_id, transcript_id, recording_id, transcriptData);

    // Trigger real-time transcription processing
    await processRealTimeTranscription(bot_id, transcriptData);

  } catch (error: any) {
    logger.error('Error handling transcript data', {
      error: error.message,
      event
    });
  }
}

/**
 * Handle transcript partial data webhook
 */
async function handleTranscriptPartialData(event: any): Promise<void> {
  try {
    const { bot_id, transcript_id, recording_id } = event;
    const transcriptData = event.data;

    logger.info('Transcript partial data received', {
      botId: bot_id,
      transcriptId: transcript_id,
      recordingId: recording_id,
      participantId: transcriptData.participant?.id,
      wordsCount: transcriptData.words?.length || 0
    });

    // Store partial transcript data
    await storePartialTranscriptData(bot_id, transcript_id, recording_id, transcriptData);

    // Process partial transcription for real-time updates
    await processPartialTranscription(bot_id, transcriptData);

  } catch (error: any) {
    logger.error('Error handling transcript partial data', {
      error: error.message,
      event
    });
  }
}

/**
 * Handle transcript done webhook
 */
async function handleTranscriptDone(event: any): Promise<void> {
  try {
    const { bot_id, transcript_id, recording_id } = event;

    logger.info('Transcript completed', {
      botId: bot_id,
      transcriptId: transcript_id,
      recordingId: recording_id
    });

    // Update transcript status in database
    await updateTranscriptStatus(transcript_id, 'completed');

    // Get meeting information for event publishing
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('metadata->>recall_bot_id', bot_id)
      .single();

    if (meetingError || !meeting) {
      logger.warn('Could not find meeting for transcript done event', {
        botId: bot_id,
        transcriptId: transcript_id,
        error: meetingError?.message
      });
      return;
    }

    // Publish transcript completed event
    await eventBusService.publishTranscriptionEvent(
      'transcript.completed',
      transcript_id,
      {
        transcript_id: transcript_id,
        meeting_id: meeting.id,
        bot_id: bot_id,
        recording_id: recording_id,
        completed_at: new Date().toISOString(),
        meeting_data: meeting
      },
      meeting.client_id,
      `meeting_${meeting.id}`,
      `transcript_${transcript_id}`
    );

  } catch (error: any) {
    logger.error('Error handling transcript done', {
      error: error.message,
      event
    });
  }
}

/**
 * Handle transcript failed webhook
 */
async function handleTranscriptFailed(event: any): Promise<void> {
  try {
    const { bot_id, transcript_id, recording_id } = event;
    const errorData = event.data;

    logger.error('Transcript failed', {
      botId: bot_id,
      transcriptId: transcript_id,
      recordingId: recording_id,
      errorCode: errorData.code,
      subCode: errorData.sub_code
    });

    // Update transcript status in database
    await updateTranscriptStatus(transcript_id, 'failed', errorData);

    // Notify client about transcription failure
    await notifyClientAboutTranscriptionFailure(bot_id, transcript_id, errorData);

  } catch (error: any) {
    logger.error('Error handling transcript failed', {
      error: error.message,
      event
    });
  }
}

/**
 * Handle audio separate data webhook
 */
async function handleAudioSeparateData(event: any): Promise<void> {
  try {
    const { bot_id, recording_id } = event;
    const audioData = event.data;

    logger.info('Audio separate data received', {
      botId: bot_id,
      recordingId: recording_id,
      participantId: audioData.participant?.id,
      timestamp: audioData.timestamp
    });

    // Process real-time audio data
    await processRealTimeAudio(bot_id, recording_id, audioData);

  } catch (error: any) {
    logger.error('Error handling audio separate data', {
      error: error.message,
      event
    });
  }
}

/**
 * Handle video separate PNG data webhook
 */
async function handleVideoSeparatePngData(event: any): Promise<void> {
  try {
    const { bot_id, recording_id } = event;
    const videoData = event.data;

    logger.info('Video separate PNG data received', {
      botId: bot_id,
      recordingId: recording_id,
      participantId: videoData.participant?.id,
      type: videoData.type,
      timestamp: videoData.timestamp
    });

    // Process real-time video PNG data
    await processRealTimeVideoPng(bot_id, recording_id, videoData);

  } catch (error: any) {
    logger.error('Error handling video separate PNG data', {
      error: error.message,
      event
    });
  }
}

/**
 * Handle video separate H264 data webhook
 */
async function handleVideoSeparateH264Data(event: any): Promise<void> {
  try {
    const { bot_id, recording_id } = event;
    const videoData = event.data;

    logger.info('Video separate H264 data received', {
      botId: bot_id,
      recordingId: recording_id,
      participantId: videoData.participant?.id,
      type: videoData.type,
      timestamp: videoData.timestamp
    });

    // Process real-time video H264 data
    await processRealTimeVideoH264(bot_id, recording_id, videoData);

  } catch (error: any) {
    logger.error('Error handling video separate H264 data', {
      error: error.message,
      event
    });
  }
}

/**
 * Store transcript data in database
 */
async function storeTranscriptData(botId: string, transcriptId: string, recordingId: string, transcriptData: any): Promise<void> {
  try {
    // Implementation would store transcript data in database
    // This is a placeholder for the actual database operation
    logger.info('Storing transcript data', {
      botId,
      transcriptId,
      recordingId,
      participantId: transcriptData.participant?.id
    });
  } catch (error: any) {
    logger.error('Failed to store transcript data', {
      error: error.message,
      botId,
      transcriptId
    });
  }
}

/**
 * Store partial transcript data in database
 */
async function storePartialTranscriptData(botId: string, transcriptId: string, recordingId: string, transcriptData: any): Promise<void> {
  try {
    // Implementation would store partial transcript data in database
    logger.info('Storing partial transcript data', {
      botId,
      transcriptId,
      recordingId,
      participantId: transcriptData.participant?.id
    });
  } catch (error: any) {
    logger.error('Failed to store partial transcript data', {
      error: error.message,
      botId,
      transcriptId
    });
  }
}

/**
 * Update transcript status in database
 */
async function updateTranscriptStatus(transcriptId: string, status: string, errorData?: any): Promise<void> {
  try {
    // Implementation would update transcript status in database
    logger.info('Updating transcript status', {
      transcriptId,
      status,
      errorData
    });
  } catch (error: any) {
    logger.error('Failed to update transcript status', {
      error: error.message,
      transcriptId,
      status
    });
  }
}

/**
 * Process real-time transcription
 */
async function processRealTimeTranscription(botId: string, transcriptData: any): Promise<void> {
  try {
    // Implementation would process real-time transcription
    logger.info('Processing real-time transcription', {
      botId,
      participantId: transcriptData.participant?.id,
      wordsCount: transcriptData.words?.length
    });
  } catch (error: any) {
    logger.error('Failed to process real-time transcription', {
      error: error.message,
      botId
    });
  }
}

/**
 * Process partial transcription
 */
async function processPartialTranscription(botId: string, transcriptData: any): Promise<void> {
  try {
    // Implementation would process partial transcription
    logger.info('Processing partial transcription', {
      botId,
      participantId: transcriptData.participant?.id,
      wordsCount: transcriptData.words?.length
    });
  } catch (error: any) {
    logger.error('Failed to process partial transcription', {
      error: error.message,
      botId
    });
  }
}

/**
 * Notify client about transcription failure
 */
async function notifyClientAboutTranscriptionFailure(botId: string, transcriptId: string, errorData: any): Promise<void> {
  try {
    // Implementation would notify client about transcription failure
    logger.info('Notifying client about transcription failure', {
      botId,
      transcriptId,
      errorCode: errorData.code,
      subCode: errorData.sub_code
    });
  } catch (error: any) {
    logger.error('Failed to notify client about transcription failure', {
      error: error.message,
      botId,
      transcriptId
    });
  }
}

/**
 * Process real-time audio data
 */
async function processRealTimeAudio(botId: string, recordingId: string, audioData: any): Promise<void> {
  try {
    // Implementation would process real-time audio data
    logger.info('Processing real-time audio', {
      botId,
      recordingId,
      participantId: audioData.participant?.id,
      timestamp: audioData.timestamp
    });
  } catch (error: any) {
    logger.error('Failed to process real-time audio', {
      error: error.message,
      botId,
      recordingId
    });
  }
}

/**
 * Process real-time video PNG data
 */
async function processRealTimeVideoPng(botId: string, recordingId: string, videoData: any): Promise<void> {
  try {
    // Implementation would process real-time video PNG data
    logger.info('Processing real-time video PNG', {
      botId,
      recordingId,
      participantId: videoData.participant?.id,
      type: videoData.type,
      timestamp: videoData.timestamp
    });
  } catch (error: any) {
    logger.error('Failed to process real-time video PNG', {
      error: error.message,
      botId,
      recordingId
    });
  }
}

/**
 * Process real-time video H264 data
 */
async function processRealTimeVideoH264(botId: string, recordingId: string, videoData: any): Promise<void> {
  try {
    // Implementation would process real-time video H264 data
    logger.info('Processing real-time video H264', {
      botId,
      recordingId,
      participantId: videoData.participant?.id,
      type: videoData.type,
      timestamp: videoData.timestamp
    });
  } catch (error: any) {
    logger.error('Failed to process real-time video H264', {
      error: error.message,
      botId,
      recordingId
    });
  }
}

export default router;
