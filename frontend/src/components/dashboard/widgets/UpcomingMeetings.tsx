// src/widgets/UpcomingMeetings.tsx
import { Calendar, Users } from 'lucide-react';
import { EmptyState } from '@/components/UI/EmptyState';
interface Meeting {
  time: string;
  title: string;
  attendees: number;
}

interface UpcomingMeetingsProps {
  meetings: Meeting[];
}

export default function UpcomingMeetings({ meetings }: UpcomingMeetingsProps) {
  if (!meetings || meetings.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title='No upcoming meetings'
        message='Your scheduled meetings will appear here'
      />
    );
  }

  return (
    <div className='space-y-3'>
      {meetings.map((meeting, idx) => (
        <div key={idx} className='flex items-center justify-between py-2'>
          <div className='flex items-center gap-3'>
            <Calendar className='w-5 h-5 text-blue-500' />
            <div>
              <div className='text-sm font-medium text-gray-900'>{meeting.title}</div>
              <div className='text-xs text-gray-500'>{meeting.time}</div>
            </div>
          </div>
          <div className='flex items-center gap-1 text-xs text-gray-500'>
            <Users className='w-3.5 h-3.5' />
            <span>{meeting.attendees}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
