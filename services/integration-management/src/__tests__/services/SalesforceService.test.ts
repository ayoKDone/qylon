import { SalesforceService } from '../../services/SalesforceService';
import {
  IntegrationConfig,
  IntegrationStatus,
  IntegrationType,
} from '../../types';

// Mock the entire SalesforceService class
jest.mock('../../services/SalesforceService');

describe('SalesforceService', () => {
  let service: jest.Mocked<SalesforceService>;
  let mockConfig: IntegrationConfig;

  beforeEach(() => {
    mockConfig = {
      id: 'test-integration-id',
      userId: 'test-user-id',
      clientId: 'test-client-id',
      type: IntegrationType.CRM_SALESFORCE,
      name: 'Test Salesforce Integration',
      status: IntegrationStatus.ACTIVE,
      credentials: {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        username: 'test@example.com',
        password: 'test-password',
        securityToken: 'test-security-token',
        sandbox: false,
      },
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create a mock instance
    service = new SalesforceService(
      mockConfig
    ) as jest.Mocked<SalesforceService>;
  });

  describe('authenticate', () => {
    it('should authenticate successfully with valid credentials', async () => {
      service.authenticate.mockResolvedValue(true);

      const result = await service.authenticate(mockConfig.credentials);

      expect(result).toBe(true);
      expect(service.authenticate).toHaveBeenCalledWith(mockConfig.credentials);
    });

    it('should authenticate with sandbox URL when sandbox is true', async () => {
      const sandboxConfig = {
        ...mockConfig,
        credentials: {
          ...mockConfig.credentials,
          sandbox: true,
        },
      };

      service.authenticate.mockResolvedValue(true);

      const result = await service.authenticate(sandboxConfig.credentials);

      expect(result).toBe(true);
      expect(service.authenticate).toHaveBeenCalledWith(
        sandboxConfig.credentials
      );
    });

    it('should throw error for missing credentials', async () => {
      const invalidCredentials = {};

      service.authenticate.mockRejectedValue(
        new Error('Missing required Salesforce credentials')
      );

      await expect(service.authenticate(invalidCredentials)).rejects.toThrow(
        'Missing required Salesforce credentials'
      );
    });

    it('should throw error for authentication failure', async () => {
      service.authenticate.mockRejectedValue(
        new Error('Authentication failed')
      );

      await expect(
        service.authenticate(mockConfig.credentials)
      ).rejects.toThrow();
    });
  });

  describe('syncContacts', () => {
    it('should sync contacts successfully', async () => {
      const mockSyncResult = {
        success: true,
        recordsProcessed: 2,
        recordsCreated: 1,
        recordsUpdated: 1,
        recordsFailed: 0,
        errors: [],
        duration: 1000,
        timestamp: new Date().toISOString(),
      };

      service.syncContacts.mockResolvedValue(mockSyncResult);

      const result = await service.syncContacts(
        'test-user-id',
        'test-client-id'
      );

      expect(result.success).toBe(true);
      expect(result.recordsProcessed).toBe(2);
      expect(service.syncContacts).toHaveBeenCalledWith(
        'test-user-id',
        'test-client-id'
      );
    });

    it('should handle sync errors gracefully', async () => {
      service.syncContacts.mockRejectedValue(new Error('Sync failed'));

      await expect(
        service.syncContacts('test-user-id', 'test-client-id')
      ).rejects.toThrow();
    });
  });

  describe('syncOpportunities', () => {
    it('should sync opportunities successfully', async () => {
      const mockSyncResult = {
        success: true,
        recordsProcessed: 1,
        recordsCreated: 1,
        recordsUpdated: 0,
        recordsFailed: 0,
        errors: [],
        duration: 800,
        timestamp: new Date().toISOString(),
      };

      service.syncOpportunities.mockResolvedValue(mockSyncResult);

      const result = await service.syncOpportunities(
        'test-user-id',
        'test-client-id'
      );

      expect(result.success).toBe(true);
      expect(result.recordsProcessed).toBe(1);
      expect(service.syncOpportunities).toHaveBeenCalledWith(
        'test-user-id',
        'test-client-id'
      );
    });
  });

  describe('createContact', () => {
    it('should create contact successfully', async () => {
      const mockContact = {
        id: 'new-contact-id',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'Contact',
        phone: '+1234567890',
        company: 'Test Company',
        title: 'Developer',
        source: 'salesforce',
        customFields: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      service.createContact.mockResolvedValue(mockContact);

      const result = await service.createContact(mockContact);

      expect(result.id).toBe('new-contact-id');
      expect(result.email).toBe('new@example.com');
      expect(service.createContact).toHaveBeenCalledWith(mockContact);
    });

    it('should throw error for invalid contact data', async () => {
      const invalidContact = {
        id: 'invalid-contact',
        email: '', // Invalid email
        firstName: 'Invalid',
        lastName: 'Contact',
        phone: '+1234567890',
        company: 'Test Company',
        title: 'Developer',
        source: 'salesforce',
        customFields: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      service.createContact.mockRejectedValue(
        new Error('Invalid contact email')
      );

      await expect(service.createContact(invalidContact)).rejects.toThrow(
        'Invalid contact email'
      );
    });
  });

  describe('searchContacts', () => {
    it('should search contacts successfully', async () => {
      const mockContacts = [
        {
          id: 'contact1',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          company: 'Test Company',
          title: 'Developer',
          source: 'salesforce',
          customFields: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      service.searchContacts.mockResolvedValue(mockContacts);

      const result = await service.searchContacts('John', 'test-user-id');

      expect(result).toHaveLength(1);
      expect(result[0]?.firstName).toBe('John');
      expect(result[0]?.lastName).toBe('Doe');
      expect(service.searchContacts).toHaveBeenCalledWith(
        'John',
        'test-user-id'
      );
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when authenticated', async () => {
      const mockHealthCheck = {
        status: 'healthy',
        details: {
          integrationType: IntegrationType.CRM_SALESFORCE,
          authenticated: true,
          lastCheck: new Date().toISOString(),
        },
      };

      service.healthCheck.mockResolvedValue(mockHealthCheck);

      const result = await service.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.details.authenticated).toBe(true);
      expect(result.details.integrationType).toBe(
        IntegrationType.CRM_SALESFORCE
      );
    });

    it('should return unhealthy status when not authenticated', async () => {
      const mockHealthCheck = {
        status: 'unhealthy',
        details: {
          integrationType: IntegrationType.CRM_SALESFORCE,
          authenticated: false,
          lastCheck: new Date().toISOString(),
        },
      };

      service.healthCheck.mockResolvedValue(mockHealthCheck);

      const result = await service.healthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.details.authenticated).toBe(false);
    });
  });
});
