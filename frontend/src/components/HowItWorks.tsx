import React from 'react';
import { Play, Cpu, FolderSync as Sync, CheckCircle } from 'lucide-react';
import  { useTheme } from '../contexts/ThemeContext';

const HowItWorks: React.FC = () => {
  const { isDark } = useTheme();

  const steps = [
    {
      number: '01',
      icon: Play,
      title: 'RECORD MEETING',
      description:
        'Our AI bot joins automatically or use our desktop/mobile apps to capture any conversation.',
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      number: '02',
      icon: Cpu,
      title: 'AI EXTRACTION',
      description:
        'Advanced neural networks analyze the conversation and identify action items, assignees, and deadlines.',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      number: '03',
      icon: Sync,
      title: 'AUTO SYNC',
      description:
        'Tasks are instantly created in your preferred project management platform with all relevant context.',
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      number: '04',
      icon: CheckCircle,
      title: 'GET THINGS DONE',
      description:
        'Focus on execution instead of manual task creation. Your team stays aligned and productive.',
      gradient: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <section
      id='how-it-works'
      className={`py-24 relative overflow-hidden transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-gray-950 to-black'
          : 'bg-gradient-to-br from-gray-100 to-white'
      }`}
    >
      {/* Background Elements */}
      <div className='absolute inset-0'>
        <div
          className={`absolute top-1/4 right-1/4 w-72 h-72 rounded-full filter blur-3xl animate-pulse ${
            isDark ? 'bg-cyan-500/10' : 'bg-cyan-500/20'
          }`}
        ></div>
        <div
          className={`absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full filter blur-3xl animate-pulse delay-1000 ${
            isDark ? 'bg-purple-500/10' : 'bg-purple-500/20'
          }`}
        ></div>
      </div>

      <div className='container mx-auto px-6 relative z-10'>
        <div className='text-center mb-16'>
          <div className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm tracking-wide mb-6'>
            <span className='w-2 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full mr-2 animate-pulse'></span>
            THE PROCESS
          </div>
          <h2 className='text-3xl sm:text-4xl md:text-6xl font-bold mb-6 px-4'>
            <span
              className={`bg-gradient-to-r bg-clip-text text-transparent ${
                isDark
                  ? 'from-white via-purple-200 to-cyan-200'
                  : 'from-gray-900 via-purple-700 to-cyan-700'
              }`}
            >
              HOW QYLON
            </span>
            <br />
            <span className='bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent'>
              TRANSFORMS MEETINGS
            </span>
          </h2>
        </div>

        <div className='max-w-6xl mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 px-4'>
            {steps.map((step, index) => (
              <div
                key={index}
                className='relative group'
                style={{
                  animationDelay: `${index * 200}ms`,
                }}
              >
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className='hidden xl:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-600 to-gray-800 transform -translate-y-1/2 z-0'>
                    <div className='w-full h-full bg-gradient-to-r from-cyan-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500'></div>
                  </div>
                )}

                <div
                  className={`relative p-6 md:p-8 rounded-2xl border transition-all duration-300 hover:scale-105 text-center ${
                    isDark
                      ? 'bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-800 hover:border-cyan-500/30'
                      : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200 hover:border-cyan-500/50'
                  }`}
                >
                  {/* Glow Effect */}
                  <div
                    className={`absolute -inset-0.5 bg-gradient-to-r rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur ${
                      isDark
                        ? 'from-cyan-500/10 to-purple-500/10'
                        : 'from-cyan-500/20 to-purple-500/20'
                    }`}
                  ></div>

                  <div className='relative'>
                    {/* Step Number */}
                    <div
                      className={`text-4xl md:text-6xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-4 ${
                        isDark ? 'from-gray-600 to-gray-800' : 'from-gray-400 to-gray-600'
                      }`}
                    >
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div
                      className={`w-16 md:w-20 h-16 md:h-20 bg-gradient-to-r ${step.gradient} rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}
                    >
                      <step.icon className='w-8 md:w-10 h-8 md:h-10 text-white' />
                    </div>

                    {/* Content */}
                    <h3
                      className={`text-lg md:text-xl font-bold mb-3 md:mb-4 tracking-wide ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`leading-relaxed text-sm md:text-base ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
