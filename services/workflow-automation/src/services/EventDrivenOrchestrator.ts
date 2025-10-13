import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import {
    CoordinationContext,
    IntegrationAction,
    IntegrationServiceCoordinator,
} from './IntegrationServiceCoordinator';
import { TriggerResult, WorkflowTriggerSystem } from './WorkflowTriggerSystem';
// Note: Event types would be imported from event-sourcing service
// For now, we'll define them locally
interface Event {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventData: Record<string, any>;
  eventVersion: number;
  timestamp: Date;
  userId: string;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, any>;
}

enum QylonEventTypes {
  ACTION_ITEM_CREATED = 'action_item.created',
  MEETING_ENDED = 'meeting.ended',
  CLIENT_CREATED = 'client.created',
  USER_CREATED = 'user.created',
}

export interface OrchestrationContext {
  eventId: string;
  eventType: string;
  aggregateId: string;
  userId: string;
  clientId: string;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, any>;
}

export interface OrchestrationResult {
  success: boolean;
  eventId: string;
  workflowsTriggered: number;
  workflowsCompleted: number;
  workflowsFailed: number;
  integrationActionsExecuted: number;
  integrationActionsSuccessful: number;
  integrationActionsFailed: number;
  totalDuration: number;
  errors?: string[];
  results: {
    workflowResults: TriggerResult[];
    integrationResults: any[];
  };
}

export interface EventProcessingMetrics {
  totalEventsProcessed: number;
  eventsProcessedToday: number;
  averageProcessingTime: number;
  successRate: number;
  errorRate: number;
  lastProcessedAt?: Date;
}

export class EventDrivenOrchestrator {
  private supabase;
  private workflowTriggerSystem: WorkflowTriggerSystem;
  private integrationCoordinator: IntegrationServiceCoordinator;
  private processingQueue: Map<string, Promise<OrchestrationResult>> = new Map();
  private metrics: EventProcessingMetrics = {
    totalEventsProcessed: 0,
    eventsProcessedToday: 0,
    averageProcessingTime: 0,
    successRate: 0,
    errorRate: 0,
    lastProcessedAt: undefined,
  };

  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    this.workflowTriggerSystem = new WorkflowTriggerSystem();
    this.integrationCoordinator = new IntegrationServiceCoordinator();
  }

  /**
   * Process an event through the complete orchestration pipeline
   */
  async processEvent(event: Event): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const context: OrchestrationContext = {
      eventId: event.id,
      eventType: event.eventType,
      aggregateId: event.aggregateId,
      userId: event.userId,
      clientId: event.userId, // Assuming userId maps to clientId for now
      correlationId: event.correlationId,
      causationId: event.causationId,
      metadata: event.metadata,
    };

    try {
      logger.info('Starting event-driven orchestration', {
        eventId: event.id,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        userId: event.userId,
      });

      // Check if event is already being processed
      if (this.processingQueue.has(event.id)) {
        logger.warn('Event already being processed', { eventId: event.id });
        return await this.processingQueue.get(event.id)!;
      }

      // Create processing promise
      const processingPromise = this.executeOrchestrationPipeline(event, context);
      this.processingQueue.set(event.id, processingPromise);

      try {
        const result = await processingPromise;
        const totalDuration = Date.now() - startTime;

        // Update metrics
        this.updateMetrics(result, totalDuration);

        logger.info('Event-driven orchestration completed', {
          eventId: event.id,
          eventType: event.eventType,
          totalDuration,
          workflowsTriggered: result.workflowsTriggered,
          integrationActionsExecuted: result.integrationActionsExecuted,
        });

        return {
          ...result,
          totalDuration,
        };
      } finally {
        // Clean up processing queue
        this.processingQueue.delete(event.id);
      }
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error('Event-driven orchestration failed', {
        eventId: event.id,
        eventType: event.eventType,
        error: errorMessage,
        totalDuration,
      });

      // Update error metrics
      this.updateErrorMetrics(totalDuration);

      return {
        success: false,
        eventId: event.id,
        workflowsTriggered: 0,
        workflowsCompleted: 0,
        workflowsFailed: 0,
        integrationActionsExecuted: 0,
        integrationActionsSuccessful: 0,
        integrationActionsFailed: 0,
        totalDuration,
        errors: [errorMessage],
        results: {
          workflowResults: [],
          integrationResults: [],
        },
      };
    }
  }

  /**
   * Execute the complete orchestration pipeline
   */
  private async executeOrchestrationPipeline(
    event: Event,
    context: OrchestrationContext,
  ): Promise<OrchestrationResult> {
    const result: OrchestrationResult = {
      success: true,
      eventId: event.id,
      workflowsTriggered: 0,
      workflowsCompleted: 0,
      workflowsFailed: 0,
      integrationActionsExecuted: 0,
      integrationActionsSuccessful: 0,
      integrationActionsFailed: 0,
      totalDuration: 0,
      results: {
        workflowResults: [],
        integrationResults: [],
      },
    };

    try {
      // Step 1: Trigger workflows based on event
      logger.info('Step 1: Triggering workflows', { eventId: event.id });
      const workflowResults = await this.workflowTriggerSystem.processEvent(event);
      result.workflowsTriggered = workflowResults.length;
      result.workflowsCompleted = workflowResults.filter(r => r.success).length;
      result.workflowsFailed = workflowResults.filter(r => !r.success).length;
      result.results.workflowResults = workflowResults;

      // Step 2: Execute integration actions based on event and workflow results
      logger.info('Step 2: Executing integration actions', { eventId: event.id });
      const integrationActions = await this.generateIntegrationActions(event, workflowResults);

      if (integrationActions.length > 0) {
        const coordinationContext: CoordinationContext = {
          workflowId: 'event-driven',
          executionId: event.id,
          clientId: context.clientId,
          userId: context.userId,
          correlationId: context.correlationId,
          causationId: context.causationId,
        };

        const integrationResults = await this.integrationCoordinator.coordinateIntegrationActions(
          integrationActions,
          coordinationContext,
        );

        result.integrationActionsExecuted = integrationResults.length;
        result.integrationActionsSuccessful = integrationResults.filter(r => r.success).length;
        result.integrationActionsFailed = integrationResults.filter(r => !r.success).length;
        result.results.integrationResults = integrationResults;
      }

      // Step 3: Update event processing status
      await this.updateEventProcessingStatus(event.id, 'completed');

      // Determine overall success - successful if no integration actions failed
      result.success = result.integrationActionsFailed === 0;

      return result;
    } catch (error) {
      logger.error('Orchestration pipeline failed', {
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Update event processing status to failed
      await this.updateEventProcessingStatus(
        event.id,
        'failed',
        error instanceof Error ? error.message : 'Unknown error',
      );

      result.success = false;
      result.errors = [error instanceof Error ? error.message : 'Unknown error'];
      return result;
    }
  }

  /**
   * Generate integration actions based on event and workflow results
   */
  private async generateIntegrationActions(
    event: Event,
    workflowResults: TriggerResult[],
  ): Promise<IntegrationAction[]> {
    const actions: IntegrationAction[] = [];

    try {
      // Generate actions based on event type
      switch (event.eventType) {
        case QylonEventTypes.ACTION_ITEM_CREATED:
          actions.push(...(await this.generateActionItemIntegrationActions(event)));
          break;
        case QylonEventTypes.MEETING_ENDED:
          actions.push(...(await this.generateMeetingEndIntegrationActions(event)));
          break;
        case QylonEventTypes.CLIENT_CREATED:
          actions.push(...(await this.generateClientCreationIntegrationActions(event)));
          break;
        case QylonEventTypes.USER_CREATED:
          actions.push(...(await this.generateUserCreationIntegrationActions(event)));
          break;
        default:
          logger.debug('No specific integration actions for event type', {
            eventType: event.eventType,
            eventId: event.id,
          });
      }

      // Generate actions based on workflow results
      for (const workflowResult of workflowResults) {
        if (workflowResult.success) {
          const workflowActions = await this.generateWorkflowBasedIntegrationActions(
            workflowResult,
            event,
          );
          actions.push(...workflowActions);
        }
      }

      logger.info('Generated integration actions', {
        eventId: event.id,
        eventType: event.eventType,
        actionCount: actions.length,
      });

      return actions;
    } catch (error) {
      logger.error('Failed to generate integration actions', {
        eventId: event.id,
        eventType: event.eventType,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  /**
   * Generate integration actions for action item creation
   */
  private async generateActionItemIntegrationActions(event: Event): Promise<IntegrationAction[]> {
    const actions: IntegrationAction[] = [];
    const actionItem = event.eventData;

    try {
      // Create task in project management system
      if (actionItem.projectManagementIntegration) {
        actions.push({
          id: `create-task-${event.id}`,
          type: 'create_contact', // This would be 'create_task' in a real implementation
          integrationType: actionItem.projectManagementIntegration as any,
          config: {
            projectId: actionItem.projectId,
            assigneeId: actionItem.assigneeId,
            dueDate: actionItem.dueDate,
          },
          data: {
            title: actionItem.title,
            description: actionItem.description,
            priority: actionItem.priority,
            tags: actionItem.tags,
          },
        });
      }

      // Create contact in CRM if action item involves external contact
      if (actionItem.contactInfo && actionItem.crmIntegration) {
        actions.push({
          id: `create-contact-${event.id}`,
          type: 'create_contact',
          integrationType: actionItem.crmIntegration as any,
          config: {},
          data: {
            email: actionItem.contactInfo.email,
            firstName: actionItem.contactInfo.firstName,
            lastName: actionItem.contactInfo.lastName,
            company: actionItem.contactInfo.company,
            phone: actionItem.contactInfo.phone,
          },
        });
      }

      return actions;
    } catch (error) {
      logger.error('Failed to generate action item integration actions', {
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  /**
   * Generate integration actions for meeting end
   */
  private async generateMeetingEndIntegrationActions(event: Event): Promise<IntegrationAction[]> {
    const actions: IntegrationAction[] = [];
    const meeting = event.eventData;

    try {
      // Sync meeting data to calendar system
      if (meeting.calendarIntegration) {
        actions.push({
          id: `sync-meeting-${event.id}`,
          type: 'sync_data',
          integrationType: meeting.calendarIntegration as any,
          config: {},
          data: {
            meetingId: meeting.id,
            title: meeting.title,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
            participants: meeting.participants,
            transcript: meeting.transcript,
            actionItems: meeting.actionItems,
          },
        });
      }

      // Send meeting summary via notification
      if (meeting.notificationIntegration) {
        actions.push({
          id: `send-meeting-summary-${event.id}`,
          type: 'send_notification',
          integrationType: meeting.notificationIntegration as any,
          config: {},
          data: {
            recipients: meeting.participants,
            subject: `Meeting Summary: ${meeting.title}`,
            content: meeting.summary,
            attachments: meeting.attachments,
          },
        });
      }

      return actions;
    } catch (error) {
      logger.error('Failed to generate meeting end integration actions', {
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  /**
   * Generate integration actions for client creation
   */
  private async generateClientCreationIntegrationActions(
    event: Event,
  ): Promise<IntegrationAction[]> {
    const actions: IntegrationAction[] = [];
    const client = event.eventData;

    try {
      // Create client in CRM
      if (client.crmIntegration) {
        actions.push({
          id: `create-client-${event.id}`,
          type: 'create_contact',
          integrationType: client.crmIntegration as any,
          config: {},
          data: {
            email: client.email,
            firstName: client.name,
            company: client.company,
            phone: client.phone,
            customFields: {
              clientType: 'enterprise',
              source: 'qylon',
              onboardingDate: new Date().toISOString(),
            },
          },
        });
      }

      return actions;
    } catch (error) {
      logger.error('Failed to generate client creation integration actions', {
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  /**
   * Generate integration actions for user creation
   */
  private async generateUserCreationIntegrationActions(event: Event): Promise<IntegrationAction[]> {
    const actions: IntegrationAction[] = [];
    const user = event.eventData;

    try {
      // Send welcome notification
      if (user.notificationIntegration) {
        actions.push({
          id: `send-welcome-${event.id}`,
          type: 'send_notification',
          integrationType: user.notificationIntegration as any,
          config: {},
          data: {
            recipients: [user.email],
            subject: 'Welcome to Qylon!',
            content: `Welcome ${user.firstName}! Your account has been created successfully.`,
            template: 'welcome',
          },
        });
      }

      return actions;
    } catch (error) {
      logger.error('Failed to generate user creation integration actions', {
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  /**
   * Generate integration actions based on workflow results
   */
  private async generateWorkflowBasedIntegrationActions(
    workflowResult: TriggerResult,
    event: Event,
  ): Promise<IntegrationAction[]> {
    const actions: IntegrationAction[] = [];

    try {
      // This would typically involve querying the workflow execution
      // to understand what integration actions were defined in the workflow
      // For now, we'll return empty array as this is workflow-specific logic

      logger.debug('Generating workflow-based integration actions', {
        workflowId: workflowResult.workflowId,
        executionId: workflowResult.executionId,
        eventId: event.id,
      });

      return actions;
    } catch (error) {
      logger.error('Failed to generate workflow-based integration actions', {
        workflowId: workflowResult.workflowId,
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  /**
   * Update event processing status
   */
  private async updateEventProcessingStatus(
    eventId: string,
    status: 'processing' | 'completed' | 'failed',
    error?: string,
  ): Promise<void> {
    try {
      const { error: dbError } = await this.supabase.from('event_processing_status').upsert({
        event_id: eventId,
        status,
        error,
        updated_at: new Date().toISOString(),
      });

      if (dbError) {
        logger.error('Failed to update event processing status', {
          eventId,
          status,
          error: dbError.message,
        });
      }
    } catch (error) {
      logger.error('Failed to update event processing status', {
        eventId,
        status,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update processing metrics
   */
  private updateMetrics(result: OrchestrationResult, duration: number): void {
    this.metrics.totalEventsProcessed++;
    this.metrics.eventsProcessedToday++;
    this.metrics.lastProcessedAt = new Date();
    this.metrics.averageProcessingTime =
      (this.metrics.averageProcessingTime * (this.metrics.totalEventsProcessed - 1) + duration) /
      this.metrics.totalEventsProcessed;

    if (result.success) {
      this.metrics.successRate =
        (this.metrics.successRate * (this.metrics.totalEventsProcessed - 1) + 1) /
        this.metrics.totalEventsProcessed;
    } else {
      this.metrics.errorRate =
        (this.metrics.errorRate * (this.metrics.totalEventsProcessed - 1) + 1) /
        this.metrics.totalEventsProcessed;
    }
  }

  /**
   * Update error metrics
   */
  private updateErrorMetrics(duration: number): void {
    this.metrics.totalEventsProcessed++;
    this.metrics.eventsProcessedToday++;
    this.metrics.averageProcessingTime =
      (this.metrics.averageProcessingTime * (this.metrics.totalEventsProcessed - 1) + duration) /
      this.metrics.totalEventsProcessed;

    this.metrics.errorRate =
      (this.metrics.errorRate * (this.metrics.totalEventsProcessed - 1) + 1) /
      this.metrics.totalEventsProcessed;

    this.metrics.lastProcessedAt = new Date();
  }

  /**
   * Get processing metrics
   */
  public getMetrics(): EventProcessingMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset daily metrics
   */
  public resetDailyMetrics(): void {
    this.metrics.eventsProcessedToday = 0;
    logger.info('Daily metrics reset');
  }

  /**
   * Get events currently being processed
   */
  public getProcessingQueue(): string[] {
    return Array.from(this.processingQueue.keys());
  }

  /**
   * Health check for orchestrator
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const triggerSystemHealthy = await this.workflowTriggerSystem.healthCheck();
      const coordinatorHealthy = await this.integrationCoordinator.healthCheck();

      return triggerSystemHealthy && coordinatorHealthy;
    } catch (error) {
      logger.error('Event-driven orchestrator health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Shutdown orchestrator gracefully
   */
  public async shutdown(): Promise<void> {
    logger.info('Shutting down event-driven orchestrator');

    // Wait for all processing to complete
    const processingPromises = Array.from(this.processingQueue.values());
    if (processingPromises.length > 0) {
      logger.info(`Waiting for ${processingPromises.length} events to finish processing`);
      await Promise.allSettled(processingPromises);
    }

    // Clear caches
    this.workflowTriggerSystem.clearCache();
    this.integrationCoordinator.clearCache();

    logger.info('Event-driven orchestrator shutdown complete');
  }
}
