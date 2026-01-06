import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useNotificationStore = create(
  devtools(
    (set, get) => ({
      // State
      notifications: [],
      unreadCount: 0,
      isConnected: false,
      isConnecting: false,
      lastError: null,
      
      // Actions
      setNotifications: (notifications) => set({ notifications }),
      
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
      })),
      
      updateNotification: (id, updates) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, ...updates } : n
        ),
      })),
      
      removeNotification: (id) => set((state) => {
        const notification = state.notifications.find(n => n.id === id);
        return {
          notifications: state.notifications.filter(n => n.id !== id),
          unreadCount: notification && !notification.isRead 
            ? Math.max(0, state.unreadCount - 1) 
            : state.unreadCount,
        };
      }),
      
      markAsRead: (id) => set((state) => {
        const notification = state.notifications.find(n => n.id === id);
        if (notification && !notification.isRead) {
          return {
            notifications: state.notifications.map(n => 
              n.id === id ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        }
        return state;
      }),
      
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
      })),
      
      setUnreadCount: (count) => set({ unreadCount: count }),
      
      setConnectionStatus: (isConnected, isConnecting = false) => set({ 
        isConnected, 
        isConnecting,
        lastError: isConnected ? null : get().lastError,
      }),
      
      setError: (error) => set({ 
        lastError: error,
        isConnected: false,
        isConnecting: false,
      }),
      
      clearError: () => set({ lastError: null }),
      
      // Computed getters
      get hasUnread() {
        return get().unreadCount > 0;
      },
      
      get unreadNotifications() {
        return get().notifications.filter(n => !n.isRead);
      },
      
      get readNotifications() {
        return get().notifications.filter(n => n.isRead);
      },
      
      // Filter by category
      getNotificationsByCategory: (category) => {
        return get().notifications.filter(n => n.category === category);
      },
      
      // Filter by type
      getNotificationsByType: (type) => {
        return get().notifications.filter(n => n.type === type);
      },
      
      // Reset store
      reset: () => set({
        notifications: [],
        unreadCount: 0,
        isConnected: false,
        isConnecting: false,
        lastError: null,
      }),
    }),
    {
      name: 'notification-store',
    }
  )
);

export default useNotificationStore;