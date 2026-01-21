import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Badge } from '../../../../shared/ui/badge';
import smartCalendarService from '../../../../services/smartCalendarService';

const WeekView = ({ date, events, onDateClick }) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [smartCalendarData, setSmartCalendarData] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch smart calendar data for proper weekend detection
  useEffect(() => {
    const fetchSmartCalendarData = async () => {
      try {
        setLoading(true);
        
        // Get the start of the week (Sunday) to determine which months we need
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        
        // Get the end of the week (Saturday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        // Determine unique months we need data for
        const monthsToFetch = new Set();
        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          const monthKey = `${day.getFullYear()}-${day.getMonth() + 1}`;
          monthsToFetch.add(monthKey);
        }
        
        // Fetch data for all required months
        const allCalendarData = {};
        const fetchPromises = Array.from(monthsToFetch).map(async (monthKey) => {
          const [year, month] = monthKey.split('-').map(Number);
          try {
            const response = await smartCalendarService.getSmartMonthlyCalendar({
              year,
              month
            });
            
            if (response.success && response.data) {
              Object.assign(allCalendarData, response.data.calendar || {});
            }
          } catch (error) {
            console.warn(`📅 [WEEK VIEW] Failed to fetch data for ${year}-${month}:`, error);
          }
        });
        
        await Promise.all(fetchPromises);
        
        setSmartCalendarData(allCalendarData);
        console.log('📅 [WEEK VIEW] Smart calendar data loaded for cross-month week detection');
        
      } catch (error) {
        console.warn('📅 [WEEK VIEW] Smart calendar error, using fallback:', error);
        setSmartCalendarData({});
      } finally {
        setLoading(false);
      }
    };

    fetchSmartCalendarData();
  }, [date]);

  // Get day status from smart calendar data (PROPER SOURCE OF TRUTH)
  const getDayStatus = (day) => {
    const dateStr = day.toISOString().split('T')[0];
    const smartDayData = smartCalendarData[dateStr];
    
    if (smartDayData) {
      console.log(`📅 [WEEK VIEW] Smart data for ${dateStr}:`, smartDayData);
      return {
        isWeekend: smartDayData.isWeekend || smartDayData.status === 'WEEKEND',
        isWorkingDay: smartDayData.isWorkingDay || smartDayData.status === 'WORKING_DAY',
        isHoliday: smartDayData.isHoliday || smartDayData.status === 'HOLIDAY',
        status: smartDayData.status || 'WORKING_DAY',
        reason: smartDayData.reason || ''
      };
    }
    
    // Fallback to basic weekend detection if smart calendar data is not available
    const dayOfWeek = day.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    
    console.log(`📅 [WEEK VIEW] Fallback for ${dateStr}: dayOfWeek=${dayOfWeek}, isWeekend=${isWeekend}`);
    
    return {
      isWeekend,
      isWorkingDay: !isWeekend,
      isHoliday: false,
      status: isWeekend ? 'WEEKEND' : 'WORKING_DAY',
      reason: isWeekend ? 'Weekend day (fallback)' : 'Regular working day (fallback)'
    };
  };
  // Weekend detection helper (now uses smart calendar data)
  const isWeekend = (day) => {
    const dayStatus = getDayStatus(day);
    return dayStatus.isWeekend;
  };

  // Holiday detection helper
  const isHoliday = (day) => {
    const dayStatus = getDayStatus(day);
    return dayStatus.isHoliday;
  };

  // Get day styling classes based on day status (PROPER PRIORITY ORDER)
  const getDayClasses = (day, isTodayDate, dayEvents) => {
    const dayStatus = getDayStatus(day);
    
    let baseClasses = 'border rounded-lg p-2 sm:p-3 cursor-pointer hover:bg-gray-50 transition-colors min-h-24 sm:min-h-32 relative';
    
    // Priority order: Today > Holiday > Weekend > Working Day
    if (isTodayDate) {
      baseClasses += ' border-blue-500 bg-blue-50';
    } else if (dayStatus.isHoliday) {
      baseClasses += ' border-red-300 bg-red-50';
    } else if (dayStatus.isWeekend) {
      baseClasses += ' border-gray-300 bg-gray-100';
    } else {
      baseClasses += ' border-gray-200 bg-white';
    }
    
    return baseClasses;
  };

  // Get day number styling (PROPER PRIORITY ORDER)
  const getDayNumberClasses = (day, isTodayDate) => {
    const dayStatus = getDayStatus(day);
    
    let classes = 'text-sm sm:text-lg font-semibold';
    
    if (isTodayDate) {
      classes += ' text-blue-600';
    } else if (dayStatus.isHoliday) {
      classes += ' text-red-700';
    } else if (dayStatus.isWeekend) {
      classes += ' text-gray-500';
    } else {
      classes += ' text-gray-800';
    }
    
    return classes;
  };

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

  // Show loading state while fetching smart calendar data
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Week View</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            const dayStatus = getDayStatus(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => onDateClick(day)}
                onMouseEnter={(e) => handleMouseEnter(day, e)}
                onMouseLeave={handleMouseLeave}
                className={getDayClasses(day, isTodayDate, dayEvents)}
              >
                {/* Day header */}
                <div className="text-center mb-1 sm:mb-2">
                  <div className="text-xs font-medium text-gray-500 uppercase">
                    <span className="hidden sm:inline">{dayNames[index]}</span>
                    <span className="sm:hidden">{dayNames[index].slice(0, 1)}</span>
                    {/* Smart status indicators */}
                    {!isTodayDate && (
                      <>
                        {dayStatus.isHoliday && (
                          <span className="ml-1 text-[10px] text-red-500">H</span>
                        )}
                        {dayStatus.isWeekend && !dayStatus.isHoliday && (
                          <span className="ml-1 text-[10px] text-gray-400">W</span>
                        )}
                      </>
                    )}
                  </div>
                  <div className={getDayNumberClasses(day, isTodayDate)}>
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
            
            {/* Day Status from Smart Calendar */}
            <div className="mb-2">
              {(() => {
                const dayStatus = getDayStatus(hoveredDay);
                if (dayStatus.isHoliday) {
                  return <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">Holiday</span>;
                } else if (dayStatus.isWeekend) {
                  return <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">Weekend</span>;
                } else {
                  return <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Working Day</span>;
                }
              })()}
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
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-100 border border-gray-300 rounded"></div>
            <span className="text-xs sm:text-sm text-gray-600">Weekend</span>
          </div>
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