// src/components/dashboard/layout/DashboardLayout.tsx
import { Outlet, useNavigate } from 'react-router-dom';
import { onboardingService } from '../../../services/onboardingService';

export default function SetUpLayout() {
  const navigate = useNavigate();

  const _handleSkipOnboarding = async () => {
    try {
      // Mark onboarding as complete to prevent future redirects
      await onboardingService.updateOnboardingProgress('complete', {
        completed_at: new Date().toISOString(),
        preferences: {
          notifications: true,
          email_updates: true,
          data_sharing: false,
        },
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      // Still navigate to dashboard even if there's an error
      navigate('/dashboard');
    }
  };

  return (
    <>
      <section className='xui-containermin-h-[100dvh] min-h-[100vh] xui-h-fluid-100 xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-py-1 xui-md-py-2'>
        <div className='xui-max-w-600 xui-w-fluid-100 xui-mx-auto'>
          <Outlet />
        </div>
      </section>
    </>
  );
}
