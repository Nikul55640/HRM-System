import { createSlice } from '@reduxjs/toolkit';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markManyNotificationsAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../thunks/notificationThunks';

const initialState = {
  notifications: [],
  unreadCount: 0,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    hasMore: false,
  },
  filters: {
    isRead: undefined,
    type: undefined,
    priority: undefined,
  },
  loading: false,
  error: null,
  selectedNotification: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page on filter change
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setSelectedNotification: (state, action) => {
      state.selectedNotification = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic update for marking as read
    optimisticMarkAsRead: (state, action) => {
      const notification = state.notifications.find((n) => n._id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data;
        state.pagination = action.payload.pagination;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notifications';
      })

      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count;
      })

      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n._id === action.payload._id);
        if (notification) {
          notification.isRead = true;
          notification.readAt = action.payload.readAt;
        }
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })

      // Mark many as read
      .addCase(markManyNotificationsAsRead.fulfilled, (state, action) => {
        const { notificationIds, modifiedCount } = action.payload;
        notificationIds.forEach((id) => {
          const notification = state.notifications.find((n) => n._id === id);
          if (notification && !notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
          }
        });
        state.unreadCount = Math.max(0, state.unreadCount - modifiedCount);
      })

      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state, action) => {
        state.notifications.forEach((notification) => {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
        });
        state.unreadCount = 0;
      })

      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const deletedId = action.payload;
        const deletedNotification = state.notifications.find((n) => n._id === deletedId);
        
        state.notifications = state.notifications.filter((n) => n._id !== deletedId);
        state.pagination.total -= 1;
        
        if (deletedNotification && !deletedNotification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setPage,
  setSelectedNotification,
  clearError,
  optimisticMarkAsRead,
} = notificationSlice.actions;

export default notificationSlice.reducer;
