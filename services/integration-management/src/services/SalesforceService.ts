import axios, { AxiosInstance } from 'axios';
import {
  CRMContact,
  CRMOpportunity,
  IntegrationConfig,
  IntegrationType,
  SyncResult,
} from '../types';
import { BaseCRMService } from './CRMService';

interface SalesforceAuthResponse {
  access_token: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  signature: string;
}

interface SalesforceContact {
  Id: string;
  Email: string;
  FirstName: string;
  LastName: string;
  Phone: string;
  Company: string;
  Title: string;
  CreatedDate: string;
  LastModifiedDate: string;
  [key: string]: any;
}

interface SalesforceOpportunity {
  Id: string;
  Name: string;
  Amount: number;
  StageName: string;
  Probability: number;
  CloseDate: string;
  ContactId: string;
  CreatedDate: string;
  LastModifiedDate: string;
  [key: string]: any;
}

interface SalesforceQueryResponse<T> {
  totalSize: number;
  done: boolean;
  records: T[];
}

export class SalesforceService extends BaseCRMService {
  private apiClient: AxiosInstance;
  private accessToken: string | null = null;
  private instanceUrl: string | null = null;

  constructor(config: IntegrationConfig) {
    super(IntegrationType.CRM_SALESFORCE, config);
    this.apiClient = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  async authenticate(credentials: Record<string, any>): Promise<boolean> {
    try {
      this.validateCredentials(credentials);

      const {
        clientId,
        clientSecret,
        username,
        password,
        securityToken,
        sandbox = false,
      } = credentials;

      if (
        !clientId ||
        !clientSecret ||
        !username ||
        !password ||
        !securityToken
      ) {
        throw new Error('Missing required Salesforce credentials');
      }

      const authUrl = sandbox
        ? 'https://test.salesforce.com/services/oauth2/token'
        : 'https://login.salesforce.com/services/oauth2/token';

      const authData = new URLSearchParams({
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username: username,
        password: password + securityToken,
      });

      const response = await this.apiClient.post<SalesforceAuthResponse>(
        authUrl,
        authData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.instanceUrl = response.data.instance_url;

      this.apiClient.defaults.baseURL = this.instanceUrl;
      this.apiClient.defaults.headers.common['Authorization'] =
        `Bearer ${this.accessToken}`;

      this.authenticated = true;

      await this.logOperation('authentication_success', {
        instanceUrl: this.instanceUrl,
        sandbox,
      });

      return true;
    } catch (error) {
      await this.logOperation('authentication_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw await this.handleApiError(error, 'Authentication');
    }
  }

  async syncContacts(userId: string, clientId: string): Promise<SyncResult> {
    const startTime = Date.now();
    let recordsProcessed = 0;
    let recordsCreated = 0;
    let recordsUpdated = 0;
    let recordsFailed = 0;
    const errors: string[] = [];

    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Salesforce');
      }

      await this.logOperation('sync_contacts_started', { userId, clientId });

      // Query all contacts from Salesforce
      const soql = `
        SELECT Id, Email, FirstName, LastName, Phone, Company, Title,
               CreatedDate, LastModifiedDate
        FROM Contact
        WHERE Email != null
        ORDER BY LastModifiedDate DESC
      `;

      const response = await this.apiClient.get<
        SalesforceQueryResponse<SalesforceContact>
      >(`/services/data/v58.0/query/?q=${encodeURIComponent(soql)}`);

      const salesforceContacts = response.data.records;
      recordsProcessed = salesforceContacts.length;

      // Process each contact
      for (const salesforceContact of salesforceContacts) {
        try {
          const contact = this.transformContactFromCRM(salesforceContact);

          // Check if contact exists in our system
          const existingContact = await this.getContactFromDatabase(
            contact.id,
            userId
          );

          if (existingContact) {
            // Update existing contact
            await this.updateContactInDatabase(contact.id, contact, userId);
            recordsUpdated++;
          } else {
            // Create new contact
            await this.createContactInDatabase(contact, userId, clientId);
            recordsCreated++;
          }
        } catch (error) {
          recordsFailed++;
          errors.push(
            `Contact ${salesforceContact.Id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      const duration = Date.now() - startTime;
      const result = this.createSyncResult(
        recordsFailed === 0,
        recordsProcessed,
        recordsCreated,
        recordsUpdated,
        recordsFailed,
        errors,
        duration
      );

      await this.logOperation('sync_contacts_completed', {
        userId,
        clientId,
        ...result,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.logOperation('sync_contacts_failed', {
        userId,
        clientId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      });
      throw await this.handleApiError(error, 'Sync Contacts');
    }
  }

  async syncOpportunities(
    userId: string,
    clientId: string
  ): Promise<SyncResult> {
    const startTime = Date.now();
    let recordsProcessed = 0;
    let recordsCreated = 0;
    let recordsUpdated = 0;
    let recordsFailed = 0;
    const errors: string[] = [];

    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Salesforce');
      }

      await this.logOperation('sync_opportunities_started', {
        userId,
        clientId,
      });

      // Query all opportunities from Salesforce
      const soql = `
        SELECT Id, Name, Amount, StageName, Probability, CloseDate, ContactId,
               CreatedDate, LastModifiedDate
        FROM Opportunity
        WHERE ContactId != null
        ORDER BY LastModifiedDate DESC
      `;

      const response = await this.apiClient.get<
        SalesforceQueryResponse<SalesforceOpportunity>
      >(`/services/data/v58.0/query/?q=${encodeURIComponent(soql)}`);

      const salesforceOpportunities = response.data.records;
      recordsProcessed = salesforceOpportunities.length;

      // Process each opportunity
      for (const salesforceOpportunity of salesforceOpportunities) {
        try {
          const opportunity = this.transformOpportunityFromCRM(
            salesforceOpportunity
          );

          // Check if opportunity exists in our system
          const existingOpportunity = await this.getOpportunityFromDatabase(
            opportunity.id,
            userId
          );

          if (existingOpportunity) {
            // Update existing opportunity
            await this.updateOpportunityInDatabase(
              opportunity.id,
              opportunity,
              userId
            );
            recordsUpdated++;
          } else {
            // Create new opportunity
            await this.createOpportunityInDatabase(
              opportunity,
              userId,
              clientId
            );
            recordsCreated++;
          }
        } catch (error) {
          recordsFailed++;
          errors.push(
            `Opportunity ${salesforceOpportunity.Id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      const duration = Date.now() - startTime;
      const result = this.createSyncResult(
        recordsFailed === 0,
        recordsProcessed,
        recordsCreated,
        recordsUpdated,
        recordsFailed,
        errors,
        duration
      );

      await this.logOperation('sync_opportunities_completed', {
        userId,
        clientId,
        ...result,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.logOperation('sync_opportunities_failed', {
        userId,
        clientId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      });
      throw await this.handleApiError(error, 'Sync Opportunities');
    }
  }

  async createContact(contact: CRMContact): Promise<CRMContact> {
    try {
      this.validateContact(contact);

      if (!this.authenticated) {
        throw new Error('Not authenticated with Salesforce');
      }

      const salesforceContact = this.transformContactToCRM(contact);

      const response = await this.apiClient.post(
        '/services/data/v58.0/sobjects/Contact/',
        salesforceContact
      );

      const createdContact = {
        ...contact,
        id: response.data.id,
      };

      await this.logOperation('contact_created', {
        contactId: createdContact.id,
        email: createdContact.email,
      });

      return createdContact;
    } catch (error) {
      throw await this.handleApiError(error, 'Create Contact');
    }
  }

  async updateContact(
    contactId: string,
    contact: Partial<CRMContact>
  ): Promise<CRMContact> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Salesforce');
      }

      const salesforceContact = this.transformContactToCRM(
        contact as CRMContact
      );

      await this.apiClient.patch(
        `/services/data/v58.0/sobjects/Contact/${contactId}`,
        salesforceContact
      );

      const updatedContact = await this.getContact(contactId);
      if (!updatedContact) {
        throw new Error('Contact not found after update');
      }

      await this.logOperation('contact_updated', {
        contactId,
        email: updatedContact.email,
      });

      return updatedContact;
    } catch (error) {
      throw await this.handleApiError(error, 'Update Contact');
    }
  }

  async createOpportunity(
    opportunity: CRMOpportunity
  ): Promise<CRMOpportunity> {
    try {
      this.validateOpportunity(opportunity);

      if (!this.authenticated) {
        throw new Error('Not authenticated with Salesforce');
      }

      const salesforceOpportunity = this.transformOpportunityToCRM(opportunity);

      const response = await this.apiClient.post(
        '/services/data/v58.0/sobjects/Opportunity/',
        salesforceOpportunity
      );

      const createdOpportunity = {
        ...opportunity,
        id: response.data.id,
      };

      await this.logOperation('opportunity_created', {
        opportunityId: createdOpportunity.id,
        name: createdOpportunity.name,
      });

      return createdOpportunity;
    } catch (error) {
      throw await this.handleApiError(error, 'Create Opportunity');
    }
  }

  async updateOpportunity(
    opportunityId: string,
    opportunity: Partial<CRMOpportunity>
  ): Promise<CRMOpportunity> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Salesforce');
      }

      const salesforceOpportunity = this.transformOpportunityToCRM(
        opportunity as CRMOpportunity
      );

      await this.apiClient.patch(
        `/services/data/v58.0/sobjects/Opportunity/${opportunityId}`,
        salesforceOpportunity
      );

      const updatedOpportunity = await this.getOpportunity(opportunityId);
      if (!updatedOpportunity) {
        throw new Error('Opportunity not found after update');
      }

      await this.logOperation('opportunity_updated', {
        opportunityId,
        name: updatedOpportunity.name,
      });

      return updatedOpportunity;
    } catch (error) {
      throw await this.handleApiError(error, 'Update Opportunity');
    }
  }

  async getContact(contactId: string): Promise<CRMContact | null> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Salesforce');
      }

      const response = await this.apiClient.get<SalesforceContact>(
        `/services/data/v58.0/sobjects/Contact/${contactId}`
      );

      return this.transformContactFromCRM(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw await this.handleApiError(error, 'Get Contact');
    }
  }

  async getOpportunity(opportunityId: string): Promise<CRMOpportunity | null> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Salesforce');
      }

      const response = await this.apiClient.get<SalesforceOpportunity>(
        `/services/data/v58.0/sobjects/Opportunity/${opportunityId}`
      );

      return this.transformOpportunityFromCRM(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw await this.handleApiError(error, 'Get Opportunity');
    }
  }

  async searchContacts(query: string, _userId: string): Promise<CRMContact[]> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Salesforce');
      }

      const soql = `
        SELECT Id, Email, FirstName, LastName, Phone, Company, Title,
               CreatedDate, LastModifiedDate
        FROM Contact
        WHERE (FirstName LIKE '%${query}%' OR LastName LIKE '%${query}%' OR Email LIKE '%${query}%')
        LIMIT 50
      `;

      const response = await this.apiClient.get<
        SalesforceQueryResponse<SalesforceContact>
      >(`/services/data/v58.0/query/?q=${encodeURIComponent(soql)}`);

      return response.data.records.map(contact =>
        this.transformContactFromCRM(contact)
      );
    } catch (error) {
      throw await this.handleApiError(error, 'Search Contacts');
    }
  }

  async searchOpportunities(
    query: string,
    _userId: string
  ): Promise<CRMOpportunity[]> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with Salesforce');
      }

      const soql = `
        SELECT Id, Name, Amount, StageName, Probability, CloseDate, ContactId,
               CreatedDate, LastModifiedDate
        FROM Opportunity
        WHERE Name LIKE '%${query}%'
        LIMIT 50
      `;

      const response = await this.apiClient.get<
        SalesforceQueryResponse<SalesforceOpportunity>
      >(`/services/data/v58.0/query/?q=${encodeURIComponent(soql)}`);

      return response.data.records.map(opportunity =>
        this.transformOpportunityFromCRM(opportunity)
      );
    } catch (error) {
      throw await this.handleApiError(error, 'Search Opportunities');
    }
  }

  // Database helper methods (to be implemented with Supabase)
  private async getContactFromDatabase(
    _contactId: string,
    _userId: string
  ): Promise<CRMContact | null> {
    // TODO: Implement Supabase query
    return null;
  }

  private async createContactInDatabase(
    _contact: CRMContact,
    _userId: string,
    _clientId: string
  ): Promise<void> {
    // TODO: Implement Supabase insert
  }

  private async updateContactInDatabase(
    _contactId: string,
    _contact: CRMContact,
    _userId: string
  ): Promise<void> {
    // TODO: Implement Supabase update
  }

  private async getOpportunityFromDatabase(
    _opportunityId: string,
    _userId: string
  ): Promise<CRMOpportunity | null> {
    // TODO: Implement Supabase query
    return null;
  }

  private async createOpportunityInDatabase(
    _opportunity: CRMOpportunity,
    _userId: string,
    _clientId: string
  ): Promise<void> {
    // TODO: Implement Supabase insert
  }

  private async updateOpportunityInDatabase(
    _opportunityId: string,
    _opportunity: CRMOpportunity,
    _userId: string
  ): Promise<void> {
    // TODO: Implement Supabase update
  }
}
