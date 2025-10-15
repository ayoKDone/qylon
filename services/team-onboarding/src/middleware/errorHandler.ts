import { NextFunction, Request, Response } from 'express';
import { TeamOnboardingError } from '../types';
import { logger } from '../utils/logger';

/**
 * Async error handler wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Log the error
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle TeamOnboardingError
  if (error instanceof TeamOnboardingError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.code,
      message: error.message,
      details: error.details,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    });
    return;
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: error.message,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Invalid authentication token',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'TOKEN_EXPIRED',
      message: 'Authentication token has expired',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    });
    return;
  }

  // Handle database errors
  if (error.name === 'DatabaseError') {
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Database operation failed',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    });
    return;
  }

  // Handle rate limiting errors
  if (error.name === 'TooManyRequestsError') {
    res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message:
      process.env.NODE_ENV === 'production' ? 'An internal server error occurred' : error.message,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown',
  });
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown',
  });
};

/**
 * Request validation helper
 */
export const validateRequest = (schema: any, data: any) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new TeamOnboardingError(
      'Validation failed',
      'VALIDATION_ERROR',
      400,
      result.error.errors,
    );
  }
  return result.data;
};

/**
 * Create validation error
 */
export const createValidationError = (message: string, details?: any) => {
  return new TeamOnboardingError(message, 'VALIDATION_ERROR', 400, details);
};

/**
 * Create not found error
 */
export const createNotFoundError = (resource: string, id: string) => {
  return new TeamOnboardingError(`${resource} with ID ${id} not found`, 'NOT_FOUND', 404);
};

/**
 * Create unauthorized error
 */
export const createUnauthorizedError = (message: string = 'Unauthorized access') => {
  return new TeamOnboardingError(message, 'UNAUTHORIZED', 401);
};

/**
 * Create forbidden error
 */
export const createForbiddenError = (message: string = 'Insufficient permissions') => {
  return new TeamOnboardingError(message, 'FORBIDDEN', 403);
};
