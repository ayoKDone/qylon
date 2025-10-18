import { FileAudio } from 'lucide-react';
import { EmptyState } from '@/components/UI/EmptyState';

interface Recording {
  meetingTitle: string;
  date: string;
  time: string;
  duration: string;
  fileSize?: string;
  format?: string;
}

interface RawRecordingRetrievalProps {
  limit?: number;
}

// Raw Recording Retrieval Component
export default function RawRecordingRetrieval({ limit }: RawRecordingRetrievalProps = {}) {
  const recordingsData: Recording[] = [
    {
      meetingTitle: 'Client Onboarding Call - Creative Agency',
      date: 'Oct 15, 2025',
      time: '2:30 PM',
      duration: '22:15',
      fileSize: '45 MB',
      format: 'MP3',
    },
    {
      meetingTitle: 'Product Strategy Meeting',
      date: 'Oct 15, 2025',
      time: '9:00 AM',
      duration: '45:30',
      fileSize: '92 MB',
      format: 'WAV',
    },
    {
      meetingTitle: 'Weekly Team Sync',
      date: 'Oct 14, 2025',
      time: '3:00 PM',
      duration: '30:00',
      fileSize: '61 MB',
      format: 'MP3',
    },
  ];

  const recordings = limit ? recordingsData.slice(0, limit) : recordingsData;

  if (!recordings || recordings.length === 0) {
    return (
      <EmptyState
        icon={FileAudio}
        title='No recordings available'
        message='Raw meeting recordings will be displayed here once they are retrieved from recall'
      />
    );
  }

  return (
    <div className='space-y-2'>
      {recordings.map((recording, index) => (
        <div
          key={index}
          className='flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer'
        >
          <div className='flex items-start gap-3 flex-1'>
            <div className='mt-0.5'>
              <FileAudio className='w-5 h-5 text-purple-500' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900'>{recording.meetingTitle}</p>
              <p className='text-xs text-gray-500 mt-0.5'>
                {recording.date} at {recording.time}
              </p>
            </div>
          </div>

          <div className='flex-shrink-0 ml-4 text-right'>
            <p className='text-xs font-medium text-gray-900'>{recording.duration}</p>
            <p className='text-xs text-gray-500 mt-0.5'>{recording.fileSize}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
