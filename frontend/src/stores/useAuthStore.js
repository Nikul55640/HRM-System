import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { toast } from 'react-toastify';
import api, { setAuthTokenGetter } from '../services/api';

const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        permissions: [],
        isLoggingOut: false, // Add logout guard
        
        // Actions
        login: async (credentials) => {
          console.log('🔐 [AUTH STORE] Starting login process...', credentials);
          set({ loading: true, error: null });
          
          try {
            const response = await api.post('/auth/login', credentials);
            console.log('🔐 [AUTH STORE] Login API response:', response.data);
            
            const { user, token, accessToken, refreshToken, permissions } = response.data.data;
            const finalToken = token || accessToken; // Handle both token formats
            console.log('🔐 [AUTH STORE] Extracted data:', { user, token: finalToken ? 'present' : 'missing', refreshToken: refreshToken ? 'present' : 'missing', permissions });
            
            // Set token in API headers
            api.defaults.headers.common['Authorization'] = `Bearer ${finalToken}`;
            
            const newState = {
              user,
              token: finalToken,
              refreshToken,
              permissions: permissions || [],
              isAuthenticated: true,
              loading: false,
              error: null
            };
            
            console.log('🔐 [AUTH STORE] Setting new auth state:', newState);
            set(newState);
            
            toast.success(`Welcome back, ${user.firstName || user.email}! 👋`);
            console.log('🔐 [AUTH STORE] Login completed successfully');
            return response.data.data;
            
          } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            set({
              loading: false,
              error: errorMessage,
              isAuthenticated: false
            });

            throw error;
          }
        },
        
        logout: async () => {
          // Prevent multiple simultaneous logout calls
          const { isLoggingOut } = get();
          if (isLoggingOut) {
            console.log('🔐 [AUTH STORE] Logout already in progress, skipping...');
            return;
          }
          
          set({ loading: true, isLoggingOut: true });
          
          try {
            await api.post('/auth/logout');
          } catch (error) {
            console.warn('🔐 [AUTH STORE] Logout API call failed:', error);
          } finally {
            // Clear auth data regardless of API call success
            delete api.defaults.headers.common['Authorization'];
            
            set({
              user: null,
              token: null,
              refreshToken: null,
              permissions: [],
              isAuthenticated: false,
              loading: false,
              error: null,
              isLoggingOut: false
            });
            
            toast.success('You have been logged out successfully');
          }
        },
        
        refreshToken: async () => {
          const { refreshToken } = get();
          if (!refreshToken) return false;
          
          try {
            const response = await api.post('/auth/refresh', { refreshToken });
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            
            set({
              token: accessToken,
              refreshToken: newRefreshToken
            });
            
            return true;
          } catch (error) {
            // Token refresh failed, logout user
            get().logout();
            return false;
          }
        },
        
        updateProfile: async (profileData) => {
          set({ loading: true });
          
          try {
            const response = await api.put('/auth/profile', profileData);
            const updatedUser = response.data.data?.user || response.data.user;
            
            set({
              user: updatedUser,
              loading: false
            });
            
            toast.success('Your profile has been updated successfully');
            return updatedUser;
            
          } catch (error) {
            const errorMessage = error.response?.data?.message || 'Unable to update your profile. Please try again.';
            set({ loading: false, error: errorMessage });
            toast.error(errorMessage);
            throw error;
          }
        },
        
        changePassword: async (passwordData) => {
          set({ loading: true });
          
          try {
            await api.put('/auth/change-password', passwordData);
            
            set({ loading: false });
            toast.success('Your password has been changed successfully');
            
          } catch (error) {
            const errorMessage = error.response?.data?.message || 'Unable to change your password. Please check your current password.';
            set({ loading: false, error: errorMessage });
            toast.error(errorMessage);
            throw error;
          }
        },
        
        forgotPassword: async (email) => {
          set({ loading: true });
          
          try {
            await api.post('/auth/forgot-password', { email });
            
            set({ loading: false });
            toast.success('Password reset email sent to your inbox');
            
          } catch (error) {
            const errorMessage = error.response?.data?.message || 'Unable to send reset email. Please check your email address.';
            set({ loading: false, error: errorMessage });
            toast.error(errorMessage);
            throw error;
          }
        },
        
        resetPassword: async (token, password) => {
          set({ loading: true });
          
          try {
            await api.post('/auth/reset-password', { token, password });
            
            set({ loading: false });
            toast.success('Your password has been reset successfully');
            
          } catch (error) {
            const errorMessage = error.response?.data?.message || 'Unable to reset your password. Please try again.';
            set({ loading: false, error: errorMessage });
            toast.error(errorMessage);
            throw error;
          }
        },
        
        clearError: () => set({ error: null }),
        
        // Computed getters
        get hasPermission() {
          return (permission) => {
            const { permissions, user } = get();
            if (user?.role === 'SuperAdmin') return true;
            return permissions.includes(permission);
          };
        },
        
        get hasRole() {
          return (roles) => {
            const { user } = get();
            if (!user) return false;
            const roleArray = Array.isArray(roles) ? roles : [roles];
            return roleArray.includes(user.role);
          };
        },
        
        get canAccessDepartment() {
          return (departmentId) => {
            const { user } = get();
            if (!user) return false;
            if (user.role === 'SuperAdmin' || user.role === 'HR Administrator') return true;
            if (user.role === 'HR Manager') {
              return user.assignedDepartments?.includes(departmentId);
            }
            return user.department === departmentId;
          };
        }
      }),
      {
        name: 'auth-storage', // localStorage key
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
          permissions: state.permissions
        })
      }
    ),
    {
      name: 'auth-store'
    }
  )
);

// Initialize auth on app start
const initializeAuth = () => {
  const { token } = useAuthStore.getState();
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// ✅ FIX: Set up token getter to avoid circular dependency
setAuthTokenGetter(
  () => useAuthStore.getState().token,
  () => useAuthStore.getState()
);

// Call on app initialization
initializeAuth();

export default useAuthStore;