// src/components/IntegrationCard.tsx
import React from 'react';
import { ArrowRight, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import {
  MdEmail,
  MdTask,
  MdPlayArrow,
  MdOutlineContentPaste,
  MdNotifications,
  MdCheckCircle,
  MdVideoCall,
  MdEvent,
} from 'react-icons/md';
import { IoMdTimer, IoMdCheckmarkCircle } from 'react-icons/io';
import { BsLightningChargeFill, BsFileEarmarkText } from 'react-icons/bs';
import { FaBolt, FaRobot, FaDatabase, FaFilter } from 'react-icons/fa';
import { HiDocumentAdd, HiUserAdd } from 'react-icons/hi';
import { AiFillThunderbolt } from 'react-icons/ai';

interface Integration {
  id: string;
  name: string;
  app1: {
    name: string;
    icon: string;
    bgColor: string;
  };
  app2: {
    name: string;
    icon: string;
    bgColor: string;
  };
  isActive: boolean;
  updatedDate: string;
  author: {
    name: string;
    avatar: string;
  };
  onClick?: () => void;
}

interface IntegrationCardProps {
  integration: Integration;
  onToggle?: (id: string, isActive: boolean) => void;
  onMenuClick?: (id: string) => void;
}

// Icon mapping function for triggers and actions
const getIcon = (name: string) => {
  const iconMap: Record<string, React.JSX.Element> = {
    // Triggers
    'Meeting Ends': <MdVideoCall className='w-6 h-6 text-white' />,
    'Action Item Created': <MdCheckCircle className='w-6 h-6 text-white' />,
    'Timer Expires': <IoMdTimer className='w-6 h-6 text-white' />,
    'Event Scheduled': <MdEvent className='w-6 h-6 text-white' />,
    'Document Updated': <BsFileEarmarkText className='w-6 h-6 text-white' />,
    'Task Completed': <IoMdCheckmarkCircle className='w-6 h-6 text-white' />,
    Trigger: <AiFillThunderbolt className='w-6 h-6 text-white' />,

    // Actions
    'Send Email': <MdEmail className='w-6 h-6 text-white' />,
    'Create Task': <MdTask className='w-6 h-6 text-white' />,
    'Generate Content': <MdOutlineContentPaste className='w-6 h-6 text-white' />,
    'Send Notification': <MdNotifications className='w-6 h-6 text-white' />,
    'Update Database': <FaDatabase className='w-6 h-6 text-white' />,
    'Create Document': <HiDocumentAdd className='w-6 h-6 text-white' />,
    'Add User': <HiUserAdd className='w-6 h-6 text-white' />,
    'Execute Action': <MdPlayArrow className='w-6 h-6 text-white' />,

    // Conditions
    'If/Then Logic': <FaFilter className='w-6 h-6 text-white' />,
    'Condition Check': <FaBolt className='w-6 h-6 text-white' />,
    'AI Process': <FaRobot className='w-6 h-6 text-white' />,
  };

  return iconMap[name] || <BsLightningChargeFill className='w-6 h-6 text-white' />;
};

// User avatar component with initials fallback
const UserAvatar = ({ name }: { name: string }) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500',
    'bg-orange-500',
  ];

  const colorIndex =
    name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  return (
    <div className={`w-5 h-5 rounded-full ${colors[colorIndex]} flex items-center justify-center`}>
      <span className='text-[10px] font-semibold text-white'>{initials}</span>
    </div>
  );
};

export default function IntegrationCard({ integration, onToggle }: IntegrationCardProps) {
  const [isActive, setIsActive] = useState(integration.isActive);
  const [showMenu, setShowMenu] = useState(false);

  const handleToggle = () => {
    const newState = !isActive;
    setIsActive(newState);
    onToggle?.(integration.id, newState);
  };

  return (
    <div
      className='bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer group space-y-3'
      onClick={integration.onClick}
    >
      {/* App Icons */}
      <div className='flex items-center justify-center gap-3 mb-10 mt-4'>
        <div
          className={`w-12 h-12 rounded-lg ${integration.app1.bgColor} flex items-center justify-center shadow-sm`}
        >
          {getIcon(integration.app1.name)}
        </div>
        <ArrowRight className='w-5 h-5 text-gray-400' />
        <div
          className={`w-12 h-12 rounded-lg ${integration.app2.bgColor} flex items-center justify-center shadow-sm`}
        >
          {getIcon(integration.app2.name)}
        </div>
      </div>

      {/* Content */}
      <div>
        <div className='flex items-start justify-between mb-2'>
          <h3 className='text-base font-semibold text-gray-900'>{integration.name}</h3>
          <div className='flex items-center gap-2'>
            {/* Toggle */}
            <button
              onClick={e => {
                e.stopPropagation();
                handleToggle();
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isActive ? 'bg-blue-950' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <p className='text-xs text-gray-500 mb-3'>Updated {integration.updatedDate}</p>

        {/* Author */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            <UserAvatar name={integration.author.name} />
            <span className='text-xs text-gray-600'>by {integration.author.name}</span>
          </div>
          {/* Menu */}
          <div className='relative'>
            <button
              onClick={e => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className='p-1 hover:bg-gray-100 rounded transition-colors'
            >
              <MoreHorizontal className='w-5 h-5 text-gray-400' />
            </button>

            {showMenu && (
              <>
                <div
                  className='fixed inset-0 z-10'
                  onClick={e => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                ></div>
                <div className='absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]'>
                  <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'>
                    Edit
                  </button>
                  <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'>
                    Duplicate
                  </button>
                  <button className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'>
                    Save as Template
                  </button>
                  <div className='border-t border-gray-100 my-1'></div>
                  <button className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50'>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
