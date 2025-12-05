/**
 * Custom hooks for Employee Self-Service features
 */

import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  fetchProfile,
  updateProfile,
  fetchBankDetails,
  updateBankDetails,
  fetchDocuments,
  uploadDocument,
  downloadDocument,
  fetchPayslips,
  fetchPayslipById,
  fetchLeaveBalance,
  fetchLeaveHistory,
  applyLeave,
  fetchAttendanceRecords,
  fetchAttendanceSummary,
  exportAttendanceReport,
  fetchRequests,
  createRequest,
  cancelRequest,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../../store/thunks/employeeSelfServiceThunks";

/**
 * Hook for profile management
 */
export const useProfile = () => {
  const dispatch = useDispatch();
  const { profile, profileLoading, profileError } = useSelector(
    (state) => state.employeeSelfService
  );

  const getProfile = useCallback(() => {
    return dispatch(fetchProfile());
  }, [dispatch]);

  const updateProfileData = useCallback(
    (data) => {
      return dispatch(updateProfile(data));
    },
    [dispatch]
  );

  return {
    profile,
    loading: profileLoading,
    error: profileError,
    getProfile,
    updateProfile: updateProfileData,
  };
};

/**
 * Hook for bank details management
 */
export const useBankDetails = () => {
  const dispatch = useDispatch();
  const { bankDetails, bankDetailsLoading, bankDetailsError } = useSelector(
    (state) => state.employeeSelfService
  );

  const getBankDetails = useCallback(() => {
    return dispatch(fetchBankDetails());
  }, [dispatch]);

  const updateBankDetailsData = useCallback(
    (data) => {
      return dispatch(updateBankDetails(data));
    },
    [dispatch]
  );

  return {
    bankDetails,
    loading: bankDetailsLoading,
    error: bankDetailsError,
    getBankDetails,
    updateBankDetails: updateBankDetailsData,
  };
};

/**
 * Hook for documents management
 */
export const useDocuments = () => {
  const dispatch = useDispatch();
  const { documents, documentsLoading, documentsError } = useSelector(
    (state) => state.employeeSelfService
  );

  const getDocuments = useCallback(() => {
    return dispatch(fetchDocuments());
  }, [dispatch]);

  const uploadDoc = useCallback(
    (formData) => {
      return dispatch(uploadDocument(formData));
    },
    [dispatch]
  );

  const downloadDoc = useCallback(
    (id) => {
      return dispatch(downloadDocument(id));
    },
    [dispatch]
  );

  return {
    documents,
    loading: documentsLoading,
    error: documentsError,
    getDocuments,
    uploadDocument: uploadDoc,
    downloadDocument: downloadDoc,
  };
};

/**
 * Hook for payslips
 */
export const usePayslips = () => {
  const dispatch = useDispatch();
  const { payslips, selectedPayslip, payslipsLoading, payslipsError } =
    useSelector((state) => state.employeeSelfService);

  const getPayslips = useCallback(
    (params) => {
      return dispatch(fetchPayslips(params));
    },
    [dispatch]
  );

  const getPayslipById = useCallback(
    (id) => {
      return dispatch(fetchPayslipById(id));
    },
    [dispatch]
  );

  return {
    payslips,
    selectedPayslip,
    loading: payslipsLoading,
    error: payslipsError,
    getPayslips,
    getPayslipById,
  };
};

/**
 * Hook for leave management
 */
export const useLeave = () => {
  const dispatch = useDispatch();
  const { leaveBalance, leaveHistory, leaveLoading, leaveError } = useSelector(
    (state) => state.employeeSelfService
  );

  const getLeaveBalance = useCallback(() => {
    return dispatch(fetchLeaveBalance());
  }, [dispatch]);

  const getLeaveHistory = useCallback(
    (params) => {
      return dispatch(fetchLeaveHistory(params));
    },
    [dispatch]
  );

  const submitLeaveApplication = useCallback(
    (data) => {
      return dispatch(applyLeave(data));
    },
    [dispatch]
  );

  return {
    leaveBalance,
    leaveHistory,
    loading: leaveLoading,
    error: leaveError,
    getLeaveBalance,
    getLeaveHistory,
    applyLeave: submitLeaveApplication,
  };
};

/**
 * Hook for attendance
 */
export const useAttendance = () => {
  const dispatch = useDispatch();
  const {
    attendanceRecords,
    attendanceSummary,
    attendanceLoading,
    attendanceError,
  } = useSelector((state) => state.employeeSelfService);

  const getAttendanceRecords = useCallback(
    (params) => {
      return dispatch(fetchAttendanceRecords(params));
    },
    [dispatch]
  );

  const getAttendanceSummary = useCallback(
    (month, year) => {
      return dispatch(fetchAttendanceSummary({ month, year }));
    },
    [dispatch]
  );

  const downloadReport = useCallback(
    (month, year) => {
      return dispatch(exportAttendanceReport({ month, year }));
    },
    [dispatch]
  );

  return {
    attendanceRecords,
    attendanceSummary,
    loading: attendanceLoading,
    error: attendanceError,
    getAttendanceRecords,
    getAttendanceSummary,
    exportReport: downloadReport,
  };
};

/**
 * Hook for requests management
 */
export const useRequests = () => {
  const dispatch = useDispatch();
  const { requests, selectedRequest, requestsLoading, requestsError } =
    useSelector((state) => state.employeeSelfService);

  const getRequests = useCallback(
    (params) => {
      return dispatch(fetchRequests(params));
    },
    [dispatch]
  );

  const submitRequest = useCallback(
    (data) => {
      return dispatch(createRequest(data));
    },
    [dispatch]
  );

  const cancelRequestById = useCallback(
    (id) => {
      return dispatch(cancelRequest(id));
    },
    [dispatch]
  );

  return {
    requests,
    selectedRequest,
    loading: requestsLoading,
    error: requestsError,
    getRequests,
    createRequest: submitRequest,
    cancelRequest: cancelRequestById,
  };
};

/**
 * Hook for notifications
 */
export const useNotifications = () => {
  const dispatch = useDispatch();
  const {
    notifications,
    unreadCount,
    notificationsLoading,
    notificationsError,
  } = useSelector((state) => state.employeeSelfService);

  const getNotifications = useCallback(
    (params) => {
      return dispatch(fetchNotifications(params));
    },
    [dispatch]
  );

  const markAsRead = useCallback(
    (id) => {
      return dispatch(markNotificationAsRead(id));
    },
    [dispatch]
  );

  const markAllAsRead = useCallback(() => {
    return dispatch(markAllNotificationsAsRead());
  }, [dispatch]);

  return {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    error: notificationsError,
    getNotifications,
    markAsRead,
    markAllAsRead,
  };
};

/**
 * Hook for dashboard data
 */
export const useDashboard = () => {
  const { dashboardStats, dashboardLoading, dashboardError } = useSelector(
    (state) => state.employeeSelfService
  );

  return {
    stats: dashboardStats,
    loading: dashboardLoading,
    error: dashboardError,
  };
};
