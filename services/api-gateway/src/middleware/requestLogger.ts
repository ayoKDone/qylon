import { logRequest, logger } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request logging middleware
 * Adds request ID and logs request/response details
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Generate unique request ID
  const requestId = uuidv4();
  (req as any).requestId = requestId;

  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);

  // Record start time
  const startTime = Date.now();

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any): any {
    const responseTime = Date.now() - startTime;

    // Log the request
    logRequest(req, res, responseTime);

    // Call original end method
    return originalEnd.call(this, chunk, encoding);
  };

  // Log request start
  logger.info('Request started', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  next();
};

/**
 * Response time middleware
 * Adds response time to response headers
 */
export const responseTime = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${responseTime}ms`);
  });

  next();
};

/**
 * Request ID middleware
 * Ensures every request has a unique ID
 */
export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const requestId = req.get('X-Request-ID') || uuidv4();
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};
