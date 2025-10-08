import { createClient } from '@supabase/supabase-js';
import { Request, Response, Router } from 'express';
import { requireClientAccess } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { RecallAIService } from '../services/RecallAIService';
import {
  ApiResponse,
  CreateMeetingSchema,
  Meeting,
  MeetingPlatform,
  MeetingStatus,
  PaginatedResponse,
  UpdateMeetingSchema,
} from '../types';
import { logger } from '../utils/logger';

const router: Router = Router();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const recallAIService = new RecallAIService();

/**
 * Create a new meeting
 */
router.post(
  '/',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const clientId = req.body.client_id;

      // Validate request body
      const validationResult = CreateMeetingSchema.safeParse(req.body);
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

      const meetingData = validationResult.data;

      // Create meeting in database
      const { data: meeting, error } = await supabase
        .from('meetings')
        .insert({
          client_id: clientId,
          title: meetingData.title,
          description: meetingData.description,
          start_time: meetingData.start_time.toISOString(),
          platform: meetingData.platform,
          meeting_url: meetingData.meeting_url,
          participants: meetingData.participants,
          metadata: meetingData.metadata,
          status: MeetingStatus.SCHEDULED,
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create meeting', {
          userId,
          clientId,
          error: error.message,
        });
        res.status(500).json({
          success: false,
          error: 'DatabaseError',
          message: 'Failed to create meeting',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Create Recall.ai bot if meeting URL is provided
      if (meetingData.meeting_url) {
        try {
          const bot = await recallAIService.createBot(
            meetingData.meeting_url,
            `Qylon Bot - ${meetingData.title}`
          );

          // Update meeting with bot information
          await supabase
            .from('meetings')
            .update({
              metadata: {
                ...meeting.metadata,
                recall_bot_id: bot.id,
                recall_bot_token: bot.bot_token,
              },
            })
            .eq('id', meeting.id);

          logger.info('Recall.ai bot created for meeting', {
            meetingId: meeting.id,
            botId: bot.id,
          });
        } catch (botError) {
          logger.warn('Failed to create Recall.ai bot', {
            meetingId: meeting.id,
            error: botError instanceof Error ? botError.message : 'Unknown error',
          });
          // Don't fail the meeting creation if bot creation fails
        }
      }

      logger.info('Meeting created successfully', {
        meetingId: meeting.id,
        userId,
        clientId,
      });

      const response: ApiResponse<Meeting> = {
        success: true,
        data: {
          id: meeting.id,
          client_id: meeting.client_id,
          title: meeting.title,
          description: meeting.description,
          start_time: new Date(meeting.start_time),
          end_time: meeting.end_time ? new Date(meeting.end_time) : undefined,
          platform: meeting.platform as MeetingPlatform,
          meeting_url: meeting.meeting_url,
          recording_url: meeting.recording_url,
          status: meeting.status as MeetingStatus,
          participants: meeting.participants,
          metadata: meeting.metadata,
          created_at: new Date(meeting.created_at),
          updated_at: new Date(meeting.updated_at),
        },
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Meeting creation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  })
);

/**
 * Get meetings for a client
 */
router.get(
  '/client/:clientId',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId } = req.params;
      const userId = (req as any).user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const platform = req.query.platform as string;

      // Build query
      let query = supabase
        .from('meetings')
        .select('*', { count: 'exact' })
        .eq('client_id', clientId)
        .order('start_time', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      if (platform) {
        query = query.eq('platform', platform);
      }

      const { data: meetings, error, count } = await query;

      if (error) {
        logger.error('Failed to fetch meetings', {
          userId,
          clientId,
          error: error.message,
        });
        res.status(500).json({
          success: false,
          error: 'DatabaseError',
          message: 'Failed to fetch meetings',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const totalPages = Math.ceil((count || 0) / limit);

      const response: PaginatedResponse<Meeting> = {
        success: true,
        data:
          meetings?.map(meeting => ({
            id: meeting.id,
            client_id: meeting.client_id,
            title: meeting.title,
            description: meeting.description,
            start_time: new Date(meeting.start_time),
            end_time: meeting.end_time ? new Date(meeting.end_time) : undefined,
            platform: meeting.platform as MeetingPlatform,
            meeting_url: meeting.meeting_url,
            recording_url: meeting.recording_url,
            status: meeting.status as MeetingStatus,
            participants: meeting.participants,
            metadata: meeting.metadata,
            created_at: new Date(meeting.created_at),
            updated_at: new Date(meeting.updated_at),
          })) || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Meeting fetch error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  })
);

/**
 * Get a specific meeting
 */
router.get(
  '/:meetingId',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { meetingId } = req.params;
      const userId = (req as any).user?.id;

      const { data: meeting, error } = await supabase
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

      if (error || !meeting) {
        logger.warn('Meeting not found or access denied', {
          meetingId,
          userId,
          error: error?.message,
        });
        res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Meeting not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const response: ApiResponse<Meeting> = {
        success: true,
        data: {
          id: meeting.id,
          client_id: meeting.client_id,
          title: meeting.title,
          description: meeting.description,
          start_time: new Date(meeting.start_time),
          end_time: meeting.end_time ? new Date(meeting.end_time) : undefined,
          platform: meeting.platform as MeetingPlatform,
          meeting_url: meeting.meeting_url,
          recording_url: meeting.recording_url,
          status: meeting.status as MeetingStatus,
          participants: meeting.participants,
          metadata: meeting.metadata,
          created_at: new Date(meeting.created_at),
          updated_at: new Date(meeting.updated_at),
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Meeting fetch error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  })
);

/**
 * Update a meeting
 */
router.put(
  '/:meetingId',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { meetingId } = req.params;
      const userId = (req as any).user?.id;

      // Validate request body
      const validationResult = UpdateMeetingSchema.safeParse(req.body);
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

      const updateData = validationResult.data;

      // Check if user has access to this meeting
      const { data: existingMeeting, error: fetchError } = await supabase
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

      if (fetchError || !existingMeeting) {
        logger.warn('Meeting not found or access denied for update', {
          meetingId,
          userId,
          error: fetchError?.message,
        });
        res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Meeting not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Prepare update data
      const updatePayload: any = {
        updated_at: new Date().toISOString(),
      };

      if (updateData.title) updatePayload.title = updateData.title;
      if (updateData.description !== undefined) updatePayload.description = updateData.description;
      if (updateData.end_time) updatePayload.end_time = updateData.end_time.toISOString();
      if (updateData.status) updatePayload.status = updateData.status;
      if (updateData.recording_url) updatePayload.recording_url = updateData.recording_url;
      if (updateData.metadata)
        updatePayload.metadata = {
          ...existingMeeting.metadata,
          ...updateData.metadata,
        };

      // Update meeting
      const { data: updatedMeeting, error } = await supabase
        .from('meetings')
        .update(updatePayload)
        .eq('id', meetingId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update meeting', {
          meetingId,
          userId,
          error: error.message,
        });
        res.status(500).json({
          success: false,
          error: 'DatabaseError',
          message: 'Failed to update meeting',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info('Meeting updated successfully', {
        meetingId,
        userId,
      });

      const response: ApiResponse<Meeting> = {
        success: true,
        data: {
          id: updatedMeeting.id,
          client_id: updatedMeeting.client_id,
          title: updatedMeeting.title,
          description: updatedMeeting.description,
          start_time: new Date(updatedMeeting.start_time),
          end_time: updatedMeeting.end_time ? new Date(updatedMeeting.end_time) : undefined,
          platform: updatedMeeting.platform as MeetingPlatform,
          meeting_url: updatedMeeting.meeting_url,
          recording_url: updatedMeeting.recording_url,
          status: updatedMeeting.status as MeetingStatus,
          participants: updatedMeeting.participants,
          metadata: updatedMeeting.metadata,
          created_at: new Date(updatedMeeting.created_at),
          updated_at: new Date(updatedMeeting.updated_at),
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Meeting update error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  })
);

/**
 * Delete a meeting
 */
router.delete(
  '/:meetingId',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { meetingId } = req.params;
      const userId = (req as any).user?.id;

      // Check if user has access to this meeting
      const { data: meeting, error: fetchError } = await supabase
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

      if (fetchError || !meeting) {
        logger.warn('Meeting not found or access denied for deletion', {
          meetingId,
          userId,
          error: fetchError?.message,
        });
        res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Meeting not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Delete Recall.ai bot if it exists
      if (meeting.metadata?.recall_bot_id) {
        try {
          await recallAIService.deleteBot(meeting.metadata.recall_bot_id);
          logger.info('Recall.ai bot deleted', {
            meetingId,
            botId: meeting.metadata.recall_bot_id,
          });
        } catch (botError) {
          logger.warn('Failed to delete Recall.ai bot', {
            meetingId,
            botId: meeting.metadata.recall_bot_id,
            error: botError instanceof Error ? botError.message : 'Unknown error',
          });
          // Continue with meeting deletion even if bot deletion fails
        }
      }

      // Delete meeting
      const { error } = await supabase.from('meetings').delete().eq('id', meetingId);

      if (error) {
        logger.error('Failed to delete meeting', {
          meetingId,
          userId,
          error: error.message,
        });
        res.status(500).json({
          success: false,
          error: 'DatabaseError',
          message: 'Failed to delete meeting',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info('Meeting deleted successfully', {
        meetingId,
        userId,
      });

      res.status(200).json({
        success: true,
        message: 'Meeting deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Meeting deletion error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  })
);

export default router;
