import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import {
  AuditLog,
  ComplianceRequirement,
  ComplianceSettings,
  NotFoundError,
  RegulatoryCompliance,
  TeamOnboardingError,
  ValidationError,
} from '../types';
import { logComplianceEvent, logger } from '../utils/logger';

export class ComplianceManagementService {
  private supabase;

  constructor() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment variables are not set.');
    }
    this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }

  /**
   * Create compliance settings for a team
   */
  async createComplianceSettings(
    teamId: string,
    complianceSettings: ComplianceSettings,
    createdBy: string,
  ): Promise<ComplianceSettings> {
    try {
      // Verify team exists
      const { data: team, error: teamError } = await this.supabase
        .from('teams')
        .select('id, name')
        .eq('id', teamId)
        .single();

      if (teamError || !team) {
        throw new NotFoundError('Team', teamId);
      }

      // Check if compliance settings already exist
      const { data: existingSettings, error: checkError } = await this.supabase
        .from('compliance_settings')
        .select('id')
        .eq('team_id', teamId)
        .single();

      if (existingSettings) {
        throw new ValidationError('Compliance settings already exist for this team');
      }

      const settingsId = uuidv4();

      // Save compliance settings to database
      const { error: settingsError } = await this.supabase.from('compliance_settings').insert({
        id: settingsId,
        team_id: teamId,
        data_retention_policy: JSON.stringify(complianceSettings.dataRetentionPolicy),
        audit_logging: JSON.stringify(complianceSettings.auditLogging),
        access_controls: JSON.stringify(complianceSettings.accessControls),
        privacy_settings: JSON.stringify(complianceSettings.privacySettings),
        regulatory_compliance: JSON.stringify(complianceSettings.regulatoryCompliance),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: createdBy,
      });

      if (settingsError) {
        logger.error('Failed to create compliance settings', {
          error: settingsError.message,
          teamId,
          createdBy,
        });
        throw new TeamOnboardingError(
          'Failed to create compliance settings',
          'DATABASE_ERROR',
          500,
          settingsError,
        );
      }

      logComplianceEvent('compliance_settings_created', teamId, createdBy, 'general', {
        settingsId,
        teamName: team.name,
      });

      return complianceSettings;
    } catch (error) {
      if (error instanceof TeamOnboardingError) {
        throw error;
      }

      if (error instanceof ValidationError) {
        throw error;
      }

      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Compliance settings creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId,
        createdBy,
      });

      throw new TeamOnboardingError(
        'Compliance settings creation failed',
        'COMPLIANCE_ERROR',
        500,
        error,
      );
    }
  }

  /**
   * Update compliance settings
   */
  async updateComplianceSettings(
    teamId: string,
    updates: Partial<ComplianceSettings>,
    updatedBy: string,
  ): Promise<ComplianceSettings> {
    try {
      // Get existing settings
      const { data: existingSettings, error: fetchError } = await this.supabase
        .from('compliance_settings')
        .select('*')
        .eq('team_id', teamId)
        .single();

      if (fetchError || !existingSettings) {
        throw new NotFoundError('Compliance Settings', teamId);
      }

      // Merge with existing settings
      const currentSettings: ComplianceSettings = {
        dataRetentionPolicy: JSON.parse(existingSettings.data_retention_policy || '{}'),
        auditLogging: JSON.parse(existingSettings.audit_logging || '{}'),
        accessControls: JSON.parse(existingSettings.access_controls || '{}'),
        privacySettings: JSON.parse(existingSettings.privacy_settings || '{}'),
        regulatoryCompliance: JSON.parse(existingSettings.regulatory_compliance || '[]'),
      };

      const updatedSettings: ComplianceSettings = {
        dataRetentionPolicy: updates.dataRetentionPolicy || currentSettings.dataRetentionPolicy,
        auditLogging: updates.auditLogging || currentSettings.auditLogging,
        accessControls: updates.accessControls || currentSettings.accessControls,
        privacySettings: updates.privacySettings || currentSettings.privacySettings,
        regulatoryCompliance: updates.regulatoryCompliance || currentSettings.regulatoryCompliance,
      };

      // Update settings in database
      const { error: updateError } = await this.supabase
        .from('compliance_settings')
        .update({
          data_retention_policy: JSON.stringify(updatedSettings.dataRetentionPolicy),
          audit_logging: JSON.stringify(updatedSettings.auditLogging),
          access_controls: JSON.stringify(updatedSettings.accessControls),
          privacy_settings: JSON.stringify(updatedSettings.privacySettings),
          regulatory_compliance: JSON.stringify(updatedSettings.regulatoryCompliance),
          updated_at: new Date().toISOString(),
        })
        .eq('team_id', teamId);

      if (updateError) {
        logger.error('Failed to update compliance settings', {
          error: updateError.message,
          teamId,
          updatedBy,
        });
        throw new TeamOnboardingError(
          'Failed to update compliance settings',
          'DATABASE_ERROR',
          500,
          updateError,
        );
      }

      logComplianceEvent('compliance_settings_updated', teamId, updatedBy, 'general', {
        updates: Object.keys(updates),
      });

      return updatedSettings;
    } catch (error) {
      if (error instanceof TeamOnboardingError) {
        throw error;
      }

      logger.error('Compliance settings update failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId,
        updatedBy,
      });

      throw new TeamOnboardingError(
        'Compliance settings update failed',
        'UPDATE_ERROR',
        500,
        error,
      );
    }
  }

  /**
   * Get compliance settings for a team
   */
  async getComplianceSettings(teamId: string): Promise<ComplianceSettings> {
    try {
      const { data, error } = await this.supabase
        .from('compliance_settings')
        .select('*')
        .eq('team_id', teamId)
        .single();

      if (error || !data) {
        throw new NotFoundError('Compliance Settings', teamId);
      }

      return {
        dataRetentionPolicy: JSON.parse(data.data_retention_policy || '{}'),
        auditLogging: JSON.parse(data.audit_logging || '{}'),
        accessControls: JSON.parse(data.access_controls || '{}'),
        privacySettings: JSON.parse(data.privacy_settings || '{}'),
        regulatoryCompliance: JSON.parse(data.regulatory_compliance || '[]'),
      };
    } catch (error) {
      if (error instanceof TeamOnboardingError) {
        throw error;
      }

      if (error instanceof ValidationError) {
        throw error;
      }

      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Failed to get compliance settings', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId,
      });

      throw new TeamOnboardingError('Failed to get compliance settings', 'FETCH_ERROR', 500, error);
    }
  }

  /**
   * Create audit log entry
   */
  async createAuditLog(
    teamId: string,
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    details: Record<string, any>,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    errorMessage?: string,
  ): Promise<AuditLog> {
    try {
      const logId = uuidv4();
      const auditLog: AuditLog = {
        id: logId,
        teamId,
        userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress,
        userAgent,
        timestamp: new Date(),
        success,
        errorMessage,
      };

      // Check if audit logging is enabled for the team
      const complianceSettings = await this.getComplianceSettings(teamId);

      if (!complianceSettings.auditLogging.enabled) {
        // Still log to application logs but not to database
        logger.info('Audit log entry (logging disabled)', {
          teamId,
          userId,
          action,
          resource,
          resourceId,
        });
        return auditLog;
      }

      // Save audit log to database
      const { error: logError } = await this.supabase.from('audit_logs').insert({
        id: auditLog.id,
        team_id: auditLog.teamId,
        user_id: auditLog.userId,
        action: auditLog.action,
        resource: auditLog.resource,
        resource_id: auditLog.resourceId,
        details: JSON.stringify(auditLog.details),
        ip_address: auditLog.ipAddress,
        user_agent: auditLog.userAgent,
        timestamp: auditLog.timestamp.toISOString(),
        success: auditLog.success,
        error_message: auditLog.errorMessage,
      });

      if (logError) {
        logger.error('Failed to create audit log', {
          error: logError.message,
          teamId,
          userId,
          action,
        });
        // Don't throw error for audit log failures to avoid breaking the main operation
      }

      return auditLog;
    } catch (error) {
      logger.error('Audit log creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId,
        userId,
        action,
      });

      // Return a basic audit log even if database save fails
      return {
        id: uuidv4(),
        teamId,
        userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress,
        userAgent,
        timestamp: new Date(),
        success,
        errorMessage,
      };
    }
  }

  /**
   * Get audit logs for a team
   */
  async getAuditLogs(
    teamId: string,
    filters?: {
      userId?: string;
      action?: string;
      resource?: string;
      startDate?: Date;
      endDate?: Date;
      success?: boolean;
    },
    pagination?: {
      page: number;
      limit: number;
    },
  ): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .eq('team_id', teamId)
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.resource) {
        query = query.eq('resource', filters.resource);
      }
      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate.toISOString());
      }
      if (filters?.success !== undefined) {
        query = query.eq('success', filters.success);
      }

      // Apply pagination
      if (pagination) {
        const offset = (pagination.page - 1) * pagination.limit;
        query = query.range(offset, offset + pagination.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        logger.error('Failed to get audit logs', {
          error: error.message,
          teamId,
        });
        throw new TeamOnboardingError('Failed to get audit logs', 'DATABASE_ERROR', 500, error);
      }

      const logs: AuditLog[] = (data || []).map((log: any) => ({
        id: log.id,
        teamId: log.team_id,
        userId: log.user_id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resource_id,
        details: JSON.parse(log.details || '{}'),
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        timestamp: new Date(log.timestamp),
        success: log.success,
        errorMessage: log.error_message,
      }));

      return {
        logs,
        total: count || 0,
      };
    } catch (error) {
      if (error instanceof TeamOnboardingError) {
        throw error;
      }

      logger.error('Failed to get audit logs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId,
      });

      throw new TeamOnboardingError('Failed to get audit logs', 'FETCH_ERROR', 500, error);
    }
  }

  /**
   * Run compliance assessment
   */
  async runComplianceAssessment(
    teamId: string,
    framework: 'GDPR' | 'CCPA' | 'HIPAA' | 'SOX' | 'ISO27001',
    runBy: string,
  ): Promise<RegulatoryCompliance> {
    try {
      const complianceSettings = await this.getComplianceSettings(teamId);

      // Get existing compliance record
      let existingCompliance = complianceSettings.regulatoryCompliance.find(
        c => c.framework === framework,
      );

      const requirements: ComplianceRequirement[] = await this.assessComplianceRequirements(
        teamId,
        framework,
      );

      const metRequirements = requirements.filter(r => r.status === 'met').length;
      const totalRequirements = requirements.length;

      let status: 'compliant' | 'partial' | 'non_compliant';
      if (metRequirements === totalRequirements) {
        status = 'compliant';
      } else if (metRequirements > totalRequirements * 0.7) {
        status = 'partial';
      } else {
        status = 'non_compliant';
      }

      const assessment: RegulatoryCompliance = {
        framework,
        status,
        lastAssessment: new Date(),
        nextAssessment: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        requirements,
      };

      // Update compliance settings with new assessment
      const updatedCompliance = complianceSettings.regulatoryCompliance.filter(
        c => c.framework !== framework,
      );
      updatedCompliance.push(assessment);

      await this.updateComplianceSettings(
        teamId,
        { regulatoryCompliance: updatedCompliance },
        runBy,
      );

      logComplianceEvent('compliance_assessment_completed', teamId, runBy, framework, {
        status,
        metRequirements,
        totalRequirements,
      });

      return assessment;
    } catch (error) {
      if (error instanceof TeamOnboardingError) {
        throw error;
      }

      logger.error('Compliance assessment failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId,
        framework,
        runBy,
      });

      throw new TeamOnboardingError('Compliance assessment failed', 'ASSESSMENT_ERROR', 500, error);
    }
  }

  /**
   * Assess compliance requirements for a framework
   */
  private async assessComplianceRequirements(
    teamId: string,
    framework: 'GDPR' | 'CCPA' | 'HIPAA' | 'SOX' | 'ISO27001',
  ): Promise<ComplianceRequirement[]> {
    // This is a simplified implementation
    // In a real system, this would involve complex compliance checking logic

    const baseRequirements: ComplianceRequirement[] = [
      {
        id: `${framework}_data_protection`,
        name: 'Data Protection Measures',
        description: 'Adequate data protection measures are in place',
        status: 'met',
        evidence: ['Encryption enabled', 'Access controls configured'],
        lastChecked: new Date(),
      },
      {
        id: `${framework}_audit_logging`,
        name: 'Audit Logging',
        description: 'Comprehensive audit logging is enabled',
        status: 'met',
        evidence: ['Audit logging enabled', 'Log retention policy configured'],
        lastChecked: new Date(),
      },
      {
        id: `${framework}_user_consent`,
        name: 'User Consent Management',
        description: 'User consent is properly managed',
        status: 'partial',
        evidence: ['Consent collection implemented'],
        lastChecked: new Date(),
      },
    ];

    // Add framework-specific requirements
    switch (framework) {
      case 'GDPR':
        baseRequirements.push({
          id: 'gdpr_right_to_erasure',
          name: 'Right to Erasure',
          description: 'Users can request data deletion',
          status: 'met',
          evidence: ['Data deletion API implemented'],
          lastChecked: new Date(),
        });
        break;
      case 'CCPA':
        baseRequirements.push({
          id: 'ccpa_opt_out',
          name: 'Opt-out Mechanism',
          description: 'Users can opt out of data sale',
          status: 'not_met',
          evidence: [],
          lastChecked: new Date(),
        });
        break;
      case 'HIPAA':
        baseRequirements.push({
          id: 'hipaa_business_associate',
          name: 'Business Associate Agreements',
          description: 'BAAs are in place with vendors',
          status: 'partial',
          evidence: ['Some BAAs completed'],
          lastChecked: new Date(),
        });
        break;
    }

    return baseRequirements;
  }

  /**
   * Clean up expired data based on retention policy
   */
  async cleanupExpiredData(teamId: string): Promise<{
    deletedRecords: number;
    cleanedDataTypes: string[];
  }> {
    try {
      const complianceSettings = await this.getComplianceSettings(teamId);
      const retentionPolicy = complianceSettings.dataRetentionPolicy;

      if (!retentionPolicy.autoDeleteEnabled) {
        return { deletedRecords: 0, cleanedDataTypes: [] };
      }

      const cleanedDataTypes: string[] = [];
      let totalDeletedRecords = 0;

      // Clean up user data
      if (retentionPolicy.userDataRetentionDays > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionPolicy.userDataRetentionDays);

        const { count: userCount, error: userError } = await this.supabase
          .from('users')
          .delete()
          .eq('team_id', teamId)
          .lt('created_at', cutoffDate.toISOString())
          .select('*', { count: 'exact', head: true });

        if (!userError && userCount) {
          totalDeletedRecords += userCount;
          cleanedDataTypes.push('user_data');
        }
      }

      // Clean up audit logs
      if (retentionPolicy.auditLogRetentionDays > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionPolicy.auditLogRetentionDays);

        const { count: auditCount, error: auditError } = await this.supabase
          .from('audit_logs')
          .delete()
          .eq('team_id', teamId)
          .lt('timestamp', cutoffDate.toISOString())
          .select('*', { count: 'exact', head: true });

        if (!auditError && auditCount) {
          totalDeletedRecords += auditCount;
          cleanedDataTypes.push('audit_logs');
        }
      }

      logComplianceEvent('data_cleanup_completed', teamId, 'system', 'data_retention', {
        deletedRecords: totalDeletedRecords,
        cleanedDataTypes,
      });

      return {
        deletedRecords: totalDeletedRecords,
        cleanedDataTypes,
      };
    } catch (error) {
      logger.error('Data cleanup failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId,
      });

      throw new TeamOnboardingError('Data cleanup failed', 'CLEANUP_ERROR', 500, error);
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(teamId: string): Promise<{
    teamId: string;
    generatedAt: Date;
    complianceStatus: Record<string, any>;
    recommendations: string[];
  }> {
    try {
      const complianceSettings = await this.getComplianceSettings(teamId);

      const report = {
        teamId,
        generatedAt: new Date(),
        complianceStatus: {
          dataRetention: complianceSettings.dataRetentionPolicy,
          auditLogging: complianceSettings.auditLogging,
          accessControls: complianceSettings.accessControls,
          privacySettings: complianceSettings.privacySettings,
          regulatoryCompliance: complianceSettings.regulatoryCompliance,
        },
        recommendations: this.generateComplianceRecommendations(complianceSettings),
      };

      logComplianceEvent('compliance_report_generated', teamId, 'system', 'reporting', {
        reportGenerated: true,
      });

      return report;
    } catch (error) {
      logger.error('Compliance report generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId,
      });

      throw new TeamOnboardingError(
        'Compliance report generation failed',
        'REPORT_ERROR',
        500,
        error,
      );
    }
  }

  /**
   * Generate compliance recommendations
   */
  private generateComplianceRecommendations(settings: ComplianceSettings): string[] {
    const recommendations: string[] = [];

    // Data retention recommendations
    if (!settings.dataRetentionPolicy.autoDeleteEnabled) {
      recommendations.push('Enable automatic data deletion to comply with data retention policies');
    }

    // Audit logging recommendations
    if (!settings.auditLogging.enabled) {
      recommendations.push('Enable audit logging for compliance monitoring');
    }

    if (settings.auditLogging.logLevel === 'minimal') {
      recommendations.push(
        'Consider upgrading to detailed audit logging for better compliance tracking',
      );
    }

    // Access control recommendations
    if (!settings.accessControls.requireMFA) {
      recommendations.push('Enable multi-factor authentication for enhanced security');
    }

    if (settings.accessControls.ipWhitelist.length === 0) {
      recommendations.push('Consider implementing IP whitelisting for restricted access');
    }

    // Privacy settings recommendations
    if (!settings.privacySettings.gdprCompliance) {
      recommendations.push('Review and implement GDPR compliance measures');
    }

    if (!settings.privacySettings.ccpaCompliance) {
      recommendations.push('Review and implement CCPA compliance measures');
    }

    return recommendations;
  }
}
