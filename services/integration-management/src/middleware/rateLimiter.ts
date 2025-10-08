import { NextFunction, Request, Response } from 'express';
import { RateLimitConfig } from '../types';
import { logger } from '../utils/logger';

// In-memory rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configurations for different endpoints
const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // General API endpoints
  default: {
    requests: 100,
    window: 15 * 60 * 1000, // 15 minutes
    burst: 20,
  },

  // Authentication endpoints
  auth: {
    requests: 5,
    window: 15 * 60 * 1000, // 15 minutes
    burst: 2,
  },

  // Integration sync endpoints
  sync: {
    requests: 10,
    window: 60 * 1000, // 1 minute
    burst: 3,
  },

  // Webhook endpoints
  webhook: {
    requests: 1000,
    window: 60 * 1000, // 1 minute
    burst: 100,
  },

  // OAuth endpoints
  oauth: {
    requests: 20,
    window: 60 * 1000, // 1 minute
    burst: 5,
  },
};

// Get client identifier for rate limiting
const getClientId = (req: Request): string => {
  // Use user ID if authenticated
  if ((req as any).user?.id) {
    return `user:${(req as any).user.id}`;
  }

  // Use API key if provided
  if ((req as any).apiKey?.id) {
    return `api:${(req as any).apiKey.id}`;
  }

  // Fall back to IP address
  return `ip:${req.ip}`;
};

// Clean up expired entries from rate limit store
const cleanupExpiredEntries = (): void => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

// Rate limiting middleware
export const rateLimiter = (configKey: string = 'default') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const config = rateLimitConfigs[configKey] || rateLimitConfigs['default'];
      if (!config) {
        res.status(500).json({ error: 'Rate limit configuration not found' });
        return;
      }
      const clientId = getClientId(req);
      const now = Date.now();
      // const _windowStart = now - config.window;

      // Get or create rate limit entry
      let entry = rateLimitStore.get(clientId);

      if (!entry || entry.resetTime < now) {
        // Create new entry or reset expired entry
        entry = {
          count: 0,
          resetTime: now + config.window,
        };
        rateLimitStore.set(clientId, entry);
      }

      // Check if limit exceeded
      if (entry.count >= config.requests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

        logger.warn('Rate limit exceeded', {
          clientId,
          configKey,
          count: entry.count,
          limit: config.requests,
          retryAfter,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.url,
        });

        res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          retryAfter,
          limit: config.requests,
          window: config.window,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'],
        });
        return;
      }

      // Check burst limit
      if (config.burst && entry.count >= config.burst) {
        const timeSinceFirstRequest = now - (entry.resetTime - config.window);
        const expectedRequests = Math.floor(
          timeSinceFirstRequest / (config.window / config.requests),
        );

        if (entry.count > expectedRequests) {
          logger.warn('Burst rate limit exceeded', {
            clientId,
            configKey,
            count: entry.count,
            expectedRequests,
            burst: config.burst,
            ip: req.ip,
            url: req.url,
          });

          res.status(429).json({
            success: false,
            error: 'Burst rate limit exceeded',
            retryAfter: Math.ceil(config.window / config.requests / 1000),
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'],
          });
          return;
        }
      }

      // Increment counter
      entry.count++;

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': config.requests.toString(),
        'X-RateLimit-Remaining': Math.max(
          0,
          config.requests - entry.count,
        ).toString(),
        'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000).toString(),
        'X-RateLimit-Window': config.window.toString(),
      });

      next();
    } catch (error) {
      logger.error('Rate limiter error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        configKey,
        ip: req.ip,
        url: req.url,
      });

      // On error, allow request to proceed
      next();
    }
  };
};

// Integration-specific rate limiter
export const integrationRateLimiter = (integrationType: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const clientId = getClientId(req);
      const integrationKey = `${clientId}:${integrationType}`;
      const now = Date.now();

      // Integration-specific limits
      const limits: Record<string, RateLimitConfig> = {
        salesforce: { requests: 5, window: 60 * 1000, burst: 2 },
        hubspot: { requests: 10, window: 60 * 1000, burst: 3 },
        pipedrive: { requests: 8, window: 60 * 1000, burst: 2 },
        slack: { requests: 20, window: 60 * 1000, burst: 5 },
        discord: { requests: 15, window: 60 * 1000, burst: 4 },
        teams: { requests: 10, window: 60 * 1000, burst: 3 },
      };

      const config = limits[integrationType] || limits['salesforce'];
      if (!config) {
        res
          .status(500)
          .json({ error: 'Integration rate limit configuration not found' });
        return;
      }

      // Get or create rate limit entry
      let entry = rateLimitStore.get(integrationKey);

      if (!entry || entry.resetTime < now) {
        entry = {
          count: 0,
          resetTime: now + config.window,
        };
        rateLimitStore.set(integrationKey, entry);
      }

      // Check if limit exceeded
      if (entry.count >= config.requests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

        logger.warn('Integration rate limit exceeded', {
          clientId,
          integrationType,
          count: entry.count,
          limit: config.requests,
          retryAfter,
          ip: req.ip,
          url: req.url,
        });

        res.status(429).json({
          success: false,
          error: 'Integration rate limit exceeded',
          integrationType,
          retryAfter,
          limit: config.requests,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'],
        });
        return;
      }

      // Increment counter
      entry.count++;

      // Add rate limit headers
      res.set({
        'X-Integration-RateLimit-Limit': config.requests.toString(),
        'X-Integration-RateLimit-Remaining': Math.max(
          0,
          config.requests - entry.count,
        ).toString(),
        'X-Integration-RateLimit-Reset': Math.ceil(
          entry.resetTime / 1000,
        ).toString(),
        'X-Integration-RateLimit-Type': integrationType,
      });

      next();
    } catch (error) {
      logger.error('Integration rate limiter error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        integrationType,
        ip: req.ip,
        url: req.url,
      });

      // On error, allow request to proceed
      next();
    }
  };
};

// Webhook rate limiter (more permissive)
export const webhookRateLimiter = rateLimiter('webhook');

// OAuth rate limiter (strict)
export const oauthRateLimiter = rateLimiter('oauth');

// Sync rate limiter (moderate)
export const syncRateLimiter = rateLimiter('sync');
