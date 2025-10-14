import winston from 'winston';

// Create logger instance
export const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: {
    service: 're-engagement-engine',
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

// Request logging middleware
export const logRequest = (req: any, res: any, next: any): void => {
  const startTime = Date.now();

  logger.info('Request received', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    requestId: req.headers['x-request-id'],
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      requestId: req.headers['x-request-id'],
    });
  });

  next();
};

// Error logging helper
export const logError = (error: Error, context?: Record<string, any>): void => {
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    ...context,
  });
};

// Business event logging
export const logBusinessEvent = (event: string, data: Record<string, any>): void => {
  logger.info('Business event', {
    event,
    ...data,
  });
};

// Performance logging
export const logPerformance = (operation: string, duration: number, metadata?: Record<string, any>): void => {
  logger.info('Performance metric', {
    operation,
    duration,
    ...metadata,
  });
};
