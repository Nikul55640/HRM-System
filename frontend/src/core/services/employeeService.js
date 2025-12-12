import api from '../api/api';

const employeeService = {
  // Employee profile
  getProfile: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}/profile`);
    return response.data;
  },

  updateProfile: async (employeeId, profileData) => {
    const response = await api.put(`/employees/${employeeId}/profile`, profileData);
    return response.data;
  },

  // Bank details
  getBankDetails: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}/bank-details`);
    return response.data;
  },

  updateBankDetails: async (employeeId, bankData) => {
    const response = await api.put(`/employees/${employeeId}/bank-details`, bankData);
    return response.data;
  },

  // Employee list and management
  getEmployees: async (params = {}) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  getEmployee: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  createEmployee: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  updateEmployee: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  deleteEmployee: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  // Employee documents
  getEmployeeDocuments: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}/documents`);
    return response.data;
  },

  uploadEmployeeDocument: async (employeeId, documentData) => {
    const response = await api.post(`/employees/${employeeId}/documents`, documentData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Employee statistics
  getEmployeeStats: async () => {
    const response = await api.get('/employees/stats');
    return response.data;
  },

  // Bulk operations
  bulkUpdateEmployees: async (updates) => {
    const response = await api.put('/employees/bulk', { updates });
    return response.data;
  },

  bulkDeleteEmployees: async (ids) => {
    const response = await api.delete('/employees/bulk', {
      data: { ids }
    });
    return response.data;
  },

  // Employee search
  searchEmployees: async (query, filters = {}) => {
    const response = await api.get('/employees/search', {
      params: { query, ...filters }
    });
    return response.data;
  }
};

export default employeeService;