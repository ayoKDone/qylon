/**
 * Conversion Optimization Service
 * Sub-feature 2.6.2: Conversion Optimization (8 SP)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
    AnalyticsServiceError,
    ConversionExperiment,
    CreateExperimentRequest,
    CreateVariantRequest,
    ExperimentFilter,
    ExperimentResults,
    ExperimentVariant,
    UserExperimentAssignment
} from '../types/analytics';

export class ConversionOptimizationService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Create a new conversion experiment
   */
  async createExperiment(request: CreateExperimentRequest, createdBy: string): Promise<ConversionExperiment> {
    try {
      // Validate traffic percentages
      const totalTraffic = request.variants.reduce((sum, variant) => sum + variant.traffic_percentage, 0);
      if (Math.abs(totalTraffic - 100) > 0.01) {
        throw new AnalyticsServiceError(
          'INVALID_TRAFFIC_PERCENTAGES',
          'Total traffic percentage must equal 100%',
          { totalTraffic, variants: request.variants }
        );
      }

      // Check for control variant
      const hasControl = request.variants.some(v => v.is_control);
      if (!hasControl) {
        throw new AnalyticsServiceError(
          'MISSING_CONTROL_VARIANT',
          'At least one variant must be marked as control',
          { variants: request.variants }
        );
      }

      // Create experiment
      const { data: experiment, error: experimentError } = await this.supabase
        .from('conversion_experiments')
        .insert({
          name: request.name,
          description: request.description,
          experiment_type: request.experiment_type,
          target_audience: request.target_audience,
          success_metrics: request.success_metrics,
          configuration: request.configuration || {},
          created_by: createdBy,
          status: 'draft'
        })
        .select()
        .single();

      if (experimentError) {
        throw new AnalyticsServiceError(
          'EXPERIMENT_CREATE_FAILED',
          `Failed to create experiment: ${experimentError.message}`,
          { error: experimentError, request }
        );
      }

      // Create variants
      const variants = await this.createExperimentVariants(experiment.id, request.variants);

      return {
        ...experiment,
        variants
      } as ConversionExperiment & { variants: ExperimentVariant[] };
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'EXPERIMENT_CREATE_ERROR',
        `Unexpected error creating experiment: ${error.message}`,
        { error, request }
      );
    }
  }

  /**
   * Create experiment variants
   */
  private async createExperimentVariants(
    experimentId: string,
    variants: CreateVariantRequest[]
  ): Promise<ExperimentVariant[]> {
    try {
      const variantData = variants.map(variant => ({
        experiment_id: experimentId,
        variant_name: variant.variant_name,
        variant_description: variant.variant_description,
        traffic_percentage: variant.traffic_percentage,
        configuration: variant.configuration,
        is_control: variant.is_control || false
      }));

      const { data, error } = await this.supabase
        .from('experiment_variants')
        .insert(variantData)
        .select();

      if (error) {
        throw new AnalyticsServiceError(
          'VARIANT_CREATE_FAILED',
          `Failed to create variants: ${error.message}`,
          { error, experimentId, variants }
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'VARIANT_CREATE_ERROR',
        `Unexpected error creating variants: ${error.message}`,
        { error, experimentId, variants }
      );
    }
  }

  /**
   * Start an experiment
   */
  async startExperiment(experimentId: string): Promise<ConversionExperiment> {
    try {
      const { data, error } = await this.supabase
        .from('conversion_experiments')
        .update({
          status: 'active',
          start_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', experimentId)
        .select()
        .single();

      if (error) {
        throw new AnalyticsServiceError(
          'EXPERIMENT_START_FAILED',
          `Failed to start experiment: ${error.message}`,
          { error, experimentId }
        );
      }

      if (!data) {
        throw new AnalyticsServiceError(
          'EXPERIMENT_NOT_FOUND',
          `Experiment with ID ${experimentId} not found`,
          { experimentId }
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'EXPERIMENT_START_ERROR',
        `Unexpected error starting experiment: ${error.message}`,
        { error, experimentId }
      );
    }
  }

  /**
   * Stop an experiment
   */
  async stopExperiment(experimentId: string): Promise<ConversionExperiment> {
    try {
      const { data, error } = await this.supabase
        .from('conversion_experiments')
        .update({
          status: 'completed',
          end_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', experimentId)
        .select()
        .single();

      if (error) {
        throw new AnalyticsServiceError(
          'EXPERIMENT_STOP_FAILED',
          `Failed to stop experiment: ${error.message}`,
          { error, experimentId }
        );
      }

      if (!data) {
        throw new AnalyticsServiceError(
          'EXPERIMENT_NOT_FOUND',
          `Experiment with ID ${experimentId} not found`,
          { experimentId }
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'EXPERIMENT_STOP_ERROR',
        `Unexpected error stopping experiment: ${error.message}`,
        { error, experimentId }
      );
    }
  }

  /**
   * Assign user to experiment variant
   */
  async assignUserToExperiment(
    userId: string,
    experimentId: string
  ): Promise<UserExperimentAssignment> {
    try {
      // Check if user is already assigned
      const { data: existingAssignment } = await this.supabase
        .from('user_experiment_assignments')
        .select('*')
        .eq('user_id', userId)
        .eq('experiment_id', experimentId)
        .single();

      if (existingAssignment) {
        return existingAssignment;
      }

      // Get experiment variants
      const { data: variants, error: variantsError } = await this.supabase
        .from('experiment_variants')
        .select('*')
        .eq('experiment_id', experimentId)
        .order('is_control', { ascending: false });

      if (variantsError) {
        throw new AnalyticsServiceError(
          'VARIANT_FETCH_FAILED',
          `Failed to fetch variants: ${variantsError.message}`,
          { error: variantsError, experimentId }
        );
      }

      if (!variants || variants.length === 0) {
        throw new AnalyticsServiceError(
          'NO_VARIANTS_FOUND',
          `No variants found for experiment ${experimentId}`,
          { experimentId }
        );
      }

      // Assign user to variant based on traffic percentage
      const assignedVariant = this.selectVariantForUser(userId, variants);

      const { data, error } = await this.supabase
        .from('user_experiment_assignments')
        .insert({
          user_id: userId,
          experiment_id: experimentId,
          variant_id: assignedVariant.id,
          assigned_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new AnalyticsServiceError(
          'USER_ASSIGNMENT_FAILED',
          `Failed to assign user to experiment: ${error.message}`,
          { error, userId, experimentId, assignedVariant }
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'USER_ASSIGNMENT_ERROR',
        `Unexpected error assigning user to experiment: ${error.message}`,
        { error, userId, experimentId }
      );
    }
  }

  /**
   * Select variant for user based on traffic percentage
   */
  private selectVariantForUser(userId: string, variants: ExperimentVariant[]): ExperimentVariant {
    // Use user ID hash for consistent assignment
    const hash = this.hashString(userId);
    const random = Math.abs(hash) % 100;

    let cumulativePercentage = 0;
    for (const variant of variants) {
      cumulativePercentage += variant.traffic_percentage;
      if (random < cumulativePercentage) {
        return variant;
      }
    }

    // Fallback to control variant
    return variants.find(v => v.is_control) || variants[0];
  }

  /**
   * Simple hash function for consistent user assignment
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  /**
   * Get experiment results
   */
  async getExperimentResults(experimentId: string): Promise<ExperimentResults[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_experiment_results', {
        experiment_id_param: experimentId
      });

      if (error) {
        throw new AnalyticsServiceError(
          'EXPERIMENT_RESULTS_FAILED',
          `Failed to get experiment results: ${error.message}`,
          { error, experimentId }
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'EXPERIMENT_RESULTS_ERROR',
        `Unexpected error getting experiment results: ${error.message}`,
        { error, experimentId }
      );
    }
  }

  /**
   * Get experiments with filters
   */
  async getExperiments(filter: ExperimentFilter): Promise<ConversionExperiment[]> {
    try {
      let query = this.supabase
        .from('conversion_experiments')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter.status) {
        query = query.eq('status', filter.status);
      }

      if (filter.experiment_type) {
        query = query.eq('experiment_type', filter.experiment_type);
      }

      if (filter.created_by) {
        query = query.eq('created_by', filter.created_by);
      }

      if (filter.start_date) {
        query = query.gte('start_date', filter.start_date.toISOString());
      }

      if (filter.end_date) {
        query = query.lte('end_date', filter.end_date.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw new AnalyticsServiceError(
          'EXPERIMENTS_FETCH_FAILED',
          `Failed to fetch experiments: ${error.message}`,
          { error, filter }
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'EXPERIMENTS_FETCH_ERROR',
        `Unexpected error fetching experiments: ${error.message}`,
        { error, filter }
      );
    }
  }

  /**
   * Get user's experiment assignments
   */
  async getUserExperimentAssignments(userId: string): Promise<UserExperimentAssignment[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_experiment_assignments')
        .select(`
          *,
          conversion_experiments!inner(*),
          experiment_variants!inner(*)
        `)
        .eq('user_id', userId);

      if (error) {
        throw new AnalyticsServiceError(
          'USER_ASSIGNMENTS_FETCH_FAILED',
          `Failed to fetch user experiment assignments: ${error.message}`,
          { error, userId }
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'USER_ASSIGNMENTS_FETCH_ERROR',
        `Unexpected error fetching user experiment assignments: ${error.message}`,
        { error, userId }
      );
    }
  }

  /**
   * Track conversion for user in experiment
   */
  async trackConversion(
    userId: string,
    experimentId: string,
    conversionValue?: number,
    metadata?: Record<string, any>
  ): Promise<UserExperimentAssignment> {
    try {
      const { data, error } = await this.supabase
        .from('user_experiment_assignments')
        .update({
          converted_at: new Date().toISOString(),
          conversion_value: conversionValue,
          metadata: metadata || {},
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('experiment_id', experimentId)
        .select()
        .single();

      if (error) {
        throw new AnalyticsServiceError(
          'CONVERSION_TRACK_FAILED',
          `Failed to track conversion: ${error.message}`,
          { error, userId, experimentId, conversionValue }
        );
      }

      if (!data) {
        throw new AnalyticsServiceError(
          'USER_ASSIGNMENT_NOT_FOUND',
          `User assignment not found for user ${userId} in experiment ${experimentId}`,
          { userId, experimentId }
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'CONVERSION_TRACK_ERROR',
        `Unexpected error tracking conversion: ${error.message}`,
        { error, userId, experimentId, conversionValue }
      );
    }
  }

  /**
   * Get experiment performance metrics
   */
  async getExperimentPerformanceMetrics(experimentId: string): Promise<{
    total_users: number;
    total_conversions: number;
    overall_conversion_rate: number;
    statistical_significance: number;
    confidence_interval: {
      lower: number;
      upper: number;
    };
    variants: ExperimentResults[];
  }> {
    try {
      const results = await this.getExperimentResults(experimentId);

      const totalUsers = results.reduce((sum, variant) => sum + variant.users_assigned, 0);
      const totalConversions = results.reduce((sum, variant) => sum + variant.users_converted, 0);
      const overallConversionRate = totalUsers > 0 ? (totalConversions / totalUsers) * 100 : 0;

      // Simplified statistical significance calculation
      const statisticalSignificance = this.calculateStatisticalSignificance(results);
      const confidenceInterval = this.calculateConfidenceInterval(results);

      return {
        total_users: totalUsers,
        total_conversions: totalConversions,
        overall_conversion_rate: Math.round(overallConversionRate * 100) / 100,
        statistical_significance: statisticalSignificance,
        confidence_interval: confidenceInterval,
        variants: results
      };
    } catch (error) {
      if (error instanceof AnalyticsServiceError) {
        throw error;
      }
      throw new AnalyticsServiceError(
        'EXPERIMENT_METRICS_ERROR',
        `Unexpected error getting experiment performance metrics: ${error.message}`,
        { error, experimentId }
      );
    }
  }

  /**
   * Calculate statistical significance (simplified)
   */
  private calculateStatisticalSignificance(results: ExperimentResults[]): number {
    // Simplified calculation - in production, use proper statistical tests
    const control = results.find(r => r.is_control);
    const variants = results.filter(r => !r.is_control);

    if (!control || variants.length === 0) {
      return 0;
    }

    // Basic significance calculation
    const controlRate = control.conversion_rate / 100;
    const variantRates = variants.map(v => v.conversion_rate / 100);

    // Simplified p-value calculation
    const maxVariantRate = Math.max(...variantRates);
    const difference = Math.abs(maxVariantRate - controlRate);

    // Rough significance based on difference and sample size
    const significance = Math.min(difference * 10, 1);
    return Math.round(significance * 100) / 100;
  }

  /**
   * Calculate confidence interval (simplified)
   */
  private calculateConfidenceInterval(results: ExperimentResults[]): { lower: number; upper: number } {
    const control = results.find(r => r.is_control);
    if (!control) {
      return { lower: 0, upper: 0 };
    }

    const rate = control.conversion_rate / 100;
    const n = control.users_assigned;

    // Simplified 95% confidence interval
    const margin = 1.96 * Math.sqrt((rate * (1 - rate)) / n);

    return {
      lower: Math.max(0, (rate - margin) * 100),
      upper: Math.min(100, (rate + margin) * 100)
    };
  }
}
