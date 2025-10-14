// src/components/MeetingCard.tsx
import { Video, Users, Eye, MoreVertical } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  time: string;
  endTime: string;
  date: string;
  owner: string;
  duration: string;
  participants: number;
  platform: string;
  status: 'completed' | 'processing' | 'failed';
}

interface MeetingCardProps {
  meeting: Meeting;
  onView?: (id: string) => void;
  onDownload?: (id: string) => void;
  onShare?: (id: string) => void;
}

export default function MeetingCard({ meeting, onView }: MeetingCardProps) {
  const platformConfig: Record<string, { color: string; bgColor: string }> = {
    zoom: { color: 'text-blue-600', bgColor: 'bg-blue-50' },
    teams: { color: 'text-purple-600', bgColor: 'bg-purple-50' },
    meet: { color: 'text-green-600', bgColor: 'bg-green-50' },
    default: { color: 'text-gray-600', bgColor: 'bg-gray-50' },
  };

  const statusConfig = {
    completed: { color: 'bg-black text-white', label: 'completed' },
    processing: { color: 'bg-blue-100 text-blue-700', label: 'processing' },
    failed: { color: 'bg-red-100 text-red-700', label: 'failed' },
  };

  const platform = platformConfig[meeting.platform.toLowerCase()] || platformConfig.default;
  const status = statusConfig[meeting.status];

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
      <div className='flex items-start gap-4'>
        {/* Icon */}
        <div
          className={`w-12 h-12 ${platform.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
        >
          <Video className={`w-6 h-6 ${platform.color}`} />
        </div>

        {/* Content */}
        <div className='flex-1 min-w-0'>
          {/* Title and Status */}
          <div className='flex items-start justify-between gap-3 mb-2'>
            <div className='flex items-center gap-2 flex-1 min-w-0'>
              <h3 className='text-base font-medium text-gray-900 truncate'>{meeting.title}</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded ${status.color} whitespace-nowrap flex-shrink-0`}
              >
                {status.label}
              </span>
            </div>
            <div className='flex items-center gap-2 flex-shrink-0'>
              <button
                onClick={() => onView?.(meeting.id)}
                className='flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors'
              >
                <Eye className='w-4 h-4' />
                View
              </button>
              <button className='p-1.5 hover:bg-gray-100 rounded-md transition-colors'>
                <MoreVertical className='w-4 h-4 text-gray-600' />
              </button>
            </div>
          </div>

          {/* Details */}
          <div className='flex items-center gap-3 text-sm text-gray-600'>
            <span>{meeting.date}</span>
            <span>•</span>
            <span>{meeting.duration}</span>
            <span>•</span>
            <div className='flex items-center gap-1'>
              <Users className='w-3.5 h-3.5' />
              <span>{meeting.participants} participants</span>
            </div>
            <span>•</span>
            <span>{meeting.platform}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
