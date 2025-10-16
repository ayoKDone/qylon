// src/components/ui/EmptyState.tsx
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: React.ReactNode; // optional button or link
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-8 px-4'>
        <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3'>
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
        <p className='text-sm font-medium text-gray-900 mb-1'>{title}</p>
        <p className='text-xs text-gray-500 text-center'>
          {message}
        </p>
        {action}
    </div>
  );
}
