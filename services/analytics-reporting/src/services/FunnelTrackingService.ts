/**
 * Funnel Tracking Service
 * Sub-feature 2.6.1: Onboarding Funnel Tracking (8 SP)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
    AnalyticsServiceError,
    CompleteFunnelStepRequest,
    CreateFunnelStepRequest,
    FunnelAnalyticsFilter,
    FunnelConversionRate,
    OnboardingFunnel
} from '../types/analytics';

export class FunnelTrackingService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Create a new funnel step for a user
   */
  async createFunnelStep(request: CreateFunnelStepRequest): Promise<OnboardingFunnel> {
    try {
      const { data, error } = await this.supabase
        .from('onboarding_funnels')
        .insert({
          user_id: request.user_id,
          client_id: request.client_id,
          funnel_name: request.funnel_name,
          step_number: request.step_number,
          step_name: request.step_name,
          step_description: request.step_description,
          time_spent_seconds: request.time_spent_seconds,
          metadata: request.metadata || {}
        })
        .select()
        .single();

      if (error) {
        throw new AnalyticsServiceError(
          'FUNNEL_STEP_CREATE_FAILED',
          `Failed to create funnel step: ${error.message}`,
          { error, request }
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'FUNNEL_STEP_CREATE_ERROR',
        `Unexpected error creating funnel step: ${error.message}`,
        { error, request }
      );
    }
  }

  /**
   * Complete a funnel step
   */
  async completeFunnelStep(request: CompleteFunnelStepRequest): Promise<OnboardingFunnel> {
    try {
      const { data, error } = await this.supabase
        .from('onboarding_funnels')
        .update({
          completed_at: new Date().toISOString(),
          time_spent_seconds: request.time_spent_seconds,
          metadata: request.metadata || {},
          updated_at: new Date().toISOString()
        })
        .eq('id', request.funnel_step_id)
        .select()
        .single();

      if (error) {
        throw new AnalyticsServiceError(
          'FUNNEL_STEP_COMPLETE_FAILED',
          `Failed to complete funnel step: ${error.message}`,
          { error, request }
        );
      }

      if (!data) {
        throw new AnalyticsServiceError(
          'FUNNEL_STEP_NOT_FOUND',
          `Funnel step with ID ${request.funnel_step_id} not found`,
          { request }
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'FUNNEL_STEP_COMPLETE_ERROR',
        `Unexpected error completing funnel step: ${error.message}`,
        { error, request }
      );
    }
  }

  /**
   * Get funnel steps for a user
   */
  async getUserFunnelSteps(userId: string, funnelName?: string): Promise<OnboardingFunnel[]> {
    try {
      let query = this.supabase
        .from('onboarding_funnels')
        .select('*')
        .eq('user_id', userId)
        .order('step_number', { ascending: true });

      if (funnelName) {
        query = query.eq('funnel_name', funnelName);
      }

      const { data, error } = await query;

      if (error) {
        throw new AnalyticsServiceError(
          'FUNNEL_STEPS_FETCH_FAILED',
          `Failed to fetch funnel steps: ${error.message}`,
          { error, userId, funnelName }
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'FUNNEL_STEPS_FETCH_ERROR',
        `Unexpected error fetching funnel steps: ${error.message}`,
        { error, userId, funnelName }
      );
    }
  }

  /**
   * Get funnel conversion rates
   */
  async getFunnelConversionRates(
    funnelName: string,
    startStep: number,
    endStep: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<FunnelConversionRate[]> {
    try {
      const { data, error } = await this.supabase.rpc('calculate_funnel_conversion_rate', {
        funnel_name_param: funnelName,
        start_step: startStep,
        end_step: endStep,
        start_date: startDate?.toISOString() || null,
        end_date: endDate?.toISOString() || null
      });

      if (error) {
        throw new AnalyticsServiceError(
          'FUNNEL_CONVERSION_RATE_FAILED',
          `Failed to calculate funnel conversion rate: ${error.message}`,
          { error, funnelName, startStep, endStep, startDate, endDate }
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'FUNNEL_CONVERSION_RATE_ERROR',
        `Unexpected error calculating funnel conversion rate: ${error.message}`,
        { error, funnelName, startStep, endStep, startDate, endDate }
      );
    }
  }

  /**
   * Get funnel analytics with filters
   */
  async getFunnelAnalytics(filter: FunnelAnalyticsFilter): Promise<OnboardingFunnel[]> {
    try {
      let query = this.supabase
        .from('onboarding_funnels')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter.funnel_name) {
        query = query.eq('funnel_name', filter.funnel_name);
      }

      if (filter.user_id) {
        query = query.eq('user_id', filter.user_id);
      }

      if (filter.client_id) {
        query = query.eq('client_id', filter.client_id);
      }

      if (filter.start_date) {
        query = query.gte('created_at', filter.start_date.toISOString());
      }

      if (filter.end_date) {
        query = query.lte('created_at', filter.end_date.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw new AnalyticsServiceError(
          'FUNNEL_ANALYTICS_FETCH_FAILED',
          `Failed to fetch funnel analytics: ${error.message}`,
          { error, filter }
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'FUNNEL_ANALYTICS_FETCH_ERROR',
        `Unexpected error fetching funnel analytics: ${error.message}`,
        { error, filter }
      );
    }
  }

  /**
   * Get funnel completion statistics
   */
  async getFunnelCompletionStats(funnelName: string): Promise<{
    total_users: number;
    completed_users: number;
    completion_rate: number;
    avg_time_to_complete: number;
    step_completion_rates: Array<{
      step_number: number;
      step_name: string;
      completion_rate: number;
    }>;
  }> {
    try {
      // Get total users who started the funnel
      const { data: totalUsers, error: totalError } = await this.supabase
        .from('onboarding_funnels')
        .select('user_id')
        .eq('funnel_name', funnelName)
        .eq('step_number', 1);

      if (totalError) {
        throw new AnalyticsServiceError(
          'FUNNEL_STATS_TOTAL_FAILED',
          `Failed to get total users: ${totalError.message}`,
          { error: totalError, funnelName }
        );
      }

      // Get completed users
      const { data: completedUsers, error: completedError } = await this.supabase
        .from('onboarding_funnels')
        .select('user_id')
        .eq('funnel_name', funnelName)
        .not('completed_at', 'is', null);

      if (completedError) {
        throw new AnalyticsServiceError(
          'FUNNEL_STATS_COMPLETED_FAILED',
          `Failed to get completed users: ${completedError.message}`,
          { error: completedError, funnelName }
        );
      }

      // Get step completion rates
      const { data: stepStats, error: stepError } = await this.supabase
        .from('onboarding_funnels')
        .select('step_number, step_name, completed_at')
        .eq('funnel_name', funnelName);

      if (stepError) {
        throw new AnalyticsServiceError(
          'FUNNEL_STATS_STEPS_FAILED',
          `Failed to get step statistics: ${stepError.message}`,
          { error: stepError, funnelName }
        );
      }

      const totalUsersCount = new Set(totalUsers?.map(u => u.user_id) || []).size;
      const completedUsersCount = new Set(completedUsers?.map(u => u.user_id) || []).size;
      const completionRate = totalUsersCount > 0 ? (completedUsersCount / totalUsersCount) * 100 : 0;

      // Calculate step completion rates
      const stepCompletionRates = stepStats?.reduce((acc, step) => {
        const existing = acc.find(s => s.step_number === step.step_number);
        if (existing) {
          existing.total++;
          if (step.completed_at) {
            existing.completed++;
          }
        } else {
          acc.push({
            step_number: step.step_number,
            step_name: step.step_name,
            total: 1,
            completed: step.completed_at ? 1 : 0
          });
        }
        return acc;
      }, [] as Array<{ step_number: number; step_name: string; total: number; completed: number }>) || [];

      const stepCompletionRatesFormatted = stepCompletionRates.map(step => ({
        step_number: step.step_number,
        step_name: step.step_name,
        completion_rate: step.total > 0 ? (step.completed / step.total) * 100 : 0
      }));

      // Calculate average time to complete (simplified)
      const avgTimeToComplete = 0; // This would require more complex calculation

      return {
        total_users: totalUsersCount,
        completed_users: completedUsersCount,
        completion_rate: Math.round(completionRate * 100) / 100,
        avg_time_to_complete: avgTimeToComplete,
        step_completion_rates: stepCompletionRatesFormatted
      };
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'FUNNEL_STATS_ERROR',
        `Unexpected error getting funnel completion stats: ${error.message}`,
        { error, funnelName }
      );
    }
  }

  /**
   * Track funnel step progress
   */
  async trackFunnelProgress(
    userId: string,
    clientId: string,
    funnelName: string,
    stepNumber: number,
    stepName: string,
    timeSpentSeconds?: number,
    metadata?: Record<string, any>
  ): Promise<OnboardingFunnel> {
    try {
      // Check if step already exists
      const { data: existingStep } = await this.supabase
        .from('onboarding_funnels')
        .select('*')
        .eq('user_id', userId)
        .eq('funnel_name', funnelName)
        .eq('step_number', stepNumber)
        .single();

      if (existingStep) {
        // Update existing step
        return await this.completeFunnelStep({
          funnel_step_id: existingStep.id,
          time_spent_seconds: timeSpentSeconds,
          metadata
        });
      } else {
        // Create new step
        return await this.createFunnelStep({
          user_id: userId,
          client_id: clientId,
          funnel_name: funnelName,
          step_number: stepNumber,
          step_name: stepName,
          time_spent_seconds: timeSpentSeconds,
          metadata
        });
      }
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'FUNNEL_PROGRESS_TRACK_ERROR',
        `Unexpected error tracking funnel progress: ${error.message}`,
        { error, userId, clientId, funnelName, stepNumber, stepName }
      );
    }
  }
}
