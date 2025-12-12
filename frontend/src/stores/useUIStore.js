import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useUIStore = create(
  devtools(
    (set, get) => ({
      // Sidebar state
      sidebarOpen: true,
      sidebarCollapsed: false,
      
      // Theme state
      theme: 'light',
      
      // Modal states
      modals: {
        userModal: false,
        departmentModal: false,
        leaveModal: false,
        attendanceModal: false,
      },
      
      // Loading states
      loading: {
        global: false,
        departments: false,
        employees: false,
      },
      
      // Notification state
      notifications: [],
      
      // Actions
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
      
      setSidebarCollapsed: (collapsed) => set({ 
        sidebarCollapsed: collapsed 
      }),
      
      setTheme: (theme) => set({ theme }),
      
      openModal: (modalName) => set((state) => ({
        modals: { ...state.modals, [modalName]: true }
      })),
      
      closeModal: (modalName) => set((state) => ({
        modals: { ...state.modals, [modalName]: false }
      })),
      
      closeAllModals: () => set((state) => ({
        modals: Object.keys(state.modals).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {})
      })),
      
      setLoading: (key, isLoading) => set((state) => ({
        loading: { ...state.loading, [key]: isLoading }
      })),
      
      setGlobalLoading: (isLoading) => set((state) => ({
        loading: { ...state.loading, global: isLoading }
      })),
      
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, {
          id: Date.now(),
          timestamp: new Date(),
          ...notification
        }]
      })),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      // Computed values
      get isAnyModalOpen() {
        return Object.values(get().modals).some(Boolean);
      },
      
      get isAnyLoading() {
        return Object.values(get().loading).some(Boolean);
      }
    }),
    {
      name: 'ui-store', // DevTools name
    }
  )
);

export default useUIStore;