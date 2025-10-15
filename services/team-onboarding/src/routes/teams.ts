import { Response, Router } from 'express';
import {
  AuthenticatedRequest,
  authenticateToken,
  requireAdminAccess,
  requireTeamAccess,
} from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { TeamAdministratorService } from '../services/TeamAdministratorService';
import { ApiResponse } from '../types';
import { logger } from '../utils/logger';

const router: Router = Router();
const teamAdministratorService = new TeamAdministratorService();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * Create a new team
 */
router.post(
  '/',
  requireAdminAccess,
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const team = await teamAdministratorService.createTeam(req.body, userId);

      logger.info('Team created successfully', {
        teamId: team.id,
        teamName: team.name,
        createdBy: userId,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: team,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Team creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
      });
      throw error;
    }
  }),
);

/**
 * Get team by ID
 */
router.get(
  '/:teamId',
  requireTeamAccess,
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;
      const team = await teamAdministratorService.getTeam(teamId);

      const response: ApiResponse<any> = {
        success: true,
        data: team,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Failed to get team', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId: req.params.teamId,
        userId: req.user?.id,
      });
      throw error;
    }
  }),
);

/**
 * Update team settings
 */
router.put(
  '/:teamId/settings',
  requireTeamAccess,
  requireAdminAccess,
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;
      const userId = req.user!.id;
      const { settings } = req.body;

      const updatedTeam = await teamAdministratorService.updateTeamSettings(
        teamId,
        settings,
        userId,
      );

      logger.info('Team settings updated successfully', {
        teamId,
        updatedBy: userId,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: updatedTeam,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Team settings update failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId: req.params.teamId,
        userId: req.user?.id,
      });
      throw error;
    }
  }),
);

/**
 * Create team administrator
 */
router.post(
  '/:teamId/administrators',
  requireTeamAccess,
  requireAdminAccess,
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;
      const userId = req.user!.id;
      const adminData = { ...req.body, teamId };

      const administrator = await teamAdministratorService.createTeamAdministrator(
        adminData,
        userId,
      );

      logger.info('Team administrator created successfully', {
        teamId,
        administratorId: administrator.id,
        userId: administrator.userId,
        role: administrator.role,
        createdBy: userId,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: administrator,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Team administrator creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId: req.params.teamId,
        userId: req.user?.id,
      });
      throw error;
    }
  }),
);

/**
 * Get team administrators
 */
router.get(
  '/:teamId/administrators',
  requireTeamAccess,
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;
      const administrators = await teamAdministratorService.getTeamAdministrators(teamId);

      const response: ApiResponse<any> = {
        success: true,
        data: administrators,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Failed to get team administrators', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId: req.params.teamId,
        userId: req.user?.id,
      });
      throw error;
    }
  }),
);

/**
 * Update team administrator
 */
router.put(
  '/:teamId/administrators/:adminId',
  requireTeamAccess,
  requireAdminAccess,
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { adminId } = req.params;
      const userId = req.user!.id;
      const updates = req.body;

      const updatedAdministrator = await teamAdministratorService.updateTeamAdministrator(
        adminId,
        updates,
        userId,
      );

      logger.info('Team administrator updated successfully', {
        adminId,
        updates,
        updatedBy: userId,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: updatedAdministrator,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Team administrator update failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminId: req.params.adminId,
        userId: req.user?.id,
      });
      throw error;
    }
  }),
);

/**
 * Delete team administrator
 */
router.delete(
  '/:teamId/administrators/:adminId',
  requireTeamAccess,
  requireAdminAccess,
  asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { adminId } = req.params;
      const userId = req.user!.id;

      await teamAdministratorService.deleteTeamAdministrator(adminId, userId);

      logger.info('Team administrator deleted successfully', {
        adminId,
        deletedBy: userId,
      });

      const response: ApiResponse<any> = {
        success: true,
        message: 'Team administrator deleted successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Team administrator deletion failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminId: req.params.adminId,
        userId: req.user?.id,
      });
      throw error;
    }
  }),
);

export default router;
