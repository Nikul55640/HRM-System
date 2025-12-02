import api from './api';

const dashboardService = {
  // Get complete dashboard data (profile, leave, attendance, activity)
  getDashboardData: async (options = {}) => {
    const params = {
      attendanceLimit: options.attendanceLimit || 10,
      activityLimit: options.activityLimit || 20,
    };
    const response = await api.get('dashboard', { params });
    return response.data;
  },

  // Get employee profile summary
  getProfileSummary: async () => {
    const response = await api.get('/dashboard/profile');
    return response.data;
  },

  // Get leave balance (placeholder until Leave module is implemented)
  getLeaveBalance: async () => {
    const response = await api.get('/dashboard/leave');
    return response.data;
  },

  // Get attendance records (placeholder until Attendance module is implemented)
  getAttendanceRecords: async (options = {}) => {
    const params = {
      limit: options.limit || 10,
      startDate: options.startDate,
      endDate: options.endDate,
    };
    const response = await api.get('/dashboard/attendance', { params });
    return response.data;
  },

  // Get recent activity feed from audit logs
  getRecentActivity: async (options = {}) => {
    const params = {
      limit: options.limit || 20,
      skip: options.skip || 0,
    };
    const response = await api.get('/dashboard/activity', { params });
    return response.data;
  },
};

export default dashboardService;
