import dotenv from 'dotenv';
import express from 'express';
import { authenticateToken } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import alertsRoutes from './routes/alerts';
import dashboardsRoutes from './routes/dashboards';
import healthRoutes from './routes/health';
import metricsRoutes from './routes/metrics';
import { logger } from './utils/logger';

dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 3010;

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

// Monitoring routes
app.use('/metrics', authenticateToken, metricsRoutes);
app.use('/alerts', authenticateToken, alertsRoutes);
app.use('/dashboards', authenticateToken, dashboardsRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Infrastructure Monitoring service running on port ${PORT}`);
});

export default app;
