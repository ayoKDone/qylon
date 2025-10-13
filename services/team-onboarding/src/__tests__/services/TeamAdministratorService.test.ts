import { createClient } from '@supabase/supabase-js';
import { TeamAdministratorService } from '../../services/TeamAdministratorService';
import { NotFoundError, TeamOnboardingError, ValidationError } from '../../types';

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
  logTeamOperation: jest.fn(),
}));

describe('TeamAdministratorService', () => {
  let teamAdministratorService: TeamAdministratorService;
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
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(),
            })),
          })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(),
        })),
      })),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    teamAdministratorService = new TeamAdministratorService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTeam', () => {
    it('should create a team successfully', async () => {
      const teamData = {
        name: 'Test Team',
        organizationId: 'org-123',
      };
      const createdBy = 'user-123';

      const mockTeam = {
        id: 'team-123',
        name: 'Test Team',
        organization_id: 'org-123',
        created_by: 'user-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockTeam,
        error: null,
      });

      const result = await teamAdministratorService.createTeam(teamData, createdBy);

      expect(result).toEqual({
        id: 'team-123',
        name: 'Test Team',
        organizationId: 'org-123',
        createdBy: 'user-123',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('teams');
    });

    it('should throw ValidationError for invalid team data', async () => {
      const invalidTeamData = {
        name: '', // Invalid: empty name
        organizationId: 'org-123',
      };
      const createdBy = 'user-123';

      await expect(
        teamAdministratorService.createTeam(invalidTeamData, createdBy)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw TeamOnboardingError for database errors', async () => {
      const teamData = {
        name: 'Test Team',
        organizationId: 'org-123',
      };
      const createdBy = 'user-123';

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(
        teamAdministratorService.createTeam(teamData, createdBy)
      ).rejects.toThrow(TeamOnboardingError);
    });
  });

  describe('createTeamAdministrator', () => {
    it('should create a team administrator successfully', async () => {
      const adminData = {
        teamId: 'team-123',
        userId: 'user-456',
        role: 'admin',
        permissions: ['manage_users', 'manage_settings'],
      };
      const createdBy = 'user-123';

      const mockAdmin = {
        id: 'admin-123',
        team_id: 'team-123',
        user_id: 'user-456',
        role: 'admin',
        permissions: ['manage_users', 'manage_settings'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockAdmin,
        error: null,
      });

      const result = await teamAdministratorService.createTeamAdministrator(adminData, createdBy);

      expect(result).toEqual({
        id: 'admin-123',
        teamId: 'team-123',
        userId: 'user-456',
        role: 'admin',
        permissions: ['manage_users', 'manage_settings'],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should throw ValidationError for invalid administrator data', async () => {
      const invalidAdminData = {
        teamId: 'invalid-uuid', // Invalid UUID
        userId: 'user-456',
        role: 'admin',
      };
      const createdBy = 'user-123';

      await expect(
        teamAdministratorService.createTeamAdministrator(invalidAdminData, createdBy)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getTeam', () => {
    it('should get a team successfully', async () => {
      const teamId = 'team-123';
      const mockTeam = {
        id: 'team-123',
        name: 'Test Team',
        organization_id: 'org-123',
        created_by: 'user-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockTeam,
        error: null,
      });

      const result = await teamAdministratorService.getTeam(teamId);

      expect(result).toEqual({
        id: 'team-123',
        name: 'Test Team',
        organizationId: 'org-123',
        createdBy: 'user-123',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should throw NotFoundError when team does not exist', async () => {
      const teamId = 'non-existent-team';

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(teamAdministratorService.getTeam(teamId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getTeamAdministrators', () => {
    it('should get team administrators successfully', async () => {
      const teamId = 'team-123';
      const mockAdministrators = [
        {
          id: 'admin-1',
          team_id: 'team-123',
          user_id: 'user-1',
          role: 'admin',
          permissions: ['manage_users'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'admin-2',
          team_id: 'team-123',
          user_id: 'user-2',
          role: 'member',
          permissions: ['view_analytics'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockSupabase.from().select().eq().mockResolvedValue({
        data: mockAdministrators,
        error: null,
      });

      const result = await teamAdministratorService.getTeamAdministrators(teamId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'admin-1',
        teamId: 'team-123',
        userId: 'user-1',
        role: 'admin',
        permissions: ['manage_users'],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('updateTeamAdministrator', () => {
    it('should update a team administrator successfully', async () => {
      const adminId = 'admin-123';
      const updates = {
        role: 'member',
        permissions: ['view_analytics'],
      };
      const updatedBy = 'user-123';

      const mockUpdatedAdmin = {
        id: 'admin-123',
        team_id: 'team-123',
        user_id: 'user-456',
        role: 'member',
        permissions: ['view_analytics'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: mockUpdatedAdmin,
        error: null,
      });

      const result = await teamAdministratorService.updateTeamAdministrator(
        adminId,
        updates,
        updatedBy
      );

      expect(result).toEqual({
        id: 'admin-123',
        teamId: 'team-123',
        userId: 'user-456',
        role: 'member',
        permissions: ['view_analytics'],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('deleteTeamAdministrator', () => {
    it('should delete a team administrator successfully', async () => {
      const adminId = 'admin-123';
      const deletedBy = 'user-123';

      mockSupabase.from().delete().eq.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        teamAdministratorService.deleteTeamAdministrator(adminId, deletedBy)
      ).resolves.not.toThrow();

      expect(mockSupabase.from).toHaveBeenCalledWith('team_administrators');
    });
  });

  describe('updateTeamSettings', () => {
    it('should update team settings successfully', async () => {
      const teamId = 'team-123';
      const settings = {
        maxUsers: 100,
        allowGuestAccess: false,
        requireMFA: true,
      };
      const updatedBy = 'user-123';

      const mockUpdatedTeam = {
        id: 'team-123',
        name: 'Test Team',
        organization_id: 'org-123',
        settings: JSON.stringify(settings),
        created_by: 'user-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: mockUpdatedTeam,
        error: null,
      });

      const result = await teamAdministratorService.updateTeamSettings(
        teamId,
        settings,
        updatedBy
      );

      expect(result).toEqual({
        id: 'team-123',
        name: 'Test Team',
        organizationId: 'org-123',
        settings,
        createdBy: 'user-123',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('error handling', () => {
    it('should handle missing environment variables', () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => new TeamAdministratorService()).toThrow('Supabase environment variables are not set.');
    });
  });
});
