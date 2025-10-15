import { createClient } from '@supabase/supabase-js';
import { UserProvisioningService } from '../../services/UserProvisioningService';
import { NotFoundError, ValidationError } from '../../types';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  logUserProvisioning: jest.fn(),
  logBulkOperation: jest.fn(),
}));

describe('UserProvisioningService', () => {
  let userProvisioningService: UserProvisioningService;
  let mockSupabase: any;

  beforeEach(() => {
    // Reset environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

    // Create mock Supabase client
    mockSupabase = {
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
          in: jest.fn(() => ({
            select: jest.fn(),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(),
            })),
          })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            lt: jest.fn(() => ({
              select: jest.fn(),
            })),
          })),
        })),
      })),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    userProvisioningService = new UserProvisioningService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserProvisioningRequest', () => {
    it('should create a user provisioning request successfully', async () => {
      const requestData = {
        teamId: 'team-123',
        users: [
          {
            email: 'user1@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'user',
            department: 'Engineering',
          },
        ],
      };
      const createdBy = 'user-123';

      const mockTeam = {
        id: 'team-123',
        name: 'Test Team',
        settings: JSON.stringify({ maxUsers: 100 }),
      };

      // Mock team lookup
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockTeam,
        error: null,
      });

      // Mock user count query
      mockSupabase.from().select().eq.mockResolvedValueOnce({
        count: 5,
        error: null,
      });

      // Mock request creation
      mockSupabase.from().insert().mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await userProvisioningService.createUserProvisioningRequest(
        requestData,
        createdBy,
      );

      expect(result).toEqual({
        id: expect.any(String),
        teamId: 'team-123',
        users: requestData.users,
        status: 'pending',
        createdBy: 'user-123',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should throw ValidationError for invalid request data', async () => {
      const invalidRequestData = {
        teamId: 'invalid-uuid',
        users: [],
      };
      const createdBy = 'user-123';

      await expect(
        userProvisioningService.createUserProvisioningRequest(invalidRequestData, createdBy),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError when team does not exist', async () => {
      const requestData = {
        teamId: 'team-123',
        users: [
          {
            email: 'user1@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'user',
          },
        ],
      };
      const createdBy = 'user-123';

      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        });

      await expect(
        userProvisioningService.createUserProvisioningRequest(requestData, createdBy),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when user limit is exceeded', async () => {
      const requestData = {
        teamId: 'team-123',
        users: [
          {
            email: 'user1@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'user',
          },
        ],
      };
      const createdBy = 'user-123';

      const mockTeam = {
        id: 'team-123',
        name: 'Test Team',
        settings: JSON.stringify({ maxUsers: 5 }),
      };

      // Mock team lookup
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockTeam,
        error: null,
      });

      // Mock user count query (already at limit)
      mockSupabase.from().select().eq.mockResolvedValueOnce({
        count: 5,
        error: null,
      });

      await expect(
        userProvisioningService.createUserProvisioningRequest(requestData, createdBy),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('processUserProvisioningRequest', () => {
    it('should process a user provisioning request successfully', async () => {
      const requestId = 'request-123';
      const processedBy = 'user-123';

      const mockRequest = {
        id: 'request-123',
        team_id: 'team-123',
        users: JSON.stringify([
          {
            email: 'user1@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'user',
          },
        ]),
        status: 'pending',
        created_by: 'user-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock request fetch
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockRequest,
        error: null,
      });

      // Mock status update
      mockSupabase.from().update().eq.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock user creation
      mockSupabase.from().insert().mockResolvedValue({
        data: null,
        error: null,
      });

      // Mock final update
      mockSupabase
        .from()
        .update()
        .eq()
        .select()
        .single.mockResolvedValueOnce({
          data: {
            ...mockRequest,
            status: 'completed',
            results: JSON.stringify([
              {
                email: 'user1@example.com',
                status: 'success',
                userId: 'new-user-123',
              },
            ]),
          },
          error: null,
        });

      const result = await userProvisioningService.processUserProvisioningRequest(
        requestId,
        processedBy,
      );

      expect(result.status).toBe('completed');
      expect(result.results).toHaveLength(1);
      expect(result.results?.[0]?.status).toBe('success');
    });

    it('should throw NotFoundError when request does not exist', async () => {
      const requestId = 'non-existent-request';
      const processedBy = 'user-123';

      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        });

      await expect(
        userProvisioningService.processUserProvisioningRequest(requestId, processedBy),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('createBulkUserOperation', () => {
    it('should create a bulk user operation successfully', async () => {
      const operationData = {
        teamId: 'team-123',
        operation: 'activate_users',
        userIds: ['user-1', 'user-2'],
        parameters: {},
      };
      const createdBy = 'user-123';

      const mockTeam = {
        id: 'team-123',
        name: 'Test Team',
      };

      // Mock team lookup
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockTeam,
        error: null,
      });

      // Mock users verification
      mockSupabase
        .from()
        .select()
        .in.mockResolvedValueOnce({
          data: [{ id: 'user-1' }, { id: 'user-2' }],
          error: null,
        });

      // Mock operation creation
      mockSupabase.from().insert().mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await userProvisioningService.createBulkUserOperation(
        operationData,
        createdBy,
      );

      expect(result).toEqual({
        id: expect.any(String),
        teamId: 'team-123',
        operation: 'activate_users',
        userIds: ['user-1', 'user-2'],
        parameters: {},
        status: 'pending',
        createdBy: 'user-123',
        createdAt: expect.any(Date),
      });
    });

    it('should throw ValidationError when users do not exist', async () => {
      const operationData = {
        teamId: 'team-123',
        operation: 'activate_users',
        userIds: ['user-1', 'user-2'],
        parameters: {},
      };
      const createdBy = 'user-123';

      const mockTeam = {
        id: 'team-123',
        name: 'Test Team',
      };

      // Mock team lookup
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockTeam,
        error: null,
      });

      // Mock users verification (only one user found)
      mockSupabase
        .from()
        .select()
        .in.mockResolvedValueOnce({
          data: [{ id: 'user-1' }],
          error: null,
        });

      await expect(
        userProvisioningService.createBulkUserOperation(operationData, createdBy),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('processBulkUserOperation', () => {
    it('should process a bulk user operation successfully', async () => {
      const operationId = 'operation-123';
      const processedBy = 'user-123';

      const mockOperation = {
        id: 'operation-123',
        team_id: 'team-123',
        operation: 'activate_users',
        user_ids: JSON.stringify(['user-1', 'user-2']),
        parameters: JSON.stringify({}),
        status: 'pending',
        created_by: 'user-123',
        created_at: new Date().toISOString(),
      };

      // Mock operation fetch
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockOperation,
        error: null,
      });

      // Mock status update
      mockSupabase.from().update().eq.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock user updates
      mockSupabase.from().update().eq.mockResolvedValue({
        data: null,
        error: null,
      });

      // Mock final update
      mockSupabase
        .from()
        .update()
        .eq()
        .select()
        .single.mockResolvedValueOnce({
          data: {
            ...mockOperation,
            status: 'completed',
            results: JSON.stringify([
              { userId: 'user-1', status: 'success' },
              { userId: 'user-2', status: 'success' },
            ]),
            completed_at: new Date().toISOString(),
          },
          error: null,
        });

      const result = await userProvisioningService.processBulkUserOperation(
        operationId,
        processedBy,
      );

      expect(result.status).toBe('completed');
      expect(result.results).toHaveLength(2);
      expect(result.results?.every(r => r.status === 'success')).toBe(true);
    });
  });

  describe('parseCSVForUserProvisioning', () => {
    it('should parse CSV data successfully', async () => {
      const csvData =
        'email,first_name,last_name,role,department\nuser1@example.com,John,Doe,user,Engineering';
      const csvBuffer = Buffer.from(csvData);
      const teamId = 'team-123';

      const result = await userProvisioningService.parseCSVForUserProvisioning(csvBuffer, teamId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        department: 'Engineering',
        customFields: {
          phone: undefined,
          title: undefined,
          location: undefined,
        },
      });
    });

    it('should handle empty CSV data', async () => {
      const csvData = 'email,first_name,last_name,role\n';
      const csvBuffer = Buffer.from(csvData);
      const teamId = 'team-123';

      const result = await userProvisioningService.parseCSVForUserProvisioning(csvBuffer, teamId);

      expect(result).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should handle missing environment variables', () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => new UserProvisioningService()).toThrow(
        'Supabase environment variables are not set.',
      );
    });
  });
});
