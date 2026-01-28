import React, { useState, useEffect } from 'react';
import { Badge } from '../../../../shared/ui/badge';
import smartCalendarService from '../../../../services/smartCalendarService';

const WeekView = ({ date, events, onDateClick }) => {
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

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Show loading state while fetching smart calendar data
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Week View</h2>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Week Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Week View</h2>
        <div className="text-sm text-gray-500">
          {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Week List */}
      <div className="space-y-2">
        {weekDays.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isTodayDate = isToday(day);
          const dayStatus = getDayStatus(day);

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={`border rounded-lg p-3 sm:p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
                isTodayDate 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : dayStatus.isHoliday
                  ? 'border-red-300 bg-red-50'
                  : dayStatus.isWeekend
                  ? 'border-gray-300 bg-gray-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="text-xs font-medium text-gray-500 uppercase">
                      {dayNames[index]}
                    </div>
                    <div className={`text-xl font-bold ${
                      isTodayDate 
                        ? 'text-blue-600' 
                        : dayStatus.isHoliday
                        ? 'text-red-700'
                        : dayStatus.isWeekend
                        ? 'text-gray-500'
                        : 'text-gray-800'
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {day.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric',
                        year: day.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                      })}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Day Status Badge */}
                      {dayStatus.isHoliday ? (
                        <Badge className="bg-red-100 text-red-700 text-xs">Holiday</Badge>
                      ) : dayStatus.isWeekend ? (
                        <Badge className="bg-gray-100 text-gray-600 text-xs">Weekend</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 text-xs">Working Day</Badge>
                      )}
                      
                      {isTodayDate && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">Today</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Event Count */}
                {dayEvents.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                    </span>
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {dayEvents.length}
                    </div>
                  </div>
                )}
              </div>

              {/* Events List */}
              {dayEvents.length > 0 ? (
                <div className="space-y-2">
                  {dayEvents.map((event, eventIndex) => (
                    <div
                      key={event._id || event.id || eventIndex}
                      className="flex items-center gap-3 p-2 rounded-md bg-white border border-gray-100"
                    >
                      {/* Event Type Indicator */}
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
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

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {event.title}
                          </span>
                          <Badge className={`text-xs ${getEventColor(event.eventType)}`}>
                            {event.eventType}
                          </Badge>
                        </div>
                        
                        {/* Additional Event Info */}
                        {(event.employeeName || event.description) && (
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {event.employeeName && (
                              <span>{event.employeeName}</span>
                            )}
                            {event.employeeName && event.description && <span> • </span>}
                            {event.description && (
                              <span>{event.description}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Event Time (if available) */}
                      {event.time && (
                        <div className="text-xs text-gray-500 flex-shrink-0">
                          {event.time}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No events scheduled
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Event Types</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { type: 'holiday', label: 'Holiday', color: '#ef4444' },
            { type: 'leave', label: 'Leave', color: '#f97316' },
            { type: 'birthday', label: 'Birthday', color: '#ec4899' },
            { type: 'anniversary', label: 'Anniversary', color: '#8b5cf6' },
            { type: 'meeting', label: 'Meeting', color: '#3b82f6' },
            { type: 'event', label: 'Event', color: '#10b981' },
            { type: 'other', label: 'Other', color: '#6b7280' }
          ].map(({ type, label, color }) => (
            <div key={type} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekView;