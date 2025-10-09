import type { Session, User as SupabaseUser } from '@supabase/auth-js';

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

export type SignUpResponse = {
  user: SupabaseUser | null;
  session: Session | null;
  error?: string;
};
export type ForgotPasswordInputs = {
  email: string;
};
