import api from './api';
import { toast } from 'react-toastify';

const notificationService = {
  getNotifications: async (params = {}) => {
    try {
      console.log('🔔 [NOTIFICATION] Fetching notifications:', params);
      const response = await api.get('/employee/notifications', { params });
      console.log('✅ [NOTIFICATION] Notifications fetched:', response.data);
      return response;
    } catch (error) {
      console.error('❌ [NOTIFICATION] Failed to fetch notifications:', error);
      toast.error(error.message || 'Failed to load notifications');
      throw error;
    }
  },

  getUnreadCount: async () => {
    try {
      console.log('🔔 [NOTIFICATION] Fetching unread count');
      const response = await api.get('/employee/notifications/unread-count');
      console.log('✅ [NOTIFICATION] Unread count fetched:', response.data);
      return response;
    } catch (error) {
      console.error('❌ [NOTIFICATION] Failed to fetch unread count:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      console.log('✅ [NOTIFICATION] Marking as read:', notificationId);
      const response = await api.put(`/employee/notifications/${notificationId}/read`);
      console.log('✅ [NOTIFICATION] Marked as read:', response.data);
      return response;
    } catch (error) {
      console.error('❌ [NOTIFICATION] Failed to mark as read:', error);
      toast.error(error.message || 'Failed to mark notification as read');
      throw error;
    }
  },

  markManyAsRead: async (notificationIds) => {
    try {
      console.log('✅ [NOTIFICATION] Marking many as read:', notificationIds);
      const response = await api.put('/employee/notifications/read-many', { notificationIds });
      console.log('✅ [NOTIFICATION] Marked many as read:', response.data);
      toast.success('Notifications marked as read');
      return response;
    } catch (error) {
      console.error('❌ [NOTIFICATION] Failed to mark many as read:', error);
      toast.error(error.message || 'Failed to mark notifications as read');
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      console.log('✅ [NOTIFICATION] Marking all as read');
      const response = await api.put('/employee/notifications/read-all');
      console.log('✅ [NOTIFICATION] All marked as read:', response.data);
      toast.success('All notifications marked as read');
      return response;
    } catch (error) {
      console.error('❌ [NOTIFICATION] Failed to mark all as read:', error);
      toast.error(error.message || 'Failed to mark all as read');
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      console.log('🗑️ [NOTIFICATION] Deleting notification:', notificationId);
      const response = await api.delete(`/employee/notifications/${notificationId}`);
      console.log('✅ [NOTIFICATION] Notification deleted:', response.data);
      toast.success('Notification deleted');
      return response;
    } catch (error) {
      console.error('❌ [NOTIFICATION] Failed to delete notification:', error);
      toast.error(error.message || 'Failed to delete notification');
      throw error;
    }
  },
};

export default notificationService;
