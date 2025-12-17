import React from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import CalendarCell from './CalendarCell';

const CalendarGrid = ({
  currentDate,
  selectedDate,
  onDateSelect,
  onPreviousMonth,
  onNextMonth,
  onToday,
  getEventsForDate,
  getAttendanceForDate,
  className
}) => {
  // Get calendar grid data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of month and calculate grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
  
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay())); // End on Saturday
  
  // Generate calendar days
  const calendarDays = [];
  const currentDay = new Date(startDate);
  
  while (currentDay <= endDate) {
    calendarDays.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }
  
  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const isCurrentMonth = (date) => {
    return date.getMonth() === month;
  };
  
  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 overflow-hidden", className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={onToday}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <CalendarIcon className="w-4 h-4 mr-1.5" />
            Today
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onPreviousMonth}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {dayNames.map((day) => (
          <div
            key={day}
            className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {weeks.map((week, weekIndex) => (
          week.map((date, dayIndex) => (
            <CalendarCell
              key={`${weekIndex}-${dayIndex}`}
              date={date}
              isToday={isToday(date)}
              isCurrentMonth={isCurrentMonth(date)}
              isSelected={isSelected(date)}
              events={getEventsForDate(date)}
              attendance={getAttendanceForDate(date)}
              onClick={() => onDateSelect(date)}
            />
          ))
        ))}
      </div>
    </div>
  );
};

CalendarGrid.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  selectedDate: PropTypes.instanceOf(Date),
  onDateSelect: PropTypes.func.isRequired,
  onPreviousMonth: PropTypes.func.isRequired,
  onNextMonth: PropTypes.func.isRequired,
  onToday: PropTypes.func.isRequired,
  getEventsForDate: PropTypes.func.isRequired,
  getAttendanceForDate: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default CalendarGrid;