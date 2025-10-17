'use client';
import { ContactIcon, Link2Icon, RefreshCwIcon, Settings2Icon } from 'lucide-react';
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
  const [integrations] = useState<Integration[]>([
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

  // const toggleConnection = (id: string) => {
  //   setIntegrations(prev =>
  //     prev.map(int =>
  //       int.id === id
  //         ? {
  //             ...int,
  //             connected: !int.connected,
  //             lastSync: int.connected ? null : 'Just now',
  //           }
  //         : int,
  //     ),
  //   );
  // };

  const getHealthColor = (status: Integration['health']) => {
    switch (status) {
      case 'good':
        return 'xui-badge-success';
      case 'warning':
        return 'xui-badge-warning';
      case 'error':
        return 'xui-badge-danger';
      default:
        return 'xui-badge-info';
    }
  };

  return (
    <>
      <p className='text-gray-600'>Connect and manage your third-party integrations</p>
      <section className='xui-mt-1 xui-d-grid xui-grid-col-1 xui-md-grid-col-3 xui-grid-gap-1'>
        <div className='xui-p-1 xui-bdr-w-1 xui-bdr-fade xui-bdr-s-solid xui-bdr-rad-half'>
          <span className='text-[14px] xui-opacity-6'>Connected Services</span>
          <h1 className='text-[32px] xui-font-w-700 xui-mt-1'>5</h1>
        </div>
        <div className='xui-p-1 xui-bdr-w-1 xui-bdr-fade xui-bdr-s-solid xui-bdr-rad-half'>
          <span className='text-[14px] xui-opacity-6'>Healthy Connections</span>
          <h1 className='text-[32px] xui-font-w-700 xui-mt-1'>4</h1>
        </div>
        <div className='xui-p-1 xui-bdr-w-1 xui-bdr-fade xui-bdr-s-solid xui-bdr-rad-half'>
          <span className='text-[14px] xui-opacity-6'>Available Integrations</span>
          <h1 className='text-[32px] xui-font-w-700 xui-mt-1'>3</h1>
        </div>
      </section>
      <section className='xui-mt-2'>
        <h3 className='xui-font-w-600 text-[18px]'>Connected Integrations</h3>
        <section className='xui-mt-1 xui-d-grid xui-grid-col-1 xui-md-grid-col-3 xui-grid-gap-1'>
          {integrations.map(integration => (
            <div
              key={integration.id}
              className='xui-p-1 xui-bdr-w-1 xui-bdr-fade xui-bdr-s-solid xui-bdr-rad-half'
            >
              <div className='xui-d-flex xui-flex-wrap-nowrap xui-flex-jc-space-between'>
                <div className='xui-d-flex xui-flex-wrap-nowrap xui-grid-gap-half'>
                  <div
                    style={{
                      flexShrink: 0,
                    }}
                    className='xui-mt-half xui-bg-light w-[40px] h-[40px] xui-bdr-rad-half xui-d-inline-flex xui-flex-jc-center xui-flex-ai-center p-[4px]'
                  >
                    <img
                      src={integration.logo}
                      alt={`${integration.name} logo`}
                      width={50}
                      height={50}
                      className='xui-w-fluid-100 xui-h-auto'
                    />
                  </div>
                  <div
                    style={
                      {
                        // flexGrow: 0
                      }
                    }
                  >
                    <h3 className='xui-font-w-600 xui-mt-1'>{integration.name}</h3>
                    <p className='xui-opacity-6 text-[14px]'>{integration.description}</p>
                  </div>
                </div>
                <div>
                  <span className={`xui-badge ${getHealthColor(integration.health)}`}>
                    {integration.health}
                  </span>
                </div>
              </div>
              <div className='xui-mt-2 xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'>
                <span className='text-[14px] xui-opacity-6'>Last sync</span>
                <span className='text-[12px] xui-opacity-9'>{integration.lastSync}</span>
              </div>
              <div className='xui-mt-1 xui-row'>
                <div className='xui-col-12 xui-md-col-6 xui-md-pr-half'>
                  <button className='xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-grid-gap-half xui-btn xui-btn-block xui-btn-fade xui-bdr-rad-half'>
                    <RefreshCwIcon size={14} />
                    <span className='text-[14px]'>Sync Now</span>
                  </button>
                </div>
                <div className='xui-col-12 xui-md-col-6 xui-md-pl-half'>
                  <button className='xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-grid-gap-half xui-btn xui-btn-block xui-btn-fade xui-bdr-rad-half'>
                    <Settings2Icon size={14} />
                    <span className='text-[14px]'>Configure</span>
                  </button>
                </div>
                <div className='xui-mt-1 xui-col-12'>
                  <button className='xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-grid-gap-half xui-btn xui-btn-block xui-btn-danger xui-bdr-rad-half'>
                    <span className='text-[14px]'>Disconnect</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </section>
      <section className='xui-mt-2'>
        <h3 className='xui-font-w-600 text-[18px]'>Available Integrations</h3>
        <section className='xui-mt-1 xui-d-grid xui-grid-col-1 xui-md-grid-col-3 xui-grid-gap-1'>
          {integrations.map(integration => (
            <div
              key={integration.id}
              className='xui-p-1 xui-bdr-w-1 xui-bdr-fade xui-bdr-s-solid xui-bdr-rad-half'
            >
              <div className='xui-d-flex xui-flex-wrap-nowrap xui-flex-jc-space-between'>
                <div className='xui-d-flex xui-flex-wrap-nowrap xui-grid-gap-half'>
                  <div
                    style={{
                      flexShrink: 0,
                    }}
                    className='xui-mt-half xui-bg-light w-[40px] h-[40px] xui-bdr-rad-half xui-d-inline-flex xui-flex-jc-center xui-flex-ai-center p-[4px]'
                  >
                    <img
                      src={integration.logo}
                      alt={`${integration.name} logo`}
                      width={50}
                      height={50}
                      className='xui-w-fluid-100 xui-h-auto'
                    />
                  </div>
                  <div
                    style={
                      {
                        // flexGrow: 0
                      }
                    }
                  >
                    <h3 className='xui-font-w-600 xui-mt-1'>{integration.name}</h3>
                    <p className='xui-opacity-6 text-[14px]'>{integration.description}</p>
                  </div>
                </div>
                <div>
                  {/* <span className={`xui-badge ${getHealthColor(integration.health)}`}>{integration.health}</span> */}
                </div>
              </div>
              <button className='xui-mt-1 xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-grid-gap-half xui-btn xui-btn-block xui-btn-black xui-bdr-rad-half'>
                <span className='text-[14px]'>Connect {integration.name}</span>
              </button>
            </div>
          ))}
        </section>
      </section>
      <section className='xui-bdr-rad-half xui-mt-2 xui-bg-light xui-p-1 xui-bdr-w-1 xui-bdr-s-solid xui-bdr-fade'>
        <div className='xui-d-flex xui-flex-wrap-nowrap xui-flex-jc-space-between xui-flex-ai-center'>
          <div className='xui-d-flex xui-flex-wrap-nowrap xui-grid-gap-1'>
            <div
              style={{
                flexShrink: 0,
              }}
              className='xui-bg-light-1 w-[40px] h-[40px] xui-bdr-rad-half xui-d-inline-flex xui-flex-jc-center xui-flex-ai-center p-[4px]'
            >
              <Link2Icon size={20} />
            </div>
            <div className='xui-mt--1'>
              <h4 className='xui-font-w-500 xui-mt-1'>Need a custom integration?</h4>
              <p className='xui-opacity-6 text-[14px]'>
                Contact our team to discuss custom integration options for your workflow
              </p>
            </div>
          </div>
          <div>
            <button className='xui-mt-1 xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-grid-gap-half xui-btn xui-btn-white xui-bdr-rad-half'>
              <ContactIcon size={16} />
              <span className='text-[14px]'>Contact Us</span>
            </button>
          </div>
        </div>
      </section>
    </>

  );
}
