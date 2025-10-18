import { FileText, Plus, Workflow as WorkflowIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import FilterTabs from '../widgets/FilterTabs';
import IntegrationCard from '../widgets/IntegrationCard';
import TemplateCard from '../widgets/TemplateCard';

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};

interface Integration {
  id: string;
  name: string;
  app1: { name: string; icon: string; bgColor: string };
  app2: { name: string; icon: string; bgColor: string };
  isActive: boolean;
  updatedDate: string;
  author: { name: string; avatar: string };
  status: 'active' | 'inactive';
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  app1: { name: string; icon: string; bgColor: string };
  app2: { name: string; icon: string; bgColor: string };
  useCase: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  usageCount: number;
}

export default function Workflow() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    // Mock data with triggers and actions
    setIntegrations([
      // {
      //   id: '1',
      //   name: 'Meeting End Automation',
      //   app1: { name: 'Meeting Ends', icon: '', bgColor: 'bg-blue-500' },
      //   app2: { name: 'Create Task', icon: '', bgColor: 'bg-orange-500' },
      //   isActive: true,
      //   updatedDate: 'Oct 5, 2025',
      //   author: { name: 'Sarah Johnson', avatar: '' },
      //   status: 'active',
      // },
      // {
      //   id: '2',
      //   name: 'Action Item Notification',
      //   app1: {
      //     name: 'Action Item Created',
      //     icon: '',
      //     bgColor: 'bg-green-500',
      //   },
      //   app2: { name: 'Send Email', icon: '', bgColor: 'bg-red-500' },
      //   isActive: true,
      //   updatedDate: 'Oct 4, 2025',
      //   author: { name: 'Mike Chen', avatar: '' },
      //   status: 'active',
      // },
      // {
      //   id: '3',
      //   name: 'Timer-Based Reminder',
      //   app1: { name: 'Timer Expires', icon: '', bgColor: 'bg-purple-500' },
      //   app2: { name: 'Send Notification', icon: '', bgColor: 'bg-indigo-500' },
      //   isActive: true,
      //   updatedDate: 'Oct 3, 2025',
      //   author: { name: 'Emily Davis', avatar: '' },
      //   status: 'active',
      // },
      // {
      //   id: '4',
      //   name: 'Document Content Generator',
      //   app1: { name: 'Document Updated', icon: '', bgColor: 'bg-teal-500' },
      //   app2: { name: 'Generate Content', icon: '', bgColor: 'bg-cyan-500' },
      //   isActive: false,
      //   updatedDate: 'Oct 1, 2025',
      //   author: { name: 'Alex Rivera', avatar: '' },
      //   status: 'inactive',
      // },
      // {
      //   id: '5',
      //   name: 'Event-Based Task Creation',
      //   app1: { name: 'Event Scheduled', icon: '', bgColor: 'bg-pink-500' },
      //   app2: { name: 'Create Task', icon: '', bgColor: 'bg-orange-500' },
      //   isActive: true,
      //   updatedDate: 'Sep 28, 2025',
      //   author: { name: 'Jordan Lee', avatar: '' },
      //   status: 'active',
      // },
      // {
      //   id: '6',
      //   name: 'Task Completion Workflow',
      //   app1: { name: 'Task Completed', icon: '', bgColor: 'bg-emerald-500' },
      //   app2: { name: 'Update Database', icon: '', bgColor: 'bg-slate-600' },
      //   isActive: false,
      //   updatedDate: 'Sep 25, 2025',
      //   author: { name: 'Taylor Smith', avatar: '' },
      //   status: 'inactive',
      // },
    ]);

    setTemplates([
      {
        id: 't1',
        name: 'Meeting Notes to Tasks',
        description: 'Automatically create tasks from meeting transcripts and action items',
        category: 'Meeting to Tasks',
        app1: { name: 'Meeting Ends', icon: '', bgColor: 'bg-blue-500' },
        app2: { name: 'Create Task', icon: '', bgColor: 'bg-orange-500' },
        useCase: 'Perfect for project managers who want to streamline post-meeting workflows',
        complexity: 'beginner',
        rating: 4.8,
        usageCount: 1250,
      },
      {
        id: 't2',
        name: 'Instant Team Notifications',
        description: 'Send notifications to your team when action items are created',
        category: 'Team Notifications',
        app1: {
          name: 'Action Item Created',
          icon: '',
          bgColor: 'bg-green-500',
        },
        app2: { name: 'Send Notification', icon: '', bgColor: 'bg-indigo-500' },
        useCase: 'Keep your team informed about new action items in real-time',
        complexity: 'beginner',
        rating: 4.6,
        usageCount: 890,
      },
      {
        id: 't3',
        name: 'Content Generation Pipeline',
        description: 'Automatically generate content when documents are updated',
        category: 'Content Generation',
        app1: { name: 'Document Updated', icon: '', bgColor: 'bg-teal-500' },
        app2: { name: 'Generate Content', icon: '', bgColor: 'bg-cyan-500' },
        useCase: 'Ideal for content creators who need to automate content generation',
        complexity: 'advanced',
        rating: 4.9,
        usageCount: 2100,
      },
      {
        id: 't4',
        name: 'Scheduled Task Reminder',
        description: 'Set up timed triggers to send task reminders via email',
        category: 'Task Management',
        app1: { name: 'Timer Expires', icon: '', bgColor: 'bg-purple-500' },
        app2: { name: 'Send Email', icon: '', bgColor: 'bg-red-500' },
        useCase: 'Ensure your team never misses important deadlines',
        complexity: 'beginner',
        rating: 4.7,
        usageCount: 1500,
      },
    ]);
  }, []);

  const filteredIntegrations = integrations.filter(integration => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && integration.status === 'active') ||
      (activeTab === 'inactive' && integration.status === 'inactive');

    const matchesSearch =
      searchQuery === '' || integration.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleIntegrationClick = (id: string) => {
    navigate(`/dashboard/workflow/${id}`);
  };

  const handleUseTemplate = (id: string) => {
    console.log('Using template:', id);
    navigate(`/dashboard/workflow/new?template=${id}`);
  };

  const { setNavbar } = useOutletContext<NavbarContext>();

  useEffect(() => {
    setNavbar({
      title: 'Workflow',
      subtitle: 'Manage workflow and automate tasks',
    });
  }, [setNavbar]);

  // Empty state for integrations/automations
  const IntegrationsEmptyState = () => (
    <div className='bg-white rounded-lg border border-gray-200 p-16'>
      <div className='flex flex-col items-center justify-center max-w-md mx-auto text-center'>
        <div className='w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6'>
          <WorkflowIcon className='w-10 h-10 text-blue-950' />
        </div>
        <h3 className='text-xl font-semibold text-gray-900 mb-3'>
          {searchQuery
            ? 'No automations found'
            : activeTab === 'active'
              ? 'No active automations'
              : activeTab === 'inactive'
                ? 'No inactive automations'
                : 'No automations yet'}
        </h3>
        <p className='text-sm text-gray-500 mb-6 relative inline-block group'>
          {searchQuery
            ? 'Try adjusting your search terms or create a new automation.'
            : 'Get started by creating your first automation or browse templates for inspiration.'}
          <div className='xui-tooltip' xui-set='bottom-right'>
            <span className='ml-1 text-blue-950 text-xs cursor-pointer group-hover:underline'>
              Learn more
            </span>
            <span className='xui-tooltip-content'>
              Automations let you visually build workflows by connecting triggers and actions.
              Templates are pre-built examples you can customize or share with your team.
            </span>
          </div>
        </p>

        <div className='flex gap-3'>
          <button
            onClick={() => navigate('/dashboard/workflow/new')}
            className='px-4 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-2'
          >
            <Plus className='w-4 h-4' />
            Create Automation
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className='px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Browse Templates
          </button>
        </div>
      </div>
    </div>
  );

  // Empty state for templates
  const TemplatesEmptyState = () => (
    <div className='bg-white rounded-lg border border-gray-200 p-16'>
      <div className='flex flex-col items-center justify-center max-w-md mx-auto text-center'>
        <div className='w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-6'>
          <FileText className='w-10 h-10 text-purple-600' />
        </div>
        <h3 className='text-xl font-semibold text-gray-900 mb-3'>No templates available</h3>
        <p className='text-sm text-gray-500 mb-6'>
          Templates help you quickly set up common automation workflows. Check back soon for new
          templates.
        </p>
        <button
          onClick={() => navigate('/dashboard/workflow/new')}
          className='px-4 py-2 bg-blue-950 text-white rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-2'
        >
          <Plus className='w-4 h-4' />
          Create Custom Automation
        </button>
      </div>
    </div>
  );

  return (
    <div className=''>
      <div className='sticky top-0 z-10 bg-white'>
        <FilterTabs
          tabs={[
            { id: 'all', label: 'View all', count: integrations.length },
            {
              id: 'active',
              label: 'Active',
              count: integrations.filter(i => i.status === 'active').length,
            },
            {
              id: 'inactive',
              label: 'Inactive',
              count: integrations.filter(i => i.status === 'inactive').length,
            },
            { id: 'templates', label: 'Templates', count: templates.length },
          ]}
          defaultTab='all'
          onTabChange={setActiveTab}
          onSearch={setSearchQuery}
          onAction={() => navigate('/dashboard/workflow/new')}
          actionLabel='New Automation'
          searchPlaceholder='Search automations...'
        />
      </div>

      {activeTab === 'templates' ? (
        <>
          {templates.length > 0 ? (
            <>
              <div className='mb-6'>
                <h2 className='text-lg font-semibold text-gray-900 mb-2'>Template Categories</h2>
                <div className='flex flex-wrap gap-2'>
                  {[
                    'Meeting to Tasks',
                    'Content Generation',
                    'Team Notifications',
                    'Task Management',
                  ].map(category => (
                    <button
                      key={category}
                      className='px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {templates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUseTemplate={handleUseTemplate}
                  />
                ))}
              </div>
            </>
          ) : (
            <TemplatesEmptyState />
          )}
        </>
      ) : (
        <>
          {filteredIntegrations.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredIntegrations.map(integration => (
                <IntegrationCard
                  key={integration.id}
                  integration={{
                    ...integration,
                    onClick: () => handleIntegrationClick(integration.id),
                  }}
                  onToggle={(id, isActive) => console.log('Toggle:', id, isActive)}
                />
              ))}
            </div>
          ) : (
            <IntegrationsEmptyState />
          )}
        </>
      )}
    </div>
  );
}
