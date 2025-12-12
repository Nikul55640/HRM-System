import api from "../../../core/api/api";
import { toast } from "react-toastify";

const leaveService = {
  /* ----------------------------------------------
   * EMPLOYEE LEAVE REQUESTS
   * ---------------------------------------------- */

  // Apply for leave
  applyLeave: async (leaveData) => {
    try {
      const response = await api.post("/employee/leave-requests", leaveData);
      toast.success("Leave request submitted");
      return response.data;
    } catch (error) {
      toast.error(error.message || "Failed to apply leave");
      throw error;
    }
  },

  // Get employee leave requests
  getLeaveRequests: async (params = {}) => {
    try {
      const response = await api.get("/employee/leave-requests", { params });
      return response.data;
    } catch (error) {
      toast.error("Failed to load leave requests");
      throw error;
    }
  },

  // Get specific leave request
  getLeaveRequest: async (id) => {
    const response = await api.get(`/employee/leave-requests/${id}`);
    return response.data;
  },

  // Cancel a leave request
  cancelLeaveRequest: async (id) => {
    const response = await api.delete(`/employee/leave-requests/${id}`);
    return response.data;
  },

  /* ----------------------------------------------
   * EMPLOYEE BALANCE & HISTORY
   * ---------------------------------------------- */

  getLeaveBalance: async (year) => {
    const params = year ? { year } : {};
    const response = await api.get("/employee/leave-balance", { params });
    return response.data;
  },

  getLeaveHistory: async (year) => {
    const params = year ? { year } : {};
    const response = await api.get("/employee/leave-history", { params });
    return response.data;
  },

  /* ----------------------------------------------
   * ADMIN / HR – LEAVE MANAGEMENT
   * ---------------------------------------------- */

  // Get all leave requests (HR/Admin)
  getAllLeaveRequests: async (params = {}) => {
    const response = await api.get("/admin/leave/leave-requests", { params });
    return response.data;
  },

  approveLeave: async (id, data) => {
    const response = await api.put(
      `/admin/leave/leave-requests/${id}/approve`,
      data
    );
    return response.data;
  },

  rejectLeave: async (id, data) => {
    const response = await api.put(
      `/admin/leave/leave-requests/${id}/reject`,
      data
    );
    return response.data;
  },

  // HR/Admin – leave balance
  getAllLeaveBalances: async () => {
    const response = await api.get("/admin/leave/balances");
    return response.data;
  },

  assignLeaveBalance: async (employeeId, balanceData) => {
    const response = await api.post(
      `/admin/leave/assign/${employeeId}`,
      balanceData
    );
    return response.data;
  },

  /* ----------------------------------------------
   * EXPORTS
   * ---------------------------------------------- */

  exportLeaveSummary: async (format = "pdf", year) => {
    const params = { format };
    if (year) params.year = year;

    const response = await api.get("/employee/leave-balance/export", {
      params,
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `leave-summary-${year || new Date().getFullYear()}.${format}`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  },
};

export default leaveService;
