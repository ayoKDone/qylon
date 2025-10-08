// src/components/dashboard/layout/Navigator.tsx
import { FaRegCircleCheck } from 'react-icons/fa6';
import { FiActivity, FiBarChart2, FiSettings } from 'react-icons/fi';
import { GoWorkflow } from 'react-icons/go';
import { GrHistory } from 'react-icons/gr';
import { HiOutlineLink } from 'react-icons/hi';
import { IoVideocamOutline } from 'react-icons/io5';
import { LuBuilding2 } from 'react-icons/lu';
import { Link, useLocation } from 'react-router-dom';
import RecordingStatus from './RecordingStatus';

export default function Navigator() {
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <FiActivity /> },
    {
      to: '/dashboard/live-meetings',
      label: 'Live Meetings',
      icon: <IoVideocamOutline />,
    },
    {
      to: '/dashboard/meeting-history',
      label: 'Meeting History',
      icon: <GrHistory />,
    },
    {
      to: '/dashboard/tasks',
      label: 'Action Items',
      icon: <FaRegCircleCheck />,
    },
    { to: '/dashboard/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
    { to: '/dashboard/team', label: 'Workflow', icon: <GoWorkflow /> },
    { to: '/dashboard/clients', label: 'Clients', icon: <LuBuilding2 /> },
    {
      to: '/dashboard/calendar',
      label: 'Integration',
      icon: <HiOutlineLink />,
    },
    { to: '/dashboard/settings', label: 'Settings', icon: <FiSettings /> },
  ];

  return (
    <div className='navigator'>
      <div className='brand'>
        <img
          src='/src/assets/images/qylon-logo.png'
          alt='Qylon Logo'
          className='xui-img-100 xui-h-auto'
        />
      </div>

      <div className='links'>
        {links.map(({ to, label, icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`link-box xui-d-flex xui-flex-ai-center gap-3 xui-bdr-rad-2 xui-text-[var(--black)] ${
                isActive
                  ? 'xui-text-[var(--black)] border border-[var(--gray-300)] xui-bdr-rad-2'
                  : 'text-gray-600'
              }`}
            >
              <div className='icon text-lg'>{icon}</div>
              <span className='text'>{label}</span>
            </Link>
          );
        })}
        {/* Recording Card Below */}
        <div className='bottom-fixed'>
          <RecordingStatus />
        </div>
      </div>
    </div>
  );
}
