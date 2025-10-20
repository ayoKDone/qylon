import { TokenResponse, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BotIcon,
  CheckCircleIcon,
  Clock12Icon,
  ShieldAlertIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import OnboardingProgress from '../../../UI/OnboardingProgress';

export default function IntegrateGoogle() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const handleLogin = useGoogleLogin({
    scope:
      'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email openid',
    onSuccess: async (tokenResponse: TokenResponse) => {
      setIsConnected(true);
      try {
        // Get user info
        const userInfoResponse = await axios.get<{
          email: string;
          name: string;
          picture: string;
        }>('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        console.log('✅ Logged in as:', userInfoResponse.data);
        console.log('🔑 Access Token:', tokenResponse.access_token);

        // Example: fetch calendar events
        const eventsResponse = await axios.get(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          },
        );

        console.log('📅 Calendar Events:', eventsResponse.data.items);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    onError: errorResponse => {
      console.error('Login Failed:', errorResponse);
    },
  });
  return (
    <>
      <OnboardingProgress step={3} />
      <section className='xui-box-shadow-1 xui-py-2 xui-px-1 xui-md-px-3'>
        <div className='xui-text-center'>
          <img
            src='/static/images/logo-full.png'
            alt='Qylon Logo'
            width={118}
            height={45}
            className='w-[100px] xui-h-auto xui-mx-auto'
          />
          <h4 className='xui-mt-1 text-[18px]'>Connect Your Google Calendar</h4>
          <p className='text-[15px] xui-mt-half xui-w-fluid-80 xui-mx-auto xui-opacity-7'>
            Never miss a meeting recording opportunity
          </p>
        </div>
        <img
          src='/static/images/banners/celebrate.png'
          alt='Qylon Logo'
          width={500}
          height={280}
          className='xui-w-fluid-100 xui-h-auto xui-mx-auto xui-mt-2'
        />
        <p className='xui-font-sz-[18px] xui-my-1-half'>We need access to:</p>
        <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-1'>
          <div className='bg-gradient-to-r from-[#EFF6FF] to-[#FAF5FF] xui-bdr-rad-half xui-p-1 xui-d-flex xui-flex-wrap-nowrap xui-grid-gap-1'>
            <div
              style={{
                flexShrink: 0,
              }}
              className='w-[48px] h-[48px] xui-bg-white xui-bdr-rad-circle xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center'
            >
              <Clock12Icon size={20} color='#155DFC' />
            </div>
            <div>
              <h4 className='text-[16px]'>Detect your scheduled meetings</h4>
              <p className='mt-[4px] xui-opacity-6 text-[14px]'>
                Automatically identify upcoming meetings
              </p>
            </div>
          </div>
          <div className='bg-gradient-to-r from-[#EFF6FF] to-[#FAF5FF] xui-bdr-rad-half xui-p-1 xui-d-flex xui-flex-wrap-nowrap xui-grid-gap-1'>
            <div
              style={{
                flexShrink: 0,
              }}
              className='w-[48px] h-[48px] xui-bg-white xui-bdr-rad-circle xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center'
            >
              <BotIcon size={20} color='#155DFC' />
            </div>
            <div>
              <h4 className='text-[16px]'>Attach our bot automatically</h4>
              <p className='mt-[4px] xui-opacity-6 text-[14px]'>
                Join meetings and start recording seamlessly
              </p>
            </div>
          </div>
          <div className='bg-gradient-to-r from-[#EFF6FF] to-[#FAF5FF] xui-bdr-rad-half xui-p-1 xui-d-flex xui-flex-wrap-nowrap xui-grid-gap-1'>
            <div
              style={{
                flexShrink: 0,
              }}
              className='w-[48px] h-[48px] xui-bg-white xui-bdr-rad-circle xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center'
            >
              <CheckCircleIcon size={20} color='#155DFC' />
            </div>
            <div>
              <h4 className='text-[16px]'>Never miss a recording</h4>
              <p className='mt-[4px] xui-opacity-6 text-[14px]'>
                Ensure all important conversations are captured
              </p>
            </div>
          </div>
        </div>
        <div className='xui-mt-2 bg-[#F0FDF4] text-[#0D542B] xui-bdr-rad-half xui-p-1 xui-d-flex xui-flex-wrap-nowrap xui-grid-gap-1'>
          <div
            style={{
              flexShrink: 0,
            }}
            className='w-[32px] h-[32px] xui-bdr-rad-circle xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center'
          >
            <ShieldAlertIcon size={20} color='currentColor' />
          </div>
          <div>
            <h4 className='text-[15px]'>Your privacy is protected</h4>
            <p className='xui-opacity-6 text-[14px]'>
              We only access meeting metadata. Your calendar events and personal information remain
              private and secure.
            </p>
          </div>
        </div>
        {!isConnected ? (
          <button
            onClick={() => handleLogin()}
            className='xui-btn xui-btn-block xui-bdr-rad-half xui-mt-1-half xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-grid-gap-half xui-text-black xui-w-fluid-100'
          >
            <img
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png'
              alt='Google Calendar'
              width={512}
              height={512}
              className='xui-img-20 xui-h-auto'
            />
            <span className='xui-font-sz-[14px]'>Connect with Google Calendar</span>
          </button>
        ) : (
          <div className='xui-mt-1 xui-d-grid xui-grid-col-2 xui-grid-gap-1'>
            <Link
              to={'/setup/profile'}
              className='w-full outline-none xui-mt-half py-2.5 xui-btn xui-btn-block text-black flex xui-grid-gap-half items-center justify-center xui-bdr-rad-half'
            >
              <ArrowLeftIcon size={14} />
              {'Back'}
            </Link>
            <Link
              to={'/setup/integrations'}
              className='w-full outline-none xui-mt-half py-2.5 xui-btn xui-btn-block text-black flex xui-grid-gap-half items-center justify-center xui-bdr-rad-half'
            >
              {'Continue'}
              <ArrowRightIcon size={14} />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
