import dotenv from 'dotenv';
import express from 'express';
import { authenticateToken } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import eventRoutes, { setEventSubscriber } from './routes/events';
import healthRoutes from './routes/health';
import monitoringRoutes, {
  setEventSubscriberForMonitoring,
} from './routes/monitoring';
import sagaRoutes from './routes/sagas';
import { EventSubscriber } from './services/EventSubscriber';
import { logger } from './utils/logger';

dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 3009;

// Initialize Event Subscriber for workflow triggers
const eventSubscriber = new EventSubscriber();

// Initialize Supabase client
// const supabase = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// Middleware
app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);

// Health check route
app.use('/health', healthRoutes);

// Event sourcing routes
app.use('/api/v1/events', authenticateToken, eventRoutes);
app.use('/api/v1/sagas', authenticateToken, sagaRoutes);

// Monitoring routes
app.use('/api/v1/monitoring', monitoringRoutes);

// Error handling middleware
app.use(errorHandler);

async function startService() {
  try {
    // Initialize event subscriber
    await eventSubscriber.initialize();

    // Inject event subscriber into routes
    setEventSubscriber(eventSubscriber);
    setEventSubscriberForMonitoring(eventSubscriber);

    // Start the server
    app.listen(PORT, () => {
      logger.info(`Event Sourcing service running on port ${PORT}`);
    });
  } catch (error: any) {
    logger.error('Failed to start Event Sourcing service', {
      error: error.message,
    });
    process.exit(1);
  }
}

// Start the service
startService();

export default app;
