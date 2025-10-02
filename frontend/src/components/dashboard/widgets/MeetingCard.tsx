// src/components/MeetingCard.tsx
import { Calendar, Eye, Download, Share2, Users } from 'lucide-react';

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

export default function MeetingCard({
  meeting,
  onView,
  onDownload,
  onShare,
}: MeetingCardProps) {
  const platformConfig: Record<string, { color: string; icon: string }> = {
    zoom: {
      color: 'bg-blue-500',
      icon: 'https://cdn.worldvectorlogo.com/logos/zoom-app.svg',
    },
    teams: {
      color: 'bg-purple-500',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/2203px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png',
    },
    meet: {
      color: 'bg-green-500',
      icon: 'https://cdn.iconscout.com/icon/free/png-256/free-google-meet-logo-icon-svg-download-png-2476480.png?f=webp',
    },
    default: {
      color: 'bg-gray-500',
      icon: '/images/default-icon.png',
    },
  };

  const statusConfig = {
    completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
    processing: { color: 'bg-blue-100 text-blue-700', label: 'Processing' },
    failed: { color: 'bg-red-100 text-red-700', label: 'Failed' },
  };
  const platform =
    platformConfig[meeting.platform.toLowerCase()] || platformConfig.default;

  const platformColor =
    platformConfig[meeting.platform.toLowerCase()]?.color ||
    platformConfig['default'].color;
  const status = statusConfig[meeting.status];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-4">
        {/* Time with Vertical Line */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center min-w-[60px]">
            <div className="text-xl font-semibold text-gray-900">
              {meeting.time}
            </div>
            <div className="text-xs text-gray-500">{meeting.endTime}</div>
          </div>
          {/* Vertical Line */}
          <div className={`w-1 ${platformColor} rounded-full`}></div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Status */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-start gap-2 flex-1">
              <Calendar className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <h3 className="text-sm font-medium text-gray-900">
                {meeting.title}
              </h3>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}
            >
              {status.label}
            </span>
          </div>

          {/* Details */}
          <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
            <span>Owner: {meeting.owner}</span>
            <span>Duration: {meeting.duration}</span>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{meeting.participants} participants</span>
            </div>
            <div className="flex items-center gap-1.5">
              {platform.icon ? (
                <img
                  src={platform.icon}
                  alt={meeting.platform}
                  className="w-4 h-4 rounded"
                />
              ) : (
                <div className={`w-2 h-2 rounded-full ${platform.color}`}></div>
              )}
              <span>{meeting.platform}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onView?.(meeting.id)}
              className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors font-medium flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </button>
            <button
              onClick={() => onDownload?.(meeting.id)}
              className="text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors font-medium flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
            <button
              onClick={() => onShare?.(meeting.id)}
              className="text-xs px-3 py-1.5 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors font-medium flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
