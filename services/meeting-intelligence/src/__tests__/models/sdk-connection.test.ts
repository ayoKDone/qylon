/**
 * Tests for SDKConnection model
 * Tests data validation, serialization, and business logic
 */

import { SDKConnection, SDKConnectionStatus, SDKPlatform } from '../../models/sdk-connection';

describe('SDKConnection', () => {
  describe('constructor and initialization', () => {
    it('should create SDKConnection with valid data', () => {
      const connectionData = {
        id: 'test-connection-id',
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'test-api-key',
        status: SDKConnectionStatus.ACTIVE,
        metadata: {
          botId: 'test-bot-id',
          webhookUrl: 'https://example.com/webhook',
        },
      };

      const connection = new SDKConnection(connectionData);

      expect(connection.id).toBe('test-connection-id');
      expect(connection.userId).toBe('test-user-id');
      expect(connection.platform).toBe(SDKPlatform.RECALL_AI);
      expect(connection.apiKey).toBe('test-api-key');
      expect(connection.status).toBe(SDKConnectionStatus.ACTIVE);
      expect(connection.metadata).toEqual(connectionData.metadata);
      expect(connection.createdAt).toBeInstanceOf(Date);
      expect(connection.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate UUID if no ID provided', () => {
      const connectionData = {
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'test-api-key',
        status: SDKConnectionStatus.ACTIVE,
      };

      const connection = new SDKConnection(connectionData);

      expect(connection.id).toBeDefined();
      expect(connection.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('should set default status if not provided', () => {
      const connectionData = {
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'test-api-key',
      };

      const connection = new SDKConnection(connectionData);

      expect(connection.status).toBe(SDKConnectionStatus.INACTIVE);
    });

    it('should set timestamps on creation', () => {
      const beforeCreation = new Date();
      const connectionData = {
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'test-api-key',
      };

      const connection = new SDKConnection(connectionData);
      const afterCreation = new Date();

      expect(connection.createdAt).toBeInstanceOf(Date);
      expect(connection.updatedAt).toBeInstanceOf(Date);
      expect(connection.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(connection.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
      expect(connection.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(connection.updatedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });
  });

  describe('validation', () => {
    it('should validate required fields', () => {
      const invalidData = {
        userId: '',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'test-api-key',
      };

      expect(() => new SDKConnection(invalidData)).toThrow('User ID is required');
    });

    it('should validate platform enum', () => {
      const invalidData = {
        userId: 'test-user-id',
        platform: 'invalid-platform' as any,
        apiKey: 'test-api-key',
      };

      expect(() => new SDKConnection(invalidData)).toThrow('Invalid platform');
    });

    it('should validate status enum', () => {
      const invalidData = {
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'test-api-key',
        status: 'invalid-status' as any,
      };

      expect(() => new SDKConnection(invalidData)).toThrow('Invalid status');
    });

    it('should validate API key format', () => {
      const invalidData = {
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: '',
      };

      expect(() => new SDKConnection(invalidData)).toThrow('API key is required');
    });

    it('should validate metadata structure', () => {
      const invalidData = {
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'test-api-key',
        metadata: 'invalid-metadata' as any,
      };

      expect(() => new SDKConnection(invalidData)).toThrow('Metadata must be an object');
    });
  });

  describe('updateStatus', () => {
    it('should update status and timestamp', () => {
      const connection = new SDKConnection({
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'test-api-key',
        status: SDKConnectionStatus.INACTIVE,
      });

      const originalUpdatedAt = connection.updatedAt;

      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        connection.updateStatus(SDKConnectionStatus.ACTIVE);

        expect(connection.status).toBe(SDKConnectionStatus.ACTIVE);
        expect(connection.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });

    it('should validate new status', () => {
      const connection = new SDKConnection({
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'test-api-key',
      });

      expect(() => connection.updateStatus('invalid-status' as any)).toThrow('Invalid status');
    });
  });

  describe('updateMetadata', () => {
    it('should update metadata and timestamp', () => {
      const connection = new SDKConnection({
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'test-api-key',
        metadata: { botId: 'old-bot-id' },
      });

      const originalUpdatedAt = connection.updatedAt;
      const newMetadata = {
        botId: 'new-bot-id',
        webhookUrl: 'https://example.com/webhook',
      };

      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        connection.updateMetadata(newMetadata);

        expect(connection.metadata).toEqual(newMetadata);
        expect(connection.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });

    it('should validate metadata structure', () => {
      const connection = new SDKConnection({
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'test-api-key',
      });

      expect(() => connection.updateMetadata('invalid-metadata' as any)).toThrow(
        'Metadata must be an object',
      );
    });
  });

  describe('isActive', () => {
    it('should return true for active connections', () => {
      const connection = new SDKConnection({
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'test-api-key',
        status: SDKConnectionStatus.ACTIVE,
      });

      expect(connection.isActive()).toBe(true);
    });

    it('should return false for inactive connections', () => {
      const connection = new SDKConnection({
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'test-api-key',
        status: SDKConnectionStatus.INACTIVE,
      });

      expect(connection.isActive()).toBe(false);
    });

    it('should return false for error connections', () => {
      const connection = new SDKConnection({
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'test-api-key',
        status: SDKConnectionStatus.ERROR,
      });

      expect(connection.isActive()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON correctly', () => {
      const connectionData = {
        id: 'test-connection-id',
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'test-api-key',
        status: SDKConnectionStatus.ACTIVE,
        metadata: { botId: 'test-bot-id' },
      };

      const connection = new SDKConnection(connectionData);
      const json = connection.toJSON();

      expect(json.id).toBe('test-connection-id');
      expect(json.userId).toBe('test-user-id');
      expect(json.platform).toBe(SDKPlatform.RECALL_AI);
      expect(json.apiKey).toBe('test-api-key');
      expect(json.status).toBe(SDKConnectionStatus.ACTIVE);
      expect(json.metadata).toEqual({ botId: 'test-bot-id' });
      expect(json.createdAt).toBe(connection.createdAt.toISOString());
      expect(json.updatedAt).toBe(connection.updatedAt.toISOString());
    });

    it('should exclude sensitive data when requested', () => {
      const connection = new SDKConnection({
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'sensitive-api-key',
        status: SDKConnectionStatus.ACTIVE,
      });

      const json = connection.toJSON(true);

      expect(json.apiKey).toBe('***');
    });
  });

  describe('fromJSON', () => {
    it('should deserialize from JSON correctly', () => {
      const jsonData = {
        id: 'test-connection-id',
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'test-api-key',
        status: SDKConnectionStatus.ACTIVE,
        metadata: { botId: 'test-bot-id' },
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const connection = SDKConnection.fromJSON(jsonData);

      expect(connection.id).toBe('test-connection-id');
      expect(connection.userId).toBe('test-user-id');
      expect(connection.platform).toBe(SDKPlatform.RECALL_AI);
      expect(connection.apiKey).toBe('test-api-key');
      expect(connection.status).toBe(SDKConnectionStatus.ACTIVE);
      expect(connection.metadata).toEqual({ botId: 'test-bot-id' });
      expect(connection.createdAt).toEqual(new Date('2023-01-01T00:00:00.000Z'));
      expect(connection.updatedAt).toEqual(new Date('2023-01-01T00:00:00.000Z'));
    });

    it('should handle missing optional fields', () => {
      const jsonData = {
        userId: 'test-user-id',
        platform: SDKPlatform.RECALL_AI,
        apiKey: 'test-api-key',
      };

      const connection = SDKConnection.fromJSON(jsonData);

      expect(connection.id).toBeDefined();
      expect(connection.status).toBe(SDKConnectionStatus.INACTIVE);
      expect(connection.metadata).toEqual({});
      expect(connection.createdAt).toBeInstanceOf(Date);
      expect(connection.updatedAt).toBeInstanceOf(Date);
    });

    it('should validate JSON data', () => {
      const invalidJsonData = {
        userId: '',
        platform: 'invalid-platform',
        apiKey: 'test-api-key',
      };

      expect(() => SDKConnection.fromJSON(invalidJsonData)).toThrow();
    });
  });

  describe('SDKPlatform enum', () => {
    it('should have correct platform values', () => {
      expect(SDKPlatform.RECALL_AI).toBe('recall_ai');
      expect(SDKPlatform.ZOOM).toBe('zoom');
      expect(SDKPlatform.TEAMS).toBe('teams');
      expect(SDKPlatform.GOOGLE_MEET).toBe('google_meet');
    });
  });

  describe('SDKConnectionStatus enum', () => {
    it('should have correct status values', () => {
      expect(SDKConnectionStatus.ACTIVE).toBe('active');
      expect(SDKConnectionStatus.INACTIVE).toBe('inactive');
      expect(SDKConnectionStatus.ERROR).toBe('error');
      expect(SDKConnectionStatus.PENDING).toBe('pending');
    });
  });
});
