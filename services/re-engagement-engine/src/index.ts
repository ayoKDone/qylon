import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import behaviorTrackingRoutes from './routes/behaviorTracking';
import conversionRecoveryRoutes from './routes/conversionRecovery';
import emailSequenceRoutes from './routes/emailSequences';
import healthRoutes from './routes/health';
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
const app = express();
const PORT = process.env['PORT'] || 3009;

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
  }),
);

// CORS configuration
app.use(
  cors({
    origin: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-API-Key'],
  }),
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

// Mock authentication middleware (replace with actual auth)
app.use((req, res, next) => {
  // In a real implementation, this would validate JWT tokens
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Mock user data - replace with actual JWT validation
    req.user = {
      id: 'mock-user-id',
      role: 'user',
      email: 'user@example.com',
    };
  }
  next();
});

// Health check routes (no authentication required)
app.use('/health', healthRoutes);

// API routes
app.use('/api/email-sequences', emailSequenceRoutes);
app.use('/api/behavior-tracking', behaviorTrackingRoutes);
app.use('/api/conversion-recovery', conversionRecoveryRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'Qylon Re-engagement Engine',
    version: process.env['npm_package_version'] || '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      documentation: '/api/docs',
      emailSequences: '/api/email-sequences',
      behaviorTracking: '/api/behavior-tracking',
      conversionRecovery: '/api/conversion-recovery',
    },
  });
});

// API documentation endpoint
app.get('/api/docs', (_req, res) => {
  res.json({
    title: 'Qylon Re-engagement Engine API',
    version: '1.0.0',
    description: 'API for managing email sequences, user behavior tracking, and conversion recovery',
    endpoints: {
      health: {
        'GET /health': 'Basic health check',
        'GET /health/detailed': 'Detailed health check with service status',
        'GET /health/ready': 'Kubernetes readiness check',
        'GET /health/live': 'Kubernetes liveness check',
      },
      emailSequences: {
        'POST /api/email-sequences': 'Create a new email sequence',
        'GET /api/email-sequences': 'Get email sequences for user',
        'GET /api/email-sequences/:id': 'Get specific email sequence',
        'PUT /api/email-sequences/:id': 'Update email sequence',
        'DELETE /api/email-sequences/:id': 'Delete email sequence',
        'POST /api/email-sequences/:id/execute': 'Start email sequence execution',
        'GET /api/email-sequences/executions/list': 'Get executions for user',
        'GET /api/email-sequences/stats/delivery': 'Get delivery statistics',
      },
      behaviorTracking: {
        'POST /api/behavior-tracking/events': 'Track user behavior event',
        'GET /api/behavior-tracking/profile': 'Get user behavior profile',
        'GET /api/behavior-tracking/events': 'Get behavior events for user',
        'GET /api/behavior-tracking/at-risk': 'Get users at risk of churning',
        'GET /api/behavior-tracking/analytics': 'Get behavior analytics',
        'POST /api/behavior-tracking/risk-factors/:factor/resolve': 'Resolve risk factor',
      },
      conversionRecovery: {
        'POST /api/conversion-recovery/campaigns': 'Create recovery campaign',
        'GET /api/conversion-recovery/campaigns': 'Get recovery campaigns',
        'GET /api/conversion-recovery/campaigns/:id': 'Get specific campaign',
        'PUT /api/conversion-recovery/campaigns/:id': 'Update campaign',
        'DELETE /api/conversion-recovery/campaigns/:id': 'Delete campaign',
        'POST /api/conversion-recovery/campaigns/:id/execute': 'Execute campaign',
        'GET /api/conversion-recovery/campaigns/:id/executions': 'Get campaign executions',
        'POST /api/conversion-recovery/executions/:id/complete': 'Complete execution',
        'GET /api/conversion-recovery/analytics': 'Get recovery analytics',
      },
    },
    features: {
      emailSequences: 'Automated email sequence management and execution',
      behaviorTracking: 'User behavior analysis and risk assessment',
      conversionRecovery: 'Conversion recovery campaigns and A/B testing',
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
  logger.info('Re-engagement Engine started', {
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
