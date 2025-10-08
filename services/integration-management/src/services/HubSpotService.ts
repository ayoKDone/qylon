import axios, { AxiosInstance } from 'axios';
import {
  CRMContact,
  CRMOpportunity,
  IntegrationConfig,
  IntegrationType,
  SyncResult,
} from '../types';
import { BaseCRMService } from './CRMService';

interface HubSpotContact {
  id: string;
  properties: {
    email: string;
    firstname: string;
    lastname: string;
    phone: string;
    company: string;
    jobtitle: string;
    createdate: string;
    lastmodifieddate: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

interface HubSpotDeal {
  id: string;
  properties: {
    dealname: string;
    amount: string;
    dealstage: string;
    closedate: string;
    hubspot_owner_id: string;
    associatedcontactids: string;
    createdate: string;
    lastmodifieddate: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

interface HubSpotSearchResponse<T> {
  total: number;
  results: T[];
  paging?: {
    next?: {
      after: string;
    };
  };
}

export class HubSpotService extends BaseCRMService {
  private apiClient: AxiosInstance;
  private accessToken: string | null = null;

  constructor(config: IntegrationConfig) {
    super(IntegrationType.CRM_HUBSPOT, config);
    this.apiClient = axios.create({
      baseURL: 'https://api.hubapi.com',
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

      const { accessToken } = credentials;

      if (!accessToken) {
        throw new Error('Missing required HubSpot access token');
      }

      this.accessToken = accessToken;
      this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;

      // Test the connection by fetching account info
      await this.apiClient.get('/crm/v3/objects/contacts?limit=1');

      this.authenticated = true;

      await this.logOperation('authentication_success', {
        hasAccessToken: !!this.accessToken,
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
        throw new Error('Not authenticated with HubSpot');
      }

      await this.logOperation('sync_contacts_started', { userId, clientId });

      let after: string | undefined;
      let hasMore = true;

      while (hasMore) {
        const params: any = {
          limit: 100,
          properties: 'email,firstname,lastname,phone,company,jobtitle,createdate,lastmodifieddate',
        };

        if (after) {
          params.after = after;
        }

        const response = await this.apiClient.get<HubSpotSearchResponse<HubSpotContact>>(
          '/crm/v3/objects/contacts',
          { params }
        );

        const hubspotContacts = response.data.results;
        recordsProcessed += hubspotContacts.length;

        // Process each contact
        for (const hubspotContact of hubspotContacts) {
          try {
            const contact = this.transformContactFromCRM(hubspotContact);

            // Check if contact exists in our system
            const existingContact = await this.getContactFromDatabase(contact.id, userId);

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
              `Contact ${hubspotContact.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }

        // Check if there are more pages
        hasMore = !!response.data.paging?.next?.after;
        after = response.data.paging?.next?.after;
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

  async syncOpportunities(userId: string, clientId: string): Promise<SyncResult> {
    const startTime = Date.now();
    let recordsProcessed = 0;
    let recordsCreated = 0;
    let recordsUpdated = 0;
    let recordsFailed = 0;
    const errors: string[] = [];

    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with HubSpot');
      }

      await this.logOperation('sync_opportunities_started', {
        userId,
        clientId,
      });

      let after: string | undefined;
      let hasMore = true;

      while (hasMore) {
        const params: any = {
          limit: 100,
          properties:
            'dealname,amount,dealstage,closedate,hubspot_owner_id,associatedcontactids,createdate,lastmodifieddate',
        };

        if (after) {
          params.after = after;
        }

        const response = await this.apiClient.get<HubSpotSearchResponse<HubSpotDeal>>(
          '/crm/v3/objects/deals',
          { params }
        );

        const hubspotDeals = response.data.results;
        recordsProcessed += hubspotDeals.length;

        // Process each deal
        for (const hubspotDeal of hubspotDeals) {
          try {
            const opportunity = this.transformOpportunityFromCRM(hubspotDeal);

            // Check if opportunity exists in our system
            const existingOpportunity = await this.getOpportunityFromDatabase(
              opportunity.id,
              userId
            );

            if (existingOpportunity) {
              // Update existing opportunity
              await this.updateOpportunityInDatabase(opportunity.id, opportunity, userId);
              recordsUpdated++;
            } else {
              // Create new opportunity
              await this.createOpportunityInDatabase(opportunity, userId, clientId);
              recordsCreated++;
            }
          } catch (error) {
            recordsFailed++;
            errors.push(
              `Deal ${hubspotDeal.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }

        // Check if there are more pages
        hasMore = !!response.data.paging?.next?.after;
        after = response.data.paging?.next?.after;
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
        throw new Error('Not authenticated with HubSpot');
      }

      const hubspotContact = this.transformContactToCRM(contact);

      const response = await this.apiClient.post('/crm/v3/objects/contacts', {
        properties: hubspotContact,
      });

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

  async updateContact(contactId: string, contact: Partial<CRMContact>): Promise<CRMContact> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with HubSpot');
      }

      const hubspotContact = this.transformContactToCRM(contact as CRMContact);

      await this.apiClient.patch(`/crm/v3/objects/contacts/${contactId}`, {
        properties: hubspotContact,
      });

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

  async createOpportunity(opportunity: CRMOpportunity): Promise<CRMOpportunity> {
    try {
      this.validateOpportunity(opportunity);

      if (!this.authenticated) {
        throw new Error('Not authenticated with HubSpot');
      }

      const hubspotDeal = this.transformOpportunityToCRM(opportunity);

      const response = await this.apiClient.post('/crm/v3/objects/deals', {
        properties: hubspotDeal,
      });

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
        throw new Error('Not authenticated with HubSpot');
      }

      const hubspotDeal = this.transformOpportunityToCRM(opportunity as CRMOpportunity);

      await this.apiClient.patch(`/crm/v3/objects/deals/${opportunityId}`, {
        properties: hubspotDeal,
      });

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
        throw new Error('Not authenticated with HubSpot');
      }

      const response = await this.apiClient.get<HubSpotContact>(
        `/crm/v3/objects/contacts/${contactId}`
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
        throw new Error('Not authenticated with HubSpot');
      }

      const response = await this.apiClient.get<HubSpotDeal>(
        `/crm/v3/objects/deals/${opportunityId}`
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
        throw new Error('Not authenticated with HubSpot');
      }

      const response = await this.apiClient.post<HubSpotSearchResponse<HubSpotContact>>(
        '/crm/v3/objects/contacts/search',
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'CONTAINS_TOKEN',
                  value: query,
                },
              ],
            },
          ],
          properties: [
            'email',
            'firstname',
            'lastname',
            'phone',
            'company',
            'jobtitle',
            'createdate',
            'lastmodifieddate',
          ],
          limit: 50,
        }
      );

      return response.data.results.map(contact => this.transformContactFromCRM(contact));
    } catch (error) {
      throw await this.handleApiError(error, 'Search Contacts');
    }
  }

  async searchOpportunities(query: string, _userId: string): Promise<CRMOpportunity[]> {
    try {
      if (!this.authenticated) {
        throw new Error('Not authenticated with HubSpot');
      }

      const response = await this.apiClient.post<HubSpotSearchResponse<HubSpotDeal>>(
        '/crm/v3/objects/deals/search',
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'dealname',
                  operator: 'CONTAINS_TOKEN',
                  value: query,
                },
              ],
            },
          ],
          properties: [
            'dealname',
            'amount',
            'dealstage',
            'closedate',
            'hubspot_owner_id',
            'associatedcontactids',
            'createdate',
            'lastmodifieddate',
          ],
          limit: 50,
        }
      );

      return response.data.results.map(deal => this.transformOpportunityFromCRM(deal));
    } catch (error) {
      throw await this.handleApiError(error, 'Search Opportunities');
    }
  }

  // HubSpot-specific transformation methods
  protected override transformContactFromCRM(hubspotContact: HubSpotContact): CRMContact {
    const properties = hubspotContact.properties;
    return {
      id: hubspotContact.id,
      email: properties.email,
      firstName: properties.firstname,
      lastName: properties.lastname,
      phone: properties.phone,
      company: properties.company,
      title: properties.jobtitle,
      source: this.integrationType,
      customFields: this.extractCustomFields(properties),
      createdAt: properties.createdate || hubspotContact.createdAt,
      updatedAt: properties.lastmodifieddate || hubspotContact.updatedAt,
    };
  }

  protected override transformOpportunityFromCRM(hubspotDeal: HubSpotDeal): CRMOpportunity {
    const properties = hubspotDeal.properties;
    return {
      id: hubspotDeal.id,
      name: properties.dealname,
      amount: properties.amount ? parseFloat(properties.amount) : 0,
      stage: properties.dealstage,
      probability: 0, // HubSpot doesn't have probability field
      closeDate: properties.closedate,
      contactId: properties.associatedcontactids,
      source: this.integrationType,
      customFields: this.extractCustomFields(properties),
      createdAt: properties.createdate || hubspotDeal.createdAt,
      updatedAt: properties.lastmodifieddate || hubspotDeal.updatedAt,
    };
  }

  protected override transformContactToCRM(contact: CRMContact): Record<string, any> {
    return {
      email: contact.email,
      firstname: contact.firstName,
      lastname: contact.lastName,
      phone: contact.phone,
      company: contact.company,
      jobtitle: contact.title,
      ...contact.customFields,
    };
  }

  protected override transformOpportunityToCRM(opportunity: CRMOpportunity): Record<string, any> {
    return {
      dealname: opportunity.name,
      amount: opportunity.amount?.toString(),
      dealstage: opportunity.stage,
      closedate: opportunity.closeDate,
      associatedcontactids: opportunity.contactId,
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
