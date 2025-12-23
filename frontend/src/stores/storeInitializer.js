// Store initialization utilities
import useAuthStore from './useAuthStore';
import useUIStore from './useUIStore';
import useOrganizationStore from './useOrganizationStore';
import useDepartmentStore from './useDepartmentStore';
import useEmployeeStore from './useEmployeeStore';
import useAttendanceStore from './useAttendanceStore';
import useLeaveStore from './useLeaveStore';

export const initializeStores = () => {
  try {
    // Initialize auth store with token from localStorage
    const authStore = useAuthStore.getState();
    if (authStore.token) {
      // Set up API headers if token exists
      import('../core/api/api').then(({ default: api }) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${authStore.token}`;
      });
    }
  } catch (error) {
    console.error('Error initializing stores:', error);
  }
};

export const resetAllStores = () => {
  try {
    useAuthStore.getState().reset?.();
    useUIStore.getState().reset?.();
    useOrganizationStore.getState().resetState?.();
    useDepartmentStore.getState().reset?.();
    useEmployeeStore.getState().reset?.();
    useAttendanceStore.getState().reset?.();
    useLeaveStore.getState().reset?.();
  } catch (error) {
    console.error('Error resetting stores:', error);
  }
};

// Store subscriptions for cross-store communication
export const setupStoreSubscriptions = () => {
  try {
    // Example: When user logs out, reset all stores
    useAuthStore.subscribe(
      (state) => state.isAuthenticated,
      (isAuthenticated) => {
        if (!isAuthenticated) {
          // Reset all stores when user logs out
          useUIStore.getState().reset?.();
          useOrganizationStore.getState().resetState?.();
          useDepartmentStore.getState().reset?.();
          useEmployeeStore.getState().reset?.();
          useAttendanceStore.getState().reset?.();
          useLeaveStore.getState().reset?.();
        }
      }
    );

    // Example: Update UI loading state based on other stores
    const updateGlobalLoading = () => {
      const isLoading = 
        useOrganizationStore.getState().isLoading ||
        useEmployeeStore.getState().loading ||
        useAttendanceStore.getState().loading ||
        useLeaveStore.getState().loading;
      
      useUIStore.getState().setGlobalLoading(isLoading);
    };

    // Subscribe to loading states
    useOrganizationStore.subscribe(updateGlobalLoading);
    useEmployeeStore.subscribe(updateGlobalLoading);
    useAttendanceStore.subscribe(updateGlobalLoading);
    useLeaveStore.subscribe(updateGlobalLoading);
  } catch (error) {
    console.error('Error setting up store subscriptions:', error);
  }
};