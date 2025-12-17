import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../../lib/utils';
import { 
  Calendar, 
  Users, 
  Gift, 
  Award,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const CalendarCell = ({
  date,
  isToday,
  isCurrentMonth,
  isSelected,
  events = [],
  attendance = [],
  onClick
}) => {
  const dayNumber = date.getDate();
  
  // Group events by type
  const eventsByType = events.reduce((acc, event) => {
    if (!acc[event.type]) acc[event.type] = [];
    acc[event.type].push(event);
    return acc;
  }, {});
  
  // Get event type colors and icons
  const getEventTypeInfo = (type) => {
    switch (type) {
      case 'holiday':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          icon: Calendar,
          label: 'Holiday'
        };
      case 'event':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          icon: Calendar,
          label: 'Event'
        };
      case 'leave':
        return { 
          color: 'bg-orange-100 text-orange-800 border-orange-200', 
          icon: Users,
          label: 'Leave'
        };
      case 'birthday':
        return { 
          color: 'bg-pink-100 text-pink-800 border-pink-200', 
          icon: Gift,
          label: 'Birthday'
        };
      case 'anniversary':
        return { 
          color: 'bg-purple-100 text-purple-800 border-purple-200', 
          icon: Award,
          label: 'Anniversary'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          icon: Calendar,
          label: 'Event'
        };
    }
  };
  
  // Get attendance status color
  const getAttendanceStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'text-green-600';
      case 'absent':
        return 'text-red-600';
      case 'late':
        return 'text-orange-600';
      case 'half_day':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const getAttendanceIcon = (status) => {
    switch (status) {
      case 'present':
        return CheckCircle;
      case 'absent':
        return XCircle;
      case 'late':
        return AlertCircle;
      case 'half_day':
        return Clock;
      default:
        return Clock;
    }
  };
  
  // Calculate cell height based on content
  const hasContent = events.length > 0 || attendance.length > 0;
  const cellHeight = hasContent ? 'h-24' : 'h-16';

  return (
    <div
      className={cn(
        "border-r border-b border-gray-200 p-2 cursor-pointer transition-colors duration-150",
        cellHeight,
        isCurrentMonth ? "bg-white hover:bg-gray-50" : "bg-gray-50 text-gray-400",
        isSelected && "bg-blue-50 border-blue-300",
        isToday && "bg-blue-100 font-semibold"
      )}
      onClick={onClick}
    >
      {/* Date Number */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "text-sm",
            isToday && "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold",
            !isToday && isSelected && "text-blue-600 font-semibold"
          )}
        >
          {dayNumber}
        </span>
        
        {/* Attendance Status Indicator */}
        {attendance.length > 0 && (
          <div className="flex items-center space-x-1">
            {attendance.slice(0, 2).map((record, index) => {
              const AttendanceIcon = getAttendanceIcon(record.status);
              return (
                <AttendanceIcon
                  key={index}
                  className={cn(
                    "w-3 h-3",
                    getAttendanceStatusColor(record.status)
                  )}
                />
              );
            })}
            {attendance.length > 2 && (
              <span className="text-xs text-gray-500">+{attendance.length - 2}</span>
            )}
          </div>
        )}
      </div>
      
      {/* Events */}
      <div className="space-y-1 overflow-hidden">
        {/* Holidays */}
        {eventsByType.holiday?.slice(0, 1).map((holiday, index) => (
          <div
            key={`holiday-${index}`}
            className={cn(
              "text-xs px-1 py-0.5 rounded border truncate",
              getEventTypeInfo('holiday').color
            )}
            title={holiday.title}
          >
            {holiday.title}
          </div>
        ))}
        
        {/* Leaves */}
        {eventsByType.leave?.slice(0, 1).map((leave, index) => (
          <div
            key={`leave-${index}`}
            className={cn(
              "text-xs px-1 py-0.5 rounded border truncate",
              getEventTypeInfo('leave').color
            )}
            title={`${leave.employeeName} - ${leave.leaveType} ${leave.isHalfDay ? '(Half Day)' : ''}`}
          >
            {leave.employeeName} - {leave.leaveType}
            {leave.isHalfDay && ' (½)'}
          </div>
        ))}
        
        {/* Events */}
        {eventsByType.event?.slice(0, 1).map((event, index) => (
          <div
            key={`event-${index}`}
            className={cn(
              "text-xs px-1 py-0.5 rounded border truncate",
              getEventTypeInfo('event').color
            )}
            title={event.title}
          >
            {event.title}
          </div>
        ))}
        
        {/* Birthdays */}
        {eventsByType.birthday?.slice(0, 1).map((birthday, index) => (
          <div
            key={`birthday-${index}`}
            className={cn(
              "text-xs px-1 py-0.5 rounded border truncate",
              getEventTypeInfo('birthday').color
            )}
            title={`${birthday.employeeName}'s Birthday (${birthday.age} years)`}
          >
            🎂 {birthday.employeeName}
          </div>
        ))}
        
        {/* Anniversaries */}
        {eventsByType.anniversary?.slice(0, 1).map((anniversary, index) => (
          <div
            key={`anniversary-${index}`}
            className={cn(
              "text-xs px-1 py-0.5 rounded border truncate",
              getEventTypeInfo('anniversary').color
            )}
            title={`${anniversary.employeeName} - ${anniversary.years} years`}
          >
            🎊 {anniversary.employeeName} ({anniversary.years}y)
          </div>
        ))}
        
        {/* More indicator */}
        {events.length > 2 && (
          <div className="text-xs text-gray-500 font-medium">
            +{events.length - 2} more
          </div>
        )}
      </div>
    </div>
  );
};

CalendarCell.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  isToday: PropTypes.bool.isRequired,
  isCurrentMonth: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  events: PropTypes.array,
  attendance: PropTypes.array,
  onClick: PropTypes.func.isRequired
};

export default CalendarCell;