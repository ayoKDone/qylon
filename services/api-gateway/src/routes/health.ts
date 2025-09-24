import { HealthCheckResponse, ServiceHealth } from '@/types';
import { logger } from '@/utils/logger';
import axios from 'axios';
import { Request, Response, Router } from 'express';

const router = Router();

// Service endpoints configuration
const services = [
  {
    name: 'user-management',
    url: process.env.USER_MANAGEMENT_URL || 'http://user-management:3001',
    healthCheck: '/health',
  },
  {
    name: 'client-management',
    url: process.env.CLIENT_MANAGEMENT_URL || 'http://client-management:3002',
    healthCheck: '/health',
  },
  {
    name: 'meeting-intelligence',
    url:
      process.env.MEETING_INTELLIGENCE_URL ||
      'http://meeting-intelligence:3003',
    healthCheck: '/health',
  },
  {
    name: 'content-creation',
    url: process.env.CONTENT_CREATION_URL || 'http://content-creation:3004',
    healthCheck: '/health',
  },
  {
    name: 'workflow-automation',
    url:
      process.env.WORKFLOW_AUTOMATION_URL || 'http://workflow-automation:3005',
    healthCheck: '/health',
  },
  {
    name: 'integration-management',
    url:
      process.env.INTEGRATION_MANAGEMENT_URL ||
      'http://integration-management:3006',
    healthCheck: '/health',
  },
  {
    name: 'notification-service',
    url:
      process.env.NOTIFICATION_SERVICE_URL ||
      'http://notification-service:3007',
    healthCheck: '/health',
  },
  {
    name: 'analytics-reporting',
    url:
      process.env.ANALYTICS_REPORTING_URL || 'http://analytics-reporting:3008',
    healthCheck: '/health',
  },
];

/**
 * Check health of a single service
 */
const checkServiceHealth = async (service: any): Promise<ServiceHealth> => {
  const startTime = Date.now();

  try {
    const response = await axios.get(`${service.url}${service.healthCheck}`, {
      timeout: 5000, // 5 second timeout
    });

    const responseTime = Date.now() - startTime;

    return {
      name: service.name,
      status: response.status === 200 ? 'healthy' : 'unhealthy',
      responseTime,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      name: service.name,
      status: 'unhealthy',
      responseTime,
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Basic health check endpoint
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();

    // Check all services in parallel
    const serviceHealthChecks = await Promise.allSettled(
      services.map(service => checkServiceHealth(service))
    );

    const serviceHealths: ServiceHealth[] = serviceHealthChecks.map(
      (result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            name: services[index].name,
            status: 'unhealthy',
            lastCheck: new Date().toISOString(),
            error:
              result.reason instanceof Error
                ? result.reason.message
                : 'Unknown error',
          };
        }
      }
    );

    // Determine overall health
    const unhealthyServices = serviceHealths.filter(
      service => service.status === 'unhealthy'
    );
    const overallStatus =
      unhealthyServices.length === 0 ? 'healthy' : 'unhealthy';

    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: serviceHealths,
    };

    const statusCode = overallStatus === 'healthy' ? 200 : 503;

    logger.info('Health check completed', {
      status: overallStatus,
      unhealthyServices: unhealthyServices.length,
      responseTime: Date.now() - startTime,
    });

    res.status(statusCode).json(response);
  } catch (error) {
    logger.error('Health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: [],
      error: 'Health check failed',
    });
  }
});

/**
 * Detailed health check endpoint
 */
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();

    // Check all services in parallel
    const serviceHealthChecks = await Promise.allSettled(
      services.map(service => checkServiceHealth(service))
    );

    const serviceHealths: ServiceHealth[] = serviceHealthChecks.map(
      (result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            name: services[index].name,
            status: 'unhealthy',
            lastCheck: new Date().toISOString(),
            error:
              result.reason instanceof Error
                ? result.reason.message
                : 'Unknown error',
          };
        }
      }
    );

    // Get system information
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };

    // Determine overall health
    const unhealthyServices = serviceHealths.filter(
      service => service.status === 'unhealthy'
    );
    const overallStatus =
      unhealthyServices.length === 0 ? 'healthy' : 'unhealthy';

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: serviceHealths,
      system: systemInfo,
      responseTime: Date.now() - startTime,
    };

    const statusCode = overallStatus === 'healthy' ? 200 : 503;

    logger.info('Detailed health check completed', {
      status: overallStatus,
      unhealthyServices: unhealthyServices.length,
      responseTime: Date.now() - startTime,
    });

    res.status(statusCode).json(response);
  } catch (error) {
    logger.error('Detailed health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: [],
      error: 'Detailed health check failed',
    });
  }
});

/**
 * Readiness check endpoint
 */
router.get('/ready', (req: Request, res: Response) => {
  // Simple readiness check - just verify the service is running
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Liveness check endpoint
 */
router.get('/live', (req: Request, res: Response) => {
  // Simple liveness check - just verify the service is alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export { router as healthCheck };
