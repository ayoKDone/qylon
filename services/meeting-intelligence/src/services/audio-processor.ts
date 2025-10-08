/**
 * Audio Processor Service
 *
 * This service handles real-time audio processing for meeting intelligence.
 * It processes audio chunks, applies noise reduction, and prepares audio
 * for transcription and analysis.
 */

import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

export interface AudioChunk {
  id: string;
  data: Buffer;
  start_time_ms: number;
  end_time_ms: number;
  duration_ms: number;
  sequence_number: number;
  is_overlap: boolean;
  overlap_duration_ms: number;
  metadata: {
    chunk_type: 'regular' | 'overlap' | 'final';
    quality_score: number;
    compression_ratio: number;
    noise_level: number;
  };
}

export interface ProcessedAudioChunk {
  id: string;
  original_chunk_id: string;
  processed_data: Buffer;
  start_time_ms: number;
  end_time_ms: number;
  duration_ms: number;
  sequence_number: number;
  processing_metadata: {
    processing_time_ms: number;
    quality_improvement: number;
    noise_reduction_applied: boolean;
    compression_applied: boolean;
  };
}

export interface ProcessingConfig {
  enable_noise_reduction: boolean;
  enable_echo_cancellation: boolean;
  enable_auto_gain_control: boolean;
  target_quality_score: number;
  max_processing_time_ms: number;
}

export class AudioProcessor extends EventEmitter {
  private processingQueue: AudioChunk[] = [];
  private isProcessing = false;
  private config: ProcessingConfig;
  private stats = {
    chunksProcessed: 0,
    totalProcessingTime: 0,
    averageProcessingTime: 0,
    errors: 0,
  };

  constructor(
    config: ProcessingConfig = {
      enable_noise_reduction: true,
      enable_echo_cancellation: true,
      enable_auto_gain_control: true,
      target_quality_score: 80,
      max_processing_time_ms: 100,
    },
  ) {
    super();
    this.config = config;
    this.setupEventHandlers();
  }

  /**
   * Validate audio file
   */
  validateAudioFile(file: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }

    if (!file.buffer || file.buffer.length === 0) {
      errors.push('File is empty');
    }

    if (!file.mimetype) {
      errors.push('File type is required');
    } else {
      const validMimeTypes = [
        'audio/wav',
        'audio/mp3',
        'audio/mpeg',
        'audio/ogg',
        'audio/webm',
      ];
      if (!validMimeTypes.includes(file.mimetype)) {
        errors.push(
          'Invalid audio format. Supported formats: audio/wav, audio/mp3, audio/mpeg, audio/ogg, audio/webm',
        );
      }
    }

    if (file.size && file.size > 50 * 1024 * 1024) {
      // 50MB limit
      errors.push('File size exceeds maximum limit of 50MB');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Process an audio chunk with additional parameters
   */
  async processAudioChunk(
    chunk: Buffer,
    chunkIndex: number,
    totalChunks: number,
  ): Promise<{
    success: boolean;
    chunkIndex?: number;
    processedChunk?: Buffer;
    metadata?: any;
    error?: string;
  }> {
    try {
      if (!chunk || chunk.length === 0) {
        return { success: false, error: 'Empty audio chunk' };
      }

      if (chunkIndex < 0) {
        return { success: false, error: 'Invalid chunk index' };
      }

      if (chunkIndex >= totalChunks) {
        return { success: false, error: 'Chunk index exceeds total chunks' };
      }

      // Simulate processing
      const processedChunk = Buffer.from(chunk);
      const metadata = {
        duration: chunk.length / 1000, // Simulate duration
        sampleRate: 44100,
        channels: 2,
      };

      return {
        success: true,
        chunkIndex,
        processedChunk,
        metadata,
      };
    } catch (error) {
      logger.error('Audio processing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        chunkIndex,
        totalChunks,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed',
      };
    }
  }

  /**
   * Combine multiple audio chunks
   */
  async combineAudioChunks(chunks: Buffer[]): Promise<{
    success: boolean;
    combinedAudio?: Buffer;
    totalDuration?: number;
    chunkCount?: number;
    error?: string;
  }> {
    try {
      if (!chunks || chunks.length === 0) {
        return { success: false, error: 'No audio chunks provided' };
      }

      // Validate chunks
      for (const chunk of chunks) {
        if (!chunk || !Buffer.isBuffer(chunk)) {
          return { success: false, error: 'Invalid audio chunk' };
        }
      }

      // Combine chunks
      const combinedAudio = Buffer.concat(chunks);
      const totalDuration = combinedAudio.length / 1000; // Simulate duration

      return {
        success: true,
        combinedAudio,
        totalDuration,
        chunkCount: chunks.length,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to combine chunks',
      };
    }
  }

  /**
   * Extract audio metadata
   */
  async extractAudioMetadata(
    audioBuffer: Buffer,
  ): Promise<{ success: boolean; metadata?: any; error?: string }> {
    try {
      if (!audioBuffer || audioBuffer.length === 0) {
        return { success: false, error: 'Empty audio buffer' };
      }

      // Simulate metadata extraction
      const metadata = {
        duration: audioBuffer.length / 1000,
        sampleRate: 44100,
        channels: 2,
        bitDepth: 16,
        format: 'wav',
      };

      return {
        success: true,
        metadata,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to extract metadata',
      };
    }
  }

  /**
   * Process an audio chunk (original method)
   */
  async processAudioChunkOriginal(
    chunk: AudioChunk,
  ): Promise<ProcessedAudioChunk> {
    const startTime = Date.now();

    try {
      // Validate input chunk
      this.validateAudioChunk(chunk);

      logger.debug('Processing audio chunk', {
        chunkId: chunk.id,
        duration: chunk.duration_ms,
        dataSize: chunk.data.length,
      });

      // Add to processing queue
      this.processingQueue.push(chunk);

      // Process the chunk
      const processedChunk = await this.processChunk(chunk);

      // Update stats
      const processingTime = Date.now() - startTime;
      this.updateStats(processingTime);

      // Emit event
      this.emit('chunkProcessed', {
        originalChunk: chunk,
        processedChunk,
        processingTime,
      });

      logger.debug('Audio chunk processed successfully', {
        chunkId: chunk.id,
        processingTime,
      });

      return processedChunk;
    } catch (error) {
      this.stats.errors++;
      this.emit('chunkProcessingError', {
        chunk,
        error: error as Error,
      });

      logger.error('Failed to process audio chunk', {
        chunkId: chunk.id,
        error: (error as Error).message,
      });

      throw error;
    }
  }

  /**
   * Process multiple audio chunks in batch
   */
  async processAudioChunks(
    chunks: AudioChunk[],
  ): Promise<ProcessedAudioChunk[]> {
    logger.debug('Processing audio chunks in batch', {
      chunkCount: chunks.length,
    });

    const results: ProcessedAudioChunk[] = [];
    const errors: Error[] = [];

    for (const chunk of chunks) {
      try {
        const processedChunk = await this.processAudioChunkOriginal(chunk);
        results.push(processedChunk);
      } catch (error) {
        errors.push(error as Error);
        logger.error('Failed to process chunk in batch', {
          chunkId: chunk.id,
          error: (error as Error).message,
        });
      }
    }

    if (errors.length > 0) {
      logger.warn('Some chunks failed to process in batch', {
        totalChunks: chunks.length,
        successfulChunks: results.length,
        failedChunks: errors.length,
      });
    }

    return results;
  }

  /**
   * Update processing configuration
   */
  updateConfig(newConfig: Partial<ProcessingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Audio processor configuration updated', {
      config: this.config,
    });
  }

  /**
   * Get processing statistics
   */
  getStats() {
    return {
      ...this.stats,
      queueLength: this.processingQueue.length,
      isProcessing: this.isProcessing,
      config: this.config,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      chunksProcessed: 0,
      totalProcessingTime: 0,
      averageProcessingTime: 0,
      errors: 0,
    };
    logger.info('Audio processor statistics reset');
  }

  /**
   * Process a single audio chunk
   */
  private async processChunk(chunk: AudioChunk): Promise<ProcessedAudioChunk> {
    const startTime = Date.now();

    // Simulate audio processing
    let processedData = chunk.data;

    // Apply noise reduction if enabled
    if (this.config.enable_noise_reduction) {
      processedData = this.applyNoiseReduction(processedData);
    }

    // Apply echo cancellation if enabled
    if (this.config.enable_echo_cancellation) {
      processedData = this.applyEchoCancellation(processedData);
    }

    // Apply auto gain control if enabled
    if (this.config.enable_auto_gain_control) {
      processedData = this.applyAutoGainControl(processedData);
    }

    const processingTime = Date.now() - startTime;

    return {
      id: `processed_${chunk.id}`,
      original_chunk_id: chunk.id,
      processed_data: processedData,
      start_time_ms: chunk.start_time_ms,
      end_time_ms: chunk.end_time_ms,
      duration_ms: chunk.duration_ms,
      sequence_number: chunk.sequence_number,
      processing_metadata: {
        processing_time_ms: processingTime,
        quality_improvement: this.calculateQualityImprovement(
          chunk,
          processedData,
        ),
        noise_reduction_applied: this.config.enable_noise_reduction,
        compression_applied: false,
      },
    };
  }

  /**
   * Apply noise reduction to audio data
   */
  private applyNoiseReduction(data: Buffer): Buffer {
    // Simulate noise reduction processing
    // In a real implementation, this would use audio processing libraries
    return data;
  }

  /**
   * Apply echo cancellation to audio data
   */
  private applyEchoCancellation(data: Buffer): Buffer {
    // Simulate echo cancellation processing
    // In a real implementation, this would use audio processing libraries
    return data;
  }

  /**
   * Apply auto gain control to audio data
   */
  private applyAutoGainControl(data: Buffer): Buffer {
    // Simulate auto gain control processing
    // In a real implementation, this would use audio processing libraries
    return data;
  }

  /**
   * Calculate quality improvement score
   */
  private calculateQualityImprovement(
    originalChunk: AudioChunk,
    _processedData: Buffer,
  ): number {
    // Simulate quality improvement calculation
    // In a real implementation, this would analyze audio quality metrics
    return Math.min(100, originalChunk.metadata.quality_score + 10);
  }

  /**
   * Update processing statistics
   */
  private updateStats(processingTime: number): void {
    this.stats.chunksProcessed++;
    this.stats.totalProcessingTime += processingTime;
    this.stats.averageProcessingTime =
      this.stats.totalProcessingTime / this.stats.chunksProcessed;
  }

  /**
   * Validate audio chunk before processing
   */
  private validateAudioChunk(chunk: AudioChunk): void {
    if (!chunk) {
      throw new Error('Audio chunk is required');
    }

    if (!chunk.id || chunk.id.trim() === '') {
      throw new Error('Audio chunk ID is required');
    }

    if (!chunk.data || chunk.data.length === 0) {
      throw new Error('Audio chunk data is required and cannot be empty');
    }

    if (chunk.duration_ms <= 0) {
      throw new Error('Audio chunk duration must be positive');
    }

    if (chunk.start_time_ms < 0) {
      throw new Error('Audio chunk start time cannot be negative');
    }

    if (chunk.end_time_ms <= chunk.start_time_ms) {
      throw new Error('Audio chunk end time must be after start time');
    }

    if (chunk.sequence_number < 0) {
      throw new Error('Audio chunk sequence number cannot be negative');
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on('chunkProcessed', data => {
      logger.debug('Audio chunk processed', {
        originalChunkId: data.originalChunk.id,
        processedChunkId: data.processedChunk.id,
        processingTime:
          data.processedChunk.processing_metadata.processing_time_ms,
      });
    });

    this.on('chunkProcessingError', data => {
      logger.error('Audio chunk processing error', {
        chunkId: data.chunk.id,
        error: data.error.message,
      });
    });
  }
}
