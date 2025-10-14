import { Request, Response, Router } from 'express';
import { ApiResponse, HealthData } from '../types';
import { logger } from '../utils/logger';

const router = Router();

// Health check endpoint
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const healthData: HealthData = {
      service: 're-engagement-engine',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env['NODE_ENV'] || 'development',
      features: {
        emailSequences: 'available',
        behaviorTracking: 'available',
        conversionRecovery: 'available',
      },
    };

    const response: ApiResponse<HealthData> = {
      success: true,
      data: healthData,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    const response: ApiResponse<null> = {
      success: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
});

// Readiness check for Kubernetes
router.get('/ready', async (_req: Request, res: Response): Promise<void> => {
  try {
    // Check if all required services are available
    const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Missing required environment variables: ${missingEnvVars.join(', ')}`,
        timestamp: new Date().toISOString(),
      };

      res.status(503).json(response);
      return;
    }

    const response: ApiResponse<{ status: string }> = {
      success: true,
      data: { status: 'ready' },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Readiness check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    const response: ApiResponse<null> = {
      success: false,
      error: 'Readiness check failed',
      timestamp: new Date().toISOString(),
    };

    res.status(503).json(response);
  }
});

// Liveness check for Kubernetes
router.get('/live', async (_req: Request, res: Response): Promise<void> => {
  try {
    const response: ApiResponse<{ status: string }> = {
      success: true,
      data: { status: 'alive' },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Liveness check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    const response: ApiResponse<null> = {
      success: false,
      error: 'Liveness check failed',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
});

// Detailed health check
router.get('/detailed', async (_req: Request, res: Response): Promise<void> => {
  try {
    const healthData: HealthData = {
      service: 're-engagement-engine',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env['NODE_ENV'] || 'development',
      features: {
        emailSequences: 'available',
        behaviorTracking: 'available',
        conversionRecovery: 'available',
      },
    };

    const response: ApiResponse<HealthData> = {
      success: true,
      data: healthData,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Detailed health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    const response: ApiResponse<null> = {
      success: false,
      error: 'Detailed health check failed',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
});

export default router;
