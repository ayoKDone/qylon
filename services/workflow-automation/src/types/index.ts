import { z } from 'zod';

// Workflow Types
export interface Workflow {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  definition: WorkflowDefinition;
  status: WorkflowStatus;
  version: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  triggers: WorkflowTrigger[];
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  variables?: Record<string, any>;
  settings?: WorkflowSettings;
}

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  name: string;
  config: Record<string, any>;
  enabled: boolean;
}

export interface WorkflowState {
  id: string;
  name: string;
  type: StateType;
  actions?: WorkflowAction[];
  conditions?: WorkflowCondition[];
  timeout?: number;
  retry_policy?: RetryPolicy;
  metadata?: Record<string, any>;
}

export interface WorkflowAction {
  id: string;
  type: ActionType;
  name: string;
  config: Record<string, any>;
  timeout?: number;
  retry_policy?: RetryPolicy;
}

export interface WorkflowCondition {
  id: string;
  type: ConditionType;
  expression: string;
  on_true?: string;
  on_false?: string;
}

export interface WorkflowTransition {
  id: string;
  from_state: string;
  to_state: string;
  condition?: string;
  event?: string;
}

export interface WorkflowSettings {
  max_execution_time?: number;
  max_retries?: number;
  timeout_action?: 'fail' | 'continue' | 'retry';
  parallel_execution?: boolean;
  error_handling?: 'stop' | 'continue' | 'retry';
}

export interface RetryPolicy {
  max_retries: number;
  backoff_ms: number;
  backoff_multiplier: number;
  max_backoff_ms?: number;
}

// Workflow Execution Types
export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  client_id: string;
  status: ExecutionStatus;
  current_state?: string;
  context: ExecutionContext;
  started_at: Date;
  completed_at?: Date;
  error?: ExecutionErrorData;
  metadata?: Record<string, any>;
}

export interface ExecutionContext {
  variables: Record<string, any>;
  input_data: Record<string, any>;
  output_data?: Record<string, any>;
  state_history: StateExecution[];
  action_results: ActionResult[];
}

export interface StateExecution {
  state_id: string;
  state_name: string;
  entered_at: Date;
  exited_at?: Date;
  status: 'running' | 'completed' | 'failed' | 'skipped';
  error?: string;
}

export interface ActionResult {
  action_id: string;
  action_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: Date;
  completed_at?: Date;
  result?: any;
  error?: string;
  retry_count: number;
}

export interface ExecutionErrorData {
  type: string;
  message: string;
  state_id?: string;
  action_id?: string;
  timestamp: Date;
  stack?: string;
}

// Enums
export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
}

export enum TriggerType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  WEBHOOK = 'webhook',
  EVENT = 'event',
  API = 'api',
}

export enum StateType {
  START = 'start',
  END = 'end',
  TASK = 'task',
  DECISION = 'decision',
  PARALLEL = 'parallel',
  WAIT = 'wait',
  SUBWORKFLOW = 'subworkflow',
}

export enum ActionType {
  HTTP_REQUEST = 'http_request',
  DATABASE_QUERY = 'database_query',
  EMAIL_SEND = 'email_send',
  SMS_SEND = 'sms_send',
  FILE_UPLOAD = 'file_upload',
  DATA_TRANSFORM = 'data_transform',
  CONDITION_CHECK = 'condition_check',
  DELAY = 'delay',
  WEBHOOK_CALL = 'webhook_call',
  AI_PROCESS = 'ai_process',
}

export enum ConditionType {
  EXPRESSION = 'expression',
  DATA_CHECK = 'data_check',
  TIME_CHECK = 'time_check',
  EXTERNAL_API = 'external_api',
}

// Request/Response Types
export interface CreateWorkflowRequest {
  client_id: string;
  name: string;
  description?: string;
  definition: WorkflowDefinition;
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  definition?: WorkflowDefinition;
  status?: WorkflowStatus;
}

export interface ExecuteWorkflowRequest {
  workflow_id: string;
  input_data: Record<string, any>;
  context?: Record<string, any>;
}

export interface WorkflowExecutionResponse {
  id: string;
  workflow_id: string;
  status: ExecutionStatus;
  current_state?: string;
  started_at: Date;
  estimated_completion?: Date;
}

// Validation Schemas
export const CreateWorkflowSchema = z.object({
  client_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  definition: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    version: z.string(),
    triggers: z.array(
      z.object({
        id: z.string(),
        type: z.nativeEnum(TriggerType),
        name: z.string(),
        config: z.record(z.any()),
        enabled: z.boolean(),
      }),
    ),
    states: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.nativeEnum(StateType),
        actions: z
          .array(
            z.object({
              id: z.string(),
              type: z.nativeEnum(ActionType),
              name: z.string(),
              config: z.record(z.any()),
              timeout: z.number().optional(),
              retry_policy: z
                .object({
                  max_retries: z.number(),
                  backoff_ms: z.number(),
                  backoff_multiplier: z.number(),
                  max_backoff_ms: z.number().optional(),
                })
                .optional(),
            }),
          )
          .optional(),
        conditions: z
          .array(
            z.object({
              id: z.string(),
              type: z.nativeEnum(ConditionType),
              expression: z.string(),
              on_true: z.string().optional(),
              on_false: z.string().optional(),
            }),
          )
          .optional(),
        timeout: z.number().optional(),
        retry_policy: z
          .object({
            max_retries: z.number(),
            backoff_ms: z.number(),
            backoff_multiplier: z.number(),
            max_backoff_ms: z.number().optional(),
          })
          .optional(),
        metadata: z.record(z.any()).optional(),
      }),
    ),
    transitions: z.array(
      z.object({
        id: z.string(),
        from_state: z.string(),
        to_state: z.string(),
        condition: z.string().optional(),
        event: z.string().optional(),
      }),
    ),
    variables: z.record(z.any()).optional(),
    settings: z
      .object({
        max_execution_time: z.number().optional(),
        max_retries: z.number().optional(),
        timeout_action: z.enum(['fail', 'continue', 'retry']).optional(),
        parallel_execution: z.boolean().optional(),
        error_handling: z.enum(['stop', 'continue', 'retry']).optional(),
      })
      .optional(),
  }),
});

export const ExecuteWorkflowSchema = z.object({
  workflow_id: z.string().uuid(),
  input_data: z.record(z.any()),
  context: z.record(z.any()).optional(),
});

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

// Error Types
export class WorkflowError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'WorkflowError';
  }
}

export class ExecutionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'ExecutionError';
  }
}

export class StateMachineError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'StateMachineError';
  }
}
