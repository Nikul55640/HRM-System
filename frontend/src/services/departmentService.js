import api from './api';

const departmentService = {
  // Get all departments
  getDepartments: async (params = {}) => {
    const response = await api.get('/admin/departments', { params });
    return response.data;
  },

  // Get department by ID
  getDepartment: async (id) => {
    const response = await api.get(`/admin/departments/${id}`);
    return response.data;
  },

  // Create new department
  createDepartment: async (departmentData) => {
    const response = await api.post('/admin/departments', departmentData);
    return response.data;
  },

  // Update department
  updateDepartment: async (id, departmentData) => {
    const response = await api.put(`/admin/departments/${id}`, departmentData);
    return response.data;
  },

  // Delete department
  deleteDepartment: async (id) => {
    const response = await api.delete(`/admin/departments/${id}`);
    return response.data;
  },

  // Get department hierarchy
  getDepartmentHierarchy: async () => {
    const response = await api.get('/admin/departments/hierarchy');
    return response.data;
  },

  // Get department employees
  getDepartmentEmployees: async (id, params = {}) => {
    const response = await api.get(`/admin/departments/${id}/employees`, { params });
    return response.data;
  },

  // Assign employees to department
  assignEmployees: async (departmentId, employeeIds) => {
    const response = await api.post(`/admin/departments/${departmentId}/employees`, {
      employeeIds
    });
    return response.data;
  },

  // Remove employees from department
  removeEmployees: async (departmentId, employeeIds) => {
    const response = await api.delete(`/admin/departments/${departmentId}/employees`, {
      data: { employeeIds }
    });
    return response.data;
  },

  // Get department statistics
  getDepartmentStats: async (id) => {
    const response = await api.get(`/admin/departments/${id}/stats`);
    return response.data;
  },

  // Bulk operations
  bulkUpdateDepartments: async (updates) => {
    const response = await api.put('/admin/departments/bulk', { updates });
    return response.data;
  },

  bulkDeleteDepartments: async (ids) => {
    const response = await api.delete('/admin/departments/bulk', {
      data: { ids }
    });
    return response.data;
  }
};

export default departmentService;