// src/widgets/MonthlyStats.tsx

interface StatItem {
  label: string;
  value: string | number;
  color?: string;
}

interface MonthlyStatsProps {
  stats: StatItem[];
}

export default function MonthlyStats({ stats }: MonthlyStatsProps) {
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
