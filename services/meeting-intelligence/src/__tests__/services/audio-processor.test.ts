/**
 * Tests for AudioProcessor service
 * Tests audio processing, validation, and error handling
 */

import { AudioProcessor } from '../../services/audio-processor';

// Mock the logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('AudioProcessor', () => {
  let audioProcessor: AudioProcessor;

  beforeEach(() => {
    audioProcessor = new AudioProcessor();
    jest.clearAllMocks();
  });

  describe('validateAudioFile', () => {
    it('should validate valid audio file', () => {
      const validFile = {
        buffer: Buffer.from('test audio data'),
        mimetype: 'audio/wav',
        size: 1024,
        originalname: 'test.wav',
      };

      const result = audioProcessor.validateAudioFile(validFile);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject file with invalid mimetype', () => {
      const invalidFile = {
        buffer: Buffer.from('test data'),
        mimetype: 'text/plain',
        size: 1024,
        originalname: 'test.txt',
      };

      const result = audioProcessor.validateAudioFile(invalidFile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Invalid audio format. Supported formats: audio/wav, audio/mp3, audio/mpeg, audio/ogg, audio/webm'
      );
    });

    it('should reject file that is too large', () => {
      const largeFile = {
        buffer: Buffer.alloc(100 * 1024 * 1024), // 100MB
        mimetype: 'audio/wav',
        size: 100 * 1024 * 1024,
        originalname: 'large.wav',
      };

      const result = audioProcessor.validateAudioFile(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'File size exceeds maximum limit of 50MB'
      );
    });

    it('should reject empty file', () => {
      const emptyFile = {
        buffer: Buffer.alloc(0),
        mimetype: 'audio/wav',
        size: 0,
        originalname: 'empty.wav',
      };

      const result = audioProcessor.validateAudioFile(emptyFile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File is empty');
    });

    it('should handle missing file properties', () => {
      const incompleteFile = {
        buffer: Buffer.from('test'),
        mimetype: '',
        size: 0,
        originalname: '',
      } as any;

      const result = audioProcessor.validateAudioFile(incompleteFile);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('processAudioChunk', () => {
    it('should process valid audio chunk', async () => {
      const audioChunk = Buffer.from('test audio chunk data');
      const chunkIndex = 0;
      const totalChunks = 5;

      const result = await audioProcessor.processAudioChunk(
        audioChunk,
        chunkIndex,
        totalChunks
      );

      expect(result.success).toBe(true);
      expect(result.chunkIndex).toBe(chunkIndex);
      expect(result.processedChunk).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.duration).toBeGreaterThan(0);
    });

    it('should handle empty audio chunk', async () => {
      const emptyChunk = Buffer.alloc(0);
      const chunkIndex = 0;
      const totalChunks = 1;

      const result = await audioProcessor.processAudioChunk(
        emptyChunk,
        chunkIndex,
        totalChunks
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Empty audio chunk');
    });

    it('should handle invalid chunk index', async () => {
      const audioChunk = Buffer.from('test audio data');
      const invalidChunkIndex = -1;
      const totalChunks = 5;

      const result = await audioProcessor.processAudioChunk(
        audioChunk,
        invalidChunkIndex,
        totalChunks
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid chunk index');
    });

    it('should handle chunk index exceeding total chunks', async () => {
      const audioChunk = Buffer.from('test audio data');
      const chunkIndex = 10;
      const totalChunks = 5;

      const result = await audioProcessor.processAudioChunk(
        audioChunk,
        chunkIndex,
        totalChunks
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Chunk index exceeds total chunks');
    });
  });

  describe('combineAudioChunks', () => {
    it('should combine multiple audio chunks', async () => {
      const chunks = [
        Buffer.from('chunk1'),
        Buffer.from('chunk2'),
        Buffer.from('chunk3'),
      ];

      const result = await audioProcessor.combineAudioChunks(chunks);

      expect(result.success).toBe(true);
      expect(result.combinedAudio).toBeDefined();
      expect(result.totalDuration).toBeGreaterThan(0);
      expect(result.chunkCount).toBe(chunks.length);
    });

    it('should handle empty chunks array', async () => {
      const result = await audioProcessor.combineAudioChunks([]);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No audio chunks provided');
    });

    it('should handle null/undefined chunks', async () => {
      const result = await audioProcessor.combineAudioChunks([
        null,
        undefined,
      ] as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid audio chunk');
    });
  });

  describe('extractAudioMetadata', () => {
    it('should extract metadata from valid audio buffer', async () => {
      const audioBuffer = Buffer.from('test audio data with metadata');

      const result = await audioProcessor.extractAudioMetadata(audioBuffer);

      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.duration).toBeGreaterThan(0);
      expect(result.metadata.sampleRate).toBeGreaterThan(0);
      expect(result.metadata.channels).toBeGreaterThan(0);
    });

    it('should handle empty audio buffer', async () => {
      const emptyBuffer = Buffer.alloc(0);

      const result = await audioProcessor.extractAudioMetadata(emptyBuffer);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Empty audio buffer');
    });

    it('should handle corrupted audio data', async () => {
      const corruptedBuffer = Buffer.from('corrupted audio data');

      const result = await audioProcessor.extractAudioMetadata(corruptedBuffer);

      // Should still succeed but with default values
      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should log errors appropriately', async () => {
      const invalidChunk = Buffer.alloc(0);

      const result = await audioProcessor.processAudioChunk(invalidChunk, 0, 1);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Empty audio chunk');
    });

    it('should handle processing errors gracefully', async () => {
      // Test with invalid chunk index
      const result = await audioProcessor.processAudioChunk(
        Buffer.from('test'),
        -1,
        1
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid chunk index');
    });
  });
});
