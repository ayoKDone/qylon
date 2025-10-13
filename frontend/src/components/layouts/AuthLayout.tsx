// src/components/layout/AuthLayout.tsx
import { ReactNode } from 'react';
import { Stepper, Step } from '../UI/Stepper';

type AuthLayoutProps = {
  children: ReactNode;
  steps?: Step[];
  currentStep?: number;
};

export function AuthLayout({ children, steps, currentStep = 0 }: AuthLayoutProps) {
  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <aside className='w-1/3 bg-white border-r p-8'>
        <div className='flex flex-col gap-8'>
          {/* Branding */}
          <div>
            <div className='h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold'>
              M
            </div>
            <h1 className='mt-4 font-semibold text-lg'>MeetFlow</h1>
            <p className='text-sm text-gray-500'>Transform your meetings</p>
          </div>

          {/* Stepper */}
          {steps && <Stepper steps={steps} currentStep={currentStep} />}

          {/* Progress */}
          {steps && (
            <div>
              <p className='text-xs text-gray-500 mb-2'>Progress</p>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-purple-600 h-2 rounded-full transition-all'
                  style={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className='flex-1 flex items-center justify-center p-12'>
        <div className='w-full max-w-md'>{children}</div>
      </main>
    </div>
  );
}
