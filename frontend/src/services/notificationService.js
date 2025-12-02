import api from './api';

const notificationService = {
  /**
   * Get notifications with filters and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getNotifications: (params = {}) => {
    return api.get('/employee/notifications', { params });
  },

  /**
   * Get unread notification count
   * @returns {Promise}
   */
  getUnreadCount: () => {
    return api.get('/employee/notifications/unread-count');
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId
   * @returns {Promise}
   */
  markAsRead: (notificationId) => {
    return api.put(`/employee/notifications/${notificationId}/read`);
  },

  /**
   * Mark multiple notifications as read
   * @param {Array<string>} notificationIds
   * @returns {Promise}
   */
  markManyAsRead: (notificationIds) => {
    return api.put('/employee/notifications/read-many', { notificationIds });
  },

  /**
   * Mark all notifications as read
   * @returns {Promise}
   */
  markAllAsRead: () => {
    return api.put('/employee/notifications/read-all');
  },

  /**
   * Delete a notification
   * @param {string} notificationId
   * @returns {Promise}
   */
  deleteNotification: (notificationId) => {
    return api.delete(`/employee/notifications/${notificationId}`);
  },
};

export default notificationService;
