import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../types';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  const response: ApiResponse<null> = {
    success: false,
    error:
      process.env['NODE_ENV'] === 'production'
        ? 'Internal server error'
        : error.message,
    timestamp: new Date().toISOString(),
  };

  res.status(500).json(response);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const response: ApiResponse<null> = {
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(response);
};
