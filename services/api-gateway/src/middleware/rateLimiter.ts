import { logSecurity, logger } from '@/utils/logger';
import { createClient } from '@supabase/supabase-js';
import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

// Extend Express Request interface to include rateLimit property
declare module 'express-serve-static-core' {
  interface Request {
    rateLimit?: {
      limit: number;
      used: number;
      remaining: number;
      resetTime: Date | undefined;
      key: string;
    };
  }
}

// Initialize Supabase client (optional for local development)
let supabase: any = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    logger.info('Supabase client initialized successfully');
  } else {
    logger.warn('Supabase not configured - running in local development mode');
  }
} catch (error) {
  logger.warn(
    'Failed to initialize Supabase client - running in local development mode',
    { error: error instanceof Error ? error.message : String(error) }
  );
}

// Custom key generator that includes user ID for authenticated requests
const keyGenerator = (req: Request): string => {
  const userId = (req as any).user?.id;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  // For authenticated users, use user ID as key
  // For anonymous users, use IP address
  return userId ? `user:${userId}` : `ip:${ip}`;
};

// Custom skip function for health checks and admin users
const skip = (req: Request): boolean => {
  // Skip rate limiting for health checks
  if (req.path === '/health') {
    return true;
  }

  // Skip rate limiting for admin users
  const user = (req as any).user;
  if (user && user.role === 'admin') {
    return true;
  }

  return false;
};

// Custom handler for rate limit exceeded
const handler = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  // Log security event
  logSecurity('Rate limit exceeded', req, {
    userId,
    ip,
    endpoint: req.path,
    method: req.method,
  });

  // Store rate limit violation in database
  try {
    await supabase.from('api_rate_limits').insert({
      user_id: userId || null,
      ip_address: ip,
      endpoint: req.path,
      request_count: 1,
      window_start: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to log rate limit violation', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      ip,
    });
  }

  res.status(429).json({
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
    timestamp: new Date().toISOString(),
    retryAfter: Math.round(
      req.rateLimit?.resetTime
        ? (Number(req.rateLimit.resetTime) - Date.now()) / 1000
        : 60
    ),
  });
};

// General rate limiter
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window
  keyGenerator,
  skip,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
    timestamp: new Date().toISOString(),
  },
});

// Strict rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  keyGenerator,
  skip: (req: Request) => req.path === '/health',
  handler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many authentication attempts. Please try again later.',
    timestamp: new Date().toISOString(),
  },
});

// Moderate rate limiter for API endpoints
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  keyGenerator,
  skip,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'API rate limit exceeded. Please try again later.',
    timestamp: new Date().toISOString(),
  },
});

// Lenient rate limiter for read-only operations
export const readOnlyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window
  keyGenerator,
  skip,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Read rate limit exceeded. Please try again later.',
    timestamp: new Date().toISOString(),
  },
});

// Strict rate limiter for write operations
export const writeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  keyGenerator,
  skip,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Write rate limit exceeded. Please try again later.',
    timestamp: new Date().toISOString(),
  },
});

// Custom rate limiter for specific endpoints
export const createCustomRateLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    keyGenerator,
    skip,
    handler,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      timestamp: new Date().toISOString(),
    },
  });
};

// Rate limit for file uploads
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  keyGenerator,
  skip,
  handler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Upload rate limit exceeded. Please try again later.',
    timestamp: new Date().toISOString(),
  },
});

// Rate limit for password reset
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  keyGenerator,
  skip: (req: Request) => req.path === '/health',
  handler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many password reset attempts. Please try again later.',
    timestamp: new Date().toISOString(),
  },
});
