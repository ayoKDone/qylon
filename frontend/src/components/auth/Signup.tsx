// src/pages/Signup.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { Divider } from '../UI/Divider';
import { SocialLogin } from '../UI/SocialLogin';

type SignupFormInputs = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormInputs>();

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: SignupFormInputs) => {
    console.log('Form Data:', data);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  return (
    <>
      <section className='xui-d-grid xui-grid-col-1 xui-md-grid-col-2 xui-grid-gap-half xui-flex-ai-center xui-w-fluid-100 xui-min-h-[100dvh] xui-min-h-[100vh] xui-h-fluid-100 xui-p-[16px]'>
        <div className='xui-h-fluid-100 bg-gradient-to-r from-purple-500 to-indigo-500 xui-bdr-rad-[16px]'></div>
        <div className='xui-py-2 xui-md-py-4 xui-px-2 xui-md-px-4'>
          <h1 className='xui-font-sz-[28px] xui-md-font-sz-[28px]'>Sign Up</h1>
          <p className='xui-opacity-7 xui-font-sz-[14px]'>
            Get started with Qylon and let's set your account.
          </p>
          <form
            className='xui-form xui-max-w-500 xui-mx-auto xui-mt-2'
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Email */}
            <div className='xui-form-box' xui-error={errors.email ? 'true' : 'false'}>
              <label>Work Email</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email',
                  },
                })}
                type='email'
                placeholder='olivia@untitledui.com'
                id='email'
              />
              {errors.email && <span className='message'>{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className='xui-form-box' xui-error={errors.password ? 'true' : 'false'}>
              <label>Password</label>
              <div className='xui-pos-relative'>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Create a strong password'
                  className='pr-10 w-full'
                  id='password'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='xui-pos-absolute inset-y-0 right-0 xui-d-flex xui-flex-ai-center px-2 text-gray-600'
                >
                  {showPassword ? (
                    <FaEyeSlash className='h-5 w-5' />
                  ) : (
                    <FaEye className='h-5 w-5' />
                  )}
                </button>
              </div>
              {errors.password && <span className='message'>{errors.password.message}</span>}
            </div>

            {/* Terms */}
            <div className='xui-d-flex xui-font-sz-small xui-flex-ai-center xui-grid-gap-half xui-my-1'>
              <input type='checkbox' required />
              <p>
                I agree to the{' '}
                <a href='#' className='text-purple-600 underline'>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href='#' className='text-purple-600 underline'>
                  Privacy Policy
                </a>
              </p>
            </div>

            {/* Submit */}
            <button
              type='submit'
              className='w-full outline:none xui-mt-half py-2.5 xui-bdr-rad-half bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
              disabled={isSubmitting}
            >
              {isSubmitting ? <FaSpinner className='animate-spin h-6 w-6' /> : 'Create Account'}
            </button>
          </form>
          <Divider label='or' />
          <SocialLogin />
          <p className='text-sm text-gray-500 xui-my-2'>
            Already have an account?{' '}
            <a href='/login' className='text-purple-600 font-medium'>
              <span className='xui-text-dc-underline'>Sign in</span>
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
