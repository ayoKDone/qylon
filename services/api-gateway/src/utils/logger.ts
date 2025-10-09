import winston from 'winston';
import { LogEntry } from '@/types';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, requestId, userId, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      service: service || 'api-gateway',
      requestId,
      userId,
      ...meta,
    });
  }),
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'api-gateway' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),

    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add request logging helper
export const logRequest = (req: any, res: any, responseTime: number) => {
  const logEntry: LogEntry = {
    level: 'info',
    message: `${req.method} ${req.originalUrl} ${res.statusCode}`,
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    requestId: req.requestId,
    userId: req.user?.id,
    metadata: {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      contentLength: res.get('Content-Length'),
    },
  };

  logger.info(logEntry);
};

// Add error logging helper
export const logError = (error: Error, req?: any, additionalInfo?: any) => {
  const logEntry: LogEntry = {
    level: 'error',
    message: error.message,
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    requestId: req?.requestId,
    userId: req?.user?.id,
    metadata: {
      stack: error.stack,
      name: error.name,
      ...additionalInfo,
      ...(req && {
        method: req.method,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      }),
    },
  };

  logger.error(logEntry);
};

// Add performance logging helper
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  const logEntry: LogEntry = {
    level: 'info',
    message: `Performance: ${operation} completed in ${duration}ms`,
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    metadata: {
      operation,
      duration,
      ...metadata,
    },
  };

  logger.info(logEntry);
};

// Add security logging helper
export const logSecurity = (event: string, req: any, metadata?: any) => {
  const logEntry: LogEntry = {
    level: 'warn',
    message: `Security Event: ${event}`,
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    requestId: req.requestId,
    userId: req.user?.id,
    metadata: {
      event,
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      ...metadata,
    },
  };

  logger.warn(logEntry);
};

// Create logs directory if it doesn't exist
import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
