import axios, { AxiosInstance } from 'axios';
import {
  CRMContact,
  CRMOpportunity,
  IntegrationConfig,
  IntegrationType,
  SyncResult,
} from '../types';
import { BaseCRMService } from './CRMService';

interface PipedrivePerson {
  id: number;
  name: string;
  email: Array<{ value: string; primary: boolean }>;
  phone: Array<{ value: string; primary: boolean }>;
  org_name: string;
  first_name: string;
  last_name: string;
  add_time: string;
  update_time: string;
  [key: string]: any;
}

interface PipedriveDeal {
  id: number;
  title: string;
  value: number;
  currency: string;
  stage_id: number;
  close_time: string;
  person_id: number;
  add_time: string;
  update_time: string;
  [key: string]: any;
}

interface PipedriveResponse<T> {
  success: boolean;
  data: T;
  additional_data?: {
    pagination?: {
      start: number;
      limit: number;
      more_items_in_collection: boolean;
    };
  };
}

interface PipedriveSearchResponse<T> {
  success: boolean;
  data: {
    items: T[];
  };
  additional_data?: {
    pagination?: {
      start: number;
      limit: number;
      more_items_in_collection: boolean;
    };
  };
}

export class PipedriveService extends BaseCRMService {
  private apiClient: AxiosInstance;
  private apiToken: string | null = null;

  constructor(config: IntegrationConfig) {
    super(IntegrationType.CRM_PIPEDRIVE, config);
    this.apiClient = axios.create({
      baseURL: 'https://api.pipedrive.com/v1',
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

      const { apiToken } = credentials;

      if (!apiToken) {
        throw new Error('Missing required Pipedrive API token');
      }

      this.apiToken = apiToken;

      // Test the connection by fetching user info
      const response = await this.apiClient.get('/users/me', {
        params: { api_token: this.apiToken },
      });

      if (!response.data.success) {
        throw new Error('Invalid Pipedrive API token');
      }

      this.authenticated = true;

      await this.logOperation('authentication_success', {
        hasApiToken: !!this.apiToken,
        userId: response.data.data.id,
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
        throw new Error('Not authenticated with Pipedrive');
      }

      await this.logOperation('sync_contacts_started', { userId, clientId });

      let start = 0;
      const limit = 500;
      let hasMore = true;

      while (hasMore) {
        const response = await this.apiClient.get<
          PipedriveResponse<PipedrivePerson[]>
        >('/persons', {
          params: {
            api_token: this.apiToken,
            start,
            limit,
          },
        });

        if (!response.data.success) {
          throw new Error('Failed to fetch persons from Pipedrive');
        }

        const pipedrivePersons = response.data.data;
        recordsProcessed += pipedrivePersons.length;

        // Process each person
        for (const pipedrivePerson of pipedrivePersons) {
          try {
            const contact = this.transformContactFromCRM(pipedrivePerson);

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
              `Person ${pipedrivePerson.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }

        // Check if there are more pages
        hasMore =
          response.data.additional_data?.pagination?.more_items_in_collection ||
          false;
        start += limit;
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
        throw new Error('Not authenticated with Pipedrive');
      }

      await this.logOperation('sync_opportunities_started', {
        userId,
        clientId,
      });

      let start = 0;
      const limit = 500;
      let hasMore = true;

      while (hasMore) {
        const response = await this.apiClient.get<
          PipedriveResponse<PipedriveDeal[]>
        >('/deals', {
          params: {
            api_token: this.apiToken,
            start,
            limit,
          },
        });

        if (!response.data.success) {
          throw new Error('Failed to fetch deals from Pipedrive');
        }

        const pipedriveDeals = response.data.data;
        recordsProcessed += pipedriveDeals.length;

        // Process each deal
        for (const pipedriveDeal of pipedriveDeals) {
          try {
            const opportunity = this.transformOpportunityFromCRM(pipedriveDeal);

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
              `Deal ${pipedriveDeal.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }

        // Check if there are more pages
        hasMore =
          response.data.additional_data?.pagination?.more_items_in_collection ||
          false;
        start += limit;
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
        throw new Error('Not authenticated with Pipedrive');
      }

      const pipedrivePerson = this.transformContactToCRM(contact);

      const response = await this.apiClient.post('/persons', {
        ...pipedrivePerson,
        api_token: this.apiToken,
      });

      if (!response.data.success) {
        throw new Error('Failed to create person in Pipedrive');
      }

      const createdContact = {
        ...contact,
        id: response.data.data.id.toString(),
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
        throw new Error('Not authenticated with Pipedrive');
      }

      const pipedrivePerson = this.transformContactToCRM(contact as CRMContact);

      const response = await this.apiClient.put(`/persons/${contactId}`, {
        ...pipedrivePerson,
        api_token: this.apiToken,
      });

      if (!response.data.success) {
        throw new Error('Failed to update person in Pipedrive');
      }

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
        throw new Error('Not authenticated with Pipedrive');
      }

      const pipedriveDeal = this.transformOpportunityToCRM(opportunity);

      const response = await this.apiClient.post('/deals', {
        ...pipedriveDeal,
        api_token: this.apiToken,
      });

      if (!response.data.success) {
        throw new Error('Failed to create deal in Pipedrive');
      }

      const createdOpportunity = {
        ...opportunity,
        id: response.data.data.id.toString(),
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
        throw new Error('Not authenticated with Pipedrive');
      }

      const pipedriveDeal = this.transformOpportunityToCRM(
        opportunity as CRMOpportunity
      );

      const response = await this.apiClient.put(`/deals/${opportunityId}`, {
        ...pipedriveDeal,
        api_token: this.apiToken,
      });

      if (!response.data.success) {
        throw new Error('Failed to update deal in Pipedrive');
      }

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
        throw new Error('Not authenticated with Pipedrive');
      }

      const response = await this.apiClient.get<
        PipedriveResponse<PipedrivePerson>
      >(`/persons/${contactId}`, {
        params: { api_token: this.apiToken },
      });

      if (!response.data.success) {
        return null;
      }

      return this.transformContactFromCRM(response.data.data);
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
        throw new Error('Not authenticated with Pipedrive');
      }

      const response = await this.apiClient.get<
        PipedriveResponse<PipedriveDeal>
      >(`/deals/${opportunityId}`, {
        params: { api_token: this.apiToken },
      });

      if (!response.data.success) {
        return null;
      }

      return this.transformOpportunityFromCRM(response.data.data);
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
        throw new Error('Not authenticated with Pipedrive');
      }

      const response = await this.apiClient.get<
        PipedriveSearchResponse<PipedrivePerson>
      >('/persons/search', {
        params: {
          api_token: this.apiToken,
          term: query,
          fields: 'name,email',
          limit: 50,
        },
      });

      if (!response.data.success) {
        return [];
      }

      return response.data.data.items.map(person =>
        this.transformContactFromCRM(person)
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
        throw new Error('Not authenticated with Pipedrive');
      }

      const response = await this.apiClient.get<
        PipedriveSearchResponse<PipedriveDeal>
      >('/deals/search', {
        params: {
          api_token: this.apiToken,
          term: query,
          fields: 'title',
          limit: 50,
        },
      });

      if (!response.data.success) {
        return [];
      }

      return response.data.data.items.map(deal =>
        this.transformOpportunityFromCRM(deal)
      );
    } catch (error) {
      throw await this.handleApiError(error, 'Search Opportunities');
    }
  }

  // Pipedrive-specific transformation methods
  protected override transformContactFromCRM(
    pipedrivePerson: PipedrivePerson
  ): CRMContact {
    const primaryEmail =
      pipedrivePerson.email?.find(e => e.primary)?.value ||
      pipedrivePerson.email?.[0]?.value;
    const primaryPhone =
      pipedrivePerson.phone?.find(p => p.primary)?.value ||
      pipedrivePerson.phone?.[0]?.value;

    return {
      id: pipedrivePerson.id.toString(),
      email: primaryEmail || '',
      firstName: pipedrivePerson.first_name,
      lastName: pipedrivePerson.last_name,
      phone: primaryPhone || '',
      company: pipedrivePerson.org_name,
      title: '', // Pipedrive doesn't have title field in persons
      source: this.integrationType,
      customFields: this.extractCustomFields(pipedrivePerson),
      createdAt: pipedrivePerson.add_time,
      updatedAt: pipedrivePerson.update_time,
    };
  }

  protected override transformOpportunityFromCRM(
    pipedriveDeal: PipedriveDeal
  ): CRMOpportunity {
    return {
      id: pipedriveDeal.id.toString(),
      name: pipedriveDeal.title,
      amount: pipedriveDeal.value,
      stage: pipedriveDeal.stage_id.toString(),
      probability: 0, // Pipedrive doesn't have probability field
      closeDate: pipedriveDeal.close_time,
      contactId: pipedriveDeal.person_id.toString(),
      source: this.integrationType,
      customFields: this.extractCustomFields(pipedriveDeal),
      createdAt: pipedriveDeal.add_time,
      updatedAt: pipedriveDeal.update_time,
    };
  }

  protected override transformContactToCRM(
    contact: CRMContact
  ): Record<string, any> {
    return {
      name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
      first_name: contact.firstName,
      last_name: contact.lastName,
      email: contact.email
        ? [{ value: contact.email, primary: true }]
        : undefined,
      phone: contact.phone
        ? [{ value: contact.phone, primary: true }]
        : undefined,
      org_name: contact.company,
      ...contact.customFields,
    };
  }

  protected override transformOpportunityToCRM(
    opportunity: CRMOpportunity
  ): Record<string, any> {
    return {
      title: opportunity.name,
      value: opportunity.amount,
      stage_id: opportunity.stage ? parseInt(opportunity.stage) : undefined,
      close_time: opportunity.closeDate,
      person_id: opportunity.contactId
        ? parseInt(opportunity.contactId)
        : undefined,
      ...opportunity.customFields,
    };
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
