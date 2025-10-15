// src/widgets/TasksList.tsx
import { ClipboardList } from 'lucide-react';
import TaskItem from '../widgets/TaskItem';

interface Task {
  id: string;
  title: string;
  assignee: string;
  date: string;
  meeting: string;
  tags: string[];
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
}

interface TasksListProps {
  tasks?: Task[];
  onToggleComplete?: (id: string, completed: boolean) => void;
}

export default function TasksList({ tasks, onToggleComplete }: TasksListProps) {
  const defaultTasks: Task[] = [
    // {
    //   id: '1',
    //   title: 'Review Q1 budget proposal',
    //   assignee: 'Sarah Chen',
    //   date: '2024-01-20',
    //   meeting: 'Product Strategy Session',
    //   tags: ['#budget', '#finance', '#q1'],
    //   description: 'Analyze the budget allocation for marketing and development teams',
    //   priority: 'high',
    //   status: 'pending',
    // },
    // {
    //   id: '2',
    //   title: 'Schedule client follow-up meeting',
    //   assignee: 'Mike Johnson',
    //   date: '2024-01-18',
    //   meeting: 'Client Onboarding Call',
    //   tags: ['#client', '#follow-up'],
    //   priority: 'medium',
    //   status: 'in-progress',
    // },
    // {
    //   id: '3',
    //   title: 'Update project timeline',
    //   assignee: 'Alex Rivera',
    //   date: '2024-01-16',
    //   meeting: 'Team Standup',
    //   tags: ['#development', '#timeline'],
    //   priority: 'high',
    //   status: 'overdue',
    // },
    // {
    //   id: '4',
    //   title: 'Prepare demo presentation',
    //   assignee: 'Emma Davis',
    //   date: '2024-01-25',
    //   meeting: 'Product Strategy Session',
    //   tags: ['#demo', '#presentation'],
    //   priority: 'medium',
    //   status: 'completed',
    // },
  ];

  const displayTasks = tasks || defaultTasks;

  // Check if there are no tasks to display
  if (!displayTasks || displayTasks.length === 0) {
    return (
      <div className='bg-white rounded-lg border border-gray-200 p-12'>
        <div className='flex flex-col items-center justify-center'>
          <div className='w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
            <ClipboardList className='w-10 h-10 text-gray-400' />
          </div>
          <p className='text-base font-medium text-gray-900 mb-2'>No tasks found</p>
          <p className='text-sm text-gray-500 text-center max-w-xs'>
            No tasks match your current filters. Try adjusting your search or filter criteria.
          </p>
        </div>
      </div>
    );
  }

  const handleToggleComplete = (id: string, completed: boolean) => {
    if (onToggleComplete) {
      onToggleComplete(id, completed);
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    console.log('Status change:', id, status);
  };

  return (
    <div className='space-y-4'>
      {displayTasks.map(task => (
        <TaskItem
          key={task.id}
          {...task}
          onToggleComplete={handleToggleComplete}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
}