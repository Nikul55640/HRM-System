import api from './api';
import { format, addDays, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import birthdayService from './birthdayService';

const employeeDashboardService = {
  /**
   * Get complete employee dashboard data
   * Aggregates data from multiple endpoints
   */
  getDashboardData: async () => {
    try {
      console.log('📊 [EMPLOYEE DASHBOARD SERVICE] Fetching dashboard data...');

      // Get current year and month for attendance summary
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');

      // Fetch all data in parallel for better performance
      const [profileRes, attendanceRes, leaveBalanceRes, leaveHistoryRes, birthdaysRes] = await Promise.allSettled([
        api.get('/employee/profile'),
        api.get(`/employee/attendance/summary/${year}/${month}`),
        api.get('/employee/leave-balance'),
        api.get('/employee/leave-history'),
        birthdayService.getUpcomingYearlyBirthdays(5), // Get 5 upcoming birthdays from entire year
      ]);

      // Debug: Log raw responses
      console.log('🔍 [EMPLOYEE DASHBOARD] Raw API Responses:', {
        profileRes: profileRes.status === 'fulfilled' ? profileRes.value.data : profileRes.reason,
        attendanceRes: attendanceRes.status === 'fulfilled' ? attendanceRes.value.data : attendanceRes.reason,
        leaveBalanceRes: leaveBalanceRes.status === 'fulfilled' ? leaveBalanceRes.value.data : leaveBalanceRes.reason,
        leaveHistoryRes: leaveHistoryRes.status === 'fulfilled' ? leaveHistoryRes.value.data : leaveHistoryRes.reason,
        birthdaysRes: birthdaysRes.status === 'fulfilled' ? birthdaysRes.value.data : birthdaysRes.reason,
      });

      // Extract data safely with multiple fallback patterns
      const profileData = profileRes.status === 'fulfilled' 
        ? (profileRes.value.data?.data || profileRes.value.data || null)
        : null;
        
      const attendanceData = attendanceRes.status === 'fulfilled' 
        ? (attendanceRes.value.data?.data || attendanceRes.value.data || null)
        : null;
        
      const leaveBalanceData = leaveBalanceRes.status === 'fulfilled' 
        ? (leaveBalanceRes.value.data?.data || leaveBalanceRes.value.data || null)
        : null;
        
      const leaveHistoryData = leaveHistoryRes.status === 'fulfilled' 
        ? (leaveHistoryRes.value.data?.data || leaveHistoryRes.value.data || [])
        : [];

      const birthdaysData = birthdaysRes.status === 'fulfilled' 
        ? (birthdaysRes.value.data || [])
        : [];

      console.log('✅ [EMPLOYEE DASHBOARD SERVICE] Extracted data:', {
        profileData: profileData ? 'Found' : 'Missing',
        attendanceData: attendanceData ? 'Found' : 'Missing',
        leaveBalanceData: leaveBalanceData ? 'Found' : 'Missing',
        leaveHistoryData: Array.isArray(leaveHistoryData) ? `${leaveHistoryData.length} items` : 'Invalid',
        birthdaysData: Array.isArray(birthdaysData) ? `${birthdaysData.length} birthdays` : 'Invalid',
      });

      // Calculate attendance rate from last 30 days
      const attendanceRate = attendanceData?.attendanceRate || 0;

      // Count approved leaves in last 30 days - use parseISO for consistent date handling
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentLeaves = (leaveHistoryData || []).filter(leave => {
        try {
          const leaveDate = parseISO(leave.startDate);
          return leave.status === 'approved' && leaveDate >= thirtyDaysAgo;
        } catch (e) {
          console.warn('Invalid date format for leave:', leave.startDate);
          return false;
        }
      });

      // Get this week's date range
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday

      // Get week events (leaves and holidays for current user)
      const weekEvents = [];
      const userLeaves = (leaveHistoryData || []).filter(leave => {
        try {
          const startDate = parseISO(leave.startDate);
          const endDate = parseISO(leave.endDate);
          return (
            leave.status === 'approved' &&
            ((startDate >= weekStart && startDate <= weekEnd) ||
              (endDate >= weekStart && endDate <= weekEnd) ||
              (startDate <= weekStart && endDate >= weekEnd))
          );
        } catch (e) {
          console.warn('Invalid date format for leave:', leave.startDate, leave.endDate);
          return false;
        }
      });

      userLeaves.forEach(leave => {
        try {
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
        } catch (e) {
          console.warn('Error processing leave dates:', e);
        }
      });

      // Build dashboard data structure with fullName
      const dashboardData = {
        personalInfo: {
          firstName: profileData?.firstName || profileData?.personalInfo?.firstName || '',
          lastName: profileData?.lastName || profileData?.personalInfo?.lastName || '',
        },
        // Add fullName for backward compatibility
        fullName: `${profileData?.firstName || profileData?.personalInfo?.firstName || ''} ${profileData?.lastName || profileData?.personalInfo?.lastName || ''}`.trim(),
        employeeId: profileData?.employeeId || '--',
        jobInfo: {
          jobTitle: profileData?.designation || profileData?.jobInfo?.jobTitle || 'Employee',
        },
        stats: {
          attendanceRate: Math.round(attendanceRate),
          leaveRequests: recentLeaves.length,
        },
        birthdays: birthdaysData.map(birthday => birthdayService.formatBirthdayForDisplay(birthday)), // Format birthdays for display
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
      const response = await api.get('/employee/profile');
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
      const response = await api.get('/employee/attendance/summary');
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
      const response = await api.get('/employee/leave-balance');
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

  /**
   * Get all employees on leave today (company-wide)
   */
  getTodayLeaveData: async () => {
    try {
      console.log('🏖️ [EMPLOYEE DASHBOARD SERVICE] Fetching today\'s leave data (employee-safe)...');
      
      // Use the new employee-safe company status endpoint
      const response = await api.get('/employee/company/leave-today');
      
      if (response.data?.success) {
        const leaveData = response.data.data || [];
        
        console.log('✅ [EMPLOYEE DASHBOARD SERVICE] Leave data loaded:', leaveData.length, 'employees');
        
        return {
          success: true,
          data: leaveData,
        };
      } else {
        console.warn('Leave data API returned error:', response.data?.message);
        return {
          success: false,
          message: response.data?.message || 'Failed to load leave data',
          data: [],
        };
      }
    } catch (error) {
      console.error('❌ [EMPLOYEE DASHBOARD SERVICE] Failed to fetch leave data:', error);
      
      // Handle permission errors gracefully
      if (error.response?.status === 403) {
        return {
          success: false,
          message: 'Insufficient permissions to view company leave data',
          data: [],
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load leave data',
        data: [],
      };
    }
  },

  /**
   * Get all employees working from home today (company-wide)
   * ✅ SECURE: Uses employee-safe endpoint with proper RBAC
   */
  getTodayWFHData: async () => {
    try {
      console.log('🏠 [EMPLOYEE DASHBOARD SERVICE] Fetching today\'s WFH data (employee-safe)...');
      
      // Use the new employee-safe company status endpoint
      const response = await api.get('/employee/company/wfh-today');
      
      if (response.data?.success) {
        const wfhData = response.data.data || [];
        
        console.log('✅ [EMPLOYEE DASHBOARD SERVICE] WFH data loaded:', wfhData.length, 'employees');
        
        return {
          success: true,
          data: wfhData,
        };
      } else {
        console.warn('WFH data API returned error:', response.data?.message);
        return {
          success: false,
          message: response.data?.message || 'Failed to load WFH data',
          data: [],
        };
      }
    } catch (error) {
      console.error('❌ [EMPLOYEE DASHBOARD SERVICE] Failed to fetch WFH data:', error);
      
      // Handle permission errors gracefully
      if (error.response?.status === 403) {
        return {
          success: false,
          message: 'Insufficient permissions to view company WFH data',
          data: [],
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load WFH data',
        data: [],
      };
    }
  },
};

export default employeeDashboardService;
