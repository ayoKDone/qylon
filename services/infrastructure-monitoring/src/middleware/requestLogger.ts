/**
 * Request logging middleware for Infrastructure Monitoring Service
 */

import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
};
