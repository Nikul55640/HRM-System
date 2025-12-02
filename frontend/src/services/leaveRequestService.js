import api from './api';

const leaveRequestService = {
  // Create a new leave request
  createLeaveRequest: async (requestData) => {
    const response = await api.post('/employee/leave-requests', requestData);
    return response.data;
  },

  // Get all leave requests for the current employee
  getLeaveRequests: async (params = {}) => {
    const response = await api.get('/employee/leave-requests', { params });
    return response.data;
  },

  // Get a specific leave request by ID
  getLeaveRequest: async (id) => {
    const response = await api.get(`/employee/leave-requests/${id}`);
    return response.data;
  },

  // Cancel a leave request
  cancelLeaveRequest: async (id) => {
    const response = await api.delete(`/employee/leave-requests/${id}`);
    return response.data;
  },

  // Get leave balance
  getLeaveBalance: async (year) => {
    const params = year ? { year } : {};
    const response = await api.get('/employee/leave-balance', { params });
    return response.data;
  },

  // Get leave history
  getLeaveHistory: async (year) => {
    const params = year ? { year } : {};
    const response = await api.get('/employee/leave-history', { params });
    return response.data;
  },

  // Export leave summary
  exportLeaveSummary: async (format = 'pdf', year) => {
    const params = { format };
    if (year) params.year = year;
    
    const response = await api.get('/employee/leave-balance/export', {
      params,
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leave-summary-${year || new Date().getFullYear()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  },
};

export default leaveRequestService;