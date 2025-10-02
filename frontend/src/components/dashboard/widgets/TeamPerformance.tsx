// src/widgets/TeamPerformance.tsx

interface TeamMember {
  name: string;
  performance: number;
  color: string;
}

interface TeamPerformanceProps {
  members: TeamMember[];
}

export default function TeamPerformance({ members }: TeamPerformanceProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {members.map((member, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <svg className="transform -rotate-90 w-16 h-16">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - member.performance / 100)}`}
                className={member.color.replace('bg-', 'text-')}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold">{member.name}</span>
            </div>
          </div>
          <span className="text-xs text-gray-600 mt-1">
            {member.performance}%
          </span>
        </div>
      ))}
    </div>
  );
}
