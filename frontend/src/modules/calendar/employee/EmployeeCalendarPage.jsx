import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import employeeCalendarService from "../../../services/employeeCalendarService";
import {
  getEventTypeConfig,
  sortEventsByPriority,
  getEventColor,
} from "../../../core/utils/calendarEventTypes";
import EmployeeCalendarToolbar from "./EmployeeCalendarToolbar";
import EmployeeCalendarView from "./EmployeeCalendarView";
import DayEventsDrawer from "./DayEventsDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";
import { PlaneTakeoff, Users, Calendar as CalendarIcon, Loader2 } from "lucide-react";

const EmployeeCalendarPage = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("month");
  const [selectedDate, setSelectedDate] = useState(() => {
    const dateParam = searchParams.get("date");
    return dateParam ? new Date(dateParam) : new Date();
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [showDayEvents, setShowDayEvents] = useState(false);
  const [clickedDate, setClickedDate] = useState(null);
  const [leaveStats, setLeaveStats] = useState({
    todayOnLeave: [],
    thisWeekOnLeave: [],
    totalOnLeave: 0,
    loading: true
  });

  const fetchEvents = useCallback(async (startDate, endDate) => {
    setLoading(true);
    try {
      console.log("📅 [EMPLOYEE CALENDAR] Fetching events for:", {
        startDate,
        endDate,
        viewMode,
      });

      // ✅ SECURITY FIX: Use employee-safe calendar service
      const response = await employeeCalendarService.getEventsByDateRange(startDate, endDate);

      if (response && response.success) {
        console.log("✅ [EMPLOYEE CALENDAR] Events loaded:", response.data);

        const allEvents = response.data.events || [];

        // ✅ IMPROVEMENT: Guard against duplicate events with Set tracking
        const addedEventIds = new Set();
        const uniqueEvents = [];

        allEvents.forEach((event, index) => {
          const eventId = event.id || `${event.eventType}-${event.startDate}-${event.title}-${index}`;
          
          if (!addedEventIds.has(eventId)) {
            addedEventIds.add(eventId);
            
            const processedEvent = {
              ...event,
              id: eventId,
              eventType: event.eventType || "event",
              title: event.title || "Untitled Event",
              startDate: event.startDate || event.date,
              endDate: event.endDate || event.startDate || event.date,
              isAllDay: event.isAllDay !== false,
              color: event.color || getEventColor(event.eventType || "event"),
              description: event.description || 
                (event.eventType === "leave" && event.employeeName 
                  ? `${event.employeeName} is on ${event.leaveType || "leave"}`
                  : event.title || "Event"),
            };

            uniqueEvents.push(processedEvent);
          }
        });

        const sortedEvents = sortEventsByPriority(uniqueEvents);
        
        console.log("📊 [EMPLOYEE CALENDAR] Final events:", sortedEvents.length, "events");
        console.log("🎯 [EMPLOYEE CALENDAR] Events by type:", {
          holidays: sortedEvents.filter((e) => e.eventType === "holiday").length,
          leaves: sortedEvents.filter((e) => e.eventType === "leave").length,
          birthdays: sortedEvents.filter((e) => e.eventType === "birthday").length,
          anniversaries: sortedEvents.filter((e) => e.eventType === "anniversary").length,
          companyEvents: sortedEvents.filter((e) => e.eventType === "company_event").length,
          events: sortedEvents.filter((e) => e.eventType === "event").length,
          other: sortedEvents.filter((e) => e.eventType === "other").length,
        });
        
        setEvents(sortedEvents);
        
        // ✅ NEW: Calculate leave statistics
        calculateLeaveStats(sortedEvents);
      } else {
        console.warn("❌ [EMPLOYEE CALENDAR] API returned unsuccessful response:", response);
        toast.warning("Unable to load calendar events. Please try again.");
        setEvents([]);
        setLeaveStats(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("💥 [EMPLOYEE CALENDAR] Failed to fetch events:", error);
      toast.error("Failed to load calendar events. Please check your connection and try again.");
      setEvents([]);
      setLeaveStats(prev => ({ ...prev, loading: false }));
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  // ✅ NEW: Calculate leave statistics from events
  const calculateLeaveStats = useCallback((events) => {
    const today = new Date();
    const todayStr = formatLocalDate(today);
    
    // Get start and end of current week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const leaveEvents = events.filter(event => event.eventType === "leave");
    
    // Today's leaves
    const todayOnLeave = leaveEvents
      .filter(event => event.startDate === todayStr)
      .map(event => ({
        name: event.employeeName || event.title,
        leaveType: event.leaveType || "Leave",
        department: event.department || "Unknown",
        startDate: event.startDate,
        endDate: event.endDate
      }));
    
    // This week's leaves
    const thisWeekOnLeave = leaveEvents
      .filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      })
      .map(event => ({
        name: event.employeeName || event.title,
        leaveType: event.leaveType || "Leave",
        department: event.department || "Unknown",
        startDate: event.startDate,
        endDate: event.endDate,
        isToday: event.startDate === todayStr
      }))
      .sort((a, b) => {
        // Sort by today first, then by date
        if (a.isToday && !b.isToday) return -1;
        if (!a.isToday && b.isToday) return 1;
        return new Date(a.startDate) - new Date(b.startDate);
      });
    
    setLeaveStats({
      todayOnLeave,
      thisWeekOnLeave,
      totalOnLeave: leaveEvents.length,
      loading: false
    });
    
    console.log("🏖️ [EMPLOYEE CALENDAR] Leave stats calculated:", {
      todayOnLeave: todayOnLeave.length,
      thisWeekOnLeave: thisWeekOnLeave.length,
      totalOnLeave: leaveEvents.length
    });
  }, []);

  const formatLocalDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const getDateRange = () => {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();

      if (viewMode === "today") {
        const today = formatLocalDate(selectedDate);
        return { start: today, end: today };
      }

      if (viewMode === "week") {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return {
          start: formatLocalDate(startOfWeek),
          end: formatLocalDate(endOfWeek),
        };
      }

      const startOfMonth = formatLocalDate(new Date(year, month, 1));
      const endOfMonth = formatLocalDate(new Date(year, month + 1, 0));

      return { start: startOfMonth, end: endOfMonth };
    };

    const { start, end } = getDateRange();
    fetchEvents(start, end);
  }, [viewMode, selectedDate, fetchEvents]);

  // ✅ IMPROVEMENT: Memoize filtered day events for performance
  const dayEvents = useMemo(() => {
    if (!clickedDate) return [];
    const dateStr = formatLocalDate(clickedDate);
    return sortEventsByPriority(
      events.filter(event => event.startDate === dateStr)
    );
  }, [clickedDate, events]);

  const handleDateClick = (date) => {
    setClickedDate(date);
    setShowDayEvents(true);
    
    const dateStr = formatLocalDate(date);
    console.log(`📅 [EMPLOYEE CALENDAR] Day clicked: ${dateStr}`);
    console.log(`📊 [EMPLOYEE CALENDAR] Events for this day:`, dayEvents.length, "events");
    
    if (process.env.NODE_ENV === "development") {
      dayEvents.forEach((event, idx) => {
        console.log(`  Event ${idx + 1}:`, {
          id: event.id,
          type: event.eventType,
          title: event.title,
          employeeName: event.employeeName,
          color: event.color,
          isAllDay: event.isAllDay,
        });
      });
    }
  };

  const handleCloseDayEvents = () => {
    setShowDayEvents(false);
    setClickedDate(null);
    setSelectedDayEvents([]);
  };

  useEffect(() => {
    setSelectedDayEvents(dayEvents);
  }, [dayEvents]);

  return (
    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">
          Employee Calendar
        </h1>
        <p className="text-sm text-gray-600">
          View holidays, team leaves, birthdays, anniversaries, and company events
        </p>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <div>
              Debug: {events.length} events loaded | View: {viewMode} | Date:{" "}
              {selectedDate.toDateString()}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>Holidays: {events.filter((e) => e.eventType === "holiday").length}</div>
              <div>Leaves: {events.filter((e) => e.eventType === "leave").length}</div>
              <div>Birthdays: {events.filter((e) => e.eventType === "birthday").length}</div>
              <div>Anniversaries: {events.filter((e) => e.eventType === "anniversary").length}</div>
              <div>Company Events: {events.filter((e) => e.eventType === "company_event").length}</div>
              <div>Events: {events.filter((e) => e.eventType === "event").length}</div>
              <div>Other: {events.filter((e) => e.eventType === "other").length}</div>
              <div>Total: {events.length}</div>
            </div>
          </div>
        )}
        
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {[
            { type: "holiday", label: "Holidays", color: getEventColor("holiday") },
            { type: "leave", label: "Team Leaves", color: getEventColor("leave") },
            { type: "birthday", label: "Birthdays", color: getEventColor("birthday") },
            { type: "anniversary", label: "Anniversaries", color: getEventColor("anniversary") },
            { type: "company_event", label: "Company Events", color: getEventColor("company_event") },
          ].map(({ type, label, color }) => (
            <div key={type} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full border border-gray-300" 
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-gray-600">{label}</span>
            </div>
          ))}
        </div>
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