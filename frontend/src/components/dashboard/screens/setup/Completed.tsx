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
    }, 5200);
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
      <div className='xui-text-center xui-max-w-500 xui-w-fluid-100 xui-mx-auto'>
        <h2 className='xui-font-sz-[24px] xui-md-font-sz-[24px] xui-font-w-bold'>
          Welcome to Qylon!
        </h2>
        <p className='xui-font-sz-[15px] xui-mt-half xui-opacity-6'>
          Let's show you how Qylon works
        </p>
      </div>
      <section className='xui-container xui-mt-2 xui-p-1 xui-d-grid xui-grid-col xui-md-grid-col-3 xui-lg-grid-col-3 xui-grid-gap-1'>
        <div className='xui-bdr-fade xui-bdr-w-1 xui-bdr-s-solid xui-p-1 xui-bdr-rad-1'>
          <div className='xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'>
            <img
              src='https://static.vecteezy.com/system/resources/previews/012/871/376/non_2x/zoom-logo-in-blue-colors-meetings-app-logotype-illustration-free-png.png'
              alt='Zoom Logo'
              width={520}
              height={520}
              className='xui-img-40 xui-h-auto'
            />
            <button className='xui-btn xui-py-[8px] xui-px-[16px!] xui-bdr-rad-half'>
              <span className='xui-font-sz-[12px]'>Connect</span>
            </button>
          </div>
          <h2 className='xui-font-sz-[18px] xui-mt-1 xui-font-w-600'>Zoom</h2>
          <p className='xui-opacity-6 xui-font-sz-[13px]'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos magni ratione asperiores
            consequatur.
          </p>
        </div>
        <div className='xui-bdr-fade xui-bdr-w-1 xui-bdr-s-solid xui-p-1 xui-bdr-rad-1'>
          <div className='xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'>
            <img
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png'
              alt='Zoom Logo'
              width={520}
              height={520}
              className='xui-img-40 xui-h-auto'
            />
            <button className='xui-btn xui-py-[8px] xui-px-[16px!] xui-bdr-rad-half'>
              <span className='xui-font-sz-[12px]'>Connect</span>
            </button>
          </div>
          <h2 className='xui-font-sz-[18px] xui-mt-1 xui-font-w-600'>Microsoft</h2>
          <p className='xui-opacity-6 xui-font-sz-[13px]'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos magni ratione asperiores
            consequatur.
          </p>
        </div>
        <div className='xui-bdr-fade xui-bdr-w-1 xui-bdr-s-solid xui-p-1 xui-bdr-rad-1'>
          <div className='xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'>
            <img
              src='https://cdn.iconscout.com/icon/free/png-256/free-slack-logo-icon-svg-download-png-1254330.png'
              alt='Zoom Logo'
              width={520}
              height={520}
              className='xui-img-40 xui-h-auto'
            />
            <button className='xui-btn xui-py-[8px] xui-px-[16px!] xui-bdr-rad-half'>
              <span className='xui-font-sz-[12px]'>Connect</span>
            </button>
          </div>
          <h2 className='xui-font-sz-[18px] xui-mt-1 xui-font-w-600'>Slack</h2>
          <p className='xui-opacity-6 xui-font-sz-[13px]'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos magni ratione asperiores
            consequatur.
          </p>
        </div>
      </section>
      <section className='xui-d-grid xui-grid-col-1 xui-md-grid-col-2 xui-grid-gap-half xui-max-w-400 xui-mt-1 xui-w-fluid-100 xui-mx-auto'>
        <Link
          to={'/dashboard'}
          className='xui-p-half xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'
        >
          <span className='xui-opacity-7 xui-font-sz-[14px]'>Quick Link #1</span>
        </Link>
        <Link
          to={'/dashboard'}
          className='xui-p-half xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'
        >
          <span className='xui-opacity-7 xui-font-sz-[14px]'>Quick Link #1</span>
        </Link>
        <Link
          to={'/dashboard'}
          className='xui-p-half xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'
        >
          <span className='xui-opacity-7 xui-font-sz-[14px]'>Quick Link #1</span>
        </Link>
        <Link
          to={'/dashboard'}
          className='xui-p-half xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'
        >
          <span className='xui-opacity-7 xui-font-sz-[14px]'>Quick Link #1</span>
        </Link>
      </section>
      <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half xui-text-center xui-max-w-400 xui-mt-2 xui-w-fluid-100 xui-mx-auto'>
        <Link
          to={'/dashboard'}
          className='xui-btn bg-gradient-to-r from-purple-500 to-indigo-500 text-white xui-btn-block xui-bdr-rad-[8px] xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-grid-gap-[8px] xui-text-black xui-w-fluid-100'
        >
          <span className='xui-font-sz-[14px]'>Go to dashboard</span>
        </Link>
        <Link
          to={'/dashboard?tour=true'}
          className='xui-btn xui-btn-block xui-bdr-rad-[8px] xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-grid-gap-[8px] xui-text-black xui-w-fluid-100'
        >
          <span className='xui-font-sz-[14px]'>Take a tour</span>
        </Link>
      </div>
    </>
  );
}
