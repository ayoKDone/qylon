import { createClient } from '@supabase/supabase-js';
import { Request, Response, Router } from 'express';
import { requireClientAccess } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { WorkflowEngine } from '../services/WorkflowEngine';
import {
  ApiResponse,
  CreateWorkflowSchema,
  PaginatedResponse,
  Workflow,
  WorkflowStatus,
} from '../types';
import { logger } from '../utils/logger';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const workflowEngine = new WorkflowEngine();

/**
 * Create a new workflow
 */
router.post(
  '/',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const clientId = req.body.client_id;

      // Validate request body
      const validationResult = CreateWorkflowSchema.safeParse(req.body);
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

      const workflowData = validationResult.data;

      // Create workflow in database
      const { data: workflow, error } = await supabase
        .from('workflows')
        .insert({
          client_id: clientId,
          name: workflowData.name,
          description: workflowData.description,
          definition: workflowData.definition,
          status: WorkflowStatus.DRAFT,
          version: 1,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create workflow', {
          userId,
          clientId,
          error: error.message,
        });
        res.status(500).json({
          success: false,
          error: 'DatabaseError',
          message: 'Failed to create workflow',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info('Workflow created successfully', {
        workflowId: workflow.id,
        userId,
        clientId,
      });

      const response: ApiResponse<Workflow> = {
        success: true,
        data: {
          id: workflow.id,
          client_id: workflow.client_id,
          name: workflow.name,
          description: workflow.description,
          definition: workflow.definition,
          status: workflow.status as WorkflowStatus,
          version: workflow.version,
          is_active: workflow.is_active,
          created_at: new Date(workflow.created_at),
          updated_at: new Date(workflow.updated_at),
        },
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Workflow creation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  })
);

/**
 * Get workflows for a client
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

      // Build query
      let query = supabase
        .from('workflows')
        .select('*', { count: 'exact' })
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }

      const { data: workflows, error, count } = await query;

      if (error) {
        logger.error('Failed to fetch workflows', {
          userId,
          clientId,
          error: error.message,
        });
        res.status(500).json({
          success: false,
          error: 'DatabaseError',
          message: 'Failed to fetch workflows',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const totalPages = Math.ceil((count || 0) / limit);

      const response: PaginatedResponse<Workflow> = {
        success: true,
        data:
          workflows?.map(workflow => ({
            id: workflow.id,
            client_id: workflow.client_id,
            name: workflow.name,
            description: workflow.description,
            definition: workflow.definition,
            status: workflow.status as WorkflowStatus,
            version: workflow.version,
            is_active: workflow.is_active,
            created_at: new Date(workflow.created_at),
            updated_at: new Date(workflow.updated_at),
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
      logger.error('Workflow fetch error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  })
);

/**
 * Get a specific workflow
 */
router.get(
  '/:workflowId',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { workflowId } = req.params;
      const userId = (req as any).user?.id;

      const { data: workflow, error } = await supabase
        .from('workflows')
        .select(
          `
        *,
        clients!inner(user_id)
      `
        )
        .eq('id', workflowId)
        .eq('clients.user_id', userId)
        .single();

      if (error || !workflow) {
        logger.warn('Workflow not found or access denied', {
          workflowId,
          userId,
          error: error?.message,
        });
        res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Workflow not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const response: ApiResponse<Workflow> = {
        success: true,
        data: {
          id: workflow.id,
          client_id: workflow.client_id,
          name: workflow.name,
          description: workflow.description,
          definition: workflow.definition,
          status: workflow.status as WorkflowStatus,
          version: workflow.version,
          is_active: workflow.is_active,
          created_at: new Date(workflow.created_at),
          updated_at: new Date(workflow.updated_at),
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Workflow fetch error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  })
);

/**
 * Update a workflow
 */
router.put(
  '/:workflowId',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { workflowId } = req.params;
      const userId = (req as any).user?.id;

      // Check if user has access to this workflow
      const { data: existingWorkflow, error: fetchError } = await supabase
        .from('workflows')
        .select(
          `
        *,
        clients!inner(user_id)
      `
        )
        .eq('id', workflowId)
        .eq('clients.user_id', userId)
        .single();

      if (fetchError || !existingWorkflow) {
        logger.warn('Workflow not found or access denied for update', {
          workflowId,
          userId,
          error: fetchError?.message,
        });
        res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Workflow not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (req.body.name) updateData.name = req.body.name;
      if (req.body.description !== undefined)
        updateData.description = req.body.description;
      if (req.body.definition) updateData.definition = req.body.definition;
      if (req.body.status) updateData.status = req.body.status;

      // Update workflow
      const { data: updatedWorkflow, error } = await supabase
        .from('workflows')
        .update(updateData)
        .eq('id', workflowId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update workflow', {
          workflowId,
          userId,
          error: error.message,
        });
        res.status(500).json({
          success: false,
          error: 'DatabaseError',
          message: 'Failed to update workflow',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info('Workflow updated successfully', {
        workflowId,
        userId,
      });

      const response: ApiResponse<Workflow> = {
        success: true,
        data: {
          id: updatedWorkflow.id,
          client_id: updatedWorkflow.client_id,
          name: updatedWorkflow.name,
          description: updatedWorkflow.description,
          definition: updatedWorkflow.definition,
          status: updatedWorkflow.status as WorkflowStatus,
          version: updatedWorkflow.version,
          is_active: updatedWorkflow.is_active,
          created_at: new Date(updatedWorkflow.created_at),
          updated_at: new Date(updatedWorkflow.updated_at),
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Workflow update error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  })
);

/**
 * Delete a workflow
 */
router.delete(
  '/:workflowId',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { workflowId } = req.params;
      const userId = (req as any).user?.id;

      // Check if user has access to this workflow
      const { data: workflow, error: fetchError } = await supabase
        .from('workflows')
        .select(
          `
        *,
        clients!inner(user_id)
      `
        )
        .eq('id', workflowId)
        .eq('clients.user_id', userId)
        .single();

      if (fetchError || !workflow) {
        logger.warn('Workflow not found or access denied for deletion', {
          workflowId,
          userId,
          error: fetchError?.message,
        });
        res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Workflow not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Soft delete workflow
      const { error } = await supabase
        .from('workflows')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workflowId);

      if (error) {
        logger.error('Failed to delete workflow', {
          workflowId,
          userId,
          error: error.message,
        });
        res.status(500).json({
          success: false,
          error: 'DatabaseError',
          message: 'Failed to delete workflow',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info('Workflow deleted successfully', {
        workflowId,
        userId,
      });

      res.status(200).json({
        success: true,
        message: 'Workflow deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Workflow deletion error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  })
);

export default router;
