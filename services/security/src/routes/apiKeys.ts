import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler';
import { APIKeyManager } from '../services/APIKeyManager';
import logger from '../utils/logger';

const router = Router();
const apiKeyManager = new APIKeyManager();

// Validation schemas
const createAPIKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()).min(1),
  expires_in_days: z.number().min(1).max(365).optional()
});

const rotateAPIKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  permissions: z.array(z.string()).min(1).optional(),
  expires_in_days: z.number().min(1).max(365).optional()
});

// Create a new API key
router.post('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

    // Validate request body
    const validationResult = createAPIKeySchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid request data',
        details: validationResult.error.errors,
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { name, permissions, expires_in_days } = validationResult.data;

    // Create the API key
    const apiKey = await apiKeyManager.createAPIKey(userId, {
      name,
      permissions,
      expires_in_days
    });

    logger.info('API key created', {
      userId,
      keyId: apiKey.id,
      name
    });

    res.status(201).json({
      success: true,
      data: apiKey,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('API key creation error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

// List user's API keys
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

    const apiKeys = await apiKeyManager.listAPIKeys(userId);

    res.status(200).json({
      success: true,
      data: apiKeys,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('API key listing error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

// Validate an API key
router.post('/validate', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.body;

    if (!key) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'API key is required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const validation = await apiKeyManager.validateAPIKey(key);

    if (!validation.valid) {
      res.status(401).json({
        error: 'Unauthorized',
        message: validation.error || 'Invalid API key',
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        valid: true,
        userId: validation.userId,
        permissions: validation.permissions
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('API key validation error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

// Revoke an API key
router.delete('/:keyId', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { keyId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID not found',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!keyId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Key ID is required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    await apiKeyManager.revokeAPIKey(keyId, userId);

    logger.info('API key revoked', {
      userId,
      keyId
    });

    res.status(200).json({
      success: true,
      message: 'API key revoked successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('API key revocation error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

// Rotate an API key
router.post('/:keyId/rotate', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { keyId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID not found',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!keyId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Key ID is required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Validate request body (optional fields for rotation)
    const validationResult = rotateAPIKeySchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid request data',
        details: validationResult.error.errors,
        timestamp: new Date().toISOString()
      });
      return;
    }

    const newAPIKey = await apiKeyManager.rotateAPIKey(keyId, userId, validationResult.data);

    logger.info('API key rotated', {
      userId,
      oldKeyId: keyId,
      newKeyId: newAPIKey.id
    });

    res.status(200).json({
      success: true,
      data: newAPIKey,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('API key rotation error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

// Cleanup expired API keys (admin only)
router.post('/cleanup', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID not found',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (userRole !== 'admin') {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const cleanedCount = await apiKeyManager.cleanupExpiredKeys();

    logger.info('API key cleanup completed', {
      userId,
      cleanedCount
    });

    res.status(200).json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired API keys`,
      cleanedCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('API key cleanup error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

export default router;
