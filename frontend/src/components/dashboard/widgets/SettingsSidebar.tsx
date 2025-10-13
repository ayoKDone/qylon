// src/components/SettingsSidebar.tsx
import { LucideIcon, ChevronRight } from 'lucide-react';

interface SettingsItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SettingsSidebarProps {
  items: SettingsItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
}

export default function SettingsSidebar({ items, activeItem, onItemClick }: SettingsSidebarProps) {
  return (
    <div className='space-y-1'>
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={`w-full xui-d-flex xui-flex-ai-center xui-flex-jc-space-between p-3 rounded-lg transition-colors ${
              isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className='xui-d-flex xui-flex-ai-center gap-3'>
              <Icon className='w-5 h-5' />
              <span className='font-medium'>{item.label}</span>
            </div>
            <ChevronRight className='w-5 h-5' />
          </button>
        );
      })}
    </div>
  );
}
