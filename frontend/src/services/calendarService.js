import api from './api';

const calendarService = {
  // =========================================================
  // CALENDAR EVENTS
  // =========================================================

  // Get events by date range
  getEventsByDateRange: async (startDate, endDate) => {
    try {
      // Convert date range to year/month for the backend API
      const start = new Date(startDate);
      const year = start.getFullYear();
      const month = start.getMonth() + 1;
      
      const response = await api.get('/calendar/events', { 
        params: { year, month, startDate, endDate } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      throw error;
    }
  },

  // Get all calendar events (holidays, company events, leaves, etc.)
  getCalendarEvents: async (params = {}) => {
    try {
      const response = await api.get('/calendar/events', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  },

  // Get upcoming events
  getUpcomingEvents: async (limit = 10) => {
    try {
      const response = await api.get('/calendar/upcoming', { 
        params: { limit } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
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
  // HOLIDAYS (Admin/HR Only)
  // =========================================================

  // Get all holidays
  getHolidays: async (year) => {
    try {
      const response = await api.get('/admin/holidays', {
        params: year ? { year } : {}
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching holidays:', error);
      throw error;
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

  // Get holidays for calendar (public)
  getHolidaysForCalendar: async (year) => {
    try {
      const response = await api.get('/admin/holidays/calendar', {
        params: year ? { year } : {}
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching holidays for calendar:', error);
      throw error;
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