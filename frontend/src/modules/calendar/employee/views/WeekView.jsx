import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Badge } from '../../../../shared/ui/badge';

const WeekView = ({ date, events, onDateClick }) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
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
      const eventDate = event.startDate || event.date;
      if (!eventDate) return false;
      
      try {
        let eventDateStr = eventDate;
        
        // Handle different date formats
        if (eventDate instanceof Date) {
          eventDateStr = eventDate.toISOString().split('T')[0];
        } else if (typeof eventDate === 'string') {
          if (eventDate.includes('T')) {
            eventDateStr = eventDate.split('T')[0];
          } else if (/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
            eventDateStr = eventDate;
          } else {
            const parsed = new Date(eventDate);
            if (!isNaN(parsed.getTime())) {
              eventDateStr = parsed.toISOString().split('T')[0];
            } else {
              console.warn('Unable to parse event date:', eventDate, 'for event:', event.title);
              return false;
            }
          }
        }
        
        return eventDateStr === dateStr;
      } catch (error) {
        console.warn('Date comparison error in WeekView:', event.title, eventDate, error);
        return false;
      }
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

  const handleMouseEnter = (day, event) => {
    const dayEvents = getEventsForDate(day);
    if (dayEvents.length > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setHoveredDay(day);
    }
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Week View</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4">
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isTodayDate = isToday(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => onDateClick(day)}
                onMouseEnter={(e) => handleMouseEnter(day, e)}
                onMouseLeave={handleMouseLeave}
                className={`
                  border rounded-lg p-2 sm:p-3 cursor-pointer hover:bg-gray-50 transition-colors min-h-24 sm:min-h-32 relative
                  ${isTodayDate ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                `}
              >
                {/* Day header */}
                <div className="text-center mb-1 sm:mb-2">
                  <div className="text-xs font-medium text-gray-500 uppercase">
                    <span className="hidden sm:inline">{dayNames[index]}</span>
                    <span className="sm:hidden">{dayNames[index].slice(0, 1)}</span>
                  </div>
                  <div className={`text-sm sm:text-lg font-semibold ${isTodayDate ? 'text-blue-600' : 'text-gray-800'}`}>
                    {day.getDate()}
                  </div>
                </div>

                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEvents.slice(0, window.innerWidth < 640 ? 2 : 3).map((event) => (
                    <div
                      key={event._id || event.id}
                      className={`text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded truncate ${getEventColor(event.eventType)}`}
                      title={event.title}
                    >
                      <span className="hidden sm:inline">{event.title}</span>
                      <span className="sm:hidden">•</span>
                    </div>
                  ))}
                  
                  {dayEvents.length > (window.innerWidth < 640 ? 2 : 3) && (
                    <div className="text-xs text-gray-500 px-1 sm:px-2">
                      <span className="hidden sm:inline">+{dayEvents.length - 3} more</span>
                      <span className="sm:hidden">+{dayEvents.length - 2}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover Tooltip */}
        {hoveredDay && (
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs pointer-events-none"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: 'translateX(-50%) translateY(-100%)'
            }}
          >
            <div className="text-sm font-semibold mb-2">
              {hoveredDay.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="space-y-1">
              {getEventsForDate(hoveredDay).map((event, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ 
                      backgroundColor: event.color || (() => {
                        const colorMap = {
                          meeting: '#3b82f6',
                          holiday: '#ef4444',
                          birthday: '#ec4899',
                          anniversary: '#8b5cf6',
                          leave: '#f97316',
                          event: '#10b981',
                        };
                        return colorMap[event.eventType] || '#6b7280';
                      })()
                    }}
                  ></div>
                  <span className="text-xs text-gray-700 truncate">
                    {event.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-4 justify-center">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-100 border border-red-200 rounded"></div>
            <span className="text-xs sm:text-sm text-gray-600">Holiday</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-100 border border-blue-200 rounded"></div>
            <span className="text-xs sm:text-sm text-gray-600">Meeting</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-100 border border-orange-200 rounded"></div>
            <span className="text-xs sm:text-sm text-gray-600">Leave</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-pink-100 border border-pink-200 rounded"></div>
            <span className="text-xs sm:text-sm text-gray-600">Birthday</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-100 border border-purple-200 rounded"></div>
            <span className="text-xs sm:text-sm text-gray-600">Anniversary</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-xs sm:text-sm text-gray-600">Event</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekView;