import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaSpinner } from 'react-icons/fa';

type ForgotPasswordInputs = {
  code: string;
};

export default function Verification() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInputs>();
  const [canResend, setCanResend] = useState<boolean>(true);
  const [countDown, setCountDown] = useState<number>(30);

  const onSubmit = async (data: ForgotPasswordInputs) => {
    console.log('Forgot Password Data:', data);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  function handleResend() {
    if (!canResend) return; // prevent multiple clicks

    console.log('📨 Resending email...');
    setCanResend(false);
    setCountDown(30); // reset timer

    const interval = setInterval(() => {
      setCountDown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

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
          <h1 className='xui-font-w-600 text-[28px]'>Verify Code</h1>
          <p className='xui-opacity-7 xui-font-sz-[14px]'>
            An authentication code has been sent to your email.
          </p>
          <form
            className='xui-form xui-max-w-500 xui-mx-auto xui-mt-1'
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Verification Code */}
            <div className='xui-form-box' xui-error={errors.code ? 'true' : 'false'}>
              <input
                {...register('code', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email',
                  },
                })}
                type='text'
                id='email'
                placeholder='Enter your code here...'
              />
              {errors.code && <span className='message'>{errors.code.message}</span>}
            </div>

            {/* Submit */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full outline-none xui-mt-half py-2.5 xui-bdr-rad-half bg-[#266987] text-white flex items-center justify-center'
            >
              {isSubmitting ? <FaSpinner className='animate-spin h-6 w-6' /> : 'Verify'}
            </button>
          </form>

          <p className='text-sm text-gray-500 mt-4 text-center'>
            {!canResend ? (
              <>
                You can resend in <span className='text-[#266987] font-medium'>{countDown}s</span>
              </>
            ) : (
              <>
                Didn’t receive the email?{' '}
                <span
                  onClick={handleResend}
                  className='text-[#266987] underline font-medium xui-cursor-pointer'
                >
                  Click to resend
                </span>
              </>
            )}
          </p>
        </div>
        <div
          style={{
            backgroundImage: 'url("/static/images/verify-visual.png")',
          }}
          className='xui-d-none xui-md-d-block qylon-auth-visuals xui-bg-position-center-center xui-bg-size-cover xui-h-fluid-100 xui-bdr-rad-half'
        ></div>
        <div className='qylon-gradient-top-left'></div>
      </section>
    </>
  );
}
