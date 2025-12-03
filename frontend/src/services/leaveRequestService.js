import api from './api';
import { toast } from 'react-toastify';

const leaveRequestService = {
  // Create a new leave request
  createLeaveRequest: async (requestData) => {
    try {
      console.log('📝 [LEAVE] Creating leave request:', requestData);
      const response = await api.post('/employee/leave-requests', requestData);
      console.log('✅ [LEAVE] Request created:', response.data);
      toast.success('Leave request submitted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [LEAVE] Failed to create request:', error);
      toast.error(error.message || 'Failed to submit leave request');
      throw error;
    }
  },

  // Get all leave requests for the current employee
  getLeaveRequests: async (params = {}) => {
    try {
      console.log('📋 [LEAVE] Fetching leave requests:', params);
      const response = await api.get('/employee/leave-requests', { params });
      console.log('✅ [LEAVE] Requests fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [LEAVE] Failed to fetch requests:', error);
      toast.error(error.message || 'Failed to load leave requests');
      throw error;
    }
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
    try {
      const params = year ? { year } : {};
      console.log('💰 [LEAVE] Fetching leave balance:', params);
      const response = await api.get('/employee/leave-balance', { params });
      console.log('✅ [LEAVE] Balance fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [LEAVE] Failed to fetch balance:', error);
      toast.error(error.message || 'Failed to load leave balance');
      throw error;
    }
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

  // Admin: Get all leave requests
  getAllLeaveRequests: async (params = {}) => {
    const response = await api.get('/admin/leave/leave-requests', { params });
    return response.data;
  },

  // Admin: Approve leave request
  approve: async (id, data) => {
    const response = await api.put(`/admin/leave/leave-requests/${id}/approve`, data);
    return response.data;
  },

  // Admin: Reject leave request
  reject: async (id, data) => {
    const response = await api.put(`/admin/leave/leave-requests/${id}/reject`, data);
    return response.data;
  },
};

export default leaveRequestService;