import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      logger.warn('Authentication failed: No token provided', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      });
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Access token required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn('Authentication failed: Invalid token', {
        error: error?.message,
        ip: req.ip,
        path: req.path
      });
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if user is active
    if (user.user_metadata?.status !== 'active') {
      logger.warn('Authentication failed: Inactive user', {
        userId: user.id,
        ip: req.ip,
        path: req.path
      });
      res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Account is inactive',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email!,
      role: user.user_metadata?.role || 'user'
    };

    logger.info('Authentication successful', {
      userId: user.id,
      email: user.email,
      role: req.user.role,
      ip: req.ip,
      path: req.path
    });

    next();
  } catch (error) {
    logger.error('Authentication error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      path: req.path
    });
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Authentication service error',
      timestamp: new Date().toISOString()
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed: Insufficient role', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        ip: req.ip,
        path: req.path
      });
      res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

export const requireClientAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const clientId = req.params.clientId || req.body.clientId;
    
    if (!clientId) {
      res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Client ID required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if user has access to the client
    const { data, error } = await supabase
      .from('clients')
      .select('id, user_id')
      .eq('id', clientId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      logger.warn('Client access denied', {
        userId: req.user.id,
        clientId,
        error: error?.message,
        ip: req.ip,
        path: req.path
      });
      res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Access denied to client',
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Client access check error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id,
      ip: req.ip,
      path: req.path
    });
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Access check service error',
      timestamp: new Date().toISOString()
    });
  }
};