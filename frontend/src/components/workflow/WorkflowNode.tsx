// src/components/workflow/WorkflowNode.tsx
import { LucideIcon, X } from "lucide-react";

interface WorkflowNodeProps {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  onRemove?: (id: string) => void;
  onClick?: (id: string) => void;
}

export default function WorkflowNode({ id, label, icon: Icon, color, onRemove, onClick }: WorkflowNodeProps) {
  return (
    <div
      onClick={() => onClick?.(id)}
      className="relative bg-white border-2 border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer group"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.(id);
        }}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900">{label}</h4>
        </div>
      </div>
    </div>
  );
}