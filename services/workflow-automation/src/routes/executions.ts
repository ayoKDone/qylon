import { Request, Response, Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { WorkflowEngine } from '../services/WorkflowEngine';
import {
    ApiResponse,
    ExecuteWorkflowSchema,
    PaginatedResponse
} from '../types';
import { logger } from '../utils/logger';

const router = Router();
const workflowEngine = new WorkflowEngine();

/**
 * Execute a workflow
 */
router.post('/execute', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    // Validate request body
    const validationResult = ExecuteWorkflowSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Invalid request data',
        details: validationResult.error.errors,
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { workflow_id, input_data, context } = validationResult.data;

    // Execute workflow
    const execution = await workflowEngine.executeWorkflow(
      workflow_id,
      input_data,
      context
    );

    logger.info('Workflow execution started', {
      workflowId: workflow_id,
      executionId: execution.id,
      userId
    });

    const response: ApiResponse<any> = {
      success: true,
      data: {
        id: execution.id,
        workflow_id: execution.workflow_id,
        status: execution.status,
        current_state: execution.current_state,
        started_at: execution.started_at,
        estimated_completion: execution.completed_at
      },
      timestamp: new Date().toISOString()
    };

    res.status(202).json(response);

  } catch (error) {
    logger.error('Workflow execution error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

/**
 * Get execution by ID
 */
router.get('/:executionId', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;
    const userId = (req as any).user?.id;

    const execution = await workflowEngine.getExecution(executionId);

    if (!execution) {
      res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Execution not found',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const response: ApiResponse<any> = {
      success: true,
      data: execution,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);

  } catch (error) {
    logger.error('Execution fetch error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

/**
 * Get executions for a workflow
 */
router.get('/workflow/:workflowId', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { workflowId } = req.params;
    const userId = (req as any).user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { executions, total } = await workflowEngine.getExecutions(
      workflowId,
      page,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<any> = {
      success: true,
      data: executions,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);

  } catch (error) {
    logger.error('Executions fetch error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

/**
 * Cancel an execution
 */
router.post('/:executionId/cancel', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { executionId } = req.params;
    const userId = (req as any).user?.id;

    await workflowEngine.cancelExecution(executionId);

    logger.info('Execution cancelled', {
      executionId,
      userId
    });

    res.status(200).json({
      success: true,
      message: 'Execution cancelled successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Execution cancellation error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

export default router;
