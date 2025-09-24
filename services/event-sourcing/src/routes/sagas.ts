import { Request, Response, Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { QYLON_SAGA_DEFINITIONS, SagaStatus } from '../models/Saga';
import { SupabaseSagaManager } from '../services/SagaManager';
import { logger } from '../utils/logger';

const router: Router = Router();
const sagaManager = new SupabaseSagaManager();

// Start a new saga
router.post(
  '/start',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { definitionName, correlationId, metadata } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!definitionName || !correlationId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Missing required fields: definitionName, correlationId',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const definition = QYLON_SAGA_DEFINITIONS[definitionName];
      if (!definition) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid saga definition name',
          availableDefinitions: Object.keys(QYLON_SAGA_DEFINITIONS),
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const saga = await sagaManager.startSaga(
        definition,
        correlationId,
        userId,
        metadata
      );

      logger.info('Saga started successfully', {
        sagaId: saga.id,
        name: saga.name,
        correlationId,
        userId,
      });

      res.status(201).json({
        success: true,
        saga: {
          id: saga.id,
          name: saga.name,
          status: saga.status,
          correlationId: saga.correlationId,
          startedAt: saga.startedAt,
          stepCount: saga.steps.length,
          currentStepIndex: saga.currentStepIndex,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Start saga error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  })
);

// Get saga by ID
router.get(
  '/:sagaId',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { sagaId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const saga = await sagaManager.getSaga(sagaId);

      if (!saga) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Saga not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info('Saga retrieved', {
        sagaId,
        name: saga.name,
        status: saga.status,
        userId,
      });

      res.status(200).json({
        success: true,
        saga: {
          id: saga.id,
          name: saga.name,
          status: saga.status,
          steps: saga.steps.map(step => ({
            id: step.id,
            name: step.name,
            status: step.status,
            startedAt: step.startedAt,
            completedAt: step.completedAt,
            failedAt: step.failedAt,
            error: step.error,
          })),
          currentStepIndex: saga.currentStepIndex,
          correlationId: saga.correlationId,
          startedAt: saga.startedAt,
          completedAt: saga.completedAt,
          failedAt: saga.failedAt,
          error: saga.error,
          metadata: saga.metadata,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get saga error', {
        sagaId: req.params.sagaId,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  })
);

// Get sagas by correlation ID
router.get(
  '/correlation/:correlationId',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { correlationId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const sagas = await sagaManager.getSagasByCorrelationId(correlationId);

      logger.info('Sagas retrieved by correlation ID', {
        correlationId,
        count: sagas.length,
        userId,
      });

      res.status(200).json({
        success: true,
        correlationId,
        sagas: sagas.map(saga => ({
          id: saga.id,
          name: saga.name,
          status: saga.status,
          startedAt: saga.startedAt,
          completedAt: saga.completedAt,
          failedAt: saga.failedAt,
          stepCount: saga.steps.length,
          currentStepIndex: saga.currentStepIndex,
        })),
        count: sagas.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get sagas by correlation ID error', {
        correlationId: req.params.correlationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  })
);

// Get sagas by status
router.get(
  '/status/:status',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate status
      if (!Object.values(SagaStatus).includes(status as SagaStatus)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid saga status',
          availableStatuses: Object.values(SagaStatus),
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const sagas = await sagaManager.getSagasByStatus(status as SagaStatus);

      logger.info('Sagas retrieved by status', {
        status,
        count: sagas.length,
        userId,
      });

      res.status(200).json({
        success: true,
        status,
        sagas: sagas.map(saga => ({
          id: saga.id,
          name: saga.name,
          status: saga.status,
          startedAt: saga.startedAt,
          completedAt: saga.completedAt,
          failedAt: saga.failedAt,
          stepCount: saga.steps.length,
          currentStepIndex: saga.currentStepIndex,
          correlationId: saga.correlationId,
        })),
        count: sagas.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get sagas by status error', {
        status: req.params.status,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  })
);

// Execute a specific saga step
router.post(
  '/:sagaId/steps/:stepId/execute',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { sagaId, stepId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await sagaManager.executeStep(sagaId, stepId);

      logger.info('Saga step execution initiated', {
        sagaId,
        stepId,
        userId,
      });

      res.status(200).json({
        success: true,
        message: 'Saga step execution initiated',
        sagaId,
        stepId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Execute saga step error', {
        sagaId: req.params.sagaId,
        stepId: req.params.stepId,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  })
);

// Compensate a saga
router.post(
  '/:sagaId/compensate',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { sagaId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await sagaManager.compensateSaga(sagaId);

      logger.info('Saga compensation initiated', {
        sagaId,
        userId,
      });

      res.status(200).json({
        success: true,
        message: 'Saga compensation initiated',
        sagaId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Compensate saga error', {
        sagaId: req.params.sagaId,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  })
);

// Get available saga definitions
router.get(
  '/definitions',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID not found',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const definitions = Object.keys(QYLON_SAGA_DEFINITIONS).map(name => ({
        name,
        displayName: QYLON_SAGA_DEFINITIONS[name].name,
        stepCount: QYLON_SAGA_DEFINITIONS[name].steps.length,
        compensationStrategy: QYLON_SAGA_DEFINITIONS[name].compensationStrategy,
      }));

      res.status(200).json({
        success: true,
        definitions,
        count: definitions.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get saga definitions error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.id,
      });
      throw error;
    }
  })
);

export default router;
