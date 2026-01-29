import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Badge } from '../../../../shared/ui/badge';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { renderEventIcon, getEventColor } from '../../../../core/utils/calendarEventTypes';
import smartCalendarService from '../../../../services/smartCalendarService';

const TodayView = ({ date, events, loading }) => {
  const [smartCalendarData, setSmartCalendarData] = useState({});
  const [leaveData, setLeaveData] = useState({});
  const [smartLoading, setSmartLoading] = useState(true);

  // Fetch smart calendar data for leave information
  useEffect(() => {
    const fetchSmartCalendarData = async () => {
      try {
        setSmartLoading(true);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        const smartResponse = await smartCalendarService.getSmartMonthlyCalendar({
          year,
          month
        });
        
        if (smartResponse.success && smartResponse.data) {
          const calendarData = smartResponse.data.calendar || {};
          setSmartCalendarData(calendarData);
          
          // Extract leave data from smart calendar response (using single leave property)
          const leavesByDate = {};
          Object.entries(calendarData).forEach(([dateStr, dayData]) => {
            // Only use single leave property (ignore leaves array)
            if (dayData.leave) {
              console.log(`📅 [TODAY VIEW] Found leave data for ${dateStr}:`, dayData.leave);
              leavesByDate[dateStr] = [{
                employeeName: dayData.leave.employeeName || 'Unknown Employee',
                leaveType: dayData.leave.leaveType || 'Leave',
                status: dayData.leave.status || 'approved',
                startDate: dayData.leave.startDate || dateStr,
                endDate: dayData.leave.endDate || dateStr,
                reason: dayData.leave.reason || '',
                employeeId: dayData.leave.employeeId,
                isHalfDay: dayData.leave.isHalfDay,
                ...dayData.leave
              }];
            }
          });
          
          setLeaveData(leavesByDate);
          console.log('📅 [TODAY VIEW] Smart calendar data loaded with leave information');
        } else {
          setSmartCalendarData({});
          setLeaveData({});
        }
      } catch (error) {
        console.warn('📅 [TODAY VIEW] Smart calendar error:', error);
        setSmartCalendarData({});
        setLeaveData({});
      } finally {
        setSmartLoading(false);
      }
    };

    fetchSmartCalendarData();
  }, [date]);

  const todayStr = date.toISOString().split('T')[0];
  const todayEvents = events.filter(event => {
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
      
      return eventDateStr === todayStr;
    } catch (error) {
      console.warn('Date comparison error in TodayView:', event.title, eventDate, error);
      return false;
    }
  });

  const getEventColor = (type) => {
    const colors = {
      meeting: 'bg-blue-100 border-blue-500 text-blue-700',
      holiday: 'bg-red-100 border-red-500 text-red-700',
      birthday: 'bg-pink-100 border-pink-500 text-pink-700',
      anniversary: 'bg-purple-100 border-purple-500 text-purple-700',
      leave: 'bg-orange-100 border-orange-500 text-orange-700',
      event: 'bg-green-100 border-green-500 text-green-700',
    };
    return colors[type] || 'bg-gray-100 border-gray-500 text-gray-700';
  };

  const formatTime = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return 'All Day';
    }
  };

  const isToday = date.toDateString() === new Date().toDateString();
  
  // Get leave data for today
  const todayLeaves = leaveData[todayStr] || [];
  const totalItems = todayEvents.length + todayLeaves.length;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium">Total Items</CardTitle>
            <Calendar className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium">On Leave</CardTitle>
            <Users className="h-3 w-3 text-orange-500" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold">
              {todayLeaves.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium">Holidays</CardTitle>
            <Calendar className="h-3 w-3 text-red-500" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold">
              {todayEvents.filter(e => e.eventType === 'holiday').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium">Birthdays</CardTitle>
            <Calendar className="h-3 w-3 text-pink-500" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold">
              {todayEvents.filter(e => e.eventType === 'birthday').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            <span className="break-words">
              {isToday ? "Today's Schedule" : `Schedule for ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {loading || smartLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : totalItems === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No events or leaves scheduled for this day</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {/* Show leave information first */}
              {todayLeaves.map((leave, leaveIndex) => (
                <div
                  key={`leave-${leaveIndex}`}
                  className="p-3 rounded-lg border-l-4 bg-orange-100 border-orange-500 text-orange-700"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <h3 className="font-semibold text-sm break-words">
                            {leave.employeeName} - {leave.leaveType} Leave
                          </h3>
                        </div>
                        <Badge variant="outline" className="self-start sm:self-auto bg-orange-50 text-orange-700">
                          leave
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-orange-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span className="break-words">All Day</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="break-words">Status: {leave.status || 'Approved'}</span>
                        </div>
                      </div>
                      
                      {leave.reason && (
                        <p className="text-sm text-orange-600 break-words">{leave.reason}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Show other events */}
              {todayEvents.map((event) => (
                <div
                  key={event._id || event.id}
                  className={`p-3 rounded-lg border-l-4 ${getEventColor(event.eventType)}`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {renderEventIcon(event.eventType, "h-4 w-4 flex-shrink-0")}
                          <h3 className="font-semibold text-sm break-words">{event.title}</h3>
                        </div>
                        <Badge variant="outline" className="self-start sm:self-auto">{event.eventType}</Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span className="break-words">
                            {event.isAllDay ? 'All Day' : `${formatTime(event.startDate)} - ${formatTime(event.endDate)}`}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="break-words">{event.location}</span>
                          </div>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-gray-600 break-words">{event.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TodayView;