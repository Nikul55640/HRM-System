import React, { useMemo } from 'react';
import TodayView from './views/TodayView';
import WeekView from './views/WeekView';
import MonthView from './views/MonthView';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { PlaneTakeoff, Users, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';

const EmployeeCalendarView = ({
  viewMode,
  selectedDate,
  setSelectedDate,
  events,
  fetchEvents,
  loading,
  onDateClick
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (viewMode === 'today') {
    return (
      <TodayView
        date={selectedDate}
        events={events}
        fetchEvents={fetchEvents}
        loading={loading}
      />
    );
  }

  if (viewMode === 'week') {
    return (
      <WeekView
        date={selectedDate}
        events={events}
        fetchEvents={fetchEvents}
        onDateClick={onDateClick}
        loading={loading}
      />
    );
  }

  return (
    <MonthView
      date={selectedDate}
      events={events}
      fetchEvents={fetchEvents}
      onDateClick={onDateClick}
      loading={loading}
    />
  );
};

export default EmployeeCalendarView;