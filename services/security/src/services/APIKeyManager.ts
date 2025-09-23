import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import logger from '../utils/logger';

interface APIKey {
  id: string;
  name: string;
  key_hash: string;
  user_id: string;
  permissions: string[];
  expires_at?: Date;
  last_used_at?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CreateAPIKeyRequest {
  name?: string;
  permissions?: string[];
  expires_in_days?: number;
}

interface APIKeyResponse {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  expires_at?: Date;
  created_at: Date;
}

export class APIKeyManager {
  private supabase: any;

  constructor() {
    try {
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        this.supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        logger.info(
          'Supabase client initialized successfully in APIKeyManager'
        );
      } else {
        logger.warn(
          'Supabase not configured in APIKeyManager - running in local development mode'
        );
        this.supabase = null;
      }
    } catch (error) {
      logger.warn(
        'Failed to initialize Supabase client in APIKeyManager - running in local development mode',
        { error: error instanceof Error ? error.message : String(error) }
      );
      this.supabase = null;
    }
  }

  /**
   * Generate a secure API key
   */
  private generateAPIKey(): string {
    const prefix = 'qylon_';
    const randomBytes = crypto.randomBytes(32);
    const key = randomBytes.toString('hex');
    return `${prefix}${key}`;
  }

  /**
   * Hash an API key for secure storage
   */
  private hashAPIKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Create a new API key for a user
   */
  async createAPIKey(
    userId: string,
    request: CreateAPIKeyRequest
  ): Promise<APIKeyResponse> {
    try {
      const key = this.generateAPIKey();
      const keyHash = this.hashAPIKey(key);

      const expiresAt = request.expires_in_days
        ? new Date(Date.now() + request.expires_in_days * 24 * 60 * 60 * 1000)
        : null;

      const { data, error } = await this.supabase
        .from('api_keys')
        .insert({
          name: request.name || 'API Key',
          key_hash: keyHash,
          user_id: userId,
          permissions: request.permissions || [],
          expires_at: expiresAt?.toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create API key', {
          userId,
          error: error.message,
        });
        throw new Error('Failed to create API key');
      }

      logger.info('API key created successfully', {
        userId,
        keyId: data.id,
        name: request.name,
      });

      return {
        id: data.id,
        name: data.name,
        key: key, // Only returned once
        permissions: data.permissions,
        expires_at: data.expires_at ? new Date(data.expires_at) : undefined,
        created_at: new Date(data.created_at),
      };
    } catch (error) {
      logger.error('API key creation error', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Validate an API key and return user information
   */
  async validateAPIKey(key: string): Promise<{
    valid: boolean;
    userId?: string;
    permissions?: string[];
    error?: string;
  }> {
    try {
      const keyHash = this.hashAPIKey(key);

      const { data, error } = await this.supabase
        .from('api_keys')
        .select('*')
        .eq('key_hash', keyHash)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        logger.warn('Invalid API key provided', {
          error: error?.message,
        });
        return { valid: false, error: 'Invalid API key' };
      }

      // Check if key is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        logger.warn('Expired API key used', {
          keyId: data.id,
          userId: data.user_id,
        });
        return { valid: false, error: 'API key has expired' };
      }

      // Update last used timestamp
      await this.supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', data.id);

      logger.info('API key validated successfully', {
        keyId: data.id,
        userId: data.user_id,
      });

      return {
        valid: true,
        userId: data.user_id,
        permissions: data.permissions,
      };
    } catch (error) {
      logger.error('API key validation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { valid: false, error: 'Validation failed' };
    }
  }

  /**
   * List API keys for a user
   */
  async listAPIKeys(userId: string): Promise<Omit<APIKey, 'key_hash'>[]> {
    try {
      const { data, error } = await this.supabase
        .from('api_keys')
        .select(
          'id, name, user_id, permissions, expires_at, last_used_at, is_active, created_at, updated_at'
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to list API keys', {
          userId,
          error: error.message,
        });
        throw new Error('Failed to list API keys');
      }

      return data || [];
    } catch (error) {
      logger.error('API key listing error', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Revoke an API key
   */
  async revokeAPIKey(keyId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId)
        .eq('user_id', userId);

      if (error) {
        logger.error('Failed to revoke API key', {
          keyId,
          userId,
          error: error.message,
        });
        throw new Error('Failed to revoke API key');
      }

      logger.info('API key revoked successfully', {
        keyId,
        userId,
      });
    } catch (error) {
      logger.error('API key revocation error', {
        keyId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Rotate an API key (revoke old, create new)
   */
  async rotateAPIKey(
    keyId: string,
    userId: string,
    request: CreateAPIKeyRequest
  ): Promise<APIKeyResponse> {
    try {
      // Get the old key details
      const { data: oldKey, error: fetchError } = await this.supabase
        .from('api_keys')
        .select('*')
        .eq('id', keyId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !oldKey) {
        logger.error('Failed to find API key for rotation', {
          keyId,
          userId,
          error: fetchError?.message,
        });
        throw new Error('API key not found');
      }

      // Revoke the old key
      await this.revokeAPIKey(keyId, userId);

      // Create a new key with the same permissions
      const newKeyRequest: CreateAPIKeyRequest = {
        name: request.name || `${oldKey.name} (rotated)`,
        permissions: request.permissions || oldKey.permissions,
        expires_in_days: request.expires_in_days,
      };

      const newKey = await this.createAPIKey(userId, newKeyRequest);

      logger.info('API key rotated successfully', {
        oldKeyId: keyId,
        newKeyId: newKey.id,
        userId,
      });

      return newKey;
    } catch (error) {
      logger.error('API key rotation error', {
        keyId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Clean up expired API keys
   */
  async cleanupExpiredKeys(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('api_keys')
        .update({ is_active: false })
        .lt('expires_at', new Date().toISOString())
        .eq('is_active', true)
        .select('id');

      if (error) {
        logger.error('Failed to cleanup expired API keys', {
          error: error.message,
        });
        throw new Error('Failed to cleanup expired keys');
      }

      const cleanedCount = data?.length || 0;

      if (cleanedCount > 0) {
        logger.info('Expired API keys cleaned up', {
          count: cleanedCount,
        });
      }

      return cleanedCount;
    } catch (error) {
      logger.error('API key cleanup error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
