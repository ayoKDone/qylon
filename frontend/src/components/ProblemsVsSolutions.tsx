import React from 'react';
import { X, Check, FileText, Mic, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ProblemsVsSolutions: React.FC = () => {
  const { isDark } = useTheme();

  const comparisons = [
    {
      icon: FileText,
      title: 'The Problem with Note-Taking Apps',
      subtitle: 'What Happens with Notion/Obsidian/Roam',
      problem: {
        quote: "I'll just write better notes this time",
        issues: [
          'Frantically type during meetings. Miss important details while focusing on notes.',
          'Spend 20 minutes after each meeting organizing and formatting.',
          'Action items buried in paragraphs of text.',
          'No one reads the notes anyway.',
        ],
      },
      solution: {
        title: 'AI Does the Note-Taking For You',
        benefits: [
          'Listen and engage fully in conversations.',
          'AI captures everything and extracts only what matters—action items that become real tasks in your workflow.',
          'No formatting, no organizing, no post-meeting work.',
        ],
      },
    },
    {
      icon: Mic,
      title: 'The Problem with Recording Tools',
      subtitle: 'What Happens with Otter.ai/Rev/Fathom',
      problem: {
        quote: "Here's your 47-minute transcript",
        issues: [
          'Record meetings and get walls of text.',
          'Search through endless transcripts to find action items.',
          'Manually copy tasks into your PM tool.',
          'Action items get lost in the noise. Transcripts collect digital dust.',
        ],
      },
      solution: {
        title: 'Intelligence, Not Just Transcription',
        benefits: [
          'Skip the transcript. AI identifies what needs to happen next and who needs to do it.',
          'Action items automatically become tasks in ClickUp, Asana, or Monday.com.',
          'Pure signal, zero noise.',
        ],
      },
    },
    {
      icon: Settings,
      title: 'The Problem with Manual Workflow Tools',
      subtitle: 'What Happens with ClickUp/Asana Alone',
      problem: {
        quote: 'Someone needs to create these tasks',
        issues: [
          'Rely on meeting organizers to remember and manually create tasks.',
          'Inconsistent task details across team members.',
          'Action items fall through cracks during busy periods.',
          'No connection between conversations and tasks.',
        ],
      },
      solution: {
        title: 'Conversations Become Tasks Automatically',
        benefits: [
          'Every discussion automatically flows into your existing PM workflow.',
          'Consistent task creation across all meetings.',
          'Nothing gets forgotten, even during your busiest weeks.',
          'Complete audit trail from conversation to completion.',
        ],
      },
    },
  ];

  return (
    <section className={`py-24 transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-16'>
          <div className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium tracking-wide mb-6'>
            <span className='w-2 h-2 bg-gradient-to-r from-red-400 to-orange-400 rounded-full mr-2 animate-pulse'></span>
            Why Existing Tools Fail
          </div>
          <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold mb-6 px-4'>
            <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
              Stop fighting broken workflows
            </span>
          </h2>
        </div>

        <div className='max-w-6xl mx-auto space-y-12 md:space-y-16 px-4'>
          {comparisons.map((comparison, index) => (
            <div
              key={index}
              className={`p-6 md:p-8 rounded-xl border ${
                isDark ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-200'
              }`}
            >
              {/* Header */}
              <div className='text-center mb-8 md:mb-12'>
                <div className='w-12 md:w-16 h-12 md:h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 md:mb-6 mx-auto'>
                  <comparison.icon className='w-6 md:w-8 h-6 md:h-8 text-white' />
                </div>
                <h3
                  className={`text-xl sm:text-2xl md:text-3xl font-bold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {comparison.title}
                </h3>
                <p className={`text-base md:text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {comparison.subtitle}
                </p>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8'>
                {/* Problem Side */}
                <div
                  className={`p-4 md:p-6 rounded-xl border ${
                    isDark ? 'border-red-500/20 bg-red-950/20' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className='flex items-center mb-4'>
                    <div className='w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3'>
                      <X className='w-5 h-5 text-white' />
                    </div>
                    <span className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                      The Problem
                    </span>
                  </div>

                  <div
                    className={`text-base md:text-lg font-medium mb-4 italic ${
                      isDark ? 'text-red-300' : 'text-red-800'
                    }`}
                  >
                    "{comparison.problem.quote}"
                  </div>

                  <ul className='space-y-3'>
                    {comparison.problem.issues.map((issue, issueIndex) => (
                      <li
                        key={issueIndex}
                        className={`flex items-start text-sm ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        <div className='w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0'></div>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Solution Side */}
                <div
                  className={`p-4 md:p-6 rounded-xl border ${
                    isDark ? 'border-cyan-500/20 bg-cyan-950/20' : 'border-cyan-200 bg-cyan-50'
                  }`}
                >
                  <div className='flex items-center mb-4'>
                    <div className='w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mr-3'>
                      <Check className='w-5 h-5 text-white' />
                    </div>
                    <span className={`font-semibold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                      The Qylon Way
                    </span>
                  </div>

                  <div
                    className={`text-base md:text-lg font-medium mb-4 ${
                      isDark ? 'text-cyan-300' : 'text-cyan-800'
                    }`}
                  >
                    {comparison.solution.title}
                  </div>

                  <ul className='space-y-3'>
                    {comparison.solution.benefits.map((benefit, benefitIndex) => (
                      <li
                        key={benefitIndex}
                        className={`flex items-start text-sm ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        <div className='w-2 h-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full mt-2 mr-3 flex-shrink-0'></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Arrow */}
              <div className='flex justify-center my-4 md:my-6'>
                <div className='text-4xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent'>
                  ↓
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemsVsSolutions;
