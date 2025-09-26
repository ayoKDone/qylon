// Integration Management Service Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId?: string;
}

export interface IntegrationConfig {
  id: string;
  userId: string;
  clientId: string;
  type: IntegrationType;
  name: string;
  status: IntegrationStatus;
  credentials: Record<string, any>;
  settings: Record<string, any>;
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export enum IntegrationType {
  CRM_SALESFORCE = 'crm_salesforce',
  CRM_HUBSPOT = 'crm_hubspot',
  CRM_PIPEDRIVE = 'crm_pipedrive',
  CRM_CUSTOM = 'crm_custom',
  COMMUNICATION_SLACK = 'communication_slack',
  COMMUNICATION_DISCORD = 'communication_discord',
  COMMUNICATION_TEAMS = 'communication_teams',
  EMAIL_MAILCHIMP = 'email_mailchimp',
  EMAIL_SENDGRID = 'email_sendgrid',
  EMAIL_CONSTANT_CONTACT = 'email_constant_contact',
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  PENDING = 'pending',
  SYNCING = 'syncing',
}

export interface CRMContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  title?: string;
  source: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CRMOpportunity {
  id: string;
  name: string;
  amount?: number;
  stage: string;
  probability?: number;
  closeDate?: string;
  contactId: string;
  source: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors?: string[];
  duration: number;
  timestamp: string;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  authUrl: string;
  tokenUrl: string;
}

export interface WebhookPayload {
  event: string;
  data: Record<string, any>;
  timestamp: string;
  source: string;
}

export interface CommunicationMessage {
  id: string;
  channel: string;
  platform: string;
  content: string;
  sender: string;
  recipient: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  platform: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SentimentAnalysis {
  score: number;
  magnitude: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface AIResponse {
  content: string;
  sentiment: SentimentAnalysis;
  confidence: number;
  suggestedActions?: string[];
  metadata?: Record<string, any>;
}

export interface IntegrationError extends Error {
  code: string;
  integrationType: IntegrationType;
  userId: string;
  timestamp: string;
  retryable: boolean;
}

export interface RateLimitConfig {
  requests: number;
  window: number; // in milliseconds
  burst?: number;
}

export interface IntegrationMetrics {
  totalIntegrations: number;
  activeIntegrations: number;
  syncSuccessRate: number;
  averageSyncTime: number;
  errorRate: number;
  lastUpdated: string;
}
