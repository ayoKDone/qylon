import winston from 'winston';

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

      if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta)}`;
      }

      return log;
    })
  ),
  defaultMeta: {
    service: 'team-onboarding',
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

// Helper functions for structured logging
export const logTeamOperation = (
  operation: string,
  teamId: string,
  userId: string,
  details?: any
) => {
  logger.info('Team operation', {
    operation,
    teamId,
    userId,
    ...details,
  });
};

export const logUserProvisioning = (
  operation: string,
  teamId: string,
  userId: string,
  userCount: number,
  details?: any
) => {
  logger.info('User provisioning operation', {
    operation,
    teamId,
    userId,
    userCount,
    ...details,
  });
};

export const logComplianceEvent = (
  event: string,
  teamId: string,
  userId: string,
  complianceType: string,
  details?: any
) => {
  logger.info('Compliance event', {
    event,
    teamId,
    userId,
    complianceType,
    ...details,
  });
};

export const logBulkOperation = (
  operation: string,
  teamId: string,
  userId: string,
  itemCount: number,
  details?: any
) => {
  logger.info('Bulk operation', {
    operation,
    teamId,
    userId,
    itemCount,
    ...details,
  });
};

export const logError = (
  error: Error,
  context: string,
  details?: any
) => {
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    context,
    ...details,
  });
};
