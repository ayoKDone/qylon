import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ExternalLink,
  FileText,
  Filter,
  Search,
  Settings,
  Star,
  Upload,
  Users,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Sample conversation data
const sampleConversations = {
  agency_call: {
    id: 'agency_001',
    title: 'Client Onboarding Call - Creative Agency',
    duration: '22:15',
    date: '2025-01-15',
    participants: [
      'Sarah (Account Manager)',
      'Mike (Creative Director)',
      'Jennifer (Brand Manager - Client)',
    ],
    transcript: `Sarah: Thanks for joining us today, Jennifer. Let's review the campaign concepts we prepared for your Q2 launch.

Jennifer: I'm excited to see what you've come up with. The timing is perfect since we're finalizing our brand guidelines.

Mike: Perfect! I love the direction of Option B for the homepage layout, but we need to adjust the color palette to match your new brand guidelines. Could you send those over by tomorrow?

Jennifer: Absolutely. I'll have our brand team send the updated guidelines by end of day. Also, I think we should increase the budget for the social media component - maybe add another $15,000?

Sarah: That sounds great. I'll update the proposal and schedule a follow-up meeting for Friday to review the revisions. Mike, can you have the color adjustments ready by then?

Mike: Definitely. I'll also prepare three alternative layouts based on the new guidelines.`,
    actionItems: [
      {
        id: 1,
        task: 'Send updated brand guidelines',
        assignee: 'Jennifer (Client)',
        priority: 'High',
        dueDate: '2025-01-16',
        completed: false,
      },
      {
        id: 2,
        task: 'Adjust homepage color palette',
        assignee: 'Mike',
        priority: 'High',
        dueDate: '2025-01-17',
        completed: false,
      },
      {
        id: 3,
        task: 'Update proposal with $15K budget increase',
        assignee: 'Sarah',
        priority: 'Medium',
        dueDate: '2025-01-16',
        completed: false,
      },
      {
        id: 4,
        task: 'Schedule follow-up meeting for Friday',
        assignee: 'Sarah',
        priority: 'Medium',
        dueDate: '2025-01-15',
        completed: true,
      },
      {
        id: 5,
        task: 'Prepare three alternative layouts',
        assignee: 'Mike',
        priority: 'Medium',
        dueDate: '2025-01-17',
        completed: false,
      },
      {
        id: 6,
        task: 'Review social media budget allocation',
        assignee: 'Sarah',
        priority: 'Low',
        dueDate: '2025-01-18',
        completed: false,
      },
    ],
    decisions: [
      'Approved Option B for homepage layout',
      'Increased social media budget by $15,000',
      'Client will provide updated brand guidelines',
    ],
    followUpItems: [
      'Brand guideline review meeting',
      'Color palette approval',
      'Budget amendment signature',
      'Timeline adjustment discussion',
    ],
    satisfactionScore: 8.5,
    sentiment: 'positive',
    urgentItems: 2,
  },
  consultant_call: {
    id: 'consultant_001',
    title: 'Project Review - Business Consultant',
    duration: '45:30',
    date: '2025-01-14',
    participants: ['David (Senior Consultant)', 'Rebecca (Operations Director)', 'Tom (CEO)'],
    actionItems: [
      {
        id: 1,
        task: 'Implement new inventory management system',
        assignee: 'Rebecca',
        priority: 'High',
        dueDate: '2025-02-01',
        completed: false,
      },
      {
        id: 2,
        task: 'Hire additional operations staff',
        assignee: 'Tom',
        priority: 'High',
        dueDate: '2025-01-25',
        completed: false,
      },
      {
        id: 3,
        task: 'Create training materials for new system',
        assignee: 'David',
        priority: 'Medium',
        dueDate: '2025-01-28',
        completed: false,
      },
      {
        id: 4,
        task: 'Schedule system deployment meeting',
        assignee: 'David',
        priority: 'Medium',
        dueDate: '2025-01-20',
        completed: false,
      },
    ],
    decisions: [
      'Approved $50K budget for inventory system',
      'Decided to hire 2 additional operations staff',
      'Will implement system in phases over 3 months',
    ],
    satisfactionScore: 9.2,
    sentiment: 'very positive',
    urgentItems: 3,
  },
  msp_call: {
    id: 'msp_001',
    title: 'SLA Discussion - MSP Provider',
    duration: '35:45',
    date: '2025-01-13',
    participants: ['Alex (Technical Lead)', 'Maria (Client IT Director)', 'John (Account Manager)'],
    actionItems: [
      {
        id: 1,
        task: 'Update SLA response times to 2 hours',
        assignee: 'John',
        priority: 'High',
        dueDate: '2025-01-18',
        completed: false,
      },
      {
        id: 2,
        task: 'Install additional monitoring tools',
        assignee: 'Alex',
        priority: 'High',
        dueDate: '2025-01-22',
        completed: false,
      },
      {
        id: 3,
        task: 'Provide monthly security reports',
        assignee: 'Alex',
        priority: 'Medium',
        dueDate: '2025-02-01',
        completed: false,
      },
      {
        id: 4,
        task: 'Schedule quarterly business review',
        assignee: 'John',
        priority: 'Low',
        dueDate: '2025-01-30',
        completed: false,
      },
    ],
    decisions: [
      'Agreed to 2-hour response time SLA',
      'Added proactive monitoring to service package',
      'Increased monthly service fee by 15%',
    ],
    satisfactionScore: 7.8,
    sentiment: 'neutral',
    urgentItems: 2,
  },
};

const ProductDemo: React.FC = () => {
  const { isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  // const [isRecording] = useState(false); // TODO: Implement recording functionality

  const processSteps = [
    'Analyzing conversation...',
    'Identifying speakers...',
    'Extracting action items...',
    'Detecting decisions...',
    'Assigning priorities...',
    'Calculating satisfaction scores...',
    'Complete!',
  ];

  // Simulate processing animation
  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setProcessStep(prev => {
          if (prev >= processSteps.length - 1) {
            setIsProcessing(false);
            setShowResults(true);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isProcessing, processSteps.length]);

  const startDemo = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setCurrentStep(1);
    setIsProcessing(true);
    setProcessStep(0);
    setShowResults(false);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setSelectedConversation('');
    setIsProcessing(false);
    setProcessStep(0);
    setShowResults(false);
    setSelectedTab('overview');
  };

  const currentConversation = selectedConversation
    ? sampleConversations[selectedConversation as keyof typeof sampleConversations]
    : null;

  const glassPanel = `backdrop-blur-xl border transition-all duration-300 ${
    isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/80 border-slate-200/50'
  }`;

  const glassCard = `backdrop-blur-lg border transition-all duration-300 ${
    isDark ? 'bg-slate-800/60 border-slate-600/60' : 'bg-white/70 border-slate-300/60'
  }`;

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950'
          : 'bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50'
      }`}
    >
      {/* Animated Background */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div
          className={`absolute -top-1/2 -right-1/2 w-full h-full rounded-full transition-all duration-[3000ms] ${
            isDark
              ? 'bg-gradient-radial from-blue-500/20 via-cyan-500/10 to-transparent'
              : 'bg-gradient-radial from-blue-300/40 via-cyan-300/20 to-transparent'
          }`}
          style={{
            transform: 'rotate(45deg)',
            filter: 'blur(60px)',
          }}
        ></div>
        <div
          className={`absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full transition-all duration-[4000ms] ${
            isDark
              ? 'bg-gradient-radial from-purple-600/15 via-pink-500/8 to-transparent'
              : 'bg-gradient-radial from-purple-400/30 via-pink-400/15 to-transparent'
          }`}
          style={{
            transform: 'rotate(-45deg)',
            filter: 'blur(80px)',
          }}
        ></div>
      </div>

      <div className='relative z-10 container mx-auto px-6 py-12'>
        {/* Header */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium mb-6 backdrop-blur-sm'>
            <Zap className='w-4 h-4 mr-2' />
            INTERACTIVE PRODUCT DEMO
          </div>

          <h1 className='text-4xl md:text-6xl font-bold mb-6'>
            <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
              Turn Client Conversations Into
            </span>
            <br />
            <span className='bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
              Completed Deliverables
            </span>
          </h1>

          <p
            className={`text-xl max-w-3xl mx-auto leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            Agencies, consultants, and MSPs can't afford dropped tasks. See how Qylon captures every
            client interaction and delivers action items straight into ClickUp, Asana, or Monday.
          </p>
        </div>

        {/* Demo Steps */}
        {currentStep === 0 && (
          <div className='max-w-4xl mx-auto'>
            {/* Step 1: Conversation Selection */}
            <div className={`p-8 rounded-3xl ${glassPanel} mb-8`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Step 1: Choose a Sample Conversation
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {Object.entries(sampleConversations).map(([key, conversation]) => (
                  <div
                    key={key}
                    className={`p-6 rounded-2xl ${glassCard} hover:scale-105 transition-all duration-300 cursor-pointer group`}
                    onClick={() => startDemo(key)}
                  >
                    <div className='flex items-center justify-between mb-4'>
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          key === 'agency_call'
                            ? 'bg-blue-500'
                            : key === 'consultant_call'
                              ? 'bg-purple-500'
                              : 'bg-emerald-500'
                        }`}
                      >
                        {key === 'agency_call' ? (
                          <FileText className='w-6 h-6 text-white' />
                        ) : key === 'consultant_call' ? (
                          <BarChart3 className='w-6 h-6 text-white' />
                        ) : (
                          <Settings className='w-6 h-6 text-white' />
                        )}
                      </div>
                      <span
                        className={`text-sm px-3 py-1 rounded-full ${
                          isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {conversation.duration}
                      </span>
                    </div>

                    <h3
                      className={`font-bold mb-2 group-hover:text-blue-400 transition-colors ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {conversation.title}
                    </h3>

                    <div className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {conversation.participants.length} participants •{' '}
                      {conversation.actionItems.length} action items
                    </div>

                    <div className='flex items-center text-sm'>
                      <Star className='w-4 h-4 text-yellow-400 mr-1' />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        {conversation.satisfactionScore}/10 satisfaction
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Alternative */}
            <div className={`p-8 rounded-3xl ${glassPanel} text-center`}>
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                  isDark ? 'bg-slate-800' : 'bg-slate-200'
                }`}
              >
                <Upload className={`w-8 h-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
              </div>

              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Or Upload Your Own
              </h3>

              <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Drag and drop audio files, or connect to Zoom, Teams, Google Meet
              </p>

              <button className='px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-transform duration-200'>
                Upload File (Demo Mode)
              </button>
            </div>
          </div>
        )}

        {/* Processing Step */}
        {isProcessing && (
          <div className='max-w-2xl mx-auto'>
            <div className={`p-12 rounded-3xl ${glassPanel} text-center`}>
              <div className='w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
                <Brain className='w-10 h-10 text-white animate-pulse' />
              </div>

              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AI Processing Your Conversation
              </h2>

              <div className='mb-8'>
                <div
                  className={`h-2 rounded-full mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}
                >
                  <div
                    className='h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-800'
                    style={{
                      width: `${((processStep + 1) / processSteps.length) * 100}%`,
                    }}
                  ></div>
                </div>

                <p className={`text-lg font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {processSteps[processStep]}
                </p>
              </div>

              <div className='text-left max-w-md mx-auto space-y-2'>
                {processSteps.slice(0, processStep + 1).map((step, index) => (
                  <div key={index} className='flex items-center'>
                    <CheckCircle2 className='w-4 h-4 text-green-400 mr-3' />
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Step */}
        {showResults && currentConversation && (
          <div className='max-w-7xl mx-auto'>
            {/* Results Header */}
            <div className={`p-6 rounded-3xl ${glassPanel} mb-8`}>
              <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4'>
                <div>
                  <h2
                    className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                  >
                    Analysis Complete: {currentConversation.title}
                  </h2>
                  <div className='flex items-center gap-4 text-sm'>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                      {currentConversation.duration} • {currentConversation.participants.length}{' '}
                      participants
                    </span>
                    <div className='flex items-center'>
                      <Star className='w-4 h-4 text-yellow-400 mr-1' />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        {currentConversation.satisfactionScore}/10
                      </span>
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <button
                    onClick={resetDemo}
                    className='px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors'
                  >
                    Try Another
                  </button>
                  <button className='px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform'>
                    Export Results
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
              <div className={`p-6 rounded-2xl ${glassCard} text-center`}>
                <div className='text-3xl font-bold text-blue-500 mb-2'>
                  {currentConversation.actionItems.length}
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Action Items
                </div>
              </div>
              <div className={`p-6 rounded-2xl ${glassCard} text-center`}>
                <div className='text-3xl font-bold text-purple-500 mb-2'>
                  {currentConversation.decisions.length}
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Key Decisions
                </div>
              </div>
              <div className={`p-6 rounded-2xl ${glassCard} text-center`}>
                <div className='text-3xl font-bold text-emerald-500 mb-2'>
                  {currentConversation.urgentItems}
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Urgent Items
                </div>
              </div>
              <div className={`p-6 rounded-2xl ${glassCard} text-center`}>
                <div className='text-3xl font-bold text-orange-500 mb-2'>
                  {currentConversation.satisfactionScore}
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Satisfaction
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className={`p-2 rounded-2xl ${glassCard} mb-8 inline-flex`}>
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'tasks', label: 'Action Items', icon: CheckCircle2 },
                { id: 'transcript', label: 'Transcript', icon: FileText },
                {
                  id: 'integrations',
                  label: 'Integrations',
                  icon: ExternalLink,
                },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <tab.icon className='w-4 h-4 mr-2' />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* Main Content */}
              <div className='lg:col-span-2'>
                {selectedTab === 'overview' && (
                  <div className={`p-8 rounded-3xl ${glassPanel}`}>
                    <h3
                      className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      Conversation Overview
                    </h3>

                    {/* Key Decisions */}
                    <div className='mb-8'>
                      <h4
                        className={`font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                      >
                        Key Decisions Made
                      </h4>
                      <div className='space-y-3'>
                        {currentConversation.decisions.map((decision, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-xl ${glassCard} flex items-start`}
                          >
                            <CheckCircle2 className='w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0' />
                            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                              {decision}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Participants */}
                    <div>
                      <h4
                        className={`font-semibold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                      >
                        Participants
                      </h4>
                      <div className='flex flex-wrap gap-3'>
                        {currentConversation.participants.map((participant, index) => (
                          <div
                            key={index}
                            className={`px-4 py-2 rounded-xl ${glassCard} flex items-center`}
                          >
                            <Users className='w-4 h-4 mr-2 text-blue-400' />
                            <span
                              className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                            >
                              {participant}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'tasks' && (
                  <div className={`p-8 rounded-3xl ${glassPanel}`}>
                    <div className='flex items-center justify-between mb-6'>
                      <h3
                        className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        Action Items ({currentConversation.actionItems.length})
                      </h3>
                      <div className='flex items-center gap-2'>
                        <button className={`p-2 rounded-lg ${glassCard}`}>
                          <Filter className='w-4 h-4' />
                        </button>
                        <button className={`p-2 rounded-lg ${glassCard}`}>
                          <Search className='w-4 h-4' />
                        </button>
                      </div>
                    </div>

                    <div className='space-y-4'>
                      {currentConversation.actionItems.map(item => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-xl ${glassCard} flex items-center justify-between`}
                        >
                          <div className='flex items-start flex-1'>
                            <div
                              className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 flex-shrink-0 ${
                                item.completed
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-slate-400'
                              }`}
                            >
                              {item.completed && <CheckCircle2 className='w-5 h-5 text-white' />}
                            </div>

                            <div className='flex-1'>
                              <div
                                className={`font-medium mb-1 ${
                                  item.completed
                                    ? 'line-through text-slate-500'
                                    : isDark
                                      ? 'text-white'
                                      : 'text-gray-900'
                                }`}
                              >
                                {item.task}
                              </div>

                              <div className='flex items-center gap-4 text-sm'>
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                                  Assigned: {item.assignee}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    item.priority === 'High'
                                      ? 'bg-red-500/20 text-red-400'
                                      : item.priority === 'Medium'
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-green-500/20 text-green-400'
                                  }`}
                                >
                                  {item.priority}
                                </span>
                                <span className={isDark ? 'text-slate-500' : 'text-slate-500'}>
                                  Due: {new Date(item.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTab === 'transcript' && (
                  <div className={`p-8 rounded-3xl ${glassPanel}`}>
                    <h3
                      className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      Conversation Transcript
                    </h3>

                    <div
                      className={`p-6 rounded-xl font-mono text-sm leading-relaxed ${
                        isDark ? 'bg-slate-800/50 text-slate-300' : 'bg-slate-100/50 text-slate-700'
                      }`}
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {currentConversation.transcript}
                    </div>
                  </div>
                )}

                {selectedTab === 'integrations' && (
                  <div className={`p-8 rounded-3xl ${glassPanel}`}>
                    <h3
                      className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      Project Management Integrations
                    </h3>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      {[
                        {
                          name: 'Asana',
                          color: 'from-pink-500 to-red-500',
                          tasks: 6,
                        },
                        {
                          name: 'ClickUp',
                          color: 'from-purple-500 to-pink-500',
                          tasks: 6,
                        },
                        {
                          name: 'Monday.com',
                          color: 'from-blue-500 to-cyan-500',
                          tasks: 6,
                        },
                        {
                          name: 'Slack',
                          color: 'from-green-500 to-emerald-500',
                          notifications: 8,
                        },
                      ].map(integration => (
                        <div
                          key={integration.name}
                          className={`p-6 rounded-2xl ${glassCard} hover:scale-105 transition-transform`}
                        >
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-r ${integration.color} flex items-center justify-center mb-4`}
                          >
                            <ExternalLink className='w-6 h-6 text-white' />
                          </div>

                          <h4
                            className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                          >
                            {integration.name}
                          </h4>

                          <p
                            className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                          >
                            {integration.name === 'Slack'
                              ? `${integration.notifications} notifications sent`
                              : `${integration.tasks} tasks created`}
                          </p>

                          <button className='w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:scale-105 transition-transform'>
                            View in {integration.name}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className='space-y-6'>
                {/* Analytics */}
                <div className={`p-6 rounded-2xl ${glassCard}`}>
                  <h4 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    This Month
                  </h4>

                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Conversations
                      </span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        127
                      </span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Tasks Created
                      </span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        342
                      </span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Completion Rate
                      </span>
                      <span className='font-semibold text-green-400'>89%</span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Time Saved
                      </span>
                      <span className='font-semibold text-blue-400'>23.5h</span>
                    </div>
                  </div>
                </div>

                {/* Team Performance */}
                <div className={`p-6 rounded-2xl ${glassCard}`}>
                  <h4 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Team Performance
                  </h4>

                  <div className='space-y-3'>
                    {[
                      { name: 'David', completion: 95, color: 'bg-green-400' },
                      { name: 'Sarah', completion: 87, color: 'bg-blue-400' },
                      { name: 'Mike', completion: 82, color: 'bg-yellow-400' },
                    ].map(member => (
                      <div key={member.name} className='flex items-center justify-between'>
                        <div className='flex items-center'>
                          <div className={`w-8 h-8 rounded-full ${member.color} mr-3`}></div>
                          <span
                            className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                          >
                            {member.name}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        >
                          {member.completion}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div
                  className={`p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30`}
                >
                  <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Ready to get started?
                  </h4>

                  <p className={`text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Join 40+ agencies already using Qylon to capture every client interaction.
                  </p>

                  <button className='w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-transform mb-2'>
                    Start Free Trial
                  </button>

                  <button
                    className={`w-full py-2 border border-blue-500/50 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-500/10 transition-colors`}
                  >
                    Schedule Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        {currentStep === 0 && (
          <div className='text-center mt-16'>
            <div className={`p-8 rounded-3xl ${glassPanel} max-w-2xl mx-auto`}>
              <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Experience the Full Platform
              </h3>

              <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                This demo shows just a glimpse of Qylon's capabilities. See how it transforms your
                entire client communication workflow.
              </p>

              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <button className='px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform flex items-center'>
                  Start Free Trial
                  <ArrowRight className='w-5 h-5 ml-2' />
                </button>

                <button
                  className={`px-8 py-4 border border-blue-500/50 text-blue-400 rounded-xl font-semibold hover:bg-blue-500/10 transition-colors`}
                >
                  Schedule Personal Demo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDemo;
