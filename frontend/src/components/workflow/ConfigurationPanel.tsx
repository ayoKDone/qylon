// src/components/workflow/ConfigurationPanel.tsx
interface ConfigurationPanelProps {
  selectedNode?: {
    id: string;
    label: string;
    type: string;
  } | null;
  children?: React.ReactNode;
}

export default function ConfigurationPanel({ selectedNode, children }: ConfigurationPanelProps) {
  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Configuration</h3>
      
      {selectedNode ? (
        <div>
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-1">{selectedNode.label}</h4>
            <p className="text-xs text-gray-500">{selectedNode.type}</p>
          </div>
          {children}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 text-center px-4">
            Select a component to configure
          </p>
        </div>
      )}
    </div>
  );
}