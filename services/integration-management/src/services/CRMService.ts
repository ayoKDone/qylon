import { createExternalServiceError, createIntegrationError } from '../middleware/errorHandler';
import {
  CRMContact,
  CRMOpportunity,
  IntegrationConfig,
  IntegrationType,
  SyncResult,
} from '../types';
import { logIntegrationError, logIntegrationEvent, logSyncResult, logger } from '../utils/logger';

// Base CRM Service interface
export interface ICRMService {
  authenticate(credentials: Record<string, any>): Promise<boolean>;
  syncContacts(userId: string, clientId: string): Promise<SyncResult>;
  syncOpportunities(userId: string, clientId: string): Promise<SyncResult>;
  createContact(contact: CRMContact): Promise<CRMContact>;
  updateContact(contactId: string, contact: Partial<CRMContact>): Promise<CRMContact>;
  createOpportunity(opportunity: CRMOpportunity): Promise<CRMOpportunity>;
  updateOpportunity(
    opportunityId: string,
    opportunity: Partial<CRMOpportunity>,
  ): Promise<CRMOpportunity>;
  getContact(contactId: string): Promise<CRMContact | null>;
  getOpportunity(opportunityId: string): Promise<CRMOpportunity | null>;
  searchContacts(query: string, userId: string): Promise<CRMContact[]>;
  searchOpportunities(query: string, userId: string): Promise<CRMOpportunity[]>;
}

// Base CRM Service implementation
export abstract class BaseCRMService implements ICRMService {
  protected integrationType: IntegrationType;
  protected config: IntegrationConfig;
  protected authenticated: boolean = false;

  constructor(integrationType: IntegrationType, config: IntegrationConfig) {
    this.integrationType = integrationType;
    this.config = config;
  }

  // Abstract methods to be implemented by specific CRM services
  abstract authenticate(credentials: Record<string, any>): Promise<boolean>;
  abstract syncContacts(userId: string, clientId: string): Promise<SyncResult>;
  abstract syncOpportunities(userId: string, clientId: string): Promise<SyncResult>;
  abstract createContact(contact: CRMContact): Promise<CRMContact>;
  abstract updateContact(contactId: string, contact: Partial<CRMContact>): Promise<CRMContact>;
  abstract createOpportunity(opportunity: CRMOpportunity): Promise<CRMOpportunity>;
  abstract updateOpportunity(
    opportunityId: string,
    opportunity: Partial<CRMOpportunity>,
  ): Promise<CRMOpportunity>;
  abstract getContact(contactId: string): Promise<CRMContact | null>;
  abstract getOpportunity(opportunityId: string): Promise<CRMOpportunity | null>;
  abstract searchContacts(query: string, userId: string): Promise<CRMContact[]>;
  abstract searchOpportunities(query: string, userId: string): Promise<CRMOpportunity[]>;

  // Common utility methods
  protected validateCredentials(credentials: Record<string, any>): void {
    if (!credentials || typeof credentials !== 'object') {
      throw createIntegrationError(
        'Invalid credentials provided',
        this.integrationType,
        this.config.userId
      );
    }
  }

  protected validateContact(contact: CRMContact): void {
    if (!contact.email || !contact.email.includes('@')) {
      throw createIntegrationError(
        'Invalid contact email',
        this.integrationType,
        this.config.userId
      );
    }

    if (!contact.firstName && !contact.lastName) {
      throw createIntegrationError(
        'Contact must have at least first name or last name',
        this.integrationType,
        this.config.userId
      );
    }
  }

  protected validateOpportunity(opportunity: CRMOpportunity): void {
    if (!opportunity.name || opportunity.name.trim().length === 0) {
      throw createIntegrationError(
        'Opportunity name is required',
        this.integrationType,
        this.config.userId
      );
    }

    if (!opportunity.contactId) {
      throw createIntegrationError(
        'Opportunity must be associated with a contact',
        this.integrationType,
        this.config.userId
      );
    }
  }

  protected async handleApiError(error: any, operation: string): Promise<never> {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown API error';
    const statusCode = error.response?.status || 500;

    logIntegrationError(new Error(errorMessage), this.integrationType, this.config.userId, {
      operation,
      statusCode,
      url: error.config?.url,
      method: error.config?.method,
    });

    throw createExternalServiceError(
      `${operation} failed: ${errorMessage}`,
      this.integrationType,
      this.config.userId
    );
  }

  protected async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on authentication or validation errors
        if (error instanceof Error && 'retryable' in error && !(error as any).retryable) {
          throw error;
        }

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1);
        logger.warn('Retrying operation', {
          integrationType: this.integrationType,
          userId: this.config.userId,
          attempt,
          maxRetries,
          waitTime,
          error: lastError.message,
        });

        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw lastError!;
  }

  protected createSyncResult(
    success: boolean,
    recordsProcessed: number,
    recordsCreated: number,
    recordsUpdated: number,
    recordsFailed: number,
    errors?: string[],
    duration?: number
  ): SyncResult {
    const result: SyncResult = {
      success,
      recordsProcessed,
      recordsCreated,
      recordsUpdated,
      recordsFailed,
      errors: errors || [],
      duration: duration || 0,
      timestamp: new Date().toISOString(),
    };

    logSyncResult(this.integrationType, this.config.userId, result);
    return result;
  }

  protected async logOperation(operation: string, data: Record<string, any> = {}): Promise<void> {
    logIntegrationEvent(operation, this.integrationType, this.config.userId, data);
  }

  // Common data transformation methods
  protected transformContactFromCRM(crmContact: any): CRMContact {
    return {
      id: crmContact.id || crmContact.Id,
      email: crmContact.email || crmContact.Email,
      firstName: crmContact.firstName || crmContact.FirstName || crmContact.first_name,
      lastName: crmContact.lastName || crmContact.LastName || crmContact.last_name,
      phone: crmContact.phone || crmContact.Phone || crmContact.phone_number,
      company: crmContact.company || crmContact.Company || crmContact.company_name,
      title: crmContact.title || crmContact.Title || crmContact.job_title,
      source: this.integrationType,
      customFields: this.extractCustomFields(crmContact),
      createdAt: crmContact.createdAt || crmContact.CreatedDate || new Date().toISOString(),
      updatedAt: crmContact.updatedAt || crmContact.LastModifiedDate || new Date().toISOString(),
    };
  }

  protected transformOpportunityFromCRM(crmOpportunity: any): CRMOpportunity {
    return {
      id: crmOpportunity.id || crmOpportunity.Id,
      name: crmOpportunity.name || crmOpportunity.Name || crmOpportunity.opportunity_name,
      amount: crmOpportunity.amount || crmOpportunity.Amount || crmOpportunity.value,
      stage: crmOpportunity.stage || crmOpportunity.StageName || crmOpportunity.stage_name,
      probability:
        crmOpportunity.probability ||
        crmOpportunity.Probability ||
        crmOpportunity.probability_percent,
      closeDate: crmOpportunity.closeDate || crmOpportunity.CloseDate || crmOpportunity.close_date,
      contactId: crmOpportunity.contactId || crmOpportunity.ContactId || crmOpportunity.contact_id,
      source: this.integrationType,
      customFields: this.extractCustomFields(crmOpportunity),
      createdAt: crmOpportunity.createdAt || crmOpportunity.CreatedDate || new Date().toISOString(),
      updatedAt:
        crmOpportunity.updatedAt || crmOpportunity.LastModifiedDate || new Date().toISOString(),
    };
  }

  protected transformContactToCRM(contact: CRMContact): any {
    return {
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
      company: contact.company,
      title: contact.title,
      ...contact.customFields,
    };
  }

  protected transformOpportunityToCRM(opportunity: CRMOpportunity): any {
    return {
      name: opportunity.name,
      amount: opportunity.amount,
      stage: opportunity.stage,
      probability: opportunity.probability,
      closeDate: opportunity.closeDate,
      contactId: opportunity.contactId,
      ...opportunity.customFields,
    };
  }

  protected extractCustomFields(crmObject: any): Record<string, any> {
    const customFields: Record<string, any> = {};
    const excludeFields = [
      'id',
      'Id',
      'email',
      'Email',
      'firstName',
      'FirstName',
      'first_name',
      'lastName',
      'LastName',
      'last_name',
      'phone',
      'Phone',
      'phone_number',
      'company',
      'Company',
      'company_name',
      'title',
      'Title',
      'job_title',
      'createdAt',
      'CreatedDate',
      'updatedAt',
      'LastModifiedDate',
      'name',
      'Name',
      'amount',
      'Amount',
      'value',
      'stage',
      'StageName',
      'stage_name',
      'probability',
      'Probability',
      'probability_percent',
      'closeDate',
      'CloseDate',
      'close_date',
      'contactId',
      'ContactId',
      'contact_id',
    ];

    for (const [key, value] of Object.entries(crmObject)) {
      if (!excludeFields.includes(key) && value !== null && value !== undefined) {
        customFields[key] = value;
      }
    }

    return customFields;
  }

  // Health check method
  public async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const isAuthenticated = await this.authenticate(this.config.credentials);
      return {
        status: isAuthenticated ? 'healthy' : 'unhealthy',
        details: {
          integrationType: this.integrationType,
          authenticated: isAuthenticated,
          lastCheck: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          integrationType: this.integrationType,
          error: error instanceof Error ? error.message : 'Unknown error',
          lastCheck: new Date().toISOString(),
        },
      };
    }
  }
}
