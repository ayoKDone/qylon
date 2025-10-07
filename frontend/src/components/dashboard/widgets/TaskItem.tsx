// src/components/TaskItem.tsx
import {
  User,
  Calendar,
  Zap,
  Edit2,
  ExternalLink,
  Trash2,
  ChevronDown,
  Circle,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useState } from 'react';

interface TaskAction {
  label: string;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  onClick: () => void;
}

interface TaskItemProps {
  id: string;
  title: string;
  assignee: string;
  date: string;
  meeting: string;
  tags: string[];
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  actions?: TaskAction[];
  onStatusChange?: (id: string, status: string) => void;
  isExpandable?: boolean;
}

export default function TaskItem({
  id,
  title,
  assignee,
  date,
  meeting,
  tags,
  description,
  priority,
  status,
  actions,
  onStatusChange,
  isExpandable = true,
}: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = {
    pending: {
      icon: Circle,
      color: 'text-gray-400',
      bgColor: 'bg-gray-50',
    },
    'in-progress': {
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    overdue: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    completed: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
  };

  const priorityConfig = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-blue-100 text-blue-700',
  };

  const defaultActions: TaskAction[] = [
    {
      label: 'Edit',
      icon: Edit2,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => console.log('Edit', id),
    },
    {
      label: 'Open in clickup',
      icon: ExternalLink,
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
      onClick: () => console.log('Open', id),
    },
    {
      label: 'Delete',
      icon: Trash2,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      onClick: () => console.log('Delete', id),
    },
  ];

  const displayActions = actions || defaultActions;
  const StatusIcon = statusConfig[status].icon;

  return (
    <div className="bg-white xui-bdr-rad-1-half border border-gray-200 p-4">
      <div className="xui-d-flex xui-flex-ai-flex-start gap-4">
        {/* Status Icon */}
        <button
          onClick={() => onStatusChange?.(id, status)}
          className={`mt-1 w-6 h-6 rounded-full ${statusConfig[status].bgColor} xui-d-flex xui-flex-ai-center xui-flex-jc-center`}
        >
          <StatusIcon className={`w-4 h-4 ${statusConfig[status].color}`} />
        </button>

        {/* Content */}
        <div className="flex-1">
          {/* Title and Priority */}
          <div className="xui-d-flex xui-flex-ai-flex-start xui-flex-jc-space-between gap-4 mb-2">
            <h3
              className={`text-base font-semibold text-gray-900 ${status === 'completed' ? 'line-through text-slate-300' : ''}`}
            >
              {title}
            </h3>
            <div className="xui-d-flex xui-flex-ai-center gap-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${priorityConfig[priority]}`}
              >
                {priority}
              </span>
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              {isExpandable && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 hover:bg-gray-100 rounded transition-transform"
                >
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{assignee}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>{meeting}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Expanded Description */}
          {isExpanded && description && (
            <p className="text-sm text-gray-600 mb-3 pb-3 border-b border-gray-100">
              {description}
            </p>
          )}

          {/* Actions */}
          {isExpanded && (
            <div className="flex gap-2">
              {displayActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${action.bgColor || 'bg-gray-100'} ${action.iconColor || 'text-gray-700'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
