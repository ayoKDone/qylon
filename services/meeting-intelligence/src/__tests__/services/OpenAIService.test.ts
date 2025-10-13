/**
 * Tests for OpenAIService
 * Tests OpenAI integration, action item extraction, summarization, and error handling
 */

import { OpenAIService } from '../../services/OpenAIService';
import { ActionItem, MeetingSummary, MeetingTranscription, SentimentAnalysis } from '../../types';
import { logger } from '../../utils/logger';

// Mock OpenAI
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
};

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => mockOpenAI);
});

// Mock the logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('OpenAIService', () => {
  let openAIService: OpenAIService;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env.OPENAI_API_KEY = 'test-api-key';
    process.env.OPENAI_MODEL = 'gpt-4-turbo-preview';

    openAIService = new OpenAIService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should create OpenAIService with valid API key', () => {
      expect(openAIService).toBeInstanceOf(OpenAIService);
    });

    it('should throw error when OPENAI_API_KEY is missing', () => {
      delete process.env.OPENAI_API_KEY;

      expect(() => new OpenAIService()).toThrow('OPENAI_API_KEY environment variable is required');
    });

    it('should use default model when OPENAI_MODEL is not set', () => {
      delete process.env.OPENAI_MODEL;

      const service = new OpenAIService();
      expect(service).toBeInstanceOf(OpenAIService);
    });
  });

  describe('extractActionItems', () => {
    const mockTranscription: MeetingTranscription = {
      id: 'test-meeting-id',
      meeting_id: 'test-meeting-id',
      content: 'John will send the report by Friday',
      language: 'en',
      confidence: 0.95,
      speaker_segments: [],
      processing_status: 'completed' as any,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockActionItems: ActionItem[] = [
      {
        id: '',
        meeting_id: 'test-meeting-id',
        title: 'Send report',
        description: 'Send the report by Friday',
        assignee: 'John',
        due_date: new Date('2024-01-05'),
        priority: 'medium',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    it('should extract action items successfully', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockActionItems),
            },
          },
        ],
      });

      const result = await openAIService.extractActionItems(mockTranscription, 'Test Meeting');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        assignee: 'John',
        description: 'Send the report by Friday',
        due_date: new Date('2024-01-05'),
        id: '',
        meeting_id: 'test-meeting-id',
        priority: 'medium',
        status: 'pending',
        title: 'Send report',
      });
      expect(result[0].created_at).toBeInstanceOf(Date);
      expect(result[0].updated_at).toBeInstanceOf(Date);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4-turbo-preview',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('expert meeting assistant'),
          }),
        ]),
        temperature: 0.3,
        max_tokens: 2000,
      });
    });

    it('should handle API errors gracefully', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      await expect(
        openAIService.extractActionItems(mockTranscription, 'Test Meeting')
      ).rejects.toThrow('API Error');

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to extract action items',
        expect.objectContaining({
          error: expect.any(String),
          meetingId: 'test-meeting-id',
        })
      );
    });

    it('should handle invalid JSON response', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Invalid JSON response',
            },
          },
        ],
      });

      await expect(
        openAIService.extractActionItems(mockTranscription, 'Test Meeting')
      ).rejects.toThrow('Failed to extract action items');
    });
  });

  describe('generateSummary', () => {
    const mockTranscription: MeetingTranscription = {
      id: 'test-meeting-id',
      meeting_id: 'test-meeting-id',
      content: 'Meeting discussion about project updates',
      language: 'en',
      confidence: 0.95,
      speaker_segments: [],
      processing_status: 'completed' as any,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockSummary: MeetingSummary = {
      id: 'summary-1',
      meeting_id: 'test-meeting-id',
      summary: 'Project updates discussed',
      key_points: ['Point 1', 'Point 2'],
      decisions: ['Decision 1'],
      next_steps: ['Next step 1'],
      sentiment: {
        overall_sentiment: 'positive',
        confidence: 0.8,
        speaker_sentiments: {}
      },
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should generate summary successfully', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockSummary),
            },
          },
        ],
      });

      const result = await openAIService.generateMeetingSummary(mockTranscription, 'Test Meeting');

      expect(result).toMatchObject({
        decisions: ['Decision 1'],
        key_points: ['Point 1', 'Point 2'],
        meeting_id: 'test-meeting-id',
        next_steps: ['Next step 1'],
        sentiment: {
          confidence: 0.8,
          overall_sentiment: 'positive',
          speaker_sentiments: {},
        },
        summary: 'Project updates discussed',
      });
      expect(result.id).toBe('');
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4-turbo-preview',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('expert meeting assistant'),
          }),
        ]),
        temperature: 0.3,
        max_tokens: 3000,
      });
    });

    it('should handle API errors gracefully', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      await expect(
        openAIService.generateMeetingSummary(mockTranscription, 'Test Meeting')
      ).rejects.toThrow('API Error');

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to generate meeting summary',
        expect.objectContaining({
          error: expect.any(String),
          meetingId: 'test-meeting-id',
        })
      );
    });
  });

  describe('analyzeSentiment', () => {
    const mockTranscription: MeetingTranscription = {
      id: 'test-meeting-id',
      meeting_id: 'test-meeting-id',
      content: 'Great meeting, everyone was positive',
      language: 'en',
      confidence: 0.95,
      speaker_segments: [],
      processing_status: 'completed' as any,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockSentiment: SentimentAnalysis = {
      overall_sentiment: 'positive',
      confidence: 0.85,
      speaker_sentiments: {
        'John': {
          sentiment: 'positive',
          confidence: 0.9
        },
        'Jane': {
          sentiment: 'positive',
          confidence: 0.8
        }
      }
    };

    it('should analyze sentiment successfully', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockSentiment),
            },
          },
        ],
      });

      const result = await openAIService.analyzeSentiment(mockTranscription);

      expect(result).toEqual(mockSentiment);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4-turbo-preview',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('expert sentiment analysis assistant'),
          }),
        ]),
        temperature: 0.1,
        max_tokens: 1000,
      });
    });

    it('should handle API errors gracefully', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      await expect(
        openAIService.analyzeSentiment(mockTranscription)
      ).rejects.toThrow('API Error');

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to analyze sentiment',
        expect.objectContaining({
          error: expect.any(String),
          meetingId: 'test-meeting-id',
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle empty transcription content', async () => {
      const emptyTranscription: MeetingTranscription = {
        id: 'test-meeting-id',
        meetingId: 'test-meeting-id',
        content: '',
        language: 'en',
        confidence: 0.95,
        speakers: [],
        duration: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await expect(
        openAIService.extractActionItems(emptyTranscription, 'Test Meeting')
      ).rejects.toThrow();
    });

    it('should handle null transcription', async () => {
      await expect(
        openAIService.extractActionItems(null as any, 'Test Meeting')
      ).rejects.toThrow();
    });
  });
});
