// src/pages/WorkflowBuilderPage.tsx
import { useState } from "react";
import { ArrowLeft, Play, Save, Share2 } from "lucide-react";
import { 
  Calendar, 
  FileText, 
  Key, 
  Mail, 
  CheckSquare, 
  FileCode, 
  MessageSquare,
  GitBranch 
} from "lucide-react";
import WorkflowSidebar, { WorkflowItem } from "../../workflow/WorkflowSidebar";
import WorkflowCanvas from "../../workflow/WorkflowCanvas";
import WorkflowNode from "../../workflow/WorkflowNode";
import ConfigurationPanel from "../../workflow/ConfigurationPanel";

export default function WorkflowBuilderPage() {
  const [activeTab, setActiveTab] = useState<"builder" | "templates">("builder");
  const [nodes, setNodes] = useState<Array<WorkflowItem & { nodeId: string }>>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<WorkflowItem | null>(null);

  const triggers: WorkflowItem[] = [
    {
      id: "meeting-ends",
      label: "Meeting Ends",
      description: "Triggers when a meeting is completed",
      icon: Calendar,
      color: "bg-blue-200",
      type: "trigger",
    },
    {
      id: "action-created",
      label: "Action Item Created",
      description: "Triggers when a new action item is detected",
      icon: FileText,
      color: "bg-blue-200",
      type: "trigger",
    },
    {
      id: "keyword-detected",
      label: "Keyword Detected",
      description: "Triggers when specific words or phrases",
      icon: Key,
      color: "bg-blue-200",
      type: "trigger",
    },
  ];

  const actions: WorkflowItem[] = [
    {
      id: "send-email",
      label: "Send Email",
      description: "Send an email notification",
      icon: Mail,
      color: "bg-green-200",
      type: "action",
    },
    {
      id: "create-task",
      label: "Create Task",
      description: "Create a task in project management tool",
      icon: CheckSquare,
      color: "bg-green-200",
      type: "action",
    },
    {
      id: "generate-content",
      label: "Generate Content",
      description: "Generate AI content from meeting",
      icon: FileCode,
      color: "bg-green-200",
      type: "action",
    },
    {
      id: "send-slack",
      label: "Send to Slack",
      description: "Post message to Slack channel",
      icon: MessageSquare,
      color: "bg-green-200",
      type: "action",
    },
  ];

  const conditions: WorkflowItem[] = [
    {
      id: "if-then",
      label: "If/Then",
      description: "Add conditional logic",
      icon: GitBranch,
      color: "bg-purple-200",
      type: "condition",
    },
  ];

  const handleDragStart = (item: WorkflowItem) => {
    setDraggedItem(item);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedItem) {
      const newNode = {
        ...draggedItem,
        nodeId: `node-${Date.now()}`,
      };
      setNodes([...nodes, newNode]);
      setDraggedItem(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemoveNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.nodeId !== nodeId));
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  };

  const selectedNodeData = nodes.find(node => node.nodeId === selectedNode);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">New Workflow</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Play className="w-4 h-4" />
            Test
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Save className="w-4 h-4" />
            Save
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
            <Share2 className="w-4 h-4" />
            Publish
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("builder")}
          className={`px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "builder" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Builder
          {activeTab === "builder" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "templates" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Templates
          {activeTab === "templates" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-65 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            <WorkflowSidebar
              title="Triggers"
              items={triggers}
              onDragStart={handleDragStart}
            />
            <WorkflowSidebar
              title="Actions"
              items={actions}
              onDragStart={handleDragStart}
            />
            <WorkflowSidebar
              title="Conditions"
              items={conditions}
              onDragStart={handleDragStart}
            />
          </div>
        </div>

        {/* Canvas */}
        <WorkflowCanvas
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onAddTrigger={() => console.log("Add trigger")}
        >
          {nodes.length > 0 && (
            <div className="space-y-4 max-w-2xl mx-auto">
              {nodes.map((node, index) => (
                <div key={node.nodeId}>
                  <WorkflowNode
                    id={node.nodeId}
                    label={node.label}
                    icon={node.icon}
                    color={node.color}
                    onRemove={handleRemoveNode}
                    onClick={setSelectedNode}
                  />
                  {index < nodes.length - 1 && (
                    <div className="flex justify-center my-2">
                      <div className="w-0.5 h-8 bg-gray-300"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </WorkflowCanvas>

        {/* Right Panel */}
        <ConfigurationPanel
          selectedNode={selectedNodeData ? {
            id: selectedNodeData.nodeId,
            label: selectedNodeData.label,
            type: selectedNodeData.type,
          } : null}
        >
          {selectedNodeData && (
            <div className="space-y-4">
                <form className="xui-form xui-max-w-400 xui-mx-auto">
                    <div className="xui-form-box">
                        <label>Name</label>
                        <input type="text" defaultValue={selectedNodeData.label} />
                    </div>
                    <div className="xui-form-box">
                        <label>Description</label>
                        <textarea rows={3} defaultValue={selectedNodeData.description}></textarea>
                    </div>
                </form>
            </div>
          )}
        </ConfigurationPanel>
      </div>
    </div>
  );
}