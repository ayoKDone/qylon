import { ProxyConfig, ServiceEndpoint, ServiceRegistry } from '@/types';
import { logger } from '@/utils/logger';
import { NextFunction, Request, Response, Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();

// Service registry with endpoint configurations
const serviceRegistry: ServiceRegistry = {
  'user-management': {
    name: 'user-management',
    url: process.env.USER_MANAGEMENT_URL || 'http://localhost:3001',
    port: 3001,
    healthCheck: '/health',
    routes: ['/users', '/auth', '/profile'],
  },
  'client-management': {
    name: 'client-management',
    url: process.env.CLIENT_MANAGEMENT_URL || 'http://localhost:3002',
    port: 3002,
    healthCheck: '/health',
    routes: ['/clients', '/teams'],
  },
  'meeting-intelligence': {
    name: 'meeting-intelligence',
    url: process.env.MEETING_INTELLIGENCE_URL || 'http://localhost:3003',
    port: 3003,
    healthCheck: '/health',
    routes: ['/meetings', '/transcriptions', '/action-items'],
  },
  'content-creation': {
    name: 'content-creation',
    url: process.env.CONTENT_CREATION_URL || 'http://localhost:3004',
    port: 3004,
    healthCheck: '/health',
    routes: ['/content', '/brand-voice'],
  },
  'workflow-automation': {
    name: 'workflow-automation',
    url: process.env.WORKFLOW_AUTOMATION_URL || 'http://localhost:3005',
    port: 3005,
    healthCheck: '/health',
    routes: ['/workflows', '/automations'],
  },
  'integration-management': {
    name: 'integration-management',
    url: process.env.INTEGRATION_MANAGEMENT_URL || 'http://localhost:3006',
    port: 3006,
    healthCheck: '/health',
    routes: ['/integrations', '/webhooks'],
  },
  'notification-service': {
    name: 'notification-service',
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007',
    port: 3007,
    healthCheck: '/health',
    routes: ['/notifications', '/templates'],
  },
  'analytics-reporting': {
    name: 'analytics-reporting',
    url: process.env.ANALYTICS_REPORTING_URL || 'http://localhost:3008',
    port: 3008,
    healthCheck: '/health',
    routes: ['/analytics', '/reports'],
  },
  security: {
    name: 'security',
    url: process.env.SECURITY_SERVICE_URL || 'http://localhost:3001',
    port: 3001,
    healthCheck: '/health',
    routes: ['/auth', '/rls', '/api-keys'],
  },
};

/**
 * Create proxy middleware for a service
 */
const createServiceProxy = (serviceName: string, serviceConfig: any) => {
  const proxyConfig: ProxyConfig = {
    target: serviceConfig.url,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/v1/${serviceName}`]: '', // Remove service prefix
    },
    onError: (err: Error, req: Request, _res: Response) => {
      logger.error(`Proxy error for ${serviceName}`, {
        error: err.message,
        url: req.originalUrl,
        method: req.method,
        requestId: (req as any).requestId,
      });

      _res.status(503).json({
        error: 'Service Unavailable',
        message: `${serviceName} service is currently unavailable`,
        timestamp: new Date().toISOString(),
        requestId: (req as any).requestId,
      });
    },
    onProxyReq: (proxyReq: any, req: Request, _res: Response) => {
      // Add request ID to proxy request
      if ((req as any).requestId) {
        proxyReq.setHeader('X-Request-ID', (req as any).requestId);
      }

      // Add user information to proxy request
      if ((req as any).user) {
        proxyReq.setHeader('X-User-ID', (req as any).user.id);
        proxyReq.setHeader('X-User-Role', (req as any).user.role);
      }

      logger.debug(`Proxying request to ${serviceName}`, {
        method: req.method,
        url: req.originalUrl,
        target: serviceConfig.url,
        requestId: (req as any).requestId,
        userId: (req as any).user?.id,
      });
    },
    onProxyRes: (proxyRes: any, req: Request, _res: Response) => {
      logger.debug(`Proxy response from ${serviceName}`, {
        statusCode: proxyRes.statusCode,
        url: req.originalUrl,
        requestId: (req as any).requestId,
        userId: (req as any).user?.id,
      });
    },
  };

  return createProxyMiddleware(proxyConfig);
};

/**
 * Route discovery middleware
 * Determines which service should handle the request
 */
const routeDiscovery = (req: Request, _res: Response, next: NextFunction) => {
  const path = req.path;
  const method = req.method;

  // Find matching service
  let targetService: string | null = null;

  for (const [serviceName, serviceConfig] of Object.entries(
    serviceRegistry
  ) as [string, ServiceEndpoint][]) {
    for (const route of serviceConfig.routes) {
      if (path.startsWith(`/api/v1${route}`)) {
        targetService = serviceName;
        break;
      }
    }
    if (targetService) break;
  }

  if (!targetService) {
    logger.warn('No service found for route', {
      path,
      method,
      requestId: (req as any).requestId,
    });

    _res.status(404).json({
      error: 'Not Found',
      message: `No service found for route ${path}`,
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    });
    return;
  }

  // Attach target service to request
  (req as any).targetService = targetService;

  logger.debug('Route discovered', {
    path,
    method,
    targetService,
    requestId: (req as any).requestId,
  });

  next();
};

/**
 * Service health check middleware
 */
const serviceHealthCheck = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const targetService = (req as any).targetService;

  if (!targetService) {
    next();
    return;
  }

  const serviceConfig = serviceRegistry[targetService];

  try {
    // Simple health check - just verify the service is reachable
    const axios = require('axios');
    await axios.get(`${serviceConfig.url}${serviceConfig.healthCheck}`, {
      timeout: 2000, // 2 second timeout
    });

    next();
  } catch (error) {
    logger.error(`Service ${targetService} is unhealthy`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      serviceUrl: serviceConfig.url,
      requestId: (req as any).requestId,
    });

    _res.status(503).json({
      error: 'Service Unavailable',
      message: `${targetService} service is currently unavailable`,
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
    });
  }
};

// Apply middleware
router.use(routeDiscovery);
router.use(serviceHealthCheck);

// Create proxy routes for each service
Object.entries(serviceRegistry).forEach(
  ([serviceName, serviceConfig]: [string, ServiceEndpoint]) => {
    const proxy = createServiceProxy(serviceName, serviceConfig);

    // Create route for each service route
    serviceConfig.routes.forEach((route: string) => {
      router.use(`/api/v1${route}`, proxy);
    });
  }
);

/**
 * Service discovery endpoint
 */
router.get('/services', (req: Request, _res: Response) => {
  const services = Object.values(serviceRegistry).map(service => ({
    name: service.name,
    url: service.url,
    port: service.port,
    routes: service.routes,
    healthCheck: service.healthCheck,
  }));

  _res.json({
    services,
    timestamp: new Date().toISOString(),
    requestId: (req as any).requestId,
  });
});

/**
 * Service status endpoint
 */
router.get('/services/status', async (req: Request, _res: Response) => {
  const axios = require('axios');
  const serviceStatuses = await Promise.allSettled(
    Object.entries(serviceRegistry).map(
      async ([serviceName, serviceConfig]: [string, ServiceEndpoint]) => {
        try {
          const response = await axios.get(
            `${serviceConfig.url}${serviceConfig.healthCheck}`,
            {
              timeout: 5000,
            }
          );

          return {
            name: serviceName,
            status: 'healthy',
            responseTime: response.headers['x-response-time'] || 'unknown',
            lastCheck: new Date().toISOString(),
          };
        } catch (error) {
          return {
            name: serviceName,
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error',
            lastCheck: new Date().toISOString(),
          };
        }
      }
    )
  );

  const services = serviceStatuses.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      const serviceName = Object.keys(serviceRegistry)[index];
      return {
        name: serviceName,
        status: 'unhealthy',
        error:
          result.reason instanceof Error
            ? result.reason.message
            : 'Unknown error',
        lastCheck: new Date().toISOString(),
      };
    }
  });

  _res.json({
    services,
    timestamp: new Date().toISOString(),
    requestId: (req as any).requestId,
  });
});

export { router as proxyRoutes };
