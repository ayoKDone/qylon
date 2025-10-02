'use client';
import { useState } from 'react';

interface Integration {
  id: string;
  name: string;
  description: string;
  logo: string;
  connected: boolean;
  lastSync: string | null;
  health: 'good' | 'warning' | 'error';
}

export default function IntegrationSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync your meetings and events automatically.',
      logo: 'https://www.gstatic.com/images/branding/product/1x/calendar_48dp.png',
      connected: true,
      lastSync: '2 hours ago',
      health: 'good',
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Easily share meeting details across your team.',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg',
      connected: true,
      lastSync: '1 day ago',
      health: 'good',
    },
    {
      id: 'microsoft-teams',
      name: 'Microsoft Teams',
      description: 'Stay connected with your team and meetings.',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/1101px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png',
      connected: false,
      lastSync: null,
      health: 'warning',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get instant notifications and messages directly.',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png',
      connected: false,
      lastSync: null,
      health: 'good',
    },
    {
      id: 'asana',
      name: 'Asana',
      description: 'Manage tasks and projects collaboratively.',
      logo: 'https://cdn.freebiesupply.com/logos/large/2x/asana-logo-logo-svg-vector.svg',
      connected: true,
      lastSync: '3 hours ago',
      health: 'good',
    },
    {
      id: 'clickup',
      name: 'ClickUp',
      description: 'Organize projects and workflows efficiently.',
      logo: 'https://img.icons8.com/color/600/clickup.png',
      connected: false,
      lastSync: null,
      health: 'error',
    },
    {
      id: 'monday',
      name: 'Monday.com',
      description: 'Collaborate on team projects and timelines.',
      logo: 'https://images.seeklogo.com/logo-png/39/2/monday-logo-png_seeklogo-394605.png',
      connected: true,
      lastSync: '5 hours ago',
      health: 'good',
    },
  ]);

  const toggleConnection = (id: string) => {
    setIntegrations(prev =>
      prev.map(int =>
        int.id === id
          ? {
              ...int,
              connected: !int.connected,
              lastSync: int.connected ? null : 'Just now',
            }
          : int
      )
    );
  };

  const getHealthColor = (status: Integration['health']) => {
    switch (status) {
      case 'good':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <p className="text-gray-600">
            Manage your connected services and integrations below.
          </p>
        </div>

        {/* ✅ Responsive Grid Layout */}
        <div
          className="
                grid
                gap-5
                grid-cols-[repeat(auto-fit,minmax(280px,1fr))]
                "
        >
          {integrations.map(integration => (
            <div
              key={integration.id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={integration.logo}
                  alt={integration.name}
                  className="w-10 h-10 rounded-md object-contain"
                />
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    {integration.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {integration.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {integration.connected ? (
                    <span className="flex items-center text-green-600 text-sm font-medium">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center text-gray-500 text-sm font-medium">
                      <span className="w-2 h-2 rounded-full bg-gray-400 mr-1"></span>
                      Disconnected
                    </span>
                  )}
                </div>

                <button
                  onClick={() => toggleConnection(integration.id)}
                  className={`text-sm font-medium border rounded-lg px-3 py-1 transition ${
                    integration.connected
                      ? 'text-red-600 border-red-600 hover:bg-blue-50'
                      : 'text-gray-600 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {integration.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>

              {/* ✅ Health + Last Sync */}
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span
                  className={`font-medium ${getHealthColor(integration.health)}`}
                >
                  {integration.health} health
                </span>
                <span>
                  {integration.lastSync
                    ? `Last synced: ${integration.lastSync}`
                    : 'Not synced yet'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Integration */}
        <div className="mt-10 pt-6">
          <h3 className="text-md font-semibold text-gray-800 mb-2">
            Add New Integration
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Connect additional services to enhance your workflow.
          </p>
          <button className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
            Add Integration
          </button>
        </div>
      </div>
    </div>
  );
}
