import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { createUnauthorizedError, createForbiddenError } from './errorHandler';
import { logger } from '../utils/logger';

// Extend Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    teamId?: string;
    permissions?: string[];
  };
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Authentication middleware
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw createUnauthorizedError('Access token required');
    }

    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn('Invalid token provided', {
        error: error?.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      throw createUnauthorizedError('Invalid or expired token');
    }

    // Get user details from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role, team_id, permissions')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      logger.warn('User not found in database', {
        userId: user.id,
        error: userError?.message,
      });
      throw createUnauthorizedError('User not found');
    }

    // Attach user to request
    req.user = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      teamId: userData.team_id,
      permissions: userData.permissions || [],
    };

    logger.debug('User authenticated successfully', {
      userId: userData.id,
      email: userData.email,
      role: userData.role,
    });

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require specific role middleware
 */
export const requireRole = (roles: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createUnauthorizedError('Authentication required');
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      logger.warn('Insufficient role for access', {
        userId: req.user.id,
        userRole,
        requiredRoles: allowedRoles,
        path: req.path,
      });
      throw createForbiddenError(`Required role: ${allowedRoles.join(' or ')}`);
    }

    next();
  };
};

/**
 * Require specific permission middleware
 */
export const requirePermission = (permissions: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createUnauthorizedError('Authentication required');
    }

    const userPermissions = req.user.permissions || [];
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      logger.warn('Insufficient permissions for access', {
        userId: req.user.id,
        userPermissions,
        requiredPermissions,
        path: req.path,
      });
      throw createForbiddenError(`Required permission: ${requiredPermissions.join(' or ')}`);
    }

    next();
  };
};

/**
 * Require team access middleware
 */
export const requireTeamAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw createUnauthorizedError('Authentication required');
  }

  const teamId = req.params.teamId || req.body.teamId || req.query.teamId;
  
  if (!teamId) {
    throw createForbiddenError('Team ID required');
  }

  // Check if user has access to the team
  if (req.user.teamId !== teamId && !req.user.permissions?.includes('manage_teams')) {
    logger.warn('User attempted to access different team', {
      userId: req.user.id,
      userTeamId: req.user.teamId,
      requestedTeamId: teamId,
    });
    throw createForbiddenError('Access denied to this team');
  }

  next();
};

/**
 * Require admin access middleware
 */
export const requireAdminAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw createUnauthorizedError('Authentication required');
  }

  const adminRoles = ['super_admin', 'team_admin'];
  
  if (!adminRoles.includes(req.user.role)) {
    logger.warn('Non-admin user attempted admin operation', {
      userId: req.user.id,
      userRole: req.user.role,
      path: req.path,
    });
    throw createForbiddenError('Administrator access required');
  }

  next();
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    // Try to authenticate, but don't fail if it doesn't work
    await authenticateToken(req, res, next);
  } catch (error) {
    // If authentication fails, continue without user context
    logger.debug('Optional authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next();
  }
};
