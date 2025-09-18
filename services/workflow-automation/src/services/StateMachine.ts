import {
    ActionResult,
    ActionType,
    ExecutionContext,
    StateExecution,
    StateMachineError,
    StateType,
    WorkflowAction,
    WorkflowDefinition,
    WorkflowState,
    WorkflowTransition
} from '../types';
import { logger } from '../utils/logger';

export class StateMachine {
  private definition: WorkflowDefinition;
  private currentState: string | null = null;
  private context: ExecutionContext;
  private stateHistory: StateExecution[] = [];
  private actionResults: ActionResult[] = [];

  constructor(definition: WorkflowDefinition, context: ExecutionContext) {
    this.definition = definition;
    this.context = context;
    this.context.state_history = this.stateHistory;
    this.context.action_results = this.actionResults;
  }

  /**
   * Start the state machine execution
   */
  async start(): Promise<void> {
    try {
      const startState = this.definition.states.find(state => state.type === StateType.START);
      if (!startState) {
        throw new StateMachineError('No start state found in workflow definition', 'NO_START_STATE');
      }

      this.currentState = startState.id;
      await this.enterState(startState);

      logger.info('State machine started', {
        workflowId: this.definition.id,
        startState: startState.id
      });

    } catch (error) {
      logger.error('Failed to start state machine', {
        workflowId: this.definition.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Execute the current state
   */
  async executeCurrentState(): Promise<void> {
    if (!this.currentState) {
      throw new StateMachineError('No current state to execute', 'NO_CURRENT_STATE');
    }

    const state = this.getState(this.currentState);
    if (!state) {
      throw new StateMachineError(`State not found: ${this.currentState}`, 'STATE_NOT_FOUND');
    }

    try {
      await this.executeState(state);
    } catch (error) {
      logger.error('State execution failed', {
        workflowId: this.definition.id,
        stateId: this.currentState,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Transition to the next state
   */
  async transition(event?: string): Promise<boolean> {
    if (!this.currentState) {
      throw new StateMachineError('No current state to transition from', 'NO_CURRENT_STATE');
    }

    const transitions = this.getTransitionsFromState(this.currentState);

    for (const transition of transitions) {
      if (await this.evaluateTransition(transition, event)) {
        const nextState = this.getState(transition.to_state);
        if (!nextState) {
          throw new StateMachineError(`Next state not found: ${transition.to_state}`, 'NEXT_STATE_NOT_FOUND');
        }

        await this.exitCurrentState();
        this.currentState = transition.to_state;
        await this.enterState(nextState);

        logger.info('State transition completed', {
          workflowId: this.definition.id,
          fromState: transition.from_state,
          toState: transition.to_state,
          event
        });

        return true;
      }
    }

    return false;
  }

  /**
   * Check if the workflow is complete
   */
  isComplete(): boolean {
    if (!this.currentState) return false;

    const state = this.getState(this.currentState);
    return state?.type === StateType.END;
  }

  /**
   * Get current state
   */
  getCurrentState(): string | null {
    return this.currentState;
  }

  /**
   * Get execution context
   */
  getContext(): ExecutionContext {
    return this.context;
  }

  /**
   * Get state history
   */
  getStateHistory(): StateExecution[] {
    return [...this.stateHistory];
  }

  /**
   * Get action results
   */
  getActionResults(): ActionResult[] {
    return [...this.actionResults];
  }

  /**
   * Enter a state
   */
  private async enterState(state: WorkflowState): Promise<void> {
    const stateExecution: StateExecution = {
      state_id: state.id,
      state_name: state.name,
      entered_at: new Date(),
      status: 'running'
    };

    this.stateHistory.push(stateExecution);

    logger.info('Entered state', {
      workflowId: this.definition.id,
      stateId: state.id,
      stateName: state.name,
      stateType: state.type
    });

    // Execute state-specific logic
    switch (state.type) {
      case StateType.START:
        // Start state - no actions needed
        break;
      case StateType.END:
        // End state - workflow complete
        stateExecution.status = 'completed';
        stateExecution.exited_at = new Date();
        break;
      case StateType.TASK:
        await this.executeTaskState(state);
        break;
      case StateType.DECISION:
        await this.executeDecisionState(state);
        break;
      case StateType.PARALLEL:
        await this.executeParallelState(state);
        break;
      case StateType.WAIT:
        await this.executeWaitState(state);
        break;
      case StateType.SUBWORKFLOW:
        await this.executeSubworkflowState(state);
        break;
    }
  }

  /**
   * Exit current state
   */
  private async exitCurrentState(): Promise<void> {
    if (!this.currentState) return;

    const stateExecution = this.stateHistory.find(se =>
      se.state_id === this.currentState && !se.exited_at
    );

    if (stateExecution) {
      stateExecution.exited_at = new Date();
      stateExecution.status = 'completed';

      logger.info('Exited state', {
        workflowId: this.definition.id,
        stateId: this.currentState
      });
    }
  }

  /**
   * Execute a state
   */
  private async executeState(state: WorkflowState): Promise<void> {
    if (state.actions) {
      for (const action of state.actions) {
        await this.executeAction(action);
      }
    }
  }

  /**
   * Execute an action
   */
  private async executeAction(action: WorkflowAction): Promise<void> {
    const actionResult: ActionResult = {
      action_id: action.id,
      action_name: action.name,
      status: 'running',
      started_at: new Date(),
      retry_count: 0
    };

    this.actionResults.push(actionResult);

    try {
      logger.info('Executing action', {
        workflowId: this.definition.id,
        actionId: action.id,
        actionName: action.name,
        actionType: action.type
      });

      const result = await this.executeActionByType(action);

      actionResult.status = 'completed';
      actionResult.completed_at = new Date();
      actionResult.result = result;

      logger.info('Action completed successfully', {
        workflowId: this.definition.id,
        actionId: action.id,
        result
      });

    } catch (error) {
      actionResult.status = 'failed';
      actionResult.completed_at = new Date();
      actionResult.error = error instanceof Error ? error.message : 'Unknown error';

      logger.error('Action execution failed', {
        workflowId: this.definition.id,
        actionId: action.id,
        error: actionResult.error
      });

      // Handle retry policy
      if (action.retry_policy && actionResult.retry_count < action.retry_policy.max_retries) {
        await this.retryAction(action, actionResult);
      } else {
        throw error;
      }
    }
  }

  /**
   * Execute action by type
   */
  private async executeActionByType(action: WorkflowAction): Promise<any> {
    switch (action.type) {
      case ActionType.HTTP_REQUEST:
        return await this.executeHttpRequest(action);
      case ActionType.DATABASE_QUERY:
        return await this.executeDatabaseQuery(action);
      case ActionType.EMAIL_SEND:
        return await this.executeEmailSend(action);
      case ActionType.SMS_SEND:
        return await this.executeSmsSend(action);
      case ActionType.FILE_UPLOAD:
        return await this.executeFileUpload(action);
      case ActionType.DATA_TRANSFORM:
        return await this.executeDataTransform(action);
      case ActionType.CONDITION_CHECK:
        return await this.executeConditionCheck(action);
      case ActionType.DELAY:
        return await this.executeDelay(action);
      case ActionType.WEBHOOK_CALL:
        return await this.executeWebhookCall(action);
      case ActionType.AI_PROCESS:
        return await this.executeAiProcess(action);
      default:
        throw new StateMachineError(`Unknown action type: ${action.type}`, 'UNKNOWN_ACTION_TYPE');
    }
  }

  /**
   * Execute HTTP request action
   */
  private async executeHttpRequest(action: WorkflowAction): Promise<any> {
    const { url, method, headers, body, timeout } = action.config;

    // Implementation would use axios or fetch
    // This is a placeholder
    return { status: 'success', data: 'HTTP request executed' };
  }

  /**
   * Execute database query action
   */
  private async executeDatabaseQuery(action: WorkflowAction): Promise<any> {
    const { query, parameters } = action.config;

    // Implementation would use Supabase client
    // This is a placeholder
    return { status: 'success', data: 'Database query executed' };
  }

  /**
   * Execute email send action
   */
  private async executeEmailSend(action: WorkflowAction): Promise<any> {
    const { to, subject, body, template } = action.config;

    // Implementation would use email service
    // This is a placeholder
    return { status: 'success', messageId: 'email-sent' };
  }

  /**
   * Execute SMS send action
   */
  private async executeSmsSend(action: WorkflowAction): Promise<any> {
    const { to, message } = action.config;

    // Implementation would use SMS service
    // This is a placeholder
    return { status: 'success', messageId: 'sms-sent' };
  }

  /**
   * Execute file upload action
   */
  private async executeFileUpload(action: WorkflowAction): Promise<any> {
    const { file, destination, options } = action.config;

    // Implementation would use file storage service
    // This is a placeholder
    return { status: 'success', fileUrl: 'file-uploaded' };
  }

  /**
   * Execute data transform action
   */
  private async executeDataTransform(action: WorkflowAction): Promise<any> {
    const { input_data, transform_script } = action.config;

    // Implementation would execute transformation logic
    // This is a placeholder
    return { status: 'success', transformed_data: input_data };
  }

  /**
   * Execute condition check action
   */
  private async executeConditionCheck(action: WorkflowAction): Promise<any> {
    const { condition, data } = action.config;

    // Implementation would evaluate condition
    // This is a placeholder
    return { status: 'success', result: true };
  }

  /**
   * Execute delay action
   */
  private async executeDelay(action: WorkflowAction): Promise<any> {
    const { duration_ms } = action.config;

    await new Promise(resolve => setTimeout(resolve, duration_ms));
    return { status: 'success', delayed_for: duration_ms };
  }

  /**
   * Execute webhook call action
   */
  private async executeWebhookCall(action: WorkflowAction): Promise<any> {
    const { url, method, headers, body } = action.config;

    // Implementation would call webhook
    // This is a placeholder
    return { status: 'success', response: 'webhook-called' };
  }

  /**
   * Execute AI process action
   */
  private async executeAiProcess(action: WorkflowAction): Promise<any> {
    const { process_type, input_data, model } = action.config;

    // Implementation would call AI service
    // This is a placeholder
    return { status: 'success', result: 'ai-processed' };
  }

  /**
   * Retry an action
   */
  private async retryAction(action: WorkflowAction, actionResult: ActionResult): Promise<void> {
    if (!action.retry_policy) return;

    actionResult.retry_count++;
    const delay = Math.min(
      action.retry_policy.backoff_ms * Math.pow(action.retry_policy.backoff_multiplier, actionResult.retry_count - 1),
      action.retry_policy.max_backoff_ms || 30000
    );

    logger.info('Retrying action', {
      workflowId: this.definition.id,
      actionId: action.id,
      retryCount: actionResult.retry_count,
      delay
    });

    await new Promise(resolve => setTimeout(resolve, delay));

    // Reset action result for retry
    actionResult.status = 'running';
    actionResult.started_at = new Date();
    actionResult.completed_at = undefined;
    actionResult.error = undefined;

    await this.executeActionByType(action);
  }

  /**
   * Execute task state
   */
  private async executeTaskState(state: WorkflowState): Promise<void> {
    if (state.actions) {
      for (const action of state.actions) {
        await this.executeAction(action);
      }
    }
  }

  /**
   * Execute decision state
   */
  private async executeDecisionState(state: WorkflowState): Promise<void> {
    if (state.conditions) {
      for (const condition of state.conditions) {
        const result = await this.evaluateCondition(condition);
        if (result) {
          // Condition is true, transition to on_true state
          if (condition.on_true) {
            await this.transitionToState(condition.on_true);
            return;
          }
        } else {
          // Condition is false, transition to on_false state
          if (condition.on_false) {
            await this.transitionToState(condition.on_false);
            return;
          }
        }
      }
    }
  }

  /**
   * Execute parallel state
   */
  private async executeParallelState(state: WorkflowState): Promise<void> {
    if (state.actions) {
      const promises = state.actions.map(action => this.executeAction(action));
      await Promise.all(promises);
    }
  }

  /**
   * Execute wait state
   */
  private async executeWaitState(state: WorkflowState): Promise<void> {
    const waitTime = state.timeout || 1000; // Default 1 second
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  /**
   * Execute subworkflow state
   */
  private async executeSubworkflowState(state: WorkflowState): Promise<void> {
    // Implementation would execute a subworkflow
    // This is a placeholder
    logger.info('Executing subworkflow', {
      workflowId: this.definition.id,
      stateId: state.id
    });
  }

  /**
   * Evaluate a condition
   */
  private async evaluateCondition(condition: any): Promise<boolean> {
    // Implementation would evaluate the condition expression
    // This is a placeholder
    return true;
  }

  /**
   * Transition to a specific state
   */
  private async transitionToState(stateId: string): Promise<void> {
    const state = this.getState(stateId);
    if (!state) {
      throw new StateMachineError(`State not found: ${stateId}`, 'STATE_NOT_FOUND');
    }

    await this.exitCurrentState();
    this.currentState = stateId;
    await this.enterState(state);
  }

  /**
   * Get state by ID
   */
  private getState(stateId: string): WorkflowState | undefined {
    return this.definition.states.find(state => state.id === stateId);
  }

  /**
   * Get transitions from a state
   */
  private getTransitionsFromState(stateId: string): WorkflowTransition[] {
    return this.definition.transitions.filter(transition => transition.from_state === stateId);
  }

  /**
   * Evaluate a transition
   */
  private async evaluateTransition(transition: WorkflowTransition, event?: string): Promise<boolean> {
    // Check if event matches
    if (transition.event && transition.event !== event) {
      return false;
    }

    // Check condition if present
    if (transition.condition) {
      return await this.evaluateCondition({ expression: transition.condition });
    }

    return true;
  }
}
