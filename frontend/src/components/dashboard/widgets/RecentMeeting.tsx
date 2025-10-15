import { Clock, Users } from 'lucide-react';

interface RecentMeeting {
  id: string;
  title: string;
  time: string;
  participants: number;
  date: string;
  status: 'active' | 'completed' | 'scheduled';
  statusColor: 'green' | 'orange' | 'blue';
}

interface RecentMeetingsProps {
  meetings: RecentMeeting[];
  onMeetingClick?: (id: string) => void;
}

export default function RecentMeetings({ meetings, onMeetingClick }: RecentMeetingsProps) {
  const getStatusColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'orange':
        return 'bg-orange-500';
      case 'blue':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className='space-y-3'>
      {meetings.map(meeting => (
        <button
          key={meeting.id}
          onClick={() => onMeetingClick?.(meeting.id)}
          className='w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200'
        >
          <div className='flex items-start justify-between gap-2'>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-2'>
                <h4 className='text-sm font-medium text-gray-900 truncate'>{meeting.title}</h4>
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(meeting.statusColor)}`}
                />
              </div>

              <div className='flex items-center gap-3 text-xs text-gray-500'>
                <span className='flex items-center gap-1'>
                  <Clock className='w-3 h-3' />
                  {meeting.time}
                </span>
                <span className='flex items-center gap-1'>
                  <Users className='w-3 h-3' />
                  {meeting.participants}
                </span>
              </div>
            </div>

            <span className='text-xs text-gray-400 flex-shrink-0'>{meeting.date}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

// Export the type
export type { RecentMeeting };
