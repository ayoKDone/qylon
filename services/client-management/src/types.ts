import { User } from '@supabase/supabase-js';
import { Request } from 'express';

export interface ClientCreate {
  name: string;
  contact_email: string;
  industry?: string;
  company_size?: string;
  metadata?: Record<string, any>;
}

export interface InviteCreate {
  email: string;
  role: string;
}

export interface TeamMember {
  id?: string;
  client_id: string;
  user_id?: string;
  role: string;
  invited_by: string;
  status?: string;
  permissions?: any;
}

export interface Client {
  id?: string;
  name: string;
  contact_email: string;
  contact_phone?: string | null;
  user_id: string;
  industry: string;
  company_size: string;
  status?: string;
  settings?: any;
  primary_goals?: string[];
  budget?: string;
  timeline?: string;
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
export interface logUser {
  id: string;
  email: string;
}
