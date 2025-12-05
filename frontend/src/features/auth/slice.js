import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      console.log('🔄 [REDUX] loginStart action');
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      console.log('✅ [REDUX] loginSuccess action:', {
        user: action.payload.user,
        hasToken: !!action.payload.token,
        hasRefreshToken: !!action.payload.refreshToken
      });
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
      console.log('✅ [REDUX] Auth state updated, isAuthenticated:', state.isAuthenticated);
    },
    loginFailure: (state, action) => {
      console.log('❌ [REDUX] loginFailure action:', action.payload);
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = action.payload;
    },
    logout: (state) => {
      console.log('🚪 [REDUX] logout action');
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    updateToken: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateToken,
  updateUser,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
