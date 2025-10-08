import { useForm } from 'react-hook-form';
import { FaSpinner } from 'react-icons/fa';

type ForgotPasswordInputs = {
  email: string;
};

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInputs>();

  const onSubmit = async (data: ForgotPasswordInputs) => {
    console.log('Forgot Password Data:', data);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  return (
    <>
      <nav className='xui-py-[20px] xui xui-container xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'>
        <img
          src='/static/images/logo-full.png'
          alt='Qylon Logo'
          className='xui-img-100'
          width={118}
          height={45}
        />
        <p className='text-sm text-gray-500'>
          Don’t have an account?{' '}
          <a href='/signup' className='text-purple-600 font-medium xui-text-dc-underline'>
            Create one
          </a>
        </p>
      </nav>
      <div className='flex-1 xui-flex-ai-center xui-flex-jc-center xui-py-2 xui-md-py-4'>
        <form className='xui-form xui-max-w-500 xui-mx-auto' onSubmit={handleSubmit(onSubmit)}>
          <h2 className='xui-font-sz-x-large font-bold mb-2'>Forgot password?</h2>
          <p className='xui-font-sz-small text-gray-500 mb-6'>
            Enter your email and we’ll send you a reset link
          </p>

          {/* Email */}
          <div className='xui-form-box' xui-error={errors.email ? 'true' : 'false'}>
            <label>Email</label>
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
              placeholder='olivia@untitledui.com'
            />
            {errors.email && <span className='message'>{errors.email.message}</span>}
          </div>

          {/* Submit */}
          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full outline-none xui-mt-half py-2.5 xui-bdr-rad-half bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center'
          >
            {isSubmitting ? <FaSpinner className='animate-spin h-6 w-6' /> : 'Send Reset Link'}
          </button>
        </form>

        <p className='text-sm text-gray-500 mt-4 text-center'>
          Remember your password?{' '}
          <a href='/login' className='text-purple-600 font-medium'>
            Sign in
          </a>
        </p>
      </div>
    </>
  );
}
