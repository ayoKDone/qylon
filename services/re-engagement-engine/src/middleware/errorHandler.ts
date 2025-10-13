import { NextFunction, Request, Response } from 'express';
import { ApiResponse, ReEngagementError } from '../types';
import { logger } from '../utils/logger';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: Record<string, any>;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const statusCode = error.statusCode || 500;
  const errorCode = error.code || 'INTERNAL_SERVER_ERROR';

  logger.error('Error handled by middleware', {
    error: error.message,
    stack: error.stack,
    statusCode,
    errorCode,
    url: req.url,
    method: req.method,
    requestId: req.headers['x-request-id'],
    details: error.details,
  });

  const reEngagementError: ReEngagementError = {
    code: errorCode,
    message: error.message,
    details: error.details,
    timestamp: new Date().toISOString(),
  };

  const response: ApiResponse<null> = {
    success: false,
    error: error.message,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn('Route not found', {
    url: req.url,
    method: req.method,
    requestId: req.headers['x-request-id'],
  });

  const response: ApiResponse<null> = {
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(response);
};

export const validationErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (error.isJoi) {
    const validationErrors = error.details.map((detail: any) => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value,
    }));

    logger.warn('Validation error', {
      errors: validationErrors,
      url: req.url,
      method: req.method,
      requestId: req.headers['x-request-id'],
    });

    const response: ApiResponse<null> = {
      success: false,
      error: 'Validation failed',
      timestamp: new Date().toISOString(),
    };

    res.status(400).json(response);
    return;
  }

  next(error);
};

export const createError = (
  message: string,
  statusCode: number = 500,
  code: string = 'INTERNAL_SERVER_ERROR',
  details?: Record<string, any>,
): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
