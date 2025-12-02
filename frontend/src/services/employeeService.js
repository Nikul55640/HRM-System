import api from './api';

const employeeService = {
  // Get all employees with pagination and filters
  getEmployees: async (params = {}) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  // Get single employee by ID
  getEmployeeById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Create new employee
  createEmployee: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  // Delete employee (soft delete)
  deleteEmployee: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  // Search employees
  searchEmployees: async (searchParams) => {
    const response = await api.get('/employees/search', { params: searchParams });
    return response.data;
  },

  // Get employee directory
  getEmployeeDirectory: async (params = {}) => {
    const response = await api.get('/employees/directory', { params });
    return response.data;
  },

  // Employee self-update (limited fields)
  selfUpdateEmployee: async (id, updateData) => {
    const response = await api.patch(`/employees/${id}/self-update`, updateData);
    return response.data;
  },

  // Get current user's employee profile
  getMyProfile: async () => {
    const response = await api.get('/employees/me');
    return response.data;
  },
};

export default employeeService;
