import { createClient } from '@supabase/supabase-js';
import { ActionItem } from '../types';
import { logger } from '../utils/logger';

export interface ActionItemEvent {
  id: string;
  eventType: 'action_item.created' | 'action_item.updated' | 'action_item.completed';
  aggregateId: string;
  aggregateType: 'action_item';
  eventData: ActionItem;
  eventVersion: number;
  timestamp: Date;
  userId: string;
  clientId: string;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, any>;
}

export class ActionItemEventService {
  private supabase;

  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }

  /**
   * Create action items from OpenAI extraction and trigger events
   */
  async createActionItemsFromExtraction(
    actionItems: ActionItem[],
    meetingId: string,
    userId: string,
    clientId: string,
    correlationId?: string,
  ): Promise<ActionItem[]> {
    try {
      logger.info('Creating action items from extraction', {
        meetingId,
        userId,
        clientId,
        actionItemCount: actionItems.length,
      });

      const createdActionItems: ActionItem[] = [];

      // Create each action item in the database
      for (const actionItem of actionItems) {
        try {
          const { data: createdItem, error } = await this.supabase
            .from('meeting_action_items')
            .insert({
              meeting_id: meetingId,
              title: actionItem.title,
              description: actionItem.description,
              assignee: actionItem.assignee,
              due_date: actionItem.due_date?.toISOString(),
              due_time: actionItem.due_time,
              priority: actionItem.priority,
              status: 'pending',
              category: actionItem.category,
              project: actionItem.project,
              dependencies: actionItem.dependencies,
              blockers: actionItem.blockers,
              resources_needed: actionItem.resources_needed,
              success_criteria: actionItem.success_criteria,
              budget_impact: actionItem.budget_impact,
              budget_allocation: actionItem.budget_allocation,
              cost_center: actionItem.cost_center,
              approval_required: actionItem.approval_required,
              spending_limit: actionItem.spending_limit,
              financial_impact: actionItem.financial_impact,
              stakeholders: actionItem.stakeholders,
              communication_requirements: actionItem.communication_requirements,
              technical_requirements: actionItem.technical_requirements,
              quality_standards: actionItem.quality_standards,
              location: actionItem.location,
              meeting_related: actionItem.meeting_related,
              tags: actionItem.tags,
              estimated_effort: actionItem.estimated_effort,
              risk_level: actionItem.risk_level,
              context: actionItem.context,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) {
            logger.error('Failed to create action item', {
              meetingId,
              actionItemTitle: actionItem.title,
              error: error.message,
            });
            continue;
          }

          const createdActionItem: ActionItem = {
            id: createdItem.id,
            meeting_id: createdItem.meeting_id,
            title: createdItem.title,
            description: createdItem.description,
            assignee: createdItem.assignee,
            due_date: createdItem.due_date ? new Date(createdItem.due_date) : undefined,
            due_time: createdItem.due_time,
            priority: createdItem.priority,
            status: createdItem.status,
            category: createdItem.category,
            project: createdItem.project,
            dependencies: createdItem.dependencies,
            blockers: createdItem.blockers,
            resources_needed: createdItem.resources_needed,
            success_criteria: createdItem.success_criteria,
            budget_impact: createdItem.budget_impact,
            budget_allocation: createdItem.budget_allocation,
            cost_center: createdItem.cost_center,
            approval_required: createdItem.approval_required,
            spending_limit: createdItem.spending_limit,
            financial_impact: createdItem.financial_impact,
            stakeholders: createdItem.stakeholders,
            communication_requirements: createdItem.communication_requirements,
            technical_requirements: createdItem.technical_requirements,
            quality_standards: createdItem.quality_standards,
            location: createdItem.location,
            meeting_related: createdItem.meeting_related,
            tags: createdItem.tags,
            estimated_effort: createdItem.estimated_effort,
            risk_level: createdItem.risk_level,
            context: createdItem.context,
            created_at: new Date(createdItem.created_at),
            updated_at: new Date(createdItem.updated_at),
          };

          createdActionItems.push(createdActionItem);

          // Trigger action item created event
          await this.triggerActionItemCreatedEvent(
            createdActionItem,
            userId,
            clientId,
            correlationId,
          );

          logger.info('Action item created and event triggered', {
            actionItemId: createdActionItem.id,
            meetingId,
            userId,
            clientId,
          });
        } catch (itemError) {
          logger.error('Error creating individual action item', {
            meetingId,
            actionItemTitle: actionItem.title,
            error: itemError instanceof Error ? itemError.message : 'Unknown error',
          });
        }
      }

      logger.info('Action items creation completed', {
        meetingId,
        userId,
        clientId,
        totalCreated: createdActionItems.length,
        totalRequested: actionItems.length,
      });

      return createdActionItems;
    } catch (error) {
      logger.error('Failed to create action items from extraction', {
        meetingId,
        userId,
        clientId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Update action item and trigger event
   */
  async updateActionItem(
    actionItemId: string,
    updates: Partial<ActionItem>,
    userId: string,
    clientId: string,
  ): Promise<ActionItem> {
    try {
      // Get current action item
      const { data: currentItem, error: fetchError } = await this.supabase
        .from('meeting_action_items')
        .select('*')
        .eq('id', actionItemId)
        .single();

      if (fetchError || !currentItem) {
        throw new Error(`Action item not found: ${actionItemId}`);
      }

      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.assignee !== undefined) updateData.assignee = updates.assignee;
      if (updates.due_date) updateData.due_date = updates.due_date.toISOString();
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.status) updateData.status = updates.status;

      // Update action item
      const { data: updatedItem, error } = await this.supabase
        .from('meeting_action_items')
        .update(updateData)
        .eq('id', actionItemId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update action item: ${error.message}`);
      }

      const updatedActionItem: ActionItem = {
        id: updatedItem.id,
        meeting_id: updatedItem.meeting_id,
        title: updatedItem.title,
        description: updatedItem.description,
        assignee: updatedItem.assignee,
        due_date: updatedItem.due_date ? new Date(updatedItem.due_date) : undefined,
        due_time: updatedItem.due_time,
        priority: updatedItem.priority,
        status: updatedItem.status,
        category: updatedItem.category,
        project: updatedItem.project,
        dependencies: updatedItem.dependencies,
        blockers: updatedItem.blockers,
        resources_needed: updatedItem.resources_needed,
        success_criteria: updatedItem.success_criteria,
        budget_impact: updatedItem.budget_impact,
        budget_allocation: updatedItem.budget_allocation,
        cost_center: updatedItem.cost_center,
        approval_required: updatedItem.approval_required,
        spending_limit: updatedItem.spending_limit,
        financial_impact: updatedItem.financial_impact,
        stakeholders: updatedItem.stakeholders,
        communication_requirements: updatedItem.communication_requirements,
        technical_requirements: updatedItem.technical_requirements,
        quality_standards: updatedItem.quality_standards,
        location: updatedItem.location,
        meeting_related: updatedItem.meeting_related,
        tags: updatedItem.tags,
        estimated_effort: updatedItem.estimated_effort,
        risk_level: updatedItem.risk_level,
        context: updatedItem.context,
        created_at: new Date(updatedItem.created_at),
        updated_at: new Date(updatedItem.updated_at),
      };

      // Trigger action item updated event
      await this.triggerActionItemUpdatedEvent(updatedActionItem, currentItem, userId, clientId);

      logger.info('Action item updated and event triggered', {
        actionItemId,
        userId,
        clientId,
        statusChanged: currentItem.status !== updatedItem.status,
      });

      return updatedActionItem;
    } catch (error) {
      logger.error('Failed to update action item', {
        actionItemId,
        userId,
        clientId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Trigger action item created event
   */
  private async triggerActionItemCreatedEvent(
    actionItem: ActionItem,
    userId: string,
    clientId: string,
    correlationId?: string,
  ): Promise<void> {
    try {
      const event: ActionItemEvent = {
        id: `action-item-created-${actionItem.id}-${Date.now()}`,
        eventType: 'action_item.created',
        aggregateId: actionItem.id,
        aggregateType: 'action_item',
        eventData: actionItem,
        eventVersion: 1,
        timestamp: new Date(),
        userId,
        clientId,
        correlationId,
        causationId: correlationId,
        metadata: {
          meetingId: actionItem.meeting_id,
          priority: actionItem.priority,
          assignee: actionItem.assignee,
          hasDueDate: !!actionItem.due_date,
        },
      };

      // Store event in event store
      await this.storeEvent(event);

      // Publish event to event bus
      await this.publishEvent(event);

      logger.info('Action item created event triggered', {
        eventId: event.id,
        actionItemId: actionItem.id,
        userId,
        clientId,
      });
    } catch (error) {
      logger.error('Failed to trigger action item created event', {
        actionItemId: actionItem.id,
        userId,
        clientId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Don't throw - event triggering failure shouldn't break action item creation
    }
  }

  /**
   * Trigger action item updated event
   */
  private async triggerActionItemUpdatedEvent(
    updatedActionItem: ActionItem,
    previousActionItem: any,
    userId: string,
    clientId: string,
  ): Promise<void> {
    try {
      const event: ActionItemEvent = {
        id: `action-item-updated-${updatedActionItem.id}-${Date.now()}`,
        eventType: 'action_item.updated',
        aggregateId: updatedActionItem.id,
        aggregateType: 'action_item',
        eventData: updatedActionItem,
        eventVersion: 1,
        timestamp: new Date(),
        userId,
        clientId,
        metadata: {
          meetingId: updatedActionItem.meeting_id,
          previousStatus: previousActionItem.status,
          newStatus: updatedActionItem.status,
          statusChanged: previousActionItem.status !== updatedActionItem.status,
          priority: updatedActionItem.priority,
          assignee: updatedActionItem.assignee,
        },
      };

      // Store event in event store
      await this.storeEvent(event);

      // Publish event to event bus
      await this.publishEvent(event);

      // If status changed to completed, trigger completion event
      if (previousActionItem.status !== 'completed' && updatedActionItem.status === 'completed') {
        await this.triggerActionItemCompletedEvent(updatedActionItem, userId, clientId);
      }

      logger.info('Action item updated event triggered', {
        eventId: event.id,
        actionItemId: updatedActionItem.id,
        userId,
        clientId,
        statusChanged: event.metadata?.statusChanged,
      });
    } catch (error) {
      logger.error('Failed to trigger action item updated event', {
        actionItemId: updatedActionItem.id,
        userId,
        clientId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Trigger action item completed event
   */
  private async triggerActionItemCompletedEvent(
    actionItem: ActionItem,
    userId: string,
    clientId: string,
  ): Promise<void> {
    try {
      const event: ActionItemEvent = {
        id: `action-item-completed-${actionItem.id}-${Date.now()}`,
        eventType: 'action_item.completed',
        aggregateId: actionItem.id,
        aggregateType: 'action_item',
        eventData: actionItem,
        eventVersion: 1,
        timestamp: new Date(),
        userId,
        clientId,
        metadata: {
          meetingId: actionItem.meeting_id,
          priority: actionItem.priority,
          assignee: actionItem.assignee,
          completedAt: new Date().toISOString(),
        },
      };

      // Store event in event store
      await this.storeEvent(event);

      // Publish event to event bus
      await this.publishEvent(event);

      logger.info('Action item completed event triggered', {
        eventId: event.id,
        actionItemId: actionItem.id,
        userId,
        clientId,
      });
    } catch (error) {
      logger.error('Failed to trigger action item completed event', {
        actionItemId: actionItem.id,
        userId,
        clientId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Store event in event store
   */
  private async storeEvent(event: ActionItemEvent): Promise<void> {
    try {
      const { error } = await this.supabase.from('events').insert({
        id: event.id,
        event_type: event.eventType,
        aggregate_id: event.aggregateId,
        aggregate_type: event.aggregateType,
        event_data: event.eventData,
        event_version: event.eventVersion,
        timestamp: event.timestamp.toISOString(),
        user_id: event.userId,
        client_id: event.clientId,
        correlation_id: event.correlationId,
        causation_id: event.causationId,
        metadata: event.metadata,
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw new Error(`Failed to store event: ${error.message}`);
      }
    } catch (error) {
      logger.error('Failed to store action item event', {
        eventId: event.id,
        eventType: event.eventType,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Publish event to event bus (Supabase Realtime)
   */
  private async publishEvent(event: ActionItemEvent): Promise<void> {
    try {
      const response = await this.supabase.channel('action-item-events').send({
        type: 'broadcast',
        event: 'action_item_event',
        payload: {
          id: event.id,
          eventType: event.eventType,
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          eventData: event.eventData,
          timestamp: event.timestamp.toISOString(),
          userId: event.userId,
          clientId: event.clientId,
          correlationId: event.correlationId,
          causationId: event.causationId,
          metadata: event.metadata,
        },
      });

      if (!response) {
        throw new Error(`Failed to publish event: No response from Supabase`);
      }
    } catch (error) {
      logger.error('Failed to publish action item event', {
        eventId: event.id,
        eventType: event.eventType,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get action items for a meeting with event history
   */
  async getActionItemsWithEvents(
    meetingId: string,
    userId: string,
  ): Promise<{
    actionItems: ActionItem[];
    events: ActionItemEvent[];
  }> {
    try {
      // Get action items
      const { data: actionItems, error: actionItemsError } = await this.supabase
        .from('meeting_action_items')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });

      if (actionItemsError) {
        throw new Error(`Failed to fetch action items: ${actionItemsError.message}`);
      }

      // Get events for these action items
      const actionItemIds = actionItems?.map(item => item.id) || [];
      const { data: events, error: eventsError } = await this.supabase
        .from('events')
        .select('*')
        .in('aggregate_id', actionItemIds)
        .eq('aggregate_type', 'action_item')
        .order('timestamp', { ascending: false });

      if (eventsError) {
        throw new Error(`Failed to fetch events: ${eventsError.message}`);
      }

      const formattedActionItems: ActionItem[] = (actionItems || []).map(item => ({
        id: item.id,
        meeting_id: item.meeting_id,
        title: item.title,
        description: item.description,
        assignee: item.assignee,
        due_date: item.due_date ? new Date(item.due_date) : undefined,
        due_time: item.due_time,
        priority: item.priority,
        status: item.status,
        category: item.category,
        project: item.project,
        dependencies: item.dependencies,
        blockers: item.blockers,
        resources_needed: item.resources_needed,
        success_criteria: item.success_criteria,
        budget_impact: item.budget_impact,
        budget_allocation: item.budget_allocation,
        cost_center: item.cost_center,
        approval_required: item.approval_required,
        spending_limit: item.spending_limit,
        financial_impact: item.financial_impact,
        stakeholders: item.stakeholders,
        communication_requirements: item.communication_requirements,
        technical_requirements: item.technical_requirements,
        quality_standards: item.quality_standards,
        location: item.location,
        meeting_related: item.meeting_related,
        tags: item.tags,
        estimated_effort: item.estimated_effort,
        risk_level: item.risk_level,
        context: item.context,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at),
      }));

      const formattedEvents: ActionItemEvent[] = (events || []).map(event => ({
        id: event.id,
        eventType: event.event_type as any,
        aggregateId: event.aggregate_id,
        aggregateType: event.aggregate_type as any,
        eventData: event.event_data,
        eventVersion: event.event_version,
        timestamp: new Date(event.timestamp),
        userId: event.user_id,
        clientId: event.client_id,
        correlationId: event.correlation_id,
        causationId: event.causation_id,
        metadata: event.metadata,
      }));

      return {
        actionItems: formattedActionItems,
        events: formattedEvents,
      };
    } catch (error) {
      logger.error('Failed to get action items with events', {
        meetingId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
