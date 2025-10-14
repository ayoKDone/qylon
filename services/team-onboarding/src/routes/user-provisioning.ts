import { Response, Router } from 'express';
import multer from 'multer';
import { AuthenticatedRequest, authenticateToken, requirePermission, requireTeamAccess } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { UserProvisioningService } from '../services/UserProvisioningService';
import { ApiResponse } from '../types';
import { logger } from '../utils/logger';

const router: Router = Router();
const userProvisioningService = new UserProvisioningService();

// Configure multer for CSV file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * Create user provisioning request
 */
router.post(
  '/requests',
  requireTeamAccess,
  requirePermission('manage_users'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const request = await userProvisioningService.createUserProvisioningRequest(
        req.body,
        userId
      );

      logger.info('User provisioning request created successfully', {
        requestId: request.id,
        teamId: request.teamId,
        userCount: request.users.length,
        createdBy: userId,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: request,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('User provisioning request creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
      });
      throw error;
    }
  })
);

/**
 * Process user provisioning request
 */
router.post(
  '/requests/:requestId/process',
  requireTeamAccess,
  requirePermission('manage_users'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userId = req.user!.id;

      const processedRequest = await userProvisioningService.processUserProvisioningRequest(
        requestId,
        userId
      );

      logger.info('User provisioning request processed successfully', {
        requestId,
        teamId: processedRequest.teamId,
        status: processedRequest.status,
        createdBy: userId,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: processedRequest,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('User provisioning request processing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: req.params.requestId,
        userId: req.user?.id,
      });
      throw error;
    }
  })
);

/**
 * Upload CSV file for user provisioning
 */
router.post(
  '/upload-csv',
  requireTeamAccess,
  requirePermission('manage_users'),
  upload.single('csvFile'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { teamId } = req.body;

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'CSV file is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Parse CSV file
      const users = await userProvisioningService.parseCSVForUserProvisioning(
        req.file.buffer,
        teamId
      );

      // Create provisioning request
      const request = await userProvisioningService.createUserProvisioningRequest(
        { teamId, users },
        userId
      );

      logger.info('CSV file uploaded and processed successfully', {
        requestId: request.id,
        teamId,
        userCount: users.length,
        fileName: req.file.originalname,
        createdBy: userId,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: {
          request,
          parsedUsers: users,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('CSV upload and processing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
      });
      throw error;
    }
  })
);

/**
 * Create bulk user operation
 */
router.post(
  '/bulk-operations',
  requireTeamAccess,
  requirePermission('bulk_operations'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const operation = await userProvisioningService.createBulkUserOperation(
        req.body,
        userId
      );

      logger.info('Bulk user operation created successfully', {
        operationId: operation.id,
        teamId: operation.teamId,
        operation: operation.operation,
        userCount: operation.userIds.length,
        createdBy: userId,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: operation,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Bulk user operation creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
      });
      throw error;
    }
  })
);

/**
 * Process bulk user operation
 */
router.post(
  '/bulk-operations/:operationId/process',
  requireTeamAccess,
  requirePermission('bulk_operations'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { operationId } = req.params;
      const userId = req.user!.id;

      const processedOperation = await userProvisioningService.processBulkUserOperation(
        operationId,
        userId
      );

      logger.info('Bulk user operation processed successfully', {
        operationId,
        teamId: processedOperation.teamId,
        operation: processedOperation.operation,
        status: processedOperation.status,
        processedBy: userId,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: processedOperation,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Bulk user operation processing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        operationId: req.params.operationId,
        userId: req.user?.id,
      });
      throw error;
    }
  })
);

/**
 * Get user provisioning request by ID
 */
router.get(
  '/requests/:requestId',
  requireTeamAccess,
  requirePermission('manage_users'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;

      // TODO: Implement get provisioning request by ID
      // This would require adding a method to UserProvisioningService

      res.status(501).json({
        success: false,
        error: 'NOT_IMPLEMENTED',
        message: 'Get provisioning request by ID not implemented yet',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to get user provisioning request', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: req.params.requestId,
        userId: req.user?.id,
      });
      throw error;
    }
  })
);

/**
 * Get bulk user operation by ID
 */
router.get(
  '/bulk-operations/:operationId',
  requireTeamAccess,
  requirePermission('bulk_operations'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { operationId } = req.params;

      // TODO: Implement get bulk operation by ID
      // This would require adding a method to UserProvisioningService

      res.status(501).json({
        success: false,
        error: 'NOT_IMPLEMENTED',
        message: 'Get bulk operation by ID not implemented yet',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to get bulk user operation', {
        error: error instanceof Error ? error.message : 'Unknown error',
        operationId: req.params.operationId,
        userId: req.user?.id,
      });
      throw error;
    }
  })
);

export default router;
