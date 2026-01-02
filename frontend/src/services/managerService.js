import api from './api';
import { toast } from 'react-toastify';

const managerService = {
  // ============================================
  // TEAM MANAGEMENT
  // ============================================
  getTeamMembers: async () => {
    try {
      console.log('👥 [MANAGER] Fetching team members');
      const response = await api.get('/manager/team');
      console.log('✅ [MANAGER] Team members fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [MANAGER] Failed to fetch team:', error);
      toast.error(error.message || 'Failed to load team members');
      throw error;
    }
  },

  getTeamMemberById: async (id) => {
    try {
      console.log('👤 [MANAGER] Fetching team member:', id);
      const response = await api.get(`/manager/team/${id}`);
      console.log('✅ [MANAGER] Team member fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [MANAGER] Failed to fetch team member:', error);
      toast.error(error.message || 'Failed to load team member');
      throw error;
    }
  },

  getTeamStatistics: async () => {
    try {
      console.log('📊 [MANAGER] Fetching team statistics');
      const response = await api.get('/manager/team/statistics');
      console.log('✅ [MANAGER] Statistics fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [MANAGER] Failed to fetch statistics:', error);
      toast.error(error.message || 'Failed to load statistics');
      throw error;
    }
  },

  // ============================================
  // APPROVALS
  // ============================================
  getPendingApprovals: async () => {
    try {
      console.log('📋 [MANAGER] Fetching pending approvals');
      const response = await api.get('/manager/approvals');
      console.log('✅ [MANAGER] Approvals fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [MANAGER] Failed to fetch approvals:', error);
      toast.error(error.message || 'Failed to load approvals');
      throw error;
    }
  },

  getApprovalHistory: async (params) => {
    const response = await api.get('/manager/approvals/history', { params });
    return response.data;
  },

  // Leave Approvals
  approveLeave: async (id, data) => {
    try {
      console.log('✅ [MANAGER] Approving leave:', id, data);
      const response = await api.put(`/manager/leave/${id}/approve`, data);
      console.log('✅ [MANAGER] Leave approved:', response.data);
      toast.success('Leave request approved successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [MANAGER] Failed to approve leave:', error);
      toast.error(error.message || 'Failed to approve leave');
      throw error;
    }
  },

  rejectLeave: async (id, data) => {
    try {
      console.log('❌ [MANAGER] Rejecting leave:', id, data);
      const response = await api.put(`/manager/leave/${id}/reject`, data);
      console.log('✅ [MANAGER] Leave rejected:', response.data);
      toast.success('Leave request rejected');
      return response.data;
    } catch (error) {
      console.error('❌ [MANAGER] Failed to reject leave:', error);
      toast.error(error.message || 'Failed to reject leave');
      throw error;
    }
  },

  // Attendance Approvals
  approveAttendanceCorrection: async (id, data) => {
    try {
      console.log('✅ [MANAGER] Approving attendance correction:', id, data);
      const response = await api.put(`/manager/attendance-correction/${id}/approve`, data);
      console.log('✅ [MANAGER] Attendance correction approved:', response.data);
      toast.success('Attendance correction approved successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [MANAGER] Failed to approve attendance correction:', error);
      toast.error(error.message || 'Failed to approve attendance correction');
      throw error;
    }
  },

  rejectAttendanceCorrection: async (id, data) => {
    try {
      console.log('❌ [MANAGER] Rejecting attendance correction:', id, data);
      const response = await api.put(`/manager/attendance-correction/${id}/reject`, data);
      console.log('✅ [MANAGER] Attendance correction rejected:', response.data);
      toast.success('Attendance correction rejected');
      return response.data;
    } catch (error) {
      console.error('❌ [MANAGER] Failed to reject attendance correction:', error);
      toast.error(error.message || 'Failed to reject attendance correction');
      throw error;
    }
  },

  // Expense Approvals
  approveExpense: async (id, data) => {
    const response = await api.put(`/manager/expense/${id}/approve`, data);
    return response.data;
  },

  rejectExpense: async (id, data) => {
    const response = await api.put(`/manager/expense/${id}/reject`, data);
    return response.data;
  },

  // ============================================
  // REPORTS
  // ============================================
  getTeamReports: async (params) => {
    const response = await api.get('/manager/reports', { params });
    return response.data;
  },

  getTeamPerformance: async (params) => {
    const response = await api.get('/manager/performance', { params });
    return response.data;
  },

  getTeamAttendance: async (params) => {
    const response = await api.get('/manager/attendance-report', { params });
    return response.data;
  },

  getTeamLeaveReport: async (params) => {
    const response = await api.get('/manager/leave-report', { params });
    return response.data;
  },

  // ============================================
  // DASHBOARD
  // ============================================
  getDashboardData: async () => {
    const response = await api.get('/manager/dashboard');
    return response.data;
  },

  // ============================================
  // EXPORT
  // ============================================
  exportTeamReport: async (params) => {
    const response = await api.get('/manager/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default managerService;
