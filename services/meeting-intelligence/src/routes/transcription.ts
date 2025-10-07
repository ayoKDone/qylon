import { Request, Response, Router } from 'express';
import { requireClientAccess } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { RecallAIService } from '../services/RecallAIService';
import { ApiResponse } from '../types';
import { logger } from '../utils/logger';

const router: Router = Router();
const recallAIService = new RecallAIService();

/**
 * Create async transcript for a recording
 */
router.post(
  '/async/:recordingId',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { recordingId } = req.params;
      const { provider, diarization } = req.body;

      if (!recordingId) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'recordingId is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!provider) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'provider is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const transcript = await recallAIService.createAsyncTranscript(
        recordingId,
        provider,
        diarization
      );

      const response: ApiResponse<any> = {
        success: true,
        data: transcript,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error('Failed to create async transcript', {
        recordingId: req.params.recordingId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'AsyncTranscriptCreateError',
        message: 'Failed to create async transcript',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  })
);

/**
 * Get transcript by ID
 */
router.get(
  '/:transcriptId',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { transcriptId } = req.params;

      if (!transcriptId) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'transcriptId is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const transcript = await recallAIService.getTranscript(transcriptId);

      const response: ApiResponse<any> = {
        success: true,
        data: transcript,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to get transcript', {
        transcriptId: req.params.transcriptId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'TranscriptFetchError',
        message: 'Failed to get transcript',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  })
);

/**
 * Download transcript data
 */
router.get(
  '/:transcriptId/download',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { transcriptId } = req.params;

      if (!transcriptId) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'transcriptId is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // First get the transcript to get the download URL
      const transcript = await recallAIService.getTranscript(transcriptId);

      if (transcript.status.code !== 'done') {
        res.status(400).json({
          success: false,
          error: 'TranscriptNotReadyError',
          message: 'Transcript is not ready for download',
          details: `Current status: ${transcript.status.code}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Download the transcript data
      const transcriptData = await recallAIService.downloadTranscript(
        transcript.data.download_url
      );

      const response: ApiResponse<any> = {
        success: true,
        data: {
          transcriptId,
          status: transcript.status.code,
          data: transcriptData,
          metadata: transcript.metadata,
          provider: transcript.provider,
          diarization: transcript.diarization,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to download transcript', {
        transcriptId: req.params.transcriptId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'TranscriptDownloadError',
        message: 'Failed to download transcript',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  })
);

/**
 * Get separate audios for a recording
 */
router.get(
  '/separate-audio/:recordingId',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { recordingId } = req.params;

      if (!recordingId) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'recordingId is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const separateAudios =
        await recallAIService.getSeparateAudios(recordingId);

      const response: ApiResponse<any> = {
        success: true,
        data: {
          recordingId,
          separateAudios,
          count: separateAudios.length,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to get separate audios', {
        recordingId: req.params.recordingId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'SeparateAudiosFetchError',
        message: 'Failed to get separate audios',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  })
);

/**
 * Get separate audio parts for a recording
 */
router.get(
  '/separate-audio/:recordingId/parts',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { recordingId } = req.params;

      if (!recordingId) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'recordingId is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // First get the separate audios
      const separateAudios =
        await recallAIService.getSeparateAudios(recordingId);

      // Then get the audio parts
      const audioParts = await recallAIService.getSeparateAudioParts({
        results: separateAudios,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: {
          recordingId,
          audioParts,
          count: audioParts.length,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to get separate audio parts', {
        recordingId: req.params.recordingId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'SeparateAudioPartsFetchError',
        message: 'Failed to get separate audio parts',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  })
);

/**
 * Get separate videos for a recording
 */
router.get(
  '/separate-video/:recordingId',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { recordingId } = req.params;

      if (!recordingId) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'recordingId is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const separateVideos =
        await recallAIService.getSeparateVideos(recordingId);

      const response: ApiResponse<any> = {
        success: true,
        data: {
          recordingId,
          separateVideos,
          count: separateVideos.length,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to get separate videos', {
        recordingId: req.params.recordingId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'SeparateVideosFetchError',
        message: 'Failed to get separate videos',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  })
);

/**
 * Get separate video parts for a recording
 */
router.get(
  '/separate-video/:recordingId/parts',
  requireClientAccess,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { recordingId } = req.params;

      if (!recordingId) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'recordingId is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // First get the separate videos
      const separateVideos =
        await recallAIService.getSeparateVideos(recordingId);

      // Then get the video parts
      const videoParts = await recallAIService.getSeparateVideoParts({
        results: separateVideos,
      });

      const response: ApiResponse<any> = {
        success: true,
        data: {
          recordingId,
          videoParts,
          count: videoParts.length,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Failed to get separate video parts', {
        recordingId: req.params.recordingId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'SeparateVideoPartsFetchError',
        message: 'Failed to get separate video parts',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  })
);

export default router;
