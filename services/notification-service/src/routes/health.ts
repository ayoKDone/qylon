import { Request, Response, Router } from 'express';
import { ApiResponse, HealthData } from '../types';
import { logger } from '../utils/logger';

const router = Router();

// Health check endpoint
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const healthData: HealthData = {
      service: 'notification-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env['NODE_ENV'] || 'development',
      channels: {
        email: 'available',
        sms: 'available',
        push: 'available',
        webhook: 'available',
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
    const requiredServices = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];

    const missingServices = requiredServices.filter(service => !process.env[service]);

    if (missingServices.length > 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Missing required services: ${missingServices.join(', ')}`,
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
    const response: ApiResponse<{ status: string; uptime: number }> = {
      success: true,
      data: {
        status: 'alive',
        uptime: process.uptime(),
      },
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

export default router;
