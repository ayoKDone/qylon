// src/widgets/UpcomingMeetings.tsx

interface Meeting {
  time: string;
  title: string;
  duration: string;
}

interface UpcomingMeetingsProps {
  meetings: Meeting[];
}

export default function UpcomingMeetings({ meetings }: UpcomingMeetingsProps) {
  return (
    <div className="space-y-3">
      {meetings.map((meeting, idx) => (
        <div
          key={idx}
          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="text-sm font-semibold text-blue-600 min-w-[70px]">
            {meeting.time}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {meeting.title}
            </div>
            <div className="text-xs text-gray-500">{meeting.duration}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
