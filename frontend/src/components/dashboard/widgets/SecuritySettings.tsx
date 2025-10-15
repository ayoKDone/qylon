'use client';
import { FileText, Globe, Smartphone, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaShieldAlt, FaSpinner } from 'react-icons/fa';

interface Session {
  device: string;
  location: string;
  lastActive: string;
}

interface SecurityEvent {
  time: string;
  event: string;
  status: string;
}

interface PasswordFormInputs {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SecuritySettings() {
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([
    {
      device: 'Windows PC - Chrome',
      location: 'Port Harcourt, Nigeria',
      lastActive: '2 hours ago',
    },
    {
      device: 'iPhone 13 - Safari',
      location: 'Lagos, Nigeria',
      lastActive: 'Yesterday',
    },
    {
      device: 'MacBook Air - Safari',
      location: 'London, UK',
      lastActive: '3 days ago',
    },
  ]);

  const [securityLogs] = useState<SecurityEvent[]>([
    { time: '2025-10-06 09:15', event: 'Successful login', status: 'OK' },
    { time: '2025-10-05 18:44', event: 'Password changed', status: 'OK' },
    {
      time: '2025-10-03 14:23',
      event: 'Failed login attempt',
      status: 'Blocked',
    },
  ]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormInputs>();

  const handlePasswordInput = (value: string) => {
    const strength = Math.min(value.length / 2, 5);
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    if (passwordStrength >= 4) return 'bg-green-500';
    return 'bg-gray-300';
  };

  const onSubmitPassword = async (data: PasswordFormInputs) => {
    console.log('Password Change Data:', data);
    await new Promise(r => setTimeout(r, 2000));
    alert('Password successfully changed!');
  };

  const toggleTwoFactorAuth = () => setTwoFactorAuth(prev => !prev);

  const handleRevokeSession = (device: string) => {
    setSessions(prev => prev.filter(s => s.device !== device));
    alert(`Access revoked for ${device}`);
  };

  const handleExportData = () => alert('Your data export request has been submitted.');
  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action is irreversible.')) {
      alert('Account deletion request submitted.');
    }
  };

  return (
    <div className='space-y-8'>
      <div>
        <p className='text-gray-600'>
          Manage your account security, sessions, and privacy preferences.
        </p>
      </div>

      {/* 🔐 Password Section */}
      <div className='p-6 border border-gray-200 rounded-lg space-y-4'>
        <div className='flex items-center gap-3'>
          <div className="xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center xui-w-40 xui-h-40 xui-bdr-rad-half xui-bg-light-blue-1">
              <FaShieldAlt size={20} />
          </div>
          <div>
            <h3 className='text-md font-semibold text-gray-900'>Password & Authentication</h3>
            <p className='text-sm text-gray-500'>Change your password regularly to keep your account secure.</p>
          </div>
        </div>


        <form onSubmit={handleSubmit(onSubmitPassword)} className='xui-form space-y-4'>
          {/* Current Password */}
          <div className='xui-form-box' xui-error={errors.currentPassword ? 'true' : 'false'}>
            <label>Current Password</label>
            <input
              {...register('currentPassword', {
                required: 'Current password is required',
              })}
              type='password'
              placeholder='Enter current password'
            />
            {errors.currentPassword && (
              <span className='message'>{errors.currentPassword.message}</span>
            )}
          </div>

          {/* New Password */}
          <div className='xui-form-box' xui-error={errors.newPassword ? 'true' : 'false'}>
            <label>New Password</label>
            <input
              {...register('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              type='password'
              placeholder='Enter new password'
              onChange={e => handlePasswordInput(e.target.value)}
            />
            <div className='w-full mt-1 bg-gray-200 rounded-full h-2'>
              <div
                className={`h-2 rounded-full transition-all ${getStrengthColor()}`}
                style={{ width: `${(passwordStrength / 5) * 100}%` }}
              ></div>
            </div>
            {errors.newPassword && <span className='message'>{errors.newPassword.message}</span>}
          </div>

          {/* Confirm Password */}
          <div className='xui-form-box' xui-error={errors.confirmPassword ? 'true' : 'false'}>
            <label>Confirm New Password</label>
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your new password',
                validate: value => value === watch('newPassword') || 'Passwords do not match',
              })}
              type='password'
              placeholder='Confirm new password'
            />
            {errors.confirmPassword && (
              <span className='message'>{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={isSubmitting}
            className='px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-blue-700 flex items-center justify-center transition'
          >
            {isSubmitting ? <FaSpinner className='animate-spin h-5 w-5' /> : 'Change Password'}
          </button>
        </form>
      </div>

      {/* 📱 Two-Factor Authentication */}
      <div className='p-6 border border-gray-200 rounded-lg flex items-center justify-between'>
        <div className='flex items-start gap-3'>
          <Smartphone className='text-blue-600 mt-1' />
          <div>
            <h3 className='text-base font-semibold text-gray-900'>Two-Factor Authentication</h3>
            <p className='text-sm text-gray-500 mt-1'>
              Add an extra layer of protection to your account.
            </p>
          </div>
        </div>
        <button
          onClick={toggleTwoFactorAuth}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            twoFactorAuth ? 'bg-blue-500' : 'bg-gray-300'
          }`}
          role='switch'
          aria-checked={twoFactorAuth}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* 💻 Active Sessions */}
      <div className='p-6 border border-gray-200 rounded-lg'>
        <div className='flex items-center gap-3 mb-3'>
          <Globe className='text-blue-600' />
          <h3 className='text-md font-semibold text-gray-900'>Active Sessions</h3>
        </div>
        <p className='text-sm text-gray-500 mb-4'>View and manage your currently active devices.</p>
        <div className='space-y-3'>
          {sessions.map(session => (
            <div
              key={session.device}
              className='flex items-center justify-between border border-gray-100 p-3 rounded-md'
            >
              <div>
                <p className='font-medium text-gray-800'>{session.device}</p>
                <p className='text-sm text-gray-500'>
                  {session.location} — Last active: {session.lastActive}
                </p>
              </div>
              <button
                onClick={() => handleRevokeSession(session.device)}
                className='text-sm text-red-600 border border-red-600 px-3 py-1 rounded-md hover:bg-red-50 transition'
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 🧾 Security Log */}
      <div className='p-6 border border-gray-200 rounded-lg'>
        <div className='flex items-center gap-3 mb-3'>
          <FileText className='text-blue-600' />
          <h3 className='text-md font-semibold text-gray-900'>Security Log</h3>
        </div>
        <p className='text-sm text-gray-500 mb-4'>Track your recent login and security events.</p>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left text-gray-600'>
            <thead>
              <tr className='border-b border-gray-200 text-gray-700'>
                <th className='py-2 px-3'>Time</th>
                <th className='py-2 px-3'>Event</th>
                <th className='py-2 px-3'>Status</th>
              </tr>
            </thead>
            <tbody>
              {securityLogs.map((log, idx) => (
                <tr key={idx} className='border-b border-gray-100'>
                  <td className='py-2 px-3'>{log.time}</td>
                  <td className='py-2 px-3'>{log.event}</td>
                  <td
                    className={`py-2 px-3 font-medium ${
                      log.status === 'OK'
                        ? 'text-green-600'
                        : log.status === 'Blocked'
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {log.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔒 Data & Privacy */}
      <div className='p-6 border border-gray-200 rounded-lg space-y-3'>
        <h3 className='text-md font-semibold text-gray-900'>Data & Privacy</h3>
        <p className='text-sm text-gray-500'>Manage your personal data and privacy settings.</p>

        <div className='flex flex-wrap gap-3 mt-3'>
          <button
            onClick={handleExportData}
            className='flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition'
          >
            <FileText size={16} /> Export My Data
          </button>
          <button
            onClick={handleDeleteAccount}
            className='flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition'
          >
            <Trash2 size={16} /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
