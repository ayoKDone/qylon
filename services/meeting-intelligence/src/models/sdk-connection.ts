/**
 * SDK Connection Model
 *
 * This model represents a connection between the Qylon SDK and the Meeting Intelligence Service.
 * It manages the lifecycle of SDK connections, including authentication, audio capture,
 * and real-time communication.
 */

export interface AudioQuality {
  sample_rate: number;
  bit_depth: number;
  channels: number;
  format: 'wav' | 'mp3' | 'flac' | 'aac';
  noise_reduction_enabled: boolean;
  echo_cancellation_enabled: boolean;
  auto_gain_control_enabled: boolean;
}

export interface ConnectionMetadata {
  sdk_version: string;
  platform: 'windows' | 'macos' | 'linux' | 'android' | 'ios';
  device_info?: {
    manufacturer?: string;
    model?: string;
    os_version?: string;
  };
  network_info?: {
    connection_type?: 'wifi' | 'ethernet' | 'cellular';
    bandwidth?: number;
  };
}

export enum SDKPlatform {
  RECALL_AI = 'recall_ai',
  ZOOM = 'zoom',
  TEAMS = 'teams',
  GOOGLE_MEET = 'google_meet',
}

export enum SDKConnectionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  PENDING = 'pending',
}

export class SDKConnection {
  public id: string;
  public userId: string;
  public platform: SDKPlatform;
  public apiKey: string;
  public status: SDKConnectionStatus;
  public metadata: Record<string, any>;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    data: Partial<SDKConnection> & {
      userId: string;
      platform: SDKPlatform;
      apiKey: string;
    }
  ) {
    // Validate required fields
    if (!data.userId) {
      throw new Error('User ID is required');
    }
    if (!data.platform || !Object.values(SDKPlatform).includes(data.platform)) {
      throw new Error('Invalid platform');
    }
    if (!data.apiKey) {
      throw new Error('API key is required');
    }
    if (data.status && !Object.values(SDKConnectionStatus).includes(data.status)) {
      throw new Error('Invalid status');
    }
    if (data.metadata && typeof data.metadata !== 'object') {
      throw new Error('Metadata must be an object');
    }

    this.id = data.id || this.generateUUID();
    this.userId = data.userId;
    this.platform = data.platform;
    this.apiKey = data.apiKey;
    this.status = data.status || SDKConnectionStatus.INACTIVE;
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public updateStatus(newStatus: SDKConnectionStatus): void {
    if (!Object.values(SDKConnectionStatus).includes(newStatus)) {
      throw new Error('Invalid status');
    }
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  public updateMetadata(newMetadata: Record<string, any>): void {
    if (typeof newMetadata !== 'object') {
      throw new Error('Metadata must be an object');
    }
    this.metadata = newMetadata;
    this.updatedAt = new Date();
  }

  public isActive(): boolean {
    return this.status === SDKConnectionStatus.ACTIVE;
  }

  public toJSON(excludeSensitive = false): any {
    return {
      id: this.id,
      userId: this.userId,
      platform: this.platform,
      apiKey: excludeSensitive ? '***' : this.apiKey,
      status: this.status,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  public static fromJSON(json: any): SDKConnection {
    return new SDKConnection({
      id: json.id,
      userId: json.userId,
      platform: json.platform,
      apiKey: json.apiKey,
      status: json.status,
      metadata: json.metadata,
      createdAt: json.createdAt ? new Date(json.createdAt) : undefined,
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : undefined,
    });
  }
}

export interface CreateConnectionRequest {
  user_id: string;
  client_id: string;
  audio_quality: AudioQuality;
  connection_metadata: ConnectionMetadata;
}

export interface ConnectionResponse {
  connection_id: string;
  connection_token: string;
  status: string;
  expires_at: Date;
  audio_quality: AudioQuality;
}

export interface AuthenticateConnectionRequest {
  connection_token: string;
}

export interface AuthenticateConnectionResponse {
  id: string;
  status: string;
  user_id: string;
  client_id: string;
  expires_at: Date;
}
