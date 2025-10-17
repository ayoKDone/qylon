// src/components/dashboard/layout/DashboardLayout.tsx
import { Outlet, useNavigate } from 'react-router-dom';
import { onboardingService } from '../../../services/onboardingService';
import logoImage from '../../assets/images/qylon-logo.png';

export default function SetUpLayout() {
  const navigate = useNavigate();

  const handleSkipOnboarding = async () => {
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
      <nav className='xui-py-[20px] xui xui-container xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'>
        <img
          src={logoImage}
          alt='Qylon Logo'
          className='xui-img-100'
          width={118}
          height={45}
        />
        <p className='text-sm text-gray-500'>
          <button
            onClick={handleSkipOnboarding}
            className='text-purple-600 font-medium xui-text-dc-underline bg-transparent border-none cursor-pointer hover:text-purple-800'
          >
            Skip this for later
          </button>
        </p>
      </nav>
      <hr />
      <section className='xui-container xui-py-1 xui-md-py-1'>
        <Outlet />
      </section>
    </>
  );
}
