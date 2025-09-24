/**
 * Rate limiting middleware for Infrastructure Monitoring Service
 */

import { Request, Response, NextFunction } from 'express';

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Basic rate limiting middleware - to be implemented
  next();
};
