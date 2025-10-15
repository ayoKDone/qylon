import { createClient } from '@supabase/supabase-js';
import { ComplianceManagementService } from '../../services/ComplianceManagementService';
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
  logComplianceEvent: jest.fn(),
}));

describe('ComplianceManagementService', () => {
  let complianceService: ComplianceManagementService;
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
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => ({
                  range: jest.fn(),
                })),
              })),
            })),
          })),
          lte: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                range: jest.fn(),
              })),
            })),
          })),
          order: jest.fn(() => ({
            range: jest.fn(),
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
    complianceService = new ComplianceManagementService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createComplianceSettings', () => {
    it('should create compliance settings successfully', async () => {
      const teamId = 'team-123';
      const complianceSettings = {
        dataRetentionPolicy: {
          userDataRetentionDays: 365,
          auditLogRetentionDays: 2555,
          meetingDataRetentionDays: 2555,
          autoDeleteEnabled: true,
          retentionExceptions: [],
        },
        auditLogging: {
          enabled: true,
          logLevel: 'detailed',
          retentionDays: 2555,
        },
        accessControls: {
          requireMFA: true,
          ipWhitelist: ['192.168.1.0/24'],
          sessionTimeout: 30,
        },
        privacySettings: {
          gdprCompliance: true,
          ccpaCompliance: true,
          dataEncryption: true,
        },
        regulatoryCompliance: [],
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

      // Mock existing settings check
      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValueOnce({
          data: null,
          error: { message: 'Not found' },
        });

      // Mock settings creation
      mockSupabase.from().insert().mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await complianceService.createComplianceSettings(
        teamId,
        complianceSettings,
        createdBy,
      );

      expect(result).toEqual(complianceSettings);
    });

    it('should throw NotFoundError when team does not exist', async () => {
      const teamId = 'non-existent-team';
      const complianceSettings = {
        dataRetentionPolicy: {
          userDataRetentionDays: 365,
          auditLogRetentionDays: 2555,
          meetingDataRetentionDays: 2555,
          autoDeleteEnabled: true,
          retentionExceptions: [],
        },
        auditLogging: {
          enabled: true,
          logLevel: 'detailed',
          retentionDays: 2555,
        },
        accessControls: {
          requireMFA: true,
          ipWhitelist: [],
          sessionTimeout: 30,
        },
        privacySettings: {
          gdprCompliance: true,
          ccpaCompliance: true,
          dataEncryption: true,
        },
        regulatoryCompliance: [],
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
        complianceService.createComplianceSettings(teamId, complianceSettings, createdBy),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when settings already exist', async () => {
      const teamId = 'team-123';
      const complianceSettings = {
        dataRetentionPolicy: {
          userDataRetentionDays: 365,
          auditLogRetentionDays: 2555,
          meetingDataRetentionDays: 2555,
          autoDeleteEnabled: true,
          retentionExceptions: [],
        },
        auditLogging: {
          enabled: true,
          logLevel: 'detailed',
          retentionDays: 2555,
        },
        accessControls: {
          requireMFA: true,
          ipWhitelist: [],
          sessionTimeout: 30,
        },
        privacySettings: {
          gdprCompliance: true,
          ccpaCompliance: true,
          dataEncryption: true,
        },
        regulatoryCompliance: [],
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

      // Mock existing settings check (settings exist)
      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValueOnce({
          data: { id: 'settings-123' },
          error: null,
        });

      await expect(
        complianceService.createComplianceSettings(teamId, complianceSettings, createdBy),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getComplianceSettings', () => {
    it('should get compliance settings successfully', async () => {
      const teamId = 'team-123';
      const mockSettings = {
        id: 'settings-123',
        team_id: 'team-123',
        data_retention_policy: JSON.stringify({
          userDataRetentionDays: 365,
          auditLogRetentionDays: 2555,
          autoDeleteEnabled: true,
        }),
        audit_logging: JSON.stringify({
          enabled: true,
          logLevel: 'detailed',
          retentionDays: 2555,
        }),
        access_controls: JSON.stringify({
          requireMFA: true,
          ipWhitelist: [],
          sessionTimeout: 30,
        }),
        privacy_settings: JSON.stringify({
          gdprCompliance: true,
          ccpaCompliance: true,
          dataEncryption: true,
        }),
        regulatory_compliance: JSON.stringify([]),
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSettings,
        error: null,
      });

      const result = await complianceService.getComplianceSettings(teamId);

      expect(result).toEqual({
        dataRetentionPolicy: {
          userDataRetentionDays: 365,
          auditLogRetentionDays: 2555,
          autoDeleteEnabled: true,
        },
        auditLogging: {
          enabled: true,
          logLevel: 'detailed',
          retentionDays: 2555,
        },
        accessControls: {
          requireMFA: true,
          ipWhitelist: [],
          sessionTimeout: 30,
        },
        privacySettings: {
          gdprCompliance: true,
          ccpaCompliance: true,
          dataEncryption: true,
        },
        regulatoryCompliance: [],
      });
    });

    it('should throw NotFoundError when settings do not exist', async () => {
      const teamId = 'team-123';

      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        });

      await expect(complianceService.getComplianceSettings(teamId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('createAuditLog', () => {
    it('should create audit log successfully', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const action = 'user.created';
      const resource = 'user';
      const resourceId = 'user-456';
      const details = { email: 'test@example.com' };
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      const success = true;

      // Mock compliance settings (audit logging enabled)
      const mockSettings = {
        auditLogging: {
          enabled: true,
          logLevel: 'detailed',
          retentionDays: 2555,
        },
      };

      // Mock getComplianceSettings
      jest.spyOn(complianceService, 'getComplianceSettings').mockResolvedValue(mockSettings as any);

      // Mock audit log creation
      mockSupabase.from().insert().mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await complianceService.createAuditLog(
        teamId,
        userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress,
        userAgent,
        success,
      );

      expect(result).toEqual({
        id: expect.any(String),
        teamId,
        userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress,
        userAgent,
        timestamp: expect.any(Date),
        success,
        errorMessage: undefined,
      });
    });

    it('should create audit log even when database save fails', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const action = 'user.created';
      const resource = 'user';
      const resourceId = 'user-456';
      const details = { email: 'test@example.com' };
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';
      const success = true;

      // Mock compliance settings (audit logging enabled)
      const mockSettings = {
        auditLogging: {
          enabled: true,
          logLevel: 'detailed',
          retentionDays: 2555,
        },
      };

      // Mock getComplianceSettings
      jest.spyOn(complianceService, 'getComplianceSettings').mockResolvedValue(mockSettings as any);

      // Mock audit log creation failure
      mockSupabase
        .from()
        .insert()
        .mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        });

      const result = await complianceService.createAuditLog(
        teamId,
        userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress,
        userAgent,
        success,
      );

      expect(result).toEqual({
        id: expect.any(String),
        teamId,
        userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress,
        userAgent,
        timestamp: expect.any(Date),
        success,
        errorMessage: undefined,
      });
    });
  });

  describe('getAuditLogs', () => {
    it('should get audit logs successfully', async () => {
      const teamId = 'team-123';
      const filters = {
        userId: 'user-123',
        action: 'user.created',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        success: true,
      };
      const pagination = { page: 1, limit: 10 };

      const mockLogs = [
        {
          id: 'log-1',
          team_id: 'team-123',
          user_id: 'user-123',
          action: 'user.created',
          resource: 'user',
          resource_id: 'user-456',
          details: JSON.stringify({ email: 'test@example.com' }),
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          timestamp: new Date().toISOString(),
          success: true,
          error_message: null,
        },
      ];

      // Mock the complex query chain
      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockLogs,
          error: null,
          count: 1,
        }),
      };

      mockSupabase.from().select.mockReturnValue(mockQuery);

      const result = await complianceService.getAuditLogs(teamId, filters, pagination);

      expect(result.logs).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.logs[0]).toEqual({
        id: 'log-1',
        teamId: 'team-123',
        userId: 'user-123',
        action: 'user.created',
        resource: 'user',
        resourceId: 'user-456',
        details: { email: 'test@example.com' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: expect.any(Date),
        success: true,
        errorMessage: null,
      });
    });
  });

  describe('runComplianceAssessment', () => {
    it('should run GDPR compliance assessment successfully', async () => {
      const teamId = 'team-123';
      const framework = 'GDPR' as const;
      const runBy = 'user-123';

      const mockSettings = {
        dataRetentionPolicy: {
          userDataRetentionDays: 365,
          auditLogRetentionDays: 2555,
          autoDeleteEnabled: true,
        },
        auditLogging: {
          enabled: true,
          logLevel: 'detailed',
          retentionDays: 2555,
        },
        accessControls: {
          requireMFA: true,
          ipWhitelist: [],
          sessionTimeout: 30,
        },
        privacySettings: {
          gdprCompliance: true,
          ccpaCompliance: true,
          dataEncryption: true,
        },
        regulatoryCompliance: [],
      };

      // Mock getComplianceSettings
      jest.spyOn(complianceService, 'getComplianceSettings').mockResolvedValue(mockSettings as any);

      // Mock updateComplianceSettings
      jest
        .spyOn(complianceService, 'updateComplianceSettings')
        .mockResolvedValue(mockSettings as any);

      const result = await complianceService.runComplianceAssessment(teamId, framework, runBy);

      expect(result.framework).toBe('GDPR');
      expect(result.status).toBe('compliant');
      expect(result.requirements).toHaveLength(4); // 3 base + 1 GDPR-specific
      expect(result.lastAssessment).toBeInstanceOf(Date);
      expect(result.nextAssessment).toBeInstanceOf(Date);
    });
  });

  describe('cleanupExpiredData', () => {
    it('should cleanup expired data successfully', async () => {
      const teamId = 'team-123';

      const mockSettings = {
        dataRetentionPolicy: {
          userDataRetentionDays: 365,
          auditLogRetentionDays: 2555,
          autoDeleteEnabled: true,
        },
        auditLogging: {
          enabled: true,
          logLevel: 'detailed',
          retentionDays: 2555,
        },
        accessControls: {
          requireMFA: true,
          ipWhitelist: [],
          sessionTimeout: 30,
        },
        privacySettings: {
          gdprCompliance: true,
          ccpaCompliance: true,
          dataEncryption: true,
        },
        regulatoryCompliance: [],
      };

      // Mock getComplianceSettings
      jest.spyOn(complianceService, 'getComplianceSettings').mockResolvedValue(mockSettings as any);

      // Mock delete operations
      mockSupabase.from().delete().eq().lt().select.mockResolvedValue({
        count: 5,
        error: null,
      });

      const result = await complianceService.cleanupExpiredData(teamId);

      expect(result.deletedRecords).toBe(10); // 5 users + 5 audit logs
      expect(result.cleanedDataTypes).toContain('user_data');
      expect(result.cleanedDataTypes).toContain('audit_logs');
    });

    it('should return zero when auto-delete is disabled', async () => {
      const teamId = 'team-123';

      const mockSettings = {
        dataRetentionPolicy: {
          userDataRetentionDays: 365,
          auditLogRetentionDays: 2555,
          autoDeleteEnabled: false, // Disabled
        },
        auditLogging: {
          enabled: true,
          logLevel: 'detailed',
          retentionDays: 2555,
        },
        accessControls: {
          requireMFA: true,
          ipWhitelist: [],
          sessionTimeout: 30,
        },
        privacySettings: {
          gdprCompliance: true,
          ccpaCompliance: true,
          dataEncryption: true,
        },
        regulatoryCompliance: [],
      };

      // Mock getComplianceSettings
      jest.spyOn(complianceService, 'getComplianceSettings').mockResolvedValue(mockSettings as any);

      const result = await complianceService.cleanupExpiredData(teamId);

      expect(result.deletedRecords).toBe(0);
      expect(result.cleanedDataTypes).toHaveLength(0);
    });
  });

  describe('generateComplianceReport', () => {
    it('should generate compliance report successfully', async () => {
      const teamId = 'team-123';

      const mockSettings = {
        dataRetentionPolicy: {
          userDataRetentionDays: 365,
          auditLogRetentionDays: 2555,
          autoDeleteEnabled: true,
        },
        auditLogging: {
          enabled: true,
          logLevel: 'detailed',
          retentionDays: 2555,
        },
        accessControls: {
          requireMFA: true,
          ipWhitelist: [],
          sessionTimeout: 30,
        },
        privacySettings: {
          gdprCompliance: true,
          ccpaCompliance: true,
          dataEncryption: true,
        },
        regulatoryCompliance: [],
      };

      // Mock getComplianceSettings
      jest.spyOn(complianceService, 'getComplianceSettings').mockResolvedValue(mockSettings as any);

      const result = await complianceService.generateComplianceReport(teamId);

      expect(result.teamId).toBe(teamId);
      expect(result.generatedAt).toBeInstanceOf(Date);
      expect(result.complianceStatus).toEqual(mockSettings);
      expect(result.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('error handling', () => {
    it('should handle missing environment variables', () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => new ComplianceManagementService()).toThrow(
        'Supabase environment variables are not set.',
      );
    });
  });
});
