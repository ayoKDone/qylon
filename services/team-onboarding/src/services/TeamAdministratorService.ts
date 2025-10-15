import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import {
  NotFoundError,
  Team,
  TeamAdministrator,
  TeamOnboardingError,
  ValidationError
} from '../types';
import { logger, logTeamOperation } from '../utils/logger';

export class TeamAdministratorService {
  private supabase;

  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }

  /**
   * Create a new team with administrator setup
   */
  async createTeam(teamData: any, createdBy: string): Promise<Team> {
    try {
      // Validate team data
      const validatedData = CreateTeamSchema.parse(teamData);

      const teamId = uuidv4();
      const team: Team = {
        id: teamId,
        name: validatedData.name,
        description: validatedData.description,
        organizationId: validatedData.organizationId,
        settings: validatedData.settings,
        complianceSettings: validatedData.complianceSettings,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
      };

      // Save team to database
      const { error: teamError } = await this.supabase.from('teams').insert({
        id: team.id,
        name: team.name,
        description: team.description,
        organization_id: team.organizationId,
        settings: JSON.stringify(team.settings),
        compliance_settings: JSON.stringify(team.complianceSettings),
        is_active: team.isActive,
        created_at: team.createdAt.toISOString(),
        updated_at: team.updatedAt.toISOString(),
        created_by: team.createdBy,
      });

      if (teamError) {
        logger.error('Failed to create team', {
          error: teamError.message,
          teamId,
          createdBy,
        });
        throw new TeamOnboardingError('Failed to create team', 'DATABASE_ERROR', 500, teamError);
      }

      logTeamOperation('team_created', teamId, createdBy, {
        teamName: team.name,
        organizationId: team.organizationId,
      });

      return team;
    } catch (error) {
      if (error instanceof TeamOnboardingError) {
        throw error;
      }

      logger.error('Team creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        createdBy,
      });

      throw new TeamOnboardingError('Team creation failed', 'TEAM_CREATION_ERROR', 500, error);
    }
  }

  /**
   * Create a team administrator
   */
  async createTeamAdministrator(adminData: any, createdBy: string): Promise<TeamAdministrator> {
    try {
      // Validate administrator data
      const validatedData = CreateTeamAdministratorSchema.parse(adminData);

      const adminId = uuidv4();
      const administrator: TeamAdministrator = {
        id: adminId,
        teamId: validatedData.teamId,
        userId: validatedData.userId,
        role: validatedData.role,
        permissions: validatedData.permissions,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
      };

      // Verify team exists
      const { data: team, error: teamError } = await this.supabase
        .from('teams')
        .select('id, name')
        .eq('id', validatedData.teamId)
        .single();

      if (teamError || !team) {
        throw new NotFoundError('Team', validatedData.teamId);
      }

      // Verify user exists
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('id, email')
        .eq('id', validatedData.userId)
        .single();

      if (userError || !user) {
        throw new NotFoundError('User', validatedData.userId);
      }

      // Check if administrator already exists
      const { data: existingAdmin } = await this.supabase
        .from('team_administrators')
        .select('id')
        .eq('team_id', validatedData.teamId)
        .eq('user_id', validatedData.userId)
        .single();

      if (existingAdmin) {
        throw new ValidationError('Administrator already exists for this team');
      }

      // Save administrator to database
      const { error: adminError } = await this.supabase.from('team_administrators').insert({
        id: administrator.id,
        team_id: administrator.teamId,
        user_id: administrator.userId,
        role: administrator.role,
        permissions: JSON.stringify(administrator.permissions),
        is_active: administrator.isActive,
        created_at: administrator.createdAt.toISOString(),
        updated_at: administrator.updatedAt.toISOString(),
        created_by: administrator.createdBy,
      });

      if (adminError) {
        logger.error('Failed to create team administrator', {
          error: adminError.message,
          teamId: validatedData.teamId,
          userId: validatedData.userId,
          createdBy,
        });
        throw new TeamOnboardingError(
          'Failed to create team administrator',
          'DATABASE_ERROR',
          500,
          adminError,
        );
      }

      logTeamOperation('administrator_created', validatedData.teamId, createdBy, {
        administratorId: adminId,
        userId: validatedData.userId,
        role: validatedData.role,
        permissions: validatedData.permissions,
      });

      return administrator;
    } catch (error) {
      if (error instanceof TeamOnboardingError) {
        throw error;
      }

      logger.error('Team administrator creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        createdBy,
      });

      throw new TeamOnboardingError(
        'Team administrator creation failed',
        'ADMIN_CREATION_ERROR',
        500,
        error,
      );
    }
  }

  /**
   * Get team administrators
   */
  async getTeamAdministrators(teamId: string): Promise<TeamAdministrator[]> {
    try {
      const { data, error } = await this.supabase
        .from('team_administrators')
        .select(
          `
          id,
          team_id,
          user_id,
          role,
          permissions,
          is_active,
          created_at,
          updated_at,
          created_by,
          users!inner(id, email, first_name, last_name)
        `,
        )
        .eq('team_id', teamId)
        .eq('is_active', true);

      if (error) {
        logger.error('Failed to fetch team administrators', {
          error: error.message,
          teamId,
        });
        throw new TeamOnboardingError(
          'Failed to fetch team administrators',
          'DATABASE_ERROR',
          500,
          error,
        );
      }

      return data.map((admin: any) => ({
        id: admin.id,
        teamId: admin.team_id,
        userId: admin.user_id,
        role: admin.role,
        permissions: JSON.parse(admin.permissions || '[]'),
        isActive: admin.is_active,
        createdAt: new Date(admin.created_at),
        updatedAt: new Date(admin.updated_at),
        createdBy: admin.created_by,
      }));
    } catch (error) {
      if (error instanceof TeamOnboardingError) {
        throw error;
      }

      logger.error('Failed to get team administrators', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId,
      });

      throw new TeamOnboardingError('Failed to get team administrators', 'FETCH_ERROR', 500, error);
    }
  }

  /**
   * Update team administrator
   */
  async updateTeamAdministrator(
    adminId: string,
    updates: Partial<Pick<TeamAdministrator, 'role' | 'permissions' | 'isActive'>>,
    updatedBy: string,
  ): Promise<TeamAdministrator> {
    try {
      // Get existing administrator
      const { data: existingAdmin, error: fetchError } = await this.supabase
        .from('team_administrators')
        .select('*')
        .eq('id', adminId)
        .single();

      if (fetchError || !existingAdmin) {
        throw new NotFoundError('Team Administrator', adminId);
      }

      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Update administrator
      const { data, error } = await this.supabase
        .from('team_administrators')
        .update({
          role: updates.role || existingAdmin.role,
          permissions: updates.permissions
            ? JSON.stringify(updates.permissions)
            : existingAdmin.permissions,
          is_active: updates.isActive !== undefined ? updates.isActive : existingAdmin.is_active,
          updated_at: updatedData.updated_at,
        })
        .eq('id', adminId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update team administrator', {
          error: error.message,
          adminId,
          updatedBy,
        });
        throw new TeamOnboardingError(
          'Failed to update team administrator',
          'DATABASE_ERROR',
          500,
          error,
        );
      }

      const updatedAdministrator: TeamAdministrator = {
        id: data.id,
        teamId: data.team_id,
        userId: data.user_id,
        role: data.role,
        permissions: JSON.parse(data.permissions || '[]'),
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        createdBy: data.created_by,
      };

      logTeamOperation('administrator_updated', data.team_id, updatedBy, {
        administratorId: adminId,
        updates,
      });

      return updatedAdministrator;
    } catch (error) {
      if (error instanceof TeamOnboardingError) {
        throw error;
      }

      logger.error('Team administrator update failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminId,
        updatedBy,
      });

      throw new TeamOnboardingError('Team administrator update failed', 'UPDATE_ERROR', 500, error);
    }
  }

  /**
   * Delete team administrator
   */
  async deleteTeamAdministrator(adminId: string, deletedBy: string): Promise<void> {
    try {
      // Get administrator details for logging
      const { data: admin, error: fetchError } = await this.supabase
        .from('team_administrators')
        .select('team_id, user_id, role')
        .eq('id', adminId)
        .single();

      if (fetchError || !admin) {
        throw new NotFoundError('Team Administrator', adminId);
      }

      // Soft delete by setting is_active to false
      const { error } = await this.supabase
        .from('team_administrators')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', adminId);

      if (error) {
        logger.error('Failed to delete team administrator', {
          error: error.message,
          adminId,
          deletedBy,
        });
        throw new TeamOnboardingError(
          'Failed to delete team administrator',
          'DATABASE_ERROR',
          500,
          error,
        );
      }

      logTeamOperation('administrator_deleted', admin.team_id, deletedBy, {
        administratorId: adminId,
        userId: admin.user_id,
        role: admin.role,
      });
    } catch (error) {
      if (error instanceof TeamOnboardingError) {
        throw error;
      }

      logger.error('Team administrator deletion failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminId,
        deletedBy,
      });

      throw new TeamOnboardingError(
        'Team administrator deletion failed',
        'DELETE_ERROR',
        500,
        error,
      );
    }
  }

  /**
   * Get team by ID
   */
  async getTeam(teamId: string): Promise<Team> {
    try {
      const { data, error } = await this.supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error || !data) {
        throw new NotFoundError('Team', teamId);
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        organizationId: data.organization_id,
        settings: JSON.parse(data.settings || '{}'),
        complianceSettings: JSON.parse(data.compliance_settings || '{}'),
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        createdBy: data.created_by,
      };
    } catch (error) {
      if (error instanceof TeamOnboardingError) {
        throw error;
      }

      logger.error('Failed to get team', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId,
      });

      throw new TeamOnboardingError('Failed to get team', 'FETCH_ERROR', 500, error);
    }
  }

  /**
   * Update team settings
   */
  async updateTeamSettings(teamId: string, settings: any, updatedBy: string): Promise<Team> {
    try {
      // Verify team exists
      const existingTeam = await this.getTeam(teamId);

      const updatedData = {
        settings: JSON.stringify(settings),
        updated_at: new Date().toISOString(),
      };

      const { error } = await this.supabase.from('teams').update(updatedData).eq('id', teamId);

      if (error) {
        logger.error('Failed to update team settings', {
          error: error.message,
          teamId,
          updatedBy,
        });
        throw new TeamOnboardingError(
          'Failed to update team settings',
          'DATABASE_ERROR',
          500,
          error,
        );
      }

      logTeamOperation('team_settings_updated', teamId, updatedBy, {
        settings,
      });

      // Return updated team
      return {
        ...existingTeam,
        settings,
        updatedAt: new Date(updatedData.updated_at),
      };
    } catch (error) {
      if (error instanceof TeamOnboardingError) {
        throw error;
      }

      logger.error('Team settings update failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        teamId,
        updatedBy,
      });

      throw new TeamOnboardingError('Failed to update team settings', 'UPDATE_ERROR', 500, error);
    }
  }
}
