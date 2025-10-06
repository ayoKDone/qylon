import { Request } from 'express';

export interface User {
  id: string;
  email: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User | null;
}

export interface RegisterResponse {
  message: string;
  user: User | null;
}
export interface AuthRequest extends Request {
  user?: {
    id?: string;
    email?: string;
    [key: string]: any;
  };
}
