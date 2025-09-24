/**
 * Rate limiting middleware for Event Sourcing Service
 */

import { NextFunction, Request, Response } from 'express';

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Basic rate limiting middleware - to be implemented
  next();
};
