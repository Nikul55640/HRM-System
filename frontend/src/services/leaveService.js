import api from './api';

const leaveService = {
  // Employee: Get leave balance
  getLeaveBalance: async () => {
    try {
      console.log('📊 [LEAVE] Fetching leave balance');
      const response = await api.get('/employee/leave/balance');
      console.log('✅ [LEAVE] Balance fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [LEAVE] Failed to fetch balance:', error);
      throw error;
    }
  },

  // Employee: Get leave history
  getMyLeaveHistory: async (params = {}) => {
    try {
      console.log('📋 [LEAVE] Fetching leave history');
      const response = await api.get('/employee/leave', { params });
      console.log('✅ [LEAVE] History fetched:', response.data?.data?.length || 0, 'records');
      return response.data;
    } catch (error) {
      console.error('❌ [LEAVE] Failed to fetch history:', error);
      throw error;
    }
  },

  // Employee: Apply for leave
  applyLeave: async (data) => {
    try {
      console.log('➕ [LEAVE] Applying for leave:', data);
      const response = await api.post('/employee/leave', data);
      console.log('✅ [LEAVE] Leave applied successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [LEAVE] Failed to apply leave:', error);
      throw error;
    }
  },

  // Employee: Cancel leave request
  cancelLeave: async (id) => {
    try {
      console.log('❌ [LEAVE] Cancelling leave:', id);
      const response = await api.delete(`/employee/leave/${id}`);
      console.log('✅ [LEAVE] Leave cancelled');
      return response.data;
    } catch (error) {
      console.error('❌ [LEAVE] Failed to cancel leave:', error);
      throw error;
    }
  },

  // Admin/HR: Get all leave requests
  getAllLeaveRequests: async (params = {}) => {
    try {
      console.log('📋 [LEAVE ADMIN] Fetching all leave requests');
      const response = await api.get('/admin/leave-requests', { params });
      console.log('✅ [LEAVE ADMIN] Requests fetched:', response.data?.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('❌ [LEAVE ADMIN] Failed to fetch requests:', error);
      throw error;
    }
  },

  // Admin/HR: Get all employees' leave balances
  getAllLeaveBalances: async () => {
    try {
      console.log('📊 [LEAVE ADMIN] Fetching all leave balances');
      const response = await api.get('/admin/leave/balances');
      console.log('✅ [LEAVE ADMIN] Balances fetched:', response.data?.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('❌ [LEAVE ADMIN] Failed to fetch balances:', error);
      throw error;
    }
  },

  // Admin/HR: Assign leave balance to employee
  assignLeaveBalance: async (employeeId, data) => {
    try {
      console.log('➕ [LEAVE ADMIN] Assigning leave balance:', { employeeId, data });
      const response = await api.post(`/admin/leave/assign/${employeeId}`, data);
      console.log('✅ [LEAVE ADMIN] Leave balance assigned');
      return response.data;
    } catch (error) {
      console.error('❌ [LEAVE ADMIN] Failed to assign leave:', error);
      throw error;
    }
  },

  // Admin/HR: Update leave balance
  updateLeaveBalance: async (employeeId, data) => {
    try {
      console.log('✏️ [LEAVE ADMIN] Updating leave balance:', { employeeId, data });
      const response = await api.put(`/admin/leave/balance/${employeeId}`, data);
      console.log('✅ [LEAVE ADMIN] Leave balance updated');
      return response.data;
    } catch (error) {
      console.error('❌ [LEAVE ADMIN] Failed to update balance:', error);
      throw error;
    }
  },

  // Admin/HR: Approve leave request
  approveLeave: async (id, data = {}) => {
    try {
      console.log('✅ [LEAVE ADMIN] Approving leave:', id);
      const response = await api.put(`/admin/leave-requests/${id}/approve`, data);
      console.log('✅ [LEAVE ADMIN] Leave approved');
      return response.data;
    } catch (error) {
      console.error('❌ [LEAVE ADMIN] Failed to approve leave:', error);
      throw error;
    }
  },

  // Admin/HR: Reject leave request
  rejectLeave: async (id, data = {}) => {
    try {
      console.log('❌ [LEAVE ADMIN] Rejecting leave:', id);
      const response = await api.put(`/admin/leave-requests/${id}/reject`, data);
      console.log('✅ [LEAVE ADMIN] Leave rejected');
      return response.data;
    } catch (error) {
      console.error('❌ [LEAVE ADMIN] Failed to reject leave:', error);
      throw error;
    }
  },

  // Admin/HR: Get leave statistics
  getLeaveStatistics: async (params = {}) => {
    try {
      console.log('📊 [LEAVE ADMIN] Fetching leave statistics');
      const response = await api.get('/admin/leave/statistics', { params });
      console.log('✅ [LEAVE ADMIN] Statistics fetched');
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },
};

export default leaveService;
