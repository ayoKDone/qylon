import { createClient } from '@supabase/supabase-js';
import { TriggerType, Workflow } from '../types';
import { logger } from '../utils/logger';
import { WorkflowEngine } from './WorkflowEngine';
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

export interface TriggerContext {
  eventId: string;
  eventType: string;
  aggregateId: string;
  eventData: Record<string, any>;
  userId: string;
  clientId: string;
  correlationId?: string;
  causationId?: string;
}

export interface TriggerResult {
  success: boolean;
  workflowId: string;
  executionId: string;
  triggeredAt: Date;
  error?: string;
}

export class WorkflowTriggerSystem {
  private supabase;
  private workflowEngine: WorkflowEngine;
  private triggerCache: Map<string, Workflow[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.workflowEngine = new WorkflowEngine();
  }

  /**
   * Process an event and trigger matching workflows
   */
  async processEvent(event: Event): Promise<TriggerResult[]> {
    try {
      logger.info('Processing event for workflow triggers', {
        eventId: event.id,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        userId: event.userId,
      });

      // Get workflows that match this event
      const matchingWorkflows = await this.getMatchingWorkflows(event);

      if (matchingWorkflows.length === 0) {
        logger.debug('No matching workflows found for event', {
          eventId: event.id,
          eventType: event.eventType,
        });
        return [];
      }

      const results: TriggerResult[] = [];

      // Trigger each matching workflow
      for (const workflow of matchingWorkflows) {
        try {
          const result = await this.triggerWorkflow(workflow, event);
          results.push(result);
        } catch (error) {
          logger.error('Failed to trigger workflow', {
            workflowId: workflow.id,
            eventId: event.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          results.push({
            success: false,
            workflowId: workflow.id,
            executionId: '',
            triggeredAt: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      logger.info('Event processing completed', {
        eventId: event.id,
        eventType: event.eventType,
        workflowsTriggered: results.length,
        successfulTriggers: results.filter(r => r.success).length,
      });

      return results;
    } catch (error) {
      logger.error('Event processing failed', {
        eventId: event.id,
        eventType: event.eventType,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get workflows that match the given event
   */
  private async getMatchingWorkflows(event: Event): Promise<Workflow[]> {
    try {
      // Check cache first
      const cacheKey = `${event.eventType}:${event.aggregateType}`;
      const cached = this.getCachedWorkflows(cacheKey);
      if (cached) {
        return cached;
      }

      // Query database for matching workflows
      const { data, error } = await this.supabase
        .from('workflows')
        .select(`
          id,
          client_id,
          name,
          description,
          definition,
          status,
          version,
          is_active,
          created_at,
          updated_at
        `)
        .eq('is_active', true)
        .eq('status', 'active');

      if (error) {
        logger.error('Failed to fetch workflows', {
          error: error.message,
          eventType: event.eventType,
        });
        return [];
      }

      const matchingWorkflows: Workflow[] = [];

      for (const workflowData of data || []) {
        const workflow: Workflow = {
          id: workflowData.id,
          client_id: workflowData.client_id,
          name: workflowData.name,
          description: workflowData.description,
          definition: workflowData.definition,
          status: workflowData.status,
          version: workflowData.version,
          is_active: workflowData.is_active,
          created_at: new Date(workflowData.created_at),
          updated_at: new Date(workflowData.updated_at),
        };

        // Check if workflow has matching triggers
        if (this.hasMatchingTrigger(workflow, event)) {
          matchingWorkflows.push(workflow);
        }
      }

      // Cache the results
      this.setCachedWorkflows(cacheKey, matchingWorkflows);

      return matchingWorkflows;
    } catch (error) {
      logger.error('Failed to get matching workflows', {
        eventType: event.eventType,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  /**
   * Check if a workflow has a trigger that matches the event
   */
  private hasMatchingTrigger(workflow: Workflow, event: Event): boolean {
    if (!workflow.definition.triggers) {
      return false;
    }

    return workflow.definition.triggers.some(trigger => {
      if (!trigger.enabled || trigger.type !== TriggerType.EVENT) {
        return false;
      }

      // Check event type match
      const triggerEventType = trigger.config.event_type;
      if (triggerEventType && triggerEventType !== event.eventType) {
        return false;
      }

      // Check aggregate type match
      const triggerAggregateType = trigger.config.aggregate_type;
      if (triggerAggregateType && triggerAggregateType !== event.aggregateType) {
        return false;
      }

      // Check client match
      if (workflow.client_id !== event.userId) {
        return false;
      }

      // Check additional conditions
      if (trigger.config.conditions) {
        return this.evaluateTriggerConditions(trigger.config.conditions, event);
      }

      return true;
    });
  }

  /**
   * Evaluate trigger conditions
   */
  private evaluateTriggerConditions(conditions: any, event: Event): boolean {
    try {
      // Simple condition evaluation - can be extended for complex logic
      for (const condition of conditions) {
        const field = condition.field;
        const operator = condition.operator;
        const value = condition.value;

        const eventValue = this.getNestedValue(event.eventData, field);

        switch (operator) {
          case 'equals':
            if (eventValue !== value) return false;
            break;
          case 'not_equals':
            if (eventValue === value) return false;
            break;
          case 'contains':
            if (!String(eventValue).includes(String(value))) return false;
            break;
          case 'greater_than':
            if (Number(eventValue) <= Number(value)) return false;
            break;
          case 'less_than':
            if (Number(eventValue) >= Number(value)) return false;
            break;
          case 'exists':
            if (eventValue === undefined || eventValue === null) return false;
            break;
          case 'not_exists':
            if (eventValue !== undefined && eventValue !== null) return false;
            break;
          default:
            logger.warn('Unknown condition operator', { operator });
            return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Failed to evaluate trigger conditions', {
        error: error instanceof Error ? error.message : 'Unknown error',
        conditions,
      });
      return false;
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Trigger a specific workflow
   */
  private async triggerWorkflow(workflow: Workflow, event: Event): Promise<TriggerResult> {
    try {
      logger.info('Triggering workflow', {
        workflowId: workflow.id,
        workflowName: workflow.name,
        eventId: event.id,
        eventType: event.eventType,
      });

      // Create trigger context
      const triggerContext: TriggerContext = {
        eventId: event.id,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        eventData: event.eventData,
        userId: event.userId,
        clientId: workflow.client_id,
        correlationId: event.correlationId,
        causationId: event.causationId,
      };

      // Prepare input data for workflow
      const inputData = {
        event: {
          id: event.id,
          type: event.eventType,
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          data: event.eventData,
          timestamp: event.timestamp,
        },
        trigger: triggerContext,
      };

      // Execute workflow
      const execution = await this.workflowEngine.executeWorkflowFromEvent(
        workflow.id,
        inputData,
        { clientId: workflow.client_id },
        {
          eventId: event.id,
          eventType: event.eventType,
          aggregateId: event.aggregateId,
        }
      );

      logger.info('Workflow triggered successfully', {
        workflowId: workflow.id,
        executionId: execution.id,
        eventId: event.id,
      });

      return {
        success: true,
        workflowId: workflow.id,
        executionId: execution.id,
        triggeredAt: new Date(),
      };
    } catch (error) {
      logger.error('Failed to trigger workflow', {
        workflowId: workflow.id,
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        workflowId: workflow.id,
        executionId: '',
        triggeredAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get cached workflows
   */
  private getCachedWorkflows(cacheKey: string): Workflow[] | null {
    const expiry = this.cacheExpiry.get(cacheKey);
    if (expiry && Date.now() > expiry) {
      this.triggerCache.delete(cacheKey);
      this.cacheExpiry.delete(cacheKey);
      return null;
    }

    const cached = this.triggerCache.get(cacheKey);
    return cached || null;
  }

  /**
   * Set cached workflows
   */
  private setCachedWorkflows(cacheKey: string, workflows: Workflow[]): void {
    this.triggerCache.set(cacheKey, workflows);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
  }

  /**
   * Clear trigger cache
   */
  public clearCache(): void {
    this.triggerCache.clear();
    this.cacheExpiry.clear();
    logger.info('Workflow trigger cache cleared');
  }

  /**
   * Get trigger statistics
   */
  public async getTriggerStatistics(): Promise<{
    totalWorkflows: number;
    activeWorkflows: number;
    eventTriggers: number;
    scheduledTriggers: number;
    webhookTriggers: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('workflows')
        .select('id, is_active, definition');

      if (error) {
        logger.error('Failed to fetch workflow statistics', { error: error.message });
        return {
          totalWorkflows: 0,
          activeWorkflows: 0,
          eventTriggers: 0,
          scheduledTriggers: 0,
          webhookTriggers: 0,
        };
      }

      let totalWorkflows = 0;
      let activeWorkflows = 0;
      let eventTriggers = 0;
      let scheduledTriggers = 0;
      let webhookTriggers = 0;

      for (const workflow of data || []) {
        totalWorkflows++;
        if (workflow.is_active) {
          activeWorkflows++;
        }

        if (workflow.definition?.triggers) {
          for (const trigger of workflow.definition.triggers) {
            if (trigger.enabled) {
              switch (trigger.type) {
                case TriggerType.EVENT:
                  eventTriggers++;
                  break;
                case TriggerType.SCHEDULED:
                  scheduledTriggers++;
                  break;
                case TriggerType.WEBHOOK:
                  webhookTriggers++;
                  break;
              }
            }
          }
        }
      }

      return {
        totalWorkflows,
        activeWorkflows,
        eventTriggers,
        scheduledTriggers,
        webhookTriggers,
      };
    } catch (error) {
      logger.error('Failed to get trigger statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        totalWorkflows: 0,
        activeWorkflows: 0,
        eventTriggers: 0,
        scheduledTriggers: 0,
        webhookTriggers: 0,
      };
    }
  }

  /**
   * Health check for trigger system
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('workflows').select('id').limit(1);
      return !error;
    } catch (error) {
      logger.error('Workflow trigger system health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }
}
