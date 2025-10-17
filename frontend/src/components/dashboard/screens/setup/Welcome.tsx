import { PlayIcon } from "lucide-react";
import { Link } from 'react-router-dom';
import OnboardingProgress from "../../../UI/OnboardingProgress";

export default function Welcome() {
  return (
    <>
    <OnboardingProgress step={1} />
      <section className='xui-box-shadow-1 xui-py-2 xui-px-1 xui-md-px-3'>
        <div className='xui-text-center'>
          <img src='/static/images/logo-full.png' alt='Qylon Logo' width={118} height={45} className='w-[100px] xui-h-auto xui-mx-auto' />
          <h4 className='xui-mt-1 text-[18px]'>Welcome to Qylon, User!🎊</h4>
          <p className='text-[15px] xui-mt-half xui-w-fluid-80 xui-mx-auto xui-opacity-7'>You're just a few steps away from transforming how you manage client conversations and deliverables.</p>
        </div>
        <img src='/static/images/banners/celebrate.png' alt='Qylon Logo' width={500} height={280} className='xui-w-fluid-100 xui-h-auto xui-mx-auto xui-mt-2' />
        <div className='xui-mt-2 bg-gradient-to-r from-[#EFF6FF] to-[#FAF5FF] xui-bdr-rad-half xui-p-1 xui-md-p-2 xui-d-flex xui-flex-wrap-nowrap xui-grid-gap-1'>
          <div style={{
            flexShrink: 0
          }} className='w-[48px] h-[48px] xui-bg-white xui-bdr-rad-circle xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center'>
            <PlayIcon size={20} color='#155DFC' />
          </div>
          <div>
            <h4 className="text-[16px]">Quick Tour Preview</h4>
            <p className="mt-[4px] xui-opacity-6 text-[14px]">See how Qylon turns your meetings into action items in just 3 minutes.</p>
            <button className="xui-mt-1 xui-btn xui-btn-white xui-bdr-rad-half">
              <span className="xui-font-w-600 text-[13px]">Watch Quick Tour</span>
            </button>
          </div>
        </div>
        <div className='xui-py-2'>
          <p className='xui-font-sz-[18px]'>What's next?</p>
          <div className="xui-mt-1 xui-d-grid xui-grid-col-1 xui-grid-gap-1-half">
            <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
              <div className="w-[24px] h-[24px] bg-[#DBEAFE] xui-bdr-rad-round text-[#155DFC] xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center">
                <span className="text-[13px]">1</span>
              </div>
              <span className="text-[14px] xui-opacity-8">Set up your profile and team information</span>
            </div>
            <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
              <div className="w-[24px] h-[24px] bg-[#DBEAFE] xui-bdr-rad-round text-[#155DFC] xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center">
                <span className="text-[13px]">2</span>
              </div>
              <span className="text-[14px] xui-opacity-8">Connect your Google Calendar</span>
            </div>
            <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
              <div className="w-[24px] h-[24px] bg-[#DBEAFE] xui-bdr-rad-round text-[#155DFC] xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center">
                <span className="text-[13px]">3</span>
              </div>
              <span className="text-[14px] xui-opacity-8">Choose your favorite project management tools</span>
            </div>
            <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
              <div className="w-[24px] h-[24px] bg-[#DBEAFE] xui-bdr-rad-round text-[#155DFC] xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center">
                <span className="text-[13px]">4</span>
              </div>
              <span className="text-[14px] xui-opacity-8">Record your first meeting</span>
            </div>
          </div>
          <Link
            to={'profile'}
            className='xui-bdr-rad-half bg-gradient-to-r from-[#124697] to-[#07224B] xui-text-white xui-mt-2 xui-btn xui-btn-black xui-btn-block'
          >
            <span className="text-[14px]">Let's Get You Started</span>
          </Link>
        </div>
      </section>
    </>
  );
}
