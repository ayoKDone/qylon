/**
 * A/B Testing Types for Qylon Platform
 *
 * Type definitions for A/B testing infrastructure.
 * Supports experiment management, user segmentation, and analytics.
 */

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: ExperimentStatus;
  startDate: Date;
  endDate: Date;
  variants: Variant[];
  targetAudience: TargetAudience;
  metrics: Metric[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Variant {
  id: string;
  name: string;
  description: string;
  weight: number; // Percentage (0-100)
  configuration: Record<string, any>;
  isControl: boolean;
}

export interface TargetAudience {
  userSegments: UserSegment[];
  conditions: Condition[];
  percentage: number; // Percentage of users to include (0-100)
}

export interface UserSegment {
  id: string;
  name: string;
  criteria: SegmentCriteria;
}

export interface SegmentCriteria {
  userProperties?: Record<string, any>;
  behaviorPatterns?: BehaviorPattern[];
  demographics?: Demographics;
  customAttributes?: Record<string, any>;
}

export interface BehaviorPattern {
  type: 'page_views' | 'time_on_site' | 'conversion_events' | 'custom';
  condition: 'greater_than' | 'less_than' | 'equals' | 'contains';
  value: any;
  timeframe?: string; // e.g., '7d', '30d'
}

export interface Demographics {
  ageRange?: [number, number];
  location?: string[];
  deviceType?: ('desktop' | 'mobile' | 'tablet')[];
  browser?: string[];
  language?: string[];
}

export interface Condition {
  type: 'user_property' | 'behavior' | 'demographic' | 'custom';
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'less_than'
    | 'contains'
    | 'in'
    | 'not_in';
  value: any;
}

export interface Metric {
  id: string;
  name: string;
  type: MetricType;
  description: string;
  primary: boolean;
  targetValue?: number;
  unit?: string;
}

export interface MetricType {
  type: 'conversion' | 'engagement' | 'revenue' | 'custom';
  eventName?: string;
  property?: string;
  aggregation?: 'count' | 'sum' | 'average' | 'median' | 'percentile';
}

export interface ExperimentResult {
  experimentId: string;
  variantId: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  events: ExperimentEvent[];
  conversionValue?: number;
  metadata?: Record<string, any>;
}

export interface ExperimentEvent {
  type: 'exposure' | 'conversion' | 'engagement' | 'custom';
  eventName: string;
  timestamp: Date;
  properties?: Record<string, any>;
  value?: number;
}

export interface ExperimentAnalytics {
  experimentId: string;
  variantId: string;
  totalUsers: number;
  totalSessions: number;
  conversions: number;
  conversionRate: number;
  averageSessionDuration: number;
  bounceRate: number;
  revenue: number;
  confidence: number;
  statisticalSignificance: boolean;
  startDate: Date;
  endDate: Date;
}

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  status: ExperimentStatus;
  variants: Variant[];
  targetAudience: TargetAudience;
  metrics: Metric[];
  startDate: Date;
  endDate: Date;
  minSampleSize: number;
  maxDuration: number; // in days
  confidenceLevel: number; // 0.95, 0.99, etc.
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface UserAssignment {
  userId: string;
  experimentId: string;
  variantId: string;
  assignedAt: Date;
  sessionId: string;
  metadata?: Record<string, any>;
}

export interface ExperimentSession {
  sessionId: string;
  userId: string;
  experimentId: string;
  variantId: string;
  startTime: Date;
  endTime?: Date;
  events: ExperimentEvent[];
  conversionValue?: number;
  metadata?: Record<string, any>;
}

export interface ExperimentReport {
  experimentId: string;
  name: string;
  status: ExperimentStatus;
  startDate: Date;
  endDate: Date;
  variants: VariantReport[];
  summary: ExperimentSummary;
  recommendations: string[];
  generatedAt: Date;
}

export interface VariantReport {
  variantId: string;
  name: string;
  isControl: boolean;
  users: number;
  sessions: number;
  conversions: number;
  conversionRate: number;
  averageSessionDuration: number;
  bounceRate: number;
  revenue: number;
  confidence: number;
  statisticalSignificance: boolean;
  improvement: number; // Percentage improvement over control
}

export interface ExperimentSummary {
  totalUsers: number;
  totalSessions: number;
  totalConversions: number;
  overallConversionRate: number;
  bestPerformingVariant: string;
  statisticalSignificance: boolean;
  confidence: number;
  duration: number; // in days
  status: 'running' | 'completed' | 'paused' | 'cancelled';
}

export interface ExperimentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'onboarding' | 'conversion' | 'engagement' | 'retention' | 'custom';
  variants: VariantTemplate[];
  metrics: MetricTemplate[];
  targetAudience: TargetAudienceTemplate;
  configuration: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface VariantTemplate {
  id: string;
  name: string;
  description: string;
  weight: number;
  configuration: Record<string, any>;
  isControl: boolean;
}

export interface MetricTemplate {
  id: string;
  name: string;
  type: MetricType;
  description: string;
  primary: boolean;
  targetValue?: number;
  unit?: string;
}

export interface TargetAudienceTemplate {
  userSegments: UserSegmentTemplate[];
  conditions: ConditionTemplate[];
  percentage: number;
}

export interface UserSegmentTemplate {
  id: string;
  name: string;
  criteria: SegmentCriteria;
}

export interface ConditionTemplate {
  type: 'user_property' | 'behavior' | 'demographic' | 'custom';
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'less_than'
    | 'contains'
    | 'in'
    | 'not_in';
  value: any;
}

export type ExperimentStatus =
  | 'draft'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled';

export interface ExperimentFilters {
  status?: ExperimentStatus[];
  createdBy?: string[];
  startDate?: Date;
  endDate?: Date;
  category?: string[];
  tags?: string[];
}

export interface ExperimentSort {
  field:
    | 'name'
    | 'status'
    | 'startDate'
    | 'endDate'
    | 'createdAt'
    | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface ExperimentPagination {
  page: number;
  limit: number;
  total?: number;
}

export interface ExperimentListResponse {
  experiments: Experiment[];
  pagination: ExperimentPagination;
  filters: ExperimentFilters;
  sort: ExperimentSort;
}

export interface ExperimentCreateRequest {
  name: string;
  description: string;
  variants: Omit<Variant, 'id'>[];
  targetAudience: TargetAudience;
  metrics: Omit<Metric, 'id'>[];
  startDate: Date;
  endDate: Date;
  minSampleSize?: number;
  maxDuration?: number;
  confidenceLevel?: number;
}

export interface ExperimentUpdateRequest {
  name?: string;
  description?: string;
  status?: ExperimentStatus;
  variants?: Variant[];
  targetAudience?: TargetAudience;
  metrics?: Metric[];
  startDate?: Date;
  endDate?: Date;
  minSampleSize?: number;
  maxDuration?: number;
  confidenceLevel?: number;
}

export interface ExperimentAssignmentRequest {
  userId: string;
  experimentId: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

export interface ExperimentAssignmentResponse {
  userId: string;
  experimentId: string;
  variantId: string;
  assignedAt: Date;
  sessionId: string;
  metadata?: Record<string, any>;
}

export interface ExperimentEventRequest {
  userId: string;
  experimentId: string;
  variantId: string;
  sessionId: string;
  event: ExperimentEvent;
  metadata?: Record<string, any>;
}

export interface ExperimentAnalyticsRequest {
  experimentId: string;
  startDate?: Date;
  endDate?: Date;
  variantIds?: string[];
  metrics?: string[];
  groupBy?: ('day' | 'week' | 'month')[];
}

export interface ExperimentAnalyticsResponse {
  experimentId: string;
  analytics: ExperimentAnalytics[];
  summary: ExperimentSummary;
  generatedAt: Date;
}

export interface ExperimentReportRequest {
  experimentId: string;
  format?: 'json' | 'csv' | 'pdf';
  includeRawData?: boolean;
  includeCharts?: boolean;
}

export interface ExperimentReportResponse {
  experimentId: string;
  report: ExperimentReport;
  format: string;
  generatedAt: Date;
  downloadUrl?: string;
}
