import { z } from 'zod';

// Base API Response Interface
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

// Pagination Interface
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Team Administrator Types
export interface TeamAdministrator {
  id: string;
  teamId: string;
  userId: string;
  role: AdministratorRole;
  permissions: AdministratorPermission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export enum AdministratorRole {
  SUPER_ADMIN = 'super_admin',
  TEAM_ADMIN = 'team_admin',
  USER_MANAGER = 'user_manager',
  COMPLIANCE_OFFICER = 'compliance_officer',
}

export enum AdministratorPermission {
  MANAGE_USERS = 'manage_users',
  MANAGE_TEAMS = 'manage_teams',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_INTEGRATIONS = 'manage_integrations',
  MANAGE_COMPLIANCE = 'manage_compliance',
  BULK_OPERATIONS = 'bulk_operations',
  EXPORT_DATA = 'export_data',
  MANAGE_SETTINGS = 'manage_settings',
}

// Team Types
export interface Team {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  settings: TeamSettings;
  complianceSettings: ComplianceSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface TeamSettings {
  maxUsers: number;
  allowSelfRegistration: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: string;
  allowedDomains: string[];
  sessionTimeout: number;
  passwordPolicy: PasswordPolicy;
  notificationSettings: NotificationSettings;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // days
  preventReuse: number; // number of previous passwords
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notificationChannels: string[];
}

// User Provisioning Types
export interface UserProvisioningRequest {
  id: string;
  teamId: string;
  users: UserProvisioningData[];
  status: ProvisioningStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  results?: ProvisioningResult[];
}

export interface UserProvisioningData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  manager?: string;
  customFields?: Record<string, any>;
}

export enum ProvisioningStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIALLY_COMPLETED = 'partially_completed',
}

export interface ProvisioningResult {
  email: string;
  status: 'success' | 'failed' | 'skipped';
  userId?: string;
  error?: string;
  warnings?: string[];
}

// Bulk Operations Types
export interface BulkUserOperation {
  id: string;
  teamId: string;
  operation: BulkOperationType;
  userIds: string[];
  parameters: Record<string, any>;
  status: BulkOperationStatus;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  results?: BulkOperationResult[];
}

export enum BulkOperationType {
  ACTIVATE_USERS = 'activate_users',
  DEACTIVATE_USERS = 'deactivate_users',
  UPDATE_ROLES = 'update_roles',
  UPDATE_DEPARTMENTS = 'update_departments',
  SEND_WELCOME_EMAILS = 'send_welcome_emails',
  RESET_PASSWORDS = 'reset_passwords',
  EXPORT_USER_DATA = 'export_user_data',
}

export enum BulkOperationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface BulkOperationResult {
  userId: string;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
  data?: any;
}

// Compliance Types
export interface ComplianceSettings {
  dataRetentionPolicy: DataRetentionPolicy;
  auditLogging: AuditLoggingSettings;
  accessControls: AccessControlSettings;
  privacySettings: PrivacySettings;
  regulatoryCompliance: RegulatoryCompliance[];
}

export interface DataRetentionPolicy {
  userDataRetentionDays: number;
  auditLogRetentionDays: number;
  meetingDataRetentionDays: number;
  autoDeleteEnabled: boolean;
  retentionExceptions: string[];
}

export interface AuditLoggingSettings {
  enabled: boolean;
  logLevel: 'minimal' | 'standard' | 'detailed';
  logUserActions: boolean;
  logSystemEvents: boolean;
  logDataAccess: boolean;
  retentionPeriod: number; // days
}

export interface AccessControlSettings {
  requireMFA: boolean;
  sessionTimeout: number; // minutes
  ipWhitelist: string[];
  allowedCountries: string[];
  blockSuspiciousActivity: boolean;
}

export interface PrivacySettings {
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  cookieConsent: boolean;
  gdprCompliance: boolean;
  ccpaCompliance: boolean;
}

export interface RegulatoryCompliance {
  framework: 'GDPR' | 'CCPA' | 'HIPAA' | 'SOX' | 'ISO27001';
  status: 'compliant' | 'partial' | 'non_compliant';
  lastAssessment: Date;
  nextAssessment: Date;
  requirements: ComplianceRequirement[];
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  status: 'met' | 'partial' | 'not_met';
  evidence: string[];
  lastChecked: Date;
}

// Audit and Logging Types
export interface AuditLog {
  id: string;
  teamId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

// Validation Schemas
export const CreateTeamSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  organizationId: z.string().uuid(),
  settings: z.object({
    maxUsers: z.number().min(1).max(10000),
    allowSelfRegistration: z.boolean(),
    requireEmailVerification: z.boolean(),
    defaultUserRole: z.string(),
    allowedDomains: z.array(z.string().email()),
    sessionTimeout: z.number().min(5).max(1440),
    passwordPolicy: z.object({
      minLength: z.number().min(8).max(128),
      requireUppercase: z.boolean(),
      requireLowercase: z.boolean(),
      requireNumbers: z.boolean(),
      requireSpecialChars: z.boolean(),
      maxAge: z.number().min(30).max(365),
      preventReuse: z.number().min(0).max(24),
    }),
    notificationSettings: z.object({
      emailNotifications: z.boolean(),
      smsNotifications: z.boolean(),
      pushNotifications: z.boolean(),
      notificationChannels: z.array(z.string()),
    }),
  }),
  complianceSettings: z.object({
    dataRetentionPolicy: z.object({
      userDataRetentionDays: z.number().min(30).max(2555), // 7 years
      auditLogRetentionDays: z.number().min(90).max(2555),
      meetingDataRetentionDays: z.number().min(30).max(2555),
      autoDeleteEnabled: z.boolean(),
      retentionExceptions: z.array(z.string()),
    }),
    auditLogging: z.object({
      enabled: z.boolean(),
      logLevel: z.enum(['minimal', 'standard', 'detailed']),
      logUserActions: z.boolean(),
      logSystemEvents: z.boolean(),
      logDataAccess: z.boolean(),
      retentionPeriod: z.number().min(30).max(2555),
    }),
    accessControls: z.object({
      requireMFA: z.boolean(),
      sessionTimeout: z.number().min(5).max(1440),
      ipWhitelist: z.array(z.string()),
      allowedCountries: z.array(z.string()),
      blockSuspiciousActivity: z.boolean(),
    }),
    privacySettings: z.object({
      dataProcessingConsent: z.boolean(),
      marketingConsent: z.boolean(),
      analyticsConsent: z.boolean(),
      cookieConsent: z.boolean(),
      gdprCompliance: z.boolean(),
      ccpaCompliance: z.boolean(),
    }),
    regulatoryCompliance: z.array(
      z.object({
        framework: z.enum(['GDPR', 'CCPA', 'HIPAA', 'SOX', 'ISO27001']),
        status: z.enum(['compliant', 'partial', 'non_compliant']),
        lastAssessment: z.date(),
        nextAssessment: z.date(),
        requirements: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            status: z.enum(['met', 'partial', 'not_met']),
            evidence: z.array(z.string()),
            lastChecked: z.date(),
          }),
        ),
      }),
    ),
  }),
});

export const CreateTeamAdministratorSchema = z.object({
  teamId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.nativeEnum(AdministratorRole),
  permissions: z.array(z.nativeEnum(AdministratorPermission)),
});

export const UserProvisioningRequestSchema = z.object({
  teamId: z.string().uuid(),
  users: z
    .array(
      z.object({
        email: z.string().email(),
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        role: z.string(),
        department: z.string().optional(),
        manager: z.string().optional(),
        customFields: z.record(z.any()).optional(),
      }),
    )
    .min(1)
    .max(1000),
});

export const BulkUserOperationSchema = z.object({
  teamId: z.string().uuid(),
  operation: z.nativeEnum(BulkOperationType),
  userIds: z.array(z.string().uuid()).min(1).max(1000),
  parameters: z.record(z.any()),
});

// Error Types
export class TeamOnboardingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any,
  ) {
    super(message);
    this.name = 'TeamOnboardingError';
  }
}

export class ValidationError extends TeamOnboardingError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class NotFoundError extends TeamOnboardingError {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`, 'NOT_FOUND', 404);
  }
}

export class UnauthorizedError extends TeamOnboardingError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends TeamOnboardingError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'FORBIDDEN', 403);
  }
}
