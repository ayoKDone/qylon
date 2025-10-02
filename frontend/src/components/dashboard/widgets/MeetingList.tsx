// src/components/MeetingList.tsx
import { useState } from 'react';
import MeetingCard from './MeetingCard';
import { Plus, Loader2, Video } from 'lucide-react';

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

interface MeetingListProps {
  meetings?: Meeting[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onCreateMeeting?: () => void;
}

export default function MeetingList({
  meetings = [],
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onCreateMeeting,
}: MeetingListProps) {
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await onLoadMore?.();
    setLoadingMore(false);
  };

  // Group meetings by date
  const groupedMeetings = meetings.reduce(
    (acc, meeting) => {
      if (!acc[meeting.date]) {
        acc[meeting.date] = [];
      }
      acc[meeting.date].push(meeting);
      return acc;
    },
    {} as Record<string, Meeting[]>
  );

  // Empty State
  if (!isLoading && meetings.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No meetings yet
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by creating your first meeting or uploading a recording.
          </p>
          <button
            onClick={onCreateMeeting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            Create Meeting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Meeting Cards Grouped by Date */}
          {Object.entries(groupedMeetings).map(([date, dateMeetings]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {date}
              </h3>
              <div className="space-y-2">
                {dateMeetings.map(meeting => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onView={id => console.log('View:', id)}
                    onDownload={id => console.log('Download:', id)}
                    onShare={id => console.log('Share:', id)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
