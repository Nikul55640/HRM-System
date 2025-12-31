import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Badge } from '../../../../shared/ui/badge';

const WeekView = ({ date, events, onDateClick }) => {
  // Get the start of the week (Sunday)
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  // Generate 7 days starting from Sunday
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const getEventsForDate = (day) => {
    const dateStr = day.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const getEventColor = (type) => {
    const colors = {
      meeting: 'bg-blue-100 text-blue-800',
      holiday: 'bg-red-100 text-red-800',
      birthday: 'bg-pink-100 text-pink-800',
      anniversary: 'bg-purple-100 text-purple-800',
      leave: 'bg-orange-100 text-orange-800',
      event: 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const isToday = (day) => {
    const today = new Date();
    return day.toDateString() === today.toDateString();
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Week View</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isTodayDate = isToday(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => onDateClick(day)}
                className={`
                  border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors min-h-32
                  ${isTodayDate ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                `}
              >
                {/* Day header */}
                <div className="text-center mb-2">
                  <div className="text-xs font-medium text-gray-500 uppercase">
                    {dayNames[index]}
                  </div>
                  <div className={`text-lg font-semibold ${isTodayDate ? 'text-blue-600' : 'text-gray-800'}`}>
                    {day.getDate()}
                  </div>
                </div>

                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event._id || event.id}
                      className={`text-xs px-2 py-1 rounded truncate ${getEventColor(event.eventType)}`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span className="text-sm text-gray-600">Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
            <span className="text-sm text-gray-600">Meeting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
            <span className="text-sm text-gray-600">Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-100 border border-pink-200 rounded"></div>
            <span className="text-sm text-gray-600">Birthday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></div>
            <span className="text-sm text-gray-600">Anniversary</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-sm text-gray-600">Event</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekView;