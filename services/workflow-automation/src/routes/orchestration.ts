import { Request, Response, Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { WorkflowOrchestrationService } from '../services/WorkflowOrchestrationService';
import { logger } from '../utils/logger';

const router: Router = Router();

// Service instance - will be injected from main service
let orchestrationService: WorkflowOrchestrationService | null = null;

export function setOrchestrationService(service: WorkflowOrchestrationService): void {
  orchestrationService = service;
}

// Start orchestration service
router.post(
  '/start',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      if (!orchestrationService) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'Orchestration service not initialized',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await orchestrationService.start();

      logger.info('Orchestration service started via API');

      res.status(200).json({
        success: true,
        message: 'Orchestration service started successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to start orchestration service', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  }),
);

// Stop orchestration service
router.post(
  '/stop',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      if (!orchestrationService) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'Orchestration service not initialized',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await orchestrationService.stop();

      logger.info('Orchestration service stopped via API');

      res.status(200).json({
        success: true,
        message: 'Orchestration service stopped successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to stop orchestration service', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  }),
);

// Process event manually
router.post(
  '/events/process',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      if (!orchestrationService) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'Orchestration service not initialized',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const {
        eventId,
        aggregateId,
        aggregateType,
        eventType,
        eventData,
        eventVersion,
        correlationId,
        causationId,
        metadata,
      } = req.body;

      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!eventId || !aggregateId || !aggregateType || !eventType || !eventData) {
        res.status(400).json({
          error: 'Bad Request',
          message:
            'Missing required fields: eventId, aggregateId, aggregateType, eventType, eventData',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const event = {
        id: eventId,
        aggregateId,
        aggregateType,
        eventType,
        eventData,
        eventVersion: eventVersion || 1,
        timestamp: new Date(),
        userId,
        correlationId,
        causationId,
        metadata,
      };

      const result = await orchestrationService.processEvent(event);

      logger.info('Event processed via API', {
        eventId,
        eventType,
        success: result.success,
        workflowsTriggered: result.workflowsTriggered,
        integrationActionsExecuted: result.integrationActionsExecuted,
        userId,
      });

      res.status(200).json({
        success: true,
        result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to process event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  }),
);

// Get health status
router.get(
  '/health',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      if (!orchestrationService) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'Orchestration service not initialized',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const healthStatus = await orchestrationService.getHealthStatus();

      const statusCode = healthStatus.overall ? 200 : 503;

      res.status(statusCode).json({
        success: healthStatus.overall,
        health: healthStatus,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to get health status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  }),
);

// Get service configuration
router.get(
  '/config',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      if (!orchestrationService) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'Orchestration service not initialized',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const config = orchestrationService.getConfig();

      res.status(200).json({
        success: true,
        config,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to get service configuration', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  }),
);

// Update service configuration
router.put(
  '/config',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      if (!orchestrationService) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'Orchestration service not initialized',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const newConfig = req.body;

      orchestrationService.updateConfig(newConfig);

      logger.info('Service configuration updated via API', {
        newConfig,
        userId: (req as any).user?.id,
      });

      res.status(200).json({
        success: true,
        message: 'Configuration updated successfully',
        config: orchestrationService.getConfig(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to update service configuration', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  }),
);

// Get processing queue status
router.get(
  '/queue/status',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      if (!orchestrationService) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'Orchestration service not initialized',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const queueStatus = orchestrationService.getProcessingQueueStatus();

      res.status(200).json({
        success: true,
        queueStatus,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to get processing queue status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  }),
);

// Clear all caches
router.post(
  '/cache/clear',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      if (!orchestrationService) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'Orchestration service not initialized',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      orchestrationService.clearCaches();

      logger.info('Caches cleared via API', {
        userId: (req as any).user?.id,
      });

      res.status(200).json({
        success: true,
        message: 'All caches cleared successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to clear caches', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  }),
);

// Reset daily metrics
router.post(
  '/metrics/reset',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      if (!orchestrationService) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'Orchestration service not initialized',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      orchestrationService.resetDailyMetrics();

      logger.info('Daily metrics reset via API', {
        userId: (req as any).user?.id,
      });

      res.status(200).json({
        success: true,
        message: 'Daily metrics reset successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to reset daily metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  }),
);

// Get detailed statistics
router.get(
  '/statistics',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      if (!orchestrationService) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'Orchestration service not initialized',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const statistics = await orchestrationService.getDetailedStatistics();

      res.status(200).json({
        success: true,
        statistics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to get detailed statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  }),
);

export default router;
