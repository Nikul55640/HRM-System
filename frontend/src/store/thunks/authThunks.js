import { authService } from '../../services';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  updateToken,
} from '../slices/authSlice';
import { addNotification } from '../slices/uiSlice';

// Login thunk
export const login = (email, password) => async (dispatch) => {
  try {
    console.log('🔐 [AUTH] Login attempt started for:', email);
    dispatch(loginStart());

    const data = await authService.login(email, password);
    console.log('✅ [AUTH] Login API response received:', { 
      hasToken: !!data.token, 
      hasRefreshToken: !!data.refreshToken,
      hasUser: !!data.user,
      user: data.user 
    });

    // Store in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    console.log('💾 [AUTH] Tokens and user stored in localStorage');

    dispatch(loginSuccess({
      user: data.user,
      token: data.token,
      refreshToken: data.refreshToken,
    }));
    console.log('✅ [AUTH] Login success dispatched to Redux store');

    dispatch(addNotification({
      type: 'success',
      message: 'Login successful!',
    }));

    return { success: true };
  } catch (error) {
    console.error('❌ [AUTH] Login failed:', error);
    dispatch(loginFailure(error.message || 'Login failed'));
    dispatch(addNotification({
      type: 'error',
      message: error.message || 'Login failed. Please check your credentials.',
    }));
    return { success: false, error: error.message };
  }
};

// Logout thunk
export const logout = () => async (dispatch) => {
  try {
    await authService.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    dispatch(logoutAction());

    dispatch(addNotification({
      type: 'info',
      message: 'You have been logged out.',
    }));
  }
};

// Initialize auth from localStorage
export const initializeAuth = () => (dispatch) => {
  try {
    console.log('🔄 [AUTH] Initializing auth from localStorage...');
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');

    console.log('📦 [AUTH] LocalStorage values:', {
      hasToken: !!token,
      tokenValue: token?.substring(0, 20) + '...',
      hasRefreshToken: !!refreshToken,
      hasUser: !!userStr,
      userStr: userStr?.substring(0, 50) + '...'
    });

    // Check if all values exist and are valid (not null, not "undefined" string)
    if (token && token !== 'undefined' && 
        refreshToken && refreshToken !== 'undefined' && 
        userStr && userStr !== 'undefined') {
      const user = JSON.parse(userStr);
      console.log('✅ [AUTH] Valid auth data found, restoring session for:', user.email);

      dispatch(loginSuccess({
        user,
        token,
        refreshToken,
      }));
      console.log('✅ [AUTH] Session restored successfully');
    } else {
      console.log('⚠️ [AUTH] No valid auth data found, clearing localStorage');
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  } catch (error) {
    console.error('❌ [AUTH] Error initializing auth:', error);
    // Clear invalid data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

// Refresh token thunk
export const refreshAuthToken = (refreshToken) => async (dispatch) => {
  try {
    const data = await authService.refreshToken(refreshToken);

    // Update localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);

    dispatch(updateToken({
      token: data.token,
      refreshToken: data.refreshToken,
    }));

    return { success: true };
  } catch (error) {
    // If refresh fails, logout user
    dispatch(logout());
    return { success: false };
  }
};

// Register thunk (for initial setup)
export const register = (userData) => async (dispatch) => {
  try {
    dispatch(loginStart());

    const data = await authService.register(userData);

    // Store in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));

    dispatch(loginSuccess({
      user: data.user,
      token: data.token,
      refreshToken: data.refreshToken,
    }));

    dispatch(addNotification({
      type: 'success',
      message: 'Registration successful!',
    }));

    return { success: true };
  } catch (error) {
    dispatch(loginFailure(error.message || 'Registration failed'));
    dispatch(addNotification({
      type: 'error',
      message: error.message || 'Registration failed.',
    }));
    return { success: false, error: error.message };
  }
};

// Request password reset
export const requestPasswordReset = (email) => async (dispatch) => {
  try {
    await authService.requestPasswordReset(email);

    dispatch(addNotification({
      type: 'success',
      message: 'Password reset instructions sent to your email.',
    }));

    return { success: true };
  } catch (error) {
    dispatch(addNotification({
      type: 'error',
      message: error.message || 'Failed to send password reset email.',
    }));
    return { success: false, error: error.message };
  }
};

// Reset password
export const resetPassword = (token, newPassword) => async (dispatch) => {
  try {
    await authService.resetPassword(token, newPassword);

    dispatch(addNotification({
      type: 'success',
      message: 'Password reset successful. Please login with your new password.',
    }));

    return { success: true };
  } catch (error) {
    dispatch(addNotification({
      type: 'error',
      message: error.message || 'Failed to reset password.',
    }));
    return { success: false, error: error.message };
  }
};
