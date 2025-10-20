import { ArrowRight, Filter, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import BulkActions from '../widgets/BulkActions';
import RawRecordingRetrieval from '../widgets/RawRecordingRetrieval';
import StatsHeader from '../widgets/StatsHeader';
import TaskStats from '../widgets/TaskStats';
import TasksList from '../widgets/TasksList';
import TranscriptRetrieval from '../widgets/TranscriptRetrieval';

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};

interface Task {
  id: string;
  description: string;
  assignedTo: { name: string; avatar: string };
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  completed: boolean;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  title: string;
  assignee: string;
  date: string;
  meeting: string;
  tags: string[];
}

interface upcomingMeetings {
  time: string;
  title: string;
}

interface RecentMeeting {
  id: string;
  time: string;
  title: string;
  participants: number;
  date: string;
  status: string;
  statusColor: string;
}

export default function ActionItems() {
  const { setNavbar } = useOutletContext<NavbarContext>();
  const [selectAll, setSelectAll] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const _upcomingMeetingsData: upcomingMeetings[] = [
    // { time: '2:00 PM', title: 'Sprint Planning', attendees: 6 },
    // { time: '4:30 PM', title: 'Client Review', attendees: 3 },
    // { time: 'Tomorrow, 10:00 AM', title: 'Design Critique', attendees: 4 },
  ];

  const _recentMeetingsData: RecentMeeting[] = [
    // {
    //   id: '1',
    //   title: 'Product Strategy Session',
    //   time: '48:12',
    //   participants: 5,
    //   date: '1/15/2024',
    //   status: 'completed',
    //   statusColor: 'green',
    // },
    // {
    //   id: '2',
    //   title: 'Client Onboarding Call',
    //   time: '32:15',
    //   participants: 3,
    //   date: '1/14/2024',
    //   status: 'completed',
    //   statusColor: 'orange',
    // },
    // {
    //   id: '3',
    //   title: 'Team Standup',
    //   time: '16:42',
    //   participants: 7,
    //   date: '1/14/2024',
    //   status: 'active',
    //   statusColor: 'green',
    // },
  ];

  const [tasks, setTasks] = useState<Task[]>([
    // {
    //   id: '1',
    //   title: 'Review Q4 marketing strategy',
    //   description: 'Review Q4 marketing strategy and prepare presentation for stakeholders',
    //   assignee: 'Sarah Chen',
    //   assignedTo: { name: 'Sarah Chen', avatar: 'SC' },
    //   priority: 'high',
    //   dueDate: 'Oct 10, 2025',
    //   date: 'Oct 10, 2025',
    //   meeting: 'Product Strategy Session',
    //   tags: ['#marketing', '#strategy'],
    //   completed: false,
    //   status: 'pending',
    // },
    // {
    //   id: '2',
    //   title: 'Update project documentation',
    //   description: 'Update project documentation with new API endpoints',
    //   assignee: 'John Davis',
    //   assignedTo: { name: 'John Davis', avatar: 'JD' },
    //   priority: 'medium',
    //   dueDate: 'Oct 12, 2025',
    //   date: 'Oct 12, 2025',
    //   meeting: 'Development Meeting',
    //   tags: ['#documentation', '#api'],
    //   completed: false,
    //   status: 'in-progress',
    // },
    // {
    //   id: '3',
    //   title: 'Schedule follow-up meeting',
    //   description: 'Schedule follow-up meeting with client regarding feedback',
    //   assignee: 'Maria Garcia',
    //   assignedTo: { name: 'Maria Garcia', avatar: 'MG' },
    //   priority: 'high',
    //   dueDate: 'Oct 09, 2025',
    //   date: 'Oct 09, 2025',
    //   meeting: 'Client Call',
    //   tags: ['#client', '#follow-up'],
    //   completed: false,
    //   status: 'overdue',
    // },
    // {
    //   id: '4',
    //   title: 'Code review for authentication',
    //   description: 'Conduct code review for authentication module',
    //   assignee: 'Alex Kumar',
    //   assignedTo: { name: 'Alex Kumar', avatar: 'AK' },
    //   priority: 'medium',
    //   dueDate: 'Oct 15, 2025',
    //   date: 'Oct 15, 2025',
    //   meeting: 'Tech Review',
    //   tags: ['#code-review', '#security'],
    //   completed: true,
    //   status: 'completed',
    // },
    // {
    //   id: '5',
    //   title: 'Prepare quarterly budget report',
    //   description: 'Prepare quarterly budget report for finance team',
    //   assignee: 'Emily White',
    //   assignedTo: { name: 'Emily White', avatar: 'EW' },
    //   priority: 'low',
    //   dueDate: 'Oct 20, 2025',
    //   date: 'Oct 20, 2025',
    //   meeting: 'Finance Meeting',
    //   tags: ['#budget', '#finance'],
    //   completed: false,
    //   status: 'pending',
    // },
    // {
    //   id: '6',
    //   title: 'Test new feature deployment',
    //   description: 'Test new feature deployment on staging environment',
    //   assignee: 'Tom Brown',
    //   assignedTo: { name: 'Tom Brown', avatar: 'TB' },
    //   priority: 'high',
    //   dueDate: 'Oct 11, 2025',
    //   date: 'Oct 11, 2025',
    //   meeting: 'QA Session',
    //   tags: ['#testing', '#deployment'],
    //   completed: false,
    //   status: 'in-progress',
    // },
  ]);

  useEffect(() => {
    setNavbar({
      title: 'Tasks',
      subtitle: 'View and manage your action items',
    });
  }, [setNavbar]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(t => t.id));
    }
    setSelectAll(!selectAll);
  };

  const handleMarkSelectedComplete = () => {
    const allSelectedAreCompleted = selectedTasks.every(
      id => tasks.find(task => task.id === id)?.status === 'completed',
    );

    setTasks(
      tasks.map(task =>
        selectedTasks.includes(task.id)
          ? {
              ...task,
              completed: !allSelectedAreCompleted,
              status: allSelectedAreCompleted ? 'pending' : 'completed',
            }
          : task,
      ),
    );
    setSelectedTasks([]);
    setSelectAll(false);
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed, status: completed ? 'completed' : 'pending' } : task,
      ),
    );
  };

  // Filter and search tasks
  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;

    // Priority filter
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate task statistics based on filtered tasks
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => task.status === 'completed').length;
  const overdueTasks = filteredTasks.filter(task => task.status === 'overdue').length;
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress').length;

  // Check if all selected tasks are completed
  const allSelectedCompleted =
    selectedTasks.length > 0 &&
    selectedTasks.every(id => tasks.find(task => task.id === id)?.status === 'completed');

  const handleExportTasks = () => {
    console.log('Exporting tasks:', selectedTasks);
    alert('Exporting selected tasks to PM tool...');
  };

  const handleCancelSelection = () => {
    setSelectedTasks([]);
    setSelectAll(false);
  };

  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
      {/* Main Content - Left Column */}
      <div className='lg:col-span-8'>
        {/* Header */}
        <div className='xui-d-flex xui-flex-ai-center xui-flex-jc-space-between mb-6'>
          <h2 className='text-xl text-gray-900'>Action Items ({filteredTasks.length})</h2>
          <div className='xui-d-flex gap-3'>
            <div className='relative'>
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`p-2 rounded-lg transition-colors ${showFilter ? 'bg-blue-100 text-blue-950' : 'hover:bg-gray-100'}`}
              >
                <Filter className='w-5 h-5' />
              </button>

              {showFilter && (
                <div className='absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10'>
                  <h3 className='font-semibold text-sm text-gray-900 mb-3'>Filter Tasks</h3>

                  <div className='mb-4'>
                    <label className='block text-xs font-medium text-gray-700 mb-2'>Status</label>
                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-950'
                    >
                      <option value='all'>All Status</option>
                      <option value='pending'>Pending</option>
                      <option value='in-progress'>In Progress</option>
                      <option value='completed'>Completed</option>
                      <option value='overdue'>Overdue</option>
                    </select>
                  </div>

                  <div className='mb-4'>
                    <label className='block text-xs font-medium text-gray-700 mb-2'>Priority</label>
                    <select
                      value={filterPriority}
                      onChange={e => setFilterPriority(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-950'
                    >
                      <option value='all'>All Priorities</option>
                      <option value='high'>High</option>
                      <option value='medium'>Medium</option>
                      <option value='low'>Low</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setFilterStatus('all');
                      setFilterPriority('all');
                    }}
                    className='w-full px-3 py-2 text-sm text-blue-950 hover:bg-blue-50 rounded-lg transition-colors'
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-lg transition-colors ${showSearch ? 'bg-blue-100 text-blue-950' : 'hover:bg-gray-100'}`}
            >
              <Search className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className='mb-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
              <input
                type='text'
                placeholder='Search tasks by title, description, assignee, or tags...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent'
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Task Stats */}
        <div className='mb-6'>
          <TaskStats
            totalTasks={totalTasks}
            completedTasks={completedTasks}
            overdueTasks={overdueTasks}
            inProgressTasks={inProgressTasks}
          />
        </div>

        {/* Bulk Actions */}
        <BulkActions
          selectedCount={selectedTasks.length}
          onMarkComplete={handleMarkSelectedComplete}
          onExport={handleExportTasks}
          onCancel={handleCancelSelection}
          allSelectedCompleted={allSelectedCompleted}
        />

        {/* Select All */}
        <div className='mb-4 xui-d-flex xui-flex-ai-center xui-flex-jc-space-between pb-4 px-3'>
          <div className='xui-d-flex xui-flex-ai-center gap-3'>
            <button
              onClick={handleSelectAll}
              className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                selectAll ? 'bg-blue-950 border-blue-950' : 'border-gray-300 hover:border-blue-950'
              }`}
            >
              {selectAll && (
                <svg
                  className='w-3 h-3 text-white'
                  fill='none'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path d='M5 13l4 4L19 7'></path>
                </svg>
              )}
            </button>
            <label
              onClick={handleSelectAll}
              className='text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 transition-colors'
            >
              Select All Tasks
            </label>
          </div>
          {selectedTasks.length > 0 && (
            <span className='text-sm text-blue-950 font-medium'>
              {selectedTasks.length} of {filteredTasks.length} selected
            </span>
          )}
        </div>

        {/* Tasks List */}
        <div className='mt-6'>
          <TasksList tasks={filteredTasks} onToggleComplete={handleToggleComplete} />
        </div>
      </div>

      {/* Right Sidebar - Right Column */}
      <div className='lg:col-span-4 flex flex-col gap-4'>
        {/* Raw Recording Retrieval */}
        <StatsHeader
          title='Raw Recording Retrieval'
          rightContent={
            <button className='text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1'>
              <ArrowRight className='w-4 h-4' />
            </button>
          }
        >
          <RawRecordingRetrieval limit={3} />
        </StatsHeader>

        {/* Transcription Retrieval */}
        <StatsHeader
          title='Transcription Retrieval'
          rightContent={
            <button className='text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1'>
              <ArrowRight className='w-4 h-4' />
            </button>
          }
        >
          <TranscriptRetrieval limit={3} />
        </StatsHeader>
      </div>
    </div>
  );
}
