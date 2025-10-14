import { Request, Response, Router } from 'express';
import Joi from 'joi';
import { asyncHandler, createError, validationErrorHandler } from '../middleware/errorHandler';
import { ConversionRecoveryService } from '../services/ConversionRecoveryService';
import {
  CreateRecoveryCampaignRequest,
  RecoveryResult,
  UpdateRecoveryCampaignRequest,
} from '../types';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const createRecoveryCampaignSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional(),
  targetSegment: Joi.string().min(1).max(100).required(),
  recoveryStrategy: Joi.string()
    .valid('email_sequence', 'personalized_outreach', 'incentive_offer', 'feature_highlight')
    .required(),
  clientId: Joi.string().uuid().optional(),
});

const updateRecoveryCampaignSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(1000).optional(),
  targetSegment: Joi.string().min(1).max(100).optional(),
  recoveryStrategy: Joi.string()
    .valid('email_sequence', 'personalized_outreach', 'incentive_offer', 'feature_highlight')
    .optional(),
  isActive: Joi.boolean().optional(),
});

const recoveryResultSchema = Joi.object({
  outcome: Joi.string().valid('converted', 'not_converted', 'partial').required(),
  conversionValue: Joi.number().min(0).optional(),
  feedback: Joi.string().max(1000).optional(),
  followUpRequired: Joi.boolean().default(false),
});

// Initialize service
const conversionRecoveryService = new ConversionRecoveryService(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!,
  process.env['OPENAI_API_KEY']!,
);

/**
 * Create a new recovery campaign
 */
router.post(
  '/campaigns',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { error, value } = createRecoveryCampaignSchema.validate(req.body);
    if (error) {
      throw createError(
        `Validation error: ${error.details?.[0]?.message || 'Unknown validation error'}`,
        400,
        'VALIDATION_ERROR',
      );
    }

    const request: CreateRecoveryCampaignRequest = value;
    const campaign = await conversionRecoveryService.createRecoveryCampaign(userId, request);

    logger.info('Recovery campaign created', {
      campaignId: campaign.id,
      userId,
      clientId: request.clientId,
      strategy: request.recoveryStrategy,
    });

    res.status(201).json({
      success: true,
      data: campaign,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Get recovery campaigns for the authenticated user
 */
router.get(
  '/campaigns',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const clientId = req.query['clientId'] as string;
    const campaigns = await conversionRecoveryService.getRecoveryCampaigns(userId, clientId);

    res.status(200).json({
      success: true,
      data: campaigns,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Get a specific recovery campaign
 */
router.get(
  '/campaigns/:campaignId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { campaignId } = req.params;
    if (!campaignId) {
      throw createError('Campaign ID is required', 400, 'MISSING_CAMPAIGN_ID');
    }
    const campaign = await conversionRecoveryService.getRecoveryCampaign(campaignId, userId);

    if (!campaign) {
      throw createError('Recovery campaign not found', 404, 'NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: campaign,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Update a recovery campaign
 */
router.put(
  '/campaigns/:campaignId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { campaignId } = req.params;
    if (!campaignId) {
      throw createError('Campaign ID is required', 400, 'MISSING_CAMPAIGN_ID');
    }
    const { error, value } = updateRecoveryCampaignSchema.validate(req.body);
    if (error) {
      throw createError(
        `Validation error: ${error.details?.[0]?.message || 'Unknown validation error'}`,
        400,
        'VALIDATION_ERROR',
      );
    }

    const request: UpdateRecoveryCampaignRequest = value;
    const campaign = await conversionRecoveryService.updateRecoveryCampaign(
      campaignId,
      userId,
      request,
    );

    logger.info('Recovery campaign updated', {
      campaignId,
      userId,
      updates: Object.keys(value),
    });

    res.status(200).json({
      success: true,
      data: campaign,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Delete a recovery campaign
 */
router.delete(
  '/campaigns/:campaignId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { campaignId } = req.params;
    if (!campaignId) {
      throw createError('Campaign ID is required', 400, 'MISSING_CAMPAIGN_ID');
    }
    await conversionRecoveryService.deleteRecoveryCampaign(campaignId, userId);

    logger.info('Recovery campaign deleted', {
      campaignId,
      userId,
    });

    res.status(204).send();
  }),
);

/**
 * Execute a recovery campaign for a specific user
 */
router.post(
  '/campaigns/:campaignId/execute',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { campaignId } = req.params;
    if (!campaignId) {
      throw createError('Campaign ID is required', 400, 'MISSING_CAMPAIGN_ID');
    }
    const { targetUserId, clientId } = req.body;

    if (!targetUserId) {
      throw createError('targetUserId is required', 400, 'VALIDATION_ERROR');
    }

    const execution = await conversionRecoveryService.executeRecoveryCampaign(
      campaignId,
      targetUserId,
      userId,
      clientId,
    );

    logger.info('Recovery campaign executed', {
      executionId: execution.id,
      campaignId,
      targetUserId,
      userId,
      clientId,
    });

    res.status(201).json({
      success: true,
      data: execution,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Get recovery executions for a campaign
 */
router.get(
  '/campaigns/:campaignId/executions',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { campaignId } = req.params;
    if (!campaignId) {
      throw createError('Campaign ID is required', 400, 'MISSING_CAMPAIGN_ID');
    }
    const executions = await conversionRecoveryService.getRecoveryExecutions(campaignId, userId);

    res.status(200).json({
      success: true,
      data: executions,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Complete a recovery execution
 */
router.post(
  '/executions/:executionId/complete',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { executionId } = req.params;
    if (!executionId) {
      throw createError('Execution ID is required', 400, 'MISSING_EXECUTION_ID');
    }
    const { error, value } = recoveryResultSchema.validate(req.body);
    if (error) {
      throw createError(
        `Validation error: ${error.details?.[0]?.message || 'Unknown validation error'}`,
        400,
        'VALIDATION_ERROR',
      );
    }

    const result: RecoveryResult = {
      ...value,
      completedAt: new Date().toISOString(),
    };

    await conversionRecoveryService.completeRecoveryExecution(executionId, result);

    logger.info('Recovery execution completed', {
      executionId,
      userId,
      outcome: result.outcome,
      conversionValue: result.conversionValue,
    });

    res.status(200).json({
      success: true,
      data: { message: 'Recovery execution completed successfully' },
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Get recovery analytics
 */
router.get(
  '/analytics',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const clientId = req.query['clientId'] as string;
    const analytics = await conversionRecoveryService.getRecoveryAnalytics(userId, clientId);

    res.status(200).json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    });
  }),
);

// Add validation error handler
router.use(validationErrorHandler);

export default router;
