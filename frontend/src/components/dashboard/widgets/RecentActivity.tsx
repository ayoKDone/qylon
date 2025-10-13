// src/components/RecentActivity.tsx
export default function RecentActivity() {
  const recentMeetings = [
    {
      title: 'Product Strategy Review',
      subtitle: 'Product Team • 45 min',
      time: '2 hours ago',
      status: 'completed',
    },
    {
      title: 'Client Onboarding Call',
      subtitle: 'Sales Team • 30 min',
      time: '5 hours ago',
      status: 'completed',
    },
    {
      title: 'Sprint Planning Session',
      subtitle: 'Engineering Team • 1 hour',
      time: 'Yesterday',
      status: 'completed',
    },
    {
      title: 'Design System Workshop',
      subtitle: 'Design Team • 2 hours',
      time: 'Yesterday',
      status: 'completed',
    },
    {
      title: 'Quarterly Business Review',
      subtitle: 'Leadership Team • 1.5 hours',
      time: '2 days ago',
      status: 'completed',
    },
  ];

  return (
    <div className='space-y-3'>
      {recentMeetings.map((meeting, index) => (
        <div
          key={index}
          className='xui-d-flex xui-flex-ai-flex-start xui-flex-jc-space-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer'
        >
          <div className='flex-1'>
            <p className='text-gray-800 font-medium text-sm'>{meeting.title}</p>
            <p className='text-gray-500 text-xs mt-0.5'>{meeting.subtitle}</p>
          </div>

          <div className='flex-shrink-0 ml-4 text-right'>
            <span className='text-blue-500 text-xs font-medium block'>{meeting.time}</span>
            <span className='text-green-600 text-xs mt-1 block'>{meeting.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
