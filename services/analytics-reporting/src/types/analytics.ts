/**
 * Analytics & A/B Testing Backend Types
 * Feature 2.6: Analytics & A/B Testing Backend (21 SP)
 */

export interface OnboardingFunnel {
  id: string;
  user_id: string;
  client_id: string;
  funnel_name: string;
  step_number: number;
  step_name: string;
  step_description?: string;
  completed_at?: Date;
  time_spent_seconds?: number;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface ConversionExperiment {
  id: string;
  name: string;
  description?: string;
  experiment_type: 'onboarding' | 'feature_adoption' | 'retention' | 'conversion';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_date?: Date;
  end_date?: Date;
  target_audience: Record<string, any>;
  success_metrics: Record<string, any>;
  configuration: Record<string, any>;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface ExperimentVariant {
  id: string;
  experiment_id: string;
  variant_name: string;
  variant_description?: string;
  traffic_percentage: number;
  configuration: Record<string, any>;
  is_control: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserExperimentAssignment {
  id: string;
  user_id: string;
  experiment_id: string;
  variant_id: string;
  assigned_at: Date;
  first_interaction_at?: Date;
  converted_at?: Date;
  conversion_value?: number;
  metadata: Record<string, any>;
}

export interface PersonalizationTrigger {
  id: string;
  name: string;
  description?: string;
  trigger_type: 'user_behavior' | 'time_based' | 'event_based' | 'segment_based';
  conditions: Record<string, any>;
  actions: Record<string, any>;
  priority: number;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserSegment {
  id: string;
  name: string;
  description?: string;
  segment_criteria: Record<string, any>;
  user_count: number;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserSegmentMembership {
  id: string;
  user_id: string;
  segment_id: string;
  joined_at: Date;
  metadata: Record<string, any>;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  client_id: string;
  event_type: string;
  event_name: string;
  event_data: Record<string, any>;
  session_id?: string;
  page_url?: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  timestamp: Date;
  created_at: Date;
}

export interface ConversionEvent {
  id: string;
  user_id: string;
  client_id: string;
  conversion_type: string;
  conversion_value?: number;
  experiment_id?: string;
  variant_id?: string;
  funnel_step_id?: string;
  metadata: Record<string, any>;
  converted_at: Date;
  created_at: Date;
}

// Request/Response DTOs
export interface CreateFunnelStepRequest {
  user_id: string;
  client_id: string;
  funnel_name: string;
  step_number: number;
  step_name: string;
  step_description?: string;
  time_spent_seconds?: number;
  metadata?: Record<string, any>;
}

export interface CompleteFunnelStepRequest {
  funnel_step_id: string;
  time_spent_seconds?: number;
  metadata?: Record<string, any>;
}

export interface CreateExperimentRequest {
  name: string;
  description?: string;
  experiment_type: 'onboarding' | 'feature_adoption' | 'retention' | 'conversion';
  target_audience: Record<string, any>;
  success_metrics: Record<string, any>;
  configuration?: Record<string, any>;
  variants: CreateVariantRequest[];
}

export interface CreateVariantRequest {
  variant_name: string;
  variant_description?: string;
  traffic_percentage: number;
  configuration: Record<string, any>;
  is_control?: boolean;
}

export interface CreatePersonalizationTriggerRequest {
  name: string;
  description?: string;
  trigger_type: 'user_behavior' | 'time_based' | 'event_based' | 'segment_based';
  conditions: Record<string, any>;
  actions: Record<string, any>;
  priority?: number;
}

export interface CreateUserSegmentRequest {
  name: string;
  description?: string;
  segment_criteria: Record<string, any>;
}

export interface TrackEventRequest {
  user_id: string;
  client_id: string;
  event_type: string;
  event_name: string;
  event_data?: Record<string, any>;
  session_id?: string;
  page_url?: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
}

export interface TrackConversionRequest {
  user_id: string;
  client_id: string;
  conversion_type: string;
  conversion_value?: number;
  experiment_id?: string;
  variant_id?: string;
  funnel_step_id?: string;
  metadata?: Record<string, any>;
}

// Analytics Response Types
export interface FunnelConversionRate {
  funnel_name: string;
  start_step: number;
  end_step: number;
  users_started: number;
  users_completed: number;
  conversion_rate: number;
}

export interface ExperimentResults {
  variant_name: string;
  users_assigned: number;
  users_converted: number;
  conversion_rate: number;
  avg_conversion_value: number;
  is_control: boolean;
}

export interface UserAnalytics {
  user_id: string;
  total_events: number;
  total_conversions: number;
  conversion_rate: number;
  segments: string[];
  active_experiments: string[];
  last_activity: Date;
}

export interface ClientAnalytics {
  client_id: string;
  total_users: number;
  active_users: number;
  total_events: number;
  total_conversions: number;
  conversion_rate: number;
  top_funnels: Array<{
    funnel_name: string;
    completion_rate: number;
  }>;
  active_experiments: number;
}

// Filter and Query Types
export interface AnalyticsFilter {
  user_id?: string;
  client_id?: string;
  event_type?: string;
  start_date?: Date;
  end_date?: Date;
  limit?: number;
  offset?: number;
}

export interface FunnelAnalyticsFilter {
  funnel_name?: string;
  user_id?: string;
  client_id?: string;
  start_date?: Date;
  end_date?: Date;
}

export interface ExperimentFilter {
  id?: string;
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  experiment_type?: 'onboarding' | 'feature_adoption' | 'retention' | 'conversion';
  created_by?: string;
  start_date?: Date;
  end_date?: Date;
}

// Error Types
export interface AnalyticsError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export class AnalyticsServiceError extends Error {
  public code: string;
  public details?: Record<string, any>;

  constructor(code: string, message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'AnalyticsServiceError';
    this.code = code;
    this.details = details;
  }
}

// Validation Schemas
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface AnalyticsConfig {
  supabaseUrl: string;
  supabaseKey: string;
  enableEventTracking: boolean;
  enableConversionTracking: boolean;
  enablePersonalization: boolean;
  maxEventsPerUser: number;
  eventRetentionDays: number;
}
