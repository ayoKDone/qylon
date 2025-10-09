import { supabase } from '../lib/supabase';

export interface OnboardingData {
  full_name?: string;
  company_name?: string;
  industry?: string;
  company_size?: string;
  role?: string;
  timezone?: string;
  preferences?: {
    notifications?: boolean;
    email_updates?: boolean;
    data_sharing?: boolean;
  };
}

export interface OnboardingStep {
  id: string;
  name: string;
  completed: boolean;
  data?: any;
}

export interface OnboardingProgress {
  current_step: string;
  completed_steps: string[];
  total_steps: number;
  is_complete: boolean;
}

export const onboardingService = {
  // Get user's onboarding progress
  async getOnboardingProgress(): Promise<OnboardingProgress> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user has completed onboarding
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(error.message);
      }

      if (!data) {
        // User hasn't started onboarding
        return {
          current_step: 'welcome',
          completed_steps: [],
          total_steps: 5,
          is_complete: false
        };
      }

      return {
        current_step: data.current_step || 'welcome',
        completed_steps: data.completed_steps || [],
        total_steps: 5,
        is_complete: data.is_complete || false
      };
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      throw error;
    }
  },

  // Update onboarding progress
  async updateOnboardingProgress(step: string, data?: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get current progress
      const { data: currentProgress } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const completedSteps = currentProgress?.completed_steps || [];
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
      }

      const isComplete = completedSteps.length >= 5; // Total steps

      const progressData = {
        user_id: user.id,
        current_step: step,
        completed_steps: completedSteps,
        is_complete: isComplete,
        updated_at: new Date().toISOString()
      };

      if (currentProgress) {
        // Update existing record
        const { error } = await supabase
          .from('user_onboarding')
          .update(progressData)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('user_onboarding')
          .insert(progressData);

        if (error) throw error;
      }

      // If onboarding is complete, update user profile
      if (isComplete && data) {
        await this.completeOnboarding(data);
      }
    } catch (error) {
      console.error('Error updating onboarding progress:', error);
      throw error;
    }
  },

  // Complete onboarding and update user profile
  async completeOnboarding(onboardingData: OnboardingData): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update user profile in the users table
      const { error: profileError } = await supabase
        .from('users')
        .update({
          full_name: onboardingData.full_name,
          company_name: onboardingData.company_name,
          industry: onboardingData.industry,
          company_size: onboardingData.company_size,
          role: onboardingData.role,
          timezone: onboardingData.timezone,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Mark onboarding as complete
      const { error: onboardingError } = await supabase
        .from('user_onboarding')
        .update({
          is_complete: true,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (onboardingError) throw onboardingError;

      // Trigger backend onboarding completion
      await this.triggerBackendOnboarding(onboardingData);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  },

  // Trigger backend onboarding completion
  async triggerBackendOnboarding(onboardingData: OnboardingData): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      // Call the backend API to complete onboarding
      const response = await fetch('/api/v1/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          onboarding_data: onboardingData,
          user_id: session.user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete onboarding');
      }

      const result = await response.json();
      console.log('Backend onboarding completed:', result);
    } catch (error) {
      console.error('Error triggering backend onboarding:', error);
      // Don't throw here - frontend onboarding is complete even if backend fails
      // The backend can retry or handle this separately
    }
  },

  // Check if user should be redirected to onboarding
  async shouldRedirectToOnboarding(): Promise<boolean> {
    try {
      const progress = await this.getOnboardingProgress();
      return !progress.is_complete;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return true; // Default to showing onboarding if we can't determine status
    }
  },

  // Get onboarding steps
  getOnboardingSteps(): OnboardingStep[] {
    return [
      { id: 'welcome', name: 'Welcome', completed: false },
      { id: 'profile', name: 'Profile Setup', completed: false },
      { id: 'add-calendar', name: 'Calendar Integration', completed: false },
      { id: 'integrations', name: 'Additional Integrations', completed: false },
      { id: 'demo', name: 'Demo Setup', completed: false }
    ];
  }
};

export default onboardingService;
