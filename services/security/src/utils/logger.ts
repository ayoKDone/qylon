import winston from 'winston';

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'security-service',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),

    // File transport for errors
    new winston.transports.File({
      filename: 'logs/security-error.log',
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/security-combined.log',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  ],
});

// Add request correlation ID to logs
export const addCorrelationId = (correlationId: string) => {
  return logger.child({ correlationId });
};

// Security-specific log methods
export const logSecurityEvent = (event: string, details: any) => {
  logger.warn('Security Event', {
    event,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

export const logAuthAttempt = (success: boolean, details: any) => {
  const level = success ? 'info' : 'warn';
  logger.log(level, 'Authentication Attempt', {
    success,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

export const logAccessAttempt = (granted: boolean, details: any) => {
  const level = granted ? 'info' : 'warn';
  logger.log(level, 'Access Attempt', {
    granted,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

export const logRateLimitHit = (details: any) => {
  logger.warn('Rate Limit Hit', {
    ...details,
    timestamp: new Date().toISOString(),
  });
};

export default logger;
