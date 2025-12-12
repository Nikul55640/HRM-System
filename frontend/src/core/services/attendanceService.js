import api from '../api/api';

const attendanceService = {
  // Employee attendance
  getEmployeeAttendance: async (employeeId, params = {}) => {
    const response = await api.get(`/attendance/employees/${employeeId}`, { params });
    return response.data;
  },

  getMyAttendance: async (params = {}) => {
    const response = await api.get('/attendance/my-attendance', { params });
    return response.data;
  },

  // Clock in/out
  clockIn: async (locationData = {}) => {
    const response = await api.post('/attendance/clock-in', locationData);
    return response.data;
  },

  clockOut: async (locationData = {}) => {
    const response = await api.post('/attendance/clock-out', locationData);
    return response.data;
  },

  getCurrentStatus: async () => {
    const response = await api.get('/attendance/current-status');
    return response.data;
  },

  // Check in/out (aliases for store compatibility)
  checkIn: async (data = {}) => {
    const response = await api.post('/attendance/check-in', data);
    return response.data;
  },

  checkOut: async (recordId, data = {}) => {
    const response = await api.put(`/attendance/records/${recordId}/check-out`, data);
    return response.data;
  },

  getCurrentAttendanceStatus: async () => {
    const response = await api.get('/attendance/current-status');
    return response.data;
  },

  // Attendance records (Admin endpoints)
  getAttendanceRecords: async (params = {}) => {
    try {
      // Try admin endpoint first (has more permissions)
      const response = await api.get('/admin/attendance', { params });
      return response.data;
    } catch (error) {
      // Fallback to employee attendance if admin fails
      if (error.response?.status === 403 || error.response?.status === 401) {
        try {
          const response = await api.get('/employee/attendance', { params });
          return response.data;
        } catch (fallbackError) {
          // If both fail, throw the original error
          throw error;
        }
      }
      throw error;
    }
  },

  getAttendanceRecord: async (recordId) => {
    const response = await api.get(`/admin/attendance/${recordId}`);
    return response.data;
  },

  updateAttendanceRecord: async (recordId, recordData) => {
    const response = await api.put(`/admin/attendance/${recordId}`, recordData);
    return response.data;
  },

  deleteAttendanceRecord: async (recordId) => {
    const response = await api.delete(`/admin/attendance/${recordId}`);
    return response.data;
  },

  // Bulk attendance operations
  bulkUpdateAttendance: async (updates) => {
    const response = await api.put('/attendance/bulk-update', { updates });
    return response.data;
  },

  importAttendance: async (attendanceData) => {
    const response = await api.post('/attendance/import', attendanceData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Attendance reports
  getAttendanceReport: async (params = {}) => {
    const response = await api.get('/attendance/reports', { params });
    return response.data;
  },

  downloadAttendanceReport: async (reportType, params = {}) => {
    const response = await api.get(`/attendance/reports/${reportType}/download`, {
      params,
      responseType: 'blob'
    });
    return response;
  },

  exportAttendanceReport: async (params = {}) => {
    try {
      const response = await api.get('/admin/attendance/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      // Fallback to employee export
      if (error.response?.status === 403 || error.response?.status === 404) {
        const response = await api.get('/employee/attendance/export', {
          params,
          responseType: 'blob'
        });
        return response.data;
      }
      throw error;
    }
  },

  getAttendanceSummary: async (params = {}) => {
    try {
      const response = await api.get('/admin/attendance/statistics', { params });
      return response.data;
    } catch (error) {
      // Fallback to employee summary
      if (error.response?.status === 403 || error.response?.status === 404) {
        const response = await api.get('/employee/attendance/summary', { params });
        return response.data;
      }
      throw error;
    }
  },

  // Team attendance (for managers)
  getTeamAttendance: async (params = {}) => {
    const response = await api.get('/attendance/team', { params });
    return response.data;
  },

  // Attendance statistics
  getAttendanceStats: async (params = {}) => {
    const response = await api.get('/attendance/stats', { params });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/attendance/dashboard-stats');
    return response.data;
  },

  // Attendance policies
  getAttendancePolicies: async () => {
    const response = await api.get('/attendance/policies');
    return response.data;
  },

  updateAttendancePolicy: async (policyId, policyData) => {
    const response = await api.put(`/attendance/policies/${policyId}`, policyData);
    return response.data;
  },

  // Overtime
  getOvertimeRecords: async (params = {}) => {
    const response = await api.get('/attendance/overtime', { params });
    return response.data;
  },

  requestOvertime: async (overtimeData) => {
    const response = await api.post('/attendance/overtime/request', overtimeData);
    return response.data;
  },

  approveOvertime: async (overtimeId, approvalData) => {
    const response = await api.put(`/attendance/overtime/${overtimeId}/approve`, approvalData);
    return response.data;
  },

  // Shift management
  getShifts: async () => {
    const response = await api.get('/attendance/shifts');
    return response.data;
  },

  assignShift: async (employeeId, shiftData) => {
    const response = await api.post(`/attendance/employees/${employeeId}/assign-shift`, shiftData);
    return response.data;
  }
};

export default attendanceService;