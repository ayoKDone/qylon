import { AuthenticatedRequest, JWTPayload, UserRole } from '@/types';
import { logSecurity, logger } from '@/utils/logger';
import { createClient } from '@supabase/supabase-js';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

// Initialize Supabase client (optional for local development)
let supabase: any = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    logger.info('Supabase client initialized successfully in auth middleware');
  } else {
    logger.warn('Supabase not configured in auth middleware - running in local development mode');
  }
} catch (error) {
  logger.warn(
    'Failed to initialize Supabase client in auth middleware - running in local development mode',
    { error: error instanceof Error ? error.message : String(error) }
  );
}

/**
 * Authentication middleware that validates JWT tokens
 * and attaches user information to the request
 */
export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Wrap async operations in an immediately invoked async function
  (async () => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logSecurity('Missing or invalid authorization header', req);
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Missing or invalid authorization header',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      if (!token) {
        logSecurity('Empty token provided', req);
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Token is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single();

      if (error || !user) {
        logSecurity('User not found in database', req, {
          userId: decoded.userId,
        });
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if user is active
      if (user.status !== 'active') {
        logSecurity('Inactive user attempted access', req, {
          userId: user.id,
          status: user.status,
        });
        res.status(403).json({
          error: 'Forbidden',
          message: 'User account is inactive',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Attach user to request
      req.user = user;
      req.token = token;

      logger.info('User authenticated successfully', {
        userId: user.id,
        email: user.email,
        role: user.role,
        requestId: req.requestId,
      });

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        logSecurity('Invalid JWT token', req, { error: error.message });
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid token',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (error instanceof jwt.TokenExpiredError) {
        logSecurity('Expired JWT token', req);
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Token has expired',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.error('Authentication error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        requestId: req.requestId,
      });

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication failed',
        timestamp: new Date().toISOString(),
      });
    }
  })().catch(error => {
    logger.error('Unhandled error in auth middleware', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestId: req.requestId,
    });

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication failed',
        timestamp: new Date().toISOString(),
      });
    }
  });
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (roles: UserRole | UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      logSecurity('Insufficient permissions', req, {
        userRole,
        requiredRoles: allowedRoles,
      });

      res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * MSP Admin or Admin middleware
 */
export const requireMSPAdmin = requireRole([UserRole.ADMIN, UserRole.MSP_ADMIN]);

/**
 * Optional authentication middleware
 * Attaches user if token is present but doesn't require it
 */
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
      }

      const token = authHeader.substring(7);

      if (!token) {
        next();
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single();

      if (!error && user && user.status === 'active') {
        req.user = user;
        req.token = token;
      }

      next();
    } catch (error) {
      // For optional auth, we don't fail on token errors
      logger.debug('Optional auth failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: req.requestId,
      });
      next();
    }
  })().catch(error => {
    logger.debug('Unhandled error in optional auth', {
      error: error instanceof Error ? error.message : String(error),
      requestId: req.requestId,
    });
    next();
  });
};

/**
 * Client ownership middleware
 * Ensures user has access to the specified client
 */
export const requireClientAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  (async () => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const clientId = req.params.clientId || req.body.clientId;

      if (!clientId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Client ID is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Admin users have access to all clients
      if (req.user.role === UserRole.ADMIN) {
        next();
        return;
      }

      // Check if user has access to this client
      const { data: clientAccess, error } = await supabase
        .from('clients')
        .select('id, user_id')
        .eq('id', clientId)
        .eq('user_id', req.user.id)
        .single();

      if (error || !clientAccess) {
        logSecurity('Unauthorized client access attempt', req, {
          clientId,
          userId: req.user.id,
        });

        res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied to this client',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Client access check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        requestId: req.requestId,
      });

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Access verification failed',
        timestamp: new Date().toISOString(),
      });
    }
  })().catch(error => {
    logger.error('Unhandled error in requireClientAccess', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestId: req.requestId,
    });

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Client access verification failed',
        timestamp: new Date().toISOString(),
      });
    }
  });
};
