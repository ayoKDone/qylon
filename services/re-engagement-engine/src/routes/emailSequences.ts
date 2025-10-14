import { Request, Response, Router } from 'express';
import Joi from 'joi';
import { asyncHandler, createError, validationErrorHandler } from '../middleware/errorHandler';
import { EmailSequenceService } from '../services/EmailSequenceService';
import { CreateEmailSequenceRequest, UpdateEmailSequenceRequest } from '../types';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const createEmailSequenceSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional(),
  triggerEvent: Joi.string().min(1).max(100).required(),
  steps: Joi.array()
    .items(
      Joi.object({
        delayHours: Joi.number().min(0).max(8760).required(), // Max 1 year
        subject: Joi.string().min(1).max(255).required(),
        template: Joi.string().min(1).required(),
        variables: Joi.object().optional(),
        conditions: Joi.array()
          .items(
            Joi.object({
              field: Joi.string().required(),
              operator: Joi.string()
                .valid('equals', 'not_equals', 'contains', 'greater_than', 'less_than')
                .required(),
              value: Joi.any().required(),
            }),
          )
          .optional(),
        isActive: Joi.boolean().default(true),
      }),
    )
    .min(1)
    .required(),
  clientId: Joi.string().uuid().optional(),
});

const updateEmailSequenceSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(1000).optional(),
  triggerEvent: Joi.string().min(1).max(100).optional(),
  steps: Joi.array()
    .items(
      Joi.object({
        delayHours: Joi.number().min(0).max(8760).required(),
        subject: Joi.string().min(1).max(255).required(),
        template: Joi.string().min(1).required(),
        variables: Joi.object().optional(),
        conditions: Joi.array()
          .items(
            Joi.object({
              field: Joi.string().required(),
              operator: Joi.string()
                .valid('equals', 'not_equals', 'contains', 'greater_than', 'less_than')
                .required(),
              value: Joi.any().required(),
            }),
          )
          .optional(),
        isActive: Joi.boolean().default(true),
      }),
    )
    .min(1)
    .optional(),
  isActive: Joi.boolean().optional(),
});

// Initialize service
const emailSequenceService = new EmailSequenceService(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!,
  {
    provider: (process.env['EMAIL_PROVIDER'] as any) || 'sendgrid',
    apiKey: process.env['SENDGRID_API_KEY'] || '',
    fromEmail: process.env['FROM_EMAIL'] || 'noreply@qylon.ai',
    fromName: process.env['FROM_NAME'] || 'Qylon',
  },
);

/**
 * Create a new email sequence
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { error, value } = createEmailSequenceSchema.validate(req.body);
    if (error) {
      throw createError(
        `Validation error: ${error.details?.[0]?.message || 'Unknown validation error'}`,
        400,
        'VALIDATION_ERROR',
      );
    }

    const request: CreateEmailSequenceRequest = value;
    const sequence = await emailSequenceService.createEmailSequence(userId, request);

    logger.info('Email sequence created', {
      sequenceId: sequence.id,
      userId,
      clientId: request.clientId,
      stepCount: sequence.steps.length,
    });

    res.status(201).json({
      success: true,
      data: sequence,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Get email sequences for the authenticated user
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const clientId = req.query['clientId'] as string;
    const sequences = await emailSequenceService.getEmailSequences(userId, clientId);

    res.status(200).json({
      success: true,
      data: sequences,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Get a specific email sequence
 */
router.get(
  '/:sequenceId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { sequenceId } = req.params;
    if (!sequenceId) {
      throw createError('Sequence ID is required', 400, 'MISSING_SEQUENCE_ID');
    }
    const sequence = await emailSequenceService.getEmailSequence(sequenceId, userId);

    if (!sequence) {
      throw createError('Email sequence not found', 404, 'NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: sequence,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Update an email sequence
 */
router.put(
  '/:sequenceId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { sequenceId } = req.params;
    if (!sequenceId) {
      throw createError('Sequence ID is required', 400, 'MISSING_SEQUENCE_ID');
    }
    const { error, value } = updateEmailSequenceSchema.validate(req.body);
    if (error) {
      throw createError(
        `Validation error: ${error.details?.[0]?.message || 'Unknown validation error'}`,
        400,
        'VALIDATION_ERROR',
      );
    }

    const request: UpdateEmailSequenceRequest = value;
    const sequence = await emailSequenceService.updateEmailSequence(sequenceId, userId, request);

    logger.info('Email sequence updated', {
      sequenceId,
      userId,
      updates: Object.keys(value),
    });

    res.status(200).json({
      success: true,
      data: sequence,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Delete an email sequence
 */
router.delete(
  '/:sequenceId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { sequenceId } = req.params;
    if (!sequenceId) {
      throw createError('Sequence ID is required', 400, 'MISSING_SEQUENCE_ID');
    }
    await emailSequenceService.deleteEmailSequence(sequenceId, userId);

    logger.info('Email sequence deleted', {
      sequenceId,
      userId,
    });

    res.status(204).send();
  }),
);

/**
 * Start an email sequence execution
 */
router.post(
  '/:sequenceId/execute',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { sequenceId } = req.params;
    if (!sequenceId) {
      throw createError('Sequence ID is required', 400, 'MISSING_SEQUENCE_ID');
    }
    const { clientId, metadata } = req.body;

    const execution = await emailSequenceService.startEmailSequenceExecution(
      sequenceId,
      userId,
      clientId,
      metadata || {},
    );

    logger.info('Email sequence execution started', {
      executionId: execution.id,
      sequenceId,
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
 * Get executions for a user
 */
router.get(
  '/executions/list',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const clientId = req.query['clientId'] as string;
    const executions = await emailSequenceService.getExecutions(userId, clientId);

    res.status(200).json({
      success: true,
      data: executions,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Get delivery statistics
 */
router.get(
  '/stats/delivery',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const clientId = req.query['clientId'] as string;
    const stats = await emailSequenceService.getDeliveryStats(userId, clientId);

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  }),
);

// Add validation error handler
router.use(validationErrorHandler);

export default router;
