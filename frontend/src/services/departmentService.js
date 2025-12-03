import api from './api';
import { toast } from 'react-toastify';

const departmentService = {
  // Get all departments
  getAllDepartments: async (params) => {
    try {
      console.log('🏢 [DEPARTMENT] Fetching departments:', params);
      const response = await api.get('/admin/departments', { params });
      console.log('✅ [DEPARTMENT] Departments fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [DEPARTMENT] Failed to fetch departments:', error);
      toast.error(error.message || 'Failed to load departments');
      throw error;
    }
  },

  // Get department by ID
  getDepartmentById: async (id) => {
    try {
      console.log('🏢 [DEPARTMENT] Fetching department:', id);
      const response = await api.get(`/admin/departments/${id}`);
      console.log('✅ [DEPARTMENT] Department fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [DEPARTMENT] Failed to fetch department:', error);
      toast.error(error.message || 'Failed to load department');
      throw error;
    }
  },

  // Create department
  createDepartment: async (data) => {
    try {
      console.log('➕ [DEPARTMENT] Creating department:', data);
      const response = await api.post('/admin/departments', data);
      console.log('✅ [DEPARTMENT] Department created:', response.data);
      toast.success('Department created successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [DEPARTMENT] Failed to create department:', error);
      toast.error(error.message || 'Failed to create department');
      throw error;
    }
  },

  // Update department
  updateDepartment: async (id, data) => {
    try {
      console.log('✏️ [DEPARTMENT] Updating department:', id, data);
      const response = await api.put(`/admin/departments/${id}`, data);
      console.log('✅ [DEPARTMENT] Department updated:', response.data);
      toast.success('Department updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [DEPARTMENT] Failed to update department:', error);
      toast.error(error.message || 'Failed to update department');
      throw error;
    }
  },

  // Delete department
  deleteDepartment: async (id) => {
    try {
      console.log('🗑️ [DEPARTMENT] Deleting department:', id);
      const response = await api.delete(`/admin/departments/${id}`);
      console.log('✅ [DEPARTMENT] Department deleted:', response.data);
      toast.success('Department deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [DEPARTMENT] Failed to delete department:', error);
      toast.error(error.message || 'Failed to delete department');
      throw error;
    }
  },

  // Get department employees
  getDepartmentEmployees: async (id, params) => {
    try {
      console.log('👥 [DEPARTMENT] Fetching department employees:', id, params);
      const response = await api.get(`/admin/departments/${id}/employees`, { params });
      console.log('✅ [DEPARTMENT] Employees fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [DEPARTMENT] Failed to fetch employees:', error);
      toast.error(error.message || 'Failed to load employees');
      throw error;
    }
  },

  // Get department statistics
  getDepartmentStatistics: async (id) => {
    try {
      console.log('📊 [DEPARTMENT] Fetching statistics:', id);
      const response = await api.get(`/admin/departments/${id}/statistics`);
      console.log('✅ [DEPARTMENT] Statistics fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [DEPARTMENT] Failed to fetch statistics:', error);
      toast.error(error.message || 'Failed to load statistics');
      throw error;
    }
  },

  // Assign employees to department
  assignEmployees: async (id, employeeIds) => {
    try {
      console.log('➕ [DEPARTMENT] Assigning employees:', id, employeeIds);
      const response = await api.post(`/admin/departments/${id}/assign`, { employeeIds });
      console.log('✅ [DEPARTMENT] Employees assigned:', response.data);
      toast.success('Employees assigned successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [DEPARTMENT] Failed to assign employees:', error);
      toast.error(error.message || 'Failed to assign employees');
      throw error;
    }
  },

  // Remove employees from department
  removeEmployees: async (id, employeeIds) => {
    try {
      console.log('➖ [DEPARTMENT] Removing employees:', id, employeeIds);
      const response = await api.post(`/admin/departments/${id}/remove`, { employeeIds });
      console.log('✅ [DEPARTMENT] Employees removed:', response.data);
      toast.success('Employees removed successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [DEPARTMENT] Failed to remove employees:', error);
      toast.error(error.message || 'Failed to remove employees');
      throw error;
    }
  },
};

export default departmentService;
