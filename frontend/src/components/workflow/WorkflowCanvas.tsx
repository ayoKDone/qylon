// src/components/workflow/WorkflowCanvas.tsx
import { Plus } from "lucide-react";

interface WorkflowCanvasProps {
  children?: React.ReactNode;
  onAddTrigger?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
}

export default function WorkflowCanvas({ children, onAddTrigger, onDrop, onDragOver }: WorkflowCanvasProps) {
  return (
    <div
      className="flex-1 bg-gray-50 rounded-lg p-8 min-h-[500px]"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {children || (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Start Building Your Workflow
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Drag and drop components from the left panel to create your workflow
          </p>
          <button
            onClick={onAddTrigger}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Trigger
          </button>
        </div>
      )}
    </div>
  );
}