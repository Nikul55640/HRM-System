import api from '../../../services/api';

const leaveService = {
  // Get employee's leave balance
  getLeaveBalance: async () => {
    const response = await api.get('/employee/leave-balance');
    return response.data;
  },

  // Get employee's leave history
  getMyLeaveHistory: async () => {
    const response = await api.get('/employee/leave-history');
    return response.data;
  },

  // Apply for leave
  applyLeave: async (leaveData) => {
    const response = await api.post('/employee/leave-requests', leaveData);
    return response.data;
  },

  // Get all leave requests (Admin/HR)
  getAllLeaveRequests: async () => {
    const response = await api.get('/admin/leave-requests');
    return response.data;
  },

  // Approve leave request (Admin/HR)
  approveLeave: async (id) => {
    const response = await api.patch(`/admin/leave-requests/${id}/approve`);
    return response.data;
  },

  // Reject leave request (Admin/HR)
  rejectLeave: async (id, data) => {
    const response = await api.patch(`/admin/leave-requests/${id}/reject`, data);
    return response.data;
  },

  // Get all leave balances (Admin/HR)
  getAllLeaveBalances: async () => {
    const response = await api.get('/admin/leave/balances');
    return response.data;
  },

  // Assign leave balance (Admin/HR)
  assignLeaveBalance: async (employeeId, balanceData) => {
    const response = await api.post(`/admin/leave/assign/${employeeId}`, balanceData);
    return response.data;
  },
};

export default leaveService;
