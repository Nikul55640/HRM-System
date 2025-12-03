import api from './api';
import { toast } from 'react-toastify';

const calendarService = {
  getEvents: async (params) => {
    try {
      console.log('📅 [CALENDAR] Fetching events:', params);
      const response = await api.get('/calendar/events', { params });
      console.log('✅ [CALENDAR] Events fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [CALENDAR] Failed to fetch events:', error);
      toast.error(error.message || 'Failed to load events');
      throw error;
    }
  },

  getEventsByDateRange: async (startDate, endDate) => {
    try {
      console.log('📅 [CALENDAR] Fetching events by date range:', { startDate, endDate });
      const response = await api.get('/calendar/events', { params: { startDate, endDate } });
      console.log('✅ [CALENDAR] Events fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [CALENDAR] Failed to fetch events:', error);
      toast.error(error.message || 'Failed to load events');
      throw error;
    }
  },

  getEventById: async (id) => {
    try {
      console.log('📅 [CALENDAR] Fetching event:', id);
      const response = await api.get(`/calendar/events/${id}`);
      console.log('✅ [CALENDAR] Event fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [CALENDAR] Failed to fetch event:', error);
      toast.error(error.message || 'Failed to load event');
      throw error;
    }
  },

  createEvent: async (eventData) => {
    try {
      console.log('➕ [CALENDAR] Creating event:', eventData);
      const response = await api.post('/calendar/events', eventData);
      console.log('✅ [CALENDAR] Event created:', response.data);
      toast.success('Event created successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [CALENDAR] Failed to create event:', error);
      toast.error(error.message || 'Failed to create event');
      throw error;
    }
  },

  updateEvent: async (id, eventData) => {
    try {
      console.log('✏️ [CALENDAR] Updating event:', id, eventData);
      const response = await api.put(`/calendar/events/${id}`, eventData);
      console.log('✅ [CALENDAR] Event updated:', response.data);
      toast.success('Event updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [CALENDAR] Failed to update event:', error);
      toast.error(error.message || 'Failed to update event');
      throw error;
    }
  },

  deleteEvent: async (id) => {
    try {
      console.log('🗑️ [CALENDAR] Deleting event:', id);
      const response = await api.delete(`/calendar/events/${id}`);
      console.log('✅ [CALENDAR] Event deleted:', response.data);
      toast.success('Event deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [CALENDAR] Failed to delete event:', error);
      toast.error(error.message || 'Failed to delete event');
      throw error;
    }
  },

  syncCalendar: async () => {
    try {
      console.log('🔄 [CALENDAR] Syncing calendar');
      const response = await api.post('/calendar/sync');
      console.log('✅ [CALENDAR] Calendar synced:', response.data);
      toast.success('Calendar synced successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [CALENDAR] Sync failed:', error);
      toast.error(error.message || 'Failed to sync calendar');
      throw error;
    }
  },

  getEmployeeCalendar: async (params) => {
    try {
      console.log('📅 [CALENDAR] Fetching employee calendar:', params);
      const response = await api.get('/employee/calendar', { params });
      console.log('✅ [CALENDAR] Employee calendar fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [CALENDAR] Failed to fetch calendar:', error);
      toast.error(error.message || 'Failed to load calendar');
      throw error;
    }
  },

  getHolidays: async (year) => {
    try {
      console.log('🎉 [CALENDAR] Fetching holidays:', year);
      const response = await api.get('/calendar/holidays', { params: { year } });
      console.log('✅ [CALENDAR] Holidays fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [CALENDAR] Failed to fetch holidays:', error);
      toast.error(error.message || 'Failed to load holidays');
      throw error;
    }
  },

  getBirthdays: async (month) => {
    try {
      console.log('🎂 [CALENDAR] Fetching birthdays:', month);
      const response = await api.get('/calendar/birthdays', { params: { month } });
      console.log('✅ [CALENDAR] Birthdays fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [CALENDAR] Failed to fetch birthdays:', error);
      toast.error(error.message || 'Failed to load birthdays');
      throw error;
    }
  },

  getAnniversaries: async (month) => {
    try {
      console.log('🎊 [CALENDAR] Fetching anniversaries:', month);
      const response = await api.get('/calendar/anniversaries', { params: { month } });
      console.log('✅ [CALENDAR] Anniversaries fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [CALENDAR] Failed to fetch anniversaries:', error);
      toast.error(error.message || 'Failed to load anniversaries');
      throw error;
    }
  },

  getUpcomingEvents: async (days = 7) => {
    try {
      console.log('📅 [CALENDAR] Fetching upcoming events:', days);
      const response = await api.get('/calendar/upcoming', { params: { days } });
      console.log('✅ [CALENDAR] Upcoming events fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [CALENDAR] Failed to fetch upcoming events:', error);
      toast.error(error.message || 'Failed to load upcoming events');
      throw error;
    }
  },
};

export default calendarService;
