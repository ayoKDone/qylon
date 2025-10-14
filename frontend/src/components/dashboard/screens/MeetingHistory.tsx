import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search } from 'lucide-react';
import MeetingList from '../widgets/MeetingList';
import { PiExport } from 'react-icons/pi';
import StatsHeader from '../widgets/StatsHeader';
import UpcomingMeetings from '../widgets/UpcomingMeetings';
import RecentMeetings from '../widgets/RecentMeeting';

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

interface RecentMeeting {
  id: string;
  title: string;
  time: string;
  participants: number;
  date: string;
  status: 'active' | 'completed' | 'scheduled';
  statusColor: 'green' | 'orange' | 'blue';
}

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};

export default function MeetingHistory() {
  const { setNavbar } = useOutletContext<NavbarContext>();
  useEffect(() => {
    setNavbar({
      title: 'Meeting History',
      subtitle: 'Review past meetings and recordings',
    });
  }, [setNavbar]);

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial meetings
    fetchMeetings();
  }, []);

  const upcomingMeetings = [
    { time: '2:00 PM', title: 'Sprint Planning', attendees: 6 },
    { time: '4:30 PM', title: 'Client Review', attendees: 3 },
    { time: 'Tomorrow, 10:00 AM', title: 'Design Critique', attendees: 4 },
  ];

  const recentMeetings: RecentMeeting[] = [
    {
      id: '1',
      title: 'Product Strategy Session',
      time: '48:12',
      participants: 5,
      date: '1/15/2024',
      status: 'completed',
      statusColor: 'green',
    },
    {
      id: '2',
      title: 'Client Onboarding Call',
      time: '32:15',
      participants: 3,
      date: '1/14/2024',
      status: 'completed',
      statusColor: 'orange',
    },
    {
      id: '3',
      title: 'Team Standup',
      time: '16:42',
      participants: 7,
      date: '1/14/2024',
      status: 'active',
      statusColor: 'green',
    },
  ];

  const fetchMeetings = async () => {
    setIsLoading(true);
    // Replace with your API call
    const mockMeetings: Meeting[] = [
      {
        id: '1',
        title: 'Client Onboarding Call - Creative Agency',
        time: '10:00',
        endTime: '10:22',
        date: 'Oct 11, 2025',
        owner: 'Jackson Schlachter',
        duration: '22 min',
        participants: 3,
        platform: 'Zoom',
        status: 'completed',
      },
      {
        id: '2',
        title: 'Product Strategy Meeting',
        time: '14:00',
        endTime: '14:45',
        date: 'Oct 10, 2025',
        owner: 'Sarah M.',
        duration: '45 min',
        participants: 5,
        platform: 'Teams',
        status: 'completed',
      },
      {
        id: '3',
        title: 'Daily CX Sprint',
        time: '03:00',
        endTime: '03:35 PM',
        date: 'TODAY',
        owner: 'Hermes Mallios',
        duration: '35 min',
        participants: 12,
        platform: 'Teams',
        status: 'completed',
      },
      {
        id: '4',
        title: 'Barkbase internal handoff',
        time: '9:00',
        endTime: '9:30 AM',
        date: 'WED, APRIL 22',
        owner: 'Cosmo S.',
        duration: '30 min',
        participants: 6,
        platform: 'Zoom',
        status: 'failed',
      },
      {
        id: '5',
        title: 'Barkbase internal handoff',
        time: '9:00',
        endTime: '9:30 AM',
        date: 'WED, APRIL 22',
        owner: 'Cosmo S.',
        duration: '30 min',
        participants: 6,
        platform: 'Zoom',
        status: 'failed',
      },
      {
        id: '6',
        title: 'Barkbase internal handoff',
        time: '9:00',
        endTime: '9:30 AM',
        date: 'WED, APRIL 22',
        owner: 'Cosmo S.',
        duration: '30 min',
        participants: 6,
        platform: 'Zoom',
        status: 'failed',
      },
    ];

    setMeetings(mockMeetings);
    setIsLoading(false);
  };

  return (
    <div>
      {/* Search and filter section - should stick below the navbar */}
      <div className='xui-d-flex xui-flex-ai-center gap-4 sticky top-0 z-30 pt-3 pb-3 mb-3 bg-white'>
        <div className='flex-1 xui-pos-relative'>
          <Search className='xui-pos-absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
          <input
            type='text'
            placeholder='Search meetings...'
            className='w-full pl-10 pr-4 py-2.5 xui-form-input'
          />
        </div>

        <select className='px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700'>
          <option>All</option>
          <option>This Week</option>
          <option>This Month</option>
          <option>Custom</option>
        </select>
        
        <button className='xui-d-flex xui-flex-ai-center gap-2 px-4 py-2.5 xui-bg-black xui-bdr-rad-half xui-text-white xui-rounded-lg hover:xui-bg-gray-900 transition-colors'>
          <PiExport size={16} /> Export
        </button>
      </div>
      
      {/* Grid layout for content */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6'>
        {/* Meeting List - Left Column */}
        <div className='lg:col-span-8'>
          <MeetingList
            meetings={meetings}
            isLoading={isLoading}
            itemsPerPage={4}
            onCreateMeeting={() => console.log('Create meeting')}
          />
        </div>
        
        {/* Right Sidebar */}
        <div className='lg:col-span-4 flex flex-col gap-4'>
          {/* Your sidebar content here */}
          {/* Upcoming Meetings */}
          <StatsHeader title='Upcoming Meetings'>
            <UpcomingMeetings meetings={upcomingMeetings} />
          </StatsHeader>

          <StatsHeader title='Recent Meetings'>
            <RecentMeetings 
              meetings={recentMeetings}
              onMeetingClick={(id) => console.log('Clicked meeting:', id)}
            />
          </StatsHeader>
        </div>
      </div>
    </div>
  );
}
