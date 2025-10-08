import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function DemoSetup() {
  const [meetingType, setMeetingType] = useState<string>('desktop');
  return (
    <>
      <div className='xui-text-center xui-max-w-500 xui-w-fluid-100 xui-mx-auto'>
        <h2 className='xui-font-sz-[24px] xui-md-font-sz-[24px] xui-font-w-bold'>
          Let's Record Your First Meeting
        </h2>
        <p className='xui-font-sz-[15px] xui-mt-half xui-opacity-6'>
          Let's show you how Qylon works
        </p>
      </div>
      <section className='xui-container xui-mt-2 xui-p-1 xui-d-grid xui-grid-col xui-md-grid-col-3 xui-lg-grid-col-3 xui-grid-gap-1'>
        <div
          onClick={() => setMeetingType('desktop')}
          className={`xui-text-center ${meetingType === 'desktop' ? 'xui-bdr-blue' : 'xui-bdr-fade'} xui-bdr-w-1 xui-bdr-s-solid xui-p-1 xui-bdr-rad-1`}
        >
          <div
            className={`${meetingType !== 'desktop' ? 'xui-opacity-[0]' : ''} xui-d-flex xui-flex-ai-center xui-flex-jc-flex-end xui-mb-2`}
          >
            <span className='xui-badge xui-badge-blue xui-bdr-rad-5'>Recommended</span>
          </div>
          <img
            src='/static/images/desktop.svg'
            alt='Desktop App'
            width={400}
            height={320}
            className='xui-img-200 xui-mx-auto'
          />
          <h2
            className={`xui-font-sz-[18px] ${meetingType === 'desktop' ? 'xui-text-blue' : 'xui-text-black'} xui-mt-1 xui-font-w-600`}
          >
            Desktop App
          </h2>
        </div>
        <div
          onClick={() => setMeetingType('bot')}
          className={`xui-text-center ${meetingType === 'bot' ? 'xui-bdr-blue' : 'xui-bdr-fade'} xui-bdr-w-1 xui-bdr-s-solid xui-p-1 xui-bdr-rad-1`}
        >
          <div
            className={`${meetingType !== 'bot' ? 'xui-opacity-[0]' : ''} xui-d-flex xui-flex-ai-center xui-flex-jc-flex-end xui-mb-2`}
          >
            <span className='xui-badge xui-badge-blue xui-bdr-rad-5'>Recommended</span>
          </div>
          <img
            src='/static/images/bot.svg'
            alt='Desktop App'
            width={400}
            height={320}
            className='xui-img-200 xui-mx-auto'
          />
          <h2
            className={`xui-font-sz-[18px] ${meetingType === 'bot' ? 'xui-text-blue' : 'xui-text-black'} xui-mt-1 xui-font-w-600`}
          >
            Meeting Bot
          </h2>
        </div>
        <div
          onClick={() => setMeetingType('mobile')}
          className={`xui-text-center ${meetingType === 'mobile' ? 'xui-bdr-blue' : 'xui-bdr-fade'} xui-bdr-w-1 xui-bdr-s-solid xui-p-1 xui-bdr-rad-1`}
        >
          <div
            className={`${meetingType !== 'mobile' ? 'xui-opacity-[0]' : ''} xui-d-flex xui-flex-ai-center xui-flex-jc-flex-end xui-mb-2`}
          >
            <span className='xui-badge xui-badge-blue xui-bdr-rad-5'>Recommended</span>
          </div>
          <img
            src='/static/images/mobile.svg'
            alt='Desktop App'
            width={400}
            height={320}
            className='xui-img-200 xui-mx-auto'
          />
          <h2
            className={`xui-font-sz-[18px] ${meetingType === 'mobile' ? 'xui-text-blue' : 'xui-text-black'} xui-mt-1 xui-font-w-600`}
          >
            Mobile App
          </h2>
        </div>
      </section>
      <div className='xui-text-center xui-max-w-400 xui-mt-1 xui-w-fluid-100 xui-mx-auto'>
        <Link
          to={'/setup/complete'}
          className='xui-btn bg-gradient-to-r from-purple-500 to-indigo-500 text-white xui-btn-block xui-bdr-rad-[8px] xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-grid-gap-[8px] xui-text-black xui-w-fluid-100'
        >
          <span className='xui-font-sz-[14px]'>Start Demo Recording</span>
        </Link>
      </div>
    </>
  );
}
