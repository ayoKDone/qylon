import { createClient } from '@supabase/supabase-js';
import { CRMContact, CRMOpportunity, IntegrationConfig, IntegrationType } from '../../integration-management/src/types';
import { logger } from '../utils/logger';

export interface IntegrationAction {
  id: string;
  type: 'create_contact' | 'update_contact' | 'create_opportunity' | 'update_opportunity' | 'sync_data' | 'send_notification';
  integrationType: IntegrationType;
  config: Record<string, any>;
  data: Record<string, any>;
  retryCount?: number;
  maxRetries?: number;
}

export interface IntegrationResult {
  success: boolean;
  actionId: string;
  integrationType: IntegrationType;
  result?: any;
  error?: string;
  duration: number;
  retryCount: number;
}

export interface CoordinationContext {
  workflowId: string;
  executionId: string;
  clientId: string;
  userId: string;
  correlationId?: string;
  causationId?: string;
}

export class IntegrationServiceCoordinator {
  private supabase;
  private integrationServiceUrl: string;
  private coordinationCache: Map<string, IntegrationConfig[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.integrationServiceUrl = process.env.INTEGRATION_SERVICE_URL || 'http://localhost:3006';
  }

  /**
   * Coordinate integration actions for a workflow execution
   */
  async coordinateIntegrationActions(
    actions: IntegrationAction[],
    context: CoordinationContext
  ): Promise<IntegrationResult[]> {
    try {
      logger.info('Starting integration coordination', {
        workflowId: context.workflowId,
        executionId: context.executionId,
        actionCount: actions.length,
        clientId: context.clientId,
      });

      const results: IntegrationResult[] = [];

      // Process actions in parallel for better performance
      const actionPromises = actions.map(action =>
        this.executeIntegrationAction(action, context)
      );

      const actionResults = await Promise.allSettled(actionPromises);

      for (let i = 0; i < actionResults.length; i++) {
        const result = actionResults[i];
        const action = actions[i];

        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          logger.error('Integration action failed', {
            actionId: action.id,
            integrationType: action.integrationType,
            error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
          });

          results.push({
            success: false,
            actionId: action.id,
            integrationType: action.integrationType,
            error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
            duration: 0,
            retryCount: action.retryCount || 0,
          });
        }
      }

      const successfulActions = results.filter(r => r.success).length;
      const failedActions = results.filter(r => !r.success).length;

      logger.info('Integration coordination completed', {
        workflowId: context.workflowId,
        executionId: context.executionId,
        totalActions: actions.length,
        successfulActions,
        failedActions,
      });

      return results;
    } catch (error) {
      logger.error('Integration coordination failed', {
        workflowId: context.workflowId,
        executionId: context.executionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Execute a single integration action
   */
  private async executeIntegrationAction(
    action: IntegrationAction,
    context: CoordinationContext
  ): Promise<IntegrationResult> {
    const startTime = Date.now();
    let retryCount = action.retryCount || 0;
    const maxRetries = action.maxRetries || 3;

    try {
      logger.info('Executing integration action', {
        actionId: action.id,
        actionType: action.type,
        integrationType: action.integrationType,
        workflowId: context.workflowId,
        retryCount,
      });

      // Get integration configuration
      const integrationConfig = await this.getIntegrationConfig(
        action.integrationType,
        context.clientId
      );

      if (!integrationConfig) {
        throw new Error(`Integration not configured: ${action.integrationType}`);
      }

      // Execute the action based on type
      let result: any;
      switch (action.type) {
        case 'create_contact':
          result = await this.createContact(action.data, integrationConfig);
          break;
        case 'update_contact':
          result = await this.updateContact(action.data, integrationConfig);
          break;
        case 'create_opportunity':
          result = await this.createOpportunity(action.data, integrationConfig);
          break;
        case 'update_opportunity':
          result = await this.updateOpportunity(action.data, integrationConfig);
          break;
        case 'sync_data':
          result = await this.syncData(action.data, integrationConfig);
          break;
        case 'send_notification':
          result = await this.sendNotification(action.data, integrationConfig);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      const duration = Date.now() - startTime;

      logger.info('Integration action completed successfully', {
        actionId: action.id,
        integrationType: action.integrationType,
        duration,
        retryCount,
      });

      return {
        success: true,
        actionId: action.id,
        integrationType: action.integrationType,
        result,
        duration,
        retryCount,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error('Integration action failed', {
        actionId: action.id,
        integrationType: action.integrationType,
        error: errorMessage,
        duration,
        retryCount,
      });

      // Retry logic
      if (retryCount < maxRetries && this.isRetryableError(error)) {
        logger.info('Retrying integration action', {
          actionId: action.id,
          integrationType: action.integrationType,
          retryCount: retryCount + 1,
          maxRetries,
        });

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));

        return this.executeIntegrationAction(
          { ...action, retryCount: retryCount + 1 },
          context
        );
      }

      return {
        success: false,
        actionId: action.id,
        integrationType: action.integrationType,
        error: errorMessage,
        duration,
        retryCount,
      };
    }
  }

  /**
   * Get integration configuration for a client
   */
  private async getIntegrationConfig(
    integrationType: IntegrationType,
    clientId: string
  ): Promise<IntegrationConfig | null> {
    try {
      // Check cache first
      const cacheKey = `${integrationType}:${clientId}`;
      const cached = this.getCachedIntegrationConfig(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await this.supabase
        .from('integrations')
        .select('*')
        .eq('type', integrationType)
        .eq('client_id', clientId)
        .eq('status', 'active')
        .single();

      if (error) {
        logger.error('Failed to fetch integration config', {
          integrationType,
          clientId,
          error: error.message,
        });
        return null;
      }

      const config: IntegrationConfig = {
        id: data.id,
        userId: data.user_id,
        clientId: data.client_id,
        type: data.type,
        name: data.name,
        status: data.status,
        credentials: data.credentials,
        settings: data.settings,
        lastSync: data.last_sync,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      // Cache the result
      this.setCachedIntegrationConfig(cacheKey, config);

      return config;
    } catch (error) {
      logger.error('Failed to get integration config', {
        integrationType,
        clientId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Create contact in CRM
   */
  private async createContact(
    contactData: any,
    config: IntegrationConfig
  ): Promise<CRMContact> {
    try {
      const response = await fetch(`${this.integrationServiceUrl}/api/v1/crm/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTEGRATION_SERVICE_TOKEN}`,
        },
        body: JSON.stringify({
          integrationType: config.type,
          credentials: config.credentials,
          contact: contactData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`CRM contact creation failed: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('Failed to create CRM contact', {
        integrationType: config.type,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Update contact in CRM
   */
  private async updateContact(
    contactData: any,
    config: IntegrationConfig
  ): Promise<CRMContact> {
    try {
      const response = await fetch(`${this.integrationServiceUrl}/api/v1/crm/contacts/${contactData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTEGRATION_SERVICE_TOKEN}`,
        },
        body: JSON.stringify({
          integrationType: config.type,
          credentials: config.credentials,
          contact: contactData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`CRM contact update failed: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('Failed to update CRM contact', {
        integrationType: config.type,
        contactId: contactData.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Create opportunity in CRM
   */
  private async createOpportunity(
    opportunityData: any,
    config: IntegrationConfig
  ): Promise<CRMOpportunity> {
    try {
      const response = await fetch(`${this.integrationServiceUrl}/api/v1/crm/opportunities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTEGRATION_SERVICE_TOKEN}`,
        },
        body: JSON.stringify({
          integrationType: config.type,
          credentials: config.credentials,
          opportunity: opportunityData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`CRM opportunity creation failed: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('Failed to create CRM opportunity', {
        integrationType: config.type,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Update opportunity in CRM
   */
  private async updateOpportunity(
    opportunityData: any,
    config: IntegrationConfig
  ): Promise<CRMOpportunity> {
    try {
      const response = await fetch(`${this.integrationServiceUrl}/api/v1/crm/opportunities/${opportunityData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTEGRATION_SERVICE_TOKEN}`,
        },
        body: JSON.stringify({
          integrationType: config.type,
          credentials: config.credentials,
          opportunity: opportunityData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`CRM opportunity update failed: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('Failed to update CRM opportunity', {
        integrationType: config.type,
        opportunityId: opportunityData.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Sync data with integration
   */
  private async syncData(
    syncData: any,
    config: IntegrationConfig
  ): Promise<any> {
    try {
      const response = await fetch(`${this.integrationServiceUrl}/api/v1/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTEGRATION_SERVICE_TOKEN}`,
        },
        body: JSON.stringify({
          integrationType: config.type,
          credentials: config.credentials,
          syncData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Data sync failed: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('Failed to sync data', {
        integrationType: config.type,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Send notification through integration
   */
  private async sendNotification(
    notificationData: any,
    config: IntegrationConfig
  ): Promise<any> {
    try {
      const response = await fetch(`${this.integrationServiceUrl}/api/v1/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTEGRATION_SERVICE_TOKEN}`,
        },
        body: JSON.stringify({
          integrationType: config.type,
          credentials: config.credentials,
          notification: notificationData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Notification failed: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      logger.error('Failed to send notification', {
        integrationType: config.type,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('connection') ||
        message.includes('rate limit') ||
        message.includes('temporary') ||
        message.includes('service unavailable')
      );
    }
    return false;
  }

  /**
   * Get cached integration config
   */
  private getCachedIntegrationConfig(cacheKey: string): IntegrationConfig | null {
    const expiry = this.cacheExpiry.get(cacheKey);
    if (expiry && Date.now() > expiry) {
      this.coordinationCache.delete(cacheKey);
      this.cacheExpiry.delete(cacheKey);
      return null;
    }

    const cached = this.coordinationCache.get(cacheKey);
    return cached ? cached[0] : null;
  }

  /**
   * Set cached integration config
   */
  private setCachedIntegrationConfig(cacheKey: string, config: IntegrationConfig): void {
    this.coordinationCache.set(cacheKey, [config]);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
  }

  /**
   * Clear coordination cache
   */
  public clearCache(): void {
    this.coordinationCache.clear();
    this.cacheExpiry.clear();
    logger.info('Integration coordination cache cleared');
  }

  /**
   * Get coordination statistics
   */
  public async getCoordinationStatistics(): Promise<{
    totalIntegrations: number;
    activeIntegrations: number;
    integrationTypes: Record<string, number>;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('integrations')
        .select('type, status');

      if (error) {
        logger.error('Failed to fetch integration statistics', { error: error.message });
        return {
          totalIntegrations: 0,
          activeIntegrations: 0,
          integrationTypes: {},
        };
      }

      let totalIntegrations = 0;
      let activeIntegrations = 0;
      const integrationTypes: Record<string, number> = {};

      for (const integration of data || []) {
        totalIntegrations++;
        if (integration.status === 'active') {
          activeIntegrations++;
        }

        const type = integration.type;
        integrationTypes[type] = (integrationTypes[type] || 0) + 1;
      }

      return {
        totalIntegrations,
        activeIntegrations,
        integrationTypes,
      };
    } catch (error) {
      logger.error('Failed to get coordination statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        totalIntegrations: 0,
        activeIntegrations: 0,
        integrationTypes: {},
      };
    }
  }

  /**
   * Health check for coordination system
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('integrations').select('id').limit(1);
      return !error;
    } catch (error) {
      logger.error('Integration coordination health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }
}
