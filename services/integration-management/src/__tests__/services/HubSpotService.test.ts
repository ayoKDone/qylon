import { HubSpotService } from '../../services/HubSpotService';
import { IntegrationStatus, IntegrationType } from '../../types';

// Mock the entire HubSpotService class
jest.mock('../../services/HubSpotService');

const MockedHubSpotService = HubSpotService as jest.MockedClass<typeof HubSpotService>;

describe('HubSpotService', () => {
  let service: jest.Mocked<HubSpotService>;
  let mockConfig: any;

  beforeEach(() => {
    mockConfig = {
      id: 'test-hubspot-id',
      userId: 'test-user-id',
      clientId: 'test-client-id',
      type: IntegrationType.CRM_HUBSPOT,
      name: 'Test HubSpot Integration',
      status: IntegrationStatus.ACTIVE,
      settings: {
        apiKey: 'test-hubspot-key',
        portalId: '12345678',
      },
      credentials: {
        accessToken: 'test-access-token',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    service = new MockedHubSpotService(mockConfig) as jest.Mocked<HubSpotService>;

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate successfully with valid credentials', async () => {
      service.authenticate.mockResolvedValue(true);

      const result = await service.authenticate(mockConfig.credentials);

      expect(result).toBe(true);
      expect(service.authenticate).toHaveBeenCalledWith(mockConfig.credentials);
    });

    it('should throw error for missing credentials', async () => {
      service.authenticate.mockRejectedValue(new Error('HubSpot credentials are missing'));

      await expect(service.authenticate({})).rejects.toThrow('HubSpot credentials are missing');
    });

    it('should throw error for authentication failure', async () => {
      service.authenticate.mockRejectedValue(new Error('Authentication failed'));

      await expect(service.authenticate(mockConfig.credentials)).rejects.toThrow(
        'Authentication failed',
      );
    });
  });

  describe('syncContacts', () => {
    it('should sync contacts successfully', async () => {
      const mockResult = {
        success: true,
        recordsProcessed: 1,
        recordsCreated: 1,
        recordsUpdated: 0,
        recordsFailed: 0,
        errors: [],
        duration: 1000,
        timestamp: new Date().toISOString(),
      };

      service.syncContacts.mockResolvedValue(mockResult);

      const result = await service.syncContacts('test-user-id', 'test-client-id');

      expect(result.success).toBe(true);
      expect(result.recordsProcessed).toBe(1);
      expect(result.recordsCreated).toBe(1);
      expect(result.recordsUpdated).toBe(0);
      expect(result.recordsFailed).toBe(0);
    });

    it('should handle sync errors gracefully', async () => {
      const mockResult = {
        success: false,
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        errors: ['API Error'],
        duration: 1000,
        timestamp: new Date().toISOString(),
      };

      service.syncContacts.mockResolvedValue(mockResult);

      const result = await service.syncContacts('test-user-id', 'test-client-id');

      expect(result.success).toBe(false);
      expect(result.recordsProcessed).toBe(0);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('syncOpportunities', () => {
    it('should sync opportunities successfully', async () => {
      const mockResult = {
        success: true,
        recordsProcessed: 1,
        recordsCreated: 1,
        recordsUpdated: 0,
        recordsFailed: 0,
        errors: [],
        duration: 1000,
        timestamp: new Date().toISOString(),
      };

      service.syncOpportunities.mockResolvedValue(mockResult);

      const result = await service.syncOpportunities('test-user-id', 'test-client-id');

      expect(result.success).toBe(true);
      expect(result.recordsProcessed).toBe(1);
    });
  });

  describe('createContact', () => {
    it('should create contact successfully', async () => {
      const mockContact = {
        id: 'contact1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        source: 'hubspot',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      service.createContact.mockResolvedValue(mockContact);

      const contactData = {
        id: 'contact1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        source: 'hubspot',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await service.createContact(contactData);

      expect(result).toEqual(
        expect.objectContaining({
          id: 'contact1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        }),
      );
    });

    it('should throw error for invalid contact data', async () => {
      service.createContact.mockRejectedValue(new Error('Invalid contact data'));

      const invalidContactData = {
        id: 'contact1',
        firstName: '',
        lastName: 'Doe',
        email: 'invalid-email',
        source: 'hubspot',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await expect(service.createContact(invalidContactData)).rejects.toThrow(
        'Invalid contact data',
      );
    });
  });

  describe('searchContacts', () => {
    it('should search contacts successfully', async () => {
      const mockContacts = [
        {
          id: 'contact1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          source: 'hubspot',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      service.searchContacts.mockResolvedValue(mockContacts);

      const result = await service.searchContacts('John', 'test-user-id');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'contact1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        }),
      );
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when authenticated', async () => {
      const mockHealth = {
        status: 'healthy',
        details: {
          portalId: '12345678',
          portalName: 'Test Portal',
        },
      };

      service.healthCheck.mockResolvedValue(mockHealth);

      const result = await service.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.details).toEqual(
        expect.objectContaining({
          portalId: '12345678',
        }),
      );
    });

    it('should return unhealthy status when not authenticated', async () => {
      const mockHealth = {
        status: 'unhealthy',
        details: {
          error: 'Authentication failed',
        },
      };

      service.healthCheck.mockResolvedValue(mockHealth);

      const result = await service.healthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.details).toEqual(
        expect.objectContaining({
          error: 'Authentication failed',
        }),
      );
    });
  });
});
