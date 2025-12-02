import api from './api';

const userService = {
  // Get all users (SuperAdmin only)
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get single user by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user (SuperAdmin only)
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update user (SuperAdmin only)
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Change user role (SuperAdmin only)
  changeUserRole: async (id, role, assignedDepartments = []) => {
    const response = await api.patch(`/users/${id}/role`, {
      role,
      assignedDepartments,
    });
    return response.data;
  },

  // Deactivate user (SuperAdmin only)
  deactivateUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Activate user (SuperAdmin only)
  activateUser: async (id) => {
    const response = await api.patch(`/users/${id}/activate`);
    return response.data;
  },
};

export default userService;
