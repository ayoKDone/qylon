import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export type LoginFormInputs = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: SupabaseUser | null;
};
export type SignUpFormInputs = {
  email: string;
  password: string;
  fullName?: string;
};

export interface SignUpResponse {
  user: BackendUser | null;
  session: Session | null;
  error?: string;
}
export type ForgotPasswordInputs = {
  email: string;
};
export interface BackendRegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
  };
  session: Session | null;
}
export interface BackendUser {
  id: string;
  email: string;
}
