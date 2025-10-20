// src/pages/DashboardOverview.tsx
import { ArrowRight, FileInput, Play, Zap } from 'lucide-react';
import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import AIProcessingLive from '../widgets/AIProcessingLive';
import MonthlyStats from '../widgets/MonthlyStats';
import type { Action } from '../widgets/QuickActions';
import QuickActions from '../widgets/QuickActions';
import RecentActivity from '../widgets/RecentActivity';
import StatsGrid from '../widgets/StatsGrid';
import StatsHeader from '../widgets/StatsHeader';
import UpcomingCalendarMeetings from '../widgets/UpcomingCalendarMeetings';
import UpcomingMeetings from '../widgets/UpcomingMeetings';

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};

export default function DashboardOverview() {
  const { setNavbar } = useOutletContext<NavbarContext>();

  const dashboardActions: Action[] = [
    {
      icon: Play,
      label: 'Start Recording',
      description: 'Begin a new meeting session',
      iconColor: 'text-blue-500',
      onClick: () => console.log('Start Recording clicked'),
    },
    {
      icon: Zap,
      label: 'Create Workflow',
      description: 'Automate action items',
      iconColor: 'text-teal-500',
      onClick: () => console.log('Create workflow clicked'),
    },
    {
      icon: FileInput,
      label: 'Generate Content',
      description: 'Create meeting summaries',
      iconColor: 'text-amber-500',
      onClick: () => console.log('Generate content clicked'),
    },
  ];

  interface StatItem {
    label: string;
    value: string;
    color?: string;
  }

  const monthlyStats: StatItem[] = [
    // { label: 'Conversations', value: '127', color: 'text-gray-900' },
    // { label: 'Tasks Created', value: '342', color: 'text-gray-900' },
    // { label: 'Completion Rate', value: '89%', color: 'text-green-600' },
    // { label: 'Time Saved', value: '23.5h', color: 'text-blue-600' },
  ];

  interface upcomingMeetings {
    time: string;
    title: string;
    attendees: number;
  }

  const upcomingMeetingsData: upcomingMeetings[] = [
    { time: '2:00 PM', title: 'Sprint Planning', attendees: 6 },
    { time: '4:30 PM', title: 'Client Review', attendees: 3 },
    { time: 'Tomorrow, 10:00 AM', title: 'Design Critique', attendees: 4 },
  ];

  useEffect(() => {
    setNavbar({
      title: 'Good afternoon, Amaka',
      subtitle: 'AI processing 3 active conversations',
    });
  }, [setNavbar]);

  return (
    <div>
      {/* AI Processing Live Banner */}
      <AIProcessingLive />

      {/* Metrics Cards */}
      <div className='mb-6'>
        <StatsGrid />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-4'>
        {/* Left Column */}
        <div className='lg:col-span-8 flex flex-col gap-4'>
          {/* Recent Activity */}
          <StatsHeader
            title='Recent Meetings'
            rightContent={
              <button className='text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1'>
                View All
                <ArrowRight className='w-4 h-4' />
              </button>
            }
          >
            <RecentActivity />
          </StatsHeader>

          {/* Quick Actions */}
          <StatsHeader title='Quick Actions'>
            <QuickActions actions={dashboardActions} />
          </StatsHeader>
        </div>

        {/* Right Sidebar */}
        <div className='lg:col-span-4 flex flex-col gap-4'>
          {/* This Month Stats */}
          <StatsHeader title='This Month Stats'>
            <MonthlyStats stats={monthlyStats} />
          </StatsHeader>

          {/* Upcoming Calendar Meetings */}
          <StatsHeader>
            <UpcomingCalendarMeetings />
          </StatsHeader>

          {/* Upcoming Meetings */}
          <StatsHeader title='Upcoming Meetings'>
            <UpcomingMeetings meetings={upcomingMeetingsData} />
          </StatsHeader>
        </div>
      </div>
    </div>
  );
}
