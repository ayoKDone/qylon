import { createClient } from '@supabase/supabase-js';
import {
  ExecutionContext,
  ExecutionError,
  ExecutionStatus,
  Workflow,
  WorkflowError,
  WorkflowExecution,
} from '../types';
import { logWorkflow, logger } from '../utils/logger';
import { StateMachine } from './StateMachine';

export class WorkflowEngine {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    inputData: Record<string, any>,
    context?: Record<string, any>
  ): Promise<WorkflowExecution> {
    try {
      logWorkflow('workflow_execution_started', workflowId);

      // Get workflow definition
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow) {
        throw new WorkflowError(
          `Workflow not found: ${workflowId}`,
          'WORKFLOW_NOT_FOUND',
          404
        );
      }

      // Create execution context
      const executionContext: ExecutionContext = {
        variables: { ...context },
        input_data: inputData,
        state_history: [],
        action_results: [],
      };

      // Create workflow execution record
      const execution = await this.createExecution(workflow, executionContext);

      // Execute workflow asynchronously
      this.executeWorkflowAsync(execution.id, workflow, executionContext);

      logWorkflow('workflow_execution_created', workflowId, execution.id);

      return execution;
    } catch (error) {
      logger.error('Workflow execution failed', {
        workflowId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: string): Promise<Workflow | null> {
    try {
      const { data, error } = await this.supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .eq('is_active', true)
        .single();

      if (error) {
        logger.error('Failed to fetch workflow', {
          workflowId,
          error: error.message,
        });
        return null;
      }

      return {
        id: data.id,
        client_id: data.client_id,
        name: data.name,
        description: data.description,
        definition: data.definition,
        status: data.status,
        version: data.version,
        is_active: data.is_active,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };
    } catch (error) {
      logger.error('Workflow fetch error', {
        workflowId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Create workflow execution record
   */
  private async createExecution(
    workflow: Workflow,
    context: ExecutionContext
  ): Promise<WorkflowExecution> {
    try {
      const { data, error } = await this.supabase
        .from('workflow_executions')
        .insert({
          workflow_id: workflow.id,
          client_id: workflow.client_id,
          status: ExecutionStatus.PENDING,
          context: context,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new ExecutionError(
          `Failed to create execution: ${error.message}`,
          'EXECUTION_CREATION_FAILED'
        );
      }

      return {
        id: data.id,
        workflow_id: data.workflow_id,
        client_id: data.client_id,
        status: data.status,
        current_state: data.current_state,
        context: data.context,
        started_at: new Date(data.started_at),
        completed_at: data.completed_at
          ? new Date(data.completed_at)
          : undefined,
        error: data.error,
        metadata: data.metadata,
      };
    } catch (error) {
      logger.error('Execution creation error', {
        workflowId: workflow.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Execute workflow asynchronously
   */
  private async executeWorkflowAsync(
    executionId: string,
    workflow: Workflow,
    context: ExecutionContext
  ): Promise<void> {
    try {
      logWorkflow('workflow_execution_running', workflow.id, executionId);

      // Update execution status to running
      await this.updateExecutionStatus(executionId, ExecutionStatus.RUNNING);

      // Create state machine
      const stateMachine = new StateMachine(workflow.definition, context);

      // Start execution
      await stateMachine.start();

      // Execute until complete
      while (!stateMachine.isComplete()) {
        await stateMachine.executeCurrentState();
        await stateMachine.transition();
      }

      // Update execution status to completed
      await this.updateExecutionStatus(executionId, ExecutionStatus.COMPLETED, {
        completed_at: new Date().toISOString(),
        context: stateMachine.getContext(),
      });

      logWorkflow('workflow_execution_completed', workflow.id, executionId);
    } catch (error) {
      logger.error('Workflow execution failed', {
        executionId,
        workflowId: workflow.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Update execution status to failed
      await this.updateExecutionStatus(executionId, ExecutionStatus.FAILED, {
        error: {
          type: 'ExecutionError',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
          stack: error instanceof Error ? error.stack : undefined,
        },
      });

      logWorkflow('workflow_execution_failed', workflow.id, executionId, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update execution status
   */
  private async updateExecutionStatus(
    executionId: string,
    status: ExecutionStatus,
    updates?: any
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (updates) {
        Object.assign(updateData, updates);
      }

      const { error } = await this.supabase
        .from('workflow_executions')
        .update(updateData)
        .eq('id', executionId);

      if (error) {
        logger.error('Failed to update execution status', {
          executionId,
          status,
          error: error.message,
        });
      }
    } catch (error) {
      logger.error('Execution status update error', {
        executionId,
        status,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get execution by ID
   */
  async getExecution(executionId: string): Promise<WorkflowExecution | null> {
    try {
      const { data, error } = await this.supabase
        .from('workflow_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (error) {
        logger.error('Failed to fetch execution', {
          executionId,
          error: error.message,
        });
        return null;
      }

      return {
        id: data.id,
        workflow_id: data.workflow_id,
        client_id: data.client_id,
        status: data.status,
        current_state: data.current_state,
        context: data.context,
        started_at: new Date(data.started_at),
        completed_at: data.completed_at
          ? new Date(data.completed_at)
          : undefined,
        error: data.error,
        metadata: data.metadata,
      };
    } catch (error) {
      logger.error('Execution fetch error', {
        executionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Get executions for a workflow
   */
  async getExecutions(
    workflowId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ executions: WorkflowExecution[]; total: number }> {
    try {
      const { data, error, count } = await this.supabase
        .from('workflow_executions')
        .select('*', { count: 'exact' })
        .eq('workflow_id', workflowId)
        .order('started_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        logger.error('Failed to fetch executions', {
          workflowId,
          error: error.message,
        });
        return { executions: [], total: 0 };
      }

      const executions =
        data?.map(exec => ({
          id: exec.id,
          workflow_id: exec.workflow_id,
          client_id: exec.client_id,
          status: exec.status,
          current_state: exec.current_state,
          context: exec.context,
          started_at: new Date(exec.started_at),
          completed_at: exec.completed_at
            ? new Date(exec.completed_at)
            : undefined,
          error: exec.error,
          metadata: exec.metadata,
        })) || [];

      return { executions, total: count || 0 };
    } catch (error) {
      logger.error('Executions fetch error', {
        workflowId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { executions: [], total: 0 };
    }
  }

  /**
   * Cancel an execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    try {
      await this.updateExecutionStatus(executionId, ExecutionStatus.CANCELLED);

      logWorkflow('workflow_execution_cancelled', '', executionId);
    } catch (error) {
      logger.error('Execution cancellation error', {
        executionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Health check for workflow engine
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('workflows')
        .select('id')
        .limit(1);

      return !error;
    } catch (error) {
      logger.error('Workflow engine health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }
}
