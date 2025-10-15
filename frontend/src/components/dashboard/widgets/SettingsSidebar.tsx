// src/components/SettingsSidebar.tsx
import { LucideIcon } from 'lucide-react';

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
    <>
    <section className='xui-d-flex bg-[#F1F1F1] qylon-tab'>
      {items.map(item => {
        const isActive = activeItem === item.id;

        return (
          <div key={item.id} onClick={() => onItemClick(item.id)} className={`xui-px-1-half xui-py-1 ${isActive ? 'qylon-tab-active' : ''} xui-cursor-pointer`}>
            <span>{item.label}</span>
          </div>
        );
      })}
    </section>
    </>
  );
}
