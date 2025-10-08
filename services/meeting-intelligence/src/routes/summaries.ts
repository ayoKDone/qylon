import { createClient } from '@supabase/supabase-js';
import { Request, Response, Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import { logger } from '../utils/logger';

const router: Router = Router();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

/**
 * Get meeting summary
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

      // Get meeting summary
      const { data: summary, error } = await supabase
        .from('meeting_summaries')
        .select('*')
        .eq('meeting_id', meetingId)
        .single();

      if (error || !summary) {
        res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Meeting summary not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const response: ApiResponse<any> = {
        success: true,
        data: {
          id: summary.id,
          meeting_id: summary.meeting_id,
          summary: summary.summary,
          key_points: summary.key_points,
          decisions: summary.decisions,
          next_steps: summary.next_steps,
          sentiment: summary.sentiment,
          created_at: summary.created_at,
          updated_at: summary.updated_at,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Meeting summary fetch error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  })
);

/**
 * Generate meeting summary
 */
router.post(
  '/meeting/:meetingId/generate',
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

      // Check if transcription exists
      const { data: transcription, error: transcriptionError } = await supabase
        .from('meeting_transcriptions')
        .select('*')
        .eq('meeting_id', meetingId)
        .single();

      if (transcriptionError || !transcription) {
        res.status(400).json({
          success: false,
          error: 'BadRequest',
          message: 'Meeting transcription not found. Please process the recording first.',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate summary asynchronously
      generateSummaryAsync(meetingId, transcription.id);

      logger.info('Meeting summary generation started', {
        meetingId,
        userId,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: {
          meeting_id: meetingId,
          status: 'generating',
          message: 'Meeting summary generation started',
        },
        timestamp: new Date().toISOString(),
      };

      res.status(202).json(response);
    } catch (error) {
      logger.error('Meeting summary generation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  })
);

/**
 * Async function to generate meeting summary
 */
async function generateSummaryAsync(meetingId: string, transcriptionId: string): Promise<void> {
  try {
    logger.info('Starting async summary generation', {
      meetingId,
      transcriptionId,
    });

    // Here you would integrate with OpenAI service to generate the summary
    // For now, we'll create a placeholder summary

    const summaryData = {
      meeting_id: meetingId,
      summary: 'This is a placeholder summary that would be generated by AI...',
      key_points: ['Key point 1', 'Key point 2', 'Key point 3'],
      decisions: ['Decision 1', 'Decision 2'],
      next_steps: ['Next step 1', 'Next step 2'],
      sentiment: {
        overall_sentiment: 'positive',
        confidence: 0.85,
        speaker_sentiments: {},
      },
    };

    // Save summary to database
    const { data: summary, error } = await supabase
      .from('meeting_summaries')
      .insert(summaryData)
      .select()
      .single();

    if (error) {
      logger.error('Failed to save meeting summary', {
        meetingId,
        transcriptionId,
        error: error.message,
      });
      return;
    }

    logger.info('Meeting summary generated successfully', {
      meetingId,
      transcriptionId,
      summaryId: summary.id,
    });
  } catch (error) {
    logger.error('Async summary generation failed', {
      meetingId,
      transcriptionId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default router;
