/**
 * Personalization Service
 * Sub-feature 2.6.3: Personalization Triggers (5 SP)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AnalyticsServiceError,
  CreatePersonalizationTriggerRequest,
  CreateUserSegmentRequest,
  PersonalizationTrigger,
  UserSegment,
  UserSegmentMembership,
} from '../types/analytics';

export class PersonalizationService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Create a new personalization trigger
   */
  async createPersonalizationTrigger(
    request: CreatePersonalizationTriggerRequest,
    createdBy: string,
  ): Promise<PersonalizationTrigger> {
    try {
      const { data, error } = await this.supabase
        .from('personalization_triggers')
        .insert({
          name: request.name,
          description: request.description,
          trigger_type: request.trigger_type,
          conditions: request.conditions,
          actions: request.actions,
          priority: request.priority || 0,
          is_active: true,
          created_by: createdBy,
        })
        .select()
        .single();

      if (error) {
        throw new AnalyticsServiceError(
          'PERSONALIZATION_TRIGGER_CREATE_FAILED',
          `Failed to create personalization trigger: ${error.message}`,
          { error, request },
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'PERSONALIZATION_TRIGGER_CREATE_ERROR',
        `Unexpected error creating personalization trigger: ${error.message}`,
        { error, request },
      );
    }
  }

  /**
   * Get personalization triggers
   */
  async getPersonalizationTriggers(
    isActive?: boolean,
    triggerType?: string,
  ): Promise<PersonalizationTrigger[]> {
    try {
      let query = this.supabase
        .from('personalization_triggers')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      if (triggerType) {
        query = query.eq('trigger_type', triggerType);
      }

      const { data, error } = await query;

      if (error) {
        throw new AnalyticsServiceError(
          'PERSONALIZATION_TRIGGERS_FETCH_FAILED',
          `Failed to fetch personalization triggers: ${error.message}`,
          { error, isActive, triggerType },
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'PERSONALIZATION_TRIGGERS_FETCH_ERROR',
        `Unexpected error fetching personalization triggers: ${error.message}`,
        { error, isActive, triggerType },
      );
    }
  }

  /**
   * Update personalization trigger
   */
  async updatePersonalizationTrigger(
    triggerId: string,
    updates: Partial<CreatePersonalizationTriggerRequest>,
  ): Promise<PersonalizationTrigger> {
    try {
      const { data, error } = await this.supabase
        .from('personalization_triggers')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', triggerId)
        .select()
        .single();

      if (error) {
        throw new AnalyticsServiceError(
          'PERSONALIZATION_TRIGGER_UPDATE_FAILED',
          `Failed to update personalization trigger: ${error.message}`,
          { error, triggerId, updates },
        );
      }

      if (!data) {
        throw new AnalyticsServiceError(
          'PERSONALIZATION_TRIGGER_NOT_FOUND',
          `Personalization trigger with ID ${triggerId} not found`,
          { triggerId },
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'PERSONALIZATION_TRIGGER_UPDATE_ERROR',
        `Unexpected error updating personalization trigger: ${error.message}`,
        { error, triggerId, updates },
      );
    }
  }

  /**
   * Delete personalization trigger
   */
  async deletePersonalizationTrigger(triggerId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('personalization_triggers')
        .delete()
        .eq('id', triggerId);

      if (error) {
        throw new AnalyticsServiceError(
          'PERSONALIZATION_TRIGGER_DELETE_FAILED',
          `Failed to delete personalization trigger: ${error.message}`,
          { error, triggerId },
        );
      }
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'PERSONALIZATION_TRIGGER_DELETE_ERROR',
        `Unexpected error deleting personalization trigger: ${error.message}`,
        { error, triggerId },
      );
    }
  }

  /**
   * Create a new user segment
   */
  async createUserSegment(
    request: CreateUserSegmentRequest,
    createdBy: string,
  ): Promise<UserSegment> {
    try {
      const { data, error } = await this.supabase
        .from('user_segments')
        .insert({
          name: request.name,
          description: request.description,
          segment_criteria: request.segment_criteria,
          user_count: 0,
          is_active: true,
          created_by: createdBy,
        })
        .select()
        .single();

      if (error) {
        throw new AnalyticsServiceError(
          'USER_SEGMENT_CREATE_FAILED',
          `Failed to create user segment: ${error.message}`,
          { error, request },
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'USER_SEGMENT_CREATE_ERROR',
        `Unexpected error creating user segment: ${error.message}`,
        { error, request },
      );
    }
  }

  /**
   * Get user segments
   */
  async getUserSegments(isActive?: boolean): Promise<UserSegment[]> {
    try {
      let query = this.supabase
        .from('user_segments')
        .select('*')
        .order('created_at', { ascending: false });

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      const { data, error } = await query;

      if (error) {
        throw new AnalyticsServiceError(
          'USER_SEGMENTS_FETCH_FAILED',
          `Failed to fetch user segments: ${error.message}`,
          { error, isActive },
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'USER_SEGMENTS_FETCH_ERROR',
        `Unexpected error fetching user segments: ${error.message}`,
        { error, isActive },
      );
    }
  }

  /**
   * Update user segment
   */
  async updateUserSegment(
    segmentId: string,
    updates: Partial<CreateUserSegmentRequest>,
  ): Promise<UserSegment> {
    try {
      const { data, error } = await this.supabase
        .from('user_segments')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', segmentId)
        .select()
        .single();

      if (error) {
        throw new AnalyticsServiceError(
          'USER_SEGMENT_UPDATE_FAILED',
          `Failed to update user segment: ${error.message}`,
          { error, segmentId, updates },
        );
      }

      if (!data) {
        throw new AnalyticsServiceError(
          'USER_SEGMENT_NOT_FOUND',
          `User segment with ID ${segmentId} not found`,
          { segmentId },
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'USER_SEGMENT_UPDATE_ERROR',
        `Unexpected error updating user segment: ${error.message}`,
        { error, segmentId, updates },
      );
    }
  }

  /**
   * Delete user segment
   */
  async deleteUserSegment(segmentId: string): Promise<void> {
    try {
      const { error } = await this.supabase.from('user_segments').delete().eq('id', segmentId);

      if (error) {
        throw new AnalyticsServiceError(
          'USER_SEGMENT_DELETE_FAILED',
          `Failed to delete user segment: ${error.message}`,
          { error, segmentId },
        );
      }
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'USER_SEGMENT_DELETE_ERROR',
        `Unexpected error deleting user segment: ${error.message}`,
        { error, segmentId },
      );
    }
  }

  /**
   * Evaluate user against segment criteria
   */
  async evaluateUserForSegment(
    userId: string,
    segmentCriteria: Record<string, any>,
  ): Promise<boolean> {
    try {
      // Get user data
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return false;
      }

      // Get user's client data
      const { data: clients, error: clientsError } = await this.supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId);

      if (clientsError) {
        return false;
      }

      // Get user's analytics data
      const { data: analytics, error: analyticsError } = await this.supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId);

      if (analyticsError) {
        return false;
      }

      // Evaluate criteria
      return this.evaluateCriteria(segmentCriteria, {
        user,
        clients: clients || [],
        analytics: analytics || [],
      });
    } catch (error) {
      throw new AnalyticsServiceError(
        'SEGMENT_EVALUATION_ERROR',
        `Unexpected error evaluating user for segment: ${error.message}`,
        { error, userId, segmentCriteria },
      );
    }
  }

  /**
   * Evaluate segment criteria against user data
   */
  private evaluateCriteria(
    criteria: Record<string, any>,
    userData: {
      user: any;
      clients: any[];
      analytics: any[];
    },
  ): boolean {
    try {
      for (const [key, value] of Object.entries(criteria)) {
        if (!this.evaluateCriterion(key, value, userData)) {
          return false;
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Evaluate individual criterion
   */
  private evaluateCriterion(
    key: string,
    value: any,
    userData: {
      user: any;
      clients: any[];
      analytics: any[];
    },
  ): boolean {
    const { user, clients, analytics } = userData;

    switch (key) {
      case 'user.role':
        return user.role === value;

      case 'user.industry':
        return user.industry === value;

      case 'user.company_size':
        return user.company_size === value;

      case 'user.subscription_plan':
        return user.subscription_plan_id === value;

      case 'user.created_after':
        return new Date(user.created_at) >= new Date(value);

      case 'user.created_before':
        return new Date(user.created_at) <= new Date(value);

      case 'clients.count':
        return clients.length === value;

      case 'clients.count_greater_than':
        return clients.length > value;

      case 'clients.count_less_than':
        return clients.length < value;

      case 'analytics.events_count':
        return analytics.length === value;

      case 'analytics.events_count_greater_than':
        return analytics.length > value;

      case 'analytics.events_count_less_than':
        return analytics.length < value;

      case 'analytics.has_event_type':
        return analytics.some(event => event.event_type === value);

      case 'analytics.last_activity_after':
        const lastActivity = analytics.reduce((latest, event) => {
          return new Date(event.timestamp) > new Date(latest) ? event.timestamp : latest;
        }, '1970-01-01');
        return new Date(lastActivity) >= new Date(value);

      case 'analytics.last_activity_before':
        const lastActivityBefore = analytics.reduce((latest, event) => {
          return new Date(event.timestamp) > new Date(latest) ? event.timestamp : latest;
        }, '1970-01-01');
        return new Date(lastActivityBefore) <= new Date(value);

      default:
        return false;
    }
  }

  /**
   * Update user segment memberships
   */
  async updateUserSegmentMemberships(userId: string): Promise<UserSegmentMembership[]> {
    try {
      // Get all active segments
      const segments = await this.getUserSegments(true);
      const memberships: UserSegmentMembership[] = [];

      for (const segment of segments) {
        const isMember = await this.evaluateUserForSegment(userId, segment.segment_criteria);

        // Check if membership already exists
        const { data: existingMembership } = await this.supabase
          .from('user_segment_memberships')
          .select('*')
          .eq('user_id', userId)
          .eq('segment_id', segment.id)
          .single();

        if (isMember && !existingMembership) {
          // Add user to segment
          const { data: membership, error } = await this.supabase
            .from('user_segment_memberships')
            .insert({
              user_id: userId,
              segment_id: segment.id,
              joined_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (!error && membership) {
            memberships.push(membership);
          }
        } else if (!isMember && existingMembership) {
          // Remove user from segment
          await this.supabase
            .from('user_segment_memberships')
            .delete()
            .eq('user_id', userId)
            .eq('segment_id', segment.id);
        } else if (isMember && existingMembership) {
          memberships.push(existingMembership);
        }
      }

      // Update segment user counts
      await this.updateSegmentUserCounts();

      return memberships;
    } catch (error) {
      throw new AnalyticsServiceError(
        'SEGMENT_MEMBERSHIPS_UPDATE_ERROR',
        `Unexpected error updating user segment memberships: ${error.message}`,
        { error, userId },
      );
    }
  }

  /**
   * Update segment user counts
   */
  private async updateSegmentUserCounts(): Promise<void> {
    try {
      const segments = await this.getUserSegments(true);

      for (const segment of segments) {
        const { data: memberships, error } = await this.supabase
          .from('user_segment_memberships')
          .select('id')
          .eq('segment_id', segment.id);

        if (!error) {
          const userCount = memberships?.length || 0;

          await this.supabase
            .from('user_segments')
            .update({ user_count: userCount })
            .eq('id', segment.id);
        }
      }
    } catch (error) {
      // Log error but don't throw - this is a background operation
      console.error('Error updating segment user counts:', error);
    }
  }

  /**
   * Get user's segment memberships
   */
  async getUserSegmentMemberships(userId: string): Promise<UserSegmentMembership[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_segment_memberships')
        .select(
          `
          *,
          user_segments!inner(*)
        `,
        )
        .eq('user_id', userId);

      if (error) {
        throw new AnalyticsServiceError(
          'USER_SEGMENT_MEMBERSHIPS_FETCH_FAILED',
          `Failed to fetch user segment memberships: ${error.message}`,
          { error, userId },
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'USER_SEGMENT_MEMBERSHIPS_FETCH_ERROR',
        `Unexpected error fetching user segment memberships: ${error.message}`,
        { error, userId },
      );
    }
  }

  /**
   * Execute personalization triggers for a user
   */
  async executePersonalizationTriggers(
    userId: string,
    eventType?: string,
    eventData?: Record<string, any>,
  ): Promise<Array<{ trigger: PersonalizationTrigger; executed: boolean; result?: any }>> {
    try {
      const triggers = await this.getPersonalizationTriggers(true);
      const results = [];

      for (const trigger of triggers) {
        const shouldExecute = await this.shouldExecuteTrigger(
          trigger,
          userId,
          eventType,
          eventData,
        );

        if (shouldExecute) {
          const result = await this.executeTrigger(trigger, userId, eventData);
          results.push({ trigger, executed: true, result });
        } else {
          results.push({ trigger, executed: false });
        }
      }

      return results;
    } catch (error) {
      throw new AnalyticsServiceError(
        'PERSONALIZATION_TRIGGERS_EXECUTION_ERROR',
        `Unexpected error executing personalization triggers: ${error.message}`,
        { error, userId, eventType, eventData },
      );
    }
  }

  /**
   * Check if trigger should be executed
   */
  private async shouldExecuteTrigger(
    trigger: PersonalizationTrigger,
    userId: string,
    eventType?: string,
    eventData?: Record<string, any>,
  ): Promise<boolean> {
    try {
      // Check trigger type conditions
      switch (trigger.trigger_type) {
        case 'event_based':
          return eventType === trigger.conditions.event_type;

        case 'user_behavior':
          return await this.evaluateUserBehaviorConditions(trigger.conditions, userId);

        case 'time_based':
          return this.evaluateTimeBasedConditions(trigger.conditions);

        case 'segment_based':
          return await this.evaluateSegmentBasedConditions(trigger.conditions, userId);

        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Evaluate user behavior conditions
   */
  private async evaluateUserBehaviorConditions(
    conditions: Record<string, any>,
    userId: string,
  ): Promise<boolean> {
    // Implementation would depend on specific behavior conditions
    // This is a simplified version
    return true;
  }

  /**
   * Evaluate time-based conditions
   */
  private evaluateTimeBasedConditions(conditions: Record<string, any>): boolean {
    const now = new Date();

    if (conditions.time_of_day) {
      const hour = now.getHours();
      const [startHour, endHour] = conditions.time_of_day.split('-').map(Number);
      if (hour < startHour || hour > endHour) {
        return false;
      }
    }

    if (conditions.day_of_week) {
      const dayOfWeek = now.getDay();
      if (!conditions.day_of_week.includes(dayOfWeek)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate segment-based conditions
   */
  private async evaluateSegmentBasedConditions(
    conditions: Record<string, any>,
    userId: string,
  ): Promise<boolean> {
    if (conditions.segment_ids) {
      const memberships = await this.getUserSegmentMemberships(userId);
      const userSegmentIds = memberships.map(m => m.segment_id);

      return conditions.segment_ids.some((segmentId: string) => userSegmentIds.includes(segmentId));
    }

    return false;
  }

  /**
   * Execute trigger actions
   */
  private async executeTrigger(
    trigger: PersonalizationTrigger,
    userId: string,
    eventData?: Record<string, any>,
  ): Promise<any> {
    try {
      // This would execute the actual trigger actions
      // Implementation depends on the specific action types
      const actions = trigger.actions;

      // Log the trigger execution
      console.log(`Executing trigger ${trigger.name} for user ${userId}`, {
        actions,
        eventData,
      });

      return { success: true, actions };
    } catch (error) {
      throw new AnalyticsServiceError(
        'TRIGGER_EXECUTION_ERROR',
        `Failed to execute trigger: ${error.message}`,
        { error, trigger, userId, eventData },
      );
    }
  }
}
