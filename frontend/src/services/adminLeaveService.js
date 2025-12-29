import api from '../../../core/services/api';

const adminLeaveService = {
  // Get pending leave requests for approval
  getPendingLeaveRequests: async () => {
    try {
      const response = await api.get('/admin/leave/leave-requests', {
        params: { status: 'pending' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all leave requests with filters
  getLeaveRequests: async (params = {}) => {
    try {
      const response = await api.get('/admin/leave/leave-requests', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Approve leave request
  approveLeaveRequest: async (leaveId, data) => {
    try {
      const response = await api.put(`/admin/leave/leave-requests/${leaveId}/approve`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reject leave request
  rejectLeaveRequest: async (leaveId, data) => {
    try {
      const response = await api.put(`/admin/leave/leave-requests/${leaveId}/reject`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get leave request by ID
  getLeaveRequestById: async (leaveId) => {
    try {
      const response = await api.get(`/admin/leave/leave-requests/${leaveId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get leave balances for all employees
  getLeaveBalances: async (params = {}) => {
    try {
      const response = await api.get('/admin/leave/balances', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all employees leave balances
  getAllEmployeesLeaveBalances: async (params = {}) => {
    try {
      const response = await api.get('/admin/leave-balances/all-employees', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Assign leave balance for an employee
  assignLeaveBalance: async (employeeId, data) => {
    try {
      const response = await api.post(`/admin/leave/assign/${employeeId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get leave statistics
  getLeaveStatistics: async (params = {}) => {
    try {
      const response = await api.get('/admin/leave/leave-requests/statistics', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default adminLeaveService;