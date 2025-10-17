import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { onboardingService } from '../../../../services/onboardingService';
import Icon from '../../../icons/Icon';

interface FormValues {
  image: FileList;
  names: string;
  company_name: string;
  role_selection: string;
  team_size: string;
  industry_selection: string;
}

export default function Profile() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormValues>();
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileSizeErr, setFileSizeErr] = useState<boolean>(false);
  const [acceptedTypeErr, setAcceptedTypeErr] = useState<boolean>(false);

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
  const ACCEPTED_TYPES = useMemo(() => ['image/jpeg', 'image/png', 'image/jpg'], []);

  // Watch the image input
  const imageFiles = watch('image');

  useEffect(() => {
    const file = imageFiles?.[0];
    if (file) {
      const isAcceptedType = ACCEPTED_TYPES.includes(file.type);
      const isSizeValid = file.size <= MAX_FILE_SIZE;

      if (!isSizeValid) {
        setFileSizeErr(true);
        setTimeout(() => {
          setFileSizeErr(false);
        }, 2400);
      }

      if (!isAcceptedType) {
        setAcceptedTypeErr(true);
        setTimeout(() => {
          setAcceptedTypeErr(false);
        }, 2400);
      }

      if (!isAcceptedType || !isSizeValid) {
        setPreviewUrl(null); // Clear preview if invalid
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  }, [imageFiles, ACCEPTED_TYPES, MAX_FILE_SIZE]);

  const submitProfile = async (data: FormValues) => {
    try {
      // Update onboarding progress with profile data
      await onboardingService.updateOnboardingProgress('profile', {
        full_name: data.names,
        company_name: data.company_name,
        role: data.role_selection,
        company_size: data.team_size,
        industry: data.industry_selection,
        profile_image: data.image?.[0], // Store file reference
      });

      // Navigate to next step
      navigate('/setup/team-setup');
    } catch (error) {
      console.error('Error saving profile:', error);
      // Still navigate to next step even if save fails
      navigate('/setup/team-setup');
    }
  };

  return (
    <>
      <div className='xui-text-center xui-max-w-[500] xui-w-fluid-100 xui-mx-auto'>
        <h2 className='xui-font-sz-[24px] xui-md-font-sz-[24px] xui-font-w-bold'>Profile Setup</h2>
        <p className='xui-font-sz-[15px] xui-mt-half xui-opacity-6'>
          Let's get you started by filling in your credentials, this way we can better interact with
          you.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(submitProfile)}
        className='xui-max-w-800 xui-mt-2 xui-mx-auto xui-w-fluid-100 xui-form'
        noValidate
      >
        <div className='xui-d-inline-flex xui-flex-ai-center xui-grid-gap-[16px] xui-mb-2'>
          <label
            className='xui-w-[120px] xui-h-[120px] xui-bg-light xui-bdr-rad-circle xui-overflow-hidden xui-pos-relative xui-cursor-pointer'
            htmlFor='image'
          >
            <img
              src={
                previewUrl ||
                'https://res.cloudinary.com/dabfoaprr/image/upload/v1758299425/test-image_gf56ry.png'
              }
              alt='Profile Icon'
              width={40}
              height={40}
              className='xui-w-fluid-100 xui-h-fluid-100'
            />
            <div
              className='xui-w-fluid-100 xui-position-absolute xui-h-[32px] xui-bg-[#000000b8] xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-text-white'
              style={{ bottom: 0, left: 0 }}
            >
              <Icon name='camera' size={16} />
            </div>
          </label>
          <div className=''>
            <span className='xui-font-sz-[13px] xui-opacity-5'>
              We only support{' '}
              <span className={`${acceptedTypeErr ? 'xui-text-danger xui-font-w-700' : ''}`}>
                JPG, JPEG, or PNG file
              </span>
              .{' '}
              <span className={`${fileSizeErr ? 'xui-text-danger xui-font-w-700' : ''}`}>
                2 MB max
              </span>
              .
            </span>
            {errors.image && (
              <>
                <br />
                <br />
                <span className='xui-badge xui-badge-danger'>{errors.image.message}</span>
              </>
            )}
            {/* {previewUrl && <>
                    <br />
                    <button type="submit" className="xui-btn xui-btn-black xui-mt-[20px] xui-text-white xui-bdr-rad-[8px]" disabled={isDisabled}>
                        {!isDisabled ? <span>Upload image</span> : <span className="gg-spinner"></span>}
                    </button>
                    </>} */}
          </div>
        </div>
        <input
          style={{ position: 'fixed', top: '-100%' }}
          {...register('image', {
            required: 'This field is required',
            validate: {
              acceptedFormats: files =>
                (files && ACCEPTED_TYPES.includes(files[0]?.type)) ||
                'Only JPEG, PNG, or JPG formats are allowed.',
              fileSize: files =>
                (files && files[0]?.size <= MAX_FILE_SIZE) || 'File size must be under 2MB.',
            },
          })}
          type='file'
          name='image'
          id='image'
          accept='image/*'
        />
        <div className='xui-d-grid xui-grid-col-1 xui-md-grid-col-2 xui-grid-gap-[12px]'>
          <div className='xui-form-box' xui-error={errors.names ? 'true' : 'false'}>
            <label htmlFor='names'>Full Names</label>
            <input
              {...register('names', {
                required: 'This field is required',
              })}
              type='text'
              name='names'
              id='names'
              placeholder='Billy Jones'
            />
            {errors.names && <span className='xui-form-error-msg'>{errors.names.message}</span>}
          </div>
          <div className='xui-form-box' xui-error={errors.company_name ? 'true' : 'false'}>
            <label htmlFor='company_name'>Company Name</label>
            <input
              {...register('company_name', {
                required: 'This field is required',
              })}
              type='text'
              name='company_name'
              id='company_name'
              placeholder='XYZ Limited'
            />
            {errors.company_name && (
              <span className='xui-form-error-msg'>{errors.company_name.message}</span>
            )}
          </div>
        </div>
        <div className='xui-d-grid xui-grid-col-1 xui-md-grid-col-2 xui-grid-gap-[12px]'>
          <div className='xui-form-box' xui-error={errors.role_selection ? 'true' : 'false'}>
            <label htmlFor='role_selection'>Role Selection</label>
            <select
              {...register('role_selection', {
                required: 'This field is required',
              })}
              name='role_selection'
              id='role_selection'
            >
              <option value=''>--Select your role--</option>
              <option value='Project Manager'>Project Manager</option>
              <option value='Team Lead'>Team Lead</option>
              <option value='Executive'>Executive</option>
              <option value='HR'>HR</option>
            </select>
            {errors.role_selection && (
              <span className='xui-form-error-msg'>{errors.role_selection.message}</span>
            )}
          </div>
          <div className='xui-form-box' xui-error={errors.team_size ? 'true' : 'false'}>
            <label htmlFor='team_size'>Team Size</label>
            <select
              {...register('team_size', {
                required: 'This field is required',
              })}
              name='team_size'
              id='team_size'
            >
              <option value=''>--Select your team size--</option>
              <option value='1 - 10'>1 - 10</option>
              <option value='11 - 50'>11 - 50</option>
              <option value='51 - 99'>51 - 99</option>
              <option value='100 and above'>100 and above</option>
            </select>
            {errors.team_size && (
              <span className='xui-form-error-msg'>{errors.team_size.message}</span>
            )}
          </div>
        </div>
        <div className='xui-form-box' xui-error={errors.industry_selection ? 'true' : 'false'}>
          <label htmlFor='industry_selection'>Industry Selection</label>
          <select
            {...register('industry_selection', {
              required: 'This field is required',
            })}
            name='industry_selection'
            id='industry_selection'
          >
            <option value=''>--Select your company's industry--</option>
            <option value='Project Manager'>Project Manager</option>
            <option value='Team Lead'>Team Lead</option>
            <option value='Executive'>Executive</option>
            <option value='HR'>HR</option>
          </select>
          {errors.industry_selection && (
            <span className='xui-form-error-msg'>{errors.industry_selection.message}</span>
          )}
        </div>
        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full outline-none xui-mt-half py-2.5 xui-bdr-rad-half bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center'
        >
          {isSubmitting ? <FaSpinner className='animate-spin h-6 w-6' /> : 'Complete Profile'}
        </button>
      </form>
    </>
  );
}
