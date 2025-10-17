import { ArrowLeftIcon, ArrowRightIcon, BotIcon, MonitorIcon, PhoneIcon } from "lucide-react";
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function DemoSetup() {
  const [meetingType, setMeetingType] = useState<string>('desktop');
  return (
    <>
    <section className='xui-box-shadow-1 xui-py-2 xui-px-1 xui-md-px-3'>
      <div className='xui-text-center'>
        <h4 className='xui-mt-1 text-[18px]'>Let's Record Your First Meeting</h4>
        <p className='text-[15px] xui-mt-half xui-w-fluid-60 xui-mx-auto xui-opacity-7'>Choose how you'd like to start recording</p>
      </div>
      <div className='xui-mt-2 xui-d-grid xui-grid-col xui-md-grid-col-3 xui-lg-grid-col-3 xui-grid-gap-1'>
        <div
          onClick={() => setMeetingType('desktop')}
          className={`\${meetingType === 'desktop' ? 'xui-bdr-blue' : 'xui-bdr-fade'} xui-bdr-w-1 xui-bdr-s-solid xui-p-1 xui-bdr-rad-1`}
        >
          <div
            className={`${meetingType !== 'desktop' ? 'opacity-[0]' : ''} xui-d-flex xui-flex-ai-center xui-flex-jc-flex-end xui-mb-2`}
          >

            <span className='xui-badge xui-badge-blue xui-bdr-rad-5'>Recommended</span>
          </div>
          <MonitorIcon size={36} color='#155DFC' />
          <p
            className={`text-[14px] ${meetingType === 'desktop' ? 'xui-text-blue' : 'xui-text-black'} xui-mt-1 xui-font-w-600`}
          >
            Desktop App
          </p>
          <span className="text-[12px] xui-opacity-6">Record directly from your computer</span>
        </div>
        <div
          onClick={() => setMeetingType('bot')}
          className={`${meetingType === 'bot' ? 'xui-bdr-blue' : 'xui-bdr-fade'} xui-bdr-w-1 xui-bdr-s-solid xui-p-1 xui-bdr-rad-1`}
        >
          <div
            className={`${meetingType !== 'bot' ? 'opacity-[0]' : ''} xui-d-flex xui-flex-ai-center xui-flex-jc-flex-end xui-mb-2`}
          >
            <span className='xui-badge xui-badge-blue xui-bdr-rad-5'>Recommended</span>
          </div>
          <BotIcon size={36} color='#155DFC' />
          <p
            className={`text-[14px] ${meetingType === 'desktop' ? 'xui-text-blue' : 'xui-text-black'} xui-mt-1 xui-font-w-600`}
          >
            Meeting Bot
          </p>
          <span className="text-[12px] xui-opacity-6">Auto-join meetings via calendar</span>
        </div>
        <div
          onClick={() => setMeetingType('mobile')}
          className={`${meetingType === 'mobile' ? 'xui-bdr-blue' : 'xui-bdr-fade'} xui-bdr-w-1 xui-bdr-s-solid xui-p-1 xui-bdr-rad-1`}
        >
          <div
            className={`${meetingType !== 'mobile' ? 'opacity-[0]' : ''} xui-d-flex xui-flex-ai-center xui-flex-jc-flex-end xui-mb-2`}
          >
            <span className='xui-badge xui-badge-blue xui-bdr-rad-5'>Recommended</span>
          </div>
          <PhoneIcon size={36} color='#155DFC' />
          <p
            className={`text-[14px] ${meetingType === 'desktop' ? 'xui-text-blue' : 'xui-text-black'} xui-mt-1 xui-font-w-600`}
          >
            Mobile App
          </p>
          <span className="text-[12px] xui-opacity-6">Record on the go</span>
        </div>
      </div>
      <img src='/static/images/banners/celebrate.png' alt='Qylon Logo' width={500} height={280} className='xui-w-fluid-100 xui-h-auto xui-mx-auto xui-mt-1' />
      <div className='xui-mt-1 xui-d-grid xui-grid-col-2 xui-grid-gap-1'>
        <Link to={'/setup/integrations'}
          className='w-full outline-none xui-mt-half py-2.5 xui-btn xui-btn-block text-black flex xui-grid-gap-half items-center justify-center xui-bdr-rad-half'
        >
          <ArrowLeftIcon size={14} />
          {'Back'}
        </Link>
        <Link to={'/setup/complete'}
          className='w-full outline-none xui-mt-half py-2.5 bg-gradient-to-r from-[#124697] to-[#07224B] text-white flex xui-grid-gap-half text-[14px] items-center justify-center xui-bdr-rad-half'
        >
          {'Start Demo Recording'}
          <ArrowRightIcon size={14} />
        </Link>
      </div>
    </section>
    </>
  );
}
