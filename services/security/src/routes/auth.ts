import { createClient } from '@supabase/supabase-js';
import { Request, Response, Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

const router = Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validate JWT token
router.post('/validate', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Token is required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn('Token validation failed', { error: error?.message });
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString()
      });
      return;
    }

    logger.info('Token validation successful', { userId: user.id });

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'user',
        status: user.user_metadata?.status || 'active'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Token validation error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

// Refresh JWT token
router.post('/refresh', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Refresh token is required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error || !data.session) {
      logger.warn('Token refresh failed', { error: error?.message });
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired refresh token',
        timestamp: new Date().toISOString()
      });
      return;
    }

    logger.info('Token refresh successful', { userId: data.user?.id });

    res.status(200).json({
      success: true,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      user: {
        id: data.user?.id || '',
        email: data.user?.email || '',
        role: data.user?.user_metadata?.role || 'user'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Token refresh error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

// Revoke JWT token
router.post('/revoke', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Token is required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.warn('Token revocation failed', { error: error.message });
      res.status(400).json({
        error: 'Bad Request',
        message: 'Failed to revoke token',
        timestamp: new Date().toISOString()
      });
      return;
    }

    logger.info('Token revocation successful');

    res.status(200).json({
      success: true,
      message: 'Token revoked successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Token revocation error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

// Get user permissions
router.get('/permissions', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID not found',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get user role and permissions
    const { data: user, error } = await supabase
      .from('users')
      .select('role, permissions')
      .eq('id', userId)
      .single();

    if (error || !user) {
      logger.warn('User permissions lookup failed', { userId, error: error?.message });
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      permissions: {
        role: user.role,
        permissions: user.permissions || []
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('User permissions error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

export default router;
