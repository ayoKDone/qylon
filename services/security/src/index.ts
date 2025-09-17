import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { logger } from '../utils/logger';
import healthRoutes from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

// Security middleware routes
app.use('/auth', authenticateToken, require('./routes/auth'));
app.use('/rls', authenticateToken, require('./routes/rls'));

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Security service running on port ${PORT}`);
});

export default app;