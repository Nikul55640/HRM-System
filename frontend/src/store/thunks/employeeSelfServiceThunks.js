/**
 * Employee Self-Service Thunks
 * Async actions for ESS features
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import employeeSelfService from "../../services/employeeSelfService";
import {
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
  setRequestsLoading,
  setRequestsError,
  setNotifications,
  markNotificationAsRead as markNotificationAsReadAction,
  markAllNotificationsAsRead as markAllNotificationsAsReadAction,
  setNotificationsLoading,
  setNotificationsError,
} from "../employeeSelfServiceStore";

// Profile Thunks
export const fetchProfile = createAsyncThunk(
  "ess/fetchProfile",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setProfileLoading(true));
      const data = await employeeSelfService.profile.get();
      dispatch(setProfile(data));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setProfileError(message));
      return rejectWithValue(message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "ess/updateProfile",
  async (profileData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setProfileLoading(true));
      const data = await employeeSelfService.profile.update(profileData);
      dispatch(setProfile(data));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setProfileError(message));
      return rejectWithValue(message);
    }
  }
);

// Bank Details Thunks
export const fetchBankDetails = createAsyncThunk(
  "ess/fetchBankDetails",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setBankDetailsLoading(true));

      const data = await employeeSelfService.bankDetails.get();

      // If backend returns empty or undefined
      if (!data) {
        const empty = {
          bankName: "",
          accountNumber: "",
          ifsc: "",
          branch: "",
          upiId: "",
        };
        dispatch(setBankDetails(empty));
        return empty;
      }

      dispatch(setBankDetails(data));
      return data;
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      // 🔥 Handle 404 (No bank details yet)
      if (status === 404) {
        const empty = {
          bankName: "",
          accountNumber: "",
          ifsc: "",
          branch: "",
          upiId: "",
        };
        dispatch(setBankDetails(empty));
        return empty;
      }

      dispatch(setBankDetailsError(message));
      return rejectWithValue(message);
    }
  }
);

export const updateBankDetails = createAsyncThunk(
  "ess/updateBankDetails",
  async (bankData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setBankDetailsLoading(true));
      const data = await employeeSelfService.bankDetails.update(bankData);
      dispatch(setBankDetails(data));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setBankDetailsError(message));
      return rejectWithValue(message);
    }
  }
);

// Documents Thunks
export const fetchDocuments = createAsyncThunk(
  "ess/fetchDocuments",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setDocumentsLoading(true));
      const data = await employeeSelfService.documents.list();
      dispatch(setDocuments(data));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setDocumentsError(message));
      return rejectWithValue(message);
    }
  }
);

export const uploadDocument = createAsyncThunk(
  "ess/uploadDocument",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setDocumentsLoading(true));
      const data = await employeeSelfService.documents.upload(formData);
      dispatch(addDocument(data));
      dispatch(setDocumentsLoading(false));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setDocumentsError(message));
      return rejectWithValue(message);
    }
  }
);

export const downloadDocument = createAsyncThunk(
  "ess/downloadDocument",
  async (documentId, { dispatch, rejectWithValue }) => {
    try {
      const data = await employeeSelfService.documents.download(documentId);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setDocumentsError(message));
      return rejectWithValue(message);
    }
  }
);

// Payslips Thunks
export const fetchPayslips = createAsyncThunk(
  "ess/fetchPayslips",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setPayslipsLoading(true));
      const data = await employeeSelfService.payslips.list(params);
      dispatch(setPayslips(data));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setPayslipsError(message));
      return rejectWithValue(message);
    }
  }
);

export const fetchPayslipById = createAsyncThunk(
  "ess/fetchPayslipById",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setPayslipsLoading(true));
      const data = await employeeSelfService.payslips.getById(id);
      dispatch(setSelectedPayslip(data));
      dispatch(setPayslipsLoading(false));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setPayslipsError(message));
      return rejectWithValue(message);
    }
  }
);

// Leave Thunks
export const fetchLeaveBalance = createAsyncThunk(
  "ess/fetchLeaveBalance",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLeaveLoading(true));
      const response = await employeeSelfService.leave.getBalance();
      // Extract leaveTypes array from the response
      const leaveTypes = response.data?.leaveTypes || [];
      dispatch(setLeaveBalance(leaveTypes));
      dispatch(setLeaveLoading(false));
      return leaveTypes;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setLeaveError(message));
      return rejectWithValue(message);
    }
  }
);

export const fetchLeaveHistory = createAsyncThunk(
  "ess/fetchLeaveHistory",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLeaveLoading(true));
      const response = await employeeSelfService.leave.getHistory(params);
      // Extract history array from the response
      const history = response.data || [];
      dispatch(setLeaveHistory(history));
      dispatch(setLeaveLoading(false));
      return history;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setLeaveError(message));
      return rejectWithValue(message);
    }
  }
);

export const applyLeave = createAsyncThunk(
  "ess/applyLeave",
  async (leaveData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLeaveLoading(true));
      const data = await employeeSelfService.leave.apply(leaveData);
      // Refresh balance and history after successful application
      dispatch(fetchLeaveBalance());
      dispatch(fetchLeaveHistory());
      dispatch(setLeaveLoading(false));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setLeaveError(message));
      return rejectWithValue(message);
    }
  }
);

// Attendance Thunks
export const fetchAttendanceRecords = createAsyncThunk(
  "ess/fetchAttendanceRecords",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAttendanceLoading(true));
      const data = await employeeSelfService.attendance.getRecords(params);
      dispatch(setAttendanceRecords(data));
      dispatch(setAttendanceLoading(false));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setAttendanceError(message));
      return rejectWithValue(message);
    }
  }
);

export const fetchAttendanceSummary = createAsyncThunk(
  "ess/fetchAttendanceSummary",
  async ({ month, year }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAttendanceLoading(true));
      const data = await employeeSelfService.attendance.getSummary(month, year);
      dispatch(setAttendanceSummary(data));
      dispatch(setAttendanceLoading(false));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setAttendanceError(message));
      return rejectWithValue(message);
    }
  }
);

export const exportAttendanceReport = createAsyncThunk(
  "ess/exportAttendanceReport",
  async ({ month, year }, { dispatch, rejectWithValue }) => {
    try {
      // No loading state change needed for download, or use a separate one
      const data = await employeeSelfService.attendance.exportReport(
        month,
        year
      );
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setAttendanceError(message));
      return rejectWithValue(message);
    }
  }
);

// Requests Thunks
export const fetchRequests = createAsyncThunk(
  "ess/fetchRequests",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setRequestsLoading(true));
      const data = await employeeSelfService.requests.list(params);
      dispatch(setRequests(data));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setRequestsError(message));
      return rejectWithValue(message);
    }
  }
);

export const createRequest = createAsyncThunk(
  "ess/createRequest",
  async (requestData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setRequestsLoading(true));
      const data = await employeeSelfService.requests.create(requestData);
      dispatch(addRequest(data));
      dispatch(setRequestsLoading(false));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setRequestsError(message));
      return rejectWithValue(message);
    }
  }
);

export const cancelRequest = createAsyncThunk(
  "ess/cancelRequest",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setRequestsLoading(true));
      const data = await employeeSelfService.requests.cancel(id);
      dispatch(updateRequest(data));
      dispatch(setRequestsLoading(false));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setRequestsError(message));
      return rejectWithValue(message);
    }
  }
);

// Notifications Thunks
export const fetchNotifications = createAsyncThunk(
  "ess/fetchNotifications",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setNotificationsLoading(true));
      const data = await employeeSelfService.notifications.list(params);
      dispatch(setNotifications(data));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      dispatch(setNotificationsError(message));
      return rejectWithValue(message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "ess/markNotificationAsRead",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await employeeSelfService.notifications.markAsRead(id);
      dispatch(markNotificationAsReadAction(id));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "ess/markAllNotificationsAsRead",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await employeeSelfService.notifications.markAllAsRead();
      dispatch(markAllNotificationsAsReadAction());
      return true;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);
