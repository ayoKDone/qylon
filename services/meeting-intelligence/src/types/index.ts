import { z } from 'zod';

// Meeting Intelligence Types
export interface Meeting {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  start_time: Date;
  end_time?: Date;
  platform: MeetingPlatform;
  meeting_url?: string;
  recording_url?: string;
  status: MeetingStatus;
  participants: string[];
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface MeetingTranscription {
  id: string;
  meeting_id: string;
  content: string;
  language: string;
  confidence: number;
  speaker_segments: SpeakerSegment[];
  processing_status: ProcessingStatus;
  created_at: Date;
  updated_at: Date;
}

export interface SpeakerSegment {
  speaker_id: string;
  speaker_name?: string;
  start_time: number;
  end_time: number;
  text: string;
  confidence: number;
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  title: string;
  description: string;
  assignee?: string;
  due_date?: Date;
  priority: PriorityLevel;
  status: ActionItemStatus;
  created_at: Date;
  updated_at: Date;
}

export interface MeetingSummary {
  id: string;
  meeting_id: string;
  summary: string;
  key_points: string[];
  decisions: string[];
  next_steps: string[];
  sentiment: SentimentAnalysis;
  created_at: Date;
  updated_at: Date;
}

export interface SentimentAnalysis {
  overall_sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  speaker_sentiments: Record<
    string,
    {
      sentiment: 'positive' | 'neutral' | 'negative';
      confidence: number;
    }
  >;
}

// Enums
export enum MeetingPlatform {
  ZOOM = 'zoom',
  TEAMS = 'teams',
  GOOGLE_MEET = 'google_meet',
  WEBEX = 'webex',
  OTHER = 'other',
}

export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  RECORDING = 'recording',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ProcessingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ActionItemStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Request/Response Types
export interface CreateMeetingRequest {
  client_id: string;
  title: string;
  description?: string;
  start_time: Date;
  platform: MeetingPlatform;
  meeting_url?: string;
  participants: string[];
  metadata?: Record<string, any>;
}

export interface UpdateMeetingRequest {
  title?: string;
  description?: string;
  end_time?: Date;
  status?: MeetingStatus;
  recording_url?: string;
  metadata?: Record<string, any>;
}

export interface ProcessRecordingRequest {
  meeting_id: string;
  recording_url: string;
  language?: string;
  options?: {
    enable_speaker_diarization?: boolean;
    enable_sentiment_analysis?: boolean;
    enable_action_item_extraction?: boolean;
  };
}

export interface TranscriptionResponse {
  id: string;
  meeting_id: string;
  content: string;
  language: string;
  confidence: number;
  speaker_segments: SpeakerSegment[];
  processing_status: ProcessingStatus;
}

export interface ActionItemResponse {
  id: string;
  meeting_id: string;
  title: string;
  description: string;
  assignee?: string;
  due_date?: Date;
  priority: PriorityLevel;
  status: ActionItemStatus;
}

export interface MeetingSummaryResponse {
  id: string;
  meeting_id: string;
  summary: string;
  key_points: string[];
  decisions: string[];
  next_steps: string[];
  sentiment: SentimentAnalysis;
}

// Recall.ai Integration Types
export interface RecallBot {
  id: string;
  name: string;
  meeting_url: string;
  bot_token: string;
  status: 'active' | 'inactive';
  created_at: Date;
}

export interface RecallRecording {
  id: string;
  bot_id: string;
  meeting_id: string;
  recording_url: string;
  transcription_url?: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  created_at: Date;
  updated_at: Date;
}

// Validation Schemas
export const CreateMeetingSchema = z.object({
  client_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  start_time: z.date(),
  platform: z.nativeEnum(MeetingPlatform),
  meeting_url: z.string().url().optional(),
  participants: z.array(z.string().email()).min(1),
  metadata: z.record(z.any()).optional(),
});

export const UpdateMeetingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  end_time: z.date().optional(),
  status: z.nativeEnum(MeetingStatus).optional(),
  recording_url: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

export const ProcessRecordingSchema = z.object({
  meeting_id: z.string().uuid(),
  recording_url: z.string().url(),
  language: z.string().length(2).optional(),
  options: z
    .object({
      enable_speaker_diarization: z.boolean().optional(),
      enable_sentiment_analysis: z.boolean().optional(),
      enable_action_item_extraction: z.boolean().optional(),
    })
    .optional(),
});

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

// Error Types
export class MeetingIntelligenceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'MeetingIntelligenceError';
  }
}

export class RecallAIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'RecallAIError';
  }
}

export class TranscriptionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'TranscriptionError';
  }
}
