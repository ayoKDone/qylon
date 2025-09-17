import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { logger } from '../utils/logger';
import healthRoutes from './routes/health';
import eventRoutes from './routes/events';
import sagaRoutes from './routes/sagas';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3009;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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