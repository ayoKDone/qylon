// src/components/ProgressBar.tsx
interface ProgressBarProps {
  label: string;
  value: number;
  maxValue?: number;
  showPercentage?: boolean;
  color?: string;
  bgColor?: string;
  valueColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({
  label,
  value,
  maxValue,
  showPercentage = true,
  color = 'bg-blue-500',
  bgColor = 'bg-gray-200',
  valueColor = 'text-blue-600',
  size = 'md',
}: ProgressBarProps) {
  const percentage = maxValue ? (value / maxValue) * 100 : value;

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const displayValue = maxValue
    ? `${value}/${maxValue}`
    : showPercentage
      ? `${Math.round(percentage)}%`
      : value;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="xui-d-flex xui-flex-ai-center xui-flex-jc-space-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-lg font-bold ${valueColor}`}>
          {displayValue}
        </span>
      </div>

      <div
        className={`xui-pos-relative ${sizeClasses[size]} ${bgColor} rounded-full overflow-hidden`}
      >
        <div
          className={`xui-pos-absolute top-0 left-0 h-full ${color} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}
