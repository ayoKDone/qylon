// src/components/dashboard/layout/Navbar.tsx
import { useState } from 'react';
import { FiBell, FiSun, FiMoon, FiUser, FiChevronDown, FiLogOut, FiMenu } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

type NavbarProps = {
  title: string;
  subtitle?: string;
  userName?: string;
  avatarUrl?: string;
};

export default function Navbar({ title, subtitle, userName = 'Amaka', avatarUrl }: NavbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className='flex items-center justify-between px-5 py-4  rounded-2xl mt-3'>
      <div className='left xui-d-flex xui-flex-ai-center gap-2'>
        <div className='xui-w-40 xui-h-40 xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-bdr-rad-circle xui-bdr-w-1 xui-bdr-style-solid xui-bdr-fade xui-opacity-6 xui-cursor-pointer menu'>
          <FiMenu size={20} />
        </div>
        <div className=''>
          <h1 className='font-bold text-lg'>{title}</h1>
          {subtitle && <p className='text-sm text-gray-500'>{subtitle}</p>}
        </div>
      </div>

      <div className='right flex justify-between gap-2'>
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className='p-4 rounded-full hover:bg-gray-400/40 bg-white border border-gray-200'
        >
          {isDarkMode ? (
            <FiMoon className='text-black' size={16} />
          ) : (
            <FiSun className='text-black' size={16} />
          )}
        </button>

        {/* Notifications Bell */}
        <button className='p-4 rounded-full hover:bg-gray-400/40 bg-white border border-gray-200 relative'>
          <FiBell className='text-black' size={16} />
          <span className='absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full'></span>
        </button>

        {/* User Profile Dropdown */}
        <div className='flex items-center relative'>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className='flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-2xl hover:bg-gray-50 transition-colors'
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt='User Avatar'
                className='xui-w-32 xui-h-32 xui-bdr-rad-circle xui-img-cover'
              />
            ) : (
              <div className='xui-w-30 xui-h-30 xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-bdr-rad-circle bg-blue-950 xui-text-white'>
                <FiUser size={18} />
              </div>
            )}
            <span className='xui-font-sz-90 xui-font-w-500 xui-text-black hidden sm:inline'>
              {userName}
            </span>
            <FiChevronDown
              className={`text-gray-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              size={16}
            />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className='absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-100'>
              <button
                className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left'
                onClick={() => navigate('/dashboard/settings')}
              >
                <FiUser size={16} className='text-gray-600' />
                <span className='text-sm text-gray-700'>Profile</span>
              </button>
              <button className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left'>
                <FiBell size={16} className='text-gray-600' />
                <span className='text-sm text-gray-700'>Notifications</span>
              </button>
              <div className='border-t border-gray-200'></div>
              <button className='w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left'>
                <FiLogOut size={16} className='text-red-600' />
                <span className='text-sm text-red-600'>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
