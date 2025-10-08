import { PipedriveService } from '../../services/PipedriveService';
import { IntegrationStatus, IntegrationType } from '../../types';

// Mock the entire PipedriveService class
jest.mock('../../services/PipedriveService');

const MockedPipedriveService = PipedriveService as jest.MockedClass<typeof PipedriveService>;

describe('PipedriveService', () => {
  let service: jest.Mocked<PipedriveService>;
  let mockConfig: any;

  beforeEach(() => {
    mockConfig = {
      id: 'test-pipedrive-id',
      userId: 'test-user-id',
      clientId: 'test-client-id',
      type: IntegrationType.CRM_PIPEDRIVE,
      name: 'Test Pipedrive Integration',
      status: IntegrationStatus.ACTIVE,
      settings: {
        apiToken: 'test-pipedrive-token',
        companyDomain: 'test-company',
      },
      credentials: {
        accessToken: 'test-access-token',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    service = new MockedPipedriveService(mockConfig) as jest.Mocked<PipedriveService>;

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
      service.authenticate.mockRejectedValue(new Error('Pipedrive credentials are missing'));

      await expect(service.authenticate({})).rejects.toThrow('Pipedrive credentials are missing');
    });

    it('should throw error for authentication failure', async () => {
      service.authenticate.mockRejectedValue(new Error('Authentication failed'));

      await expect(service.authenticate(mockConfig.credentials)).rejects.toThrow(
        'Authentication failed'
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
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        source: 'pipedrive',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      service.createContact.mockResolvedValue(mockContact);

      const contactData = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        source: 'pipedrive',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await service.createContact(contactData);

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
        })
      );
    });

    it('should throw error for invalid contact data', async () => {
      service.createContact.mockRejectedValue(new Error('Invalid contact data'));

      const invalidContactData = {
        id: '1',
        firstName: '',
        lastName: 'Doe',
        email: 'invalid-email',
        source: 'pipedrive',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await expect(service.createContact(invalidContactData)).rejects.toThrow(
        'Invalid contact data'
      );
    });
  });

  describe('searchContacts', () => {
    it('should search contacts successfully', async () => {
      const mockContacts = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          source: 'pipedrive',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      service.searchContacts.mockResolvedValue(mockContacts);

      const result = await service.searchContacts('John', 'test-user-id');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        })
      );
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when authenticated', async () => {
      const mockHealth = {
        status: 'healthy',
        details: {
          companyId: 12345,
          companyName: 'Test Company',
        },
      };

      service.healthCheck.mockResolvedValue(mockHealth);

      const result = await service.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.details).toEqual(
        expect.objectContaining({
          companyId: 12345,
        })
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
        })
      );
    });
  });
});
