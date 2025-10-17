import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Link } from 'react-router-dom';
import OnboardingProgress from '../../../UI/OnboardingProgress';

export default function AllIntegrations() {
  return (
    <>
    <OnboardingProgress step={4} />
    <section className='xui-box-shadow-1 xui-py-2 xui-px-1 xui-md-px-3'>
      <div className='xui-text-center'>
        <h4 className='xui-mt-1 text-[18px]'>Connect Your Favorite Tools</h4>
        <p className='text-[15px] xui-mt-half xui-w-fluid-60 xui-mx-auto xui-opacity-7'>Select at least one tool to get started. You can add more later.</p>
      </div>
      <div className='xui-mt-2 xui-d-grid xui-grid-col-2 xui-md-grid-col-3 xui-grid-gap-1'>
        <div className='h-[100px] xui-bdr-rad-half xui-d-flex xui-flex-ai-center xui-flex-jc-center bg-[#DBEAFE] xui-p-1'>
          <img src="/static/images/brand/zoom.png" alt="Zoom Logo" width={120} height={28} className='xui-img-75 xui-h-auto' />
        </div>
        <div className='h-[100px] xui-bdr-rad-half xui-d-flex xui-flex-ai-center xui-flex-jc-center bg-[#F3E8FF] xui-p-1'>
          <img src="/static/images/brand/microsoft-teams.png" alt="Microsoft Logo" width={120} height={28} className='xui-img-50 xui-h-auto' />
        </div>
        <div className='h-[100px] xui-bdr-rad-half xui-d-flex xui-flex-ai-center xui-flex-jc-center bg-[#FCE7F3] xui-p-1'>
          <img src="/static/images/brand/slack.png" alt="Slack Logo" width={120} height={28} className='xui-img-80 xui-h-auto' />
        </div>
        <div className='h-[100px] xui-bdr-rad-half xui-d-flex xui-flex-ai-center xui-flex-jc-center bg-[#FFE2E2] xui-p-1'>
          <img src="/static/images/brand/asana.png" alt="Asana Logo" width={120} height={28} className='xui-img-80 xui-h-auto' />
        </div>
        <div className='h-[100px] xui-bdr-rad-half xui-d-flex xui-flex-ai-center xui-flex-jc-center bg-[#EDE9FE] xui-p-1'>
          <img src="/static/images/brand/clickup.png" alt="Clickup Logo" width={120} height={28} className='xui-img-80 xui-h-auto' />
        </div>
        <div className='h-[100px] xui-bdr-rad-half xui-d-flex xui-flex-ai-center xui-flex-jc-center bg-[#FFEDD4] xui-p-1'>
          <img src="/static/images/brand/monday.png" alt="Monday Logo" width={120} height={28} className='xui-img-100 xui-h-auto' />
        </div>
      </div>
      <div className='xui-mt-1 bg-[#F8FAFC] xui-bdr-rad-half xui-p-1 xui-d-flex xui-flex-wrap-nowrap xui-grid-gap-1'>
        <div>
          <p className="xui-opacity-6 text-[14px]">💡 <span className='xui-font-w-600'>Pro tip:</span> Connecting multiple tools allows Qylon to automatically sync your action items across all your workspaces.</p>
        </div>
      </div>
      <div className='xui-mt-1 xui-d-grid xui-grid-col-2 xui-grid-gap-1'>
        <Link to={'/setup/add-calendar'}
          className='w-full outline-none xui-mt-half py-2.5 xui-btn xui-btn-block text-black flex xui-grid-gap-half items-center justify-center xui-bdr-rad-half'
        >
          <ArrowLeftIcon size={14} />
          {'Back'}
        </Link>
        <Link to={'/setup/demo'}
          className='w-full outline-none xui-mt-half py-2.5 bg-gradient-to-r from-[#124697] to-[#07224B] text-white flex xui-grid-gap-half items-center justify-center xui-bdr-rad-half'
        >
          {'Continue'}
          <ArrowRightIcon size={14} />
        </Link>
      </div>
    </section>
    </>
  );
}
