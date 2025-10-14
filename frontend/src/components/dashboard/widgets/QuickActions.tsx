// src/widgets/QuickActions.tsx
import { LucideIcon } from 'lucide-react';

interface Action {
  icon: LucideIcon;
  label: string;
  description: string;
  iconColor: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: Action[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            onClick={action.onClick}
            className='p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left bg-white'
          >
            <div className='flex flex-col gap-2'>
              <Icon className={`w-5 h-5 ${action.iconColor}`} />
              <div>
                <h3 className='text-sm font-semibold text-gray-900'>{action.label}</h3>
                <p className='text-xs text-gray-500 mt-1'>{action.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Export the type so other files can use it
export type { Action };