import { createClient } from '@supabase/supabase-js';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { logSecurityEvent, logger } from '../utils/logger';

// Supabase client for authentication (lazy-loaded)
let supabase: any = null;

const getSupabaseClient = () => {
  if (!supabase) {
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];

    if (!url || !key) {
      throw new Error('Supabase configuration is missing');
    }

    supabase = createClient(url, key);
  }
  return supabase;
};

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    clientId?: string;
  };
}

// JWT token validation
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // In test mode, skip authentication and use mock user
    if (process.env['NODE_ENV'] === 'test') {
      req.user = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'user',
        clientId: 'test-client-id',
      };
      next();
      return;
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      logSecurityEvent('missing_token', 'anonymous', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
      });
      res.status(401).json({
        success: false,
        error: 'Access token required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as any;

    // Get user from Supabase
    const { data: user, error } = await getSupabaseClient().auth.getUser(token);

    if (error || !user.user) {
      logSecurityEvent('invalid_token', decoded.sub || 'unknown', {
        error: error?.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Get user profile and client information
    const { data: profile, error: profileError } = await getSupabaseClient()
      .from('user_profiles')
      .select(
        `
        id,
        email,
        role,
        clients!inner(id, name)
      `
      )
      .eq('id', user.user.id)
      .single();

    if (profileError || !profile) {
      logger.error('Failed to fetch user profile', {
        userId: user.user.id,
        error: profileError?.message,
      });
      res.status(403).json({
        success: false,
        error: 'User profile not found',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      clientId: profile.clients?.[0]?.id,
    };

    logger.info('User authenticated', {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role,
      clientId: req.user.clientId,
    });

    next();
  } catch (error) {
    logger.error('Authentication error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token format',
        timestamp: new Date().toISOString(),
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Authentication service error',
        timestamp: new Date().toISOString(),
      });
    }
  }
};

// Role-based authorization
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logSecurityEvent('insufficient_permissions', req.user.id, {
        requiredRoles: allowedRoles,
        userRole: req.user.role,
        url: req.url,
      });
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};

// Client access validation
export const requireClientAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const clientId = req.params['clientId'] || req.body['clientId'];

    if (!clientId) {
      res.status(400).json({
        success: false,
        error: 'Client ID required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // In test mode, skip client access validation
    if (process.env['NODE_ENV'] === 'test') {
      req.body.clientId = clientId;
      next();
      return;
    }

    // Check if user has access to the client
    const { data: clientAccess, error } = await getSupabaseClient()
      .from('clients')
      .select('id, user_id')
      .eq('id', clientId)
      .eq('user_id', req.user.id)
      .single();

    if (error || !clientAccess) {
      logSecurityEvent('unauthorized_client_access', req.user.id, {
        clientId,
        error: error?.message,
      });
      res.status(403).json({
        success: false,
        error: 'Access denied to client',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Client access validation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id,
      clientId: req.params['clientId'] || req.body['clientId'],
    });

    res.status(500).json({
      success: false,
      error: 'Client access validation failed',
      timestamp: new Date().toISOString(),
    });
  }
};

// API key validation for service-to-service communication
export const validateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({
        success: false,
        error: 'API key required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Validate API key against database
    const { data: keyData, error } = await getSupabaseClient()
      .from('api_keys')
      .select('id, name, permissions, is_active, expires_at')
      .eq('key_hash', apiKey)
      .eq('is_active', true)
      .single();

    if (error || !keyData) {
      logSecurityEvent('invalid_api_key', 'service', {
        apiKey: apiKey.substring(0, 8) + '...',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      res.status(401).json({
        success: false,
        error: 'Invalid API key',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check if key is expired
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      logSecurityEvent('expired_api_key', 'service', {
        keyId: keyData.id,
        ip: req.ip,
      });
      res.status(401).json({
        success: false,
        error: 'API key expired',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Attach API key info to request
    (req as any).apiKey = keyData;
    next();
  } catch (error) {
    logger.error('API key validation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
    });

    res.status(500).json({
      success: false,
      error: 'API key validation failed',
      timestamp: new Date().toISOString(),
    });
  }
};
