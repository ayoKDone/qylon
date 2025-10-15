// src/widgets/MonthlyStats.tsx
import { BarChart3 } from 'lucide-react';

interface StatItem {
  label: string;
  value: string | number;
  color?: string;
}

interface MonthlyStatsProps {
  stats: StatItem[];
}

export default function MonthlyStats({ stats }: MonthlyStatsProps) {
  if (!stats || stats.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-8 px-4'>
        <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3'>
          <BarChart3 className='w-8 h-8 text-gray-400' />
        </div>
        <p className='text-sm font-medium text-gray-900 mb-1'>No stats available</p>
        <p className='text-xs text-gray-500 text-center'>
          Monthly statistics will be displayed here once data is available
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {stats.map((stat, idx) => (
        <div key={idx} className='flex justify-between items-center'>
          <span className='text-sm text-gray-600'>{stat.label}</span>
          <span className={`text-lg font-semibold ${stat.color || 'text-gray-900'}`}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}