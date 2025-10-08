import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSupabaseSession } from '../../hooks/useSupabaseSession';
import { authService } from '../../services/authService';
import type { LoginFormInputs } from '../../types/auth';
import { getErrorMessage } from '../../utils/handleError';
import { Divider } from '../UI/Divider';
import { SocialLogin } from '../UI/SocialLogin';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading } = useSupabaseSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    setError(null);
    try {
      await authService.login(data);

      // Redirect after login
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <section className="xui-d-grid xui-grid-col-1 xui-md-grid-col-2 xui-grid-gap-half xui-flex-ai-center xui-w-fluid-100 xui-min-h-[100dvh] xui-min-h-[100vh] xui-h-fluid-100 xui-p-[16px]">
        <div className="xui-h-fluid-100 bg-gradient-to-r from-purple-500 to-indigo-500 xui-bdr-rad-[16px]"></div>
        <div className="xui-py-2 xui-md-py-4 xui-px-2 xui-md-px-4">
          <h1 className="xui-font-sz-[28px] xui-md-font-sz-[28px]">Log In</h1>
          <p className="xui-opacity-7 xui-font-sz-[14px]">
            Let's pick up from where you left off
          </p>
          <form
            className="xui-form xui-max-w-500 xui-mx-auto xui-mt-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            {error && (
              <div className="text-red-500 text-sm xui-my-1 text-center">
                {error}
              </div>
            )}
            {/* Email */}
            <div
              className="xui-form-box"
              xui-error={errors.email ? 'true' : 'false'}
            >
              <label>Email</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email',
                  },
                })}
                type="email"
                id="email"
                placeholder="olivia@untitledui.com"
              />
              {errors.email && (
                <span className="message">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div
              className="xui-form-box"
              xui-error={errors.password ? 'true' : 'false'}
            >
              <label>Password</label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="pr-10 w-full"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex xui-flex-ai-center px-2 text-gray-600"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="message">{errors.password.message}</span>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="xui-d-flex xui-flex-ai-center xui-flex-jc-space-between xui-font-sz-small xui-my-1">
              <div className="xui-d-inline-flex xui-font-sz-small xui-flex-ai-center">
                <div className="xui-d-inline-flex">
                  <input className="xui-form-input" type="checkbox" />
                </div>
                <span className="">Remember me</span>
              </div>
              <a href="/forgot-password" className="text-purple-600 underline">
                Forgot password?
              </a>
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
                'Sign In'
              )}
            </button>
          </form>
          <Divider label="or" />
          <SocialLogin />
          <p className="text-sm text-gray-500 xui-my-2">
            Don’t have an account?{' '}
            <a
              href="/signup"
              className="text-purple-600 font-medium xui-text-dc-underline"
            >
              Create one
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
