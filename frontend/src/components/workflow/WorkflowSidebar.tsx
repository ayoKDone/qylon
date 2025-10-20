// src/components/workflow/WorkflowSidebar.tsx
import { LucideIcon } from 'lucide-react';

export interface WorkflowItem {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  type: 'trigger' | 'action' | 'condition';
}

interface WorkflowSidebarProps {
  items: WorkflowItem[];
  title: string;
  onDragStart?: (item: WorkflowItem) => void;
}

export default function WorkflowSidebar({ items, title, onDragStart }: WorkflowSidebarProps) {
  return (
    <div>
      <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3'>{title}</h3>
      <div className='space-y-2'>
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => onDragStart?.(item)}
              className='flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm cursor-move transition-shadow'
            >
              <div
                className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className='w-4 h-4 text-black' />
              </div>
              <div className='flex-1 min-w-0'>
                <h4 className='text-sm font-medium text-gray-900'>{item.label}</h4>
                <p className='text-xs text-gray-500 mt-0.5'>{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
