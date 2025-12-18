import api from "../api/api";

/**
 * HRM Leave Service
 * Supports: Admin, Manager, Employee
 */

const leaveService = {
  // =========================================================
  // EMPLOYEE SELF SERVICE (User Panel)
  // =========================================================

  // Get logged-in employee leave balance
  getMyLeaveBalance: async () => {
    const response = await api.get("/employee/leave-balance");
    return response.data;
  },

  // Get logged-in employee leave history
  getMyLeaveHistory: async (params = {}) => {
    const response = await api.get("/employee/leave-requests", { params });
    return response.data;
  },

  // Create leave request (Employee)
  createLeaveRequest: async (requestData) => {
    const response = await api.post("/employee/leave-requests", requestData);
    return response.data;
  },

  // Cancel leave request (Employee)
  cancelLeaveRequest: async (requestId) => {
    const response = await api.put(
      `/employee/leave-requests/${requestId}/cancel`
    );
    return response.data;
  },

  // =========================================================
  // ADMIN + HR ROUTES
  // =========================================================

  // Get all leave requests (Admin / HR)
  getLeaveRequests: async (params = {}) => {
    const response = await api.get("/admin/leave/leave-requests", { params });
    return response.data;
  },

  // Get specific leave request (Admin)
  getLeaveRequest: async (requestId) => {
    const response = await api.get(`/admin/leave/leave-requests/${requestId}`);
    return response.data;
  },

  // Approve leave request (Admin)
  approveLeaveRequest: async (requestId, approvalData = {}) => {
    const response = await api.put(
      `/admin/leave/leave-requests/${requestId}/approve`,
      approvalData
    );
    return response.data;
  },

  // Reject leave request (Admin)
  rejectLeaveRequest: async (requestId, rejectionData) => {
    const response = await api.put(
      `/admin/leave/leave-requests/${requestId}/reject`,
      { reason: rejectionData.comments || rejectionData.reason }
    );
    return response.data;
  },

  // =========================================================
  // LEAVE BALANCES (Admin)
  // =========================================================

  // Get all employee leave balances
  getAllLeaveBalances: async () => {
    const response = await api.get("/admin/leave/balances");
    return response.data;
  },

  // Assign leave balance to employee
  assignLeaveBalance: async (employeeId, data) => {
    const response = await api.post(`/admin/leave/assign/${employeeId}`, data);
    return response.data;
  },

  // =========================================================
  // LEAVE STATISTICS (Admin)
  // =========================================================

  getLeaveStatistics: async () => {
    const response = await api.get("/admin/leave/leave-requests/statistics");
    return response.data;
  },

  // =========================================================
  // LEAVE TYPES (Admin)
  // =========================================================

  getLeaveTypes: async () => {
    const response = await api.get("/config/leave/types");
    return response.data;
  },

  createLeaveType: async (typeData) => {
    const response = await api.post("/config/leave/types", typeData);
    return response.data;
  },

  updateLeaveType: async (typeId, typeData) => {
    const response = await api.put(`/config/leave/types/${typeId}`, typeData);
    return response.data;
  },

  deleteLeaveType: async (typeId) => {
    const response = await api.delete(`/config/leave/types/${typeId}`);
    return response.data;
  },

  // =========================================================
  // LEAVE CALENDAR
  // =========================================================

  getLeaveCalendar: async (params = {}) => {
    const response = await api.get("/calendar/leave", { params });
    return response.data;
  },

  // =========================================================
  // LEAVE REPORTS (Admin)
  // =========================================================

  getLeaveReport: async (params = {}) => {
    const response = await api.get("/admin/leave/reports", { params });
    return response.data;
  },

  downloadLeaveReport: async (reportType, params = {}) => {
    const response = await api.get(
      `/admin/leave/reports/${reportType}/download`,
      {
        params,
        responseType: "blob",
      }
    );
    return response;
  },
};

export default leaveService;
