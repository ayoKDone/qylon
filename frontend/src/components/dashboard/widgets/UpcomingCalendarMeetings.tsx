import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Meeting {
  title: string;
  date?: string;
  time: string;
  type?: 'video' | 'in-person';
  location?: string;
  attendees: number;
  color?: string;
  attendeeImages?: string[];
}

export default function UpcomingCalendarMeetings() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Sample meetings data
  const meetings: Meeting[] = [
    {
      title: 'Design Team',
      date: '2025-10-17',
      time: '08:00 - 09:00',
      attendees: 3,
      attendeeImages: ['DT', 'AM'],
    },
    {
      title: 'Design Presentation',
      date: '2025-10-17',
      time: '10:00 - 11:00',
      attendees: 3,
      attendeeImages: ['DP', 'KL'],
    },
    {
      title: 'Client Meeting',
      date: '2025-10-05',
      time: '14:00 - 15:00',
      attendees: 2,
      attendeeImages: ['CM'],
    },
    {
      title: 'Team Sync',
      date: '2025-10-12',
      time: '09:00 - 10:00',
      attendees: 5,
      attendeeImages: ['TS'],
    },
    {
      title: 'Product Review',
      date: '2025-10-26',
      time: '15:00 - 16:00',
      attendees: 4,
      attendeeImages: ['PR'],
    },
  ];

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const getMonthData = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = (firstDay.getDay() + 6) % 7; // Adjust to start week on Monday
    const daysInMonth = lastDay.getDate();

    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => {
      if (meeting.date) {
        const meetingDate = new Date(meeting.date);
        return meetingDate.toDateString() === date.toDateString();
      }
      return false;
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthData = getMonthData(currentDate);
  const today = new Date();
  const selectedDateMeetings = getMeetingsForDate(selectedDate);

  // Check if selected date is in the past
  const isPastDate = selectedDate.toDateString() !== today.toDateString() && selectedDate < today;

  return (
    <div className=''>
      <div className=''>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <select
              value={selectedYear}
              onChange={e => {
                const newYear = parseInt(e.target.value);
                setSelectedYear(newYear);
                setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
              }}
              className='text-base font-semibold text-gray-900 bg-transparent border-0 cursor-pointer focus:outline-none'
            >
              {[2021, 2022, 2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className='flex items-center gap-4'>
            <button
              onClick={goToPreviousMonth}
              className='p-1 hover:bg-gray-100 rounded transition-colors'
            >
              <ChevronLeft className='w-5 h-5 text-gray-600' />
            </button>

            <span className='text-base font-medium text-gray-900 min-w-20 text-center'>
              {currentDate.toLocaleDateString('en-US', { month: 'long' })}
            </span>

            <button
              onClick={goToNextMonth}
              className='p-1 hover:bg-gray-100 rounded transition-colors'
            >
              <ChevronRight className='w-5 h-5 text-gray-600' />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className='mb-6'>
          {/* Day Headers */}
          <div className='grid grid-cols-7 mb-2'>
            {daysOfWeek.map(day => (
              <div key={day} className='p-2 text-center text-sm font-medium text-gray-600'>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className='grid grid-cols-7 gap-y-2'>
            {monthData.map((dayData, idx) => {
              const dayMeetings = getMeetingsForDate(dayData.date);
              const isToday = dayData.date.toDateString() === today.toDateString();
              const isSelected = dayData.date.toDateString() === selectedDate.toDateString();

              return (
                <div key={idx} className='flex flex-col items-center justify-center py-2'>
                  <div
                    onClick={() => dayData.isCurrentMonth && setSelectedDate(dayData.date)}
                    className={`w-10 h-10 flex flex-col items-center justify-center rounded-full transition-colors ${
                      isToday ? 'bg-blue-950 text-white' : ''
                    } ${
                      dayData.isCurrentMonth ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default'
                    } ${isSelected && !isToday ? 'bg-blue-100' : ''}`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        isToday
                          ? 'text-white'
                          : dayData.isCurrentMonth
                            ? 'text-gray-900'
                            : 'text-gray-300'
                      }`}
                    >
                      {dayData.day}
                    </span>
                    {dayMeetings.length > 0 && (
                      <div className='flex gap-0.5 mt-0.5'>
                        {dayMeetings.slice(0, 3).map((_, mIdx) => (
                          <div
                            key={mIdx}
                            className={`w-1 h-1 rounded-full ${
                              isToday ? 'bg-white' : 'bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Past/Upcoming Meetings List */}
        <div className='border-t border-gray-200 pt-4'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-base font-semibold text-gray-900'>
              {isPastDate ? 'Past meetings' : 'Upcoming meetings'}
            </h3>
            <span className='text-sm text-gray-500'>{selectedDateMeetings.length} meetings</span>
          </div>

          <div className='space-y-3'>
            {selectedDateMeetings.length > 0 ? (
              selectedDateMeetings.map((meeting, idx) => (
                <div key={idx} className='bg-white'>
                  <div className='flex items-start gap-3'>
                    <div className='flex flex-col items-center pt-1'>
                      <span className='text-xs text-gray-500'>
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className='text-lg font-semibold text-gray-900'>
                        {selectedDate.getDate()}
                      </span>
                    </div>

                    <div className='flex-1 relative pl-4'>
                      <div className='absolute left-0 top-0 bottom-0 w-1 bg-blue-950 rounded-full' />

                      <div className='flex items-center justify-between'>
                        <div>
                          <h4 className='text-sm font-semibold text-gray-900'>{meeting.title}</h4>
                          <p className='text-xs text-gray-500'>{meeting.time}</p>
                        </div>

                        <div className='flex items-center -space-x-2'>
                          {meeting.attendeeImages?.map((img, i) => (
                            <div
                              key={i}
                              className='w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white flex items-center justify-center text-xs font-medium text-white'
                            >
                              {img}
                            </div>
                          ))}
                          {meeting.attendees > (meeting.attendeeImages?.length || 0) && (
                            <div className='w-7 h-7 rounded-full bg-gray-900 border-2 border-white flex items-center justify-center text-xs font-medium text-white'>
                              +{meeting.attendees - (meeting.attendeeImages?.length || 0)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-8 text-gray-500 text-sm'>
                {isPastDate ? 'No past meetings for this day' : 'No upcoming meetings for this day'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
