import { ArrowLeftIcon, ArrowRightIcon, BarChart2Icon, BoltIcon, CheckCircle2Icon, Users2Icon } from "lucide-react";
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Link } from 'react-router-dom';
import { useWindowSize } from 'react-use';

export default function Completed() {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);
  const [confettiKey, setConfettiKey] = useState(0);

  const handleStart = () => {
    // trigger a single burst
    setConfettiKey(k => k + 1);
    setShowConfetti(true);

    // let it play for ~1.8s then navigate
    setTimeout(() => {
      setShowConfetti(false);
    }, 6000);
  };
  useEffect(() => {
    handleStart();
  }, []);
  return (
    <>
    {showConfetti && (
      <Confetti
        key={confettiKey}
        width={width || window.innerWidth}
        height={height || window.innerHeight}
        numberOfPieces={300}
        recycle={false} // run once then stop
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
      />
    )}
    <section className='xui-box-shadow-1 xui-py-2 xui-px-1 xui-md-px-3'>
      <div className='xui-text-center'>
        <img src='/static/images/logo-full.png' alt='Qylon Logo' width={118} height={45} className='w-[100px] xui-h-auto xui-mx-auto' />
        <h4 className='xui-mt-1 text-[18px]'>Welcome to Qylon! 🎉</h4>
        <p className='text-[15px] xui-mt-half xui-w-fluid-80 xui-mx-auto xui-opacity-7'>You're all set! Your workspace is ready and your dashboard is waiting for you.</p>
      </div>
      <div className='xui-d-grid xui-mt-2 xui-grid-col-1 xui-md-grid-col-2 xui-grid-gap-half'>
        <div className='bg-[#F0FDF4] text-[#0D542B] xui-bdr-rad-half xui-p-1 xui-d-flex xui-flex-wrap-nowrap xui-grid-gap-half'>
          <div style={{
            flexShrink: 0
          }} className='w-[20px] h-[20px] xui-bdr-rad-circle xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center'>
            <CheckCircle2Icon size={20} color='currentColor' />
          </div>
          <div>
            <h4 className="text-[14px]">Profile Created</h4>
          </div>
        </div>
        <div className='bg-[#F0FDF4] text-[#0D542B] xui-bdr-rad-half xui-p-1 xui-d-flex xui-flex-wrap-nowrap xui-grid-gap-half'>
          <div style={{
            flexShrink: 0
          }} className='w-[20px] h-[20px] xui-bdr-rad-circle xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center'>
            <CheckCircle2Icon size={20} color='currentColor' />
          </div>
          <div>
            <h4 className="text-[14px]">Calendar Connected</h4>
          </div>
        </div>
        <div className='bg-[#F0FDF4] text-[#0D542B] xui-bdr-rad-half xui-p-1 xui-d-flex xui-flex-wrap-nowrap xui-grid-gap-half'>
          <div style={{
            flexShrink: 0
          }} className='w-[20px] h-[20px] xui-bdr-rad-circle xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center'>
            <CheckCircle2Icon size={20} color='currentColor' />
          </div>
          <div>
            <h4 className="text-[14px]">Tools Integrated</h4>
          </div>
        </div>
        <div className='bg-[#F0FDF4] text-[#0D542B] xui-bdr-rad-half xui-p-1 xui-d-flex xui-flex-wrap-nowrap xui-grid-gap-half'>
          <div style={{
            flexShrink: 0
          }} className='w-[20px] h-[20px] xui-bdr-rad-circle xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center'>
            <CheckCircle2Icon size={20} color='currentColor' />
          </div>
          <div>
            <h4 className="text-[14px]">Ready to Record</h4>
          </div>
        </div>
      </div>
      <div className="xui-mt-1 text-white bg-gradient-to-r from-[#155DFC] to-[#9810FA] xui-p-1 xui-bdr-rad-half">
        <h4 className="text-[14px] xui-mb-1">Your Dashboard is Ready</h4>
        <div className="xui-d-grid xui-grid-col-1 xui-md-grid-col-3 xui-grid-gap-1">
          <div className="xui-text-al-center">
            <h2 className="text-[32px] xui-font-w-600">0</h2>
            <span className="text-[13px] xui-opacity-8">Meetings</span>
          </div>
          <div className="xui-text-al-center">
            <h2 className="text-[32px] xui-font-w-600">0</h2>
            <span className="text-[13px] xui-opacity-8">Tasks Created</span>
          </div>
          <div className="xui-text-al-center">
            <h2 className="text-[32px] xui-font-w-600">0h</h2>
            <span className="text-[13px] xui-opacity-8">Time Saved</span>
          </div>
        </div>
      </div>
      <div className="xui-d-grid xui-mt-1 xui-grid-col-1 xui-grid-gap-half">
        <div className='bg-white xui-bdr-fade xui-bdr-w-1 xui-bdr-s-solid xui-bdr-rad-half xui-p-1 xui-d-flex xui-flex-wrap-nowrap xui-grid-gap-1'>
          <div style={{
            flexShrink: 0
          }} className='w-[40px] h-[40px] bg-[#DBEAFE] text-[#155DFC] xui-bdr-rad-half xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center'>
            <BarChart2Icon size={20} color='currentColor' />
          </div>
          <div>
            <h4 className="text-[15px]">Analytics Dashboard</h4>
            <p className="xui-opacity-6 text-[14px]">Track your team performance and meeting insights</p>
          </div>
        </div>
        <div className='bg-white xui-bdr-fade xui-bdr-w-1 xui-bdr-s-solid xui-bdr-rad-half xui-p-1 xui-d-flex xui-flex-wrap-nowrap xui-grid-gap-1'>
          <div style={{
            flexShrink: 0
          }} className='w-[40px] h-[40px] bg-[#DBEAFE] text-[#155DFC] xui-bdr-rad-half xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center'>
            <Users2Icon size={20} color='currentColor' />
          </div>
          <div>
            <h4 className="text-[15px]">Meeting History</h4>
            <p className="xui-opacity-6 text-[14px]">Access all your recorded conversations</p>
          </div>
        </div>
        <div className='bg-white xui-bdr-fade xui-bdr-w-1 xui-bdr-s-solid xui-bdr-rad-half xui-p-1 xui-d-flex xui-flex-wrap-nowrap xui-grid-gap-1'>
          <div style={{
            flexShrink: 0
          }} className='w-[40px] h-[40px] bg-[#DBEAFE] text-[#155DFC] xui-bdr-rad-half xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center'>
            <BoltIcon size={20} color='currentColor' />
          </div>
          <div>
            <h4 className="text-[15px]">Workflows</h4>
            <p className="xui-opacity-6 text-[14px]">Automate your action items and deliverables</p>
          </div>
        </div>
      </div>
      <div className='xui-mt-1 xui-d-grid xui-grid-col-2 xui-grid-gap-1'>
        <Link to={''}
          className='w-full outline-none xui-mt-half py-2.5 xui-btn xui-btn-block text-black flex xui-grid-gap-half items-center justify-center xui-bdr-rad-half'
        >
          <ArrowLeftIcon size={14} />
          {'Take a Tour'}
        </Link>
        <Link to={'/dashboard'}
          className='w-full outline-none xui-mt-half py-2.5 bg-gradient-to-r from-[#124697] to-[#07224B] text-white flex xui-grid-gap-half text-[14px] items-center justify-center xui-bdr-rad-half'
        >
          {'Go to Dashboard'}
          <ArrowRightIcon size={14} />
        </Link>
      </div>
    </section>
    </>
  );
}
