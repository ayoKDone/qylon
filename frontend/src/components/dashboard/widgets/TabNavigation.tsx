// src/components/TabNavigation.tsx
import { LucideIcon } from 'lucide-react';
import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TabNavigationProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
}

export default function TabNavigation({
  tabs,
  defaultTab,
  onTabChange,
}: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="xui-d-flex xui-flex-ai-center gap-2">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`xui-d-flex xui-flex-ai-center gap-2 px-3 py-2.5 font-medium text-sm transition-all xui-pos-relative ${
              isActive
                ? 'text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg'
            }`}
          >
            <Icon className="w-5 h-5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
