import { Request } from 'express';
import * as winston from 'winston';

// Custom log format with structured data
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      service: 'integration-management',
      ...meta,
    });
  }),
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  format: logFormat,
  defaultMeta: { service: 'integration-management' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
});

// Request logging middleware
export const logRequest = (req: Request, res: any, next: any) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: (req as any).user?.id,
      requestId: req.headers['x-request-id'],
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Integration-specific logging
export const logIntegrationEvent = (
  event: string,
  integrationType: string,
  userId: string,
  data: Record<string, any> = {},
) => {
  logger.info('Integration Event', {
    event,
    integrationType,
    userId,
    timestamp: new Date().toISOString(),
    ...data,
  });
};

export const logIntegrationError = (
  error: Error,
  integrationType: string,
  userId: string,
  context: Record<string, any> = {},
) => {
  logger.error('Integration Error', {
    error: error.message,
    stack: error.stack,
    integrationType,
    userId,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

export const logSyncResult = (
  integrationType: string,
  userId: string,
  result: {
    success: boolean;
    recordsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    recordsFailed: number;
    duration: number;
    errors?: string[];
  },
) => {
  logger.info('Sync Result', {
    integrationType,
    userId,
    ...result,
    timestamp: new Date().toISOString(),
  });
};

// Performance logging
export const logPerformance = (
  operation: string,
  duration: number,
  metadata: Record<string, any> = {},
) => {
  logger.info('Performance Metric', {
    operation,
    duration,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
};

// Security logging
export const logSecurityEvent = (
  event: string,
  userId: string,
  details: Record<string, any> = {},
) => {
  logger.warn('Security Event', {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...details,
  });
};
