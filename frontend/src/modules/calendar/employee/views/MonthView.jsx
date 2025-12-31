import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { getEventColor } from '../../../../core/utils/calendarEventTypes';

const MonthView = ({ date, events, onDateClick }) => {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(date);

  const getEventsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const getEventColorClass = (eventType) => {
    const color = getEventColor(eventType);
    return `bg-[${color}]`;
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-sm py-2 text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square"></div>;
            }

            const dayEvents = getEventsForDate(day);
            const isTodayDate = isToday(day);
            const dayDate = new Date(year, month, day);

            return (
              <div
                key={day}
                onClick={() => onDateClick(dayDate)}
                className={`
                  aspect-square border rounded-lg p-2 cursor-pointer
                  hover:bg-accent transition-colors
                  ${isTodayDate ? 'border-primary border-2 bg-primary/5' : 'border-border'}
                `}
              >
                <div className="flex flex-col h-full">
                  <div className={`text-sm font-semibold mb-1 ${isTodayDate ? 'text-primary' : ''}`}>
                    {day}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <div
                        key={idx}
                        className="text-xs px-1 py-0.5 rounded mb-1 text-white truncate"
                        style={{ backgroundColor: event.color || getEventColor(event.eventType) }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getEventColor('holiday') }}></div>
            <span className="text-sm text-gray-600">Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getEventColor('meeting') }}></div>
            <span className="text-sm text-gray-600">Meeting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getEventColor('leave') }}></div>
            <span className="text-sm text-gray-600">Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getEventColor('birthday') }}></div>
            <span className="text-sm text-gray-600">Birthday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getEventColor('anniversary') }}></div>
            <span className="text-sm text-gray-600">Anniversary</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getEventColor('event') }}></div>
            <span className="text-sm text-gray-600">Event</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthView;