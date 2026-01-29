import { useCallback, useState } from "react";
import employeeSelfService from "./employeeSelfService";
import useAuthStore from "../stores/useAuthStore";

/**
 * Custom hooks for Employee Self-Service features (Zustand Version)
 */

/**
 * Hook for profile management
 */
export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const getProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const result = await employeeSelfService.profile.get();
      console.log('👤 [USE PROFILE] Profile API response:', result);

      // ⭐ FIX: extract actual profile object with multiple fallback patterns
      const userProfile = result?.data?.data || result?.data || result;

      console.log('👤 [USE PROFILE] Extracted profile:', userProfile);
      setProfile(userProfile);
      return userProfile;
    } catch (error) {
      setProfileError(error.message);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const updateProfileData = useCallback(async (data) => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const result = await employeeSelfService.profile.update(data);
      const updatedProfile = result?.data || result;
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      setProfileError(error.message);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  }, []);

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
  const [bankDetails, setBankDetails] = useState(null);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
  const [bankDetailsError, setBankDetailsError] = useState(null);

  const getBankDetails = useCallback(async () => {
    setBankDetailsLoading(true);
    setBankDetailsError(null);
    try {
      const result = await employeeSelfService.bankDetails.get();
      console.log('🏦 [USE BANK DETAILS] Bank details API response:', result);
      
      // Handle multiple response structures
      const bankData = result?.data?.data || result?.data || result;
      console.log('🏦 [USE BANK DETAILS] Extracted bank data:', bankData);
      
      setBankDetails(bankData);
      return bankData;
    } catch (error) {
      setBankDetailsError(error.message);
      throw error;
    } finally {
      setBankDetailsLoading(false);
    }
  }, []);

  const updateBankDetailsData = useCallback(async (data) => {
    setBankDetailsLoading(true);
    setBankDetailsError(null);
    try {
      const result = await employeeSelfService.bankDetails.update(data);
      setBankDetails(result);
      return result;
    } catch (error) {
      setBankDetailsError(error.message);
      throw error;
    } finally {
      setBankDetailsLoading(false);
    }
  }, []);

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
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState(null);

  const getDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    setDocumentsError(null);
    try {
      const result = await employeeSelfService.documents.list();
      const list = Array.isArray(result?.data) ? result.data : [];
      setDocuments(list);
      return list;
    } catch (error) {
      setDocumentsError(error.message);
      throw error;
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  const uploadDoc = useCallback(
    async (formData) => {
      setDocumentsLoading(true);
      setDocumentsError(null);
      try {
        const result = await employeeSelfService.documents.upload(formData);
        // Refresh documents list
        await getDocuments();
        return result;
      } catch (error) {
        setDocumentsError(error.message);
        throw error;
      } finally {
        setDocumentsLoading(false);
      }
    },
    [getDocuments]
  );

  const downloadDoc = useCallback(async (id) => {
    try {
      const result = await employeeSelfService.documents.download(id);
      return result;
    } catch (error) {
      setDocumentsError(error.message);
      throw error;
    }
  }, []);

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
  const [payslips, setPayslips] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [payslipsLoading, setPayslipsLoading] = useState(false);
  const [payslipsError, setPayslipsError] = useState(null);

  const getPayslips = useCallback(async (params) => {
    setPayslipsLoading(true);
    setPayslipsError(null);
    try {
      const result = await employeeSelfService.payslips.list(params);
      

      // ✅ Your backend returns { success, count, data: [...] }
      const list = Array.isArray(result?.data) ? result.data : [];

      setPayslips(list); // always an array
      return list;
    } catch (error) {
      setPayslipsError(error.message);
      throw error;
    } finally {
      setPayslipsLoading(false);
    }
  }, []);

  const getPayslipById = useCallback(async (id) => {
    setPayslipsLoading(true);
    setPayslipsError(null);
    try {
      const result = await employeeSelfService.payslips.getById(id);
      setSelectedPayslip(result);
      return result;
    } catch (error) {
      setPayslipsError(error.message);
      throw error;
    } finally {
      setPayslipsLoading(false);
    }
  }, []);

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
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState(null);

  const getLeaveBalance = useCallback(async () => {
    setLeaveLoading(true);
    setLeaveError(null);
    try {
      const result = await employeeSelfService.leave.getBalance();
      setLeaveBalance(result);
      return result;
    } catch (error) {
      setLeaveError(error.message);
      throw error;
    } finally {
      setLeaveLoading(false);
    }
  }, []);

  const getLeaveHistory = useCallback(async (params) => {
    setLeaveLoading(true);
    setLeaveError(null);
    try {
      const result = await employeeSelfService.leave.getHistory(params);
      setLeaveHistory(result);
      return result;
    } catch (error) {
      setLeaveError(error.message);
      throw error;
    } finally {
      setLeaveLoading(false);
    }
  }, []);

  const submitLeaveApplication = useCallback(
    async (data) => {
      setLeaveLoading(true);
      setLeaveError(null);
      try {
        const result = await employeeSelfService.leave.apply(data);
        // Refresh leave history after applying
        await getLeaveHistory();
        return result;
      } catch (error) {
        setLeaveError(error.message);
        throw error;
      } finally {
        setLeaveLoading(false);
      }
    },
    [getLeaveHistory]
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
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);

  const getAttendanceRecords = useCallback(async (params) => {
    setAttendanceLoading(true);
    setAttendanceError(null);
    try {
      const result = await employeeSelfService.attendance.getRecords(params);
      console.log('⏰ [USE ATTENDANCE] Records API response:', result);
      
      // 🔧 CRITICAL FIX: Handle the new response format
      // Backend now returns: { success: true, data: [...], pagination: {...} }
      const records = Array.isArray(result?.data) ? result.data : [];
      console.log('⏰ [USE ATTENDANCE] Extracted records:', records);
      
      setAttendanceRecords(records);
      return records;
    } catch (error) {
      setAttendanceError(error.message);
      throw error;
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  const getAttendanceSummary = useCallback(async (month, year) => {
    setAttendanceLoading(true);
    setAttendanceError(null);
    try {
      const result = await employeeSelfService.attendance.getSummary(
        month,
        year
      );
      console.log('📊 [USE ATTENDANCE] Summary API response:', result);
      
      // Extract the data from the response with multiple fallback patterns
      const summary = result?.data?.data || result?.data || result;
      console.log('📊 [USE ATTENDANCE] Extracted summary:', summary);
      
      // Normalize attendance summary to handle different field names
      const normalizedSummary = {
        presentDays: summary?.presentDays ?? 0,
        absentDays: summary?.absentDays ?? 0, // ✅ NEW: Actual absent days
        leaveDays: summary?.leaveDays ?? 0, // ✅ Approved leave days
        lateDays: summary?.lateDays ?? 0,
        halfDays: summary?.halfDays ?? 0,
        holidayDays: summary?.holidayDays ?? 0,
        totalWorkHours: summary?.totalWorkHours ?? 0,
        totalOvertimeHours: summary?.totalOvertimeHours ?? 0,
        totalWorkedMinutes: summary?.totalWorkedMinutes ?? 0,
        totalBreakMinutes: summary?.totalBreakMinutes ?? 0,
        averageWorkHours: summary?.averageWorkHours ?? 0,
        totalDays: summary?.totalDays ?? 0,
        earlyDepartures: summary?.earlyDepartures ?? 0,
        incompleteDays: summary?.incompleteDays ?? 0,
        totalLateMinutes: summary?.totalLateMinutes ?? 0,
        totalEarlyExitMinutes: summary?.totalEarlyExitMinutes ?? 0
      };
      
      console.log('📊 [USE ATTENDANCE] Normalized summary:', normalizedSummary);
      setAttendanceSummary(normalizedSummary);
      return normalizedSummary;
    } catch (error) {
      setAttendanceError(error.message);
      throw error;
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  const downloadReport = useCallback(async (month, year) => {
    setAttendanceLoading(true);
    setAttendanceError(null);
    try {
      const result = await employeeSelfService.attendance.exportReport(
        month,
        year
      );
      return { meta: { requestStatus: 'fulfilled' }, payload: result };
    } catch (error) {
      setAttendanceError(error.message);
      return { meta: { requestStatus: 'rejected' }, payload: error.message };
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

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
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState(null);

  const getRequests = useCallback(async (params) => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const result = await employeeSelfService.requests.list(params);

      // ⭐ FIX: Extract array
      const list = Array.isArray(result?.data) ? result.data : [];

      setRequests(list);
      return list;
    } catch (error) {
      setRequestsError(error.message);
      throw error;
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const submitRequest = useCallback(async (data) => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const result = await employeeSelfService.requests.create(data);
      return result;
    } catch (error) {
      setRequestsError(error.message);
      throw error;
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const cancelRequestById = useCallback(
    async (id) => {
      setRequestsLoading(true);
      setRequestsError(null);
      try {
        const result = await employeeSelfService.requests.cancel(id);
        // Refresh requests list
        await getRequests();
        return result;
      } catch (error) {
        setRequestsError(error.message);
        throw error;
      } finally {
        setRequestsLoading(false);
      }
    },
    [getRequests]
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
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);

  const getNotifications = useCallback(async (params) => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const result = await employeeSelfService.notifications.list(params);
      if (process.env.NODE_ENV === 'development') {
        console.log('🔔 [USE NOTIFICATIONS] Full API response:', result);
      }
      
      // ✅ FIX: Extract notifications array correctly
      // Backend returns: { success: true, data: { notifications: [...], pagination: {...} } }
      const list = result?.data?.notifications || result?.data?.data || result?.data || [];
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔔 [USE NOTIFICATIONS] Extracted notifications array:', list);
        console.log('🔔 [USE NOTIFICATIONS] Count:', list.length);
      }
      
      setNotifications(list);
      
      // Also update unread count if available
      const unread = list.filter(n => !n.isRead && !n.read).length;
      setUnreadCount(unread);
      
      return list;
    } catch (error) {
      setNotificationsError(error.message);
      console.error('🔔 [USE NOTIFICATIONS] Error:', error);
      throw error;
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      const result = await employeeSelfService.notifications.markAsRead(id);
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return result;
    } catch (error) {
      setNotificationsError(error.message);
      throw error;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const result = await employeeSelfService.notifications.markAllAsRead();
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      return result;
    } catch (error) {
      setNotificationsError(error.message);
      throw error;
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

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
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  const getDashboardStats = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      // Fetch multiple data sources for dashboard
      const [profile, leaveBalance, attendanceSummary] = await Promise.all([
        employeeSelfService.profile.get(),
        employeeSelfService.leave.getBalance(),
        employeeSelfService.attendance.getSummary(
          new Date().getMonth() + 1,
          new Date().getFullYear()
        ),
      ]);

      const stats = {
        profile,
        leaveBalance,
        attendanceSummary,
      };

      setDashboardStats(stats);
      return stats;
    } catch (error) {
      setDashboardError(error.message);
      throw error;
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  return {
    stats: dashboardStats,
    loading: dashboardLoading,
    error: dashboardError,
    getDashboardStats,
  };
};
