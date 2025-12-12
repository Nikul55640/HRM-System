import api from '../core/api/api';
import { toast } from 'react-toastify';

/**
 * Employee Self-Service API Service
 * Handles all API calls for employee self-service features
 */

const employeeSelfService = {
  // Profile Management
  profile: {
    get: async () => {
      try {
        console.log('👤 [ESS] Fetching profile');
        const response = await api.get('/employee/profile');
        console.log('✅ [ESS] Profile fetched:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ [ESS] Failed to fetch profile:', error);
        toast.error(error.message || 'Failed to load profile');
        throw error;
      }
    },
    
    update: async (profileData) => {
      try {
        console.log('✏️ [ESS] Updating profile:', profileData);
        const response = await api.put('/employee/profile', profileData);
        console.log('✅ [ESS] Profile updated:', response.data);
        toast.success('Profile updated successfully');
        return response.data;
      } catch (error) {
        console.error('❌ [ESS] Failed to update profile:', error);
        toast.error(error.message || 'Failed to update profile');
        throw error;
      }
    },
    
    getChangeHistory: async () => {
      const response = await api.get('/employee/profile/history');
      return response.data;
    },
  },

  // Bank Details
  bankDetails: {
    get: async () => {
      const response = await api.get('/employee/bank-details');
      return response.data;
    },
    
    update: async (bankData) => {
      const response = await api.put('/employee/bank-details', bankData);
      return response.data;
    },
    
    requestVerification: async () => {
      const response = await api.post('/employee/bank-details/verify');
      return response.data;
    },
  },

  // Documents
  documents: {
    list: async () => {
      const response = await api.get('/employee/profile/documents');
      return response.data;
    },
    
    upload: async (formData) => {
      const response = await api.post('/employee/profile/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    
    download: async (documentId) => {
      const response = await api.get(`/employee/profile/documents/${documentId}`, {
        responseType: 'blob',
      });
      return response.data;
    },
  },

  // Payslips
  payslips: {
    list: async (params = {}) => {
      try {
        console.log('💰 [ESS] Fetching payslips:', params);
        const response = await api.get('/employee/payslips', { params });
        console.log('✅ [ESS] Payslips fetched:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ [ESS] Failed to fetch payslips:', error);
        toast.error(error.message || 'Failed to load payslips');
        throw error;
      }
    },
    
    getById: async (id) => {
      try {
        console.log('💰 [ESS] Fetching payslip:', id);
        const response = await api.get(`/employee/payslips/${id}`);
        console.log('✅ [ESS] Payslip fetched:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ [ESS] Failed to fetch payslip:', error);
        toast.error(error.message || 'Failed to load payslip');
        throw error;
      }
    },
    
    download: async (id) => {
      const response = await api.get(`/employee/payslips/${id}/download`, {
        responseType: 'blob',
      });
      return response.data;
    },
  },

  // Leave Balance
  leave: {
    getBalance: async () => {
      const response = await api.get('/employee/leave-balance');
      return response.data;
    },
    
    getHistory: async (params = {}) => {
      const response = await api.get('/employee/leave-history', { params });
      return response.data;
    },

    apply: async (leaveData) => {
      const response = await api.post('/employee/leave-request', leaveData);
      return response.data;
    },
    
    exportSummary: async () => {
      const response = await api.get('/employee/leave-balance/export', {
        responseType: 'blob',
      });
      return response.data;
    },
  },

  // Attendance
  attendance: {
    getRecords: async (params = {}) => {
      const response = await api.get('/employee/attendance', { params });
      return response.data;
    },
    
    getSummary: async (month, year) => {
      const response = await api.get('/employee/attendance/summary', {
        params: { month, year },
      });
      return response.data;
    },
    
    exportReport: async (month, year) => {
      const response = await api.get('/employee/attendance/export', {
        params: { month, year },
        responseType: 'blob',
      });
      return response.data;
    },
  },

  // Requests
  requests: {
    list: async (params = {}) => {
      const response = await api.get('/employee/requests', { params });
      return response.data;
    },
    
    getById: async (id) => {
      const response = await api.get(`/employee/requests/${id}`);
      return response.data;
    },
    
    create: async (requestData) => {
      const response = await api.post('/employee/requests', requestData);
      return response.data;
    },
    
    cancel: async (id) => {
      const response = await api.put(`/employee/requests/${id}/cancel`);
      return response.data;
    },
  },

  // Notifications
  notifications: {
    list: async (params = {}) => {
      const response = await api.get('/employee/notifications', { params });
      return response.data;
    },
    
    markAsRead: async (id) => {
      const response = await api.put(`/employee/notifications/${id}/read`);
      return response.data;
    },
    
    markAllAsRead: async () => {
      const response = await api.put('/employee/notifications/read-all');
      return response.data;
    },
  },
};

export default employeeSelfService;
