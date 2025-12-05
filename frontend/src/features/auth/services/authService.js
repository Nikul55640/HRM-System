import api from '../../../services/api';

const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    console.log('🔍 [AUTH SERVICE] Raw API response:', response.data);
    // Backend returns data in response.data.data format
    const { data } = response.data;
    return {
      user: data.user,
      token: data.accessToken, // Map accessToken to token
      refreshToken: data.refreshToken,
    };
  },

  // Register (for initial setup)
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Password reset request
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/password-reset-request', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/password-reset', { token, newPassword });
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export default authService;
