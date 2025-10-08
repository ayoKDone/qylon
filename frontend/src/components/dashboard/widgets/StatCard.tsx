// src/components/StatCard.tsx
import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  value: string | number;
  label: string;
  subtitle: string;
  subtitleColor: string;
  trendIcon?: boolean;
  isAnimating?: boolean;
}

export default function StatCard({
  icon: Icon,
  iconColor,
  value,
  label,
  subtitle,
  subtitleColor,
  trendIcon = false,
  isAnimating = false,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);

  // Animate value changes
  useEffect(() => {
    if (displayValue !== value) {
      setIsUpdating(true);
      setDisplayValue(value);

      const timer = setTimeout(() => {
        setIsUpdating(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  return (
    <div
      className={`bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all duration-300 ${
        isUpdating ? 'ring-2 ring-blue-400 ' : ''
      }`}
    >
      <div className='xui-d-flex xui-flex-ai-flex-end xui-flex-jc-space-between mb-4'>
        <div className={`${isAnimating ? 'animate-pulse' : ''}`}>
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
        {trendIcon && (
          <svg
            className='w-5 h-5 text-green-500 animate-bounce'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
            />
          </svg>
        )}
      </div>

      <div
        className={`text-4xl font-bold text-gray-800 mb-1 transition-all duration-300 ${
          isUpdating ? 'scale-110' : ''
        }`}
      >
        {displayValue}
      </div>
      <div className='text-sm text-gray-600 mb-2'>{label}</div>
      <div className={`text-xs font-medium ${subtitleColor}`}>{subtitle}</div>
    </div>
  );
}
