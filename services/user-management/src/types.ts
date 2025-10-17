import { User } from '@supabase/supabase-js';
import { Request } from 'express';

export interface Users {
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
  user: Users | null;
}

export interface RegisterResponse {
  message: string;
  user: Users | null;
}
export interface AuthRequest extends Request {
  user?: {
    id?: string;
    email?: string;
    [key: string]: any;
  };
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user: User;
  dbUser: {
    id: string;
    email: string;
    full_name: string;
    phone_number?: string;
  };
}
