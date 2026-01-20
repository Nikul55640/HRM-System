import api from './api';

/**
 * Employee Calendar Service
 * Uses employee-specific endpoints to avoid 403 errors
 */
const employeeCalendarService = {
  // Get daily calendar data for a specific date
  getDailyCalendar: async (date) => {
    try {
      const response = await api.get('/employee/calendar/daily', {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching daily calendar:', error);
      return { success: false, data: null };
    }
  },

  // Get monthly calendar data
  getMonthlyCalendar: async (year, month) => {
    try {
      const response = await api.get('/employee/calendar/monthly', {
        params: { year, month }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly calendar:', error);
      return { success: false, calendar: {} };
    }
  },

  // Get events for date range (transforms monthly data to events format)
  getEventsByDateRange: async (startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const events = [];

      // Get data for each month in the range
      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

      while (current <= endMonth) {
        const year = current.getFullYear();
        const month = current.getMonth() + 1;

        const monthlyData = await employeeCalendarService.getMonthlyCalendar(year, month);
        
        if (monthlyData.success && monthlyData.calendar) {
          Object.values(monthlyData.calendar).forEach(day => {
            const dayDate = new Date(day.date);
            
            // Only include days within the requested range
            if (dayDate >= start && dayDate <= end) {
              // Add holiday events
              if (day.holiday) {
                events.push({
                  ...day.holiday,
                  eventType: 'holiday',
                  title: day.holiday.name || day.holiday.title,
                  startDate: day.date,
                  date: day.date,
                  color: '#EF4444'
                });
              }

              // Add birthday events
              if (day.birthday) {
                events.push({
                  ...day.birthday,
                  eventType: 'birthday',
                  title: day.birthday.title,
                  startDate: day.date,
                  date: day.date,
                  color: '#10B981'
                });
              }

              // Add anniversary events
              if (day.anniversary) {
                events.push({
                  ...day.anniversary,
                  eventType: 'anniversary',
                  title: day.anniversary.title,
                  startDate: day.date,
                  date: day.date,
                  color: '#8B5CF6'
                });
              }

              // Add leave events
              if (day.leave) {
                events.push({
                  ...day.leave,
                  eventType: 'leave',
                  title: `${day.leave.leaveType} Leave`,
                  employeeName: 'You',
                  startDate: day.date,
                  date: day.date,
                  color: '#F59E0B'
                });
              }

              // Add other company events
              if (day.events && day.events.length > 0) {
                day.events.forEach(event => {
                  events.push({
                    ...event,
                    eventType: 'event',
                    title: event.title || event.name,
                    startDate: day.date,
                    date: day.date,
                    color: '#3B82F6'
                  });
                });
              }
            }
          });
        }

        // Move to next month
        current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      }

      return {
        success: true,
        data: {
          events,
          leaves: events.filter(e => e.eventType === 'leave'),
          holidays: events.filter(e => e.eventType === 'holiday'),
          birthdays: events.filter(e => e.eventType === 'birthday'),
          anniversaries: events.filter(e => e.eventType === 'anniversary')
        }
      };
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      return { success: false, data: { events: [] } };
    }
  },

  // Get holidays for a specific year
  getHolidays: async (year) => {
    try {
      const holidays = [];
      const targetYear = year || new Date().getFullYear();

      // Get holidays from all months of the year
      for (let month = 1; month <= 12; month++) {
        try {
          const monthlyData = await employeeCalendarService.getMonthlyCalendar(targetYear, month);
          
          if (monthlyData.success && monthlyData.calendar) {
            Object.values(monthlyData.calendar).forEach(day => {
              if (day.holiday) {
                holidays.push({
                  ...day.holiday,
                  date: day.date,
                  name: day.holiday.name || day.holiday.title,
                  type: 'holiday'
                });
              }
            });
          }
        } catch (monthError) {
          console.warn(`Failed to fetch holidays for ${targetYear}-${month}:`, monthError);
        }
      }

      return {
        success: true,
        data: {
          data: {
            holidays: holidays
          }
        }
      };
    } catch (error) {
      console.error('Error fetching holidays:', error);
      return { success: false, data: { data: { holidays: [] } } };
    }
  },

  // Get upcoming events (next 30 days)
  getUpcomingEvents: async (limit = 10) => {
    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now

      const eventsData = await employeeCalendarService.getEventsByDateRange(
        now.toISOString().split('T')[0],
        futureDate.toISOString().split('T')[0]
      );

      if (eventsData.success) {
        // Filter future events and sort by date
        const futureEvents = eventsData.data.events
          .filter(event => new Date(event.startDate) >= now)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, limit);

        return {
          success: true,
          data: futureEvents
        };
      }

      return { success: false, data: [] };
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return { success: false, data: [] };
    }
  }
};

export default employeeCalendarService;