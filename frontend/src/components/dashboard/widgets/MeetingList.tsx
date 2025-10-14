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
  itemsPerPage?: number;
  onCreateMeeting?: () => void;
}

export default function MeetingList({
  meetings = [],
  isLoading = false,
  itemsPerPage = 4,
  onCreateMeeting,
}: MeetingListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(meetings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMeetings = meetings.slice(startIndex, endIndex);

  // Group meetings by date
  const groupedMeetings = currentMeetings.reduce(
    (acc, meeting) => {
      if (!acc[meeting.date]) {
        acc[meeting.date] = [];
      }
      acc[meeting.date].push(meeting);
      return acc;
    },
    {} as Record<string, Meeting[]>,
  );

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    
    return pages;
  };

  // Empty State
  if (!isLoading && meetings.length === 0) {
    return (
      <div className='bg-white rounded-lg border border-gray-200 p-12 text-center'>
        <div className='max-w-md mx-auto'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Video className='w-8 h-8 text-gray-400' />
          </div>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>No meetings yet</h3>
          <p className='text-gray-500 mb-6'>
            Get started by creating your first meeting or uploading a recording.
          </p>
          <button
            onClick={onCreateMeeting}
            className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md'
          >
            <Plus className='w-5 h-5' />
            Create Meeting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Loading State */}
      {isLoading ? (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='w-8 h-8 text-blue-500 animate-spin' />
        </div>
      ) : (
        <>
          {/* Meeting Cards Grouped by Date */}
          {Object.entries(groupedMeetings).map(([date, dateMeetings]) => (
            <div key={date}>
              <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3'>
                {date}
              </h3>
              <div className='space-y-2'>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-center gap-2 pt-4'>
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white'
              >
                Previous
              </button>
              
              {getPageNumbers().map((page, index) => (
                typeof page === 'number' ? (
                  <button
                    key={index}
                    onClick={() => handlePageClick(page)}
                    className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={index} className='px-2 text-gray-500'>
                    {page}
                  </span>
                )
              ))}
              
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white'
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}