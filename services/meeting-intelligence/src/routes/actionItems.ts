import { createClient } from '@supabase/supabase-js';
import { Request, Response, Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse, PaginatedResponse } from '../types';
import { logger } from '../utils/logger';

const router: Router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * Get action items for a meeting
 */
router.get(
  '/meeting/:meetingId',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { meetingId } = req.params;
      const userId = (req as any).user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;

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

      // Build query for action items
      let query = supabase
        .from('action_items')
        .select('*', { count: 'exact' })
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Apply status filter
      if (status) {
        query = query.eq('status', status);
      }

      const { data: actionItems, error, count } = await query;

      if (error) {
        logger.error('Failed to fetch action items', {
          meetingId,
          userId,
          error: error.message,
        });
        res.status(500).json({
          success: false,
          error: 'DatabaseError',
          message: 'Failed to fetch action items',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const totalPages = Math.ceil((count || 0) / limit);

      const response: PaginatedResponse<any> = {
        success: true,
        data: actionItems || [],
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
      logger.error('Action items fetch error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }),
);

/**
 * Update action item status
 */
router.patch(
  '/:actionItemId',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { actionItemId } = req.params;
      const userId = (req as any).user?.id;
      const { status, assignee, due_date } = req.body;

      // Check if user has access to this action item
      const { data: actionItem, error: fetchError } = await supabase
        .from('action_items')
        .select(
          `
        *,
        meetings!inner(
          id,
          clients!inner(user_id)
        )
      `,
        )
        .eq('id', actionItemId)
        .eq('meetings.clients.user_id', userId)
        .single();

      if (fetchError || !actionItem) {
        logger.warn('Action item not found or access denied', {
          actionItemId,
          userId,
          error: fetchError?.message,
        });
        res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Action item not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (status) updateData.status = status;
      if (assignee !== undefined) updateData.assignee = assignee;
      if (due_date) updateData.due_date = new Date(due_date).toISOString();

      // Update action item
      const { data: updatedActionItem, error } = await supabase
        .from('action_items')
        .update(updateData)
        .eq('id', actionItemId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update action item', {
          actionItemId,
          userId,
          error: error.message,
        });
        res.status(500).json({
          success: false,
          error: 'DatabaseError',
          message: 'Failed to update action item',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info('Action item updated successfully', {
        actionItemId,
        userId,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: updatedActionItem,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Action item update error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }),
);

export default router;
