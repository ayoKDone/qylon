// src/widgets/MonthlyStats.tsx
import { BarChart3 } from 'lucide-react';
import { EmptyState } from '@/components/UI/EmptyState';

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
      <EmptyState
        icon={BarChart3}
        title="No stats available"
        message="Monthly statistics will be displayed here once data is available"
      />
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