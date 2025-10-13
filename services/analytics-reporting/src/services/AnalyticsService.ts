/**
 * Main Analytics Service
 * Coordinates all analytics functionality including funnel tracking, conversion optimization, and personalization
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
    AnalyticsEvent,
    AnalyticsFilter,
    AnalyticsServiceError,
    ClientAnalytics,
    ConversionEvent,
    TrackConversionRequest,
    TrackEventRequest,
    UserAnalytics
} from '../types/analytics';
import { ConversionOptimizationService } from './ConversionOptimizationService';
import { FunnelTrackingService } from './FunnelTrackingService';
import { PersonalizationService } from './PersonalizationService';

export class AnalyticsService {
  private supabase: SupabaseClient;
  private funnelTracking: FunnelTrackingService;
  private conversionOptimization: ConversionOptimizationService;
  private personalization: PersonalizationService;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.funnelTracking = new FunnelTrackingService(supabaseUrl, supabaseKey);
    this.conversionOptimization = new ConversionOptimizationService(supabaseUrl, supabaseKey);
    this.personalization = new PersonalizationService(supabaseUrl, supabaseKey);
  }

  /**
   * Track an analytics event
   */
  async trackEvent(request: TrackEventRequest): Promise<AnalyticsEvent> {
    try {
      const { data, error } = await this.supabase
        .from('analytics_events')
        .insert({
          user_id: request.user_id,
          client_id: request.client_id,
          event_type: request.event_type,
          event_name: request.event_name,
          event_data: request.event_data || {},
          session_id: request.session_id,
          page_url: request.page_url,
          referrer: request.referrer,
          user_agent: request.user_agent,
          ip_address: request.ip_address,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new AnalyticsServiceError(
          'EVENT_TRACK_FAILED',
          `Failed to track event: ${error.message}`,
          { error, request }
        );
      }

      // Execute personalization triggers for this event
      try {
        await this.personalization.executePersonalizationTriggers(
          request.user_id,
          request.event_type,
          request.event_data
        );
      } catch (triggerError) {
        // Log trigger error but don't fail the event tracking
        console.error('Personalization trigger execution failed:', triggerError);
      }

      return data;
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'EVENT_TRACK_ERROR',
        `Unexpected error tracking event: ${error.message}`,
        { error, request }
      );
    }
  }

  /**
   * Track a conversion event
   */
  async trackConversion(request: TrackConversionRequest): Promise<ConversionEvent> {
    try {
      const { data, error } = await this.supabase
        .from('conversion_events')
        .insert({
          user_id: request.user_id,
          client_id: request.client_id,
          conversion_type: request.conversion_type,
          conversion_value: request.conversion_value,
          experiment_id: request.experiment_id,
          variant_id: request.variant_id,
          funnel_step_id: request.funnel_step_id,
          metadata: request.metadata || {},
          converted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new AnalyticsServiceError(
          'CONVERSION_TRACK_FAILED',
          `Failed to track conversion: ${error.message}`,
          { error, request }
        );
      }

      // If this is part of an experiment, update the user's experiment assignment
      if (request.experiment_id) {
        try {
          await this.conversionOptimization.trackConversion(
            request.user_id,
            request.experiment_id,
            request.conversion_value,
            request.metadata
          );
        } catch (experimentError) {
          // Log experiment error but don't fail the conversion tracking
          console.error('Experiment conversion tracking failed:', experimentError);
        }
      }

      return data;
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'CONVERSION_TRACK_ERROR',
        `Unexpected error tracking conversion: ${error.message}`,
        { error, request }
      );
    }
  }

  /**
   * Get analytics events with filters
   */
  async getAnalyticsEvents(filter: AnalyticsFilter): Promise<AnalyticsEvent[]> {
    try {
      let query = this.supabase
        .from('analytics_events')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filter.user_id) {
        query = query.eq('user_id', filter.user_id);
      }

      if (filter.client_id) {
        query = query.eq('client_id', filter.client_id);
      }

      if (filter.event_type) {
        query = query.eq('event_type', filter.event_type);
      }

      if (filter.start_date) {
        query = query.gte('timestamp', filter.start_date.toISOString());
      }

      if (filter.end_date) {
        query = query.lte('timestamp', filter.end_date.toISOString());
      }

      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 100) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new AnalyticsServiceError(
          'ANALYTICS_EVENTS_FETCH_FAILED',
          `Failed to fetch analytics events: ${error.message}`,
          { error, filter }
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'ANALYTICS_EVENTS_FETCH_ERROR',
        `Unexpected error fetching analytics events: ${error.message}`,
        { error, filter }
      );
    }
  }

  /**
   * Get conversion events with filters
   */
  async getConversionEvents(filter: AnalyticsFilter): Promise<ConversionEvent[]> {
    try {
      let query = this.supabase
        .from('conversion_events')
        .select('*')
        .order('converted_at', { ascending: false });

      if (filter.user_id) {
        query = query.eq('user_id', filter.user_id);
      }

      if (filter.client_id) {
        query = query.eq('client_id', filter.client_id);
      }

      if (filter.event_type) {
        query = query.eq('conversion_type', filter.event_type);
      }

      if (filter.start_date) {
        query = query.gte('converted_at', filter.start_date.toISOString());
      }

      if (filter.end_date) {
        query = query.lte('converted_at', filter.end_date.toISOString());
      }

      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 100) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new AnalyticsServiceError(
          'CONVERSION_EVENTS_FETCH_FAILED',
          `Failed to fetch conversion events: ${error.message}`,
          { error, filter }
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'CONVERSION_EVENTS_FETCH_ERROR',
        `Unexpected error fetching conversion events: ${error.message}`,
        { error, filter }
      );
    }
  }

  /**
   * Get user analytics summary
   */
  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    try {
      // Get user's events
      const events = await this.getAnalyticsEvents({ user_id: userId });

      // Get user's conversions
      const conversions = await this.getConversionEvents({ user_id: userId });

      // Get user's segment memberships
      const segmentMemberships = await this.personalization.getUserSegmentMemberships(userId);

      // Get user's experiment assignments
      const experimentAssignments = await this.conversionOptimization.getUserExperimentAssignments(userId);

      const totalEvents = events.length;
      const totalConversions = conversions.length;
      const conversionRate = totalEvents > 0 ? (totalConversions / totalEvents) * 100 : 0;
      const segments = segmentMemberships.map(m => m.segment_id);
      const activeExperiments = experimentAssignments
        .filter(a => !a.converted_at)
        .map(a => a.experiment_id);

      const lastActivity = events.length > 0
        ? new Date(Math.max(...events.map(e => new Date(e.timestamp).getTime())))
        : new Date();

      return {
        user_id: userId,
        total_events: totalEvents,
        total_conversions: totalConversions,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        segments,
        active_experiments: activeExperiments,
        last_activity: lastActivity
      };
    } catch (error) {
      throw new AnalyticsServiceError(
        'USER_ANALYTICS_ERROR',
        `Unexpected error getting user analytics: ${error.message}`,
        { error, userId }
      );
    }
  }

  /**
   * Get client analytics summary
   */
  async getClientAnalytics(clientId: string): Promise<ClientAnalytics> {
    try {
      // Get client's users
      const { data: users, error: usersError } = await this.supabase
        .from('users')
        .select('id')
        .eq('id', clientId); // This would need to be adjusted based on actual client-user relationship

      if (usersError) {
        throw new AnalyticsServiceError(
          'CLIENT_USERS_FETCH_FAILED',
          `Failed to fetch client users: ${usersError.message}`,
          { error: usersError, clientId }
        );
      }

      // Get client's events
      const events = await this.getAnalyticsEvents({ client_id: clientId });

      // Get client's conversions
      const conversions = await this.getConversionEvents({ client_id: clientId });

      const totalUsers = users?.length || 0;
      const activeUsers = new Set(events.map(e => e.user_id)).size;
      const totalEvents = events.length;
      const totalConversions = conversions.length;
      const conversionRate = totalEvents > 0 ? (totalConversions / totalEvents) * 100 : 0;

      // Get top funnels (simplified)
      const funnelEvents = events.filter(e => e.event_type === 'funnel_step');
      const funnelStats = funnelEvents.reduce((acc, event) => {
        const funnelName = event.event_data?.funnel_name || 'unknown';
        if (!acc[funnelName]) {
          acc[funnelName] = { total: 0, completed: 0 };
        }
        acc[funnelName].total++;
        if (event.event_data?.completed) {
          acc[funnelName].completed++;
        }
        return acc;
      }, {} as Record<string, { total: number; completed: number }>);

      const topFunnels = Object.entries(funnelStats).map(([funnelName, stats]) => ({
        funnel_name: funnelName,
        completion_rate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
      })).sort((a, b) => b.completion_rate - a.completion_rate).slice(0, 5);

      // Get active experiments count (simplified)
      const activeExperiments = 0; // This would require more complex querying

      return {
        client_id: clientId,
        total_users: totalUsers,
        active_users: activeUsers,
        total_events: totalEvents,
        total_conversions: totalConversions,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        top_funnels: topFunnels,
        active_experiments: activeExperiments
      };
    } catch (error) {
      throw new AnalyticsServiceError(
        'CLIENT_ANALYTICS_ERROR',
        `Unexpected error getting client analytics: ${error.message}`,
        { error, clientId }
      );
    }
  }

  /**
   * Get analytics dashboard data
   */
  async getAnalyticsDashboard(clientId?: string): Promise<{
    total_events: number;
    total_conversions: number;
    conversion_rate: number;
    active_experiments: number;
    top_events: Array<{ event_type: string; count: number }>;
    conversion_trends: Array<{ date: string; conversions: number }>;
    funnel_performance: Array<{ funnel_name: string; completion_rate: number }>;
  }> {
    try {
      const filter: AnalyticsFilter = clientId ? { client_id: clientId } : {};

      // Get events and conversions
      const events = await this.getAnalyticsEvents(filter);
      const conversions = await this.getConversionEvents(filter);

      const totalEvents = events.length;
      const totalConversions = conversions.length;
      const conversionRate = totalEvents > 0 ? (totalConversions / totalEvents) * 100 : 0;

      // Get top events
      const eventCounts = events.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topEvents = Object.entries(eventCounts)
        .map(([event_type, count]) => ({ event_type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Get conversion trends (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentConversions = conversions.filter(c =>
        new Date(c.converted_at) >= thirtyDaysAgo
      );

      const conversionTrends = recentConversions.reduce((acc, conversion) => {
        const date = new Date(conversion.converted_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const conversionTrendsArray = Object.entries(conversionTrends)
        .map(([date, conversions]) => ({ date, conversions }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Get funnel performance
      const funnelEvents = events.filter(e => e.event_type === 'funnel_step');
      const funnelStats = funnelEvents.reduce((acc, event) => {
        const funnelName = event.event_data?.funnel_name || 'unknown';
        if (!acc[funnelName]) {
          acc[funnelName] = { total: 0, completed: 0 };
        }
        acc[funnelName].total++;
        if (event.event_data?.completed) {
          acc[funnelName].completed++;
        }
        return acc;
      }, {} as Record<string, { total: number; completed: number }>);

      const funnelPerformance = Object.entries(funnelStats).map(([funnel_name, stats]) => ({
        funnel_name,
        completion_rate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
      })).sort((a, b) => b.completion_rate - a.completion_rate);

      // Get active experiments count
      const activeExperiments = 0; // This would require querying the experiments table

      return {
        total_events: totalEvents,
        total_conversions: totalConversions,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        active_experiments: activeExperiments,
        top_events: topEvents,
        conversion_trends: conversionTrendsArray,
        funnel_performance: funnelPerformance
      };
    } catch (error) {
      throw new AnalyticsServiceError(
        'ANALYTICS_DASHBOARD_ERROR',
        `Unexpected error getting analytics dashboard: ${error.message}`,
        { error, clientId }
      );
    }
  }

  /**
   * Get service instances for direct access
   */
  getFunnelTracking(): FunnelTrackingService {
    return this.funnelTracking;
  }

  getConversionOptimization(): ConversionOptimizationService {
    return this.conversionOptimization;
  }

  getPersonalization(): PersonalizationService {
    return this.personalization;
  }
}
