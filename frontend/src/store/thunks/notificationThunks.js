import { createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService'; 

/**
 * Fetch notifications with filters and pagination
 */
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Fetch unread notification count
 */
export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getUnreadCount();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Mark multiple notifications as read
 */
export const markManyNotificationsAsRead = createAsyncThunk(
  'notifications/markManyAsRead',
  async (notificationIds, { rejectWithValue }) => {
    try {
      const response = await notificationService.markManyAsRead(notificationIds);
      return {
        notificationIds,
        modifiedCount: response.data.data.modifiedCount,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAllAsRead();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

/**
 * Delete a notification
 */
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
