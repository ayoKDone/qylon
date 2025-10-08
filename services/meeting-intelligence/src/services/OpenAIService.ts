import OpenAI from 'openai';
import {
  ActionItem,
  MeetingSummary,
  MeetingTranscription,
  PriorityLevel,
  SentimentAnalysis,
  SpeakerSegment,
  TranscriptionError,
} from '../types';
import { logger } from '../utils/logger';

export class OpenAIService {
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.client = new OpenAI({
      apiKey: apiKey,
    });

    this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
  }

  /**
   * Extract action items from meeting transcription
   */
  async extractActionItems(
    transcription: MeetingTranscription,
    meetingTitle: string
  ): Promise<ActionItem[]> {
    try {
      const prompt = this.buildActionItemPrompt(transcription.content, meetingTitle);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert meeting assistant that extracts action items from meeting transcriptions. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const actionItems = JSON.parse(content);

      logger.info('Action items extracted successfully', {
        meetingId: transcription.meeting_id,
        actionItemCount: actionItems.length,
      });

      return actionItems.map((item: any) => ({
        id: '', // Will be set by database
        meeting_id: transcription.meeting_id,
        title: item.title,
        description: item.description,
        assignee: item.assignee,
        due_date: item.due_date ? new Date(item.due_date) : undefined,
        priority: this.mapPriority(item.priority),
        status: 'pending' as const,
        created_at: new Date(),
        updated_at: new Date(),
      }));
    } catch (error: any) {
      logger.error('Failed to extract action items', {
        meetingId: transcription.meeting_id,
        error: error.message,
      });

      throw new TranscriptionError(
        `Failed to extract action items: ${error.message}`,
        'ACTION_ITEM_EXTRACTION_FAILED',
        500
      );
    }
  }

  /**
   * Generate meeting summary
   */
  async generateMeetingSummary(
    transcription: MeetingTranscription,
    meetingTitle: string
  ): Promise<MeetingSummary> {
    try {
      const prompt = this.buildSummaryPrompt(transcription.content, meetingTitle);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert meeting assistant that creates comprehensive meeting summaries. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const summaryData = JSON.parse(content);

      logger.info('Meeting summary generated successfully', {
        meetingId: transcription.meeting_id,
      });

      return {
        id: '', // Will be set by database
        meeting_id: transcription.meeting_id,
        summary: summaryData.summary,
        key_points: summaryData.key_points,
        decisions: summaryData.decisions,
        next_steps: summaryData.next_steps,
        sentiment: summaryData.sentiment,
        created_at: new Date(),
        updated_at: new Date(),
      };
    } catch (error: any) {
      logger.error('Failed to generate meeting summary', {
        meetingId: transcription.meeting_id,
        error: error.message,
      });

      throw new TranscriptionError(
        `Failed to generate meeting summary: ${error.message}`,
        'SUMMARY_GENERATION_FAILED',
        500
      );
    }
  }

  /**
   * Perform sentiment analysis on meeting transcription
   */
  async analyzeSentiment(transcription: MeetingTranscription): Promise<SentimentAnalysis> {
    try {
      const prompt = this.buildSentimentPrompt(transcription.content);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert sentiment analysis assistant. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const sentimentData = JSON.parse(content);

      logger.info('Sentiment analysis completed successfully', {
        meetingId: transcription.meeting_id,
      });

      return sentimentData;
    } catch (error: any) {
      logger.error('Failed to analyze sentiment', {
        meetingId: transcription.meeting_id,
        error: error.message,
      });

      throw new TranscriptionError(
        `Failed to analyze sentiment: ${error.message}`,
        'SENTIMENT_ANALYSIS_FAILED',
        500
      );
    }
  }

  /**
   * Enhance speaker diarization with AI
   */
  async enhanceSpeakerDiarization(speakerSegments: SpeakerSegment[]): Promise<SpeakerSegment[]> {
    try {
      const prompt = this.buildSpeakerEnhancementPrompt(speakerSegments);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert at speaker identification and diarization. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const enhancedSegments = JSON.parse(content);

      logger.info('Speaker diarization enhanced successfully', {
        segmentCount: enhancedSegments.length,
      });

      return enhancedSegments;
    } catch (error: any) {
      logger.error('Failed to enhance speaker diarization', {
        error: error.message,
      });

      throw new TranscriptionError(
        `Failed to enhance speaker diarization: ${error.message}`,
        'SPEAKER_ENHANCEMENT_FAILED',
        500
      );
    }
  }

  /**
   * Build prompt for action item extraction
   */
  private buildActionItemPrompt(content: string, meetingTitle: string): string {
    return `
Analyze the following meeting transcription and extract all action items. Return a JSON array of action items with the following structure:

{
  "action_items": [
    {
      "title": "Brief action item title",
      "description": "Detailed description of what needs to be done",
      "assignee": "email@example.com or null if not specified",
      "due_date": "YYYY-MM-DD or null if not specified",
      "priority": "low|medium|high|urgent"
    }
  ]
}

Meeting Title: ${meetingTitle}

Transcription:
${content}

Guidelines:
- Extract only concrete, actionable items
- If no assignee is mentioned, set to null
- If no due date is mentioned, set to null
- Determine priority based on urgency and importance
- Be specific and clear in descriptions
- Return empty array if no action items found
`;
  }

  /**
   * Build prompt for meeting summary
   */
  private buildSummaryPrompt(content: string, meetingTitle: string): string {
    return `
Create a comprehensive summary of the following meeting. Return a JSON object with the following structure:

{
  "summary": "2-3 paragraph executive summary",
  "key_points": ["key point 1", "key point 2", ...],
  "decisions": ["decision 1", "decision 2", ...],
  "next_steps": ["next step 1", "next step 2", ...],
  "sentiment": {
    "overall_sentiment": "positive|neutral|negative",
    "confidence": 0.85,
    "speaker_sentiments": {
      "speaker_1": {"sentiment": "positive", "confidence": 0.8},
      "speaker_2": {"sentiment": "neutral", "confidence": 0.7}
    }
  }
}

Meeting Title: ${meetingTitle}

Transcription:
${content}

Guidelines:
- Create a clear, concise executive summary
- Extract 5-10 key points
- List all decisions made
- Identify next steps and follow-ups
- Analyze overall sentiment and per-speaker sentiment
- Be objective and factual
`;
  }

  /**
   * Build prompt for sentiment analysis
   */
  private buildSentimentPrompt(content: string): string {
    return `
Analyze the sentiment of the following meeting transcription. Return a JSON object with the following structure:

{
  "overall_sentiment": "positive|neutral|negative",
  "confidence": 0.85,
  "speaker_sentiments": {
    "speaker_1": {"sentiment": "positive", "confidence": 0.8},
    "speaker_2": {"sentiment": "neutral", "confidence": 0.7}
  }
}

Transcription:
${content}

Guidelines:
- Analyze the overall tone and sentiment of the meeting
- Provide confidence scores (0-1)
- Analyze sentiment for each speaker if identifiable
- Consider context, not just individual words
- Be objective in your analysis
`;
  }

  /**
   * Build prompt for speaker enhancement
   */
  private buildSpeakerEnhancementPrompt(segments: SpeakerSegment[]): string {
    const segmentsText = segments.map(seg => `Speaker ${seg.speaker_id}: ${seg.text}`).join('\n');

    return `
Enhance the speaker diarization for the following meeting segments. Return a JSON array with enhanced speaker information:

{
  "enhanced_segments": [
    {
      "speaker_id": "speaker_1",
      "speaker_name": "John Doe (if identifiable)",
      "start_time": 0,
      "end_time": 10.5,
      "text": "Hello everyone...",
      "confidence": 0.95
    }
  ]
}

Meeting Segments:
${segmentsText}

Guidelines:
- Try to identify speaker names if possible
- Maintain original timing information
- Improve confidence scores based on context
- Keep speaker_id consistent for the same person
- If speaker name cannot be determined, keep speaker_id
`;
  }

  /**
   * Map priority string to enum
   */
  private mapPriority(priority: string): PriorityLevel {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return PriorityLevel.URGENT;
      case 'high':
        return PriorityLevel.HIGH;
      case 'medium':
        return PriorityLevel.MEDIUM;
      case 'low':
        return PriorityLevel.LOW;
      default:
        return PriorityLevel.MEDIUM;
    }
  }

  /**
   * Health check for OpenAI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 1,
      });

      return response.choices.length > 0;
    } catch (error: any) {
      logger.error('OpenAI health check failed', {
        error: error.message,
      });
      return false;
    }
  }
}
