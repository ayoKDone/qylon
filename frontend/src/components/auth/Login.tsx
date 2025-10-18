import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { LoginFormInputs } from '../../types/auth';
import { getErrorMessage } from '../../utils/handleError';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const { user, loading } = useSupabaseSession();
  const loading = false;
  const navigate = useNavigate();

  const checkOnboardingStatus = useCallback(async () => {
    try {
      const needsOnboarding = await authService.needsOnboarding();
      if (needsOnboarding) {
        navigate('/setup');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to onboarding if we can't determine status
      navigate('/setup');
    }
  }, [navigate]);

  // useEffect(() => {
  //   if (!loading && user) {
  //     // Check if user has completed onboarding
  //     checkOnboardingStatus();
  //   }
  // }, [user, loading, checkOnboardingStatus]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    setError(null);
    try {
      await authService.login(data);

      // Check onboarding status and redirect accordingly
      await checkOnboardingStatus();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <section className='xui-d-grid xui-grid-col-1 xui-md-grid-col-2 xui-grid-gap-half xui-flex-ai-center xui-w-fluid-100 h-[100dvh] h-[100vh] xui-h-fluid-100 p-[16px]'>
        <div className='xui-py-2 xui-md-py-4 xui-px-2 xui-md-px-4 xui-max-w-600 xui-w-fluid-100 xui-mx-auto lg:min-h-100'>
          {/* Back to Home Button */}
          <div className='xui-mb-2'>
            <a
              href='/'
              className='xui-d-inline-flex xui-flex-ai-center xui-grid-gap-half text-gray-600 hover:text-gray-800 transition-colors duration-200'
            >
              <img
                src='/static/images/logo-full.png'
                alt='Qylon Logo'
                width={118}
                height={45}
                className='xui-img-100 xui-h-auto'
              />
            </a>
          </div>
          <h1 className='xui-font-w-600 text-[28px]'>Log In</h1>
          <p className='xui-opacity-7 xui-font-sz-[14px]'>Let's pick up from where you left off</p>
          <form className='xui-form xui-mt-2' onSubmit={handleSubmit(onSubmit)}>
            {error && <div className='text-red-500 text-sm xui-my-1 text-center'>{error}</div>}
            {/* Email */}
            <div className='xui-form-box' xui-error={errors.email ? 'true' : 'false'}>
              {/* <label>Email</label> */}
              <div className='input-holder' xui-border={'false'}>
                <div className='left'>
                  <img
                    src='/static/images/icons/envelope.png'
                    alt='Key Icon'
                    width={16}
                    height={16}
                    className='w-[16px] xui-h-auto'
                  />
                </div>
                <input
                  {...register('email')}
                  type='email'
                  id='email'
                  placeholder='Enter your email'
                />
              </div>
              {errors.email && <span className='message'>{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className='xui-form-box' xui-error={errors.password ? 'true' : 'false'}>
              {/* <label>Password</label> */}
              <div className='input-holder' xui-border={'false'}>
                <div className='left'>
                  <img
                    src='/static/images/icons/key.png'
                    alt='Key Icon'
                    width={16}
                    height={16}
                    className='w-[16px] xui-h-auto'
                  />
                </div>
                <div className='relative xui-w-fluid-100'>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id='password'
                    className='pr-10 w-full'
                    placeholder='Enter your password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute inset-y-0 right-0 flex xui-flex-ai-center px-2 text-gray-600'
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {errors.password && <span className='message'>{errors.password.message}</span>}
            </div>

            {/* Remember + Forgot */}
            <div className='xui-d-flex xui-flex-ai-center xui-flex-jc-space-between xui-font-sz-small xui-my-1'>
              <div className='xui-d-inline-flex xui-font-sz-small xui-flex-ai-center'>
                {/* <div className='xui-d-inline-flex'>
                  <input className='xui-form-input' type='checkbox' />
                </div>
                <span className=''>Remember me</span> */}
              </div>
              <a href='/forgot-password' className='text-[#266987] xui-font-w-500 underline'>
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full outline-none xui-mt-half py-2.5 xui-bdr-rad-half bg-[#266987] text-white flex items-center justify-center'
            >
              {isSubmitting ? '⏳' : 'Log In'}
            </button>
          </form>
          {/* <Divider label='or' />
          <SocialLogin /> */}
          <p className='text-gray-500 xui-my-2 text-[15px]'>
            Don’t have an account?{' '}
            <a href='/signup' className='text-[#266987] font-medium xui-text-dc-underline'>
              Sign up
            </a>
          </p>
        </div>
        <div
          style={{
            backgroundImage: 'url("/static/images/side-right.png")',
          }}
          className='xui-d-none xui-md-d-block qylon-auth-visuals xui-bg-position-center-center xui-bg-size-cover xui-h-fluid-100 xui-bdr-rad-half'
        ></div>
        <div className='qylon-gradient-top-left'></div>
      </section>
    </>
  );
}
