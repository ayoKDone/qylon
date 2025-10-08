// src/components/PageHeader.tsx
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    icon: LucideIcon;
    onClick: () => void;
  };
  children?: ReactNode;
}

export default function SectionHeader({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  children,
}: PageHeaderProps) {
  return (
    <div className='space-y-4 xui-bg-white xui-bdr-rad-1-half border border-gray-200 p-6'>
      {/* Title and Actions Row */}
      <div className='xui-d-flex xui-flex-jc-space-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>{title}</h1>
          {subtitle && <p className='text-sm text-gray-500 mt-1'>{subtitle}</p>}
        </div>

        <div className='flex items-center gap-3'>
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                primaryAction.variant === 'secondary'
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-blue-600 text-white shadow-md'
              }`}
            >
              {primaryAction.icon && <primaryAction.icon className='w-5 h-5' />}
              {primaryAction.label}
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className='p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors'
            >
              <secondaryAction.icon className='w-5 h-5 text-gray-600' />
            </button>
          )}
        </div>
      </div>

      {/* Custom children content (search bar, filters, etc.) */}
      {children}
    </div>
  );
}
