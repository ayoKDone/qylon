import { createClient } from '@supabase/supabase-js';
import { Request, Response, Router } from 'express';
import { OpenAIService } from '../services/OpenAIService';
import { RecallAIService } from '../services/RecallAIService';
import { logger } from '../utils/logger';

const router = Router();

// Initialize services for health checks
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const recallAIService = new RecallAIService();
const openAIService = new OpenAIService();

/**
 * Basic health check endpoint
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      service: 'meeting-intelligence',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    logger.error('Health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      service: 'meeting-intelligence',
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Detailed health check with dependencies
 */
router.get('/detailed', async (req: Request, res: Response): Promise<void> => {
  try {
    const healthChecks = {
      service: 'meeting-intelligence',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      dependencies: {
        database: { status: 'unknown', responseTime: 0 },
        recallAI: { status: 'unknown', responseTime: 0 },
        openAI: { status: 'unknown', responseTime: 0 },
      },
    };

    // Check database connection
    const dbStartTime = Date.now();
    try {
      const { error } = await supabase.from('meetings').select('id').limit(1);
      healthChecks.dependencies.database = {
        status: error ? 'unhealthy' : 'healthy',
        responseTime: Date.now() - dbStartTime,
      };
    } catch (error) {
      healthChecks.dependencies.database = {
        status: 'unhealthy',
        responseTime: Date.now() - dbStartTime,
      };
    }

    // Check Recall.ai service
    const recallStartTime = Date.now();
    try {
      const isHealthy = await recallAIService.healthCheck();
      healthChecks.dependencies.recallAI = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - recallStartTime,
      };
    } catch (error) {
      healthChecks.dependencies.recallAI = {
        status: 'unhealthy',
        responseTime: Date.now() - recallStartTime,
      };
    }

    // Check OpenAI service
    const openAIStartTime = Date.now();
    try {
      const isHealthy = await openAIService.healthCheck();
      healthChecks.dependencies.openAI = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - openAIStartTime,
      };
    } catch (error) {
      healthChecks.dependencies.openAI = {
        status: 'unhealthy',
        responseTime: Date.now() - openAIStartTime,
      };
    }

    // Determine overall health
    const allHealthy = Object.values(healthChecks.dependencies).every(
      dep => dep.status === 'healthy'
    );

    healthChecks.status = allHealthy ? 'healthy' : 'degraded';

    const statusCode = allHealthy ? 200 : 503;

    logger.info('Detailed health check completed', {
      status: healthChecks.status,
      dependencies: healthChecks.dependencies,
    });

    res.status(statusCode).json(healthChecks);
  } catch (error) {
    logger.error('Detailed health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      success: false,
      service: 'meeting-intelligence',
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Readiness probe for Kubernetes
 */
router.get('/ready', async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if all critical dependencies are available
    const { error } = await supabase.from('meetings').select('id').limit(1);

    if (error) {
      res.status(503).json({
        success: false,
        status: 'not ready',
        reason: 'Database connection failed',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      success: true,
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Readiness check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(503).json({
      success: false,
      status: 'not ready',
      reason: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Liveness probe for Kubernetes
 */
router.get('/live', (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

export default router;
