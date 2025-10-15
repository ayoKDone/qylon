// src/widgets/RecentActivity.tsx
import { MessageSquare } from 'lucide-react';

interface Meeting {
  title: string;
  time: string;
  duration: string;
  participants: number;
  score?: string;
  status?: 'processing' | 'completed';
}

export default function RecentActivity() {
  const recentMeetings: Meeting[] = [
    // {
    //   title: 'Client Onboarding Call - Creative Agency',
    //   time: '2 hours ago',
    //   duration: '22:15',
    //   participants: 3,
    //   score: '8.5/10',
    //   status: 'completed',
    // },
    // {
    //   title: 'Product Strategy Meeting',
    //   time: '5 hours ago',
    //   duration: '45:30',
    //   participants: 5,
    //   score: '9.2/10',
    //   status: 'completed',
    // },
    // {
    //   title: 'Weekly Team Sync',
    //   time: 'Yesterday',
    //   duration: '30:00',
    //   participants: 8,
    //   score: '7.8/10',
    //   status: 'completed',
    // },
    // {
    //   title: 'Investor Presentation Prep',
    //   time: '2 days ago',
    //   duration: '1:15:00',
    //   participants: 4,
    //   status: 'processing',
    // },
    // {
    //   title: 'Customer Feedback Session',
    //   time: '3 days ago',
    //   duration: '38:20',
    //   participants: 2,
    //   score: '8.9/10',
    //   status: 'completed',
    // },
  ];

  if (!recentMeetings || recentMeetings.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 px-4'>
        <div className='w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
          <MessageSquare className='w-10 h-10 text-gray-400' />
        </div>
        <p className='text-base font-medium text-gray-900 mb-2'>No recent meetings</p>
        <p className='text-sm text-gray-500 text-center max-w-xs'>
          Your recent meeting activity will be displayed here once you start recording sessions
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      {recentMeetings.map((meeting, index) => (
        <div
          key={index}
          className='flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer'
        >
          <div className='flex items-start gap-3 flex-1'>
            <div className='mt-0.5'>
              <MessageSquare className='w-5 h-5 text-blue-500' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900'>{meeting.title}</p>
              <p className='text-xs text-gray-500 mt-0.5'>
                {meeting.time} • {meeting.duration} • {meeting.participants} participants
              </p>
            </div>
          </div>

          <div className='flex-shrink-0 ml-4'>
            {meeting.status === 'processing' ? (
              <span className='inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700'>
                Processing
              </span>
            ) : (
              <span className='inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-green-600 text-white'>
                {meeting.score}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}