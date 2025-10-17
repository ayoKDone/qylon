import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaSpinner } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import type { ForgotPasswordInputs } from '../../types/auth';
export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInputs>();

  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (data: ForgotPasswordInputs) => {
    setMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('Check your email for password reset instructions.');
      }
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
      console.error(err);
    }
  };

  return (
    <>
    <section className='xui-d-grid xui-grid-col-1 xui-md-grid-col-2 xui-grid-gap-half xui-flex-ai-center xui-w-fluid-100 h-[100dvh] h-[100vh] xui-h-fluid-100 p-[16px]'>
      <div className='xui-py-2 xui-md-py-4 xui-px-2 xui-md-px-4 xui-max-w-600 xui-w-fluid-100 xui-mx-auto lg:min-h-100'>
        <div className='xui-mb-2'>
          <a
            href='/'
            className='xui-d-inline-flex xui-flex-ai-center xui-grid-gap-half text-gray-600 hover:text-gray-800 transition-colors duration-200'
          >
            <img src='/static/images/logo-full.png' alt='Qylon Logo' width={118} height={45} className='xui-img-100 xui-h-auto' />
          </a>
        </div>
        <h1 className='xui-font-w-600 text-[28px]'>Forgot Password?</h1>
        <p className='xui-opacity-7 xui-font-sz-[14px]'>Enter your email address and we’ll send a code</p>
        <form className='xui-form xui-max-w-500 xui-mx-auto xui-mt-1' onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <div className='xui-form-box' xui-error={errors.email ? 'true' : 'false'}>
            {/* <label>Email</label> */}
            <div className='input-holder' xui-border={'false'}>
              <div className='left'>
                <img src='/static/images/icons/envelope.png' alt='Key Icon' width={16} height={16} className='w-[16px] xui-h-auto' />
              </div>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email',
                  },
                })}
                type='email'
                id='email'
                placeholder='example@gmail.com'
              />
            </div>
            {errors.email && <span className='message'>{errors.email.message}</span>}
          </div>

          {/* Message */}
          {message && <p className='text-sm text-center text-gray-700 mt-2'>{message}</p>}

          {/* Submit */}
          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full outline-none xui-mt-half py-2.5 xui-bdr-rad-half bg-[#266987] text-white flex items-center justify-center'
          >
            {isSubmitting ? <FaSpinner className='animate-spin h-6 w-6' /> : 'Send Reset Link'}
          </button>
        </form>

        <p className='text-[15px] text-gray-500 mt-4 text-center'>
          Remember your password?{' '}
          <a href='/login' className='text-[#266987] underline font-medium'>
            Sign in
          </a>
        </p>
      </div>
      <div style={{
        backgroundImage: 'url("/static/images/forgot-password-visual.png")'
      }} className='xui-d-none xui-md-d-block qylon-auth-visuals xui-bg-position-center-center xui-bg-size-cover xui-h-fluid-100 xui-bdr-rad-half'></div>
      <div className='qylon-gradient-top-left'></div>
    </section>
    </>
  );
}
