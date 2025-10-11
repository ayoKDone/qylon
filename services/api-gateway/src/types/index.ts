import { NextFunction, Request, Response } from 'express';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  industry: string;
  companySize: string;
  role: UserRole;
  subscriptionPlanId?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MSP_ADMIN = 'msp_admin',
  CLIENT_USER = 'client_user',
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Request with user
export interface AuthenticatedRequest extends Request {
  user?: User;
  token?: string;
}

// Service endpoints
export interface ServiceEndpoint {
  name: string;
  url: string;
  port: number;
  healthCheck: string;
  routes: string[];
}

// Rate limit configuration
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

// Error response
export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown' | 'disabled';
  responseTime?: number;
  lastCheck: string;
  error?: string;
  details?: string;
}

// Proxy configuration
export interface ProxyConfig {
  target: string;
  changeOrigin: boolean;
  pathRewrite?: { [key: string]: string };
  onError?: (err: Error, req: Request, res: Response) => void;
  onProxyReq?: (proxyReq: any, req: Request, res: Response) => void;
  onProxyRes?: (proxyRes: any, req: Request, res: Response) => void;
}

// Log entry
export interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: string;
  service: string;
  requestId?: string;
  userId?: string;
  metadata?: any;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

// Middleware types
export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

export type AuthMiddlewareFunction = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

// Service discovery
export interface ServiceRegistry {
  [key: string]: ServiceEndpoint;
}

// Environment configuration
export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  CORS_ORIGIN: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  REDIS_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  LOG_LEVEL: string;
  DEBUG: boolean;
}
