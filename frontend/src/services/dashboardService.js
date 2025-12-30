import api from './api';
import { toast } from 'react-toastify';

const dashboardService = {
  // Get complete dashboard data (profile, leave, attendance, activity)
  getDashboardData: async (options = {}) => {
    try {
      const params = {
        attendanceLimit: options.attendanceLimit || 10,
        activityLimit: options.activityLimit || 20,
      };
      console.log('📊 [DASHBOARD] Fetching dashboard data:', params);
      const response = await api.get('dashboard', { params });
      console.log('✅ [DASHBOARD] Dashboard data fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [DASHBOARD] Failed to fetch dashboard:', error);
      toast.error(error.message || 'Failed to load dashboard');
      throw error;
    }
  },

  // Get employee profile summary
  getProfileSummary: async () => {
    try {
      console.log('👤 [DASHBOARD] Fetching profile summary');
      const response = await api.get('/dashboard/profile');
      console.log('✅ [DASHBOARD] Profile summary fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [DASHBOARD] Failed to fetch profile:', error);
      toast.error(error.message || 'Failed to load profile');
      throw error;
    }
  },

  // Get leave balance
  getLeaveBalance: async () => {
    try {
      console.log('💰 [DASHBOARD] Fetching leave balance');
      const response = await api.get('/dashboard/leave');
      console.log('✅ [DASHBOARD] Leave balance fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [DASHBOARD] Failed to fetch leave balance:', error);
      toast.error(error.message || 'Failed to load leave balance');
      throw error;
    }
  },

  // Get attendance records
  getAttendanceRecords: async (options = {}) => {
    try {
      const params = {
        limit: options.limit || 10,
        startDate: options.startDate,
        endDate: options.endDate,
      };
      console.log('📅 [DASHBOARD] Fetching attendance records:', params);
      const response = await api.get('/dashboard/attendance', { params });
      console.log('✅ [DASHBOARD] Attendance records fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [DASHBOARD] Failed to fetch attendance:', error);
      toast.error(error.message || 'Failed to load attendance');
      throw error;
    }
  },

  // Get recent activity feed from audit logs
  getRecentActivity: async (options = {}) => {
    try {
      const params = {
        limit: options.limit || 20,
        skip: options.skip || 0,
      };
      console.log('📋 [DASHBOARD] Fetching recent activity:', params);
      const response = await api.get('/dashboard/activity', { params });
      console.log('✅ [DASHBOARD] Activity fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [DASHBOARD] Failed to fetch activity:', error);
      toast.error(error.message || 'Failed to load activity');
      throw error;
    }
  },
};

export default dashboardService;