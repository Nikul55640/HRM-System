import api from './api';
import { toast } from 'react-toastify';

const userService = {
  // Get all users (SuperAdmin only)
  getUsers: async (params = {}) => {
    try {
      console.log('👥 [USER] Fetching users:', params);
      const response = await api.get('/users', { params });
      console.log('✅ [USER] Users fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [USER] Failed to fetch users:', error);
      toast.error(error.message || 'Failed to load users');
      throw error;
    }
  },

  // Get single user by ID
  getUserById: async (id) => {
    try {
      console.log('👤 [USER] Fetching user:', id);
      const response = await api.get(`/users/${id}`);
      console.log('✅ [USER] User fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [USER] Failed to fetch user:', error);
      toast.error(error.message || 'Failed to load user');
      throw error;
    }
  },

  // Create new user (SuperAdmin only)
  createUser: async (userData) => {
    try {
      console.log('➕ [USER] Creating user:', userData);
      const response = await api.post('/users', userData);
      console.log('✅ [USER] User created:', response.data);
      toast.success('User created successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [USER] Failed to create user:', error);
      toast.error(error.message || 'Failed to create user');
      throw error;
    }
  },

  // Update user (SuperAdmin only)
  updateUser: async (id, userData) => {
    try {
      console.log('✏️ [USER] Updating user:', id
, userData);
      const response = await api.put(`/users/${id}`, userData);
      console.log('✅ [USER] User updated:', response.data);
      toast.success('User updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [USER] Failed to update user:', error);
      toast.error(error.message || 'Failed to update user');
      throw error;
    }
  },

  // Change user role 
// (SuperAdmin only)
  changeUserRole: async (id, role, assignedDepartments = []) => {
    try {
      console.log('🔄 [USER] Changing user role:', id, role);
      const response = await api.patch(`/users/${id}/role`, {
        role,
        assignedDepartments,
      });
      console.log('✅ [USER] Role changed:', response.data);
      toast.success('User role updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [USER] Failed to change role:', error);
      toast.error(error.message || 'Failed to update role');
      throw error;
    }
  },

  // Deactivate user (SuperAdmin only)
  deactivateUser: async (id) => {
    try {
      console.log('🚫 [USER] Deactivating user:', id);
      const response = await api.delete(`/users/${id}`);
      console.log('✅ [USER] User deactivated:', response.data);
      toast.success('User deactivated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [USER] Failed to deactivate user:', error);
      toast.error(error.message || 'Failed to deactivate user');
      throw error;
    }
  },

  // Activate user (SuperAdmin only)
  activateUser: async (id) => {
    try {
      console.log('✅ [USER] Activating user:', id);
      const response = await api.patch(`/users/${id}/activate`);
      console.log('✅ [USER] User activated:', response.data);
      toast.success('User activated successfully');
      return response.data;
    } catch (error) {
      
      toast.error(error.message || 'Failed to activate user');
      throw error;
    }
  },
};

export default userService;