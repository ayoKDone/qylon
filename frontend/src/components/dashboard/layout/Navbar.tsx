// src/components/dashboard/layout/Navbar.tsx

import { FiBell, FiLogOut, FiMenu, FiSearch, FiSun, FiUser } from 'react-icons/fi';
import { authService } from '../../../services/authService';
import type { NavbarProps } from '../../../types/dashboard';

export default function Navbar({ title, subtitle, userName = 'User', avatarUrl }: NavbarProps) {
  return (
    <nav className='flex items-center justify-between px-5 py-4 bg-[#f5f7ff] shadow-sm rounded-2xl mt-3'>
      <div className='left'>
        <div className='flex gap-2'>
          <div className='xui-w-40 xui-h-40 xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-bdr-rad-circle xui-bdr-w-1 xui-bdr-style-solid xui-bdr-fade xui-opacity-6 xui-cursor-pointer menu'>
            <FiMenu size={20} />
          </div>
          <div className=''>
            <h1 className='font-bold text-lg'>{title}</h1>
            {subtitle && <p className='text-sm text-gray-500'>{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className='right flex justify-between gap-2'>
        <button className='p-3 rounded-full hover:bg-gray-400/40 bg-white border border-gray-200'>
          <FiSun className='text-black' size={18} />
        </button>
        <button className='p-3 rounded-full hover:bg-gray-400/40 bg-white border border-gray-200 xui-d-none xui-md-d-inline-flex'>
          <FiBell className='text-black' size={18} />
        </button>
        <button className='p-3 rounded-full hover:bg-gray-400/40 bg-white border border-gray-200 xui-d-none xui-md-d-inline-flex'>
          <FiSearch className='text-black' size={18} />
        </button>
        <button
          className='p-3 rounded-full hover:bg-gray-400/40 relative bg-white border border-gray-200'
          onClick={authService.logout}
        >
          <FiLogOut className='text-black' size={18} />
        </button>

        {/* User profile */}
        <div className='hidden lg:flex items-center gap-2 bg-white border border-gray-200 px-3 rounded-2xl'>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt='User Avatar'
              className='xui-w-32 xui-h-32 xui-bdr-rad-circle xui-img-cover'
            />
          ) : (
            <div className='xui-w-30 xui-h-30 xui-d-flex xui-flex-ai-center xui-flex-jc-center xui-bdr-rad-circle xui-bg-black xui-text-white'>
              <FiUser size={18} />
            </div>
          )}
          <span className='xui-font-sz-90 xui-font-w-500 xui-text-black'>{userName}</span>
        </div>
      </div>
    </nav>
  );
}
