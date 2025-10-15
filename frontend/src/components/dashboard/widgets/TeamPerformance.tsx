// src/widgets/TeamPerformance.tsx
import { Users } from 'lucide-react';

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
      <div className='flex flex-col items-center justify-center py-8 px-4'>
        <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3'>
          <Users className='w-8 h-8 text-gray-400' />
        </div>
        <p className='text-sm font-medium text-gray-900 mb-1'>No team members yet</p>
        <p className='text-xs text-gray-500 text-center'>
          Team performance data will appear here once members are added
        </p>
      </div>
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