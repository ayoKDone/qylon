// src/components/FilterTabs.tsx
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface FilterTabsProps {
  tabs?: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  onSearch?: (value: string) => void;
  onFilter?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  searchPlaceholder?: string;
}

export default function FilterTabs({
  tabs = [
    { id: 'all', label: 'View all' },
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' },
    { id: 'archived', label: 'Archived' },
    { id: 'templates', label: 'Templates' },
  ],
  defaultTab = 'all',
  onTabChange,
  onSearch,

  onAction,
  actionLabel = 'New Integration',
  searchPlaceholder = 'Search',
}: FilterTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchValue, setSearchValue] = useState('');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <div className='flex items-center justify-between gap-4 pb-4'>
      {/* Tabs */}
      <div className='flex items-center gap-1'>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === tab.id ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && <span className='ml-1.5 text-xs'>({tab.count})</span>}
            {activeTab === tab.id && (
              <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500'></div>
            )}
          </button>
        ))}
      </div>

      {/* Search and Actions */}
      <div className='flex items-center gap-3'>
        {/* Search */}
        <div className='relative xui-form-box'>
          <Search className='xui-pos-absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
          <input
            type='text'
            className='w-full pl-10 pr-4 py-2 xui-form-input'
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Filter Button */}
        {/* <button
          onClick={onFilter}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter
        </button> */}

        {/* Action Button */}
        <button
          onClick={onAction}
          className='flex items-center gap-2 px-4 py-2 xui-bg-black text-white rounded-lg text-sm font-medium transition-all shadow-sm'
        >
          <Plus className='w-4 h-4' />
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
