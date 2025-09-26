/**
 * A/B Testing Service for Qylon Platform
 *
 * Core service for managing A/B tests, user assignments, and analytics.
 * Provides experiment management, user segmentation, and statistical analysis.
 */

import {
  Experiment,
  ExperimentAnalytics,
  ExperimentAnalyticsRequest,
  ExperimentAnalyticsResponse,
  ExperimentAssignmentRequest,
  ExperimentAssignmentResponse,
  ExperimentCreateRequest,
  ExperimentEventRequest,
  ExperimentReport,
  ExperimentResult,
  ExperimentSummary,
  ExperimentUpdateRequest,
  TargetAudience,
  UserAssignment,
  Variant,
  VariantReport,
} from './types';

export class ExperimentService {
  private experiments: Map<string, Experiment> = new Map();
  private assignments: Map<string, UserAssignment> = new Map();
  private results: Map<string, ExperimentResult[]> = new Map();
  private analytics: Map<string, ExperimentAnalytics[]> = new Map();

  constructor() {
    this.initializeDefaultExperiments();
  }

  /**
   * Create a new experiment
   */
  async createExperiment(
    request: ExperimentCreateRequest
  ): Promise<Experiment> {
    const experiment: Experiment = {
      id: this.generateId(),
      name: request.name,
      description: request.description,
      status: 'draft',
      startDate: request.startDate,
      endDate: request.endDate,
      variants: request.variants.map(v => ({ ...v, id: this.generateId() })),
      targetAudience: request.targetAudience,
      metrics: request.metrics.map(m => ({ ...m, id: this.generateId() })),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system', // TODO: Get from auth context
    };

    this.experiments.set(experiment.id, experiment);
    return experiment;
  }

  /**
   * Update an existing experiment
   */
  async updateExperiment(
    experimentId: string,
    request: ExperimentUpdateRequest
  ): Promise<Experiment> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    const updatedExperiment: Experiment = {
      ...experiment,
      ...request,
      updatedAt: new Date(),
    };

    this.experiments.set(experimentId, updatedExperiment);
    return updatedExperiment;
  }

  /**
   * Get an experiment by ID
   */
  async getExperiment(experimentId: string): Promise<Experiment | null> {
    return this.experiments.get(experimentId) || null;
  }

  /**
   * List all experiments with filtering and pagination
   */
  async listExperiments(
    filters?: any,
    pagination?: any
  ): Promise<Experiment[]> {
    let experiments = Array.from(this.experiments.values());

    // Apply filters
    if (filters) {
      if (filters.status) {
        experiments = experiments.filter(e =>
          filters.status.includes(e.status)
        );
      }
      if (filters.createdBy) {
        experiments = experiments.filter(e =>
          filters.createdBy.includes(e.createdBy)
        );
      }
      if (filters.startDate) {
        experiments = experiments.filter(e => e.startDate >= filters.startDate);
      }
      if (filters.endDate) {
        experiments = experiments.filter(e => e.endDate <= filters.endDate);
      }
    }

    // Apply pagination
    if (pagination) {
      const start = (pagination.page - 1) * pagination.limit;
      const end = start + pagination.limit;
      experiments = experiments.slice(start, end);
    }

    return experiments;
  }

  /**
   * Start an experiment
   */
  async startExperiment(experimentId: string): Promise<Experiment> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    if (experiment.status !== 'draft') {
      throw new Error(
        `Experiment ${experimentId} cannot be started from status ${experiment.status}`
      );
    }

    const updatedExperiment: Experiment = {
      ...experiment,
      status: 'running',
      startDate: new Date(),
      updatedAt: new Date(),
    };

    this.experiments.set(experimentId, updatedExperiment);
    return updatedExperiment;
  }

  /**
   * Pause an experiment
   */
  async pauseExperiment(experimentId: string): Promise<Experiment> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    if (experiment.status !== 'running') {
      throw new Error(
        `Experiment ${experimentId} cannot be paused from status ${experiment.status}`
      );
    }

    const updatedExperiment: Experiment = {
      ...experiment,
      status: 'paused',
      updatedAt: new Date(),
    };

    this.experiments.set(experimentId, updatedExperiment);
    return updatedExperiment;
  }

  /**
   * Complete an experiment
   */
  async completeExperiment(experimentId: string): Promise<Experiment> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    if (experiment.status !== 'running' && experiment.status !== 'paused') {
      throw new Error(
        `Experiment ${experimentId} cannot be completed from status ${experiment.status}`
      );
    }

    const updatedExperiment: Experiment = {
      ...experiment,
      status: 'completed',
      endDate: new Date(),
      updatedAt: new Date(),
    };

    this.experiments.set(experimentId, updatedExperiment);
    return updatedExperiment;
  }

  /**
   * Assign a user to an experiment variant
   */
  async assignUser(
    request: ExperimentAssignmentRequest
  ): Promise<ExperimentAssignmentResponse> {
    const experiment = this.experiments.get(request.experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${request.experimentId} not found`);
    }

    if (experiment.status !== 'running') {
      throw new Error(`Experiment ${request.experimentId} is not running`);
    }

    // Check if user is already assigned
    const existingAssignment = this.assignments.get(
      `${request.userId}:${request.experimentId}`
    );
    if (existingAssignment) {
      return {
        userId: existingAssignment.userId,
        experimentId: existingAssignment.experimentId,
        variantId: existingAssignment.variantId,
        assignedAt: existingAssignment.assignedAt,
        sessionId: request.sessionId,
        metadata: existingAssignment.metadata,
      };
    }

    // Check if user meets target audience criteria
    if (
      !this.isUserInTargetAudience(request.userId, experiment.targetAudience)
    ) {
      throw new Error(
        `User ${request.userId} does not meet target audience criteria`
      );
    }

    // Assign user to variant based on weights
    const variant = this.selectVariant(experiment.variants);

    const assignment: UserAssignment = {
      userId: request.userId,
      experimentId: request.experimentId,
      variantId: variant.id,
      assignedAt: new Date(),
      sessionId: request.sessionId,
      metadata: request.metadata,
    };

    this.assignments.set(
      `${request.userId}:${request.experimentId}`,
      assignment
    );

    return {
      userId: assignment.userId,
      experimentId: assignment.experimentId,
      variantId: assignment.variantId,
      assignedAt: assignment.assignedAt,
      sessionId: assignment.sessionId,
      metadata: assignment.metadata,
    };
  }

  /**
   * Record an experiment event
   */
  async recordEvent(request: ExperimentEventRequest): Promise<void> {
    const assignment = this.assignments.get(
      `${request.userId}:${request.experimentId}`
    );
    if (!assignment) {
      throw new Error(
        `User ${request.userId} is not assigned to experiment ${request.experimentId}`
      );
    }

    if (assignment.variantId !== request.variantId) {
      throw new Error(
        `Variant mismatch for user ${request.userId} in experiment ${request.experimentId}`
      );
    }

    const result: ExperimentResult = {
      experimentId: request.experimentId,
      variantId: request.variantId,
      userId: request.userId,
      sessionId: request.sessionId,
      timestamp: new Date(),
      events: [request.event],
      conversionValue: request.event.value,
      metadata: request.metadata,
    };

    const existingResults = this.results.get(request.experimentId) || [];
    existingResults.push(result);
    this.results.set(request.experimentId, existingResults);
  }

  /**
   * Get experiment analytics
   */
  async getAnalytics(
    request: ExperimentAnalyticsRequest
  ): Promise<ExperimentAnalyticsResponse> {
    const experiment = this.experiments.get(request.experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${request.experimentId} not found`);
    }

    const results = this.results.get(request.experimentId) || [];
    const analytics = this.calculateAnalytics(experiment, results, request);
    const summary = this.calculateSummary(experiment, analytics);

    return {
      experimentId: request.experimentId,
      analytics,
      summary,
      generatedAt: new Date(),
    };
  }

  /**
   * Generate experiment report
   */
  async generateReport(experimentId: string): Promise<ExperimentReport> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    const results = this.results.get(experimentId) || [];
    const analytics = this.calculateAnalytics(experiment, results);
    const summary = this.calculateSummary(experiment, analytics);
    const variantReports = this.calculateVariantReports(experiment, analytics);
    const recommendations = this.generateRecommendations(
      experiment,
      analytics,
      summary
    );

    return {
      experimentId,
      name: experiment.name,
      status: experiment.status === 'draft' ? 'paused' : experiment.status,
      startDate: experiment.startDate,
      endDate: experiment.endDate,
      variants: variantReports,
      summary,
      recommendations,
      generatedAt: new Date(),
    };
  }

  /**
   * Check if user meets target audience criteria
   */
  private isUserInTargetAudience(
    _userId: string,
    _targetAudience: TargetAudience
  ): boolean {
    // TODO: Implement user segmentation logic
    // This would check user properties, behavior patterns, demographics, etc.
    return true; // Simplified for now
  }

  /**
   * Select variant based on weights
   */
  private selectVariant(variants: Variant[]): Variant {
    const totalWeight = variants.reduce(
      (sum, variant) => sum + variant.weight,
      0
    );
    const random = Math.random() * totalWeight;

    let currentWeight = 0;
    for (const variant of variants) {
      currentWeight += variant.weight;
      if (random <= currentWeight) {
        return variant;
      }
    }

    return variants[0]; // Fallback
  }

  /**
   * Calculate experiment analytics
   */
  private calculateAnalytics(
    experiment: Experiment,
    results: ExperimentResult[],
    _request?: ExperimentAnalyticsRequest
  ): ExperimentAnalytics[] {
    const analytics: ExperimentAnalytics[] = [];

    for (const variant of experiment.variants) {
      const variantResults = results.filter(r => r.variantId === variant.id);
      const users = new Set(variantResults.map(r => r.userId));
      const sessions = new Set(variantResults.map(r => r.sessionId));
      const conversions = variantResults.filter(r =>
        r.events.some(e => e.type === 'conversion')
      );
      const revenue = variantResults.reduce(
        (sum, r) => sum + (r.conversionValue || 0),
        0
      );

      const analyticsData: ExperimentAnalytics = {
        experimentId: experiment.id,
        variantId: variant.id,
        totalUsers: users.size,
        totalSessions: sessions.size,
        conversions: conversions.length,
        conversionRate:
          users.size > 0 ? (conversions.length / users.size) * 100 : 0,
        averageSessionDuration:
          this.calculateAverageSessionDuration(variantResults),
        bounceRate: this.calculateBounceRate(variantResults),
        revenue,
        confidence: this.calculateConfidence(variantResults),
        statisticalSignificance: this.calculateStatisticalSignificance(
          experiment,
          variantResults
        ),
        startDate: experiment.startDate,
        endDate: experiment.endDate,
      };

      analytics.push(analyticsData);
    }

    return analytics;
  }

  /**
   * Calculate experiment summary
   */
  private calculateSummary(
    experiment: Experiment,
    analytics: ExperimentAnalytics[]
  ): ExperimentSummary {
    const totalUsers = analytics.reduce((sum, a) => sum + a.totalUsers, 0);
    const totalSessions = analytics.reduce(
      (sum, a) => sum + a.totalSessions,
      0
    );
    const totalConversions = analytics.reduce(
      (sum, a) => sum + a.conversions,
      0
    );
    const overallConversionRate =
      totalUsers > 0 ? (totalConversions / totalUsers) * 100 : 0;

    const bestPerformingVariant = analytics.reduce((best, current) =>
      current.conversionRate > best.conversionRate ? current : best
    );

    const duration = Math.ceil(
      (experiment.endDate.getTime() - experiment.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return {
      totalUsers,
      totalSessions,
      totalConversions,
      overallConversionRate,
      bestPerformingVariant: bestPerformingVariant.variantId,
      statisticalSignificance: analytics.some(a => a.statisticalSignificance),
      confidence: Math.max(...analytics.map(a => a.confidence)),
      duration,
      status: experiment.status === 'draft' ? 'paused' : experiment.status,
    };
  }

  /**
   * Calculate variant reports
   */
  private calculateVariantReports(
    experiment: Experiment,
    analytics: ExperimentAnalytics[]
  ): VariantReport[] {
    const controlVariant = experiment.variants.find(v => v.isControl);
    const controlAnalytics = controlVariant
      ? analytics.find(a => a.variantId === controlVariant.id)
      : null;

    return analytics.map(analyticsData => {
      const variant = experiment.variants.find(
        v => v.id === analyticsData.variantId
      )!;
      const improvement =
        controlAnalytics && controlAnalytics.conversionRate > 0
          ? ((analyticsData.conversionRate - controlAnalytics.conversionRate) /
              controlAnalytics.conversionRate) *
            100
          : 0;

      return {
        variantId: analyticsData.variantId,
        name: variant.name,
        isControl: variant.isControl,
        users: analyticsData.totalUsers,
        sessions: analyticsData.totalSessions,
        conversions: analyticsData.conversions,
        conversionRate: analyticsData.conversionRate,
        averageSessionDuration: analyticsData.averageSessionDuration,
        bounceRate: analyticsData.bounceRate,
        revenue: analyticsData.revenue,
        confidence: analyticsData.confidence,
        statisticalSignificance: analyticsData.statisticalSignificance,
        improvement,
      };
    });
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    experiment: Experiment,
    analytics: ExperimentAnalytics[],
    summary: ExperimentSummary
  ): string[] {
    const recommendations: string[] = [];

    if (!summary.statisticalSignificance) {
      recommendations.push(
        'Experiment needs more data to reach statistical significance'
      );
    }

    if (summary.totalUsers < 100) {
      recommendations.push(
        'Consider increasing sample size for more reliable results'
      );
    }

    const bestVariant = analytics.reduce((best, current) =>
      current.conversionRate > best.conversionRate ? current : best
    );

    if (bestVariant.conversionRate > 0) {
      recommendations.push(
        `Variant ${bestVariant.variantId} shows the best performance`
      );
    }

    if (summary.duration < 7) {
      recommendations.push(
        'Consider running the experiment for at least 7 days'
      );
    }

    return recommendations;
  }

  /**
   * Calculate average session duration
   */
  private calculateAverageSessionDuration(results: ExperimentResult[]): number {
    // Simplified calculation
    return results.length > 0 ? 300 : 0; // 5 minutes average
  }

  /**
   * Calculate bounce rate
   */
  private calculateBounceRate(results: ExperimentResult[]): number {
    // Simplified calculation
    return results.length > 0 ? 0.3 : 0; // 30% bounce rate
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidence(results: ExperimentResult[]): number {
    // Simplified calculation
    return results.length > 100 ? 0.95 : 0.8;
  }

  /**
   * Calculate statistical significance
   */
  private calculateStatisticalSignificance(
    experiment: Experiment,
    results: ExperimentResult[]
  ): boolean {
    // Simplified calculation
    return results.length > 1000;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Initialize default experiments
   */
  private initializeDefaultExperiments(): void {
    // TODO: Load default experiments from configuration
  }
}
