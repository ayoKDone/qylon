import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import executionRoutes from './routes/executions';
import healthRoutes from './routes/health';
import workflowRoutes from './routes/workflows';
import { logger } from './utils/logger';

dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 3005;

// Initialize Workflow Orchestration Service
const orchestrationService =
  new (require('./services/WorkflowOrchestrationService').WorkflowOrchestrationService)({
    enableWorkflowTriggers: true,
    enableIntegrationCoordination: true,
    enableEventDrivenArchitecture: true,
    maxConcurrentEvents: 100,
    retryAttempts: 3,
    retryDelay: 1000,
  });

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
  }),
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
    timestamp: new Date().toISOString(),
    status: 429,
  },
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check route (no auth required)
app.use('/health', healthRoutes);

// Authentication middleware for all other routes
app.use('/api/v1', authMiddleware);

// API routes
app.use('/api/v1/workflows', workflowRoutes);
app.use('/api/v1/executions', executionRoutes);
app.use('/api/v1/orchestration', require('./routes/orchestration').default);

// Set orchestration service for routes
import { setOrchestrationService } from './routes/orchestration';
setOrchestrationService(orchestrationService);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  try {
    await orchestrationService.stop();
  } catch (error) {
    logger.error('Error stopping orchestration service during shutdown', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  try {
    await orchestrationService.stop();
  } catch (error) {
    logger.error('Error stopping orchestration service during shutdown', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`Workflow Automation service running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

export default app;
