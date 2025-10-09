import { Request, Response, Router } from 'express';
import { requireClientAccess } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { RecallAIService } from '../services/RecallAIService';
import { ApiResponse } from '../types';
import { logger } from '../utils/logger';

const router: Router = Router();
const recallAIService = new RecallAIService();

/**
 * Pause bot recording
 */
router.post(
  '/pause/:botId',
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

      await recallAIService.pauseRecording(botId);

      const response: ApiResponse<any> = {
        success: true,
        data: {
          botId,
          action: 'pause_recording',
          message: 'Recording paused successfully',
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to pause recording', {
        botId: req.params.botId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'PauseRecordingError',
        message: 'Failed to pause recording',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

/**
 * Resume bot recording
 */
router.post(
  '/resume/:botId',
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

      await recallAIService.resumeRecording(botId);

      const response: ApiResponse<any> = {
        success: true,
        data: {
          botId,
          action: 'resume_recording',
          message: 'Recording resumed successfully',
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to resume recording', {
        botId: req.params.botId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'ResumeRecordingError',
        message: 'Failed to resume recording',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

/**
 * Start bot recording
 */
router.post(
  '/start/:botId',
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

      await recallAIService.startRecording(botId);

      const response: ApiResponse<any> = {
        success: true,
        data: {
          botId,
          action: 'start_recording',
          message: 'Recording started successfully',
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to start recording', {
        botId: req.params.botId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'StartRecordingError',
        message: 'Failed to start recording',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

/**
 * Stop bot recording
 */
router.post(
  '/stop/:botId',
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

      await recallAIService.stopRecording(botId);

      const response: ApiResponse<any> = {
        success: true,
        data: {
          botId,
          action: 'stop_recording',
          message: 'Recording stopped successfully',
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to stop recording', {
        botId: req.params.botId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'StopRecordingError',
        message: 'Failed to stop recording',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

/**
 * Get recording status
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

      const recordingStatus = await recallAIService.getRecordingStatus(botId);

      const response: ApiResponse<any> = {
        success: true,
        data: recordingStatus,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to get recording status', {
        botId: req.params.botId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'RecordingStatusError',
        message: 'Failed to get recording status',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }),
);

export default router;
