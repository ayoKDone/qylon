import { createClient } from '@supabase/supabase-js';
import { NextFunction, Request, Response } from 'express';
import { logSecurity, logger } from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

/**
 * Authentication middleware that validates JWT tokens
 * and attaches user information to the request
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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

    // Verify JWT token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      logSecurity('Invalid JWT token', req, { error: error?.message });
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check if user is active
    if (user.user_metadata?.status !== 'active') {
      logSecurity('Inactive user attempted access', req, {
        userId: user.id,
        status: user.user_metadata?.status,
      });
      res.status(403).json({
        error: 'Forbidden',
        message: 'User account is inactive',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email!,
      role: user.user_metadata?.role || 'user',
    };

    logger.info('User authenticated successfully', {
      userId: user.id,
      email: user.email,
      role: req.user.role,
      requestId: (req as any).requestId,
    });

    next();
  } catch (error) {
    logger.error('Authentication error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId: (req as any).requestId,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (roles: string | string[]) => {
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
export const requireAdmin = requireRole('admin');

/**
 * Check if user has access to a specific client
 */
export const requireClientAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const clientId = req.params.clientId || req.body.client_id;

    if (!clientId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Client ID is required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Admin users have access to all clients
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Check if user has access to this client
    const { data: client, error } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !client) {
      logSecurity('Client access denied', req, {
        userId: req.user.id,
        clientId,
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
    logger.error('Client access check error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: (req as any).requestId,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Access check failed',
      timestamp: new Date().toISOString(),
    });
  }
};
