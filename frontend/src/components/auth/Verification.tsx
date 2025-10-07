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
      <nav className="xui-py-[20px] xui xui-container xui-d-flex xui-flex-ai-center xui-flex-jc-space-between">
        <img
          src="/static/images/logo-full.png"
          alt="Qylon Logo"
          className="xui-img-100"
          width={118}
          height={45}
        />
        <p className="text-sm text-gray-500">
          Wrong email?{' '}
          <a
            href="/forgot-password"
            className="text-purple-600 font-medium xui-text-dc-underline"
          >
            Click here
          </a>
        </p>
      </nav>
      <div className="flex-1 xui-flex-ai-center xui-flex-jc-center xui-py-2 xui-md-py-4">
        <form
          className="xui-form xui-max-w-500 xui-mx-auto"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="xui-font-sz-x-large font-bold mb-2">
            Enter your code
          </h2>
          <p className="xui-font-sz-small text-gray-500 mb-6">
            Enter the code that was sent to you to{' '}
            <span className="xui-font-w-700 xui-text-dc-underline">
              gigirichardofficial@gmail.com
            </span>
          </p>

          {/* Verification Code */}
          <div
            className="xui-form-box"
            xui-error={errors.code ? 'true' : 'false'}
          >
            <input
              {...register('code', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email',
                },
              })}
              type="text"
              id="email"
              placeholder="Enter your code here..."
            />
            {errors.code && (
              <span className="message">{errors.code.message}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full outline-none xui-mt-half py-2.5 xui-bdr-rad-half bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center"
          >
            {isSubmitting ? (
              <FaSpinner className="animate-spin h-6 w-6" />
            ) : (
              'Continue'
            )}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          {!canResend ? (
            <>
              You can resend in{' '}
              <span className="text-purple-600 font-medium">{countDown}s</span>
            </>
          ) : (
            <>
              Didn’t receive the email?{' '}
              <span
                onClick={handleResend}
                className="text-purple-600 font-medium xui-cursor-pointer"
              >
                Click to resend
              </span>
            </>
          )}
        </p>
      </div>
    </>
  );
}
