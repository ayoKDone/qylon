import { supabase } from '../lib/supabase';
import type {
  LoginFormInputs,
  LoginResponse,
  SignUpFormInputs,
  SignUpResponse,
} from '../types/auth';

export const authService = {
  async login(data: LoginFormInputs): Promise<LoginResponse> {
    const { data: sessionData, error } = await supabase.auth.signInWithPassword(
      {
        email: data.email,
        password: data.password,
      },
    );

    if (error) {
      throw new Error(error.message);
    }

    // sessionData.session contains access_token, refresh_token, user info
    const loginResponse: LoginResponse = {
      message: 'Login successful',
      token: sessionData.session?.access_token ?? '',
      user: sessionData.user,
    };

    return loginResponse;
  },
  // Sign up with Supabase
  async signUp(data: SignUpFormInputs): Promise<SignUpResponse> {
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) return { user: null, session: null, error: error.message };

    return {
      user: signUpData.user,
      session: signUpData.session,
    };
  },

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  },
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Error signing out:', error);
  else {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }
};
