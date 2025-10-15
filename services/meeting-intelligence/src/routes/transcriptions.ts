import { createClient } from '@supabase/supabase-js';
import { Request, Response, Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ActionItemEventService } from '../services/ActionItemEventService';
import { OpenAIService } from '../services/OpenAIService';
import { ApiResponse, ProcessRecordingSchema } from '../types';
import { logger } from '../utils/logger';

const router: Router = Router();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const openAIService = new OpenAIService();
const actionItemEventService = new ActionItemEventService();

/**
 * Process meeting recording and generate transcription
 */
router.post(
  '/process',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      // Validate request body
      const validationResult = ProcessRecordingSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Invalid request data',
          details: validationResult.error.errors,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { meeting_id, recording_url, language, options } = validationResult.data;

      // Check if user has access to this meeting
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select(
          `
        *,
        clients!inner(user_id)
      `,
        )
        .eq('id', meeting_id)
        .eq('clients.user_id', userId)
        .single();

      if (meetingError || !meeting) {
        logger.warn('Meeting not found or access denied', {
          meetingId: meeting_id,
          userId,
          error: meetingError?.message,
        });
        res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Meeting not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Update meeting status to processing
      await supabase
        .from('meetings')
        .update({
          status: 'processing',
          recording_url: recording_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', meeting_id);

      // Create transcription record
      const { data: transcription, error: transcriptionError } = await supabase
        .from('meeting_transcriptions')
        .insert({
          meeting_id: meeting_id,
          content: '',
          language: language || 'en',
          confidence: 0,
          speaker_segments: [],
          processing_status: 'in_progress',
        })
        .select()
        .single();

      if (transcriptionError) {
        logger.error('Failed to create transcription record', {
          meetingId: meeting_id,
          error: transcriptionError.message,
        });
        res.status(500).json({
          success: false,
          error: 'DatabaseError',
          message: 'Failed to create transcription record',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Process recording asynchronously
      processRecordingAsync(
        meeting_id,
        recording_url,
        transcription.id,
        options,
        userId,
        meeting.client_id,
      );

      logger.info('Recording processing started', {
        meetingId: meeting_id,
        transcriptionId: transcription.id,
        userId,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: {
          transcription_id: transcription.id,
          meeting_id: meeting_id,
          status: 'processing',
          message: 'Recording processing started',
        },
        timestamp: new Date().toISOString(),
      };

      res.status(202).json(response);
    } catch (error) {
      logger.error('Recording processing error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }),
);

/**
 * Get transcription for a meeting
 */
router.get(
  '/meeting/:meetingId',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { meetingId } = req.params;
      const userId = (req as any).user?.id;

      // Check if user has access to this meeting
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select(
          `
        *,
        clients!inner(user_id)
      `,
        )
        .eq('id', meetingId)
        .eq('clients.user_id', userId)
        .single();

      if (meetingError || !meeting) {
        logger.warn('Meeting not found or access denied', {
          meetingId,
          userId,
          error: meetingError?.message,
        });
        res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Meeting not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Get transcription
      const { data: transcription, error } = await supabase
        .from('meeting_transcriptions')
        .select('*')
        .eq('meeting_id', meetingId)
        .single();

      if (error || !transcription) {
        res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Transcription not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const response: ApiResponse<any> = {
        success: true,
        data: {
          id: transcription.id,
          meeting_id: transcription.meeting_id,
          content: transcription.content,
          language: transcription.language,
          confidence: transcription.confidence,
          speaker_segments: transcription.speaker_segments,
          processing_status: transcription.processing_status,
          created_at: transcription.created_at,
          updated_at: transcription.updated_at,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Transcription fetch error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }),
);

/**
 * Async function to process recording
 */
async function processRecordingAsync(
  meetingId: string,
  recordingUrl: string,
  transcriptionId: string,
  _options?: any,
  userId?: string,
  clientId?: string,
): Promise<void> {
  try {
    logger.info('Starting async recording processing', {
      meetingId,
      transcriptionId,
      userId,
      clientId,
    });

    // Here you would integrate with your transcription service (Whisper, Recall.ai, etc.)
    // For now, we'll simulate the process with a realistic transcription

    const mockTranscription = `
      John: Good morning everyone, thanks for joining today's product planning meeting.

      Sarah: Thanks John. I wanted to discuss the new feature requirements we received from the client.

      Mike: Yes, I've reviewed the requirements document. We need to implement user authentication by next Friday.

      Sarah: That's correct. Also, we need to update the database schema to support the new user roles.

      John: Mike, can you handle the authentication implementation?

      Mike: Yes, I'll start working on it today and have it ready by Friday.

      Sarah: Great. I'll update the database schema and create the migration scripts.

      John: Perfect. Let's also schedule a follow-up meeting for next Monday to review progress.

      Sarah: I'll send out the calendar invite for Monday at 2 PM.

      Mike: Sounds good. I'll also need to coordinate with the frontend team on the UI changes.

      John: Excellent. Let's wrap up here. Thanks everyone.
    `;

    // Update transcription with processed content
    await supabase
      .from('meeting_transcriptions')
      .update({
        content: mockTranscription,
        confidence: 0.95,
        speaker_segments: [
          {
            speaker: 'John',
            start_time: 0,
            end_time: 5,
            text: "Good morning everyone, thanks for joining today's product planning meeting.",
          },
          {
            speaker: 'Sarah',
            start_time: 5,
            end_time: 10,
            text: 'Thanks John. I wanted to discuss the new feature requirements we received from the client.',
          },
          {
            speaker: 'Mike',
            start_time: 10,
            end_time: 15,
            text: "Yes, I've reviewed the requirements document. We need to implement user authentication by next Friday.",
          },
          {
            speaker: 'Sarah',
            start_time: 15,
            end_time: 20,
            text: "That's correct. Also, we need to update the database schema to support the new user roles.",
          },
          {
            speaker: 'John',
            start_time: 20,
            end_time: 25,
            text: 'Mike, can you handle the authentication implementation?',
          },
          {
            speaker: 'Mike',
            start_time: 25,
            end_time: 30,
            text: "Yes, I'll start working on it today and have it ready by Friday.",
          },
          {
            speaker: 'Sarah',
            start_time: 30,
            end_time: 35,
            text: "Great. I'll update the database schema and create the migration scripts.",
          },
          {
            speaker: 'John',
            start_time: 35,
            end_time: 40,
            text: "Perfect. Let's also schedule a follow-up meeting for next Monday to review progress.",
          },
          {
            speaker: 'Sarah',
            start_time: 40,
            end_time: 45,
            text: "I'll send out the calendar invite for Monday at 2 PM.",
          },
          {
            speaker: 'Mike',
            start_time: 45,
            end_time: 50,
            text: "Sounds good. I'll also need to coordinate with the frontend team on the UI changes.",
          },
          {
            speaker: 'John',
            start_time: 50,
            end_time: 55,
            text: "Excellent. Let's wrap up here. Thanks everyone.",
          },
        ],
        processing_status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', transcriptionId);

    // Get meeting details for action item extraction
    const { data: meeting } = await supabase
      .from('meetings')
      .select('title, client_id')
      .eq('id', meetingId)
      .single();

    // Extract action items using OpenAI
    if (userId && clientId && meeting) {
      try {
        const transcription = {
          id: transcriptionId,
          meeting_id: meetingId,
          content: mockTranscription,
          language: 'en',
          confidence: 0.95,
          speaker_segments: [],
          processing_status: 'completed' as any,
          created_at: new Date(),
          updated_at: new Date(),
        };

        const actionItems = await openAIService.extractActionItems(transcription, meeting.title);

        if (actionItems.length > 0) {
          // Create action items and trigger events
          await actionItemEventService.createActionItemsFromExtraction(
            actionItems,
            meetingId,
            userId,
            clientId,
            `meeting-processing-${meetingId}`,
          );

          logger.info('Action items extracted and events triggered', {
            meetingId,
            transcriptionId,
            actionItemCount: actionItems.length,
            userId,
            clientId,
          });
        }
      } catch (actionItemError) {
        logger.error('Failed to extract action items', {
          meetingId,
          transcriptionId,
          error: actionItemError instanceof Error ? actionItemError.message : 'Unknown error',
        });
        // Don't fail the entire process if action item extraction fails
      }
    }

    // Update meeting status
    await supabase
      .from('meetings')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', meetingId);

    logger.info('Recording processing completed with action items', {
      meetingId,
      transcriptionId,
      userId,
      clientId,
    });
  } catch (error) {
    logger.error('Async recording processing failed', {
      meetingId,
      transcriptionId,
      userId,
      clientId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Update status to failed
    await supabase
      .from('meeting_transcriptions')
      .update({
        processing_status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', transcriptionId);

    await supabase
      .from('meetings')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', meetingId);
  }
}

export default router;
