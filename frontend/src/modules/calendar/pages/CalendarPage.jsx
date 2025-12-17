import React, { useEffect } from 'react';
import { Calendar as CalendarIcon, Download, Plus } from 'lucide-react';
import CalendarGrid from '../components/CalendarGrid';
import CalendarSidebar from '../components/CalendarSidebar';
import useCalendarStore from '../../../stores/useCalendarStore';
import calendarViewService from '../services/calendarViewService';
import useAuth from '../../../core/hooks/useAuth';

const CalendarPage = () => {
  const { user } = useAuth();
  const {
    currentDate,
    selectedDate,
    calendarData,
    loading,
    viewType,
    setSelectedDate,
    setViewType,
    fetchCalendarData,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    getEventsForDate,
    getAttendanceForDate
  } = useCalendarStore();

  useEffect(() => {
    if (user?.id) {
      fetchCalendarData({ employeeId: user.id });
    }
  }, [user?.id, fetchCalendarData]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };



  // Export calendar data
  const handleExport = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      await calendarViewService.exportCalendarData({
        year,
        month,
        format: 'xlsx',
        employeeId: user?.id
      });
    } catch (error) {
      console.error('Failed to export calendar:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
              <p className="text-sm text-gray-600">
                View events, holidays, leaves, and attendance
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Type Selector */}
            <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewType('month')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewType === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewType('week')}
                className={`px-4 py-2 text-sm font-medium border-l border-gray-300 ${
                  viewType === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewType('day')}
                className={`px-4 py-2 text-sm font-medium border-l border-gray-300 ${
                  viewType === 'day'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Day
              </button>
            </div>
            
            {/* Action Buttons */}
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            
            <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </button>
          </div>
        </div>
        
        {/* Calendar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <CalendarGrid
              currentDate={currentDate}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
              onToday={goToToday}
              getEventsForDate={getEventsForDate}
              getAttendanceForDate={getAttendanceForDate}
              className="shadow-sm"
            />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CalendarSidebar
              calendarData={calendarData}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              className="space-y-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;