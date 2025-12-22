import api from '../core/api/api';
import { API_ENDPOINTS } from '../core/constants/apiEndpoints';
import { format, addDays, startOfWeek, endOfWeek,parseISO } from 'date-fns';

const employeeDashboardService = {
  /**
   * Get complete employee dashboard data
   * Aggregates data from multiple endpoints
   */
  getDashboardData: async () => {
    try {
      console.log('📊 [EMPLOYEE DASHBOARD SERVICE] Fetching dashboard data...');

      // Fetch all data in parallel for better performance
      const [profileRes, attendanceRes, leaveBalanceRes, leaveHistoryRes] = await Promise.allSettled([
        api.get(API_ENDPOINTS.EMPLOYEE.PROFILE),
        api.get(API_ENDPOINTS.EMPLOYEE.ATTENDANCE_SUMMARY),
        api.get(API_ENDPOINTS.EMPLOYEE.LEAVE_BALANCE),
        api.get(API_ENDPOINTS.EMPLOYEE.LEAVE_HISTORY),
      ]);

      // Extract data safely
      const profileData = profileRes.status === 'fulfilled' ? profileRes.value.data?.data : null;
      const attendanceData = attendanceRes.status === 'fulfilled' ? attendanceRes.value.data?.data : null;
      const leaveBalanceData = leaveBalanceRes.status === 'fulfilled' ? leaveBalanceRes.value.data?.data : null;
      const leaveHistoryData = leaveHistoryRes.status === 'fulfilled' ? leaveHistoryRes.value.data?.data : null;

      console.log('📊 [EMPLOYEE DASHBOARD SERVICE] Extracted data:', {
        profileData,
        attendanceData,
        leaveBalanceData,
        leaveHistoryData,
      });

      // Calculate attendance rate from last 30 days
      const attendanceRate = attendanceData?.attendanceRate || 0;

      // Count approved leaves in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentLeaves = (leaveHistoryData || []).filter(leave => {
        const leaveDate = new Date(leave.startDate);
        return leave.status === 'approved' && leaveDate >= thirtyDaysAgo;
      });

      // Get this week's date range
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday

      // Get week events (leaves and holidays for current user)
      const weekEvents = [];
      const userLeaves = (leaveHistoryData || []).filter(leave => {
        const startDate = parseISO(leave.startDate);
        const endDate = parseISO(leave.endDate);
        return (
          leave.status === 'approved' &&
          ((startDate >= weekStart && startDate <= weekEnd) ||
            (endDate >= weekStart && endDate <= weekEnd) ||
            (startDate <= weekStart && endDate >= weekEnd))
        );
      });

      userLeaves.forEach(leave => {
        const startDate = parseISO(leave.startDate);
        const endDate = parseISO(leave.endDate);
        let currentDate = startDate < weekStart ? weekStart : startDate;
        const lastDate = endDate > weekEnd ? weekEnd : endDate;

        while (currentDate <= lastDate) {
          weekEvents.push({
            date: format(currentDate, 'yyyy-MM-dd'),
            event: leave.leaveType || 'Leave',
            color: 'text-orange-600',
          });
          currentDate = addDays(currentDate, 1);
        }
      });

      // Build dashboard data structure
      const dashboardData = {
        personalInfo: {
          firstName: profileData?.personalInfo?.firstName || '',
          lastName: profileData?.personalInfo?.lastName || '',
        },
        employeeId: profileData?.employeeId || '--',
        jobInfo: {
          jobTitle: profileData?.jobInfo?.jobTitle || 'Employee',
        },
        stats: {
          attendanceRate: Math.round(attendanceRate),
          leaveRequests: recentLeaves.length,
        },
        birthdays: [], // TODO: Implement when team/directory endpoint is available
        leaveToday: [], // TODO: Implement when team/directory endpoint is available
        wfhToday: [], // TODO: Implement when team/directory endpoint is available
        weekEvents: weekEvents.sort((a, b) => new Date(a.date) - new Date(b.date)),
      };

      console.log('✅ [EMPLOYEE DASHBOARD SERVICE] Dashboard data prepared:', dashboardData);

      return {
        success: true,
        data: dashboardData,
      };
    } catch (error) {
      console.error('❌ [EMPLOYEE DASHBOARD SERVICE] Failed to fetch dashboard:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to load dashboard',
      };
    }
  },

  /**
   * Get employee profile summary
   */
  getProfileSummary: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.EMPLOYEE.PROFILE);
      return {
        success: true,
        data: response.data?.data,
      };
    } catch (error) {
      console.error('❌ [EMPLOYEE DASHBOARD SERVICE] Failed to fetch profile:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load profile',
      };
    }
  },

  /**
   * Get attendance summary
   */
  getAttendanceSummary: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.EMPLOYEE.ATTENDANCE_SUMMARY);
      return {
        success: true,
        data: response.data?.data,
      };
    } catch (error) {
      console.error('❌ [EMPLOYEE DASHBOARD SERVICE] Failed to fetch attendance:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load attendance',
      };
    }
  },

  /**
   * Get leave balance
   */
  getLeaveBalance: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.EMPLOYEE.LEAVE_BALANCE);
      return {
        success: true,
        data: response.data?.data,
      };
    } catch (error) {
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load leave balance',
      };
    }
  },
};

export default employeeDashboardService;
