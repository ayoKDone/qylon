import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/UI/EmptyState';

interface Transcript {
  meetingTitle: string;
  date: string;
  time: string;
  wordCount?: number;
  language?: string;
}

interface TranscriptRetrievalProps {
  limit?: number;
}

// Transcript Retrieval Component
export default function TranscriptRetrieval({ limit }: TranscriptRetrievalProps = {}) {
  const transcriptsData: Transcript[] = [
    {
      meetingTitle: 'Client Onboarding Call - Creative Agency',
      date: 'Oct 15, 2025',
      time: '2:30 PM',
      wordCount: 3240,
      language: 'English',
    },
    {
      meetingTitle: 'Product Strategy Meeting',
      date: 'Oct 15, 2025',
      time: '9:00 AM',
      wordCount: 5680,
      language: 'English',
    },
    {
      meetingTitle: 'Weekly Team Sync',
      date: 'Oct 14, 2025',
      time: '3:00 PM',
      wordCount: 2100,
      language: 'English',
    },
  ];

  const transcripts = limit ? transcriptsData.slice(0, limit) : transcriptsData;

  if (!transcripts || transcripts.length === 0) {
    return (
        <EmptyState
            icon={FileText}
            title="No transcripts available"
            message="Meeting transcripts will be displayed here once they are retrieved from recall"
        />
    );
  }

  return (
    <div className='space-y-2'>
      {transcripts.map((transcript, index) => (
        <div
          key={index}
          className='flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer'
        >
          <div className='flex items-start gap-3 flex-1'>
            <div className='mt-0.5'>
              <FileText className='w-5 h-5 text-blue-500' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900'>{transcript.meetingTitle}</p>
              <p className='text-xs text-gray-500 mt-0.5'>
                {transcript.date} at {transcript.time}
              </p>
            </div>
          </div>

          <div className='flex-shrink-0 ml-4 text-right'>
            <p className='text-xs font-medium text-gray-900'>{transcript.language}</p>
            <p className='text-xs text-gray-500 mt-0.5'>{transcript.wordCount?.toLocaleString()} words</p>
          </div>
        </div>
      ))}
    </div>
  );
}