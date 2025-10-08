import { Request, Response, Router } from 'express';
import { requireClientAccess } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AutomatedBotDeploymentService } from '../services/AutomatedBotDeploymentService';
import { ApiResponse } from '../types';
import { logger } from '../utils/logger';

const router: Router = Router();
const botDeploymentService = new AutomatedBotDeploymentService();

/**
 * Deploy bots for all upcoming meetings for a client
 */
router.post(
  '/deploy/upcoming',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const clientId = req.body.client_id;
      const teamId = req.body.team_id;
      const hoursAhead = req.body.hours_ahead || 24;

      if (!clientId) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'client_id is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const results = await botDeploymentService.deployBotsForUpcomingMeetings(
        clientId,
        teamId,
        hoursAhead,
      );

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      logger.info('Bot deployment for upcoming meetings completed', {
        clientId,
        teamId,
        totalMeetings: results.length,
        successfulDeployments: successCount,
        failedDeployments: failureCount,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: {
          totalMeetings: results.length,
          successfulDeployments: successCount,
          failedDeployments: failureCount,
          results,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to deploy bots for upcoming meetings', {
        error: error.message,
        body: req.body,
      });

      res.status(500).json({
        success: false,
        error: 'DeploymentError',
        message: 'Failed to deploy bots for upcoming meetings',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

/**
 * Deploy bot for on-the-fly meeting
 */
router.post(
  '/deploy/on-the-fly',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { meeting_url, client_id, team_id, host_name } = req.body;

      if (!meeting_url || !client_id) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'meeting_url and client_id are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await botDeploymentService.deployBotForOnTheFlyMeeting(
        meeting_url,
        client_id,
        team_id,
        host_name,
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: 'DeploymentError',
          message: 'Failed to deploy bot for on-the-fly meeting',
          details: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info('Bot deployed for on-the-fly meeting', {
        clientId: client_id,
        teamId: team_id,
        hostName: host_name,
        botId: result.bot?.id,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: {
          bot: result.bot,
          meeting_url,
          client_id,
          team_id,
          host_name,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error('Failed to deploy bot for on-the-fly meeting', {
        error: error.message,
        body: req.body,
      });

      res.status(500).json({
        success: false,
        error: 'DeploymentError',
        message: 'Failed to deploy bot for on-the-fly meeting',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

/**
 * Get bot deployment configuration for a client
 */
router.get(
  '/config/:clientId',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId } = req.params;

      const config =
        await botDeploymentService.getBotDeploymentConfig(clientId);

      const response: ApiResponse<any> = {
        success: true,
        data: config,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to get bot deployment config', {
        clientId: req.params.clientId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'ConfigError',
        message: 'Failed to get bot deployment configuration',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

/**
 * Update bot deployment configuration for a client
 */
router.put(
  '/config/:clientId',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId } = req.params;
      const config = req.body;

      if (!config) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Configuration data is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await botDeploymentService.updateBotDeploymentConfig(clientId, config);

      logger.info('Bot deployment config updated', {
        clientId,
        config,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: { message: 'Configuration updated successfully' },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to update bot deployment config', {
        clientId: req.params.clientId,
        config: req.body,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'ConfigError',
        message: 'Failed to update bot deployment configuration',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

/**
 * Cleanup inactive bots for a client
 */
router.post(
  '/cleanup/:clientId',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId } = req.params;
      const olderThanHours = req.body.older_than_hours || 24;

      const deletedCount = await botDeploymentService.cleanupInactiveBots(
        clientId,
        olderThanHours,
      );

      logger.info('Bot cleanup completed', {
        clientId,
        deletedCount,
        olderThanHours,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: {
          deletedCount,
          olderThanHours,
          clientId,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to cleanup inactive bots', {
        clientId: req.params.clientId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'CleanupError',
        message: 'Failed to cleanup inactive bots',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

/**
 * Get deployment status for a client
 */
router.get(
  '/status/:clientId',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId } = req.params;
      const teamId = req.query.team_id as string;

      // Get upcoming meetings
      const upcomingMeetings = await botDeploymentService.getUpcomingMeetings(
        clientId,
        teamId,
        24,
      );

      // Get deployment config
      const config =
        await botDeploymentService.getBotDeploymentConfig(clientId);

      // Count meetings with bots
      let meetingsWithBots = 0;
      for (const meeting of upcomingMeetings) {
        const existingBot = await botDeploymentService.getExistingBotForMeeting(
          meeting.id,
        );
        if (existingBot) {
          meetingsWithBots++;
        }
      }

      const response: ApiResponse<any> = {
        success: true,
        data: {
          clientId,
          teamId,
          totalUpcomingMeetings: upcomingMeetings.length,
          meetingsWithBots,
          meetingsWithoutBots: upcomingMeetings.length - meetingsWithBots,
          autoDeployEnabled: config.autoDeploy,
          config,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to get deployment status', {
        clientId: req.params.clientId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'StatusError',
        message: 'Failed to get deployment status',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

export default router;
