import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

type ResetPasswordInputs = {
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('access_token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInputs>();

  useEffect(() => {
    if (!token) {
      navigate('/forgot-password', { replace: true });
    }
  }, [token, navigate]);

  const onSubmit = async (data: ResetPasswordInputs) => {
    if (!token) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      console.error(err);
      setMessage('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="xui-py-[20px] xui xui-container xui-d-flex xui-flex-ai-center xui-flex-jc-space-between">
        <img
          src="/static/images/logo-full.png"
          alt="Qylon Logo"
          width={118}
          height={45}
        />
        <p className="text-sm text-gray-500">
          Don’t have an account?{' '}
          <a
            href="/signup"
            className="text-purple-600 font-medium xui-text-dc-underline"
          >
            Create one
          </a>
        </p>
      </nav>
      <div className="flex-1 xui-flex-ai-center xui-flex-jc-center xui-py-2 xui-md-py-4">
        <form
          className="xui-form xui-max-w-500 xui-mx-auto"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="xui-font-sz-x-large font-bold mb-2">
            Set a new password
          </h2>
          <p className="xui-font-sz-small text-gray-500 mb-6">
            Choose a strong password for your account
          </p>

          {message && (
            <p className="mb-4 text-center text-red-500">{message}</p>
          )}

          {/* New Password */}
          <div
            className="xui-form-box"
            xui-error={errors.newPassword ? 'true' : 'false'}
          >
            <label>New Password</label>
            <div className="xui-pos-relative">
              <input
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'At least 6 characters' },
                })}
                type={showPassword ? 'text' : 'password'}
                id="new-password"
                className="pr-10 w-full"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="xui-pos-absolute inset-y-0 right-0 xui-d-flex xui-flex-ai-center px-2 text-gray-600"
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5" />
                ) : (
                  <FaEye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <span className="message">{errors.newPassword.message}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div
            className="xui-form-box"
            xui-error={errors.confirmPassword ? 'true' : 'false'}
          >
            <label>Confirm Password</label>
            <div className="xui-pos-relative">
              <input
                {...register('confirmPassword', {
                  required: 'Confirm your password',
                  validate: val =>
                    val === watch('newPassword') || 'Passwords do not match',
                })}
                type={showConfirm ? 'text' : 'password'}
                id="confirm-password"
                className="pr-10 w-full"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="xui-pos-absolute inset-y-0 right-0 xui-d-flex xui-flex-ai-center px-2 text-gray-600"
              >
                {showConfirm ? (
                  <FaEyeSlash className="h-5 w-5" />
                ) : (
                  <FaEye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="message">{errors.confirmPassword.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading || !token}
            className="w-full outline-none xui-mt-half py-2.5 xui-bdr-rad-half bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center"
          >
            {isSubmitting || loading ? (
              <FaSpinner className="animate-spin h-6 w-6" />
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </>
  );
}
