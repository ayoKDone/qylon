// src/components/TeamMemberCard.tsx
import { Star, Flame } from 'lucide-react';

interface TeamMemberCardProps {
  name: string;
  role: string;
  avatar: string;
  avatarColor: string;
  level: number;
  streak: number;
  tasksCompleted: number;
  totalTasks: number;
  rate: number;
  overdue: number;
  avgTime: string;
  score: number;
  points: number;
  progressColor: string;
}

export default function TeamMemberCard({
  name,
  role,
  avatar,
  avatarColor,
  level,
  streak,
  tasksCompleted,
  totalTasks,
  rate,
  overdue,
  avgTime,
  score,
  points,
  progressColor,
}: TeamMemberCardProps) {
  const progress = (tasksCompleted / totalTasks) * 100;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="xui-d-flex xui-flex-ai-flex-start xui-flex-jc-space-between mb-4">
        <div className="xui-d-flex xui-flex-ai-center gap-3">
          {/* Avatar */}
          <div className="xui-pos-relative">
            <div
              className={`w-12 h-12 rounded-full ${avatarColor} xui-d-flex xui-flex-ai-center xui-flex-jc-center text-white font-bold text-lg`}
            >
              {avatar}
            </div>
            <div className="xui-pos-absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          {/* Name and Role */}
          <div>
            <h3 className="text-base font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{role}</p>
          </div>
        </div>

        {/* Score */}
        <div className="text-right">
          <div className="xui-d-flex xui-flex-ai-center gap-1 text-amber-500 font-semibold">
            <Star className="w-4 h-4 fill-amber-500" />
            <span>{score}%</span>
          </div>
          <p className="text-xs text-cyan-500 font-medium">{points} pts</p>
        </div>
      </div>

      {/* Level and Streak */}
      <div className="xui-d-flex xui-flex-ai-center gap-2 mb-4">
        <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded">
          Level {level}
        </span>
        <div className="xui-d-flex xui-flex-ai-center gap-1 text-amber-500 text-xs font-medium">
          <Flame className="w-4 h-4 fill-amber-500" />
          <span>{streak} day streak</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-3">
        <div>
          <div className="text-lg font-bold text-gray-900">
            {tasksCompleted}/{totalTasks}
          </div>
          <div className="text-xs text-gray-500">Tasks</div>
        </div>
        <div>
          <div
            className={`text-lg font-bold ${rate >= 90 ? 'text-green-600' : rate >= 80 ? 'text-amber-600' : 'text-red-600'}`}
          >
            {rate}%
          </div>
          <div className="text-xs text-gray-500">Rate</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900">{overdue}</div>
          <div className="text-xs text-gray-500">Overdue</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900">{avgTime}</div>
          <div className="text-xs text-gray-500">Avg Time</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="xui-pos-relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`xui-pos-absolute top-0 left-0 h-full ${progressColor} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
