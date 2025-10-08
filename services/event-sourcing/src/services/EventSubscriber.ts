import axios, { AxiosInstance } from 'axios';
import { Event } from '../models/Event';
import { logger } from '../utils/logger';
import { EventProcessingMonitor } from './EventProcessingMonitor';

interface WorkflowTrigger {
  id: string;
  name: string;
  eventType: string;
  aggregateType: string;
  workflowId: string;
  clientId: string;
  isActive: boolean;
  conditions?: WorkflowCondition[];
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export class EventSubscriber {
  private workflowTriggers: Map<string, WorkflowTrigger[]> = new Map();
  private workflowAutomationClient: AxiosInstance;
  private monitor: EventProcessingMonitor;
  private isProcessing: boolean = false;

  constructor() {
    this.monitor = new EventProcessingMonitor();

    this.workflowAutomationClient = axios.create({
      baseURL: process.env.WORKFLOW_AUTOMATION_URL || 'http://localhost:3005',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.INTER_SERVICE_TOKEN}`,
        'User-Agent': 'Qylon-EventSourcing/1.0.0',
      },
    });

    // Add request interceptor for logging
    this.workflowAutomationClient.interceptors.request.use(
      config => {
        logger.debug('Calling Workflow Automation API', {
          url: config.url,
          method: config.method,
          data: config.data,
        });
        return config;
      },
      error => {
        logger.error('Workflow Automation API request error', {
          error: error.message,
        });
        return Promise.reject(error);
      },
    );

    this.workflowAutomationClient.interceptors.response.use(
      response => {
        logger.debug('Workflow Automation API response', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });
        return response;
      },
      error => {
        logger.error('Workflow Automation API response error', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
        });
        return Promise.reject(error);
      },
    );
  }

  /**
   * Initialize the event subscriber
   */
  async initialize(): Promise<void> {
    try {
      await this.loadWorkflowTriggers();
      logger.info('Event subscriber initialized successfully', {
        triggerCount: this.workflowTriggers.size,
      });
    } catch (error: any) {
      logger.error('Failed to initialize event subscriber', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Process an event and trigger matching workflows
   */
  async processEvent(event: Event): Promise<void> {
    const startTime = Date.now();

    try {
      if (this.isProcessing) {
        logger.warn('Event processing already in progress, skipping event', {
          eventId: event.id,
          eventType: event.eventType,
        });
        return;
      }

      this.isProcessing = true;
      this.monitor.recordEventProcessingStart(event.id);

      logger.info('Processing event for workflow triggers', {
        eventId: event.id,
        eventType: event.eventType,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
      });

      // Find matching workflow triggers
      const matchingTriggers = this.findMatchingTriggers(event);

      logger.debug('Trigger lookup debug', {
        eventId: event.id,
        eventType: event.eventType,
        aggregateType: event.aggregateType,
        availableTriggers: Array.from(this.workflowTriggers.keys()),
        matchingTriggersCount: matchingTriggers.length,
      });

      if (matchingTriggers.length === 0) {
        logger.debug('No matching workflow triggers found', {
          eventId: event.id,
          eventType: event.eventType,
        });

        // Record successful processing even with no triggers
        const processingTime = Date.now() - startTime;
        this.monitor.recordEventProcessingSuccess(event, processingTime);
        return;
      }

      logger.info('Found matching workflow triggers', {
        eventId: event.id,
        eventType: event.eventType,
        triggerCount: matchingTriggers.length,
      });

      // Execute matching workflows
      const executionPromises = matchingTriggers.map(trigger =>
        this.executeWorkflow(trigger, event),
      );

      await Promise.allSettled(executionPromises);

      const processingTime = Date.now() - startTime;
      this.monitor.recordEventProcessingSuccess(event, processingTime);

      logger.info('Event processing completed', {
        eventId: event.id,
        eventType: event.eventType,
        processingTimeMs: processingTime,
        triggeredWorkflows: matchingTriggers.length,
      });
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      this.monitor.recordEventProcessingError(event, error, processingTime);

      logger.error('Event processing failed', {
        eventId: event.id,
        eventType: event.eventType,
        error: error.message,
        processingTimeMs: processingTime,
      });
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Load workflow triggers from database or configuration
   */
  private async loadWorkflowTriggers(): Promise<void> {
    try {
      // For now, we'll define some default triggers
      // In a real implementation, these would be loaded from the database
      const defaultTriggers: WorkflowTrigger[] = [
        {
          id: 'trigger_meeting_ended',
          name: 'Meeting Ended Trigger',
          eventType: 'meeting.ended',
          aggregateType: 'meeting',
          workflowId: 'workflow_meeting_followup',
          clientId: 'default',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'trigger_transcription_completed',
          name: 'Transcription Completed Trigger',
          eventType: 'meeting.transcribed',
          aggregateType: 'meeting',
          workflowId: 'workflow_transcription_processing',
          clientId: 'default',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'trigger_meeting_summary',
          name: 'Meeting Summary Trigger',
          eventType: 'meeting.ended',
          aggregateType: 'meeting',
          workflowId: 'workflow_meeting_summary',
          clientId: 'default',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Group triggers by event type for efficient lookup
      this.workflowTriggers.clear();
      for (const trigger of defaultTriggers) {
        if (!this.workflowTriggers.has(trigger.eventType)) {
          this.workflowTriggers.set(trigger.eventType, []);
        }
        this.workflowTriggers.get(trigger.eventType)!.push(trigger);
      }

      logger.info('Workflow triggers loaded', {
        totalTriggers: defaultTriggers.length,
        eventTypes: Array.from(this.workflowTriggers.keys()),
      });
    } catch (error: any) {
      logger.error('Failed to load workflow triggers', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find workflow triggers that match the given event
   */
  private findMatchingTriggers(event: Event): WorkflowTrigger[] {
    const triggers = this.workflowTriggers.get(event.eventType) || [];

    return triggers.filter(trigger => {
      // Check if trigger is active
      if (!trigger.isActive) {
        return false;
      }

      // Check aggregate type match
      if (trigger.aggregateType !== event.aggregateType) {
        return false;
      }

      // Check conditions if any
      if (trigger.conditions && trigger.conditions.length > 0) {
        return this.evaluateConditions(trigger.conditions, event.eventData);
      }

      return true;
    });
  }

  /**
   * Evaluate workflow trigger conditions
   */
  private evaluateConditions(
    conditions: WorkflowCondition[],
    eventData: Record<string, any>,
  ): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getNestedFieldValue(eventData, condition.field);

      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'contains':
          return typeof fieldValue === 'string' && fieldValue.includes(condition.value);
        case 'greater_than':
          return typeof fieldValue === 'number' && fieldValue > condition.value;
        case 'less_than':
          return typeof fieldValue === 'number' && fieldValue < condition.value;
        default:
          return false;
      }
    });
  }

  /**
   * Get nested field value from object using dot notation
   */
  private getNestedFieldValue(obj: Record<string, any>, fieldPath: string): any {
    return fieldPath.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Execute a workflow for a trigger
   */
  private async executeWorkflow(trigger: WorkflowTrigger, event: Event): Promise<void> {
    const startTime = Date.now();

    try {
      this.monitor.recordWorkflowTriggerStart(trigger.id);

      logger.info('Executing workflow', {
        eventId: event.id,
        eventType: event.eventType,
        triggerId: trigger.id,
        triggerName: trigger.name,
        workflowId: trigger.workflowId,
      });

      // Prepare workflow execution request
      const executionRequest = {
        workflowId: trigger.workflowId,
        inputData: {
          event_data: event.eventData,
          aggregate_id: event.aggregateId,
          aggregate_type: event.aggregateType,
          event_type: event.eventType,
          user_id: event.userId,
          correlation_id: event.correlationId,
          causation_id: event.causationId,
          metadata: event.metadata,
        },
        context: {
          client_id: trigger.clientId,
          trigger_id: trigger.id,
          trigger_name: trigger.name,
          event_timestamp: event.timestamp,
        },
        triggeredBy: {
          eventId: event.id,
          eventType: event.eventType,
          aggregateId: event.aggregateId,
        },
      };

      // Call Workflow Automation service
      const response = await this.workflowAutomationClient.post(
        '/api/v1/executions/execute',
        executionRequest,
      );

      const triggerTime = Date.now() - startTime;
      this.monitor.recordWorkflowTriggerSuccess(trigger.id, triggerTime);

      logger.info('Workflow trigger executed successfully', {
        eventId: event.id,
        triggerId: trigger.id,
        workflowId: trigger.workflowId,
        triggerTimeMs: triggerTime,
        executionId: response.data.data?.id,
      });

      logger.info('Workflow execution initiated successfully', {
        eventId: event.id,
        triggerId: trigger.id,
        workflowId: trigger.workflowId,
        triggerTimeMs: triggerTime,
        executionId: response.data.data?.id,
      });
    } catch (error: any) {
      const triggerTime = Date.now() - startTime;
      this.monitor.recordWorkflowTriggerError(trigger.id, error, triggerTime);

      logger.error('Workflow trigger execution failed', {
        eventId: event.id,
        eventType: event.eventType,
        triggerId: trigger.id,
        workflowId: trigger.workflowId,
        triggerTimeMs: triggerTime,
        errorMessage: error.message,
        errorType: error.constructor.name,
      });

      logger.error('Failed to execute workflow', {
        eventId: event.id,
        triggerId: trigger.id,
        workflowId: trigger.workflowId,
        triggerTimeMs: triggerTime,
        error: error.message,
      });

      logger.error('Failed to execute workflow for trigger', {
        eventId: event.id,
        eventType: event.eventType,
        triggerId: trigger.id,
        triggerName: trigger.name,
        workflowId: trigger.workflowId,
        error: error.message,
      });

      // Don't throw error to prevent blocking other triggers
    }
  }

  /**
   * Reload workflow triggers (useful for dynamic configuration)
   */
  async reloadTriggers(): Promise<void> {
    try {
      await this.loadWorkflowTriggers();
      logger.info('Workflow triggers reloaded successfully');
    } catch (error: any) {
      logger.error('Failed to reload workflow triggers', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get event processing metrics
   */
  getEventProcessingMetrics() {
    return this.monitor.getEventProcessingMetrics();
  }

  /**
   * Get workflow trigger metrics
   */
  getWorkflowTriggerMetrics() {
    return this.monitor.getWorkflowTriggerMetrics();
  }

  /**
   * Get system health status
   */
  getSystemHealth() {
    return this.monitor.getSystemHealth();
  }

  /**
   * Reset metrics (useful for testing)
   */
  resetMetrics(): void {
    this.monitor.resetMetrics();
  }
}
