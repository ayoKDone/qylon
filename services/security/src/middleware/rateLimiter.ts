import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { logger } from '../../utils/logger';

// Rate limiting configuration
const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too Many Requests',
      message,
      timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        limit: max,
        windowMs
      });
      
      res.status(429).json({
        error: 'Too Many Requests',
        message,
        timestamp: new Date().toISOString(),
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// General API rate limiter
export const apiRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  1000, // 1000 requests per window
  'Too many requests from this IP, please try again later'
);

// Authentication rate limiter (stricter)
export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 login attempts per window
  'Too many authentication attempts, please try again later'
);

// User-specific rate limiter
export const userRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const userId = (req as any).user?.id;
  
  if (!userId) {
    // Fall back to IP-based rate limiting for unauthenticated requests
    apiRateLimiter(req, res, next);
    return;
  }

  // User-specific rate limiting (higher limits for authenticated users)
  const userLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    2000, // 2000 requests per window for authenticated users
    'Too many requests from this user, please try again later'
  );

  userLimiter(req, res, next);
};

// Upload rate limiter (very strict)
export const uploadRateLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads per hour
  'Too many file uploads, please try again later'
);

// Webhook rate limiter
export const webhookRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  100, // 100 webhook calls per minute
  'Too many webhook requests, please try again later'
);

// Default rate limiter
export const rateLimiter = apiRateLimiter;