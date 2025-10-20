import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';

type ResetPasswordInputs = {
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInputs>();

  const onSubmit = async (data: ResetPasswordInputs) => {
    console.log('Reset Password Data:', data);
    await new Promise(resolve => setTimeout(resolve, 2000));
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
              <img
                src='/static/images/logo-full.png'
                alt='Qylon Logo'
                width={118}
                height={45}
                className='xui-img-100 xui-h-auto'
              />
            </a>
          </div>
          <h1 className='xui-font-w-600 text-[28px]'>Set A New Password</h1>
          <p className='xui-opacity-7 xui-font-sz-[14px]'>
            Your previous password has been reseted. Please set a new password for your account.
          </p>
          <form
            className='xui-form xui-max-w-500 xui-mx-auto xui-mt-1'
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* New Password */}
            <div className='xui-form-box' xui-error={errors.newPassword ? 'true' : 'false'}>
              {/* <label>New Password</label> */}
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
                <div className='xui-pos-relative xui-w-fluid-100'>
                  <input
                    {...register('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 6, message: 'At least 6 characters' },
                    })}
                    type={showPassword ? 'text' : 'password'}
                    id='new-password'
                    className='pr-10 w-full'
                    placeholder='Enter new password'
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
              </div>
              {errors.newPassword && <span className='message'>{errors.newPassword.message}</span>}
            </div>

            {/* Confirm Password */}
            <div className='xui-form-box' xui-error={errors.confirmPassword ? 'true' : 'false'}>
              {/* <label>Confirm Password</label> */}
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
                <div className='xui-pos-relative xui-w-fluid-100'>
                  <input
                    {...register('confirmPassword', {
                      required: 'Confirm your password',
                      validate: val => val === watch('newPassword') || 'Passwords do not match',
                    })}
                    type={showConfirm ? 'text' : 'password'}
                    id='confirm-password'
                    className='pr-10 w-full'
                    placeholder='Confirm your new password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirm(!showConfirm)}
                    className='xui-pos-absolute inset-y-0 right-0 xui-d-flex xui-flex-ai-center px-2 text-gray-600'
                  >
                    {showConfirm ? (
                      <FaEyeSlash className='h-5 w-5' />
                    ) : (
                      <FaEye className='h-5 w-5' />
                    )}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && (
                <span className='message'>{errors.confirmPassword.message}</span>
              )}
            </div>

            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full outline-none xui-mt-half py-2.5 xui-bdr-rad-half bg-[#266987] text-white flex items-center justify-center'
            >
              {isSubmitting ? <FaSpinner className='animate-spin h-6 w-6' /> : 'Reset Password'}
            </button>
          </form>
        </div>
        <div
          style={{
            backgroundImage: 'url("/static/images/reset-password-visual.png")',
          }}
          className='xui-d-none xui-md-d-block qylon-auth-visuals xui-bg-position-center-center xui-bg-size-cover xui-h-fluid-100 xui-bdr-rad-half'
        ></div>
        <div className='qylon-gradient-top-left'></div>
      </section>
    </>
  );
}
