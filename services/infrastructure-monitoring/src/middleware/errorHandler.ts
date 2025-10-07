/**
 * Error handling middleware for Infrastructure Monitoring Service
 */

import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // eslint-disable-next-line no-console
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
};
