import { ErrorResponse } from '@/types';
import { logError, logger } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';

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
  logError(error, req);

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = undefined;

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = error.message;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Not Found';
  } else if (error.name === 'ConflictError') {
    statusCode = 409;
    message = 'Conflict';
  } else if (error.name === 'TooManyRequestsError') {
    statusCode = 429;
    message = 'Too Many Requests';
  } else if (error.name === 'ServiceUnavailableError') {
    statusCode = 503;
    message = 'Service Unavailable';
  }

  // Create error response
  const errorResponse: ErrorResponse = {
    error: message,
    message: error.message || message,
    timestamp: new Date().toISOString(),
    requestId: (req as any).requestId,
  };

  // Add details if available
  if (details) {
    errorResponse.details = details;
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorResponse.message = 'Internal Server Error';
    delete errorResponse.details;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler for unmatched routes
 */
export const notFoundHandler = (req: Request, _res: Response, _next: NextFunction): void => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  (error as any).statusCode = 404;
  _next(error);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error classes
 */
export class ValidationError extends Error {
  public statusCode: number = 400;
  public override name: string = 'ValidationError';

  constructor(
    message: string,
    public details?: any,
  ) {
    super(message);
  }
}

export class UnauthorizedError extends Error {
  public statusCode: number = 401;
  public override name: string = 'UnauthorizedError';

  constructor(message: string = 'Unauthorized') {
    super(message);
  }
}

export class ForbiddenError extends Error {
  public statusCode: number = 403;
  public override name: string = 'ForbiddenError';

  constructor(message: string = 'Forbidden') {
    super(message);
  }
}

export class NotFoundError extends Error {
  public statusCode: number = 404;
  public override name: string = 'NotFoundError';

  constructor(message: string = 'Not Found') {
    super(message);
  }
}

export class ConflictError extends Error {
  public statusCode: number = 409;
  public override name: string = 'ConflictError';

  constructor(message: string = 'Conflict') {
    super(message);
  }
}

export class TooManyRequestsError extends Error {
  public statusCode: number = 429;
  public override name: string = 'TooManyRequestsError';

  constructor(message: string = 'Too Many Requests') {
    super(message);
  }
}

export class ServiceUnavailableError extends Error {
  public statusCode: number = 503;
  public override name: string = 'ServiceUnavailableError';

  constructor(message: string = 'Service Unavailable') {
    super(message);
  }
}

/**
 * Error handler for unhandled promise rejections
 */
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise.toString(),
  });
});

/**
 * Error handler for uncaught exceptions
 */
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });

  // Exit the process after logging
  process.exit(1);
});
