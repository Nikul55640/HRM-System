import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { getEventColor, getEventTypeConfig, renderEventIcon } from '../../../../core/utils/calendarEventTypes';
import smartCalendarService from '../../../../services/smartCalendarService';

const MonthView = ({ date, events, onDateClick }) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [smartCalendarData, setSmartCalendarData] = useState({});
  const [loading, setLoading] = useState(true);
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  // Fetch smart calendar data for proper weekend detection
  useEffect(() => {
    const fetchSmartCalendarData = async () => {
      try {
        setLoading(true);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        const response = await smartCalendarService.getSmartMonthlyCalendar({
          year,
          month
        });
        
        if (response.success && response.data) {
          setSmartCalendarData(response.data.calendar || {});
          console.log('📅 [MONTH VIEW] Smart calendar data loaded for weekend detection', {
            year,
            month,
            dataKeys: Object.keys(response.data.calendar || {}).length
          });
        } else {
          console.warn('📅 [MONTH VIEW] Smart calendar failed, using fallback weekend detection');
          setSmartCalendarData({});
        }
      } catch (error) {
        console.warn('📅 [MONTH VIEW] Smart calendar error, using fallback:', error);
        setSmartCalendarData({});
      } finally {
        setLoading(false);
      }
    };

    fetchSmartCalendarData();
  }, [date]);

  // Get day status from smart calendar data (PROPER SOURCE OF TRUTH)
  const getDayStatus = (day) => {
    const { year, month } = getDaysInMonth(date);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const smartDayData = smartCalendarData[dateStr];
    
    if (smartDayData) {
      console.log(`📅 [MONTH VIEW] Smart data for ${dateStr}:`, smartDayData);
      return {
        isWeekend: smartDayData.isWeekend || smartDayData.status === 'WEEKEND',
        isWorkingDay: smartDayData.isWorkingDay || smartDayData.status === 'WORKING_DAY',
        isHoliday: smartDayData.isHoliday || smartDayData.status === 'HOLIDAY',
        status: smartDayData.status || 'WORKING_DAY',
        reason: smartDayData.reason || ''
      };
    }
    
    // Fallback to basic weekend detection if smart calendar data is not available
    const dayOfWeek = new Date(year, month, day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    
    console.log(`📅 [MONTH VIEW] Fallback for ${dateStr}: dayOfWeek=${dayOfWeek}, isWeekend=${isWeekend}`);
    
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
    const hasEvents = dayEvents.length > 0;
    
    let baseClasses = 'aspect-square border rounded-lg p-1 sm:p-2 cursor-pointer hover:bg-accent transition-colors relative';
    
    // Priority order: Today > Holiday > Weekend > Working Day
    if (isTodayDate) {
      baseClasses += ' border-primary border-2 bg-primary/5';
    } else if (dayStatus.isHoliday) {
      baseClasses += ' border-red-300 bg-red-50';
    } else if (dayStatus.isWeekend) {
      baseClasses += ' border-gray-300 bg-gray-100';
    } else {
      baseClasses += ' border-border bg-white';
    }
    
    return baseClasses;
  };

  // Get day number styling (PROPER PRIORITY ORDER)
  const getDayNumberClasses = (day, isTodayDate) => {
    const dayStatus = getDayStatus(day);
    
    let classes = 'text-xs sm:text-sm font-semibold mb-1';
    
    if (isTodayDate) {
      classes += ' text-primary';
    } else if (dayStatus.isHoliday) {
      classes += ' text-red-700';
    } else if (dayStatus.isWeekend) {
      classes += ' text-gray-500';
    } else {
      classes += ' text-gray-800';
    }
    
    return classes;
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(date);

  const getEventsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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
        console.warn('Date comparison error in MonthView:', event.title, eventDate, error);
        return false;
      }
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

  // Show loading state while fetching smart calendar data
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardTitle>
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
        <CardTitle>
          {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-xs sm:text-sm py-1 sm:py-2 text-muted-foreground"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square"></div>;
            }

            const dayEvents = getEventsForDate(day);
            const isTodayDate = isToday(day);
            const dayDate = new Date(year, month, day);
            const dayStatus = getDayStatus(day);

            return (
              <div
                key={day}
                onClick={() => onDateClick(dayDate)}
                onMouseEnter={(e) => handleMouseEnter(day, e)}
                onMouseLeave={handleMouseLeave}
                className={getDayClasses(day, isTodayDate, dayEvents)}
              >
                <div className="flex flex-col h-full">
                  <div className={getDayNumberClasses(day, isTodayDate)}>
                    {day}
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
                  <div className="flex-1 overflow-hidden">
                    {dayEvents.slice(0, window.innerWidth < 640 ? 1 : 3).map((event, idx) => (
                      <div
                        key={idx}
                        className="text-xs px-1 py-0.5 rounded mb-1 text-white truncate"
                        style={{ backgroundColor: event.color || getEventColor(event.eventType) }}
                        title={event.title}
                      >
                        <span className="hidden sm:inline">{event.title}</span>
                        <span className="sm:hidden">•</span>
                      </div>
                    ))}
                    {dayEvents.length > (window.innerWidth < 640 ? 1 : 3) && (
                      <div className="text-xs text-muted-foreground">
                        <span className="hidden sm:inline">+{dayEvents.length - 3} more</span>
                        <span className="sm:hidden">+{dayEvents.length - 1}</span>
                      </div>
                    )}
                  </div>
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
              {new Date(year, month, hoveredDay).toLocaleDateString('en-US', {
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
                    style={{ backgroundColor: event.color || getEventColor(event.eventType) }}
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
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-gray-100 border border-gray-300"></div>
            <span className="text-xs sm:text-sm text-gray-600">Weekend</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded" style={{ backgroundColor: getEventColor('holiday') }}></div>
            <span className="text-xs sm:text-sm text-gray-600">Holiday</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded" style={{ backgroundColor: getEventColor('meeting') }}></div>
            <span className="text-xs sm:text-sm text-gray-600">Meeting</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded" style={{ backgroundColor: getEventColor('leave') }}></div>
            <span className="text-xs sm:text-sm text-gray-600">Leave</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded" style={{ backgroundColor: getEventColor('birthday') }}></div>
            <span className="text-xs sm:text-sm text-gray-600">Birthday</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded" style={{ backgroundColor: getEventColor('event') }}></div>
            <span className="text-xs sm:text-sm text-gray-600">Event</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthView;