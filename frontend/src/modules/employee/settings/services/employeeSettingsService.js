import api from '../../../../services/api';

const employeeSettingsService = {
  // Profile Management
  getProfile: async () => {
    try {
      const response = await api.get('/employee/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/employee/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  uploadProfilePhoto: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      
      const response = await api.post('/employee/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    }
  },

  deleteProfilePhoto: async () => {
    try {
      const response = await api.delete('/employee/profile/photo');
      return response.data;
    } catch (error) {
      console.error('Error deleting profile photo:', error);
      throw error;
    }
  },

  // Password Management
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/employee/profile/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Emergency Contacts Management
  getEmergencyContacts: async () => {
    try {
      const response = await api.get('/employee/emergency-contacts');
      return response.data;
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      throw error;
    }
  },

  createEmergencyContact: async (contactData) => {
    try {
      const response = await api.post('/employee/emergency-contacts', contactData);
      return response.data;
    } catch (error) {
      console.error('Error creating emergency contact:', error);
      throw error;
    }
  },

  updateEmergencyContact: async (id, contactData) => {
    try {
      const response = await api.put(`/employee/emergency-contacts/${id}`, contactData);
      return response.data;
    } catch (error) {
      console.error('Error updating emergency contact:', error);
      throw error;
    }
  },

  deleteEmergencyContact: async (id) => {
    try {
      const response = await api.delete(`/employee/emergency-contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      throw error;
    }
  },

  setPrimaryEmergencyContact: async (id) => {
    try {
      const response = await api.patch(`/employee/emergency-contacts/${id}/set-primary`);
      return response.data;
    } catch (error) {
      console.error('Error setting primary emergency contact:', error);
      throw error;
    }
  }
};

export default employeeSettingsService;