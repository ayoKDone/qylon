import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { IconName } from './atomic/Icon';
import Icon from './icons/Icon';
import ThemeToggle from './ThemeToggle';

const AppUI: React.FC = () => {
  const { isDark } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [meetingTime, setMeetingTime] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [processingTasks] = useState(3);

  // Animate meeting timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setMeetingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Glass panel base classes
  const glassPanel = `backdrop-blur-xl border transition-all duration-300 ${
    isDark ? 'bg-slate-900/30 border-slate-700/40' : 'bg-white/80 border-slate-200/50'
  }`;

  const glassCard = `backdrop-blur-lg border transition-all duration-300 ${
    isDark ? 'bg-slate-800/50 border-slate-600/50' : 'bg-white/60 border-slate-300/50'
  }`;

  // Dashboard View
  const DashboardView = () => (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-full'>
      {/* Main Meeting Area */}
      <div
        className={`lg:col-span-2 p-4 lg:p-8 rounded-2xl lg:rounded-3xl ${glassPanel} hover:scale-[1.01] transition-transform duration-300`}
      >
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8'>
          <h2
            className={`text-xl lg:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            AI Command Center
          </h2>
          <div className='flex space-x-2 lg:space-x-3'>
            <button
              className={`p-2 lg:p-3 rounded-lg lg:rounded-xl ${glassCard} hover:scale-110 transition-transform`}
            >
              <Icon name='monitor' size={24} className='w-4 lg:w-6 h-4 lg:h-6 text-amber-500' />
            </button>
            <button
              className={`p-2 lg:p-3 rounded-lg lg:rounded-xl ${glassCard} hover:scale-110 transition-transform`}
            >
              <Icon name='smartphone' size={24} className='w-4 lg:w-6 h-4 lg:h-6 text-blue-500' />
            </button>
            <button
              className={`p-2 lg:p-3 rounded-lg lg:rounded-xl ${glassCard} hover:scale-110 transition-transform`}
            >
              <Icon
                name='headphones'
                size={24}
                className='w-4 lg:w-6 h-4 lg:h-6 text-emerald-500'
              />
            </button>
          </div>
        </div>

        {/* Live Processing */}
        <div className={`p-4 lg:p-6 rounded-xl lg:rounded-2xl mb-6 lg:mb-8 ${glassCard}`}>
          <div className='flex items-center space-x-3 lg:space-x-4 mb-4 lg:mb-6'>
            <div className='relative'>
              <div className='w-12 lg:w-16 h-12 lg:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30'>
                <Icon name='brain' size={32} className='w-6 lg:w-8 h-6 lg:h-8 text-white' />
              </div>
              <div className='absolute -top-1 lg:-top-2 -right-1 lg:-right-2 w-4 lg:w-6 h-4 lg:h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse'>
                <div className='w-2 h-2 bg-white rounded-full'></div>
              </div>
            </div>
            <div>
              <h3
                className={`text-lg lg:text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
              >
                AI Processing Live
              </h3>
              <p className={`text-sm lg:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {processingTasks} active conversations • Real-time extraction
              </p>
            </div>
          </div>

          <div className='space-y-3 lg:space-y-4'>
            {[
              {
                text: 'Sarah to review budget proposal by Friday',
                status: 'extracting',
                color: 'amber',
              },
              {
                text: 'Schedule follow-up meeting with clients',
                status: 'completed',
                color: 'emerald',
              },
              {
                text: 'Update project timeline in ClickUp',
                status: 'syncing',
                color: 'blue',
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`p-3 lg:p-4 rounded-lg lg:rounded-xl border-l-4 ${
                  item.color === 'amber'
                    ? 'border-amber-400 bg-amber-500/10'
                    : item.color === 'emerald'
                      ? 'border-emerald-400 bg-emerald-500/10'
                      : 'border-blue-400 bg-blue-500/10'
                }`}
              >
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
                  <p
                    className={`text-xs lg:text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                  >
                    {item.text}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium self-start sm:self-center ${
                      item.color === 'amber'
                        ? 'text-amber-400 bg-amber-400/20'
                        : item.color === 'emerald'
                          ? 'text-emerald-400 bg-emerald-400/20'
                          : 'text-blue-400 bg-blue-400/20'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6'>
          {[
            {
              icon: 'zap',
              value: '12',
              label: 'Tasks Created',
              change: '+5 today',
              trend: 'up',
            },
            {
              icon: 'clock',
              value: '47m',
              label: 'Time Saved',
              change: 'This week',
              trend: 'up',
            },
            {
              icon: 'target',
              value: '94%',
              label: 'Accuracy',
              change: 'AI precision',
              trend: 'stable',
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`p-4 lg:p-6 rounded-xl lg:rounded-2xl ${glassCard} hover:scale-105 transition-transform`}
            >
              <div className='flex items-center justify-between mb-3 lg:mb-4'>
                <Icon
                  name={stat.icon as IconName}
                  size={32}
                  className='w-6 lg:w-8 h-6 lg:h-8 text-blue-500'
                />
                {stat.trend === 'up' && (
                  <Icon name='trendingUp' size={16} className='w-4 h-4 text-emerald-500' />
                )}
              </div>
              <div
                className={`text-2xl lg:text-3xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {stat.value}
              </div>
              <div className={`text-xs lg:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {stat.label}
              </div>
              <div className='text-xs text-emerald-500 font-medium mt-1'>{stat.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className='space-y-4 lg:space-y-6'>
        {/* Quick Actions */}
        <div className={`p-4 lg:p-6 rounded-2xl lg:rounded-3xl ${glassPanel}`}>
          <h3
            className={`text-lg lg:text-xl font-bold mb-4 lg:mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            Quick Actions
          </h3>
          <div className='space-y-2 lg:space-y-3'>
            {[
              { icon: 'plus', label: 'New Meeting', color: 'blue' },
              { icon: 'upload', label: 'Upload Audio', color: 'emerald' },
              { icon: 'download', label: 'Export Tasks', color: 'amber' },
            ].map((action, index) => (
              <button
                key={index}
                className={`w-full flex items-center space-x-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl ${glassCard} hover:scale-[1.02] transition-all`}
              >
                <Icon
                  name={action.icon as IconName}
                  size={20}
                  className={`w-4 lg:w-5 h-4 lg:h-5 ${
                    action.color === 'blue'
                      ? 'text-blue-500'
                      : action.color === 'emerald'
                        ? 'text-emerald-500'
                        : 'text-amber-500'
                  }`}
                />
                <span
                  className={`text-sm lg:text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}
                >
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`p-4 lg:p-6 rounded-2xl lg:rounded-3xl ${glassPanel}`}>
          <h3
            className={`text-lg lg:text-xl font-bold mb-4 lg:mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            Recent Activity
          </h3>
          <div className='space-y-3 lg:space-y-4'>
            {[
              {
                action: 'Created 3 tasks',
                time: '2 min ago',
                user: 'AI Assistant',
              },
              {
                action: 'Meeting ended',
                time: '15 min ago',
                user: 'Product Team',
              },
              {
                action: 'Synced to ClickUp',
                time: '1 hour ago',
                user: 'Integration',
              },
            ].map((item, index) => (
              <div key={index} className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl ${glassCard}`}>
                <p
                  className={`font-medium text-xs lg:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}
                >
                  {item.action}
                </p>
                <div className='flex items-center justify-between mt-1 lg:mt-2'>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {item.user}
                  </span>
                  <span className='text-xs text-blue-500 font-medium'>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Simple placeholder for other views
  const SimpleView = ({ title, description }: { title: string; description: string }) => (
    <div className={`p-8 rounded-3xl ${glassPanel} text-center`}>
      <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {title}
      </h2>
      <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{description}</p>
    </div>
  );

  // Render current view
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'meetings':
        return (
          <SimpleView
            title='Live Meetings'
            description='Monitor and control all live conversations'
          />
        );
      case 'tasks':
        return <SimpleView title='Action Items' description='Manage all extracted action items' />;
      case 'analytics':
        return <SimpleView title='Analytics' description='Track your meeting efficiency metrics' />;
      case 'calendar':
        return <SimpleView title='Calendar' description='Schedule and manage your meetings' />;
      case 'settings':
        return <SimpleView title='Settings' description='Configure your AI assistant' />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className='relative'>
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 lg:hidden'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`min-h-screen transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950'
            : 'bg-gradient-to-br from-slate-100 via-white to-slate-200'
        }`}
      >
        {/* Ambient Background Effects */}
        <div className='fixed inset-0 overflow-hidden pointer-events-none'>
          <div
            className={`absolute -top-1/2 -right-1/2 w-full h-full rounded-full transition-all duration-[3000ms] ${
              isDark
                ? 'bg-gradient-radial from-blue-500/10 via-cyan-500/5 to-transparent'
                : 'bg-gradient-radial from-blue-300/30 via-cyan-300/15 to-transparent'
            }`}
            style={{
              transform: 'rotate(45deg)',
              filter: 'blur(40px)',
            }}
          ></div>
          <div
            className={`absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full transition-all duration-[4000ms] ${
              isDark
                ? 'bg-gradient-radial from-purple-600/8 via-slate-700/10 to-transparent'
                : 'bg-gradient-radial from-purple-400/25 via-slate-400/10 to-transparent'
            }`}
            style={{
              transform: 'rotate(-45deg)',
              filter: 'blur(50px)',
            }}
          ></div>
        </div>

        {/* Main Container */}
        <div className='relative z-10 flex h-screen overflow-hidden'>
          {/* Sidebar */}
          <div
            className={`fixed lg:relative inset-y-0 left-0 z-50 w-80 p-4 lg:p-8 backdrop-blur-3xl border-r transition-all duration-500 ${
              isDark ? 'bg-slate-900/30 border-slate-700/40' : 'bg-white/80 border-slate-200/50'
            } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
          >
            {/* Logo */}
            <div className='flex items-center justify-between lg:justify-start space-x-4 mb-8 lg:mb-12'>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className='lg:hidden p-2 rounded-lg text-slate-400 hover:text-white'
              >
                <Icon name='x' size={24} className='w-6 h-6' />
              </button>

              <div className='relative group'>
                <div className='w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center'>
                  <Icon name='zap' size={24} className='w-6 h-6 text-white' />
                </div>
              </div>

              <div>
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Qylon
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className='space-y-3 mb-8'>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: 'activity' },
                { id: 'meetings', label: 'Live Meetings', icon: 'video' },
                { id: 'tasks', label: 'Action Items', icon: 'checkCircle2' },
                { id: 'analytics', label: 'Analytics', icon: 'barChart3' },
                { id: 'calendar', label: 'Calendar', icon: 'calendar' },
                { id: 'settings', label: 'Settings', icon: 'settings' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 backdrop-blur-xl border ${
                    activeTab === item.id
                      ? isDark
                        ? 'bg-slate-800/60 border-slate-600/60 text-white'
                        : 'bg-white/70 border-slate-300/70 text-slate-900'
                      : isDark
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800/40 hover:border-slate-600/40 border-transparent'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 hover:border-slate-300/50 border-transparent'
                  }`}
                >
                  <Icon name={item.icon as IconName} size={20} className='w-5 h-5' />
                  <span className='font-medium'>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Recording Status Card */}
            <div
              className={`p-6 rounded-3xl backdrop-blur-2xl border transition-all duration-500 ${
                isDark ? 'bg-slate-800/40 border-slate-600/50' : 'bg-white/60 border-slate-300/50'
              }`}
            >
              <div className='flex items-center justify-between mb-4'>
                <span
                  className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                >
                  Recording Status
                </span>
                <div
                  className={`w-3 h-3 rounded-full ${
                    isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-400'
                  }`}
                ></div>
              </div>

              <div className='flex items-center justify-between mb-4'>
                <div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {isRecording ? formatTime(meetingTime) : '00:00'}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isRecording ? 'Recording active' : 'Ready to record'}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsRecording(!isRecording);
                    if (!isRecording) setMeetingTime(0);
                  }}
                  className={`p-3 rounded-2xl transition-all duration-300 hover:scale-110 ${
                    isRecording
                      ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                      : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                  }`}
                >
                  {isRecording ? (
                    <Icon name='pause' size={20} className='w-5 h-5' />
                  ) : (
                    <Icon name='play' size={20} className='w-5 h-5' />
                  )}
                </button>
              </div>

              <button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl ${glassCard} hover:scale-[1.02] transition-all`}
              >
                {isAudioEnabled ? (
                  <Icon name='volume2' size={16} className='w-4 h-4 text-emerald-500' />
                ) : (
                  <Icon name='volumeX' size={16} className='w-4 h-4 text-red-500' />
                )}
                <span
                  className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                >
                  {isAudioEnabled ? 'Audio On' : 'Audio Off'}
                </span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className='flex-1 flex flex-col overflow-hidden'>
            {/* Top Navigation Bar */}
            <div
              className={`m-3 lg:m-6 p-4 lg:p-6 backdrop-blur-3xl border rounded-2xl lg:rounded-3xl transition-all duration-500 ${glassPanel}`}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className={`lg:hidden p-2 rounded-lg ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <Icon name='menu' size={24} className='w-6 h-6' />
                  </button>

                  <div>
                    <h1
                      className={`text-xl lg:text-3xl font-bold ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {activeTab === 'dashboard'
                        ? 'Good afternoon, Alex'
                        : activeTab === 'meetings'
                          ? 'Live Meetings'
                          : activeTab === 'tasks'
                            ? 'Action Items'
                            : activeTab === 'analytics'
                              ? 'Analytics'
                              : activeTab === 'calendar'
                                ? 'Calendar'
                                : 'Settings'}
                    </h1>
                    <p
                      className={`mt-1 text-sm lg:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                    >
                      {activeTab === 'dashboard' &&
                        `AI processing ${processingTasks} active conversations`}
                      {activeTab === 'meetings' && 'Monitor and control all live conversations'}
                      {activeTab === 'tasks' && 'Manage all extracted action items'}
                      {activeTab === 'analytics' && 'Track your meeting efficiency metrics'}
                      {activeTab === 'calendar' && 'Schedule and manage your meetings'}
                      {activeTab === 'settings' && 'Configure your AI assistant'}
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-2 lg:space-x-4'>
                  <ThemeToggle />
                  <button
                    className={`p-2 lg:p-3 rounded-lg lg:rounded-2xl ${glassCard} hover:scale-110 transition-transform`}
                  >
                    <Icon name='bell' size={20} className='w-4 lg:w-5 h-4 lg:h-5' />
                  </button>
                  <button
                    className={`p-2 lg:p-3 rounded-lg lg:rounded-2xl ${glassCard} hover:scale-110 transition-transform`}
                  >
                    <Icon name='search' size={20} className='w-4 lg:w-5 h-4 lg:h-5' />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className='flex-1 px-3 lg:px-6 pb-3 lg:pb-6 overflow-auto'>
              {renderCurrentView()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppUI;
