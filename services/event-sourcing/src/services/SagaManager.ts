import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import {
  SagaManager as ISagaManager,
  Saga,
  SagaDefinition,
  SagaStatus,
  SagaStep,
  SagaStepStatus,
} from '../models/Saga';

export class SupabaseSagaManager implements ISagaManager {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async startSaga(
    definition: SagaDefinition,
    correlationId: string,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<Saga> {
    try {
      const sagaId = uuidv4();
      const steps: SagaStep[] = definition.steps.map(stepDef => ({
        id: uuidv4(),
        name: stepDef.name,
        action: stepDef.action,
        compensation: stepDef.compensation,
        timeout: stepDef.timeout,
        retryPolicy: stepDef.retryPolicy,
        status: SagaStepStatus.PENDING,
      }));

      const saga: Saga = {
        id: sagaId,
        name: definition.name,
        status: SagaStatus.RUNNING,
        steps,
        currentStepIndex: 0,
        correlationId,
        userId,
        startedAt: new Date(),
        metadata,
      };

      const sagaRecord = {
        id: saga.id,
        name: saga.name,
        status: saga.status,
        steps: JSON.stringify(saga.steps),
        current_step_index: saga.currentStepIndex,
        correlation_id: saga.correlationId,
        user_id: saga.userId,
        started_at: saga.startedAt.toISOString(),
        metadata: saga.metadata,
      };

      const { error } = await this.supabase.from('sagas').insert(sagaRecord);

      if (error) {
        logger.error('Failed to start saga', {
          sagaId,
          name: definition.name,
          correlationId,
          error: error.message,
        });
        throw new Error(`Failed to start saga: ${error.message}`);
      }

      logger.info('Saga started successfully', {
        sagaId,
        name: definition.name,
        correlationId,
        userId,
        stepCount: steps.length,
      });

      // Start executing the first step
      if (steps.length > 0) {
        await this.executeStep(sagaId, steps[0].id);
      }

      return saga;
    } catch (error) {
      logger.error('Start saga error', {
        correlationId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async executeStep(sagaId: string, stepId: string): Promise<void> {
    try {
      const saga = await this.getSaga(sagaId);
      if (!saga) {
        throw new Error(`Saga not found: ${sagaId}`);
      }

      const step = saga.steps.find(s => s.id === stepId);
      if (!step) {
        throw new Error(`Step not found: ${stepId}`);
      }

      if (step.status !== SagaStepStatus.PENDING) {
        logger.warn('Step already executed or in progress', {
          sagaId,
          stepId,
          status: step.status,
        });
        return;
      }

      // Check dependencies
      if (step.dependsOn) {
        const dependencies = saga.steps.filter(s =>
          step.dependsOn!.includes(s.name)
        );
        const incompleteDependencies = dependencies.filter(
          d => d.status !== SagaStepStatus.COMPLETED
        );

        if (incompleteDependencies.length > 0) {
          logger.warn('Step dependencies not met', {
            sagaId,
            stepId,
            incompleteDependencies: incompleteDependencies.map(d => d.name),
          });
          return;
        }
      }

      // Update step status to running
      step.status = SagaStepStatus.RUNNING;
      step.startedAt = new Date();
      await this.updateSaga(saga);

      logger.info('Executing saga step', {
        sagaId,
        stepId,
        stepName: step.name,
        action: step.action,
      });

      // Execute the step action
      try {
        const result = await this.executeAction(step.action, saga);
        step.status = SagaStepStatus.COMPLETED;
        step.completedAt = new Date();
        step.result = result;

        // Move to next step
        saga.currentStepIndex++;
        if (saga.currentStepIndex >= saga.steps.length) {
          saga.status = SagaStatus.COMPLETED;
          saga.completedAt = new Date();
        }

        await this.updateSaga(saga);

        logger.info('Saga step completed successfully', {
          sagaId,
          stepId,
          stepName: step.name,
        });

        // Execute next step if available
        if (saga.currentStepIndex < saga.steps.length) {
          const nextStep = saga.steps[saga.currentStepIndex];
          await this.executeStep(sagaId, nextStep.id);
        }
      } catch (error) {
        step.status = SagaStepStatus.FAILED;
        step.failedAt = new Date();
        step.error = error instanceof Error ? error.message : 'Unknown error';

        logger.error('Saga step failed', {
          sagaId,
          stepId,
          stepName: step.name,
          error: step.error,
        });

        // Handle step failure based on compensation strategy
        await this.handleStepFailure(saga, step);
      }
    } catch (error) {
      logger.error('Execute step error', {
        sagaId,
        stepId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async compensateSaga(sagaId: string): Promise<void> {
    try {
      const saga = await this.getSaga(sagaId);
      if (!saga) {
        throw new Error(`Saga not found: ${sagaId}`);
      }

      saga.status = SagaStatus.COMPENSATING;
      await this.updateSaga(saga);

      logger.info('Starting saga compensation', {
        sagaId,
        name: saga.name,
      });

      // Execute compensation steps in reverse order
      const completedSteps = saga.steps
        .filter(step => step.status === SagaStepStatus.COMPLETED)
        .reverse();

      for (const step of completedSteps) {
        if (step.compensation) {
          try {
            await this.executeAction(step.compensation, saga);
            step.status = SagaStepStatus.COMPENSATED;

            logger.info('Step compensation completed', {
              sagaId,
              stepId: step.id,
              stepName: step.name,
            });
          } catch (error) {
            logger.error('Step compensation failed', {
              sagaId,
              stepId: step.id,
              stepName: step.name,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
            // Continue with other compensations even if one fails
          }
        }
      }

      saga.status = SagaStatus.COMPENSATED;
      await this.updateSaga(saga);

      logger.info('Saga compensation completed', {
        sagaId,
        name: saga.name,
      });
    } catch (error) {
      logger.error('Compensate saga error', {
        sagaId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getSaga(sagaId: string): Promise<Saga | null> {
    try {
      const { data, error } = await this.supabase
        .from('sagas')
        .select('*')
        .eq('id', sagaId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to get saga: ${error.message}`);
      }

      return this.mapToSaga(data);
    } catch (error) {
      logger.error('Get saga error', {
        sagaId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getSagasByCorrelationId(correlationId: string): Promise<Saga[]> {
    try {
      const { data, error } = await this.supabase
        .from('sagas')
        .select('*')
        .eq('correlation_id', correlationId)
        .order('started_at', { ascending: false });

      if (error) {
        throw new Error(
          `Failed to get sagas by correlation ID: ${error.message}`
        );
      }

      return data?.map(this.mapToSaga) || [];
    } catch (error) {
      logger.error('Get sagas by correlation ID error', {
        correlationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getSagasByStatus(status: SagaStatus): Promise<Saga[]> {
    try {
      const { data, error } = await this.supabase
        .from('sagas')
        .select('*')
        .eq('status', status)
        .order('started_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get sagas by status: ${error.message}`);
      }

      return data?.map(this.mapToSaga) || [];
    } catch (error) {
      logger.error('Get sagas by status error', {
        status,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async updateSaga(saga: Saga): Promise<void> {
    const sagaRecord = {
      status: saga.status,
      steps: JSON.stringify(saga.steps),
      current_step_index: saga.currentStepIndex,
      completed_at: saga.completedAt?.toISOString(),
      failed_at: saga.failedAt?.toISOString(),
      error: saga.error,
    };

    const { error } = await this.supabase
      .from('sagas')
      .update(sagaRecord)
      .eq('id', saga.id);

    if (error) {
      throw new Error(`Failed to update saga: ${error.message}`);
    }
  }

  private async executeAction(action: string, saga: Saga): Promise<any> {
    // This would integrate with the actual service actions
    // For now, we'll simulate the action execution
    logger.info('Executing action', { action, sagaId: saga.id });

    // Simulate action execution
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true, action };
  }

  private async handleStepFailure(
    saga: Saga,
    _failedStep: SagaStep
  ): Promise<void> {
    // Determine compensation strategy based on saga definition
    // For now, we'll use backward recovery
    await this.compensateSaga(saga.id);
  }

  private mapToSaga(record: any): Saga {
    return {
      id: record.id,
      name: record.name,
      status: record.status,
      steps: JSON.parse(record.steps),
      currentStepIndex: record.current_step_index,
      correlationId: record.correlation_id,
      userId: record.user_id,
      startedAt: new Date(record.started_at),
      completedAt: record.completed_at
        ? new Date(record.completed_at)
        : undefined,
      failedAt: record.failed_at ? new Date(record.failed_at) : undefined,
      error: record.error,
      metadata: record.metadata,
    };
  }
}
