import express from 'express';
import request from 'supertest';
import teamsRouter from '../../routes/teams';
import { TeamAdministratorService } from '../../services/TeamAdministratorService';
import { NotFoundError, TeamOnboardingError, ValidationError } from '../../types';

// Mock the TeamAdministratorService
jest.mock('../../services/TeamAdministratorService');
jest.mock('../../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@example.com', organization_id: 'org-123' };
    next();
  },
  requireTeamAccess: (req: any, res: any, next: any) => next(),
  requireAdminAccess: (req: any, res: any, next: any) => next(),
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Teams Routes', () => {
  let app: express.Application;
  let mockTeamAdministratorService: jest.Mocked<TeamAdministratorService>;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/teams', teamsRouter);

    mockTeamAdministratorService = new TeamAdministratorService() as jest.Mocked<TeamAdministratorService>;
    (TeamAdministratorService as jest.Mock).mockImplementation(() => mockTeamAdministratorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/teams', () => {
    it('should create a team successfully', async () => {
      const teamData = {
        name: 'Test Team',
        organizationId: 'org-123',
      };

      const mockTeam = {
        id: 'team-123',
        name: 'Test Team',
        organizationId: 'org-123',
        settings: {},
        complianceSettings: {},
        isActive: true,
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTeamAdministratorService.createTeam.mockResolvedValue(mockTeam);

      const response = await request(app)
        .post('/api/v1/teams')
        .send(teamData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: mockTeam,
        timestamp: expect.any(String),
      });

      expect(mockTeamAdministratorService.createTeam).toHaveBeenCalledWith(teamData, 'user-123');
    });

    it('should handle team creation errors', async () => {
      const teamData = {
        name: 'Test Team',
        organizationId: 'org-123',
      };

      mockTeamAdministratorService.createTeam.mockRejectedValue(
        new ValidationError('Invalid team data')
      );

      const response = await request(app)
        .post('/api/v1/teams')
        .send(teamData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'ValidationError',
        message: 'Invalid team data',
        timestamp: expect.any(String),
      });
    });
  });

  describe('GET /api/v1/teams/:teamId', () => {
    it('should get a team successfully', async () => {
      const teamId = 'team-123';
      const mockTeam = {
        id: 'team-123',
        name: 'Test Team',
        organizationId: 'org-123',
        settings: {},
        complianceSettings: {},
        isActive: true,
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTeamAdministratorService.getTeam.mockResolvedValue(mockTeam);

      const response = await request(app)
        .get(`/api/v1/teams/${teamId}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockTeam,
        timestamp: expect.any(String),
      });

      expect(mockTeamAdministratorService.getTeam).toHaveBeenCalledWith(teamId);
    });

    it('should handle team not found', async () => {
      const teamId = 'non-existent-team';

      mockTeamAdministratorService.getTeam.mockRejectedValue(
        new NotFoundError('Team', teamId)
      );

      const response = await request(app)
        .get(`/api/v1/teams/${teamId}`)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'NotFoundError',
        message: 'Team not found: non-existent-team',
        timestamp: expect.any(String),
      });
    });
  });

  describe('PUT /api/v1/teams/:teamId/settings', () => {
    it('should update team settings successfully', async () => {
      const teamId = 'team-123';
      const settings = {
        maxUsers: 100,
        allowGuestAccess: false,
        requireMFA: true,
      };

      const mockUpdatedTeam = {
        id: 'team-123',
        name: 'Test Team',
        organizationId: 'org-123',
        settings,
        complianceSettings: {},
        isActive: true,
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTeamAdministratorService.updateTeamSettings.mockResolvedValue(mockUpdatedTeam);

      const response = await request(app)
        .put(`/api/v1/teams/${teamId}/settings`)
        .send({ settings })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockUpdatedTeam,
        timestamp: expect.any(String),
      });

      expect(mockTeamAdministratorService.updateTeamSettings).toHaveBeenCalledWith(
        teamId,
        settings,
        'user-123'
      );
    });
  });

  describe('POST /api/v1/teams/:teamId/administrators', () => {
    it('should create a team administrator successfully', async () => {
      const teamId = 'team-123';
      const adminData = {
        userId: 'user-456',
        role: 'admin',
        permissions: ['manage_users', 'manage_settings'],
      };

      const mockAdministrator = {
        id: 'admin-123',
        teamId: 'team-123',
        userId: 'user-456',
        role: 'admin',
        permissions: ['manage_users', 'manage_settings'],
        isActive: true,
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTeamAdministratorService.createTeamAdministrator.mockResolvedValue(mockAdministrator);

      const response = await request(app)
        .post(`/api/v1/teams/${teamId}/administrators`)
        .send(adminData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: mockAdministrator,
        timestamp: expect.any(String),
      });

      expect(mockTeamAdministratorService.createTeamAdministrator).toHaveBeenCalledWith(
        { ...adminData, teamId },
        'user-123'
      );
    });
  });

  describe('GET /api/v1/teams/:teamId/administrators', () => {
    it('should get team administrators successfully', async () => {
      const teamId = 'team-123';
        const mockAdministrators = [
          {
            id: 'admin-1',
            teamId: 'team-123',
            userId: 'user-1',
            role: 'admin',
            permissions: ['manage_users'],
            isActive: true,
            createdBy: 'user-123',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'admin-2',
            teamId: 'team-123',
            userId: 'user-2',
            role: 'member',
            permissions: ['view_analytics'],
            isActive: true,
            createdBy: 'user-123',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

      mockTeamAdministratorService.getTeamAdministrators.mockResolvedValue(mockAdministrators);

      const response = await request(app)
        .get(`/api/v1/teams/${teamId}/administrators`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockAdministrators,
        timestamp: expect.any(String),
      });

      expect(mockTeamAdministratorService.getTeamAdministrators).toHaveBeenCalledWith(teamId);
    });
  });

  describe('PUT /api/v1/teams/:teamId/administrators/:adminId', () => {
    it('should update a team administrator successfully', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';
      const updates = {
        role: 'member',
        permissions: ['view_analytics'],
      };

      const mockUpdatedAdministrator = {
        id: 'admin-123',
        teamId: 'team-123',
        userId: 'user-456',
        role: 'member',
        permissions: ['view_analytics'],
        isActive: true,
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTeamAdministratorService.updateTeamAdministrator.mockResolvedValue(mockUpdatedAdministrator);

      const response = await request(app)
        .put(`/api/v1/teams/${teamId}/administrators/${adminId}`)
        .send(updates)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockUpdatedAdministrator,
        timestamp: expect.any(String),
      });

      expect(mockTeamAdministratorService.updateTeamAdministrator).toHaveBeenCalledWith(
        adminId,
        updates,
        'user-123'
      );
    });
  });

  describe('DELETE /api/v1/teams/:teamId/administrators/:adminId', () => {
    it('should delete a team administrator successfully', async () => {
      const teamId = 'team-123';
      const adminId = 'admin-123';

      mockTeamAdministratorService.deleteTeamAdministrator.mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/api/v1/teams/${teamId}/administrators/${adminId}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Team administrator deleted successfully',
        timestamp: expect.any(String),
      });

      expect(mockTeamAdministratorService.deleteTeamAdministrator).toHaveBeenCalledWith(
        adminId,
        'user-123'
      );
    });
  });

  describe('Error handling', () => {
    it('should handle internal server errors', async () => {
      const teamData = {
        name: 'Test Team',
        organizationId: 'org-123',
      };

      mockTeamAdministratorService.createTeam.mockRejectedValue(
        new TeamOnboardingError('Internal error', 'INTERNAL_ERROR', 500)
      );

      const response = await request(app)
        .post('/api/v1/teams')
        .send(teamData)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Internal error',
        timestamp: expect.any(String),
      });
    });

    it('should handle validation errors', async () => {
      const teamData = {
        name: '', // Invalid: empty name
        organizationId: 'org-123',
      };

      mockTeamAdministratorService.createTeam.mockRejectedValue(
        new ValidationError('Team name is required')
      );

      const response = await request(app)
        .post('/api/v1/teams')
        .send(teamData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'ValidationError',
        message: 'Team name is required',
        timestamp: expect.any(String),
      });
    });
  });
});
