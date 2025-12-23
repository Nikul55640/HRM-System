// Zustand Stores - Main Export File
export { default as useAuthStore } from './useAuthStore';
export { default as useUIStore } from './useUIStore';
export { default as useOrganizationStore } from './useOrganizationStore';
export { default as useDepartmentStore } from './useDepartmentStore';
export { default as useEmployeeStore } from './useEmployeeStore';
export { default as useAttendanceStore } from './useAttendanceStore';
export { default as useLeaveStore } from './useLeaveStore';

// Re-export initialization functions
export { initializeStores, resetAllStores, setupStoreSubscriptions } from './storeInitializer';