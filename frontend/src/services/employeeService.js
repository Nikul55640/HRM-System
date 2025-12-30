// Employee Dashboard Service - for individual employee operations
import api from './api';

const employeeService = {
  // Get employee dashboard data
  getDashboard: async () => {
    try {
      const response = await api.get('/employee/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching employee dashboard:', error);
      throw error;
    }
  },

  // Clock in/out
  clockInOut: async (data) => {
    try {
      const response = await api.post('/employee/clock-in-out', data);
      return response.data;
    } catch (error) {
      console.error('Error clocking in/out:', error);
      throw error;
    }
  },

  // Get recent activities
  getRecentActivities: async (limit = 5) => {
    try {
      const response = await api.get(`/employee/activities?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },

  // Get team announcements
  getTeamAnnouncements: async () => {
    try {
      const response = await api.get('/employee/announcements');
      return response.data;
    } catch (error) {
      console.error('Error fetching team announcements:', error);
      throw error;
    }
  },

  // Get upcoming time off
  getUpcomingTimeOff: async () => {
    try {
      const response = await api.get('/employee/leave/upcoming');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming time off:', error);
      throw error;
    }
  },
};

export default employeeService;
