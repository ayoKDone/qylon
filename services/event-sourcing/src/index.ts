import dotenv from 'dotenv';
import express from 'express';
import { authenticateToken } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import eventRoutes from './routes/events';
import healthRoutes from './routes/health';
import sagaRoutes from './routes/sagas';
import { logger } from './utils/logger';

dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 3009;

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
app.use('/events', authenticateToken, eventRoutes);
app.use('/sagas', authenticateToken, sagaRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Event Sourcing service running on port ${PORT}`);
});

export default app;
