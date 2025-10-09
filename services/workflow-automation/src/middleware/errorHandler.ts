import { NextFunction, Request, Response } from 'express';
import { ExecutionError, StateMachineError, WorkflowError } from '../types';
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
 * Global error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const requestId = (req as any).requestId;

  // Log the error
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle specific error types
  if (error instanceof WorkflowError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.name,
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
      requestId,
    });
    return;
  }

  if (error instanceof ExecutionError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.name,
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
      requestId,
    });
    return;
  }

  if (error instanceof StateMachineError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.name,
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
      requestId,
    });
    return;
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: error.message,
      timestamp: new Date().toISOString(),
      requestId,
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid token',
      timestamp: new Date().toISOString(),
      requestId,
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Token has expired',
      timestamp: new Date().toISOString(),
      requestId,
    });
    return;
  }

  // Handle database errors
  if (error.name === 'PostgresError') {
    res.status(500).json({
      success: false,
      error: 'DatabaseError',
      message: 'Database operation failed',
      timestamp: new Date().toISOString(),
      requestId,
    });
    return;
  }

  // Handle rate limiting errors
  if (error.message.includes('Too Many Requests')) {
    res.status(429).json({
      success: false,
      error: 'TooManyRequests',
      message: 'Rate limit exceeded',
      timestamp: new Date().toISOString(),
      requestId,
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: 'InternalServerError',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
    timestamp: new Date().toISOString(),
    requestId,
  });
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const requestId = (req as any).requestId;

  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId,
  });

  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
    requestId,
  });
};
