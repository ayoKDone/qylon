// src/components/StatsGrid.tsx
import { Zap, Clock, Target, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import StatCard from './StatCard';

interface Stats {
  tasksCreated: number;
  tasksToday: number;
  timeSaved: string;
  accuracy: number;
  conversations: number;
}

export default function StatsGrid() {
  const [stats, setStats] = useState<Stats>({
    tasksCreated: 12,
    tasksToday: 5,
    timeSaved: '47m',
    accuracy: 94,
    conversations: 127,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Simulate real-time data updates (replace with actual API/WebSocket)
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);

      // TODO: Replace with actual API call
      // const response = await fetch('/api/stats');
      // const data = await response.json();
      // setStats(data);

      setIsLoading(false);
    };

    fetchStats();

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      // Simulate random updates for demo
      setStats(prev => ({
        tasksCreated: prev.tasksCreated + (Math.random() > 0.7 ? 1 : 0),
        tasksToday: prev.tasksToday + (Math.random() > 0.8 ? 1 : 0),
        timeSaved: `${parseInt(prev.timeSaved) + (Math.random() > 0.7 ? 2 : 0)}m`,
        accuracy: Math.min(99, prev.accuracy + (Math.random() > 0.9 ? 1 : 0)),
        conversations: prev.conversations + (Math.random() > 0.85 ? 1 : 0),
      }));
    }, 5000); // Update every 5 seconds for demo

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
      <StatCard
        icon={Zap}
        iconColor='text-blue-500'
        value={stats.tasksCreated}
        label='Tasks Created'
        subtitle={`+${stats.tasksToday} today`}
        subtitleColor='text-green-600'
        trendIcon={stats.tasksToday > 0}
        isAnimating={isLoading}
      />
      <StatCard
        icon={Clock}
        iconColor='text-teal-500'
        value={stats.timeSaved}
        label='Time Saved'
        subtitle='This week'
        subtitleColor='text-teal-600'
        trendIcon={true}
        isAnimating={isLoading}
      />
      <StatCard
        icon={Target}
        iconColor='text-purple-500'
        value={`${stats.accuracy}%`}
        label='AI Accuracy'
        subtitle='AI precision'
        subtitleColor='text-purple-600'
        isAnimating={isLoading}
      />
      <StatCard
        icon={MessageSquare}
        iconColor='text-purple-500'
        value={`${stats.conversations}`}
        label='Conversations'
        subtitle='from last week'
        subtitleColor='text-purple-600'
        isAnimating={isLoading}
      />
    </div>
  );
}
