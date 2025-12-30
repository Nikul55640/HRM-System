import api from './api';
import { toast } from 'react-toastify';

const calendarViewService = {
  /**
   * Get monthly calendar data with events, leaves, holidays, birthdays, etc.
   */
  getMonthlyCalendarData: async (params) => {
    try {
      console.log('📅 [CALENDAR VIEW] Fetching monthly data:', params);
      const response = await api.get('/calendar/view/monthly', { params });
      console.log('✅ [CALENDAR VIEW] Monthly data fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [CALENDAR VIEW] Failed to fetch monthly data:', error);
      toast.error(error.response?.data?.message || 'Failed to load calendar data');
      throw error;
    }
  },

  /**
   * Get daily calendar data for a specific date
   */
  getDailyCalendarData: async (params) => {
    try {
      console.log('📅 [CALENDAR VIEW] Fetching daily data:', params);
      const response = await api.get('/calendar/view/daily', { params });
      console.log('✅ [CALENDAR VIEW] Daily data fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [CALENDAR VIEW] Failed to fetch daily data:', error);
      toast.error(error.response?.data?.message || 'Failed to load daily calendar data');
      throw error;
    }
  },

  /**
   * Apply for leave directly from calendar
   */
  applyLeaveFromCalendar: async (leaveData) => {
    try {
      console.log('📝 [CALENDAR VIEW] Applying for leave:', leaveData);
      const response = await api.post('/calendar/view/apply-leave', leaveData);
      console.log('✅ [CALENDAR VIEW] Leave applied:', response.data);
      toast.success('Leave application submitted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [CALENDAR VIEW] Failed to apply for leave:', error);
      toast.error(error.response?.data?.message || 'Failed to submit leave application');
      throw error;
    }
  },

  /**
   * Export calendar data
   */
  exportCalendarData: async (params) => {
    try {
      console.log('📊 [CALENDAR VIEW] Exporting calendar data:', params);
      const response = await api.get('/calendar/export', { 
        params,
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `calendar-${params.year}-${params.month}.${params.format || 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Calendar data exported successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [CALENDAR VIEW] Failed to export calendar data:', error);
      toast.error(error.response?.data?.message || 'Failed to export calendar data');
      throw error;
    }
  }
};

export default calendarViewService;