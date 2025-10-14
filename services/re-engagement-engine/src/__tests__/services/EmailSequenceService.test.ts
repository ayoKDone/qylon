import { EmailSequenceService } from '../../services/EmailSequenceService';
import { CreateEmailSequenceRequest, EmailProviderConfig } from '../../types';

describe('EmailSequenceService', () => {
  let emailSequenceService: EmailSequenceService;
  let mockSupabase: any;
  let mockSgMail: any;

  const mockEmailProvider: EmailProviderConfig = {
    provider: 'sendgrid',
    apiKey: 'test-api-key',
    fromEmail: 'test@qylon.ai',
    fromName: 'Qylon Test',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Supabase client
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    };

    // Mock SendGrid
    mockSgMail = {
      setApiKey: jest.fn(),
      send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
    };

    emailSequenceService = new EmailSequenceService(
      'https://test.supabase.co',
      'test-service-role-key',
      mockEmailProvider
    );
  });

  describe('createEmailSequence', () => {
    it('should create a new email sequence successfully', async () => {
      const userId = 'test-user-id';
      const request: CreateEmailSequenceRequest = {
        name: 'Test Sequence',
        description: 'Test description',
        triggerEvent: 'user_signup',
        steps: [
          {
            delayHours: 0,
            subject: 'Welcome!',
            template: 'Welcome to Qylon!',
            variables: { name: '{{userName}}' },
            isActive: true,
          },
        ],
      };

      const mockSequence = {
        id: 'sequence-id',
        name: 'Test Sequence',
        description: 'Test description',
        triggerEvent: 'user_signup',
        steps: [],
        isActive: true,
        userId,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      const mockStep = {
        id: 'step-id',
        sequenceId: 'sequence-id',
        stepNumber: 1,
        delayHours: 0,
        subject: 'Welcome!',
        template: 'Welcome to Qylon!',
        variables: { name: '{{userName}}' },
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      // Mock sequence creation
      mockSupabase.from().insert().select().single
        .mockResolvedValueOnce({ data: mockSequence, error: null });

      // Mock step creation
      mockSupabase.from().insert().select().single
        .mockResolvedValueOnce({ data: mockStep, error: null });

      const result = await emailSequenceService.createEmailSequence(userId, request);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Sequence');
      expect(result.steps).toHaveLength(1);
      expect(mockSupabase.from).toHaveBeenCalledWith('email_sequences');
      expect(mockSupabase.from).toHaveBeenCalledWith('email_steps');
    });

    it('should throw error when sequence creation fails', async () => {
      const userId = 'test-user-id';
      const request: CreateEmailSequenceRequest = {
        name: 'Test Sequence',
        description: 'Test description',
        triggerEvent: 'user_signup',
        steps: [
          {
            delayHours: 0,
            subject: 'Welcome!',
            template: 'Welcome to Qylon!',
            variables: { name: '{{userName}}' },
            isActive: true,
          },
        ],
      };

      mockSupabase.from().insert().select().single
        .mockResolvedValueOnce({ data: null, error: { message: 'Database error' } });

      await expect(emailSequenceService.createEmailSequence(userId, request))
        .rejects.toThrow('Failed to create email sequence: Database error');
    });
  });

  describe('getEmailSequences', () => {
    it('should get email sequences for a user', async () => {
      const userId = 'test-user-id';
      const mockSequences = [
        {
          id: 'sequence-1',
          name: 'Sequence 1',
          steps: [],
        },
        {
          id: 'sequence-2',
          name: 'Sequence 2',
          steps: [],
        },
      ];

      mockSupabase.from().select().eq().order()
        .mockResolvedValueOnce({ data: mockSequences, error: null });

      const result = await emailSequenceService.getEmailSequences(userId);

      expect(result).toEqual(mockSequences);
      expect(mockSupabase.from).toHaveBeenCalledWith('email_sequences');
    });

    it('should get email sequences for a specific client', async () => {
      const userId = 'test-user-id';
      const clientId = 'test-client-id';
      const mockSequences = [
        {
          id: 'sequence-1',
          name: 'Sequence 1',
          steps: [],
        },
      ];

      mockSupabase.from().select().eq().eq().order()
        .mockResolvedValueOnce({ data: mockSequences, error: null });

      const result = await emailSequenceService.getEmailSequences(userId, clientId);

      expect(result).toEqual(mockSequences);
    });
  });

  describe('getEmailSequence', () => {
    it('should get a specific email sequence', async () => {
      const sequenceId = 'test-sequence-id';
      const userId = 'test-user-id';
      const mockSequence = {
        id: sequenceId,
        name: 'Test Sequence',
        steps: [],
      };

      mockSupabase.from().select().eq().eq().single()
        .mockResolvedValueOnce({ data: mockSequence, error: null });

      const result = await emailSequenceService.getEmailSequence(sequenceId, userId);

      expect(result).toEqual(mockSequence);
    });

    it('should return null when sequence not found', async () => {
      const sequenceId = 'non-existent-id';
      const userId = 'test-user-id';

      mockSupabase.from().select().eq().eq().single()
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      const result = await emailSequenceService.getEmailSequence(sequenceId, userId);

      expect(result).toBeNull();
    });
  });

  describe('updateEmailSequence', () => {
    it('should update an email sequence successfully', async () => {
      const sequenceId = 'test-sequence-id';
      const userId = 'test-user-id';
      const updateRequest = {
        name: 'Updated Sequence',
        isActive: false,
      };

      const mockUpdatedSequence = {
        id: sequenceId,
        name: 'Updated Sequence',
        isActive: false,
        steps: [],
      };

      mockSupabase.from().update().eq().eq().select().single()
        .mockResolvedValueOnce({ data: mockUpdatedSequence, error: null });

      mockSupabase.from().select().eq().order()
        .mockResolvedValueOnce({ data: [], error: null });

      const result = await emailSequenceService.updateEmailSequence(sequenceId, userId, updateRequest);

      expect(result).toEqual(mockUpdatedSequence);
      expect(mockSupabase.from).toHaveBeenCalledWith('email_sequences');
    });
  });

  describe('deleteEmailSequence', () => {
    it('should delete an email sequence successfully', async () => {
      const sequenceId = 'test-sequence-id';
      const userId = 'test-user-id';

      mockSupabase.from().delete().eq().eq()
        .mockResolvedValueOnce({ error: null });

      await expect(emailSequenceService.deleteEmailSequence(sequenceId, userId))
        .resolves.not.toThrow();

      expect(mockSupabase.from).toHaveBeenCalledWith('email_steps');
      expect(mockSupabase.from).toHaveBeenCalledWith('email_sequences');
    });
  });

  describe('startEmailSequenceExecution', () => {
    it('should start an email sequence execution', async () => {
      const sequenceId = 'test-sequence-id';
      const userId = 'test-user-id';
      const clientId = 'test-client-id';

      const mockSequence = {
        id: sequenceId,
        name: 'Test Sequence',
        isActive: true,
        steps: [
          {
            id: 'step-1',
            stepNumber: 1,
            delayHours: 0,
            subject: 'Welcome!',
            template: 'Welcome!',
            isActive: true,
          },
        ],
      };

      const mockExecution = {
        id: 'execution-id',
        sequenceId,
        userId,
        clientId,
        status: 'pending',
        currentStep: 0,
        nextExecutionAt: '2023-01-01T01:00:00Z',
        metadata: {},
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      // Mock getEmailSequence
      mockSupabase.from().select().eq().eq().single()
        .mockResolvedValueOnce({ data: mockSequence, error: null });

      // Mock execution creation
      mockSupabase.from().insert().select().single()
        .mockResolvedValueOnce({ data: mockExecution, error: null });

      const result = await emailSequenceService.startEmailSequenceExecution(
        sequenceId,
        userId,
        clientId
      );

      expect(result).toEqual(mockExecution);
    });
  });

  describe('getDeliveryStats', () => {
    it('should get delivery statistics', async () => {
      const userId = 'test-user-id';
      const mockDeliveries = [
        { status: 'sent' },
        { status: 'delivered' },
        { status: 'opened' },
        { status: 'clicked' },
        { status: 'bounced' },
        { status: 'failed' },
      ];

      mockSupabase.from().select().eq()
        .mockResolvedValueOnce({ data: mockDeliveries, error: null });

      const result = await emailSequenceService.getDeliveryStats(userId);

      expect(result).toBeDefined();
      expect(result.totalSent).toBe(1);
      expect(result.totalDelivered).toBe(1);
      expect(result.totalOpened).toBe(1);
      expect(result.totalClicked).toBe(1);
      expect(result.totalBounced).toBe(1);
      expect(result.totalFailed).toBe(1);
    });
  });
});
