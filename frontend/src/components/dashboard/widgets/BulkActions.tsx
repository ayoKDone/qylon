// src/widgets/BulkActions.tsx
import { Download, CheckCircle2, X } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onMarkComplete: () => void;
  onExport: () => void;
  onCancel?: () => void;
  allSelectedCompleted?: boolean;
}

export default function BulkActions({
  selectedCount,
  onMarkComplete,
  onExport,
  onCancel,
  allSelectedCompleted = false,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'>
      <div className='xui-d-flex xui-flex-ai-center gap-2'>
        <CheckCircle2 className='w-5 h-5 text-blue-950' />
        <span className='text-sm font-medium text-blue-900'>
          {selectedCount} task{selectedCount > 1 ? 's' : ''} selected
        </span>
      </div>
      <div className='xui-d-flex gap-3'>
        <button
          onClick={onMarkComplete}
          className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${
            allSelectedCompleted
              ? 'bg-orange-600 hover:bg-orange-700'
              : 'bg-blue-950 hover:bg-blue-900'
          }`}
        >
          {allSelectedCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
        </button>
        <button
          onClick={onExport}
          className='px-4 py-2 bg-white border border-blue-300 text-blue-950 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors xui-d-flex xui-flex-ai-center gap-2'
        >
          <Download className='w-4 h-4' />
          Export to PM Tool
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className='px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors xui-d-flex xui-flex-ai-center'
            title='Clear selection'
          >
            <X className='w-4 h-4' />
          </button>
        )}
      </div>
    </div>
  );
}
