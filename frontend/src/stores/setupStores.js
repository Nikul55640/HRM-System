import { initializeStores, setupStoreSubscriptions } from './storeInitializer';

/**
 * Initialize all Zustand stores and set up cross-store communication
 * Call this in your main App.js or index.js
 */
export const setupZustandStores = () => {
  try {
    // Initialize stores with persisted data
    initializeStores();
    
    // Set up cross-store subscriptions
    setupStoreSubscriptions();
    
    console.log('✅ Zustand stores initialized successfully');
  } catch (error) {
    console.error('Error setting up Zustand stores:', error);
  }
};

/**
 * Development helper to access stores from browser console
 */
if (process.env.NODE_ENV === 'development') {
  window.__ZUSTAND_STORES__ = {
    auth: () => import('./useAuthStore').then(m => m.default.getState()),
    ui: () => import('./useUIStore').then(m => m.default.getState()),
    organization: () => import('./useOrganizationStore').then(m => m.default.getState()),
    department: () => import('./useDepartmentStore').then(m => m.default.getState()),
    employee: () => import('./useEmployeeStore').then(m => m.default.getState()),
    attendance: () => import('./useAttendanceStore').then(m => m.default.getState()),
    leave: () => import('./useLeaveStore').then(m => m.default.getState()),
  };
  
  console.log('🔧 Zustand stores available in console via window.__ZUSTAND_STORES__');
}