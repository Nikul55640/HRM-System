import api from './api';

const configService = {
  // System configuration
  getSystemConfig: async () => {
    const response = await api.get('/admin/config/system');
    return response.data;
  },

  updateSystemConfig: async (config) => {
    const response = await api.put('/admin/config/system', config);
    return response.data;
  },

  // Custom fields
  getCustomFields: async () => {
    const response = await api.get('/admin/config/custom-fields');
    return response.data;
  },

  setCustomEmployeeFields: async (fields) => {
    const response = await api.put('/admin/config/custom-fields/employee', { fields });
    return response.data;
  },

  // Email settings
  getEmailSettings: async () => {
    const response = await api.get('/admin/config/email');
    return response.data;
  },

  updateEmailSettings: async (settings) => {
    const response = await api.put('/admin/config/email', settings);
    return response.data;
  },

  testEmailSettings: async (settings) => {
    const response = await api.post('/admin/config/email/test', settings);
    return response.data;
  },

  // Notification settings
  getNotificationSettings: async () => {
    const response = await api.get('/admin/config/notifications');
    return response.data;
  },

  updateNotificationSettings: async (settings) => {
    const response = await api.put('/admin/config/notifications', settings);
    return response.data;
  },

  // Security settings
  getSecuritySettings: async () => {
    const response = await api.get('/admin/config/security');
    return response.data;
  },

  updateSecuritySettings: async (settings) => {
    const response = await api.put('/admin/config/security', settings);
    return response.data;
  },

  // Backup settings
  getBackupSettings: async () => {
    const response = await api.get('/admin/config/backup');
    return response.data;
  },

  updateBackupSettings: async (settings) => {
    const response = await api.put('/admin/config/backup', settings);
    return response.data;
  },

  createBackup: async () => {
    const response = await api.post('/admin/config/backup/create');
    return response.data;
  },

  getBackupHistory: async () => {
    const response = await api.get('/admin/config/backup/history');
    return response.data;
  },

  restoreBackup: async (backupId) => {
    const response = await api.post(`/admin/config/backup/restore/${backupId}`);
    return response.data;
  },

  // Generic config methods using system config endpoints
  getConfig: async (key) => {
    try {
      const response = await api.get('/admin/config/system');
      
      // Look for the specific key in the system config
      const config = response.data?.data?.find(config => config.key === key);
      
      if (config) {
        return {
          success: true,
          data: {
            key: config.key,
            value: config.value,
            description: config.description
          }
        };
      } else {
        return { success: true, data: null };
      }
    } catch (error) {
      return { success: true, data: null };
    }
  },

  updateConfig: async (key, value, description = '') => {
    const response = await api.put('/admin/config/system', {
      key,
      value,
      description
    });
    return response.data;
  },

  // Attendance-specific config methods using system config endpoints
  getAttendanceSettings: async () => {
    try {
      // Use the existing system config endpoint
      const response = await api.get('/admin/config/system');
      
      // Look for attendance_settings in the system config
      const attendanceConfig = response.data?.data?.find(config => config.key === 'attendance_settings');
      
      if (attendanceConfig && attendanceConfig.value) {
        return {
          success: true,
          data: attendanceConfig.value
        };
      } else {
        // Return default settings if none exist
        return {
          success: true,
          data: {
            shiftStartTime: '09:00',
            shiftEndTime: '17:00',
            fullDayHours: 8,
            halfDayHours: 4,
            lateThresholdMinutes: 15,
            gracePeriodMinutes: 10,
            earlyDepartureThresholdMinutes: 15,
            overtimeEnabled: true,
            overtimeThresholdMinutes: 30,
            defaultBreakMinutes: 60,
            maxBreakMinutes: 120,
          }
        };
      }
    } catch (error) {
      // Return default settings if there's any error
      return {
        success: true,
        data: {
          shiftStartTime: '09:00',
          shiftEndTime: '17:00',
          fullDayHours: 8,
          halfDayHours: 4,
          lateThresholdMinutes: 15,
          gracePeriodMinutes: 10,
          earlyDepartureThresholdMinutes: 15,
          overtimeEnabled: true,
          overtimeThresholdMinutes: 30,
          defaultBreakMinutes: 60,
          maxBreakMinutes: 120,
        }
      };
    }
  },

  updateAttendanceSettings: async (settings) => {
    // Use the existing system config endpoint
    const response = await api.put('/admin/config/system', {
      key: 'attendance_settings',
      value: settings,
      description: 'Attendance system configuration settings'
    });
    return response.data;
  },

  // Document categories
  getDocumentCategories: async () => {
    try {
      const response = await api.get('/admin/config/document_categories');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { success: true, data: [] };
      }
      throw error;
    }
  },

  createDocumentCategory: async (category) => {
    const response = await api.post('/admin/config/document_categories', category);
    return response.data;
  },

  updateDocumentCategory: async (id, category) => {
    const response = await api.put(`/admin/config/document_categories/${id}`, category);
    return response.data;
  },

  deleteDocumentCategory: async (id) => {
    const response = await api.delete(`/admin/config/document_categories/${id}`);
    return response.data;
  }
};

export default configService;