import { supabase } from '../lib/supabase';
import type {
  BackendRegisterResponse,
  LoginFormInputs,
  LoginResponse,
  SignUpFormInputs,
  SignUpResponse,
} from '../types/auth';
import { ApiError, apiService } from './api';

export const authService = {
  async login(data: LoginFormInputs): Promise<LoginResponse> {
    const { data: sessionData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.error('Login error:', error.message);

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

  async signUp(data: SignUpFormInputs): Promise<SignUpResponse> {
    try {
      const response = await apiService.post<BackendRegisterResponse>(3000, '/auth/register', {
        email: data.email,
        password: data.password,
      });

      // 🟢 If backend includes session, attach it to Supabase
      if (response.session?.access_token && response.session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: response.session.access_token,
          refresh_token: response.session.refresh_token,
        });
      }

      return {
        user: response.user,
        session: response.session || null,
        error: undefined,
      };
    } catch (error: unknown) {
      console.error('Signup failed:', error);

      let errorMessage = 'Signup failed. Please try again later.';

      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        user: null,
        session: null,
        error: errorMessage,
      };
    }
  },
  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  },

  // Check if user needs onboarding
  async needsOnboarding(): Promise<boolean> {
    // TODO: Implement onboarding service
    return false; // Default to not needing onboarding
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
