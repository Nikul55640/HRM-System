import React from 'react';
import { Button } from '../../../shared/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const EmployeeCalendarToolbar = ({
  viewMode,
  setViewMode,
  selectedDate,
  setSelectedDate
}) => {
  const goToPrevious = () => {
    if (viewMode === 'today') {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() - 1);
      setSelectedDate(newDate);
    } else if (viewMode === 'week') {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() - 7);
      setSelectedDate(newDate);
    } else {
      // month
      const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
      setSelectedDate(newDate);
    }
  };

  const goToNext = () => {
    if (viewMode === 'today') {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + 1);
      setSelectedDate(newDate);
    } else if (viewMode === 'week') {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + 7);
      setSelectedDate(newDate);
    } else {
      // month
      const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
      setSelectedDate(newDate);
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getDisplayText = () => {
    if (viewMode === 'today') {
      return selectedDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      {/* LEFT: Calendar modes */}
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          variant={viewMode === 'today' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setViewMode('today');
            setSelectedDate(new Date());
          }}
          className="flex-1 sm:flex-none"
        >
          Today
        </Button>

        <Button
          variant={viewMode === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('week')}
          className="flex-1 sm:flex-none"
        >
          <span className="hidden sm:inline">7 Days</span>
          <span className="sm:hidden">Week</span>
        </Button>

        <Button
          variant={viewMode === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('month')}
          className="flex-1 sm:flex-none"
        >
          Month
        </Button>
      </div>

      {/* CENTER: Current date/period display */}
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center">
        <Button variant="outline" size="sm" onClick={goToPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2 min-w-0 flex-1 sm:min-w-64 justify-center">
          <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span className="font-medium text-gray-800 text-sm sm:text-base text-center truncate">
            {getDisplayText()}
          </span>
        </div>
        
        <Button variant="outline" size="sm" onClick={goToNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* RIGHT: Today button */}
      <div className="w-full sm:w-auto">
        <Button variant="outline" size="sm" onClick={goToToday} className="w-full sm:w-auto">
          <span className="hidden sm:inline">Go to Today</span>
          <span className="sm:hidden">Today</span>
        </Button>
      </div>
    </div>
  );
};

export default EmployeeCalendarToolbar;