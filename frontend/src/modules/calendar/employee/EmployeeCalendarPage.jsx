import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { calendarService } from '../../../services';
import { getEventTypeConfig, sortEventsByPriority } from '../../../core/utils/calendarEventTypes';
import EmployeeCalendarToolbar from './EmployeeCalendarToolbar';
import EmployeeCalendarView from './EmployeeCalendarView';
import DayEventsDrawer from './DayEventsDrawer';

const EmployeeCalendarPage = () => {
  const [viewMode, setViewMode] = useState('month'); // today | week | month
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [showDayEvents, setShowDayEvents] = useState(false);
  const [clickedDate, setClickedDate] = useState(null);

  const fetchEvents = useCallback(async (startDate, endDate) => {
    setLoading(true);
    try {
      const response = await calendarService.getEventsByDateRange(startDate, endDate);
      
      if (response && response.success) {
        // Extract all event types from response data
        const calendarData = response.data || {};
        
        const allEvents = [
          ...(calendarData.events || []).map(e => ({
            ...e,
            eventType: e.eventType || 'event',
            color: e.color || getEventTypeConfig(e.eventType || 'event').color
          })),
          ...(calendarData.holidays || []).map(h => ({
            ...h,
            eventType: 'holiday',
            title: h.name || h.title,
            startDate: h.date || h.startDate,
            color: h.color || getEventTypeConfig('holiday').color
          })),
          ...(calendarData.leaves || []).map(l => ({
            ...l,
            eventType: 'leave',
            title: l.title || `${l.employeeName} - ${l.leaveType}`,
            color: l.color || getEventTypeConfig('leave').color
          })),
          ...(calendarData.birthdays || []).map(b => ({
            ...b,
            eventType: 'birthday',
            title: b.title || `🎂 ${b.employeeName}`,
            startDate: b.date || b.startDate,
            color: b.color || getEventTypeConfig('birthday').color
          })),
          ...(calendarData.anniversaries || []).map(a => ({
            ...a,
            eventType: 'anniversary',
            title: a.title || `🎊 ${a.employeeName}`,
            startDate: a.date || a.startDate,
            color: a.color || getEventTypeConfig('anniversary').color
          }))
        ];
        
        // Sort events by priority and date
        const sortedEvents = sortEventsByPriority(allEvents);
        setEvents(sortedEvents);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      toast.error('Failed to load calendar events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch events based on current view mode and date
  useEffect(() => {
    const getDateRange = () => {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      
      if (viewMode === 'today') {
        const today = selectedDate.toISOString().split('T')[0];
        return { start: today, end: today };
      }
      
      if (viewMode === 'week') {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return {
          start: startOfWeek.toISOString().split('T')[0],
          end: endOfWeek.toISOString().split('T')[0]
        };
      }
      
      // month view
      const startOfMonth = new Date(year, month, 1).toISOString().split('T')[0];
      const endOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      return { start: startOfMonth, end: endOfMonth };
    };

    const { start, end } = getDateRange();
    fetchEvents(start, end);
  }, [viewMode, selectedDate, fetchEvents]);

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
    
    setClickedDate(date);
    setSelectedDayEvents(dayEvents);
    setShowDayEvents(true);
  };

  const handleCloseDayEvents = () => {
    setShowDayEvents(false);
    setClickedDate(null);
    setSelectedDayEvents([]);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600">View holidays, leaves, and important dates</p>
      </div>

      <EmployeeCalendarToolbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      <EmployeeCalendarView
        viewMode={viewMode}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        events={events}
        fetchEvents={fetchEvents}
        loading={loading}
        onDateClick={handleDateClick}
      />

      {showDayEvents && (
        <DayEventsDrawer
          date={clickedDate}
          events={selectedDayEvents}
          onClose={handleCloseDayEvents}
        />
      )}
    </div>
  );
};

export default EmployeeCalendarPage;