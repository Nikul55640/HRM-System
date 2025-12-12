import api from '../../../core/api/api';

const configService = {
  // System Configuration
  getSystemConfig: async () => {
    const response = await api.get('/admin/config');
    return response.data;
  },

  updateSystemConfig: async (config) => {
    const response = await api.put('/admin/config', config);
    return response.data;
  },

  // Company Settings
  getCompanySettings: async () => {
    const response = await api.get('/admin/company-settings');
    return response.data;
  },

  updateCompanySettings: async (settings) => {
    const response = await api.put('/admin/company-settings', settings);
    return response.data;
  },

  // Attendance Settings
  getAttendanceSettings: async () => {
    const response = await api.get('/admin/attendance-settings');
    return response.data;
  },

  updateAttendanceSettings: async (settings) => {
    const response = await api.put('/admin/attendance-settings', settings);
    return response.data;
  },

  // Leave Settings
  getLeaveSettings: async () => {
    const response = await api.get('/admin/leave-settings');
    return response.data;
  },

  updateLeaveSettings: async (settings) => {
    const response = await api.put('/admin/leave-settings', settings);
    return response.data;
  },

  // Payroll Settings
  getPayrollSettings: async () => {
    const response = await api.get('/admin/payroll-settings');
    return response.data;
  },

  updatePayrollSettings: async (settings) => {
    const response = await api.put('/admin/payroll-settings', settings);
    return response.data;
  },

  // Custom Fields
  getCustomFields: async (module) => {
    const response = await api.get(`/admin/custom-fields/${module}`);
    return response.data;
  },

  createCustomField: async (module, field) => {
    const response = await api.post(`/admin/custom-fields/${module}`, field);
    return response.data;
  },

  updateCustomField: async (module, fieldId, field) => {
    const response = await api.put(`/admin/custom-fields/${module}/${fieldId}`, field);
    return response.data;
  },

  deleteCustomField: async (module, fieldId) => {
    const response = await api.delete(`/admin/custom-fields/${module}/${fieldId}`);
    return response.data;
  },
};

export default configService;