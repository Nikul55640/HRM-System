import api from '../../../core/api/api';

/**
 * Manager Service
 * Handles all API calls for manager-specific features
 */

const managerService = {
  // Direct methods for backward compatibility
  getPendingApprovals: async (params = {}) => {
    try {
      const response = await api.get('/manager/approvals', { params });
      return response.data;
    } catch (error) {
      // Log the error for debugging
      
      
      // Re-throw the error so the component can handle it properly
      throw error;
    }
  },

  approveLeave: async (id, data = {}) => {
    const response = await api.put(`/manager/leave-requests/${id}/approve`, data);
    return response.data;
  },

  rejectLeave: async (id, data) => {
    const response = await api.put(`/manager/leave-requests/${id}/reject`, data);
    return response.data;
  },

  // Team Management
  team: {
    // Get team members under this manager
    getTeamMembers: async (params = {}) => {
      const response = await api.get('/manager/team', { params });
      return response.data;
    },

    // Get team member details
    getTeamMember: async (employeeId) => {
      const response = await api.get(`/manager/team/${employeeId}`);
      return response.data;
    },

    // Get team statistics
    getTeamStats: async () => {
      const response = await api.get('/manager/team/stats');
      return response.data;
    },

    // Get team attendance summary
    getTeamAttendance: async (params = {}) => {
      const response = await api.get('/manager/team/attendance', { params });
      return response.data;
    },

    // Get team performance metrics
    getTeamPerformance: async (params = {}) => {
      const response = await api.get('/manager/team/performance', { params });
      return response.data;
    },
  },

  // Approvals Management
  approvals: {
    // Get pending approvals for manager
    getPendingApprovals: async (params = {}) => {
      const response = await api.get('/manager/approvals/pending', { params });
      return response.data;
    },

    // Get all approvals (pending, approved, rejected)
    getAllApprovals: async (params = {}) => {
      const response = await api.get('/manager/approvals', { params });
      return response.data;
    },

    // Approve a request
    approveRequest: async (requestId, data = {}) => {
      const response = await api.put(`/manager/approvals/${requestId}/approve`, data);
      return response.data;
    },

    // Reject a request
    rejectRequest: async (requestId, data) => {
      const response = await api.put(`/manager/approvals/${requestId}/reject`, data);
      return response.data;
    },

    // Get approval details
    getApprovalDetails: async (requestId) => {
      const response = await api.get(`/manager/approvals/${requestId}`);
      return response.data;
    },

    // Bulk approve requests
    bulkApprove: async (requestIds, comments = '') => {
      const response = await api.put('/manager/approvals/bulk-approve', {
        requestIds,
        comments
      });
      return response.data;
    },

    // Bulk reject requests
    bulkReject: async (requestIds, comments) => {
      const response = await api.put('/manager/approvals/bulk-reject', {
        requestIds,
        comments
      });
      return response.data;
    },
  },

  // Leave Management
  leave: {
    // Get team leave requests
    getTeamLeaveRequests: async (params = {}) => {
      const response = await api.get('/manager/leave-requests', { params });
      return response.data;
    },

    // Approve leave request
    approveLeaveRequest: async (requestId, data = {}) => {
      const response = await api.put(`/manager/leave-requests/${requestId}/approve`, data);
      return response.data;
    },

    // Reject leave request
    rejectLeaveRequest: async (requestId, data) => {
      const response = await api.put(`/manager/leave-requests/${requestId}/reject`, data);
      return response.data;
    },

    // Get team leave calendar
    getTeamLeaveCalendar: async (month, year) => {
      const response = await api.get('/manager/leave-calendar', {
        params: { month, year }
      });
      return response.data;
    },

    // Get team leave balance summary
    getTeamLeaveBalance: async () => {
      const response = await api.get('/manager/team/leave-balance');
      return response.data;
    },
  },

  // Attendance Management
  attendance: {
    // Get team attendance records
    getTeamAttendanceRecords: async (params = {}) => {
      const response = await api.get('/manager/attendance', { params });
      return response.data;
    },

    // Get attendance summary for team
    getAttendanceSummary: async (params = {}) => {
      const response = await api.get('/manager/attendance/summary', { params });
      return response.data;
    },

    // Approve attendance correction
    approveAttendanceCorrection: async (correctionId, data = {}) => {
      const response = await api.put(`/manager/attendance/corrections/${correctionId}/approve`, data);
      return response.data;
    },

    // Reject attendance correction
    rejectAttendanceCorrection: async (correctionId, data) => {
      const response = await api.put(`/manager/attendance/corrections/${correctionId}/reject`, data);
      return response.data;
    },

    // Get attendance corrections pending approval
    getPendingCorrections: async (params = {}) => {
      const response = await api.get('/manager/attendance/corrections/pending', { params });
      return response.data;
    },

    // Export team attendance report
    exportAttendanceReport: async (params = {}) => {
      const response = await api.get('/manager/attendance/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    },
  },

  // Reports and Analytics
  reports: {
    // Get manager dashboard data
    getDashboardData: async () => {
      const response = await api.get('/manager/dashboard');
      return response.data;
    },

    // Get team productivity report
    getProductivityReport: async (params = {}) => {
      const response = await api.get('/manager/reports/productivity', { params });
      return response.data;
    },

    // Get team attendance report
    getAttendanceReport: async (params = {}) => {
      const response = await api.get('/manager/reports/attendance', { params });
      return response.data;
    },

    // Get team leave report
    getLeaveReport: async (params = {}) => {
      const response = await api.get('/manager/reports/leave', { params });
      return response.data;
    },

    // Get team performance metrics
    getPerformanceMetrics: async (params = {}) => {
      const response = await api.get('/manager/reports/performance', { params });
      return response.data;
    },

    // Export comprehensive team report
    exportTeamReport: async (reportType, params = {}) => {
      const response = await api.get(`/manager/reports/${reportType}/export`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    },
  },

  // Employee Management (for direct reports)
  employees: {
    // Get employee profile (for direct reports)
    getEmployeeProfile: async (employeeId) => {
      const response = await api.get(`/manager/employees/${employeeId}/profile`);
      return response.data;
    },

    // Update employee information (limited fields)
    updateEmployee: async (employeeId, data) => {
      const response = await api.put(`/manager/employees/${employeeId}`, data);
      return response.data;
    },

    // Get employee performance history
    getEmployeePerformance: async (employeeId, params = {}) => {
      const response = await api.get(`/manager/employees/${employeeId}/performance`, { params });
      return response.data;
    },

    // Add performance review
    addPerformanceReview: async (employeeId, reviewData) => {
      const response = await api.post(`/manager/employees/${employeeId}/performance`, reviewData);
      return response.data;
    },

    // Get employee attendance details
    getEmployeeAttendance: async (employeeId, params = {}) => {
      const response = await api.get(`/manager/employees/${employeeId}/attendance`, { params });
      return response.data;
    },

    // Get employee leave history
    getEmployeeLeaveHistory: async (employeeId, params = {}) => {
      const response = await api.get(`/manager/employees/${employeeId}/leave-history`, { params });
      return response.data;
    },
  },

  // Notifications and Communications
  notifications: {
    // Get manager notifications
    getNotifications: async (params = {}) => {
      const response = await api.get('/manager/notifications', { params });
      return response.data;
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
      const response = await api.put(`/manager/notifications/${notificationId}/read`);
      return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
      const response = await api.put('/manager/notifications/read-all');
      return response.data;
    },

    // Send announcement to team
    sendTeamAnnouncement: async (announcementData) => {
      const response = await api.post('/manager/announcements', announcementData);
      return response.data;
    },
  },

  // Requests Management
  requests: {
    // Get all requests requiring manager approval
    getAllRequests: async (params = {}) => {
      const response = await api.get('/manager/requests', { params });
      return response.data;
    },

    // Get specific request details
    getRequestDetails: async (requestId) => {
      const response = await api.get(`/manager/requests/${requestId}`);
      return response.data;
    },

    // Process request (approve/reject)
    processRequest: async (requestId, action, data = {}) => {
      const response = await api.put(`/manager/requests/${requestId}/${action}`, data);
      return response.data;
    },

    // Get request statistics
    getRequestStats: async () => {
      const response = await api.get('/manager/requests/stats');
      return response.data;
    },
  },

  // Settings and Preferences
  settings: {
    // Get manager preferences
    getPreferences: async () => {
      const response = await api.get('/manager/preferences');
      return response.data;
    },

    // Update manager preferences
    updatePreferences: async (preferences) => {
      const response = await api.put('/manager/preferences', preferences);
      return response.data;
    },

    // Get notification settings
    getNotificationSettings: async () => {
      const response = await api.get('/manager/notification-settings');
      return response.data;
    },

    // Update notification settings
    updateNotificationSettings: async (settings) => {
      const response = await api.put('/manager/notification-settings', settings);
      return response.data;
    },
  },
};

export default managerService;