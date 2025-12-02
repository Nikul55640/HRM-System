/**
 * Employee Self-Service Store
 * Using Redux Toolkit since it's already in the project
 * This provides centralized state management for ESS features
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Profile
  profile: null,
  profileLoading: false,
  profileError: null,
  
  // Bank Details
  bankDetails: null,
  bankDetailsLoading: false,
  bankDetailsError: null,
  
  // Documents
  documents: [],
  documentsLoading: false,
  documentsError: null,
  
  // Payslips
  payslips: [],
  payslipsLoading: false,
  payslipsError: null,
  selectedPayslip: null,
  
  // Leave Balance
  leaveBalance: [], // Array of leave types
  leaveHistory: [],
  leaveLoading: false,
  leaveError: null,
  
  // Attendance
  attendanceRecords: [],
  attendanceSummary: null,
  attendanceLoading: false,
  attendanceError: null,
  
  // Requests
  requests: [],
  requestsLoading: false,
  requestsError: null,
  selectedRequest: null,
  
  // Notifications
  notifications: [],
  unreadCount: 0,
  notificationsLoading: false,
  notificationsError: null,
  
  // Dashboard
  dashboardStats: null,
  dashboardLoading: false,
  dashboardError: null,
};

const employeeSelfServiceSlice = createSlice({
  name: 'employeeSelfService',
  initialState,
  reducers: {
    // Profile actions
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.profileError = null;
    },
    setProfileLoading: (state, action) => {
      state.profileLoading = action.payload;
    },
    setProfileError: (state, action) => {
      state.profileError = action.payload;
      state.profileLoading = false;
    },
    
    // Bank Details actions
    setBankDetails: (state, action) => {
      state.bankDetails = action.payload;
      state.bankDetailsError = null;
    },
    setBankDetailsLoading: (state, action) => {
      state.bankDetailsLoading = action.payload;
    },
    setBankDetailsError: (state, action) => {
      state.bankDetailsError = action.payload;
      state.bankDetailsLoading = false;
    },
    
    // Documents actions
    setDocuments: (state, action) => {
      state.documents = action.payload;
      state.documentsError = null;
    },
    addDocument: (state, action) => {
      state.documents.push(action.payload);
    },
    setDocumentsLoading: (state, action) => {
      state.documentsLoading = action.payload;
    },
    setDocumentsError: (state, action) => {
      state.documentsError = action.payload;
      state.documentsLoading = false;
    },
    
    // Payslips actions
    setPayslips: (state, action) => {
      state.payslips = action.payload;
      state.payslipsError = null;
    },
    setSelectedPayslip: (state, action) => {
      state.selectedPayslip = action.payload;
    },
    setPayslipsLoading: (state, action) => {
      state.payslipsLoading = action.payload;
    },
    setPayslipsError: (state, action) => {
      state.payslipsError = action.payload;
      state.payslipsLoading = false;
    },
    
    // Leave actions
    setLeaveBalance: (state, action) => {
      state.leaveBalance = action.payload;
      state.leaveError = null;
    },
    setLeaveHistory: (state, action) => {
      state.leaveHistory = action.payload;
      state.leaveError = null;
    },
    setLeaveLoading: (state, action) => {
      state.leaveLoading = action.payload;
    },
    setLeaveError: (state, action) => {
      state.leaveError = action.payload;
      state.leaveLoading = false;
    },
    
    // Attendance actions
    setAttendanceRecords: (state, action) => {
      state.attendanceRecords = action.payload;
      state.attendanceError = null;
    },
    setAttendanceSummary: (state, action) => {
      state.attendanceSummary = action.payload;
      state.attendanceError = null;
    },
    setAttendanceLoading: (state, action) => {
      state.attendanceLoading = action.payload;
    },
    setAttendanceError: (state, action) => {
      state.attendanceError = action.payload;
      state.attendanceLoading = false;
    },
    
    // Requests actions
    setRequests: (state, action) => {
      state.requests = action.payload;
      state.requestsError = null;
    },
    addRequest: (state, action) => {
      state.requests.unshift(action.payload);
    },
    updateRequest: (state, action) => {
      const index = state.requests.findIndex(r => r._id === action.payload._id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
    },
    setSelectedRequest: (state, action) => {
      state.selectedRequest = action.payload;
    },
    setRequestsLoading: (state, action) => {
      state.requestsLoading = action.payload;
    },
    setRequestsError: (state, action) => {
      state.requestsError = action.payload;
      state.requestsLoading = false;
    },
    
    // Notifications actions
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
      state.notificationsError = null;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(n => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    setNotificationsLoading: (state, action) => {
      state.notificationsLoading = action.payload;
    },
    setNotificationsError: (state, action) => {
      state.notificationsError = action.payload;
      state.notificationsLoading = false;
    },
    
    // Dashboard actions
    setDashboardStats: (state, action) => {
      state.dashboardStats = action.payload;
      state.dashboardError = null;
    },
    setDashboardLoading: (state, action) => {
      state.dashboardLoading = action.payload;
    },
    setDashboardError: (state, action) => {
      state.dashboardError = action.payload;
      state.dashboardLoading = false;
    },
    
    // Clear all data (on logout)
    clearEmployeeSelfServiceData: () => initialState,
  },
});

export const {
  setProfile,
  setProfileLoading,
  setProfileError,
  setBankDetails,
  setBankDetailsLoading,
  setBankDetailsError,
  setDocuments,
  addDocument,
  setDocumentsLoading,
  setDocumentsError,
  setPayslips,
  setSelectedPayslip,
  setPayslipsLoading,
  setPayslipsError,
  setLeaveBalance,
  setLeaveHistory,
  setLeaveLoading,
  setLeaveError,
  setAttendanceRecords,
  setAttendanceSummary,
  setAttendanceLoading,
  setAttendanceError,
  setRequests,
  addRequest,
  updateRequest,
  setSelectedRequest,
  setRequestsLoading,
  setRequestsError,
  setNotifications,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  setNotificationsLoading,
  setNotificationsError,
  setDashboardStats,
  setDashboardLoading,
  setDashboardError,
  clearEmployeeSelfServiceData,
} = employeeSelfServiceSlice.actions;

export default employeeSelfServiceSlice.reducer;
