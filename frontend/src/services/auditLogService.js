import api from '../core/services/api';
import { toast } from 'react-toastify';

/**
 * Audit Log Service
 * Handles all API calls for audit log management (Feature 8)
 * Only accessible by SuperAdmin
 */

const auditLogService = {
  // Get audit logs with filtering
  getLogs: async (params = {}) => {
    try {
      const response = await api.get('/admin/audit-logs', { params });
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to fetch audit logs');
      throw error;
    }
  },

  // Filter audit logs
  filterLogs: async (filterParams) => {
    try {
      const response = await api.get('/admin/audit-logs/filter', { params: filterParams });
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to filter audit logs');
      throw error;
    }
  },

  // Export audit logs
  exportLogs: async (exportParams = {}) => {
    try {
      const response = await api.get('/admin/audit-logs/export', {
        params: exportParams,
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Audit logs exported successfully');
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to export audit logs');
      throw error;
    }
  },

  // Get audit log statistics
  getStatistics: async (params = {}) => {
    try {
      const response = await api.get('/admin/audit-logs/statistics', { params });
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to fetch audit statistics');
      throw error;
    }
  },

  // Get audit log by ID
  getLogById: async (logId) => {
    try {
      const response = await api.get(`/admin/audit-logs/${logId}`);
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to fetch audit log details');
      throw error;
    }
  },

  // Search audit logs
  searchLogs: async (searchQuery, params = {}) => {
    try {
      const response = await api.get('/admin/audit-logs/search', {
        params: { q: searchQuery, ...params }
      });
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to search audit logs');
      throw error;
    }
  },
};

export default auditLogService;