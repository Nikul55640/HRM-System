import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/slice';
import employeeReducer from './slices/employeeSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';
import payrollReducer from './slices/payrollSlice';
import employeeSelfServiceReducer from './employeeSelfServiceStore';

const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    ui: uiReducer,
    notifications: notificationReducer,
    payroll: payrollReducer,
    employeeSelfService: employeeSelfServiceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
