import { Request, Response, Router } from 'express';
import { requireClientAccess } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { RecallAIService } from '../services/RecallAIService';
import { ApiResponse } from '../types';
import { logger } from '../utils/logger';

const router: Router = Router();
const recallAIService = new RecallAIService();

/**
 * Get bot status with detailed troubleshooting information
 */
router.get(
  '/status/:botId',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { botId } = req.params;

      if (!botId) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'botId is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const botStatus = await recallAIService.getBotStatus(botId);

      const response: ApiResponse<any> = {
        success: true,
        data: botStatus,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to get bot status', {
        botId: req.params.botId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'StatusError',
        message: 'Failed to get bot status',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

/**
 * Diagnose bot issues and get troubleshooting recommendations
 */
router.get(
  '/diagnose/:botId',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { botId } = req.params;

      if (!botId) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'botId is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const diagnosis = await recallAIService.diagnoseBotIssues(botId);

      const response: ApiResponse<any> = {
        success: true,
        data: diagnosis,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to diagnose bot issues', {
        botId: req.params.botId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'DiagnosisError',
        message: 'Failed to diagnose bot issues',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

/**
 * Get bot screenshots for debugging
 */
router.get(
  '/screenshots/:botId',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { botId } = req.params;

      if (!botId) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'botId is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const screenshots = await recallAIService.getBotScreenshots(botId);

      const response: ApiResponse<any> = {
        success: true,
        data: {
          botId,
          screenshots,
          count: screenshots.length,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to get bot screenshots', {
        botId: req.params.botId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'ScreenshotsError',
        message: 'Failed to get bot screenshots',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

/**
 * Get specific bot screenshot
 */
router.get(
  '/screenshots/:botId/:screenshotId',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { botId, screenshotId } = req.params;

      if (!botId || !screenshotId) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'botId and screenshotId are required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const screenshot = await recallAIService.getBotScreenshot(
        botId,
        screenshotId,
      );

      const response: ApiResponse<any> = {
        success: true,
        data: screenshot,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to get bot screenshot', {
        botId: req.params.botId,
        screenshotId: req.params.screenshotId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'ScreenshotError',
        message: 'Failed to get bot screenshot',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

/**
 * Get bot explorer URL for manual debugging
 */
router.get(
  '/explorer/:botId',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { botId } = req.params;

      if (!botId) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'botId is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate explorer URL based on region
      const region = process.env.RECALL_AI_BASE_URL?.includes('us-west-2')
        ? 'us-west-2'
        : 'us-east-1';
      const explorerUrl = `https://${region}.recall.ai/dashboard/explorer/bot/${botId}`;

      const response: ApiResponse<any> = {
        success: true,
        data: {
          botId,
          explorerUrl,
          region,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to get bot explorer URL', {
        botId: req.params.botId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'ExplorerError',
        message: 'Failed to get bot explorer URL',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

/**
 * Get comprehensive bot troubleshooting information
 */
router.get(
  '/troubleshoot/:botId',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { botId } = req.params;

      if (!botId) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'botId is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Get comprehensive troubleshooting information
      const [botStatus, diagnosis, screenshots] = await Promise.allSettled([
        recallAIService.getBotStatus(botId),
        recallAIService.diagnoseBotIssues(botId),
        recallAIService.getBotScreenshots(botId),
      ]);

      const troubleshooting = {
        botId,
        status: botStatus.status === 'fulfilled' ? botStatus.value : null,
        diagnosis: diagnosis.status === 'fulfilled' ? diagnosis.value : null,
        screenshots:
          screenshots.status === 'fulfilled' ? screenshots.value : null,
        errors: {
          statusError:
            botStatus.status === 'rejected' ? botStatus.reason?.message : null,
          diagnosisError:
            diagnosis.status === 'rejected' ? diagnosis.reason?.message : null,
          screenshotsError:
            screenshots.status === 'rejected'
              ? screenshots.reason?.message
              : null,
        },
      };

      const response: ApiResponse<any> = {
        success: true,
        data: troubleshooting,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to get comprehensive troubleshooting info', {
        botId: req.params.botId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'TroubleshootingError',
        message: 'Failed to get comprehensive troubleshooting information',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

/**
 * Get bot troubleshooting guide based on error codes
 */
router.get(
  '/guide/:errorCode',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { errorCode } = req.params;
      const { subCode } = req.query;

      const troubleshootingGuide = getTroubleshootingGuide(
        errorCode,
        subCode as string,
      );

      const response: ApiResponse<any> = {
        success: true,
        data: troubleshootingGuide,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to get troubleshooting guide', {
        errorCode: req.params.errorCode,
        subCode: req.query.subCode,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'GuideError',
        message: 'Failed to get troubleshooting guide',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

/**
 * Get troubleshooting guide for specific error codes
 */
function getTroubleshootingGuide(
  errorCode: string,
  subCode?: string,
): {
  errorCode: string;
  subCode?: string;
  title: string;
  description: string;
  steps: string[];
  prevention: string[];
  relatedLinks: string[];
} {
  const guides: Record<string, any> = {
    meeting_not_found: {
      title: 'Meeting Not Found',
      description:
        'The bot was unable to find the meeting at the provided URL.',
      steps: [
        'Verify the meeting URL is correct and complete',
        'Check if the meeting has been cancelled or rescheduled',
        'Ensure the meeting exists and is accessible',
        'Try creating a new meeting and updating the URL',
      ],
      prevention: [
        'Always verify meeting URLs before deployment',
        'Use calendar integration to get accurate meeting URLs',
        'Implement URL validation before bot creation',
      ],
      relatedLinks: [
        'https://docs.recall.ai/troubleshooting/meeting-not-found',
        'https://docs.recall.ai/guides/meeting-url-validation',
      ],
    },
    insufficient_permissions: {
      title: 'Insufficient Permissions',
      description:
        'The bot does not have the necessary permissions to join the meeting.',
      steps: [
        'Check meeting settings and ensure bots are allowed',
        'Verify the meeting host has granted necessary permissions',
        'Check if the meeting requires authentication',
        'Ensure the bot account has proper access rights',
      ],
      prevention: [
        'Configure meeting settings to allow bots',
        'Use authenticated bot accounts when required',
        'Test bot permissions before deployment',
      ],
      relatedLinks: [
        'https://docs.recall.ai/troubleshooting/permissions',
        'https://docs.recall.ai/guides/bot-authentication',
      ],
    },
    waiting_room_blocked: {
      title: 'Bot Stuck in Waiting Room',
      description: 'The bot is waiting to be admitted to the meeting.',
      steps: [
        'Ask the meeting host to admit the bot from the waiting room',
        'Check if the meeting has waiting room enabled',
        'Verify the bot name is recognizable to the host',
        'Consider disabling waiting room for automated meetings',
      ],
      prevention: [
        'Configure meetings to automatically admit bots',
        'Use recognizable bot names',
        'Disable waiting room for automated meetings',
      ],
      relatedLinks: [
        'https://docs.recall.ai/troubleshooting/waiting-room',
        'https://docs.recall.ai/guides/meeting-settings',
      ],
    },
    recording_disabled: {
      title: 'Recording Disabled',
      description: 'Recording is disabled for this meeting.',
      steps: [
        'Enable recording in the meeting settings',
        'Check if the meeting platform allows recording',
        'Verify the bot has recording permissions',
        'Contact the meeting host to enable recording',
      ],
      prevention: [
        'Always enable recording before bot deployment',
        'Configure default recording settings',
        'Verify recording permissions during setup',
      ],
      relatedLinks: [
        'https://docs.recall.ai/troubleshooting/recording',
        'https://docs.recall.ai/guides/recording-setup',
      ],
    },
  };

  const guide = guides[errorCode] ||
    guides[subCode || ''] || {
      title: 'Unknown Error',
      description: 'An unknown error occurred with the bot.',
      steps: [
        'Check the bot status in the Recall.ai dashboard',
        'Review the bot logs for more details',
        'Contact Recall.ai support if the issue persists',
      ],
      prevention: [
        'Monitor bot status regularly',
        'Implement proper error handling',
        'Keep bot configurations up to date',
      ],
      relatedLinks: [
        'https://docs.recall.ai/troubleshooting',
        'https://docs.recall.ai/support',
      ],
    };

  return {
    errorCode,
    subCode,
    ...guide,
  };
}

export default router;
