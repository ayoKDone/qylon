// src/components/CalendarGrid.tsx

interface TeamMember {
  name: string;
  color: string;
}

interface CalendarGridProps {
  teamMembers: TeamMember[];
  currentDate: Date;
  startHour?: number;
  endHour?: number;
}

export default function CalendarGrid({
  teamMembers,
  currentDate,
  startHour = 8,
  endHour = 17,
}: CalendarGridProps) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const first = curr.getDate() - curr.getDay();
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(curr.setDate(first + i));
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i,
  );

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6">
      {/* Team Colors Legend */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Team Colors
        </h3>
        <div className="xui-d-flex flex-wrap gap-4">
          {teamMembers.map((member, index) => (
            <div key={index} className="xui-d-flex xui-flex-ai-center gap-2">
              <div className={`w-3 h-3 rounded-full ${member.color}`}></div>
              <span className="text-sm text-gray-600">{member.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-3 text-sm font-medium text-gray-500">Time</div>
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="p-3 text-center border-l border-gray-200"
              >
                <div className="text-xs text-gray-500">
                  {dayNames[day.getDay()]}
                </div>
                <div
                  className={`text-lg font-semibold mt-1 ${
                    isToday(day) ? 'text-cyan-500' : 'text-gray-900'
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {hours.map(hour => (
            <div
              key={hour}
              className="grid grid-cols-8 border-b border-gray-100"
            >
              <div className="p-3 text-sm text-gray-500">{hour}:00</div>
              {weekDays.map((_, dayIndex) => (
                <div
                  key={dayIndex}
                  className="border-l border-gray-100 p-2 min-h-[60px] hover:bg-gray-50 transition-colors"
                >
                  {/* Events rendered here */}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
