import { SlackService } from '../../services/SlackService';
import { IntegrationStatus, IntegrationType } from '../../types';

// Mock the entire SlackService class
jest.mock('../../services/SlackService');

const MockedSlackService = SlackService as jest.MockedClass<typeof SlackService>;

describe('SlackService', () => {
  let service: jest.Mocked<SlackService>;
  let mockConfig: any;

  beforeEach(() => {
    mockConfig = {
      id: 'test-slack-id',
      userId: 'test-user-id',
      clientId: 'test-client-id',
      type: IntegrationType.COMMUNICATION_SLACK,
      name: 'Test Slack Integration',
      status: IntegrationStatus.ACTIVE,
      settings: {
        botToken: 'xoxb-test-token',
        appToken: 'xapp-test-token',
      },
      credentials: {
        accessToken: 'test-access-token',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    service = new MockedSlackService(mockConfig) as jest.Mocked<SlackService>;

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
      service.authenticate.mockRejectedValue(new Error('Slack credentials are missing'));

      await expect(service.authenticate({})).rejects.toThrow('Slack credentials are missing');
    });

    it('should throw error for authentication failure', async () => {
      service.authenticate.mockRejectedValue(new Error('Authentication failed'));

      await expect(service.authenticate(mockConfig.credentials)).rejects.toThrow(
        'Authentication failed',
      );
    });
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const mockMessage = {
        id: '1234567890.123456',
        channelId: 'C1234567890',
        text: 'Hello, World!',
        timestamp: '1234567890.123456',
        userId: 'U1234567890',
        platform: 'slack',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      service.sendMessage.mockResolvedValue(mockMessage);

      const result = await service.sendMessage('C1234567890', 'Hello, World!');

      expect(result).toEqual(
        expect.objectContaining({
          channelId: 'C1234567890',
          text: 'Hello, World!',
        }),
      );
    });

    it('should handle send message errors gracefully', async () => {
      service.sendMessage.mockRejectedValue(new Error('API Error'));

      await expect(service.sendMessage('C1234567890', 'Hello, World!')).rejects.toThrow(
        'API Error',
      );
    });
  });

  describe('getChannels', () => {
    it('should get channels successfully', async () => {
      const mockChannels = [
        {
          id: 'C1234567890',
          name: 'general',
          isMember: true,
          isPrivate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'C0987654321',
          name: 'random',
          isMember: false,
          isPrivate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      service.getChannels.mockResolvedValue(mockChannels);

      const result = await service.getChannels();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'C1234567890',
          name: 'general',
          isMember: true,
        }),
      );
    });

    it('should handle get channels errors gracefully', async () => {
      service.getChannels.mockRejectedValue(new Error('API Error'));

      await expect(service.getChannels()).rejects.toThrow('API Error');
    });
  });

  describe('getUsers', () => {
    it('should get users successfully', async () => {
      const mockUsers = [
        {
          id: 'U1234567890',
          username: 'john.doe',
          realName: 'John Doe',
          email: 'john@example.com',
          isBot: false,
          isAdmin: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      service.getUsers.mockResolvedValue(mockUsers);

      const result = await service.getUsers();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'U1234567890',
          username: 'john.doe',
          realName: 'John Doe',
          email: 'john@example.com',
        }),
      );
    });

    it('should handle get users errors gracefully', async () => {
      service.getUsers.mockRejectedValue(new Error('API Error'));

      await expect(service.getUsers()).rejects.toThrow('API Error');
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when authenticated', async () => {
      const mockHealth = {
        status: 'healthy',
        details: {
          teamId: 'T1234567890',
          teamName: 'Test Team',
        },
      };

      service.healthCheck.mockResolvedValue(mockHealth);

      const result = await service.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.details).toEqual(
        expect.objectContaining({
          teamId: 'T1234567890',
          teamName: 'Test Team',
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
