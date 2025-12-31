/**
 * Employee Management Service
 * Handles employee management operations with role assignment and designation system
 */
import api from './api';
import { toast } from 'react-toastify';

const employeeManagementService = {
  /**
   * Create new employee with role assignment
   */
  createEmployeeWithRole: async (employeeData) => {
    try {
      console.log('🔄 [EMPLOYEE_MGMT] Creating employee with role:', employeeData);
      const response = await api.post('/admin/employee-management/employees', employeeData);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Employee created successfully');
        console.log('✅ [EMPLOYEE_MGMT] Employee created:', response.data);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create employee');
      }
    } catch (error) {
      console.error('❌ [EMPLOYEE_MGMT] Failed to create employee:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create employee';
      toast.error(errorMessage);
      throw { success: false, message: errorMessage };
    }
  },

  /**
   * Update employee with role assignment
   */
  updateEmployeeWithRole: async (id, employeeData) => {
    try {
      console.log('🔄 [EMPLOYEE_MGMT] Updating employee with role:', id, employeeData);
      const response = await api.put(`/admin/employee-management/employees/${id}`, employeeData);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Employee updated successfully');
        console.log('✅ [EMPLOYEE_MGMT] Employee updated:', response.data);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update employee');
      }
    } catch (error) {
      console.error('❌ [EMPLOYEE_MGMT] Failed to update employee:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update employee';
      toast.error(errorMessage);
      throw { success: false, message: errorMessage };
    }
  },

  /**
   * Get employee with role information
   */
  getEmployeeWithRole: async (id) => {
    try {
      console.log('🔄 [EMPLOYEE_MGMT] Fetching employee with role:', id);
      const response = await api.get(`/admin/employee-management/employees/${id}`);
      
      if (response.data.success) {
        console.log('✅ [EMPLOYEE_MGMT] Employee fetched:', response.data);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch employee');
      }
    } catch (error) {
      console.error('❌ [EMPLOYEE_MGMT] Failed to fetch employee:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch employee';
      throw { success: false, message: errorMessage };
    }
  },

  /**
   * Get form data for employee creation/editing
   */
  getFormData: async () => {
    try {
      console.log('🔄 [EMPLOYEE_MGMT] Fetching form data');
      const response = await api.get('/admin/employee-management/form-data');
      
      if (response.data.success) {
        console.log('✅ [EMPLOYEE_MGMT] Form data fetched:', response.data);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch form data');
      }
    } catch (error) {
      console.error('❌ [EMPLOYEE_MGMT] Failed to fetch form data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch form data';
      throw { success: false, message: errorMessage };
    }
  },

  /**
   * Get designations for dropdown
   */
  getDesignations: async (departmentId = null) => {
    try {
      console.log('🔄 [EMPLOYEE_MGMT] Fetching designations for department:', departmentId);
      const params = departmentId ? { departmentId } : {};
      const response = await api.get('/admin/designations', { params });
      
      if (response.data.success) {
        console.log('✅ [EMPLOYEE_MGMT] Designations fetched:', response.data);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch designations');
      }
    } catch (error) {
      console.error('❌ [EMPLOYEE_MGMT] Failed to fetch designations:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch designations';
      throw { success: false, message: errorMessage };
    }
  },

  /**
   * Create designation
   */
  createDesignation: async (designationData) => {
    try {
      console.log('🔄 [EMPLOYEE_MGMT] Creating designation:', designationData);
      const response = await api.post('/admin/designations', designationData);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Designation created successfully');
        console.log('✅ [EMPLOYEE_MGMT] Designation created:', response.data);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to create designation');
      }
    } catch (error) {
      console.error('❌ [EMPLOYEE_MGMT] Failed to create designation:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create designation';
      toast.error(errorMessage);
      throw { success: false, message: errorMessage };
    }
  },

  /**
   * Update designation
   */
  updateDesignation: async (id, designationData) => {
    try {
      console.log('🔄 [EMPLOYEE_MGMT] Updating designation:', id, designationData);
      const response = await api.put(`/admin/designations/${id}`, designationData);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Designation updated successfully');
        console.log('✅ [EMPLOYEE_MGMT] Designation updated:', response.data);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update designation');
      }
    } catch (error) {
      console.error('❌ [EMPLOYEE_MGMT] Failed to update designation:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update designation';
      toast.error(errorMessage);
      throw { success: false, message: errorMessage };
    }
  },

  /**
   * Delete designation
   */
  deleteDesignation: async (id) => {
    try {
      console.log('🔄 [EMPLOYEE_MGMT] Deleting designation:', id);
      const response = await api.delete(`/admin/designations/${id}`);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Designation deleted successfully');
        console.log('✅ [EMPLOYEE_MGMT] Designation deleted:', response.data);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete designation');
      }
    } catch (error) {
      console.error('❌ [EMPLOYEE_MGMT] Failed to delete designation:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete designation';
      toast.error(errorMessage);
      throw { success: false, message: errorMessage };
    }
  }
};

export default employeeManagementService;