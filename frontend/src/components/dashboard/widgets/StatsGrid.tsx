// src/components/StatsGrid.tsx
import { Zap, Clock, Target, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import StatCard from './StatCard';


export default function StatsGrid() {
  const [stats, setStats] = useState({
    tasksCreated: 342,
    timeSaved: '23.5h',
    accuracy: 96.8,
    conversations: 127,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        tasksCreated: prev.tasksCreated + (Math.random() > 0.8 ? 1 : 0),
        timeSaved: prev.timeSaved,
        accuracy: Math.min(99.9, parseFloat((prev.accuracy + (Math.random() > 0.9 ? 0.1 : 0)).toFixed(1))),
        conversations: prev.conversations + (Math.random() > 0.85 ? 1 : 0),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        icon={Zap}
        iconColor="text-blue-400"
        bgColor="bg-blue-100"
        value={stats.tasksCreated}
        label="Tasks Created"
        subtitle="+22% from last week"
        subtitleColor="text-blue-600"
        showTrend={true}
      />
      
      <StatCard
        icon={Clock}
        iconColor="text-purple-400"
        bgColor="bg-purple-100"
        value={stats.timeSaved}
        label="Time Saved"
        subtitle="+13% this month"
        subtitleColor="text-purple-600"
        showTrend={true}
      />
      
      <StatCard
        icon={Target}
        iconColor="text-green-400"
        bgColor="bg-green-100"
        value={`${stats.accuracy}%`}
        label="AI Accuracy"
        subtitle="+2.1% improvement"
        subtitleColor="text-green-600"
        showTrend={true}
      />
      
      <StatCard
        icon={MessageSquare}
        iconColor="text-orange-400"
        bgColor="bg-orange-100"
        value={stats.conversations}
        label="Conversations"
        subtitle="-5% from last week"
        subtitleColor="text-orange-600"
        showTrend={true}
      />
    </div>
  );
}