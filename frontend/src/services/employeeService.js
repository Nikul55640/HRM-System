import api from './api';
import { toast } from 'react-toastify';

const employeeService = {
  // Get all employees with pagination and filters
  getEmployees: async (params = {}) => {
    try {
      console.log('👥 [EMPLOYEE] Fetching employees:', params);
      const response = await api.get('/employees', { params });
      console.log('✅ [EMPLOYEE] Employees fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [EMPLOYEE] Failed to fetch employees:', error);
      toast.error(error.message || 'Failed to load employees');
      throw error;
    }
  },

  // Get single employee by ID
  getEmployeeById: async (id) => {
    try {
      console.log('👤 [EMPLOYEE] Fetching employee:', id);
      const response = await api.get(`/employees/${id}`);
      console.log('✅ [EMPLOYEE] Employee fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [EMPLOYEE] Failed to fetch employee:', error);
      toast.error(error.message || 'Failed to load employee');
      throw error;
    }
  },

  // Create new employee
  createEmployee: async (employeeData) => {
    try {
      console.log('➕ [EMPLOYEE] Creating employee:', employeeData);
      const response = await api.post('/employees', employeeData);
      console.log('✅ [EMPLOYEE] Employee created:', response.data);
      toast.success('Employee created successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [EMPLOYEE] Failed to create employee:', error);
      toast.error(error.message || 'Failed to create employee');
      throw error;
    }
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    try {
      console.log('✏️ [EMPLOYEE] Updating employee:', id, employeeData);
      const response = await api.put(`/employees/${id}`, employeeData);
      console.log('✅ [EMPLOYEE] Employee updated:', response.data);
      toast.success('Employee updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [EMPLOYEE] Failed to update employee:', error);
      toast.error(error.message || 'Failed to update employee');
      throw error;
    }
  },

  // Delete employee (soft delete)
  deleteEmployee: async (id) => {
    try {
      console.log('🗑️ [EMPLOYEE] Deleting employee:', id);
      const response = await api.delete(`/employees/${id}`);
      console.log('✅ [EMPLOYEE] Employee deleted:', response.data);
      toast.success('Employee deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [EMPLOYEE] Failed to delete employee:', error);
      toast.error(error.message || 'Failed to delete employee');
      throw error;
    }
  },

  // Search employees
  searchEmployees: async (searchParams) => {
    try {
      console.log('🔍 [EMPLOYEE] Searching employees:', searchParams);
      const response = await api.get('/employees/search', { params: searchParams });
      console.log('✅ [EMPLOYEE] Search results:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [EMPLOYEE] Search failed:', error);
      toast.error(error.message || 'Failed to search employees');
      throw error;
    }
  },

  // Get employee directory
  getEmployeeDirectory: async (params = {}) => {
    try {
      console.log('📖 [EMPLOYEE] Fetching directory:', params);
      const response = await api.get('/employees/directory', { params });
      console.log('✅ [EMPLOYEE] Directory fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [EMPLOYEE] Failed to fetch directory:', error);
      toast.error(error.message || 'Failed to load directory');
      throw error;
    }
  },

  // Employee self-update (limited fields)
  selfUpdateEmployee: async (id, updateData) => {
    try {
      console.log('✏️ [EMPLOYEE] Self-updating:', id, updateData);
      const response = await api.patch(`/employees/${id}/self-update`, updateData);
      console.log('✅ [EMPLOYEE] Self-update successful:', response.data);
      toast.success('Profile updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [EMPLOYEE] Self-update failed:', error);
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  },

  // Get current user's employee profile
  getMyProfile: async () => {
    try {
      console.log('👤 [EMPLOYEE] Fetching my profile');
      const response = await api.get('/employees/me');
      console.log('✅ [EMPLOYEE] My profile fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [EMPLOYEE] Failed to fetch my profile:', error);
      toast.error(error.message || 'Failed to load profile');
      throw error;
    }
  },
};

export default employeeService;
