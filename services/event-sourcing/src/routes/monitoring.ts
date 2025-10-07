import { Request, Response, Router } from 'express';
import { EventSubscriber } from '../services/EventSubscriber';
import { logger } from '../utils/logger';

const router: Router = Router();

// EventSubscriber will be injected from the main service
let eventSubscriber: EventSubscriber | null = null;

export function setEventSubscriberForMonitoring(
  subscriber: EventSubscriber
): void {
  eventSubscriber = subscriber;
}

/**
 * Get event processing metrics
 */
router.get('/metrics/events', (req: Request, res: Response) => {
  try {
    if (!eventSubscriber) {
      res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Event subscriber not initialized',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const metrics = eventSubscriber.getEventProcessingMetrics();

    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get event processing metrics', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve event processing metrics',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Get workflow trigger metrics
 */
router.get('/metrics/workflows', (req: Request, res: Response) => {
  try {
    if (!eventSubscriber) {
      res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Event subscriber not initialized',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const metrics = eventSubscriber.getWorkflowTriggerMetrics();

    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get workflow trigger metrics', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve workflow trigger metrics',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Get system health status
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    if (!eventSubscriber) {
      res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Event subscriber not initialized',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const health = eventSubscriber.getSystemHealth();

    // Set appropriate HTTP status based on health
    const statusCode =
      health.status === 'healthy'
        ? 200
        : health.status === 'degraded'
          ? 200
          : 503;

    res.status(statusCode).json({
      success: true,
      data: health,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get system health', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve system health',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Reset metrics (useful for testing)
 */
router.post('/metrics/reset', (req: Request, res: Response) => {
  try {
    if (!eventSubscriber) {
      res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Event subscriber not initialized',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    eventSubscriber.resetMetrics();

    logger.info('Metrics reset requested', {
      userId: (req as any).user?.id,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to reset metrics', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to reset metrics',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Get detailed system status
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    if (!eventSubscriber) {
      res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Event subscriber not initialized',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const eventMetrics = eventSubscriber.getEventProcessingMetrics();
    const workflowMetrics = eventSubscriber.getWorkflowTriggerMetrics();
    const health = eventSubscriber.getSystemHealth();

    const status = {
      service: 'Event Sourcing Service',
      version: '1.0.0',
      uptime: process.uptime(),
      health,
      metrics: {
        events: eventMetrics,
        workflows: workflowMetrics,
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
    };

    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get system status', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve system status',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
