import { Brain, Clock, Mic, Shield, Target, Zap } from 'lucide-react';
import React from 'react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Mic,
      title: 'Universal Recording',
      description:
        'Capture conversations from any platform - Zoom, Teams, Google Meet, or record directly from desktop and mobile.',
    },
    {
      icon: Brain,
      title: 'AI-Powered Extraction',
      description:
        'Advanced neural networks identify action items, assignees, due dates, and priorities with 95% accuracy.',
    },
    {
      icon: Zap,
      title: 'Instant Integration',
      description:
        'Tasks automatically sync to your project management tools within seconds. Zero manual input required.',
    },
    {
      icon: Target,
      title: 'Smart Prioritization',
      description:
        'AI analyzes context and urgency to automatically assign priority levels and suggest optimal deadlines.',
    },
    {
      icon: Clock,
      title: 'Real-time Processing',
      description:
        'Live transcription and task extraction during meetings. See action items appear as they are discussed.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description:
        'Bank-level encryption, SOC 2 compliance, and GDPR adherence. Your data remains completely private.',
    },
  ];

  return (
    <section id='features' className='py-24 relative overflow-hidden'>
      {/* Liquid Background */}
      <div className='absolute inset-0'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900'></div>

        {/* Animated liquid orbs */}
        <div
          className='liquid-orb w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-500'
          style={{
            top: '20%',
            left: '80%',
            animation: 'liquidDrift 30s linear infinite reverse',
          }}
        ></div>
        <div
          className='liquid-orb w-64 h-64 bg-gradient-to-r from-violet-500 to-purple-600'
          style={{
            bottom: '30%',
            left: '5%',
            animation: 'liquidPulse 20s ease-in-out infinite',
          }}
        ></div>
      </div>

      <div className='container mx-auto px-6'>
        <div className='text-center mb-16'>
          <div className='inline-flex items-center px-6 py-3 glass rounded-full text-white text-sm font-medium tracking-wide mb-6'>
            <span className='w-2 h-2 bg-gradient-to-r from-cyan-300 to-pink-300 rounded-full mr-3 animate-pulse'></span>
            Advanced Capabilities
          </div>
          <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold mb-6 px-4'>
            <span className='text-white drop-shadow-lg'>Never miss an action item again</span>
          </h2>
          <p className='text-lg sm:text-xl max-w-3xl mx-auto px-4 text-white/80 drop-shadow-sm'>
            Qylon transforms every conversation into actionable tasks with precision and
            intelligence.
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto px-4 relative z-10'>
          {features.map((feature, index) => (
            <div
              key={index}
              className='p-6 md:p-8 glass-heavy rounded-3xl transition-all duration-500 hover:scale-105 hover:shadow-2xl'
            >
              <div className='w-14 h-14 bg-gradient-to-r from-cyan-400 via-pink-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg'>
                <feature.icon className='w-6 h-6 text-white' />
              </div>

              <h3 className='text-lg md:text-xl font-bold mb-4 text-white drop-shadow-sm'>
                {feature.title}
              </h3>
              <p className='text-sm md:text-base leading-relaxed text-white/80'>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
