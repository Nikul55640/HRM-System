/**
 * Announcement Service
 * Handles all announcement-related API calls
 */

import api from './api';

const announcementService = {
  /**
   * Get all announcements
   * @returns {Promise} API response
   */
  getAnnouncements: async () => {
    try {
      const response = await api.get('/admin/announcements');
      return response.data;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  },

  /**
   * Get announcement by ID
   * @param {string} id - Announcement ID
   * @returns {Promise} API response
   */
  getAnnouncementById: async (id) => {
    try {
      const response = await api.get(`/admin/announcements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching announcement:', error);
      throw error;
    }
  },

  /**
   * Create new announcement
   * @param {Object} announcementData - Announcement data
   * @returns {Promise} API response
   */
  createAnnouncement: async (announcementData) => {
    try {
      const response = await api.post('/admin/announcements', announcementData);
      return response.data;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  /**
   * Update announcement
   * @param {string} id - Announcement ID
   * @param {Object} announcementData - Updated announcement data
   * @returns {Promise} API response
   */
  updateAnnouncement: async (id, announcementData) => {
    try {
      const response = await api.put(`/admin/announcements/${id}`, announcementData);
      return response.data;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  },

  /**
   * Delete announcement
   * @param {string} id - Announcement ID
   * @returns {Promise} API response
   */
  deleteAnnouncement: async (id) => {
    try {
      const response = await api.delete(`/admin/announcements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  },

  /**
   * Get public announcements (for employees)
   * @returns {Promise} API response
   */
  getPublicAnnouncements: async () => {
    try {
      const response = await api.get('/employee/announcements');
      return response.data;
    } catch (error) {
      console.error('Error fetching public announcements:', error);
      throw error;
    }
  },

  /**
   * Mark announcement as read
   * @param {string} id - Announcement ID
   * @returns {Promise} API response
   */
  markAsRead: async (id) => {
    try {
      const response = await api.post(`/employee/announcements/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      throw error;
    }
  }
};

export default announcementService;