import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import employeeDashboardService from '../../../../../services/employeeDashboardService';
import { leaveService } from '../../../../../services';
import useAuthStore from '../../../../../stores/useAuthStore';

/**
 * Dashboard Data Hook - Handles all data fetching logic
 * Extracted from EmployeeDashboard.jsx to separate concerns
 */
export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      console.log("📊 [DASHBOARD] Starting fetchDashboardData...");
      
      const { user, token, isAuthenticated } = useAuthStore.getState();
      console.log("🔐 [DASHBOARD] Auth state:", {
        isAuthenticated,
        hasUser: !!user,
        userRole: user?.role,
        hasToken: !!token,
        tokenLength: token?.length
      });
      
      const res = await employeeDashboardService.getDashboardData();
      if (process.env.NODE_ENV === 'development') {
        console.log("📊 [DASHBOARD] API Response:", res);
      }
      
      if (res.success && res.data) {
        setDashboardData(res.data);
        console.log("✅ [DASHBOARD] Real data loaded successfully");
      } else {
        console.warn('❌ [DASHBOARD] API returned error:', res.message);
        
        if (res.message?.includes('Authentication') || res.message?.includes('Unauthorized')) {
          toast.error("Session expired. Please login again.");
          const { logout } = useAuthStore.getState();
          logout();
          return;
        }
        
        toast.warn("Some dashboard data may be limited");
        setDashboardData({
          personalInfo: { firstName: "Employee", lastName: "" },
          employeeId: "EMP-001",
          jobInfo: { jobTitle: "Employee" },
          stats: { attendanceRate: 0, leaveRequests: 0 }
        });
      }
    } catch (error) {
      console.error('❌ [DASHBOARD] API error:', error);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        const { logout } = useAuthStore.getState();
        logout();
        return;
      } else if (error.response?.status === 403) {
        toast.error("Access denied. Contact administrator.");
        return;
      }
      
      toast.error("Failed to load dashboard data");
      setDashboardData({
        personalInfo: { firstName: "Employee", lastName: "" },
        employeeId: "EMP-001",
        jobInfo: { jobTitle: "Employee" },
        stats: { attendanceRate: 0, leaveRequests: 0 }
      });
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const res = await leaveService.getMyLeaveBalance();
      if (res.success) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [DASHBOARD] Leave balance API response:', res.data);
        }
        
        const transformedData = {};
        if (res.data?.leaveTypes && Array.isArray(res.data.leaveTypes)) {
          res.data.leaveTypes.forEach(leaveType => {
            const typeKey = leaveType.type.toLowerCase();
            transformedData[typeKey] = {
              remaining: leaveType.remaining,
              allocated: leaveType.allocated,
              used: leaveType.used,
              pending: leaveType.pending,
              available: leaveType.available,
              carryForward: leaveType.carryForward
            };
          });
        }
        
        setLeaveBalance(transformedData);
      } else {
        console.warn('Leave balance API returned error:', res.message);
        setLeaveBalance({
          casual: { remaining: 0, allocated: 0, used: 0 },
          sick: { remaining: 0, allocated: 0, used: 0 },
          annual: { remaining: 0, allocated: 0, used: 0 }
        });
      }
    } catch (error) {
      console.error('Leave balance API error:', error);
      setLeaveBalance({
        casual: { remaining: 0, allocated: 0, used: 0 },
        sick: { remaining: 0, allocated: 0, used: 0 },
        annual: { remaining: 0, allocated: 0, used: 0 }
      });
    }
  };

  const fetchAttendanceSummary = async () => {
    try {
      const res = await employeeDashboardService.getAttendanceSummary();
      if (process.env.NODE_ENV === 'development') {
        console.log('📈 [DASHBOARD] Attendance summary raw response:', res);
      }
      
      if (res.success && res.data) {
        console.log('✅ [DASHBOARD] Attendance summary data:', res.data);
        
        const now = new Date();
        const workingDaysInMonth = 22;
        const standardHoursPerDay = 8;
        const requiredHours = workingDaysInMonth * standardHoursPerDay;
        
        const normalizedData = {
          presentDays: res.data.presentDays ?? res.data.present ?? 0,
          absentDays: res.data.absentDays ?? res.data.absent ?? 0,
          leaveDays: res.data.leaveDays ?? res.data.leave ?? 0,
          lateDays: res.data.lateDays ?? res.data.late ?? 0,
          totalHours: Math.round(res.data.totalWorkHours ?? res.data.totalHours ?? res.data.workedHours ?? 0),
          requiredHours: res.data.requiredHours ?? requiredHours,
          totalDays: res.data.totalDays ?? res.data.totalWorkingDays ?? workingDaysInMonth
        };
        
        console.log('✅ [DASHBOARD] Normalized attendance data:', normalizedData);
        setAttendanceSummary(normalizedData);
      } else {
        console.warn('❌ [DASHBOARD] Attendance summary API error:', res.message);
        setAttendanceSummary({
          presentDays: 0,
          absentDays: 0,
          leaveDays: 0,
          lateDays: 0,
          totalHours: 0,
          requiredHours: 176,
          totalDays: 22
        });
      }
    } catch (error) {
      console.error('❌ [DASHBOARD] Attendance summary API error:', error);
      setAttendanceSummary({
        presentDays: 0,
        absentDays: 0,
        leaveDays: 0,
        lateDays: 0,
        totalHours: 0,
        requiredHours: 176,
        totalDays: 22
      });
    }
  };

  const refreshDashboard = async () => {
    setLoading(true);
    try {
      console.log('🔄 [DASHBOARD] Starting optimized refresh...');
      
      const essentialPromises = [
        fetchDashboardData(),
        fetchAttendanceSummary(),
      ];
      
      await Promise.allSettled(essentialPromises);
      
      const optionalPromises = [
        fetchLeaveBalance(),
      ];
      
      Promise.allSettled(optionalPromises).catch(error => {
        console.warn('❌ [DASHBOARD] Optional refresh data failed:', error);
      });
      
      toast.success('Dashboard refreshed successfully');
    } catch (error) {
      console.error('❌ [DASHBOARD] Refresh failed:', error);
      toast.error('Failed to refresh some data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCriticalData = async () => {
      setLoading(true);
      
      try {
        console.log('📊 [DASHBOARD] Starting optimized data fetch...');
        
        const criticalPromises = [
          fetchDashboardData(),
          fetchLeaveBalance(),
          fetchAttendanceSummary(),
        ];
        
        await Promise.allSettled(criticalPromises);
        
      } catch (criticalError) {
        console.error('❌ [DASHBOARD] Critical data failed:', criticalError);
      }
      
      setLoading(false);
    };

    fetchCriticalData();
  }, []);

  return {
    dashboardData,
    leaveBalance,
    attendanceSummary,
    loading,
    refreshDashboard,
    actions: {
      fetchDashboardData,
      fetchLeaveBalance,
      fetchAttendanceSummary
    }
  };
};