// src/widgets/TeamPerformance.tsx
import { Users } from 'lucide-react';
import { EmptyState } from '@/components/UI/EmptyState';

interface TeamMember {
  name: string;
  performance: number;
  color: string;
  tasks: number;
}

interface TeamPerformanceProps {
  members: TeamMember[];
}

export default function TeamPerformance({ members }: TeamPerformanceProps) {
  if (!members || members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No team members yet"
        message="Team performance data will appear here once members are added"
      />
    );
  }

  return (
    <div className='space-y-3'>
      {members.map((member, idx) => (
        <div key={idx} className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center text-white font-semibold text-sm`}
            >
              {member.name.charAt(0)}
            </div>
            <div>
              <p className='font-medium text-sm text-gray-900'>
                {member.name.split(' ')[0]} {member.name.split(' ')[1]?.[0]}.
              </p>
              <p className='text-xs text-gray-500'>{member.tasks} tasks</p>
            </div>
          </div>
          <span className='text-sm font-semibold text-gray-700'>{member.performance}%</span>
        </div>
      ))}
    </div>
  );
}