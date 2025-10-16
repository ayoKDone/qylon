import React from 'react';
import { ArrowRight, Star, Zap } from 'lucide-react';
import {
  MdEmail,
  MdTaskAlt,
  MdOutlineContentPaste,
  MdVideoCall,
  MdEvent,
  MdCheckCircle,
  MdNotifications,
} from 'react-icons/md';
import { IoMdTimer, IoMdCheckmarkCircle } from 'react-icons/io';
import { FaFilter, FaBolt } from 'react-icons/fa';

// 🧠 Icon mapping for triggers, actions, and conditions
const getIcon = (name: string): React.JSX.Element => {
  const iconMap: Record<string, React.JSX.Element> = {
    // Triggers
    'Meeting Ends': <MdVideoCall className='w-6 h-6 text-white' />,
    'Action Item Created': <MdCheckCircle className='w-6 h-6 text-white' />,
    'Timer Expires': <IoMdTimer className='w-6 h-6 text-white' />,
    'Event Scheduled': <MdEvent className='w-6 h-6 text-white' />,
    'Task Completed': <IoMdCheckmarkCircle className='w-6 h-6 text-white' />,

    // Actions
    'Send Email': <MdEmail className='w-6 h-6 text-white' />,
    'Create Task': <MdTaskAlt className='w-6 h-6 text-white' />,
    'Generate Content': <MdOutlineContentPaste className='w-6 h-6 text-white' />,
    'Send Notification': <MdNotifications className='w-6 h-6 text-white' />,

    // Conditions
    'If/Then Logic': <FaFilter className='w-6 h-6 text-white' />,
    'Condition Check': <FaBolt className='w-6 h-6 text-white' />,
  };

  return iconMap[name] || <FaBolt className='w-6 h-6 text-white' />;
};

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  app1: { name: string; bgColor: string };
  app2: { name: string; bgColor: string };
  useCase: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  usageCount: number;
}

interface TemplateCardProps {
  template: Template;
  onUseTemplate?: (id: string) => void;
}

export default function TemplateCard({ template, onUseTemplate }: TemplateCardProps) {
  const complexityConfig = {
    beginner: { color: 'bg-green-100 text-green-700', label: 'Beginner' },
    intermediate: {
      color: 'bg-amber-100 text-amber-700',
      label: 'Intermediate',
    },
    advanced: { color: 'bg-red-100 text-red-700', label: 'Advanced' },
  };

  const complexity = complexityConfig[template.complexity];

  return (
    <div className='bg-white rounded-lg border border-gray-200 p-6 cursor-pointer'>
      {/* App Icons */}
      <div className='flex items-center justify-center gap-3 mb-5'>
        <div
          className={`w-12 h-12 rounded-lg ${template.app1.bgColor} flex items-center justify-center`}
        >
          {getIcon(template.app1.name)}
        </div>
        <ArrowRight className='w-5 h-5 text-gray-400' />
        <div
          className={`w-12 h-12 rounded-lg ${template.app2.bgColor} flex items-center justify-center`}
        >
          {getIcon(template.app2.name)}
        </div>
      </div>

      {/* Content */}
      <div>
        <div className='flex items-start justify-between mb-2'>
          <h3 className='text-base font-semibold text-gray-900'>{template.name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${complexity.color}`}>
            {complexity.label}
          </span>
        </div>

        <p className='text-sm text-gray-600 mb-3'>{template.description}</p>

        {/* Use Case */}
        <div className='mb-3'>
          <div className='flex items-center gap-1.5 text-xs text-gray-500 mb-1'>
            <Zap className='w-3.5 h-3.5' />
            <span className='font-medium'>Use Case:</span>
          </div>
          <p className='text-xs text-gray-700'>{template.useCase}</p>
        </div>

        {/* Stats */}
        <div className='flex items-center gap-4 mb-4 text-xs text-gray-600'>
          <div className='flex items-center gap-1'>
            <Star className='w-3.5 h-3.5 text-amber-500 fill-amber-500' />
            <span>{template.rating}</span>
          </div>
          <span>{template.usageCount} uses</span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onUseTemplate?.(template.id)}
          className='w-full py-2 bg-blue-950 text-white rounded-lg text-sm font-medium hover:bg-blue-900 transition-all'
        >
          Use Template
        </button>
      </div>
    </div>
  );
}
