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

// Get RLS policies for a table
router.get('/policies/:table', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { table } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID not found',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Query RLS policies for the table
    const { data, error } = await supabase
      .rpc('get_table_policies', { table_name: table });

    if (error) {
      logger.error('Failed to get RLS policies', {
        table,
        userId,
        error: error.message
      });
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve RLS policies',
        timestamp: new Date().toISOString()
      });
      return;
    }

    logger.info('RLS policies retrieved', { table, userId });

    res.status(200).json({
      success: true,
      table,
      policies: data || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('RLS policies error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

// Test RLS policy for a specific record
router.post('/test/:table', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { table } = req.params;
    const { recordId } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID not found',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!recordId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Record ID is required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Test access to the record
    const { data, error } = await supabase
      .from(table!)
      .select('*')
      .eq('id', recordId)
      .single();

    if (error) {
      logger.warn('RLS policy test failed', {
        table,
        recordId,
        userId,
        error: error.message
      });
      res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied by RLS policy',
        timestamp: new Date().toISOString()
      });
      return;
    }

    logger.info('RLS policy test successful', { table, recordId, userId });

    res.status(200).json({
      success: true,
      access: 'granted',
      record: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('RLS policy test error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

// Get user's accessible records for a table
router.get('/accessible/:table', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { table } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID not found',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get records accessible to the user
    const { data, error, count } = await supabase
      .from(table!)
      .select('*', { count: 'exact' })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      logger.error('Failed to get accessible records', {
        table,
        userId,
        error: error.message
      });
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve accessible records',
        timestamp: new Date().toISOString()
      });
      return;
    }

    logger.info('Accessible records retrieved', {
      table,
      userId,
      count: data?.length || 0
    });

    res.status(200).json({
      success: true,
      table,
      records: data || [],
      total: count || 0,
      limit: Number(limit),
      offset: Number(offset),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Accessible records error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

// Validate RLS policy configuration
router.post('/validate', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { table, policy, operation } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID not found',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!table || !policy || !operation) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Table, policy, and operation are required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Validate RLS policy syntax
    const { error } = await supabase
      .rpc('validate_rls_policy', {
        table_name: table,
        policy_name: policy,
        operation: operation
      });

    if (error) {
      logger.warn('RLS policy validation failed', {
        table,
        policy,
        operation,
        userId,
        error: error.message
      });
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid RLS policy configuration',
        details: error.message,
        timestamp: new Date().toISOString()
      });
      return;
    }

    logger.info('RLS policy validation successful', {
      table,
      policy,
      operation,
      userId
    });

    res.status(200).json({
      success: true,
      valid: true,
      table,
      policy,
      operation,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('RLS policy validation error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}));

export default router;
