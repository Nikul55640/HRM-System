import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { smartCalendarService } from "../../../services";
import {
  getEventTypeConfig,
  sortEventsByPriority,
} from "../../../core/utils/calendarEventTypes";
import EmployeeCalendarToolbar from "./EmployeeCalendarToolbar";
import EmployeeCalendarView from "./EmployeeCalendarView";
import DayEventsDrawer from "./DayEventsDrawer";

const EmployeeCalendarPage = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("month"); // today | week | month
  const [selectedDate, setSelectedDate] = useState(() => {
    // Check if date is provided in URL params
    const dateParam = searchParams.get("date");
    return dateParam ? new Date(dateParam) : new Date();
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [showDayEvents, setShowDayEvents] = useState(false);
  const [clickedDate, setClickedDate] = useState(null);

  const fetchEvents = useCallback(async (startDate, endDate) => {
    setLoading(true);
    try {
      // Use smart calendar service to get events that respect working rules
      const year = new Date(startDate).getFullYear();
      const month = new Date(startDate).getMonth() + 1;

      console.log("📅 Fetching smart calendar events for:", {
        year,
        month,
        startDate,
        endDate,
      });

      const response = await smartCalendarService.getSmartMonthlyCalendar({
        year,
        month,
      });

      if (response && response.success) {
        console.log("✅ Smart calendar response:", response.data);

        // Extract calendar data that respects working rules
        const calendarData = response.data || {};
        const calendar = calendarData.calendar || {};

        const allEvents = [];

        // Process each day in the calendar
        Object.keys(calendar).forEach((dateKey) => {
          const dayData = calendar[dateKey];
          const eventDate = dateKey; // Already in YYYY-MM-DD format

          // 🔍 DEBUG: Log leave data structure
          if (dayData.leave) {
            console.log(`📋 Leave data for ${dateKey}:`, {
              leave: dayData.leave,
              hasEmployeeName: !!dayData.leave.employeeName,
              employeeName: dayData.leave.employeeName,
              leaveType: dayData.leave.leaveType,
              employee: dayData.leave.employee
            });
          }

          // Add holiday if present and it's a working day (or show all holidays)
          if (dayData.holiday) {
            allEvents.push({
              ...dayData.holiday,
              eventType: "holiday",
              title: dayData.holiday.name || dayData.holiday.title,
              startDate: eventDate,
              color:
                dayData.holiday.color || getEventTypeConfig("holiday").color,
              isWorkingDay: dayData.isWorkingDay,
              isWeekend: dayData.isWeekend,
              dayStatus: dayData.status,
            });
          }

          // Add events
          if (dayData.events && Array.isArray(dayData.events)) {
            dayData.events.forEach((event) => {
              allEvents.push({
                ...event,
                eventType: event.eventType || "event",
                startDate: eventDate,
                color:
                  event.color ||
                  getEventTypeConfig(event.eventType || "event").color,
              });
            });
          }

          // Add leave if present (single employee leave from day status)
          if (dayData.leave) {
            const leaveEvent = {
              ...dayData.leave,
              eventType: "leave",
              title: dayData.leave.employeeName
                ? `${dayData.leave.employeeName} – ${dayData.leave.leaveType}`
                : dayData.leave.title || `Leave - ${dayData.leave.leaveType}`,
              employeeName: dayData.leave.employeeName,
              startDate: eventDate,
              color: dayData.leave.color || getEventTypeConfig("leave").color,
            };
            
            // 🔍 DEBUG: Log the final leave event
            console.log(`✅ Final leave event for ${dateKey}:`, leaveEvent);
            allEvents.push(leaveEvent);
          }

          // Add multiple leaves if present (admin view - multiple employees)
          if (dayData.leaves && Array.isArray(dayData.leaves)) {
            dayData.leaves.forEach((leave) => {
              const leaveEvent = {
                ...leave,
                eventType: "leave",
                title: leave.employeeName
                  ? `${leave.employeeName} – ${leave.leaveType}`
                  : `Leave - ${leave.leaveType}`,
                employeeName: leave.employeeName,
                startDate: eventDate,
                color: leave.color || getEventTypeConfig("leave").color,
              };
              
              // 🔍 DEBUG: Log the final leave event
              console.log(`✅ Final admin leave event for ${dateKey}:`, leaveEvent);
              allEvents.push(leaveEvent);
            });
          }

          // Add birthdays
          if (dayData.birthdays && Array.isArray(dayData.birthdays)) {
            dayData.birthdays.forEach((birthday) => {
              allEvents.push({
                ...birthday,
                eventType: "birthday",
                title: birthday.title || `${birthday.employeeName}'s Birthday`,
                startDate: eventDate,
                color: birthday.color || getEventTypeConfig("birthday").color,
              });
            });
          }

          // Add anniversaries
          if (dayData.anniversaries && Array.isArray(dayData.anniversaries)) {
            dayData.anniversaries.forEach((anniversary) => {
              allEvents.push({
                ...anniversary,
                eventType: "anniversary",
                title: anniversary.title || `${anniversary.employeeName}'s Work Anniversary`,
                startDate: eventDate,
                color:
                  anniversary.color || getEventTypeConfig("anniversary").color,
              });
            });
          }
        });

        // Sort events by priority and date
        const sortedEvents = sortEventsByPriority(allEvents);
        console.log("📊 Final sorted events:", sortedEvents.length, "events");
        console.log("🎯 Events by type:", {
          holidays: sortedEvents.filter((e) => e.eventType === "holiday")
            .length,
          leaves: sortedEvents.filter((e) => e.eventType === "leave").length,
          birthdays: sortedEvents.filter((e) => e.eventType === "birthday")
            .length,
          anniversaries: sortedEvents.filter(
            (e) => e.eventType === "anniversary",
          ).length,
          events: sortedEvents.filter((e) => e.eventType === "event").length,
        });
        setEvents(sortedEvents);
      } else {
        console.warn(
          "❌ Smart calendar API returned unsuccessful response:",
          response,
        );
        setEvents([]);
      }
    } catch (error) {
      console.error("💥 Failed to fetch calendar events:", error);
      toast.error("Failed to load calendar events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatLocalDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch events based on current view mode and date
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

      // month view
      const startOfMonth = formatLocalDate(new Date(year, month, 1));
      const endOfMonth = formatLocalDate(new Date(year, month + 1, 0));

      return { start: startOfMonth, end: endOfMonth };
    };

    const { start, end } = getDateRange();
    fetchEvents(start, end);
  }, [viewMode, selectedDate, fetchEvents]);

  const handleDateClick = (date) => {
   const dateStr = formatLocalDate(date);

const dayEvents = events.filter(event => {
  return event.startDate === dateStr;
});

    // 🔍 DEBUG: Log day events
    console.log(`📅 Day clicked: ${dateStr}`);
    console.log(`📊 Events for this day:`, dayEvents);
    dayEvents.forEach((event, idx) => {
      console.log(`  Event ${idx + 1}:`, {
        type: event.eventType,
        title: event.title,
        employeeName: event.employeeName,
        leaveType: event.leaveType
      });
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
    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">
          Calendar
        </h1>
        <p className="text-sm text-gray-600">
          View holidays, leaves, and important dates
        </p>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <div>
              Debug: {events.length} events loaded | View: {viewMode} | Date:{" "}
              {selectedDate.toDateString()}
            </div>
            <div>
              Events breakdown: Holidays:{" "}
              {events.filter((e) => e.eventType === "holiday").length} | Leaves:{" "}
              {events.filter((e) => e.eventType === "leave").length} |
              Birthdays:{" "}
              {events.filter((e) => e.eventType === "birthday").length} |
              Others:{" "}
              {
                events.filter(
                  (e) =>
                    !["holiday", "leave", "birthday"].includes(e.eventType),
                ).length
              }
            </div>
          </div>
        )}
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
