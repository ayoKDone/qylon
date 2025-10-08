import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health';
import integrationsRoutes from './routes/integrations';
import { logRequest, logger } from './utils/logger';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET', 'PORT'];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error('Missing required environment variables', {
    missing: missingEnvVars,
  });
  process.exit(1);
}

// Create Express app
const app: express.Application = express();
const PORT = process.env['PORT'] || 3006;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-API-Key'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use(logRequest);

// Add request ID to all requests
app.use((req, res, next) => {
  req.headers['x-request-id'] =
    req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.headers['x-request-id']);
  next();
});

// Health check routes (no authentication required)
app.use('/health', healthRoutes);

// API routes
app.use('/api/v1/integrations', integrationsRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'Qylon Integration Management Service',
    version: process.env['npm_package_version'] || '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      integrations: '/api/v1/integrations',
      documentation: '/api/docs',
    },
  });
});

// API documentation endpoint
app.get('/api/docs', (_req, res) => {
  res.json({
    title: 'Qylon Integration Management Service API',
    version: '1.0.0',
    description: 'API for managing CRM and communication platform integrations',
    endpoints: {
      health: {
        'GET /health': 'Basic health check',
        'GET /health/detailed': 'Detailed health check with integration status',
        'GET /health/ready': 'Kubernetes readiness check',
        'GET /health/live': 'Kubernetes liveness check',
      },
      integrations: {
        'GET /api/v1/integrations': 'Get all integrations for user',
        'GET /api/v1/integrations/:id': 'Get specific integration',
        'POST /api/v1/integrations': 'Create new integration',
        'PUT /api/v1/integrations/:id': 'Update integration',
        'DELETE /api/v1/integrations/:id': 'Delete integration',
        'POST /api/v1/integrations/:id/test': 'Test integration connection',
        'POST /api/v1/integrations/:id/sync': 'Sync integration data',
        'GET /api/v1/integrations/:id/metrics': 'Get integration metrics',
      },
    },
    supportedIntegrations: {
      crm: ['Salesforce', 'HubSpot', 'Pipedrive'],
      communication: ['Slack', 'Discord', 'Microsoft Teams'],
      email: ['Mailchimp', 'SendGrid', 'Constant Contact'],
      ai: ['Communication Service', 'Sentiment Analysis'],
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);

  server.close(err => {
    if (err) {
      logger.error('Error during server shutdown', { error: err.message });
      process.exit(1);
    }

    logger.info('Server closed successfully');
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Start server
const server = app.listen(PORT, () => {
  logger.info('Integration Management Service started', {
    port: PORT,
    environment: process.env['NODE_ENV'] || 'development',
    version: process.env['npm_package_version'] || '1.0.0',
    pid: process.pid,
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    promise: promise.toString(),
  });
  process.exit(1);
});

export default app;
