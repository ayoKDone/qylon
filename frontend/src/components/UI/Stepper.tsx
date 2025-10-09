// src/components/ui/Stepper.tsx

export type Step = {
  title: string;
  description: string;
};

type StepperProps = {
  steps: Step[];
  currentStep: number;
};

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className='space-y-4'>
      {steps.map((step, i) => (
        <div key={i} className='flex items-center gap-2'>
          <div
            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${
              i <= currentStep ? 'bg-purple-600 text-white' : 'border border-gray-300 text-gray-500'
            }`}
          >
            {i + 1}
          </div>
          <div>
            <p className='font-medium text-sm'>{step.title}</p>
            <p className='text-xs text-gray-500'>{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
