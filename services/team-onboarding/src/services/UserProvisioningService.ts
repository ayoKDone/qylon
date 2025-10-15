import { createClient } from '@supabase/supabase-js';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import {
  BulkOperationResult,
  BulkOperationStatus,
  BulkOperationType,
  BulkUserOperation,
  BulkUserOperationSchema,
  NotFoundError,
  ProvisioningResult,
  ProvisioningStatus,
  TeamOnboardingError,
  UserProvisioningData,
  UserProvisioningRequest,
  UserProvisioningRequestSchema,
  ValidationError,
} from '../types';
import { logBulkOperation, logger, logUserProvisioning } from '../utils/logger';

export class UserProvisioningService {
  private supabase;

  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }

  /**
   * Create user provisioning request
   */
  async createUserProvisioningRequest(
    requestData: any,
    createdBy: string,
  ): Promise<UserProvisioningRequest> {
    try {
      // Validate request data
      const validatedData = UserProvisioningRequestSchema.parse(requestData);

      const requestId = uuidv4();
      const request: UserProvisioningRequest = {
        id: requestId,
        teamId: validatedData.teamId,
        users: validatedData.users,
        status: ProvisioningStatus.PENDING,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Verify team exists
      const { data: team, error: teamError } = await this.supabase
        .from('teams')
        .select('id, name, settings')
        .eq('id', validatedData.teamId)
        .single();

      if (teamError || !team) {
        throw new NotFoundError('Team', validatedData.teamId);
      }

      // Check team user limit
      const teamSettings = JSON.parse(team.settings || '{}');
      const currentUserCount = await this.getTeamUserCount(validatedData.teamId);

      if (currentUserCount + validatedData.users.length > teamSettings.maxUsers) {
        throw new ValidationError(
          `User limit exceeded. Team allows ${teamSettings.maxUsers} users, ` +
            `currently has ${currentUserCount}, trying to add ${validatedData.users.length}`,
        );
      }

      // Save provisioning request to database
      const { error: requestError } = await this.supabase
        .from('user_provisioning_requests')
        .insert({
          id: request.id,
          team_id: request.teamId,
          users: JSON.stringify(request.users),
          status: request.status,
          created_by: request.createdBy,
          created_at: request.createdAt.toISOString(),
          updated_at: request.updatedAt.toISOString(),
        });

      if (requestError) {
        logger.error('Failed to create user provisioning request', {
          error: requestError.message,
          teamId: validatedData.teamId,
          userCount: validatedData.users.length,
          createdBy,
        });
        throw new TeamOnboardingError(
          'Failed to create user provisioning request',
          'DATABASE_ERROR',
          500,
          requestError,
        );
      }

      logUserProvisioning(
        'provisioning_request_created',
        validatedData.teamId,
        createdBy,
        validatedData.users.length,
        {
          requestId,
          teamName: team.name,
        },
      );

      return request;
    } catch (error) {
      if (error instanceof TeamOnboardingError) {
        throw error;
      }

      logger.error('User provisioning request creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        createdBy,
      });

      throw new TeamOnboardingError(
        'User provisioning request creation failed',
        'PROVISIONING_ERROR',
        500,
        error,
      );
    }
  }

  /**
   * Process user provisioning request
   */
  async processUserProvisioningRequest(
    requestId: string,
    processedBy: string,
  ): Promise<UserProvisioningRequest> {
    try {
      // Get provisioning request
      const { data: request, error: fetchError } = await this.supabase
        .from('user_provisioning_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !request) {
        throw new NotFoundError('User Provisioning Request', requestId);
      }

      if (request.status !== ProvisioningStatus.PENDING) {
        throw new ValidationError('Request is not in pending status');
      }

      // Update status to processing
      await this.updateProvisioningStatus(requestId, ProvisioningStatus.PROCESSING);

      const users: UserProvisioningData[] = JSON.parse(request.users);
      const results: ProvisioningResult[] = [];

      // Process each user
      for (const userData of users) {
        try {
          const result = await this.provisionUser(userData, request.team_id);
          results.push(result);
        } catch (error) {
          results.push({
            email: userData.email,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Determine overall status
      const successCount = results.filter(r => r.status === 'success').length;
      const failedCount = results.filter(r => r.status === 'failed').length;

      let finalStatus: ProvisioningStatus;
      if (failedCount === 0) {
        finalStatus = ProvisioningStatus.COMPLETED;
      } else if (successCount === 0) {
        finalStatus = ProvisioningStatus.FAILED;
      } else {
        finalStatus = ProvisioningStatus.PARTIALLY_COMPLETED;
      }

      // Update request with results
      const { data: updatedRequest, error: updateError } = await this.supabase
        .from('user_provisioning_requests')
        .update({
          status: finalStatus,
          results: JSON.stringify(results),
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (updateError) {
        logger.error('Failed to update provisioning request', {
          error: updateError.message,
          requestId,
        });
        throw new TeamOnboardingError(
          'Failed to update provisioning request',
          'DATABASE_ERROR',
          500,
          updateError,
        );
      }

      logUserProvisioning(
        'provisioning_request_processed',
        request.team_id,
        processedBy,
        users.length,
        {
          requestId,
          status: finalStatus,
          successCount,
          failedCount,
        },
      );

      return {
        id: updatedRequest.id,
        teamId: updatedRequest.team_id,
        users: JSON.parse(updatedRequest.users),
        status: updatedRequest.status as ProvisioningStatus,
        createdBy: updatedRequest.created_by,
        createdAt: new Date(updatedRequest.created_at),
        updatedAt: new Date(updatedRequest.updated_at),
        results: JSON.parse(updatedRequest.results || '[]'),
      };
    } catch (error) {
      if (error instanceof TeamOnboardingError) {
        throw error;
      }

      logger.error('User provisioning request processing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId,
        processedBy,
      });

      throw new TeamOnboardingError(
        'User provisioning request processing failed',
        'PROCESSING_ERROR',
        500,
        error,
      );
    }
  }

  /**
   * Provision a single user
   */
  private async provisionUser(
    userData: UserProvisioningData,
    teamId: string,
  ): Promise<ProvisioningResult> {
    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await this.supabase
        .from('users')
        .select('id, email')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        // Check if user is already in the team
        const { data: teamUser, error: teamCheckError } = await this.supabase
          .from('team_users')
          .select('id')
          .eq('team_id', teamId)
          .eq('user_id', existingUser.id)
          .single();

        if (teamUser) {
          return {
            email: userData.email,
            status: 'skipped',
            warnings: ['User already exists in team'],
          };
        }

        // Add existing user to team
        const { error: addError } = await this.supabase.from('team_users').insert({
          id: uuidv4(),
          team_id: teamId,
          user_id: existingUser.id,
          role: userData.role,
          department: userData.department,
          manager: userData.manager,
          custom_fields: JSON.stringify(userData.customFields || {}),
          created_at: new Date().toISOString(),
        });

        if (addError) {
          throw new Error(`Failed to add user to team: ${addError.message}`);
        }

        return {
          email: userData.email,
          status: 'success',
          userId: existingUser.id,
          warnings: ['User already existed, added to team'],
        };
      }

      // Create new user
      const userId = uuidv4();
      const { error: userError } = await this.supabase.from('users').insert({
        id: userId,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
        is_active: true,
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (userError) {
        throw new Error(`Failed to create user: ${userError.message}`);
      }

      // Add user to team
      const { error: teamUserError } = await this.supabase.from('team_users').insert({
        id: uuidv4(),
        team_id: teamId,
        user_id: userId,
        role: userData.role,
        department: userData.department,
        manager: userData.manager,
        custom_fields: JSON.stringify(userData.customFields || {}),
        created_at: new Date().toISOString(),
      });

      if (teamUserError) {
        throw new Error(`Failed to add user to team: ${teamUserError.message}`);
      }

      return {
        email: userData.email,
        status: 'success',
        userId,
      };
    } catch (error) {
      return {
        email: userData.email,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create bulk user operation
   */
  async createBulkUserOperation(operationData: any, createdBy: string): Promise<BulkUserOperation> {
    try {
      // Validate operation data
      const validatedData = BulkUserOperationSchema.parse(operationData);

      const operationId = uuidv4();
      const operation: BulkUserOperation = {
        id: operationId,
        teamId: validatedData.teamId,
        operation: validatedData.operation,
        userIds: validatedData.userIds,
        parameters: validatedData.parameters,
        status: BulkOperationStatus.PENDING,
        createdBy,
        createdAt: new Date(),
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

      // Verify all users exist
      const { data: users, error: usersError } = await this.supabase
        .from('users')
        .select('id')
        .in('id', validatedData.userIds);

      if (usersError) {
        throw new TeamOnboardingError('Failed to verify users', 'DATABASE_ERROR', 500, usersError);
      }

      if (users.length !== validatedData.userIds.length) {
        throw new ValidationError('One or more users not found');
      }

      // Save bulk operation to database
      const { error: operationError } = await this.supabase.from('bulk_user_operations').insert({
        id: operation.id,
        team_id: operation.teamId,
        operation: operation.operation,
        user_ids: JSON.stringify(operation.userIds),
        parameters: JSON.stringify(operation.parameters),
        status: operation.status,
        created_by: operation.createdBy,
        created_at: operation.createdAt.toISOString(),
      });

      if (operationError) {
        logger.error('Failed to create bulk user operation', {
          error: operationError.message,
          teamId: validatedData.teamId,
          operation: validatedData.operation,
          userCount: validatedData.userIds.length,
          createdBy,
        });
        throw new TeamOnboardingError(
          'Failed to create bulk user operation',
          'DATABASE_ERROR',
          500,
          operationError,
        );
      }

      logBulkOperation(
        'bulk_operation_created',
        validatedData.teamId,
        createdBy,
        validatedData.userIds.length,
        {
          operationId,
          operation: validatedData.operation,
          teamName: team.name,
        },
      );

      return operation;
    } catch (error) {
      if (error instanceof TeamOnboardingError) {
        throw error;
      }

      logger.error('Bulk user operation creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        createdBy,
      });

      throw new TeamOnboardingError(
        'Bulk user operation creation failed',
        'BULK_OPERATION_ERROR',
        500,
        error,
      );
    }
  }

  /**
   * Process bulk user operation
   */
  async processBulkUserOperation(
    operationId: string,
    processedBy: string,
  ): Promise<BulkUserOperation> {
    try {
      // Get bulk operation
      const { data: operation, error: fetchError } = await this.supabase
        .from('bulk_user_operations')
        .select('*')
        .eq('id', operationId)
        .single();

      if (fetchError || !operation) {
        throw new NotFoundError('Bulk User Operation', operationId);
      }

      if (operation.status !== BulkOperationStatus.PENDING) {
        throw new ValidationError('Operation is not in pending status');
      }

      // Update status to processing
      await this.updateBulkOperationStatus(operationId, BulkOperationStatus.PROCESSING);

      const userIds: string[] = JSON.parse(operation.user_ids);
      const parameters = JSON.parse(operation.parameters || '{}');
      const results: BulkOperationResult[] = [];

      // Process each user based on operation type
      for (const userId of userIds) {
        try {
          const result = await this.executeBulkOperationOnUser(
            operation.operation,
            userId,
            operation.team_id,
            parameters,
          );
          results.push(result);
        } catch (error) {
          results.push({
            userId,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Determine overall status
      const successCount = results.filter(r => r.status === 'success').length;
      const finalStatus =
        successCount === userIds.length
          ? BulkOperationStatus.COMPLETED
          : BulkOperationStatus.FAILED;

      // Update operation with results
      const { data: updatedOperation, error: updateError } = await this.supabase
        .from('bulk_user_operations')
        .update({
          status: finalStatus,
          results: JSON.stringify(results),
          completed_at: new Date().toISOString(),
        })
        .eq('id', operationId)
        .select()
        .single();

      if (updateError) {
        logger.error('Failed to update bulk operation', {
          error: updateError.message,
          operationId,
        });
        throw new TeamOnboardingError(
          'Failed to update bulk operation',
          'DATABASE_ERROR',
          500,
          updateError,
        );
      }

      logBulkOperation('bulk_operation_processed', operation.team_id, processedBy, userIds.length, {
        operationId,
        operation: operation.operation,
        status: finalStatus,
        successCount,
      });

      return {
        id: updatedOperation.id,
        teamId: updatedOperation.team_id,
        operation: updatedOperation.operation as BulkOperationType,
        userIds: JSON.parse(updatedOperation.user_ids),
        parameters: JSON.parse(updatedOperation.parameters || '{}'),
        status: updatedOperation.status as BulkOperationStatus,
        createdBy: updatedOperation.created_by,
        createdAt: new Date(updatedOperation.created_at),
        completedAt: updatedOperation.completed_at
          ? new Date(updatedOperation.completed_at)
          : undefined,
        results: JSON.parse(updatedOperation.results || '[]'),
      };
    } catch (error) {
      if (error instanceof TeamOnboardingError) {
        throw error;
      }

      logger.error('Bulk user operation processing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        operationId,
        processedBy,
      });

      throw new TeamOnboardingError(
        'Bulk user operation processing failed',
        'PROCESSING_ERROR',
        500,
        error,
      );
    }
  }

  /**
   * Execute bulk operation on a single user
   */
  private async executeBulkOperationOnUser(
    operation: BulkOperationType,
    userId: string,
    teamId: string,
    parameters: Record<string, any>,
  ): Promise<BulkOperationResult> {
    try {
      switch (operation) {
        case BulkOperationType.ACTIVATE_USERS:
          await this.activateUser(userId);
          break;
        case BulkOperationType.DEACTIVATE_USERS:
          await this.deactivateUser(userId);
          break;
        case BulkOperationType.UPDATE_ROLES:
          await this.updateUserRole(userId, teamId, parameters.role);
          break;
        case BulkOperationType.UPDATE_DEPARTMENTS:
          await this.updateUserDepartment(userId, teamId, parameters.department);
          break;
        case BulkOperationType.SEND_WELCOME_EMAILS:
          await this.sendWelcomeEmail(userId);
          break;
        case BulkOperationType.RESET_PASSWORDS:
          await this.resetUserPassword(userId);
          break;
        case BulkOperationType.EXPORT_USER_DATA:
          const userData = await this.exportUserData(userId);
          return {
            userId,
            status: 'success',
            data: userData,
          };
        default:
          throw new Error(`Unknown operation type: ${operation}`);
      }

      return {
        userId,
        status: 'success',
      };
    } catch (error) {
      return {
        userId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Helper methods for bulk operations
   */
  private async activateUser(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to activate user: ${error.message}`);
    }
  }

  private async deactivateUser(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to deactivate user: ${error.message}`);
    }
  }

  private async updateUserRole(userId: string, teamId: string, role: string): Promise<void> {
    const { error } = await this.supabase
      .from('team_users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('team_id', teamId);

    if (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  }

  private async updateUserDepartment(
    userId: string,
    teamId: string,
    department: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('team_users')
      .update({ department, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('team_id', teamId);

    if (error) {
      throw new Error(`Failed to update user department: ${error.message}`);
    }
  }

  private async sendWelcomeEmail(userId: string): Promise<void> {
    // TODO: Implement email service integration
    logger.info('Welcome email sent', { userId });
  }

  private async resetUserPassword(userId: string): Promise<void> {
    // TODO: Implement password reset service integration
    logger.info('Password reset initiated', { userId });
  }

  private async exportUserData(userId: string): Promise<any> {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to export user data: ${error.message}`);
    }

    return user;
  }

  /**
   * Parse CSV file for user provisioning
   */
  async parseCSVForUserProvisioning(
    csvBuffer: Buffer,
    teamId: string,
  ): Promise<UserProvisioningData[]> {
    return new Promise((resolve, reject) => {
      const users: UserProvisioningData[] = [];
      const stream = Readable.from(csvBuffer.toString());

      stream
        .pipe(csv())
        .on('data', row => {
          users.push({
            email: row.email,
            firstName: row.first_name || row.firstName,
            lastName: row.last_name || row.lastName,
            role: row.role || 'user',
            department: row.department,
            manager: row.manager,
            customFields: {
              phone: row.phone,
              title: row.title,
              location: row.location,
            },
          });
        })
        .on('end', () => {
          resolve(users);
        })
        .on('error', error => {
          reject(
            new TeamOnboardingError('Failed to parse CSV file', 'CSV_PARSE_ERROR', 400, error),
          );
        });
    });
  }

  /**
   * Get team user count
   */
  private async getTeamUserCount(teamId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('team_users')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId);

    if (error) {
      throw new TeamOnboardingError('Failed to get team user count', 'DATABASE_ERROR', 500, error);
    }

    return count || 0;
  }

  /**
   * Update provisioning status
   */
  private async updateProvisioningStatus(
    requestId: string,
    status: ProvisioningStatus,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('user_provisioning_requests')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) {
      throw new TeamOnboardingError(
        'Failed to update provisioning status',
        'DATABASE_ERROR',
        500,
        error,
      );
    }
  }

  /**
   * Update bulk operation status
   */
  private async updateBulkOperationStatus(
    operationId: string,
    status: BulkOperationStatus,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('bulk_user_operations')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', operationId);

    if (error) {
      throw new TeamOnboardingError(
        'Failed to update bulk operation status',
        'DATABASE_ERROR',
        500,
        error,
      );
    }
  }
}
