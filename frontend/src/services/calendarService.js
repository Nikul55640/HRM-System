import api from './api';
import useAuthStore from '../stores/useAuthStore';

const calendarService = {
  // =========================================================
  // EMPLOYEE-SAFE CALENDAR EVENTS
  // =========================================================

  // Get events by date range - Employee Safe Version
  getEventsByDateRange: async (startDate, endDate) => {
    try {
      const { user } = useAuthStore.getState();
      const isEmployee = user?.role?.toLowerCase() === 'employee';
      
      if (isEmployee) {
        // Use employee-specific monthly calendar endpoint
        const start = new Date(startDate);
        const year = start.getFullYear();
        const month = start.getMonth() + 1;
        
        const response = await api.get('/employee/calendar/monthly', { 
          params: { year, month } 
        });
        
        if (response.data.success) {
          // Transform monthly calendar data to events format
          const events = [];
          const calendar = response.data.calendar || {};
          
          Object.values(calendar).forEach(day => {
            if (day.holiday) {
              events.push({
                ...day.holiday,
                eventType: 'holiday',
                title: day.holiday.name || day.holiday.title,
                startDate: day.date,
                color: '#EF4444'
              });
            }
            if (day.birthday) {
              events.push({
                ...day.birthday,
                eventType: 'birthday',
                title: day.birthday.title,
                startDate: day.date,
                color: '#10B981'
              });
            }
            if (day.anniversary) {
              events.push({
                ...day.anniversary,
                eventType: 'anniversary',
                title: day.anniversary.title,
                startDate: day.date,
                color: '#8B5CF6'
              });
            }
            if (day.leave) {
              events.push({
                ...day.leave,
                eventType: 'leave',
                title: `${day.leave.leaveType} Leave`,
                startDate: day.date,
                color: '#F59E0B'
              });
            }
            if (day.events && day.events.length > 0) {
              day.events.forEach(event => {
                events.push({
                  ...event,
                  eventType: 'event',
                  title: event.title || event.name,
                  startDate: day.date,
                  color: '#3B82F6'
                });
              });
            }
          });
          
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
        }
        
        return { success: false, data: { events: [] } };
      } else {
        // Admin/HR can use the full calendar API
        const start = new Date(startDate);
        const year = start.getFullYear();
        const month = start.getMonth() + 1;
        
        const response = await api.get('/calendar/events', { 
          params: { year, month, startDate, endDate } 
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      // Return empty data instead of throwing
      return { success: false, data: { events: [] } };
    }
  },

  // Get all calendar events - Employee Safe Version
  getCalendarEvents: async (params = {}) => {
    try {
      const { user } = useAuthStore.getState();
      const isEmployee = user?.role?.toLowerCase() === 'employee';
      
      if (isEmployee) {
        // Use monthly calendar for current month
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        
        return await calendarService.getEventsByDateRange(
          `${year}-${month.toString().padStart(2, '0')}-01`,
          `${year}-${month.toString().padStart(2, '0')}-31`
        );
      } else {
        const response = await api.get('/calendar/events', { params });
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return { success: false, data: { events: [] } };
    }
  },

  // Get upcoming events - Employee Safe Version
  getUpcomingEvents: async (limit = 10) => {
    try {
      const { user } = useAuthStore.getState();
      const isEmployee = user?.role?.toLowerCase() === 'employee';
      
      if (isEmployee) {
        // Get current and next month data
        const now = new Date();
        const currentMonth = await calendarService.getEventsByDateRange(
          `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-01`,
          `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-31`
        );
        
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const nextMonthData = await calendarService.getEventsByDateRange(
          `${nextMonth.getFullYear()}-${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}-01`,
          `${nextMonth.getFullYear()}-${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}-31`
        );
        
        const allEvents = [
          ...(currentMonth.data?.events || []),
          ...(nextMonthData.data?.events || [])
        ];
        
        // Filter future events and sort by date
        const futureEvents = allEvents
          .filter(event => new Date(event.startDate) >= now)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, limit);
        
        return {
          success: true,
          data: futureEvents
        };
      } else {
        const response = await api.get('/calendar/upcoming', { 
          params: { limit } 
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return { success: false, data: [] };
    }
  },

  // =========================================================
  // COMPANY EVENTS (Admin/HR Only)
  // =========================================================

  // Get all events (admin)
  getAllEvents: async () => {
    try {
      const response = await api.get('/admin/events');
      return response.data;
    } catch (error) {
      console.error('Error fetching all events:', error);
      throw error;
    }
  },

  // Create company event
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/admin/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Update company event
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await api.put(`/admin/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Delete company event
  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/admin/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  // =========================================================
  // HOLIDAYS - Employee Safe Version
  // =========================================================

  // Get all holidays - Employee Safe Version
  getHolidays: async (year) => {
    try {
      const { user } = useAuthStore.getState();
      const isEmployee = user?.role?.toLowerCase() === 'employee';
      
      if (isEmployee) {
        // Get holidays from monthly calendar data for the entire year
        const holidays = [];
        
        for (let month = 1; month <= 12; month++) {
          try {
            const response = await api.get('/employee/calendar/monthly', {
              params: { year: year || new Date().getFullYear(), month }
            });
            
            if (response.data.success && response.data.calendar) {
              Object.values(response.data.calendar).forEach(day => {
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
            console.warn(`Failed to fetch holidays for month ${month}:`, monthError);
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
      } else {
        const response = await api.get('/admin/holidays', {
          params: year ? { year } : {}
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      return { success: false, data: { data: { holidays: [] } } };
    }
  },

  // Create holiday
  createHoliday: async (holidayData) => {
    try {
      const response = await api.post('/admin/holidays', holidayData);
      return response.data;
    } catch (error) {
      console.error('Error creating holiday:', error);
      throw error;
    }
  },

  // Update holiday
  updateHoliday: async (holidayId, holidayData) => {
    try {
      const response = await api.put(`/admin/holidays/${holidayId}`, holidayData);
      return response.data;
    } catch (error) {
      console.error('Error updating holiday:', error);
      throw error;
    }
  },

  // Delete holiday
  deleteHoliday: async (holidayId) => {
    try {
      const response = await api.delete(`/admin/holidays/${holidayId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting holiday:', error);
      throw error;
    }
  },

  // Get holidays for calendar - Employee Safe Version
  getHolidaysForCalendar: async (year) => {
    try {
      return await calendarService.getHolidays(year);
    } catch (error) {
      console.error('Error fetching holidays for calendar:', error);
      return { success: false, data: { data: { holidays: [] } } };
    }
  },

  // =========================================================
  // EMPLOYEE SYNC (Admin Only)
  // =========================================================

  // Sync employee birthdays and anniversaries
  syncEmployeeEvents: async () => {
    try {
      const response = await api.post('/calendar/sync-employee-events');
      return response.data;
    } catch (error) {
      console.error('Error syncing employee events:', error);
      throw error;
    }
  },
};

export default calendarService;