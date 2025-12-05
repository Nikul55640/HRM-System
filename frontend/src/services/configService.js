import api from './api';

const configService = {
  // Department management
  getDepartments: async () => {
    const response = await api.get('/config/departments');
    return response.data;
  },

  createDepartment: async (departmentData) => {
    const response = await api.post('/config/departments', departmentData);
    return response.data;
  },

  updateDepartment: async (id, departmentData) => {
    const response = await api.put(`/config/departments/${id}`, departmentData);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await api.delete(`/config/departments/${id}`);
    return response.data;
  },

  // Custom fields configuration
  getCustomFields: async () => {
    const response = await api.get('/config/custom-fields');
    return response.data;
  },

  createCustomField: async (fieldData) => {
    const response = await api.post('/config/custom-fields', fieldData);
    return response.data;
  },

  updateCustomField: async (id, fieldData) => {
    const response = await api.put(`/config/custom-fields/${id}`, fieldData);
    return response.data;
  },

  deleteCustomField: async (id) => {
    const response = await api.delete(`/config/custom-fields/${id}`);
    return response.data;
  },

  // Document categories
  getDocumentCategories: async () => {
    const response = await api.get('/config/document-categories');
    return response.data;
  },

  createDocumentCategory: async (categoryData) => {
    const response = await api.post('/config/document-categories', categoryData);
    return response.data;
  },

  // System settings
  getSystemSettings: async () => {
    const response = await api.get('/config/settings');
    return response.data;
  },

  updateSystemSettings: async (settings) => {
    const response = await api.put('/config/settings', settings);
    return response.data;
  },

  // Generic config get/update
  getConfig: async (key) => {
    try {
      const response = await api.get('/config/system');
      // Find the specific config by key
      if (response.data.success && response.data.data) {
        const configs = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        const config = configs.find(c => c.key === key);
        return { success: true, data: config };
      }
      return { success: false, data: null };
    } catch (error) {
      console.error('Get config error:', error);
      return { success: false, data: null };
    }
  },

  updateConfig: async (key, value) => {
    const response = await api.post('/config/system', { 
      key, 
      value,
      description: `${key} configuration`
    });
    return response.data;
  },
};

export default configService;
