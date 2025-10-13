import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search } from 'lucide-react';
import MeetingList from '../widgets/MeetingList';
import { PiExport } from 'react-icons/pi';

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
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Fetch initial meetings
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setIsLoading(true);
    // Replace with your API call
    const mockMeetings: Meeting[] = [
      {
        id: '1',
        title: 'K9Tech <> Doodle Co. kickoff session',
        time: '12:00',
        endTime: '01:00 PM',
        date: 'TODAY',
        owner: 'Jackson Schlachter',
        duration: '60 min',
        participants: 8,
        platform: 'Zoom',
        status: 'completed',
      },
      {
        id: '2',
        title: 'K9Tech office hours',
        time: '01:45',
        endTime: '02:30 PM',
        date: 'TODAY',
        owner: 'Jackson Schlachter',
        duration: '45 min',
        participants: 5,
        platform: 'Meet',
        status: 'processing',
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
    ];

    setMeetings(mockMeetings);
    setIsLoading(false);
    setHasMore(false); // Set to true if there are more meetings to load
  };

  return (
    <div>
      {/* Search and filter as children */}
      <div className='xui-d-flex xui-flex-ai-center gap-4 sticky top-0 z-30 pb-3 mb-3 bg-white'>
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
        <div>
          <button className='xui-d-flex xui-flex-ai-center gap-2 px-4 py-2.5 xui-bg-black xui-bdr-rad-half xui-text-white xui-rounded-lg hover:xui-bg-gray-900 transition-colors'>
            <PiExport size={16} /> Export
          </button>
        </div>
      </div>
      <div className='mt-6'>
        <MeetingList
          meetings={meetings}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={fetchMeetings}
          onCreateMeeting={() => console.log('Create meeting')}
        />
      </div>
    </div>
  );
}
