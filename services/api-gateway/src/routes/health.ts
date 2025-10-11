import axios from 'axios';
import { Request, Response, Router } from 'express';
import { ServiceHealth } from '../types';
import { logger } from '../utils/logger';

const router: Router = Router();

// Service endpoints configuration
// Only include services that are actually deployed
const services: Array<{
  name: string;
  url: string;
  healthCheck: string;
  enabled: boolean;
}> = [
  // Only include services that are actually deployed and running
  // For now, we'll start with an empty list and add services as they're deployed
];

/**
 * Check health of a single service
 */
const checkServiceHealth = async (service: any): Promise<ServiceHealth> => {
  const startTime = Date.now();

  // Skip health check for disabled services
  if (service.enabled === false) {
    return {
      name: service.name,
      status: 'disabled',
      responseTime: 0,
      lastCheck: new Date().toISOString(),
      details: 'Service is disabled',
    };
  }

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
 * Basic health check endpoint - Always healthy for DigitalOcean
 */
router.get('/', (req: Request, res: Response) => {
  // Always return healthy - this is just for DigitalOcean health checks
  // The API Gateway itself is healthy if it can respond to this request
  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

/**
 * Detailed health check endpoint
 */
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();

    // Check all services in parallel
    const serviceHealthChecks = await Promise.allSettled(
      services.map(service => checkServiceHealth(service)),
    );

    const serviceHealths: ServiceHealth[] = serviceHealthChecks.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: services[index].name,
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
        };
      }
    });

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

    // Determine overall health - only consider enabled services
    const enabledServices = serviceHealths.filter(service =>
      service.status !== 'disabled' && service.status !== 'unknown'
    );
    const unhealthyServices = enabledServices.filter(service => service.status === 'unhealthy');
    const overallStatus = unhealthyServices.length === 0 ? 'healthy' : 'unhealthy';

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
      enabledServices: enabledServices.length,
      unhealthyServices: unhealthyServices.length,
      totalServices: serviceHealths.length,
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
