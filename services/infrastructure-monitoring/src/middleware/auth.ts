/**
 * Authentication middleware for Infrastructure Monitoring Service
 */

import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Basic authentication middleware - to be implemented
  next();
};
