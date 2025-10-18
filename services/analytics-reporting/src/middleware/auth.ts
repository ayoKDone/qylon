/**
 * Authentication Middleware for Analytics Service
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextFunction, Request, Response } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    client_id?: string;
  };
}

export class AuthMiddleware {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Authenticate user using JWT token
   */
  authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        });
        return;
      }

      const token = authHeader.substring(7);

      // Verify JWT token with Supabase
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        });
        return;
      }

      // Get user details from database
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('id, email, role, subscription_plan_id')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'User not found',
        });
        return;
      }

      // Get user's client if they have one
      const { data: clientData } = await this.supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      req.user = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        client_id: clientData?.id,
      };

      next();
    } catch (_error) {
      res.status(500).json({
        error: 'AUTHENTICATION_ERROR',
        message: 'Internal authentication error',
      });
    }
  };

  /**
   * Require admin role
   */
  requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'admin') {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Admin access required',
      });
      return;
    }

    next();
  };

  /**
   * Require specific role
   */
  requireRole = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          error: 'FORBIDDEN',
          message: `Access denied. Required roles: ${roles.join(', ')}`,
        });
        return;
      }

      next();
    };
  };

  /**
   * Optional authentication - doesn't fail if no token provided
   */
  optionalAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No token provided, continue without authentication
        next();
        return;
      }

      const token = authHeader.substring(7);

      // Verify JWT token with Supabase
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        // Invalid token, continue without authentication
        next();
        return;
      }

      // Get user details from database
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('id, email, role, subscription_plan_id')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        // User not found, continue without authentication
        next();
        return;
      }

      // Get user's client if they have one
      const { data: clientData } = await this.supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      req.user = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        client_id: clientData?.id,
      };

      next();
    } catch (_error) {
      // Error during authentication, continue without authentication
      next();
    }
  };

  /**
   * Validate user access to client data
   */
  validateClientAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
      return;
    }

    // Admins can access all client data
    if (req.user.role === 'admin') {
      next();
      return;
    }

    const clientId = req.params.clientId || req.body.client_id || req.query.client_id;

    if (!clientId) {
      res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Client ID is required',
      });
      return;
    }

    // Check if user has access to this client
    if (req.user.client_id !== clientId) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Access denied to client data',
      });
      return;
    }

    next();
  };

  /**
   * Validate user access to their own data
   */
  validateUserAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
      return;
    }

    // Admins can access all user data
    if (req.user.role === 'admin') {
      next();
      return;
    }

    const userId = req.params.userId || req.body.user_id || req.query.user_id;

    if (!userId) {
      res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'User ID is required',
      });
      return;
    }

    // Check if user is accessing their own data
    if (req.user.id !== userId) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Access denied to user data',
      });
      return;
    }

    next();
  };
}
