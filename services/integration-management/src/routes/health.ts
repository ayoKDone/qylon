import { Request, Response, Router } from 'express';
import { ApiResponse } from '../types';
import { logger } from '../utils/logger';

const router = Router();

// Health check endpoint
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const healthData = {
      service: 'integration-management',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env['NODE_ENV'] || 'development',
      integrations: {
        crm: {
          salesforce: 'available',
          hubspot: 'available',
          pipedrive: 'available',
        },
        communication: {
          slack: 'available',
          discord: 'available',
          teams: 'available',
        },
        email: {
          mailchimp: 'available',
          sendgrid: 'available',
          constantContact: 'available',
        },
        ai: {
          communication: 'available',
          sentimentAnalysis: 'available',
        },
      },
    };

    const response: ApiResponse<typeof healthData> = {
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

// Detailed health check with integration status
router.get('/detailed', async (_req: Request, res: Response): Promise<void> => {
  try {
    const healthData = {
      service: 'integration-management',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env['NODE_ENV'] || 'development',
      database: {
        status: 'connected',
        lastCheck: new Date().toISOString(),
      },
      externalServices: {
        openai: {
          status: process.env['OPENAI_API_KEY']
            ? 'configured'
            : 'not_configured',
          lastCheck: new Date().toISOString(),
        },
        supabase: {
          status: process.env['SUPABASE_URL'] ? 'configured' : 'not_configured',
          lastCheck: new Date().toISOString(),
        },
      },
      integrations: {
        crm: {
          salesforce: {
            status: 'available',
            features: ['contacts', 'opportunities', 'sync', 'search'],
            lastCheck: new Date().toISOString(),
          },
          hubspot: {
            status: 'available',
            features: ['contacts', 'deals', 'sync', 'search'],
            lastCheck: new Date().toISOString(),
          },
          pipedrive: {
            status: 'available',
            features: ['persons', 'deals', 'sync', 'search'],
            lastCheck: new Date().toISOString(),
          },
        },
        communication: {
          slack: {
            status: 'available',
            features: ['messages', 'channels', 'users', 'reactions'],
            lastCheck: new Date().toISOString(),
          },
          discord: {
            status: 'available',
            features: ['messages', 'guilds', 'channels', 'reactions'],
            lastCheck: new Date().toISOString(),
          },
          teams: {
            status: 'available',
            features: ['messages', 'teams', 'channels', 'users'],
            lastCheck: new Date().toISOString(),
          },
        },
        email: {
          mailchimp: {
            status: 'available',
            features: ['campaigns', 'lists', 'automation'],
            lastCheck: new Date().toISOString(),
          },
          sendgrid: {
            status: 'available',
            features: ['send', 'templates', 'tracking'],
            lastCheck: new Date().toISOString(),
          },
          constantContact: {
            status: 'available',
            features: ['contacts', 'campaigns', 'automation'],
            lastCheck: new Date().toISOString(),
          },
        },
        ai: {
          communication: {
            status: 'available',
            features: ['chat', 'responses', 'personalization'],
            lastCheck: new Date().toISOString(),
          },
          sentimentAnalysis: {
            status: 'available',
            features: ['analysis', 'optimization', 'routing'],
            lastCheck: new Date().toISOString(),
          },
        },
      },
      metrics: {
        activeIntegrations: 0, // TODO: Get from database
        totalSyncs: 0, // TODO: Get from database
        successRate: 0, // TODO: Calculate from database
        averageResponseTime: 0, // TODO: Calculate from logs
      },
    };

    const response: ApiResponse<typeof healthData> = {
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

// Readiness check for Kubernetes
router.get('/ready', async (_req: Request, res: Response): Promise<void> => {
  try {
    // Check if all required services are available
    const requiredServices = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'JWT_SECRET',
    ];

    const missingServices = requiredServices.filter(
      service => !process.env[service]
    );

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
