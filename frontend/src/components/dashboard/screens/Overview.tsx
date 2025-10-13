// src/pages/DashboardOverview.tsx
import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Headphones, Smartphone, Monitor } from 'lucide-react';
import StatsHeader from '../widgets/StatsHeader';
import QuickActions from '../widgets/QuickActions';
import RecentActivity from '../widgets/RecentActivity';
import StatsGrid from '../widgets/StatsGrid';
import AIProcessingLive from '../widgets/AIProcessingLive';
import MonthlyStats from '../widgets/MonthlyStats';
import TeamPerformance from '../widgets/TeamPerformance';
import UpcomingMeetings from '../widgets/UpcomingMeetings';
import { Play, Zap, FileInput } from 'lucide-react';
import type { Action } from '../widgets/QuickActions';

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};

export default function DashboardOverview() {
  const { setNavbar } = useOutletContext<NavbarContext>();

  const dashboardActions: Action[] = [
    {
      icon: Play,
      label: 'Start Recording',
      iconColor: 'text-blue-500',
      onClick: () => console.log('Start Recording clicked'),
    },
    {
      icon: Zap,
      label: 'Create workflow',
      iconColor: 'text-teal-500',
      onClick: () => console.log('Create workflow clicked'),
    },
    {
      icon: FileInput,
      label: 'Generate content',
      iconColor: 'text-amber-500',
      onClick: () => console.log('Generate content clicked'),
    },
  ];

  const monthlyStats = [
    { label: 'Conversations', value: '127', color: 'text-gray-900' },
    { label: 'Tasks Created', value: '342', color: 'text-gray-900' },
    { label: 'Completion Rate', value: '89%', color: 'text-green-600' },
    { label: 'Time Saved', value: '23.5h', color: 'text-blue-600' },
  ];

  const teamMembers = [
    { name: 'AK', performance: 92, color: 'bg-blue-500' },
    { name: 'JD', performance: 87, color: 'bg-green-500' },
    { name: 'SM', performance: 95, color: 'bg-purple-500' },
    { name: 'TL', performance: 84, color: 'bg-orange-500' },
    { name: 'RK', performance: 90, color: 'bg-pink-500' },
    { name: 'MN', performance: 88, color: 'bg-teal-500' },
  ];

  const upcomingMeetings = [
    { time: '10:00 AM', title: 'Team Standup', duration: '30 min' },
    { time: '2:00 PM', title: 'Client Review', duration: '1 hour' },
    { time: '4:30 PM', title: 'Sprint Planning', duration: '45 min' },
  ];

  useEffect(() => {
    setNavbar({
      title: 'Good afternoon, Amaka',
      subtitle: 'AI processing 3 active conversations',
    });
  }, [setNavbar]);

  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 gap-4'>
      {/* Main Content Area */}
      <div className='lg:col-span-8'>
        <StatsHeader
          title='AI Processing Status'
          rightContent={
            <div className='xui-d-flex xui-flex-ai-center gap-3'>
              <Monitor className='w-5 h-5 text-gray-600' />
              <Smartphone className='w-5 h-5 text-gray-600' />
              <Headphones className='w-5 h-5 text-gray-600' />
            </div>
          }
        >
          {/* Metrics Cards */}
          <div className='mb-6'>
            <StatsGrid />
          </div>

          {/* Performance Trends */}
          <div className='mb-6'>
            <AIProcessingLive />
          </div>
        </StatsHeader>
        {/* Recent Meetings */}`
        <div className='mt-2'>
          <StatsHeader title='Recent Activity'>
            <RecentActivity />
          </StatsHeader>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className='lg:col-span-4 xui-d-flex flex-col gap-4'>
        {/* This Month Stats */}
        <StatsHeader title='This Month Stats'>
          <MonthlyStats stats={monthlyStats} />
        </StatsHeader>

        {/* Team Performance */}
        <StatsHeader title='Team Performance'>
          <TeamPerformance members={teamMembers} />
        </StatsHeader>

        {/* Upcoming Meetings */}
        <StatsHeader title='Upcoming Meetings'>
          <UpcomingMeetings meetings={upcomingMeetings} />
        </StatsHeader>

        {/* Quick Actions */}
        <StatsHeader title='Quick Actions'>
          <QuickActions actions={dashboardActions} />
        </StatsHeader>
      </div>
    </div>
  );
}
