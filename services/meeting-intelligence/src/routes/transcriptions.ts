import { Request, Response, Router } from 'express';
import { supabase } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse, ProcessRecordingSchema } from '../types';
import { logger } from '../utils/logger';

const router: Router = Router();
// const recallAIService = new RecallAIService();
// const openAIService = new OpenAIService();

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

      const { meeting_id, recording_url, language, options } =
        validationResult.data;

      // Check if user has access to this meeting
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select(
          `
        *,
        clients!inner(user_id)
      `
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
        options
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
  })
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
      `
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
  })
);

/**
 * Async function to process recording
 */
async function processRecordingAsync(
  meetingId: string,
  recordingUrl: string,
  transcriptionId: string,
  _options?: any
): Promise<void> {
  try {
    logger.info('Starting async recording processing', {
      meetingId,
      transcriptionId,
    });

    // Here you would integrate with your transcription service
    // For now, we'll simulate the process

    // Update transcription with processed content
    await supabase
      .from('meeting_transcriptions')
      .update({
        content: 'Transcription content would be here...',
        confidence: 0.95,
        speaker_segments: [],
        processing_status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', transcriptionId);

    // Update meeting status
    await supabase
      .from('meetings')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', meetingId);

    logger.info('Recording processing completed', {
      meetingId,
      transcriptionId,
    });
  } catch (error) {
    logger.error('Async recording processing failed', {
      meetingId,
      transcriptionId,
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
