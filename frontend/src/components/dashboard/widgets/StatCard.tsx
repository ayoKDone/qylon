import {TrendingUp } from 'lucide-react';

interface StatCardProps {
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  value: string | number;
  label: string;
  subtitle: string;
  subtitleColor: string;
  showTrend?: boolean;
}

export default function StatCard({
  icon: Icon,
  iconColor,
  bgColor,
  value,
  label,
  subtitle,
  subtitleColor,
  showTrend = false,
}: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-2xl p-6 min-w-[240px] relative`}>
      {/* Icon in top right */}
      <div className="flex justify-between items-start mb-8">
        <h3 className="text-sm font-medium text-gray-600">{label}</h3>
        <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2} />
      </div>
      
      {/* Value */}
      <div className="text-4xl font-semibold text-gray-900 mb-2">
        {value}
      </div>
      
      {/* Subtitle with trend */}
      <div className="flex items-center gap-1.5">
        {showTrend && (
          <TrendingUp className={`w-3.5 h-3.5 ${subtitleColor}`} strokeWidth={2} />
        )}
        <span className={`text-xs font-medium ${subtitleColor}`}>
          {subtitle}
        </span>
      </div>
    </div>
  );
}