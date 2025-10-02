// src/components/TaskStats.tsx
import { Target, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StatItem {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  label: string;
  value: number;
}

interface TaskStatsProps {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
}

export default function TaskStats({
  totalTasks = 0,
  completedTasks = 0,
  overdueTasks = 0,
  inProgressTasks = 0,
}: TaskStatsProps) {
  const stats: StatItem[] = [
    {
      icon: Target,
      iconColor: 'text-cyan-500',
      iconBgColor: 'bg-cyan-50',
      label: 'Total Tasks',
      value: totalTasks,
    },
    {
      icon: CheckCircle2,
      iconColor: 'text-green-500',
      iconBgColor: 'bg-green-50',
      label: 'Completed',
      value: completedTasks,
    },
    {
      icon: AlertCircle,
      iconColor: 'text-red-500',
      iconBgColor: 'bg-red-50',
      label: 'Overdue',
      value: overdueTasks,
    },
    {
      icon: Clock,
      iconColor: 'text-amber-500',
      iconBgColor: 'bg-amber-50',
      label: 'In Progress',
      value: inProgressTasks,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white xui-bdr-rad-2 p-6 border border-gray-200"
          >
            <div className="xui-d-flex xui-flex-ai-flex-start xui-flex-jc-space-between mb-3">
              <div
                className={`w-10 h-10 rounded-full ${stat.iconBgColor} xui-d-flex xui-flex-ai-center xui-flex-jc-center`}
              >
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
