// src/components/RecentActivity.tsx
export default function RecentActivity() {
  const activities = [
    {
      title: "Created 3 tasks",
      subtitle: "AI Assistant",
      time: "2 min ago",
    },
    {
      title: "Meeting ended",
      subtitle: "Product Team",
      time: "15 min ago",
    },
    {
      title: "Synced to ClickUp",
      subtitle: "Integration",
      time: "1 hour ago",
    },
  ];

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div
          key={index}
          className="xui-d-flex xui-flex-ai-flex-start xui-flex-jc-space-between p-3 rounded-lg border border-gray-20 hover:bg-gray-50 transition-colors"
        >
          <div className="flex-1">
            <p className="text-gray-800 font-medium text-sm">
              {activity.title}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {activity.subtitle}
            </p>
          </div>
          
          <div className="flex-shrink-0 ml-4">
            <span className="text-blue-500 text-xs font-medium">
              {activity.time}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}