// src/components/QuickActions.tsx
import { LucideIcon } from 'lucide-react';

interface Action {
  icon: LucideIcon;
  label: string;
  iconColor: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: Action[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="space-y-3">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            onClick={action.onClick}
            className="w-full xui-d-flex xui-flex-ai-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <Icon className={`w-5 h-5 ${action.iconColor}`} />
            <span className="text-gray-700 font-medium">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Export the type so other files can use it
export type { Action };
