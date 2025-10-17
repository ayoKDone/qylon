import { Request, Response, Router } from 'express';
import Joi from 'joi';
import { asyncHandler, createError, validationErrorHandler } from '../middleware/errorHandler';
import { UserBehaviorTrackingService } from '../services/UserBehaviorTrackingService';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const trackEventSchema = Joi.object({
  eventType: Joi.string().min(1).max(100).required(),
  eventData: Joi.object().required(),
  sessionId: Joi.string().uuid().optional(),
  ipAddress: Joi.string().ip().optional(),
  userAgent: Joi.string().max(500).optional(),
  clientId: Joi.string().uuid().optional(),
});

// Initialize service
const behaviorTrackingService = new UserBehaviorTrackingService(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!,
);

/**
 * Track a user behavior event
 */
router.post(
  '/events',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { error, value } = trackEventSchema.validate(req.body);
    if (error) {
      throw createError(
        `Validation error: ${error.details?.[0]?.message || 'Unknown validation error'}`,
        400,
        'VALIDATION_ERROR',
      );
    }

    const { eventType, eventData, sessionId, clientId } = value;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const event = await behaviorTrackingService.trackEvent(
      userId,
      eventType,
      eventData,
      sessionId,
      ipAddress,
      userAgent,
      clientId,
    );

    logger.info('User behavior event tracked', {
      eventId: event.id,
      userId,
      eventType,
      sessionId,
      clientId,
    });

    res.status(201).json({
      success: true,
      data: event,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Get user behavior profile
 */
router.get(
  '/profile',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const clientId = req.query['clientId'] as string;
    const profile = await behaviorTrackingService.getBehaviorProfile(userId, clientId);

    if (!profile) {
      throw createError('Behavior profile not found', 404, 'NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: profile,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Get behavior events for a user
 */
router.get(
  '/events',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const clientId = req.query['clientId'] as string;
    const eventType = req.query['eventType'] as string;
    const limit = parseInt(req.query['limit'] as string) || 100;
    const offset = parseInt(req.query['offset'] as string) || 0;

    const events = await behaviorTrackingService.getBehaviorEvents(
      userId,
      clientId,
      eventType,
      limit,
      offset,
    );

    res.status(200).json({
      success: true,
      data: events,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Get users at risk of churning (admin only)
 */
router.get(
  '/at-risk',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    // Check if user is admin
    const userRole = (req as any).user?.role;
    if (userRole !== 'admin' && userRole !== 'msp_admin') {
      throw createError('Insufficient permissions', 403, 'FORBIDDEN');
    }

    const clientId = req.query['clientId'] as string;
    const minRiskScore = parseInt(req.query['minRiskScore'] as string) || 50;
    const limit = parseInt(req.query['limit'] as string) || 100;

    const atRiskUsers = await behaviorTrackingService.getAtRiskUsers(clientId, minRiskScore, limit);

    res.status(200).json({
      success: true,
      data: atRiskUsers,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Get behavior analytics
 */
router.get(
  '/analytics',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const clientId = req.query['clientId'] as string;
    const startDate = req.query['startDate'] as string;
    const endDate = req.query['endDate'] as string;

    const analytics = await behaviorTrackingService.getBehaviorAnalytics(
      userId,
      clientId,
      startDate,
      endDate,
    );

    res.status(200).json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * Resolve a risk factor
 */
router.post(
  '/risk-factors/:factor/resolve',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

  const { factor } = req.params;
  const clientId = req.body.clientId as string | undefined;

  if (!factor) {
    return res.status(400).json({ error: 'Risk factor is required' });
  }

  await behaviorTrackingService.resolveRiskFactor(
    userId,
    factor,
    ...(clientId ? [clientId] : []),
  );

    logger.info('Risk factor resolved', {
      userId,
      clientId,
      factor,
    });

    return res.status(200).json({
      success: true,
      data: { message: 'Risk factor resolved successfully' },
      timestamp: new Date().toISOString(),
    });
  }),
);

// Add validation error handler
router.use(validationErrorHandler);

export default router;
