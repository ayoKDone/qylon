import dotenv from 'dotenv';
import express from 'express';
import { authenticateToken } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import apiKeysRoutes from './routes/apiKeys';
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';
import rlsRoutes from './routes/rls';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client (used by middleware)
// const supabase = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// Middleware
app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);

// Health check route (no auth required)
app.use('/health', healthRoutes);

// Security middleware routes (auth required)
app.use('/auth', authRoutes);
app.use('/rls', authenticateToken, rlsRoutes);
app.use('/api-keys', authenticateToken, apiKeysRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Security service running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

export default app;
