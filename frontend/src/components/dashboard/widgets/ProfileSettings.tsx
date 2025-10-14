// src/components/ProfileSettings.tsx
import React from 'react';
import { useState, useCallback, useRef } from 'react';
import { Save, Upload, Trash2, Edit3 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FaSpinner } from 'react-icons/fa';
import Cropper, { Area } from 'react-easy-crop';
import { getCroppedImg } from '@/utils/cropImage';

type ProfileFormInputs = {
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  timeZone: string;
  dateFormat: string;
  language: string;
};

interface ProfileSettingsProps {
  onSave?: (data: ProfileFormInputs) => Promise<void>;
}

export default function ProfileSettings({ onSave }: ProfileSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [showChangeEmail, setShowChangeEmail] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormInputs>();

  const onSubmit = async (data: ProfileFormInputs) => {
    console.log('Profile Data:', data);
    if (onSave) {
      await onSave(data);
    } else {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const onCropComplete = useCallback((_: Area, croppedArea: Area) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = async () => {
    if (!rawImage || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(rawImage, croppedAreaPixels);
      setAvatar(croppedImage);
      setShowCropper(false);
      setRawImage(null);
    } catch (error) {
      console.error('Crop error:', error);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-8 xui-form'>
      <div>
        <p className='text-gray-600'>Update your photo and personal details here.</p>
      </div>
      {/* Profile Picture Section */}
      <div className='border rounded-lg p-6'>
        <div className='flex items-center gap-6'>
          <img
            src={
              avatar ||
              'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'
            }
            alt='Profile'
            className='w-24 h-24 rounded-full object-cover border'
          />

          <div className='space-x-3'>
            {/* Hidden file input (still needed for file selection, but not visible) */}
            <div className='xui-d-none xui-form-box'>
              <input type='file' accept='image/*' ref={fileInputRef} onChange={handleFileChange} />
            </div>

            {/* Upload Button (opens file picker) */}
            <button
              type='button'
              onClick={openFileDialog}
              className='px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition'
            >
              <Upload className='inline-block w-4 h-4 mr-2' />
              Upload Image
            </button>

            {/* Remove Photo Button (only visible if avatar exists) */}
            {avatar && (
              <button
                type='button'
                onClick={handleRemoveAvatar}
                className='px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition'
              >
                <Trash2 className='inline-block w-4 h-4 mr-2' />
                Remove Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {showCropper && (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg shadow-lg w-[90%] md:w-[400px]'>
            <h3 className='font-semibold text-lg mb-4'>Crop Image</h3>
            <div className='relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden'>
              <Cropper
                image={rawImage!}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className='flex justify-between items-center mt-4 xui-form-box'>
              <input
                type='range'
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
              />
              <div className='space-x-2'>
                <button
                  type='button'
                  className='px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300'
                  onClick={() => setShowCropper(false)}
                >
                  Cancel
                </button>
                <button
                  type='button'
                  className='px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600'
                  onClick={handleCropSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <div className='border rounded-lg p-6'>
        <h2 className='text-md font-semibold mb-4 text-gray-800'>Personal Information</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='xui-form-box' xui-error={errors.fullName ? 'true' : 'false'}>
            <label>Full Name</label>
            <input
              {...register('fullName', { required: 'Full name is required' })}
              type='text'
              placeholder='Enter your full name'
            />
            {errors.fullName && <span className='message'>{errors.fullName.message}</span>}
          </div>

          <div className='xui-form-box' xui-error={errors.email ? 'true' : 'false'}>
            <label>Email Address</label>
            <div className='flex items-center gap-2'>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email',
                  },
                })}
                type='email'
                placeholder='you@email.com'
                readOnly={!showChangeEmail}
                className={showChangeEmail ? 'bg-white' : 'bg-gray-100'}
              />
              <button
                type='button'
                onClick={() => setShowChangeEmail(!showChangeEmail)}
                className='text-blue-500 hover:underline text-sm'
              >
                <Edit3 className='inline-block w-4 h-4 mr-1' />
                {showChangeEmail ? 'Cancel' : 'Change'}
              </button>
            </div>
            {errors.email && <span className='message'>{errors.email.message}</span>}
          </div>

          <div className='xui-form-box'>
            <label>Phone Number</label>
            <input {...register('phone')} type='tel' placeholder='+1 234 567 890' />
          </div>

          <div className='xui-form-box'>
            <label>Job Title</label>
            <input {...register('jobTitle')} type='text' placeholder='e.g., Developer' />
          </div>

          <div className='xui-form-box'>
            <label>Company Name</label>
            <input {...register('company')} type='text' placeholder='Your company' />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className='border rounded-lg p-6 shadow-sm'>
        <h2 className='text-md font-semibold mb-4 text-gray-800'>Preferences</h2>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='xui-form-box'>
            <label>Time Zone</label>
            <select {...register('timeZone')} defaultValue='UTC+0 (GMT)'>
              <option value='UTC-8 (Pacific Time)'>UTC-8 (Pacific Time)</option>
              <option value='UTC-5 (Eastern Time)'>UTC-5 (Eastern Time)</option>
              <option value='UTC+0 (GMT)'>UTC+0 (GMT)</option>
              <option value='UTC+1 (CET)'>UTC+1 (CET)</option>
              <option value='UTC+8 (CST)'>UTC+8 (CST)</option>
            </select>
          </div>

          <div className='xui-form-box'>
            <label>Date Format</label>
            <select {...register('dateFormat')} defaultValue='MM/DD/YYYY'>
              <option value='MM/DD/YYYY'>MM/DD/YYYY</option>
              <option value='DD/MM/YYYY'>DD/MM/YYYY</option>
              <option value='YYYY-MM-DD'>YYYY-MM-DD</option>
            </select>
          </div>

          <div className='xui-form-box'>
            <label>Language</label>
            <select {...register('language')} defaultValue='English'>
              <option value='English'>English</option>
              <option value='Spanish'>Spanish</option>
              <option value='French'>French</option>
              <option value='German'>German</option>
              <option value='Chinese'>Chinese</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className='flex justify-end pt-4'>
        <button
          type='submit'
          disabled={isSubmitting}
          className='flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isSubmitting ? (
            <FaSpinner className='animate-spin h-5 w-5' />
          ) : (
            <>
              <Save className='w-5 h-5' />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
