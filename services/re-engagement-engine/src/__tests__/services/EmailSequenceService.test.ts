import { EmailSequenceService } from '../../services/EmailSequenceService';
import { CreateEmailSequenceRequest, EmailProviderConfig } from '../../types';

// Mock the Supabase client module
const mockSupabaseClient = {
  from: jest.fn(),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

describe('EmailSequenceService', () => {
  let emailSequenceService: EmailSequenceService;

  const mockEmailProvider: EmailProviderConfig = {
    provider: 'sendgrid',
    apiKey: 'test-api-key',
    fromEmail: 'test@qylon.ai',
    fromName: 'Qylon Test',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    emailSequenceService = new EmailSequenceService(
      'https://test.supabase.co',
      'test-key',
      mockEmailProvider,
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
            stepNumber: 1,
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

      // Mock the sequence creation
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockSequence, error: null }),
          }),
        }),
      });

      // Mock the step creation
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockStep, error: null }),
          }),
        }),
      });

      const result = await emailSequenceService.createEmailSequence(userId, request);

      expect(result).toEqual({
        ...mockSequence,
        steps: [mockStep],
      });
    });

    it('should throw error when sequence creation fails', async () => {
      const userId = 'test-user-id';
      const request: CreateEmailSequenceRequest = {
        name: 'Test Sequence',
        description: 'Test description',
        triggerEvent: 'user_signup',
        steps: [
          {
            stepNumber: 1,
            delayHours: 0,
            subject: 'Welcome!',
            template: 'Welcome to Qylon!',
            variables: { name: '{{userName}}' },
            isActive: true,
          },
        ],
      };

      // Mock the sequence creation to fail
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockResolvedValue({ data: null, error: { message: 'Database error' } }),
          }),
        }),
      });

      await expect(emailSequenceService.createEmailSequence(userId, request)).rejects.toThrow(
        'Failed to create email sequence: Database error',
      );
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

      // Mock the sequences query
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockSequences, error: null }),
          }),
        }),
      });

      // Mock the steps query
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const result = await emailSequenceService.getEmailSequences(userId);

      expect(result).toEqual(mockSequences);
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

      // Mock the sequences query
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: mockSequences, error: null }),
            }),
          }),
        }),
      });

      // Mock the steps query
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

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

      // Mock the sequence query
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockSequence, error: null }),
            }),
          }),
        }),
      });

      // Mock the steps query
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const result = await emailSequenceService.getEmailSequence(sequenceId, userId);

      expect(result).toEqual(mockSequence);
    });

    it('should return null when sequence not found', async () => {
      const sequenceId = 'non-existent-id';
      const userId = 'test-user-id';

      // Mock the sequence query to return null
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
            }),
          }),
        }),
      });

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

      // Mock the update query
      mockSupabaseClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockUpdatedSequence, error: null }),
              }),
            }),
          }),
        }),
      });

      // Mock the steps query
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const result = await emailSequenceService.updateEmailSequence(
        sequenceId,
        userId,
        updateRequest,
      );

      expect(result).toEqual(mockUpdatedSequence);
    });
  });

  describe('deleteEmailSequence', () => {
    it('should delete an email sequence successfully', async () => {
      const sequenceId = 'test-sequence-id';
      const userId = 'test-user-id';

      // Mock the steps deletion
      mockSupabaseClient.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      // Mock the sequence deletion
      mockSupabaseClient.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      await expect(
        emailSequenceService.deleteEmailSequence(sequenceId, userId),
      ).resolves.not.toThrow();
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
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockSequence, error: null }),
            }),
          }),
        }),
      });

      // Mock the steps query
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockSequence.steps, error: null }),
          }),
        }),
      });

      // Mock execution creation
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockExecution, error: null }),
          }),
        }),
      });

      const result = await emailSequenceService.startEmailSequenceExecution(
        sequenceId,
        userId,
        clientId,
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

      // Mock the deliveries query
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: mockDeliveries, error: null }),
        }),
      });

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
