import { NextFunction, Request, Response } from 'express';
import { IntegrationError, IntegrationType } from '../types';
import { logger } from '../utils/logger';

// Custom error class for integration-specific errors
export class IntegrationServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly retryable: boolean;
  public readonly integrationType?: string | undefined;
  public readonly userId?: string | undefined;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    retryable: boolean = false,
    integrationType?: string,
    userId?: string,
  ) {
    super(message);
    this.name = 'IntegrationServiceError';
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
    this.integrationType = integrationType || undefined;
    this.userId = userId || undefined;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, IntegrationServiceError);
  }
}

// Error handler middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Log the error
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    requestId: req.headers['x-request-id'],
  });

  // Handle different types of errors
  if (error instanceof IntegrationServiceError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
      retryable: error.retryable,
      integrationType: error.integrationType,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'],
    });
    return;
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.message,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'],
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Invalid token',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'],
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Token expired',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'],
    });
    return;
  }

  // Handle database errors
  if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
    res.status(409).json({
      success: false,
      error: 'Resource already exists',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'],
    });
    return;
  }

  // Handle rate limiting errors
  if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'],
    });
    return;
  }

  // Handle external API errors
  if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
    res.status(503).json({
      success: false,
      error: 'External service unavailable',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'],
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: process.env['NODE_ENV'] === 'production' ? 'Internal server error' : error.message,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'],
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn('Route not found', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(404).json({
    success: false,
    error: 'Route not found',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'],
  });
};

// Integration-specific error creators
export const createIntegrationError = (
  message: string,
  integrationType: IntegrationType,
  userId: string,
  retryable: boolean = false,
): IntegrationError => {
  const error = new Error(message) as IntegrationError;
  error.code = 'INTEGRATION_ERROR';
  error.integrationType = integrationType;
  error.userId = userId;
  error.timestamp = new Date().toISOString();
  error.retryable = retryable;
  return error;
};

export const createValidationError = (message: string): IntegrationServiceError => {
  return new IntegrationServiceError(message, 'VALIDATION_ERROR', 400, false);
};

export const createAuthenticationError = (message: string): IntegrationServiceError => {
  return new IntegrationServiceError(message, 'AUTHENTICATION_ERROR', 401, false);
};

export const createAuthorizationError = (message: string): IntegrationServiceError => {
  return new IntegrationServiceError(message, 'AUTHORIZATION_ERROR', 403, false);
};

export const createNotFoundError = (message: string): IntegrationServiceError => {
  return new IntegrationServiceError(message, 'NOT_FOUND_ERROR', 404, false);
};

export const createConflictError = (message: string): IntegrationServiceError => {
  return new IntegrationServiceError(message, 'CONFLICT_ERROR', 409, false);
};

export const createRateLimitError = (message: string): IntegrationServiceError => {
  return new IntegrationServiceError(message, 'RATE_LIMIT_ERROR', 429, true);
};

export const createExternalServiceError = (
  message: string,
  integrationType: string,
  userId: string,
): IntegrationServiceError => {
  return new IntegrationServiceError(
    message,
    'EXTERNAL_SERVICE_ERROR',
    503,
    true,
    integrationType,
    userId,
  );
};

export const createSyncError = (
  message: string,
  integrationType: string,
  userId: string,
): IntegrationServiceError => {
  return new IntegrationServiceError(message, 'SYNC_ERROR', 500, true, integrationType, userId);
};
