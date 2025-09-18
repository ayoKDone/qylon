import winston from 'winston';

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
  ),
  defaultMeta: {
    service: 'meeting-intelligence',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));

  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));
}

// Security logging function
export const logSecurity = (message: string, req?: any, metadata?: any) => {
  logger.warn('SECURITY', {
    message,
    ip: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get?.('User-Agent'),
    path: req?.path,
    method: req?.method,
    userId: req?.user?.id,
    ...metadata
  });
};

// Performance logging function
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  logger.info('PERFORMANCE', {
    operation,
    duration,
    ...metadata
  });
};

// Business logic logging function
export const logBusiness = (event: string, metadata?: any) => {
  logger.info('BUSINESS', {
    event,
    ...metadata
  });
};

export { logger };
export default logger;
