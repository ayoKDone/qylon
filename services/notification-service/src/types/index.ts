export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface NotificationRequest {
  channel: 'email' | 'sms' | 'push' | 'webhook';
  recipient: string;
  subject?: string;
  message: string;
  template?: string;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  id: string;
  status: 'sent' | 'failed' | 'pending';
  channel: string;
  recipient: string;
  timestamp: string;
  error?: string;
}

export interface HealthData {
  service: string;
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  environment: string;
  channels: {
    email: string;
    sms: string;
    push: string;
    webhook: string;
  };
}
