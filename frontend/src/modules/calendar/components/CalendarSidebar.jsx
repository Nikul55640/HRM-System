import React from 'react';
import PropTypes from 'prop-types';
import { 
  Calendar, 
  Users, 
  Gift, 
  Award, 
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const CalendarSidebar = ({ 
  calendarData, 
  onDateSelect,
  className 
}) => {
  if (!calendarData) {
    return (
      <div className={cn("bg-white border border-gray-200 rounded-lg p-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const { summary, events, holidays, leaves, birthdays, anniversaries, attendance } = calendarData;

  // Get upcoming events (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const upcomingEvents = [
    ...events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= today && eventDate <= nextWeek;
    }).map(event => ({ ...event, type: 'event' })),
    
    ...holidays.filter(holiday => {
      const holidayDate = new Date(holiday.startDate);
      return holidayDate >= today && holidayDate <= nextWeek;
    }).map(holiday => ({ ...holiday, type: 'holiday' })),
    
    ...birthdays.filter(birthday => {
      const birthdayDate = new Date(birthday.date);
      return birthdayDate >= today && birthdayDate <= nextWeek;
    }).map(birthday => ({ ...birthday, type: 'birthday' })),
    
    ...anniversaries.filter(anniversary => {
      const anniversaryDate = new Date(anniversary.date);
      return anniversaryDate >= today && anniversaryDate <= nextWeek;
    }).map(anniversary => ({ ...anniversary, type: 'anniversary' }))
  ].sort((a, b) => {
    const dateA = new Date(a.startDate || a.date);
    const dateB = new Date(b.startDate || b.date);
    return dateA - dateB;
  });

  const getEventIcon = (type) => {
    switch (type) {
      case 'holiday':
        return Calendar;
      case 'event':
        return Calendar;
      case 'birthday':
        return Gift;
      case 'anniversary':
        return Award;
      default:
        return Calendar;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'holiday':
        return 'text-red-600 bg-red-50';
      case 'event':
        return 'text-blue-600 bg-blue-50';
      case 'birthday':
        return 'text-pink-600 bg-pink-50';
      case 'anniversary':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Monthly Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Monthly Summary
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{summary.totalEvents}</div>
            <div className="text-sm text-blue-700">Events</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{summary.totalHolidays}</div>
            <div className="text-sm text-red-700">Holidays</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{summary.totalLeaves}</div>
            <div className="text-sm text-orange-700">Leaves</div>
          </div>
          
          <div className="text-center p-3 bg-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-pink-600">{summary.totalBirthdays}</div>
            <div className="text-sm text-pink-700">Birthdays</div>
          </div>
        </div>
        
        {/* Leave Types Breakdown */}
        {summary.leavesByType && Object.keys(summary.leavesByType).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Leave Types</h4>
            <div className="space-y-1">
              {Object.entries(summary.leavesByType).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{type}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Attendance Summary */}
        {summary.attendanceSummary && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Attendance Overview</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-gray-600">Present</span>
                </div>
                <span className="font-medium text-gray-900">{summary.attendanceSummary.presentDays}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <XCircle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-gray-600">Absent</span>
                </div>
                <span className="font-medium text-gray-900">{summary.attendanceSummary.absentDays}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-orange-600 mr-2" />
                  <span className="text-gray-600">Late</span>
                </div>
                <span className="font-medium text-gray-900">{summary.attendanceSummary.lateDays}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Upcoming Events */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-green-600" />
          Upcoming (Next 7 Days)
        </h3>
        
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No upcoming events in the next 7 days
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.slice(0, 5).map((event, index) => {
              const EventIcon = getEventIcon(event.type);
              const eventDate = new Date(event.startDate || event.date);
              
              return (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onDateSelect(eventDate)}
                >
                  <div className={cn("p-1.5 rounded-full", getEventColor(event.type))}>
                    <EventIcon className="w-3 h-3" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {event.title || event.employeeName}
                      {event.type === 'birthday' && ' 🎂'}
                      {event.type === 'anniversary' && ` (${event.years}y) 🎊`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(eventDate)}
                    </div>
                    {event.leaveType && (
                      <div className="text-xs text-orange-600">
                        {event.leaveType} {event.isHalfDay ? '(Half Day)' : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {upcomingEvents.length > 5 && (
              <div className="text-center pt-2">
                <span className="text-sm text-gray-500">
                  +{upcomingEvents.length - 5} more events
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Quick Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm text-gray-600">Total Leaves</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{leaves.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Gift className="w-4 h-4 text-pink-600 mr-2" />
              <span className="text-sm text-gray-600">Birthdays</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{birthdays.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm text-gray-600">Anniversaries</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{anniversaries.length}</span>
          </div>
          
          {attendance.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm text-gray-600">Attendance Records</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{attendance.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

CalendarSidebar.propTypes = {
  calendarData: PropTypes.shape({
    summary: PropTypes.object,
    events: PropTypes.array,
    holidays: PropTypes.array,
    leaves: PropTypes.array,
    birthdays: PropTypes.array,
    anniversaries: PropTypes.array,
    attendance: PropTypes.array
  }),
  onDateSelect: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default CalendarSidebar;