import { ExternalLink, Plus, Search } from 'lucide-react';
import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import SectionHeader from '../widgets/SectionHeader';
import TaskStats from '../widgets/TaskStats';
import TasksLists from '../widgets/TasksList';

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};

export default function ActionItems() {
  const { setNavbar } = useOutletContext<NavbarContext>();

  useEffect(() => {
    setNavbar({
      title: 'Tasks',
      subtitle: 'View and manage your action items',
    });
  }, [setNavbar]);
  return (
    <div>
      <SectionHeader
        title="Action Items"
        subtitle="4 tasks • 1 completed"
        primaryAction={{
          label: 'Add Task',
          icon: Plus,
          onClick: () => console.log('Add task'),
        }}
        secondaryAction={{
          icon: ExternalLink,
          onClick: () => console.log('External link'),
        }}
      >
        {/* Search and filter as children */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks, assignees, or meetings..."
              className="w-full pl-10 pr-4 py-2.5 xui-form-input"
            />
          </div>

          <select className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700">
            <option>All Status</option>
            <option>Pending</option>
            <option>Completed</option>
            <option>In Progress</option>
          </select>
        </div>
      </SectionHeader>

      <div className="mt-6">
        <TaskStats />
      </div>

      {/* Your content here */}
      <div className="mt-6">
        <TasksLists />
      </div>
    </div>
  );
}
