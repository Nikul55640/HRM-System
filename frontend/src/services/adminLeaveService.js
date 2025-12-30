import api from './api';

/**
 * Admin Leave Service
 * Focused on admin-specific leave management operations
 * Complements the main leaveService with specialized admin functions
 */

const adminLeaveService = {
  // =========================================================
  // LEAVE REQUEST MANAGEMENT
  // =========================================================

  /**
   * Get pending leave requests for approval
   * @returns {Promise} Response with pending leave requests
   */
  getPendingLeaveRequests: async () => {
    try {
      const response = await api.get('/admin/leave/leave-requests', {
        params: { status: 'pending' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pending leave requests:', error);
      throw error;
    }
  },

  /**
   * Get all leave requests with advanced filtering
   * @param {Object} params - Filter parameters
   * @returns {Promise} Response with filtered leave requests
   */
  getLeaveRequests: async (params = {}) => {
    try {
      const response = await api.get('/admin/leave/leave-requests', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw error;
    }
  },

  /**
   * Get leave request by ID with full details
   * @param {string} leaveId - Leave request ID
   * @returns {Promise} Response with leave request details
   */
  getLeaveRequestById: async (leaveId) => {
    try {
      const response = await api.get(`/admin/leave/leave-requests/${leaveId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching leave request ${leaveId}:`, error);
      throw error;
    }
  },

  /**
   * Approve leave request with comments
   * @param {string} leaveId - Leave request ID
   * @param {Object} data - Approval data (comments, etc.)
   * @returns {Promise} Response with approval result
   */
  approveLeaveRequest: async (leaveId, data = {}) => {
    try {
      const response = await api.put(`/admin/leave/leave-requests/${leaveId}/approve`, {
        comments: data.comments || '',
        approvedBy: data.approvedBy,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error(`Error approving leave request ${leaveId}:`, error);
      throw error;
    }
  },

  /**
   * Reject leave request with reason
   * @param {string} leaveId - Leave request ID
   * @param {Object} data - Rejection data (reason, comments)
   * @returns {Promise} Response with rejection result
   */
  rejectLeaveRequest: async (leaveId, data = {}) => {
    try {
      const response = await api.put(`/admin/leave/leave-requests/${leaveId}/reject`, {
        reason: data.reason || data.comments || 'No reason provided',
        rejectedBy: data.rejectedBy,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error(`Error rejecting leave request ${leaveId}:`, error);
      throw error;
    }
  },

  /**
   * Bulk approve multiple leave requests
   * @param {Array} leaveIds - Array of leave request IDs
   * @param {Object} data - Bulk approval data
   * @returns {Promise} Response with bulk approval results
   */
  bulkApproveLeaveRequests: async (leaveIds, data = {}) => {
    try {
      const response = await api.post('/admin/leave/leave-requests/bulk-approve', {
        leaveIds,
        comments: data.comments || '',
        approvedBy: data.approvedBy,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk approving leave requests:', error);
      throw error;
    }
  },

  /**
   * Bulk reject multiple leave requests
   * @param {Array} leaveIds - Array of leave request IDs
   * @param {Object} data - Bulk rejection data
   * @returns {Promise} Response with bulk rejection results
   */
  bulkRejectLeaveRequests: async (leaveIds, data = {}) => {
    try {
      const response = await api.post('/admin/leave/leave-requests/bulk-reject', {
        leaveIds,
        reason: data.reason || 'Bulk rejection',
        rejectedBy: data.rejectedBy,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk rejecting leave requests:', error);
      throw error;
    }
  },

  // =========================================================
  // LEAVE BALANCE MANAGEMENT
  // =========================================================

  /**
   * Get leave balances for all employees with filtering
   * @param {Object} params - Filter parameters
   * @returns {Promise} Response with employee leave balances
   */
  getLeaveBalances: async (params = {}) => {
    try {
      const response = await api.get('/admin/leave/balances', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching leave balances:', error);
      throw error;
    }
  },

  /**
   * Get all employees leave balances (alternative endpoint)
   * @param {Object} params - Filter parameters
   * @returns {Promise} Response with all employee leave balances
   */
  getAllEmployeesLeaveBalances: async (params = {}) => {
    try {
      const response = await api.get('/admin/leave-balances/all-employees', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all employees leave balances:', error);
      throw error;
    }
  },

  /**
   * Assign leave balance to an employee
   * @param {string} employeeId - Employee ID
   * @param {Object} data - Leave balance data
   * @returns {Promise} Response with assignment result
   */
  assignLeaveBalance: async (employeeId, data) => {
    try {
      const response = await api.post(`/admin/leave/assign/${employeeId}`, {
        leaveType: data.leaveType,
        balance: data.balance,
        year: data.year || new Date().getFullYear(),
        ...data
      });
      return response.data;
    } catch (error) {
      console.error(`Error assigning leave balance to employee ${employeeId}:`, error);
      throw error;
    }
  },

  /**
   * Update leave balance for an employee
   * @param {string} employeeId - Employee ID
   * @param {Object} data - Updated leave balance data
   * @returns {Promise} Response with update result
   */
  updateLeaveBalance: async (employeeId, data) => {
    try {
      const response = await api.put(`/admin/leave/balances/${employeeId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating leave balance for employee ${employeeId}:`, error);
      throw error;
    }
  },

  /**
   * Bulk assign leave balances to multiple employees
   * @param {Array} assignments - Array of {employeeId, leaveType, balance} objects
   * @returns {Promise} Response with bulk assignment results
   */
  bulkAssignLeaveBalances: async (assignments) => {
    try {
      const response = await api.post('/admin/leave/balances/bulk-assign', {
        assignments
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk assigning leave balances:', error);
      throw error;
    }
  },

  // =========================================================
  // LEAVE STATISTICS & ANALYTICS
  // =========================================================

  /**
   * Get comprehensive leave statistics
   * @param {Object} params - Filter parameters (dateRange, department, etc.)
   * @returns {Promise} Response with leave statistics
   */
  getLeaveStatistics: async (params = {}) => {
    try {
      const response = await api.get('/admin/leave/leave-requests/statistics', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching leave statistics:', error);
      throw error;
    }
  },

  /**
   * Get leave analytics dashboard data
   * @param {Object} params - Filter parameters
   * @returns {Promise} Response with analytics data
   */
  getLeaveAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/admin/leave/analytics', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching leave analytics:', error);
      throw error;
    }
  },

  /**
   * Get leave trends over time
   * @param {Object} params - Filter parameters (period, department, etc.)
   * @returns {Promise} Response with leave trends data
   */
  getLeaveTrends: async (params = {}) => {
    try {
      const response = await api.get('/admin/leave/trends', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching leave trends:', error);
      throw error;
    }
  },

  // =========================================================
  // LEAVE POLICY MANAGEMENT
  // =========================================================

  /**
   * Get leave policies
   * @returns {Promise} Response with leave policies
   */
  getLeavePolicies: async () => {
    try {
      const response = await api.get('/admin/leave/policies');
      return response.data;
    } catch (error) {
      console.error('Error fetching leave policies:', error);
      throw error;
    }
  },

  /**
   * Create new leave policy
   * @param {Object} policyData - Leave policy data
   * @returns {Promise} Response with created policy
   */
  createLeavePolicy: async (policyData) => {
    try {
      const response = await api.post('/admin/leave/policies', policyData);
      return response.data;
    } catch (error) {
      console.error('Error creating leave policy:', error);
      throw error;
    }
  },

  /**
   * Update leave policy
   * @param {string} policyId - Policy ID
   * @param {Object} policyData - Updated policy data
   * @returns {Promise} Response with updated policy
   */
  updateLeavePolicy: async (policyId, policyData) => {
    try {
      const response = await api.put(`/admin/leave/policies/${policyId}`, policyData);
      return response.data;
    } catch (error) {
      console.error(`Error updating leave policy ${policyId}:`, error);
      throw error;
    }
  },

  /**
   * Delete leave policy
   * @param {string} policyId - Policy ID
   * @returns {Promise} Response with deletion result
   */
  deleteLeavePolicy: async (policyId) => {
    try {
      const response = await api.delete(`/admin/leave/policies/${policyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting leave policy ${policyId}:`, error);
      throw error;
    }
  },

  // =========================================================
  // LEAVE REPORTS & EXPORTS
  // =========================================================

  /**
   * Generate leave report
   * @param {Object} params - Report parameters
   * @returns {Promise} Response with report data
   */
  generateLeaveReport: async (params = {}) => {
    try {
      const response = await api.get('/admin/leave/reports/generate', { params });
      return response.data;
    } catch (error) {
      console.error('Error generating leave report:', error);
      throw error;
    }
  },

  /**
   * Export leave data to Excel
   * @param {Object} params - Export parameters
   * @returns {Promise} Response with Excel file
   */
  exportLeaveData: async (params = {}) => {
    try {
      const response = await api.get('/admin/leave/export/excel', {
        params,
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Error exporting leave data:', error);
      throw error;
    }
  },

  /**
   * Export leave report to PDF
   * @param {Object} params - Export parameters
   * @returns {Promise} Response with PDF file
   */
  exportLeaveReportPDF: async (params = {}) => {
    try {
      const response = await api.get('/admin/leave/export/pdf', {
        params,
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Error exporting leave report to PDF:', error);
      throw error;
    }
  }
};

export default adminLeaveService;