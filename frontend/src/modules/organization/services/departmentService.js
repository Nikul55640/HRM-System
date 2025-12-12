import api from '../../../core/api/api';

const departmentService = {
  // Get all departments
  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data;
  },

  // Get department by ID
  getDepartmentById: async (id) => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  // Create new department
  createDepartment: async (departmentData) => {
    const response = await api.post('/departments', departmentData);
    return response.data;
  },

  // Update department
  updateDepartment: async (id, departmentData) => {
    const response = await api.put(`/departments/${id}`, departmentData);
    return response.data;
  },

  // Delete department
  deleteDepartment: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },

  // Get department employees
  getDepartmentEmployees: async (id) => {
    const response = await api.get(`/departments/${id}/employees`);
    return response.data;
  },

  // Assign manager to department
  assignManager: async (departmentId, managerId) => {
    const response = await api.post(`/departments/${departmentId}/manager`, {
      managerId
    });
    return response.data;
  },

  // Remove manager from department
  removeManager: async (departmentId) => {
    const response = await api.delete(`/departments/${departmentId}/manager`);
    return response.data;
  },

  // Get department hierarchy
  getDepartmentHierarchy: async () => {
    const response = await api.get('/departments/hierarchy');
    return response.data;
  },

  // Bulk import departments
  bulkImportDepartments: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/departments/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Export departments
  exportDepartments: async (format = 'csv') => {
    const response = await api.get(`/departments/export?format=${format}`, {
      responseType: 'blob',
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `departments.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default departmentService;