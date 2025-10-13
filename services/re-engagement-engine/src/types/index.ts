export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface HealthData {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  environment: string;
  features: {
    emailSequences: 'available' | 'unavailable';
    behaviorTracking: 'available' | 'unavailable';
    conversionRecovery: 'available' | 'unavailable';
  };
}

// Email Sequence Types
export interface EmailSequence {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  steps: EmailStep[];
  isActive: boolean;
  userId: string;
  clientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailStep {
  id: string;
  sequenceId: string;
  stepNumber: number;
  delayHours: number;
  subject: string;
  template: string;
  variables: Record<string, any>;
  conditions?: EmailCondition[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface EmailSequenceExecution {
  id: string;
  sequenceId: string;
  userId: string;
  clientId?: string;
  status: 'pending' | 'active' | 'completed' | 'paused' | 'cancelled';
  currentStep: number;
  nextExecutionAt: string;
  lastExecutedAt?: string;
  completedAt?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface EmailDelivery {
  id: string;
  executionId: string;
  stepId: string;
  userId: string;
  recipient: string;
  subject: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bouncedAt?: string;
  errorMessage?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// User Behavior Tracking Types
export interface UserBehaviorEvent {
  id: string;
  userId: string;
  clientId?: string;
  eventType: string;
  eventData: Record<string, any>;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface UserBehaviorProfile {
  id: string;
  userId: string;
  clientId?: string;
  engagementScore: number;
  lastActivityAt: string;
  totalSessions: number;
  averageSessionDuration: number;
  preferredChannels: string[];
  behaviorPatterns: BehaviorPattern[];
  riskFactors: RiskFactor[];
  createdAt: string;
  updatedAt: string;
}

export interface BehaviorPattern {
  pattern: string;
  frequency: number;
  lastOccurrence: string;
  confidence: number;
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: string;
  resolvedAt?: string;
}

// Conversion Recovery Types
export interface ConversionRecoveryCampaign {
  id: string;
  name: string;
  description: string;
  targetSegment: string;
  recoveryStrategy: 'email_sequence' | 'personalized_outreach' | 'incentive_offer' | 'feature_highlight';
  isActive: boolean;
  userId: string;
  clientId?: string;
  successMetrics: RecoveryMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface RecoveryMetrics {
  targetConversionRate: number;
  currentConversionRate: number;
  totalRecovered: number;
  totalAttempted: number;
  averageRecoveryTime: number;
  costPerRecovery: number;
}

export interface ConversionRecoveryExecution {
  id: string;
  campaignId: string;
  userId: string;
  clientId?: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  strategy: string;
  personalizedContent?: string;
  incentiveOffer?: IncentiveOffer;
  startDate: string;
  endDate?: string;
  result?: RecoveryResult;
  createdAt: string;
  updatedAt: string;
}

export interface IncentiveOffer {
  type: 'discount' | 'free_trial' | 'feature_upgrade' | 'consultation';
  value: string;
  description: string;
  expirationDate: string;
}

export interface RecoveryResult {
  outcome: 'converted' | 'not_converted' | 'partial';
  conversionValue?: number;
  feedback?: string;
  followUpRequired: boolean;
  completedAt: string;
}

// A/B Testing Types
export interface ABTest {
  id: string;
  name: string;
  description: string;
  testType: 'email_subject' | 'email_content' | 'recovery_strategy' | 'timing';
  variants: ABTestVariant[];
  targetSegment: string;
  trafficAllocation: number;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  results?: ABTestResults;
  userId: string;
  clientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  content: Record<string, any>;
  trafficPercentage: number;
  isControl: boolean;
}

export interface ABTestResults {
  totalParticipants: number;
  variants: ABTestVariantResult[];
  winningVariant?: string;
  confidenceLevel: number;
  statisticalSignificance: boolean;
  completedAt: string;
}

export interface ABTestVariantResult {
  variantId: string;
  participants: number;
  conversions: number;
  conversionRate: number;
  averageValue: number;
  totalValue: number;
}

// Request/Response Types
export interface CreateEmailSequenceRequest {
  name: string;
  description: string;
  triggerEvent: string;
  steps: Omit<EmailStep, 'id' | 'sequenceId' | 'createdAt' | 'updatedAt'>[];
  clientId?: string;
}

export interface UpdateEmailSequenceRequest {
  name?: string;
  description?: string;
  triggerEvent?: string;
  steps?: Omit<EmailStep, 'id' | 'sequenceId' | 'createdAt' | 'updatedAt'>[];
  isActive?: boolean;
}

export interface CreateRecoveryCampaignRequest {
  name: string;
  description: string;
  targetSegment: string;
  recoveryStrategy: string;
  clientId?: string;
}

export interface UpdateRecoveryCampaignRequest {
  name?: string;
  description?: string;
  targetSegment?: string;
  recoveryStrategy?: string;
  isActive?: boolean;
}

export interface CreateABTestRequest {
  name: string;
  description: string;
  testType: string;
  variants: Omit<ABTestVariant, 'id'>[];
  targetSegment: string;
  trafficAllocation: number;
  clientId?: string;
}

export interface UpdateABTestRequest {
  name?: string;
  description?: string;
  variants?: Omit<ABTestVariant, 'id'>[];
  trafficAllocation?: number;
  isActive?: boolean;
}

// Analytics Types
export interface ReEngagementAnalytics {
  emailSequences: {
    totalSequences: number;
    activeSequences: number;
    totalExecutions: number;
    averageOpenRate: number;
    averageClickRate: number;
    averageConversionRate: number;
  };
  behaviorTracking: {
    totalUsers: number;
    activeUsers: number;
    averageEngagementScore: number;
    topRiskFactors: string[];
    behaviorPatterns: string[];
  };
  conversionRecovery: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalRecovered: number;
    averageRecoveryRate: number;
    averageRecoveryTime: number;
    costPerRecovery: number;
  };
  abTests: {
    totalTests: number;
    activeTests: number;
    completedTests: number;
    averageImprovement: number;
  };
}

// Error Types
export interface ReEngagementError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Configuration Types
export interface EmailProviderConfig {
  provider: 'sendgrid' | 'smtp' | 'mailchimp';
  apiKey?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  fromEmail: string;
  fromName: string;
}

export interface ReEngagementConfig {
  emailProvider: EmailProviderConfig;
  behaviorTracking: {
    enabled: boolean;
    retentionDays: number;
    batchSize: number;
  };
  conversionRecovery: {
    enabled: boolean;
    maxRetryAttempts: number;
    retryDelayHours: number;
  };
  abTesting: {
    enabled: boolean;
    minSampleSize: number;
    confidenceLevel: number;
  };
}
