import { createClient } from '@supabase/supabase-js';
import { Request, Response, Router } from 'express';
import logger from '../utils/logger';

const router = Router();

// Initialize Supabase client (optional for local development)
let supabase: any = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    logger.info('Supabase client initialized successfully in health routes');
  } else {
    logger.warn(
      'Supabase not configured in health routes - running in local development mode'
    );
  }
} catch (error) {
  logger.warn(
    'Failed to initialize Supabase client in health routes - running in local development mode',
    { error: error instanceof Error ? error.message : String(error) }
  );
}

// Health check endpoint
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const healthCheck = {
      status: 'healthy',
      service: 'security-service',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // Test database connection
    const { error: dbError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (dbError) {
      logger.error('Database health check failed', { error: dbError.message });
      res.status(503).json({
        ...healthCheck,
        status: 'unhealthy',
        database: 'disconnected',
        error: dbError.message,
      });
      return;
    }

    // Test Supabase Auth
    const { error: authError } = await supabase.auth.getSession();

    if (authError) {
      logger.error('Auth health check failed', { error: authError.message });
      res.status(503).json({
        ...healthCheck,
        status: 'unhealthy',
        auth: 'disconnected',
        error: authError.message,
      });
      return;
    }

    res.status(200).json({
      ...healthCheck,
      database: 'connected',
      auth: 'connected',
    });
  } catch (error) {
    logger.error('Health check error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(503).json({
      status: 'unhealthy',
      service: 'security-service',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Detailed health check
router.get('/detailed', async (_req: Request, res: Response): Promise<void> => {
  try {
    const checks = {
      database: { status: 'unknown', responseTime: 0 },
      auth: { status: 'unknown', responseTime: 0 },
      memory: { status: 'unknown', usage: 0 },
      uptime: { status: 'healthy', seconds: process.uptime() },
    };

    // Database check
    const dbStart = Date.now();
    const { error: dbError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    checks.database.responseTime = Date.now() - dbStart;
    checks.database.status = dbError ? 'unhealthy' : 'healthy';

    // Auth check
    const authStart = Date.now();
    const { error: authError } = await supabase.auth.getSession();
    checks.auth.responseTime = Date.now() - authStart;
    checks.auth.status = authError ? 'unhealthy' : 'healthy';

    // Memory check
    const memUsage = process.memoryUsage();
    checks.memory.usage = Math.round(memUsage.heapUsed / 1024 / 1024); // MB
    checks.memory.status = checks.memory.usage > 500 ? 'warning' : 'healthy';

    const overallStatus = Object.values(checks).every(
      check => check.status === 'healthy' || check.status === 'warning'
    )
      ? 'healthy'
      : 'unhealthy';

    res.status(overallStatus === 'healthy' ? 200 : 503).json({
      status: overallStatus,
      service: 'security-service',
      timestamp: new Date().toISOString(),
      checks,
    });
  } catch (error) {
    logger.error('Detailed health check error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(503).json({
      status: 'unhealthy',
      service: 'security-service',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
