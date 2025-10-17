import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { SignUpFormInputs } from '../../types/auth';

export default function Signup() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormInputs>();

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async (data: SignUpFormInputs) => {
    setFormError(null);

    try {
      const response = await authService.signUp({
        email: data.email,
        password: data.password,
      });

      if (response.error) {
        setFormError(response.error);
        return;
      }

      // If session is null, user needs to confirm email
      if (!response.session) {
        navigate('/verify-email', { state: { email: data.email } });
        return;
      }
      // Redirect to onboarding after successful signup
      navigate('/setup');
    } catch (err: unknown) {
      setFormError('An unexpected error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <>
      <section className='xui-d-grid xui-grid-col-1 xui-md-grid-col-2 xui-grid-gap-half xui-flex-ai-center xui-w-fluid-100 h-[100dvh] h-[100vh] xui-h-fluid-100 p-[16px]'>
        <div style={{
          backgroundImage: 'url("/static/images/signup-visual.png")'
        }} className='xui-d-none xui-md-d-block qylon-auth-visuals xui-bg-position-center-center xui-bg-size-cover xui-h-fluid-100 xui-bdr-rad-half'></div>
        <div className='xui-py-2 xui-md-py-4 xui-px-2 xui-md-px-4 xui-max-w-600 xui-w-fluid-100 xui-mx-auto lg:min-h-100'>
          {/* Back to Home Button */}
          <div className='xui-mb-2'>
            <a
              href='/'
              className='xui-d-inline-flex xui-flex-ai-center xui-grid-gap-half text-gray-600 hover:text-gray-800 transition-colors duration-200'
            >
              <img src='/static/images/logo-full.png' alt='Qylon Logo' width={118} height={45} className='xui-img-100 xui-h-auto' />
            </a>
          </div>
          <h1 className='xui-font-w-600 text-[28px]'>Sign Up</h1>
          <p className='xui-opacity-7 xui-font-sz-[14px]'>
            Get started with Qylon and let's set your account.
          </p>
          <form
            className='xui-form xui-mt-2'
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Email */}
            <div className='xui-form-box' xui-error={errors.email ? 'true' : 'false'}>
              {/* <label>Work Email</label> */}
              <div className='input-holder' xui-border={'false'}>
                <div className='left'>
                  <img src='/static/images/icons/envelope.png' alt='Key Icon' width={16} height={16} className='w-[16px] xui-h-auto' />
                </div>
                <input
                  {...register('email')}
                  type='email'
                  placeholder='Enter your email'
                  id='email'
                />
              </div>
              {errors.email && <span className='message'>{errors.email.message}</span>}
            </div>
            {/* Password */}
            <div className='xui-form-box' xui-error={errors.password ? 'true' : 'false'}>
              {/* <label>Password</label> */}
              <div className='input-holder' xui-border={'false'}>
                <div className='left'>
                  <img src='/static/images/icons/key.png' alt='Key Icon' width={16} height={16} className='w-[16px] xui-h-auto' />
                </div>
                <div className='relative xui-w-fluid-100'>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter a strong password'
                    className='pr-10 w-full'
                    id='password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='xui-pos-absolute inset-y-0 right-0 xui-d-flex xui-flex-ai-center px-2 text-gray-600'
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              {errors.password && <span className='message'>{errors.password.message}</span>}
            </div>

            {/* Form error */}
            {formError && <p className='text-red-500 text-sm xui-my-1'>{formError}</p>}

            {/* Terms */}
            <div className='xui-d-flex xui-font-sz-small xui-flex-ai-center xui-grid-gap-half xui-my-1'>
              <input type='checkbox' required />
              <p>
                I agree to the{' '}
                <a href='#' className='text-[#266987] underline'>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href='#' className='text-[#266987] underline'>
                  Privacy Policy
                </a>
              </p>
            </div>

            {/* Submit */}
            <button
              type='submit'
              className='w-full outline:none xui-mt-half py-2.5 xui-bdr-rad-half bg-[#266987] text-white'
              disabled={isSubmitting}
            >
              {isSubmitting ? '⏳' : 'Sign Up'}
            </button>
          </form>
          {/* <Divider label='or' />
          <SocialLogin /> */}
          <p className='text-[15px] text-gray-500 xui-my-2'>
            Already have an account?{' '}
            <a href='/login' className='text-[#266987] font-medium'>
              <span className='xui-text-dc-underline'>Log in</span>
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
