import { TokenResponse, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { ArrowLeftRightIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

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
      <div className='xui-text-center xui-max-w-500 xui-w-fluid-100 xui-mx-auto'>
        <div className='xui-d-flex xui-flex-grid-gap-[8px] xui-flex-ai-center xui-flex-jc-space-between xui-max-w-[240px] xui-w-fluid-100 xui-mx-auto xui-mb-2'>
          <div className='xui-w-[72px] xui-h-[72px] xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-bg-white xui-bdr-rad-[8px] xui-box-shadow-1'>
            <img
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/512px-Google_Calendar_icon_%282020%29.svg.png'
              alt='Google Calendar'
              width={512}
              height={512}
              className='xui-img-40 xui-h-auto'
            />
          </div>
          <ArrowLeftRightIcon color='rgba(0, 0, 0, .4)' size={20} />
          <div className='xui-w-[72px] xui-h-[72px] xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-bg-white xui-bdr-rad-[8px] xui-box-shadow-1'>
            <img
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png'
              alt='Google Calendar'
              width={512}
              height={512}
              className='xui-img-40 xui-h-auto'
            />
          </div>
        </div>
        <h2 className='xui-font-sz-[24px] xui-md-font-sz-[24px] xui-font-w-bold'>
          Connect Your Google Calendar
        </h2>
        <p className='xui-font-sz-[15px] xui-mt-half xui-opacity-6'>
          Connect your calendar so we can help you better
        </p>
        <div className='xui-my-2 xui-p-1 xui-md-p-1-half xui-text-left xui-bg-light xui-bdr-rad-half'>
          <p className='xui-font-sz-[15px] xui-font-w-600'>Why we need these:</p>
          <ul
            style={{
              listStyleType: 'initial',
            }}
            className='xui-mt-1 xui-font-sz-[14px] xui-opacity-8 xui-pl-1'
          >
            <li className='xui-my-[6px]'>We need access to detect your meetings</li>
            <li className='xui-my-[6px]'>Automatically attach our bot to scheduled meetings</li>
            <li className='xui-my-[6px]'>Never miss a meeting recording</li>
          </ul>
        </div>
        {!isConnected ? (
          <button
            onClick={() => handleLogin()}
            className='xui-btn xui-bg-[#F1F1F1] xui-btn-block xui-bdr-rad-[8px] xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-grid-gap-[8px] xui-text-black xui-w-fluid-100'
          >
            <img
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png'
              alt='Google Calendar'
              width={512}
              height={512}
              className='xui-img-20 xui-h-auto'
            />
            <span className='xui-font-sz-[14px]'>Integrate Google Calendar</span>
          </button>
        ) : (
          <Link
            to={'/setup/integrations'}
            className='xui-btn bg-gradient-to-r from-purple-500 to-indigo-500 text-white xui-btn-block xui-bdr-rad-[8px] xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-grid-gap-[8px] xui-text-black xui-w-fluid-100'
          >
            <span className='xui-font-sz-[14px]'>Continue</span>
          </Link>
        )}
      </div>
    </>
  );
}
