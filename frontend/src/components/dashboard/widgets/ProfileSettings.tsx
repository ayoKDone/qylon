// src/components/ProfileSettings.tsx
import { getCroppedImg } from '@/utils/cropImage';
import { DownloadIcon, InfoIcon, KeyIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

type ProfileFormInputs = {
  firstname: string;
  lastname: string;
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
  // const [showChangeEmail, setShowChangeEmail] = useState(false);

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

  // const handleRemoveAvatar = () => {
  //   setAvatar(null);
  // };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className='xui-row'>
        <div className='xui-col-12 xui-lg-col-8 xui-lg-pr-1'>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-8 xui-form'>
            <div>
              <p className='text-gray-600'>Update your photo and personal details here.</p>
            </div>
            {/* Profile Information Section */}
            <div className='xui-d-flex xui-grid-gap-1 xui-p-1 xui-bdr-rad-half xui-bdr-w-1 xui-bdr-s-solid xui-bdr-fade'>
              <div style={{ flex: 1 }} onClick={openFileDialog}>
                <img
                  src={
                    avatar ||
                    'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'
                  }
                  alt='Profile'
                  className='w-24 h-24 rounded-full object-cover border'
                />
                {/* Hidden file input (still needed for file selection, but not visible) */}
                <div className='xui-d-none xui-form-box'>
                  <input
                    type='file'
                    accept='image/*'
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              <div>
                <div className='xui-d-grid xui-grid-col-1 xui-md-grid-col-2 xui-grid-gap-1'>
                  <div className='xui-form-box' xui-error={errors.firstname ? 'true' : 'false'}>
                    <label>First Name</label>
                    <input
                      {...register('firstname', { required: 'Full name is required' })}
                      type='text'
                      placeholder='Enter your full name'
                    />
                    {errors.firstname && (
                      <span className='message'>{errors.firstname.message}</span>
                    )}
                  </div>
                  <div className='xui-form-box' xui-error={errors.lastname ? 'true' : 'false'}>
                    <label>Last Name</label>
                    <input
                      {...register('lastname', { required: 'Last name is required' })}
                      type='text'
                      placeholder='Enter your last name'
                    />
                    {errors.lastname && <span className='message'>{errors.lastname.message}</span>}
                  </div>
                </div>
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
                    type='text'
                    placeholder='Enter your email'
                  />
                  {errors.email && <span className='message'>{errors.email.message}</span>}
                </div>
                <div className='xui-form-box xui-d-flex xui-lg-flex-jc-flex-end'>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='xui-btn xui-btn-blue xui-bdr-rad-half'
                  >
                    <span>Save Changes</span>
                  </button>
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
          </form>
          <section className='xui-p-1 xui-bdr-rad-half xui-bdr-w-1 xui-bdr-s-solid xui-bdr-fade xui-mt-1'>
            <h3 className='xui-font-w-600 text-[18px]'>Notification Preferences</h3>
            <div className='xui-mt-1 xui-d-grid xui-grid-col-1 xui-grid-gap-2'>
              <div className='xui-d-flex xui-flex-jc-space-between xui-flex-ai-center'>
                <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half'>
                  <p className='xui-opacity-8 text-[15px]'>Email Notifications</p>
                  <span className='xui-opacity-6 text-[14px]'>Receive updates via email</span>
                </div>
                <div className='xui-toggle-switch'>
                  <input type='checkbox' id='toggle' />
                  <div className='slider'></div>
                </div>
              </div>
              <div className='xui-d-flex xui-flex-jc-space-between xui-flex-ai-center'>
                <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half'>
                  <p className='xui-opacity-8 text-[15px]'>Push Notifications</p>
                  <span className='xui-opacity-6 text-[14px]'>Receive browser notifications</span>
                </div>
                <div className='xui-toggle-switch'>
                  <input type='checkbox' id='toggle' />
                  <div className='slider'></div>
                </div>
              </div>
              <div className='xui-d-flex xui-flex-jc-space-between xui-flex-ai-center'>
                <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half'>
                  <p className='xui-opacity-8 text-[15px]'>Weekly Reports</p>
                  <span className='xui-opacity-6 text-[14px]'>Get weekly activity summaries</span>
                </div>
                <div className='xui-toggle-switch'>
                  <input type='checkbox' id='toggle' />
                  <div className='slider'></div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className='xui-col-12 xui-lg-col-4 xui-lg-pl-1'>
          <section
            style={{
              position: 'sticky',
              top: '40px',
            }}
          >
            <div className='xui-p-1 xui-bdr-rad-half xui-bdr-w-1 xui-bdr-s-solid xui-bdr-fade'>
              <h3 className='xui-font-w-600 text-[15px]'>Quick Actions</h3>
              <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-1-half xui-mt-1'>
                <Link
                  to={'/'}
                  className='xui-opacity-7 xui-d-flex xui-flex-ai-center xui-grid-gap-half'
                >
                  <KeyIcon size={16} />
                  <span className='text-[13px]'>Change Password</span>
                </Link>
                <Link
                  to={'/'}
                  className='xui-opacity-7 xui-d-flex xui-flex-ai-center xui-grid-gap-half'
                >
                  <DownloadIcon size={16} />
                  <span className='text-[13px]'>Export Data</span>
                </Link>
                <Link
                  to={'/'}
                  className='xui-text-danger xui-d-flex xui-flex-ai-center xui-grid-gap-half'
                >
                  <Trash2Icon size={16} />
                  <span className='text-[13px]'>Delete Account</span>
                </Link>
              </div>
            </div>
            <div className='xui-p-1 xui-bdr-rad-half xui-bdr-w-1 xui-bdr-s-solid xui-bdr-blue xui-bg-light-blue-1 xui-text-blue xui-mt-1'>
              <div className='xui-d-flex xui-flex-wrap-nowrap xui-grid-gap-1'>
                <div className='xui-mt-half w-[16px] h-[16px] xui-bg-blue xui-text-white xui-bdr-rad-circle xui-d-flex xui-flex-ai-center xui-flex-jc-center'>
                  <InfoIcon size={10} />
                </div>
                <div
                  style={{
                    flex: 1,
                  }}
                >
                  <h3 className='xui-font-w-600 text-[15px]'>Pro Tip</h3>
                  <p className='text-[13px] xui-w-fluid-90 xui-mt-half'>
                    Connect your favorite tools to streamline your workflow and boost productivity.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <section className='xui-mt-4'>
        <div className='xui-d-flex xui-flex-jc-space-between'>
          <div>
            <h2 className='text-[20px] xui-font-w-700'>Integrations</h2>
            <span className='xui-opacity-6 text-[14px]'>
              Connect your favorite tools and services
            </span>
          </div>
          <button className='xui-btn xui-btn-blue h-[40px] xui-px-1 xui-bdr-rad-half xui-d-inline-flex xui-flex-ai-center xui-grid-gap-half'>
            <PlusIcon size={14} />
            <span className='text-[14px]'>Browse All</span>
          </button>
        </div>
        <div className='xui-d-grid xui-grid-col-1 xui-lg-grid-col-3 xui-grid-gap-1 xui-mt-1'>
          <div className='xui-d-flex xui-flex-dir-column xui-flex-jc-space-between xui-bdr-rad-half xui-bdr-fade xui-bdr-w-1 xui-bdr-s-solid xui-p-1'>
            <div>
              <div className='xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'>
                <div className='xui-bg-light w-[40px] h-[40px] xui-bdr-rad-half'>
                  <img
                    src='https://logosandtypes.com/wp-content/uploads/2020/11/Asana.png'
                    alt='Asana Logo'
                    width={50}
                    height={50}
                    className='xui-w-fluid-100 xui-h-auto'
                  />
                </div>
                <span className='xui-badge xui-badge-success'>Connected</span>
              </div>
              <h3 className='xui-font-w-600 xui-mt-1'>Asana</h3>
              <p className='xui-opacity-6 text-[14px]'>
                Sync tasks and projects with your Asana workspace for seamless project management.
              </p>
            </div>
            <button className='xui-mt-1 xui-btn xui-btn-block xui-bg-light xui-bdr-rad-half'>
              <span className='text-[13px]'>Manage Connection</span>
            </button>
          </div>
          <div className='xui-d-flex xui-flex-dir-column xui-flex-jc-space-between xui-bdr-rad-half xui-bdr-fade xui-bdr-w-1 xui-bdr-s-solid xui-p-1'>
            <div>
              <div className='xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'>
                <div className='xui-bg-light w-[40px] h-[40px] xui-bdr-rad-half'>
                  <img
                    src='https://media.tychesoftwares.com/wp-content/uploads/logo_ZM_wordmark_whitesquare-RGB.jpg'
                    alt='Zoom Logo'
                    width={50}
                    height={50}
                    className='xui-w-fluid-100 xui-h-auto'
                  />
                </div>
                <span className='xui-badge xui-badge-success'>Connected</span>
              </div>
              <h3 className='xui-font-w-600 xui-mt-1'>Zoom</h3>
              <p className='xui-opacity-6 text-[14px]'>
                Schedule and join Zoom meetings directly from your dashboard.
              </p>
            </div>
            <button className='xui-mt-1 xui-btn xui-btn-block xui-bg-light xui-bdr-rad-half'>
              <span className='text-[13px]'>Manage Connection</span>
            </button>
          </div>
          <div className='xui-d-flex xui-flex-dir-column xui-flex-jc-space-between xui-bdr-rad-half xui-bdr-fade xui-bdr-w-1 xui-bdr-s-solid xui-p-1'>
            <div>
              <div className='xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'>
                <div className='xui-bg-light w-[40px] h-[40px] xui-bdr-rad-half'>
                  <img
                    src='https://thumbs.dreamstime.com/b/google-meet-logo-editorial-illustrative-white-background-logo-icon-vector-logos-icons-set-social-media-flat-banner-vectors-svg-210443207.jpg'
                    alt='Google Meet Logo'
                    width={50}
                    height={50}
                    className='xui-w-fluid-100 xui-h-auto'
                  />
                </div>
                <span className='xui-badge xui-bg-light'>Available</span>
              </div>
              <h3 className='xui-font-w-600 xui-mt-1'>Google Meet</h3>
              <p className='xui-opacity-6 text-[14px]'>
                Integrate with Google Meet for video conferencing and calendar sync.
              </p>
            </div>
            <button className='xui-mt-1 xui-btn xui-btn-block xui-btn-blue xui-bdr-rad-half'>
              <span className='text-[13px]'>Connect Now</span>
            </button>
          </div>
          <div className='xui-d-flex xui-flex-dir-column xui-flex-jc-space-between xui-bdr-rad-half xui-bdr-fade xui-bdr-w-1 xui-bdr-s-solid xui-p-1'>
            <div>
              <div className='xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'>
                <div className='xui-bg-light w-[40px] h-[40px] xui-bdr-rad-half'>
                  <img
                    src='https://www.howtobuysaas.com/wp-content/uploads/2020/10/unnamed-3.png'
                    alt='Zoho Meet Logo'
                    width={50}
                    height={50}
                    className='xui-w-fluid-100 xui-h-auto'
                  />
                </div>
                <span className='xui-badge xui-bg-light'>Available</span>
              </div>
              <h3 className='xui-font-w-600 xui-mt-1'>Zoho Meet</h3>
              <p className='xui-opacity-6 text-[14px]'>
                Connect with Zoho Meet for secure video conferencing and collaboration.
              </p>
            </div>
            <button className='xui-mt-1 xui-btn xui-btn-block xui-btn-blue xui-bdr-rad-half'>
              <span className='text-[13px]'>Connect Now</span>
            </button>
          </div>
          <div className='xui-d-flex xui-flex-dir-column xui-flex-jc-space-between xui-bdr-rad-half xui-bdr-fade xui-bdr-w-1 xui-bdr-s-solid xui-p-1'>
            <div>
              <div className='xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'>
                <div className='xui-bg-light w-[40px] h-[40px] xui-bdr-rad-half'>
                  <img
                    src='https://pbs.twimg.com/profile_images/1954978523732643842/TCyGfr9i_400x400.jpg'
                    alt='ClickUp Logo'
                    width={50}
                    height={50}
                    className='xui-w-fluid-100 xui-h-auto'
                  />
                </div>
                <span className='xui-badge xui-badge-success'>Connected</span>
              </div>
              <h3 className='xui-font-w-600 xui-mt-1'>ClickUp</h3>
              <p className='xui-opacity-6 text-[14px]'>
                Sync your ClickUp tasks and track productivity across all projects.
              </p>
            </div>
            <button className='xui-mt-1 xui-btn xui-btn-block xui-bg-light xui-bdr-rad-half'>
              <span className='text-[13px]'>Manage Connection</span>
            </button>
          </div>
          <div className='xui-d-flex xui-flex-dir-column xui-flex-jc-space-between xui-bdr-rad-half xui-bdr-fade xui-bdr-w-1 xui-bdr-s-solid xui-p-1'>
            <div>
              <div className='xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'>
                <div className='xui-bg-light w-[40px] h-[40px] xui-bdr-rad-half'>
                  <img
                    src='https://thumbs.dreamstime.com/b/slack-logo-vector-white-background-slack-logo-vector-white-background-editorial-illustrative-social-media-logo-206665964.jpg'
                    alt='Slack Logo'
                    width={50}
                    height={50}
                    className='xui-w-fluid-100 xui-h-auto'
                  />
                </div>
                <span className='xui-badge xui-badge-success'>Connected</span>
              </div>
              <h3 className='xui-font-w-600 xui-mt-1'>Slack</h3>
              <p className='xui-opacity-6 text-[14px]'>
                Get notifications and updates directly in your Slack channels
              </p>
            </div>
            <button className='xui-mt-1 xui-btn xui-btn-block xui-bg-light xui-bdr-rad-half'>
              <span className='text-[13px]'>Manage Connection</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
