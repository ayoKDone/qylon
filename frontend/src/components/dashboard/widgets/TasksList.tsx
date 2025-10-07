import TaskItem from '../widgets/TaskItem';

export default function TasksLists() {
  const tasks = [
    {
      id: '1',
      title: 'Review Q1 budget proposal',
      assignee: 'Sarah Chen',
      date: '2024-01-20',
      meeting: 'Product Strategy Session',
      tags: ['#budget', '#finance', '#q1'],
      description:
        'Analyze the budget allocation for marketing and development teams',
      priority: 'high' as const,
      status: 'pending' as const,
    },
    {
      id: '2',
      title: 'Schedule client follow-up meeting',
      assignee: 'Mike Johnson',
      date: '2024-01-18',
      meeting: 'Client Onboarding Call',
      tags: ['#client', '#follow-up'],
      priority: 'medium' as const,
      status: 'in-progress' as const,
    },
    {
      id: '3',
      title: 'Update project timeline',
      assignee: 'Alex Rivera',
      date: '2024-01-16',
      meeting: 'Team Standup',
      tags: ['#development', '#timeline'],
      priority: 'high' as const,
      status: 'overdue' as const,
    },
    {
      id: '4',
      title: 'Prepare demo presentation',
      assignee: 'Emma Davis',
      date: '2024-01-25',
      meeting: 'Product Strategy Session',
      tags: ['#demo', '#presentation'],
      priority: 'medium' as const,
      status: 'completed' as const,
    },
  ];

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          {...task}
          onStatusChange={(id, status) =>
            console.log('Status change:', id, status)
          }
        />
      ))}
    </div>
  );
}
