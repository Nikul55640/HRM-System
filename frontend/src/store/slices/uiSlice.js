import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: {
    global: false,
    employees: false,
    documents: false,
    users: false,
  },
  notifications: [],
  modals: {
    deleteConfirm: false,
    employeeForm: false,
    documentUpload: false,
    userForm: false,
  },
  sidebar: {
    isOpen: true,
    isMobile: false,
  },
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Loading states
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setEmployeesLoading: (state, action) => {
      state.loading.employees = action.payload;
    },
    setDocumentsLoading: (state, action) => {
      state.loading.documents = action.payload;
    },
    setUsersLoading: (state, action) => {
      state.loading.users = action.payload;
    },

    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: action.payload.type || 'info', // success, error, warning, info
        message: action.payload.message,
        duration: action.payload.duration || 5000,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notif => notif.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Modals
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },

    // Sidebar
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebar.isOpen = action.payload;
    },
    setSidebarMobile: (state, action) => {
      state.sidebar.isMobile = action.payload;
    },

    // Theme
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const {
  setGlobalLoading,
  setEmployeesLoading,
  setDocumentsLoading,
  setUsersLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  toggleSidebar,
  setSidebarOpen,
  setSidebarMobile,
  setTheme,
  toggleTheme,
} = uiSlice.actions;

export default uiSlice.reducer;
