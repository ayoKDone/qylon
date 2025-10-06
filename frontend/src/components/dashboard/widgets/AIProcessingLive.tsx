// src/components/AIProcessingLive.tsx
import { Cpu } from "lucide-react";
import { useState, useEffect } from "react";

interface Task {
  id: string;
  text: string;
  status: "extracting" | "completed" | "syncing" | "processing";
  timestamp: Date;
}

export default function AIProcessingLive() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      text: "Sarah to review budget proposal by Friday",
      status: "extracting",
      timestamp: new Date(),
    },
    {
      id: "2",
      text: "Schedule follow-up meeting with clients",
      status: "completed",
      timestamp: new Date(),
    },
    {
      id: "3",
      text: "Update project timeline in ClickUp",
      status: "syncing",
      timestamp: new Date(),
    },
  ]);

  const [isLive, setIsLive] = useState(true);
  const [activeConversations, setActiveConversations] = useState(3);

  // Simulate real-time updates (replace with actual WebSocket/API)
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Simulate status changes
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.status === "extracting" && Math.random() > 0.7) {
            return { ...task, status: "syncing" as const };
          }
          if (task.status === "syncing" && Math.random() > 0.7) {
            return { ...task, status: "completed" as const };
          }
          return task;
        })
      );

      // Update active conversations count based on processing tasks
      setActiveConversations((prev) => {
        const random = Math.random();
        if (random > 0.8) return Math.min(prev + 1, 5); // Max 5 conversations
        if (random < 0.2) return Math.max(prev - 1, 1); // Min 1 conversation
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="xui-d-flex items-start gap-3 mb-4">
        <div className="xui-pos-relative">
          <div className="w-12 h-12 bg-blue-500 rounded-xl xui-d-flex xui-flex-ai-center xui-flex-jc-center">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          {/* Pulsing live indicator */}
          <div className="xui-pos-absolute -top-1 -right-1">
            <div className="xui-pos-relative">
              <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              {isLive && (
                <div className="xui-pos-absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-75"></div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="xui-d-flex xui-flex-ai-center gap-2">
            <h3 className="text-lg font-semibold text-gray-800">
              AI Processing Live
            </h3>
            {isLive && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                LIVE
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {activeConversations} active conversations • Real-time extraction
          </p>
        </div>

        {/* Toggle live mode */}
        <button
          onClick={() => setIsLive(!isLive)}
          className="text-xs px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          {isLive ? "Pause" : "Resume"}
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No active tasks being processed
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
}

function TaskItem({ task }: { task: Task }) {
  const statusConfig = {
    extracting: {
      color: "bg-yellow-100 text-yellow-700",
      border: "border-l-yellow-400",
      label: "extracting",
      animate: true,
    },
    completed: {
      color: "bg-green-100 text-green-700",
      border: "border-l-green-400",
      label: "completed",
      animate: false,
    },
    syncing: {
      color: "bg-blue-100 text-blue-700",
      border: "border-l-blue-400",
      label: "syncing",
      animate: true,
    },
    processing: {
      color: "bg-purple-100 text-purple-700",
      border: "border-l-purple-400",
      label: "processing",
      animate: true,
    },
  };

  const config = statusConfig[task.status];

  return (
    <div
      className={`xui-d-flex xui-flex-ai-center xui-flex-jc-space-between p-3 rounded-lg border-l-4 ${config.border} bg-gray-50 transition-all duration-300`}
    >
      <span className="text-sm text-gray-700 flex-1">{task.text}</span>
      <div className="xui-d-flex xui-flex-ai-center gap-2">
        {config.animate && (
          <div className="xui-d-flex gap-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-200"></div>
          </div>
        )}
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
}