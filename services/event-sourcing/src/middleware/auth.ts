/**
 * Authentication middleware for Event Sourcing Service
 */

import { NextFunction, Request, Response } from 'express';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Basic authentication middleware - to be implemented
  next();
};
