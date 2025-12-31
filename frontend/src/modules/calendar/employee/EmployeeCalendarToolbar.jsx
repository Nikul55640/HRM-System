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
    <div className="flex justify-between items-center">
      {/* LEFT: Calendar modes */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'today' ? 'default' : 'outline'}
          onClick={() => {
            setViewMode('today');
            setSelectedDate(new Date());
          }}
        >
          Today
        </Button>

        <Button
          variant={viewMode === 'week' ? 'default' : 'outline'}
          onClick={() => setViewMode('week')}
        >
          7 Days
        </Button>

        <Button
          variant={viewMode === 'month' ? 'default' : 'outline'}
          onClick={() => setViewMode('month')}
        >
          Month
        </Button>
      </div>

      {/* CENTER: Current date/period display */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={goToPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2 min-w-64 justify-center">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-800">{getDisplayText()}</span>
        </div>
        
        <Button variant="outline" size="sm" onClick={goToNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* RIGHT: Today button */}
      <div>
        <Button variant="outline" onClick={goToToday}>
          Go to Today
        </Button>
      </div>
    </div>
  );
};

export default EmployeeCalendarToolbar;