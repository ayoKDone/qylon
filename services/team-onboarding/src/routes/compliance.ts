import { Response, Router } from 'express';
import { AuthenticatedRequest, authenticateToken, requirePermission, requireTeamAccess } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ComplianceManagementService } from '../services/ComplianceManagementService';
import { ApiResponse } from '../types';
import { logger } from '../utils/logger';

const router: Router = Router();
const complianceService = new ComplianceManagementService();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * Create compliance settings for a team
 */
router.post(
  '/:teamId/settings',
  requireTeamAccess,
  requirePermission('manage_compliance'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;
      const userId = req.user!.id;

      const complianceSettings = await complianceService.createComplianceSettings(
        teamId,
        req.body,
        userId
      );

      logger.info('Compliance settings created successfully', {
        teamId,
        createdBy: userId,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: complianceSettings,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Compliance settings creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId: req.params.teamId,
        userId: req.user?.id,
      });
      throw error;
    }
  })
);

/**
 * Get compliance settings for a team
 */
router.get(
  '/:teamId/settings',
  requireTeamAccess,
  requirePermission('manage_compliance'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;
      const complianceSettings = await complianceService.getComplianceSettings(teamId);

      const response: ApiResponse<any> = {
        success: true,
        data: complianceSettings,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Failed to get compliance settings', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId: req.params.teamId,
        userId: req.user?.id,
      });
      throw error;
    }
  })
);

/**
 * Update compliance settings
 */
router.put(
  '/:teamId/settings',
  requireTeamAccess,
  requirePermission('manage_compliance'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;
      const userId = req.user!.id;

      const updatedSettings = await complianceService.updateComplianceSettings(
        teamId,
        req.body,
        userId
      );

      logger.info('Compliance settings updated successfully', {
        teamId,
        updatedBy: userId,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: updatedSettings,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Compliance settings update failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId: req.params.teamId,
        userId: req.user?.id,
      });
      throw error;
    }
  })
);

/**
 * Create audit log entry
 */
router.post(
  '/:teamId/audit-logs',
  requireTeamAccess,
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;
      const userId = req.user!.id;
      const {
        action,
        resource,
        resourceId,
        details,
        success = true,
        errorMessage,
      } = req.body;

      const auditLog = await complianceService.createAuditLog(
        teamId,
        userId,
        action,
        resource,
        resourceId,
        details || {},
        req.ip || 'unknown',
        req.get('User-Agent') || 'unknown',
        success,
        errorMessage
      );

      const response: ApiResponse<any> = {
        success: true,
        data: auditLog,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Audit log creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId: req.params.teamId,
        userId: req.user?.id,
      });
      throw error;
    }
  })
);

/**
 * Get audit logs for a team
 */
router.get(
  '/:teamId/audit-logs',
  requireTeamAccess,
  requirePermission('view_analytics'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;
      const {
        userId,
        action,
        resource,
        startDate,
        endDate,
        success,
        page = 1,
        limit = 50,
      } = req.query;

      const filters: any = {};
      if (userId) filters.userId = userId as string;
      if (action) filters.action = action as string;
      if (resource) filters.resource = resource as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (success !== undefined) filters.success = success === 'true';

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await complianceService.getAuditLogs(teamId, filters, pagination);

      const response: ApiResponse<any> = {
        success: true,
        data: {
          logs: result.logs,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: result.total,
            totalPages: Math.ceil(result.total / pagination.limit),
            hasNext: pagination.page * pagination.limit < result.total,
            hasPrev: pagination.page > 1,
          },
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Failed to get audit logs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId: req.params.teamId,
        userId: req.user?.id,
      });
      throw error;
    }
  })
);

/**
 * Run compliance assessment
 */
router.post(
  '/:teamId/assessments',
  requireTeamAccess,
  requirePermission('manage_compliance'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;
      const userId = req.user!.id;
      const { framework } = req.body;

      if (!framework || !['GDPR', 'CCPA', 'HIPAA', 'SOX', 'ISO27001'].includes(framework)) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Valid framework is required (GDPR, CCPA, HIPAA, SOX, ISO27001)',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const assessment = await complianceService.runComplianceAssessment(
        teamId,
        framework,
        userId
      );

      logger.info('Compliance assessment completed successfully', {
        teamId,
        framework,
        status: assessment.status,
        runBy: userId,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: assessment,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Compliance assessment failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId: req.params.teamId,
        userId: req.user?.id,
      });
      throw error;
    }
  })
);

/**
 * Clean up expired data
 */
router.post(
  '/:teamId/cleanup',
  requireTeamAccess,
  requirePermission('manage_compliance'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;
      const userId = req.user!.id;

      const cleanupResult = await complianceService.cleanupExpiredData(teamId);

      logger.info('Data cleanup completed successfully', {
        teamId,
        deletedRecords: cleanupResult.deletedRecords,
        cleanedDataTypes: cleanupResult.cleanedDataTypes,
        runBy: userId,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: cleanupResult,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Data cleanup failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId: req.params.teamId,
        userId: req.user?.id,
      });
      throw error;
    }
  })
);

/**
 * Generate compliance report
 */
router.get(
  '/:teamId/reports',
  requireTeamAccess,
  requirePermission('view_analytics'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;
      const report = await complianceService.generateComplianceReport(teamId);

      logger.info('Compliance report generated successfully', {
        teamId,
        generatedAt: report.generatedAt,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: report,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Compliance report generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId: req.params.teamId,
        userId: req.user?.id,
      });
      throw error;
    }
  })
);

export default router;
