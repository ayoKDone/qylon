export interface SagaStep {
  id: string;
  name: string;
  action: string;
  compensation?: string;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  status: SagaStepStatus;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  result?: any;
  dependsOn?: string[];
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  backoffMultiplier: number;
}

export enum SagaStepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  COMPENSATED = 'compensated',
}

export interface Saga {
  id: string;
  name: string;
  status: SagaStatus;
  steps: SagaStep[];
  currentStepIndex: number;
  correlationId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
}

export enum SagaStatus {
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  COMPENSATING = 'compensating',
  COMPENSATED = 'compensated',
}

export interface SagaDefinition {
  name: string;
  steps: SagaStepDefinition[];
  compensationStrategy: CompensationStrategy;
}

export interface SagaStepDefinition {
  name: string;
  action: string;
  compensation?: string;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  dependsOn?: string[];
}

export enum CompensationStrategy {
  FORWARD_RECOVERY = 'forward_recovery',
  BACKWARD_RECOVERY = 'backward_recovery',
  MIXED_RECOVERY = 'mixed_recovery',
}

export interface SagaManager {
  startSaga(
    definition: SagaDefinition,
    correlationId: string,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<Saga>;
  executeStep(sagaId: string, stepId: string): Promise<void>;
  compensateSaga(sagaId: string): Promise<void>;
  getSaga(sagaId: string): Promise<Saga | null>;
  getSagasByCorrelationId(correlationId: string): Promise<Saga[]>;
  getSagasByStatus(status: SagaStatus): Promise<Saga[]>;
}

// Predefined saga definitions for Qylon
export const QYLON_SAGA_DEFINITIONS: Record<string, SagaDefinition> = {
  CLIENT_ONBOARDING: {
    name: 'Client Onboarding',
    compensationStrategy: CompensationStrategy.BACKWARD_RECOVERY,
    steps: [
      {
        name: 'Create Client Record',
        action: 'client.create',
        compensation: 'client.delete',
        timeout: 30000,
        retryPolicy: { maxRetries: 3, backoffMs: 1000, backoffMultiplier: 2 },
      },
      {
        name: 'Setup User Accounts',
        action: 'user.bulk_create',
        compensation: 'user.bulk_delete',
        timeout: 60000,
        retryPolicy: { maxRetries: 3, backoffMs: 2000, backoffMultiplier: 2 },
        dependsOn: ['Create Client Record'],
      },
      {
        name: 'Configure Integrations',
        action: 'integration.setup_defaults',
        compensation: 'integration.remove_defaults',
        timeout: 120000,
        retryPolicy: { maxRetries: 2, backoffMs: 5000, backoffMultiplier: 2 },
        dependsOn: ['Setup User Accounts'],
      },
      {
        name: 'Send Welcome Notifications',
        action: 'notification.send_welcome',
        timeout: 30000,
        retryPolicy: { maxRetries: 2, backoffMs: 1000, backoffMultiplier: 2 },
        dependsOn: ['Configure Integrations'],
      },
    ],
  },

  MEETING_PROCESSING: {
    name: 'Meeting Processing',
    compensationStrategy: CompensationStrategy.FORWARD_RECOVERY,
    steps: [
      {
        name: 'Transcribe Audio',
        action: 'meeting.transcribe',
        timeout: 300000, // 5 minutes
        retryPolicy: { maxRetries: 2, backoffMs: 10000, backoffMultiplier: 2 },
      },
      {
        name: 'Extract Action Items',
        action: 'meeting.extract_action_items',
        timeout: 120000, // 2 minutes
        retryPolicy: { maxRetries: 3, backoffMs: 5000, backoffMultiplier: 2 },
        dependsOn: ['Transcribe Audio'],
      },
      {
        name: 'Generate Summary',
        action: 'meeting.generate_summary',
        timeout: 180000, // 3 minutes
        retryPolicy: { maxRetries: 2, backoffMs: 10000, backoffMultiplier: 2 },
        dependsOn: ['Extract Action Items'],
      },
      {
        name: 'Update Analytics',
        action: 'analytics.update_meeting_metrics',
        timeout: 60000,
        retryPolicy: { maxRetries: 3, backoffMs: 2000, backoffMultiplier: 2 },
        dependsOn: ['Generate Summary'],
      },
    ],
  },

  CONTENT_PUBLISHING: {
    name: 'Content Publishing',
    compensationStrategy: CompensationStrategy.BACKWARD_RECOVERY,
    steps: [
      {
        name: 'Validate Content',
        action: 'content.validate',
        timeout: 30000,
        retryPolicy: { maxRetries: 2, backoffMs: 1000, backoffMultiplier: 2 },
      },
      {
        name: 'Generate SEO Metadata',
        action: 'content.generate_seo',
        timeout: 60000,
        retryPolicy: { maxRetries: 2, backoffMs: 2000, backoffMultiplier: 2 },
        dependsOn: ['Validate Content'],
      },
      {
        name: 'Publish to CMS',
        action: 'content.publish_to_cms',
        compensation: 'content.unpublish_from_cms',
        timeout: 120000,
        retryPolicy: { maxRetries: 3, backoffMs: 5000, backoffMultiplier: 2 },
        dependsOn: ['Generate SEO Metadata'],
      },
      {
        name: 'Notify Stakeholders',
        action: 'notification.notify_published',
        timeout: 30000,
        retryPolicy: { maxRetries: 2, backoffMs: 1000, backoffMultiplier: 2 },
        dependsOn: ['Publish to CMS'],
      },
    ],
  },
};
