
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../shared/ui/card";
import { EmptyState } from "../../../../shared/components";
import employeeDashboardService from "../../../../services/employeeDashboardService";
import birthdayService from "../../../../services/birthdayService";
import employeeCalendarService from "../../../../services/employeeCalendarService"; // ✅ Use employee-safe calendar service
import api from "../../../../services/api"; // ✅ Add for debugging
import { useNotifications } from "../../../../services/useEmployeeSelfService";
import { usePermissions } from "../../../../core/hooks";
import { MODULES } from "../../../../core/utils/rolePermissions";
import PropTypes from "prop-types";
import { format } from "date-fns";
import {
  Clock,
  MapPin,
  FileText,
  BarChart3,
  DollarSign,
  User,
  CheckCircle,
  Calendar,
  Bell,
  Palmtree,
  CreditCard,
  Activity,
  Target,
  Gift,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  Car,
  Building2,
  CakeIcon,
} from "lucide-react";
import useAuthStore from "../../../../stores/useAuthStore";
import { leaveService } from "../../../../services";
import useAttendanceSessionStore from "../../../../stores/useAttendanceSessionStore";
import { isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addWeeks, addMonths, subWeeks, subMonths } from "date-fns";


// Constants for calendar views
const CALENDAR_VIEW = {
  WEEK: 'week',
  MONTH: 'month'
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [teamOnLeave, setTeamOnLeave] = useState([]);
  const [teamWFH, setTeamWFH] = useState([]);
  const [teamDataLoading, setTeamDataLoading] = useState(false);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [birthdaysLoading, setBirthdaysLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workMode, setWorkMode] = useState('office'); // ✅ NEW: Work mode state
  
  // Calendar state
  const [calendarView, setCalendarView] = useState(CALENDAR_VIEW.MONTH);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);

  // Use notifications hook for live data
  const {
    notifications,
    loading: notificationsLoading,
    error: notificationsError,
    getNotifications,
    markAsRead,
  } = useNotifications();

  // Use permissions hook
  const { can } = usePermissions();

  // Use shared attendance context
 const {
   isLoading,
   clockIn,
   clockOut,
   getAttendanceStatus,
   fetchTodayRecord,
 } = useAttendanceSessionStore();

  // ✅ PHASE 1 FIX: Single responsibility, no duplicates
  useEffect(() => {
    const fetchCriticalData = async () => {
      setLoading(true);
      
      try {
        // Only critical data that dashboard MUST have
        await Promise.all([
          fetchDashboardData(),
          fetchLeaveBalance(),
          fetchAttendanceSummary(),
          fetchTodayRecord(), // Single attendance initialization
        ]);
        
        // Optional data - fail gracefully
        try {
          await Promise.all([
            fetchTeamData(),
            fetchUpcomingBirthdays(),
          ]);
        } catch (optionalError) {
          console.warn('❌ [DASHBOARD] Optional data failed (non-critical):', optionalError);
        }
      } catch (criticalError) {
        console.error('❌ [DASHBOARD] Critical data failed:', criticalError);
      }
      
      setLoading(false);
    };

    fetchCriticalData();
    
    // ✅ REDUCED TIMERS: Only essential ones
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // ✅ ATTENDANCE: 60 sec instead of 30 sec
    const attendanceRefreshTimer = setInterval(() => {
      fetchTodayRecord(true);
    }, 60000);

    return () => {
      clearInterval(timer);
      clearInterval(attendanceRefreshTimer);
    };
  }, []); // ✅ NO DEPENDENCIES - run once only

  // Fetch notifications on component mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const result = await getNotifications({ limit: 5 }); // Get latest 5 notifications
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [DASHBOARD] Notifications loaded:', result?.length || 0);
        }
      } catch (error) {
        console.warn('Failed to load notifications:', error);
      }
    };
    
    loadNotifications();
  }, [getNotifications]);

  // 🔧 DEBUG: Test API connectivity and role validation
  const testAPIConnectivity = async () => {
    console.log('🔧 [DEBUG] Testing API connectivity and role validation...');
    
    // Debug current auth state
    const { user, token, isAuthenticated } = useAuthStore.getState();
    console.log('🔐 [DEBUG] Current auth state:', {
      isAuthenticated,
      hasUser: !!user,
      userRole: user?.role,
      userEmail: user?.email,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
    });
    
    // Check if user role matches allowed roles for dashboard (NORMALIZED)
    const allowedRoles = ["Employee", "HR", "SuperAdmin", "EMPLOYEE", "HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"];
    const userRole = user?.role?.toUpperCase(); // ✅ FIX: Normalize role
    const roleMatches = allowedRoles.map(r => r.toUpperCase()).includes(userRole); // ✅ FIX: Normalize comparison
    
    console.log('🔐 [DEBUG] Role validation:', {
      userRole,
      allowedRoles,
      roleMatches,
      message: roleMatches ? 'Role is valid for dashboard access' : 'Role does NOT match allowed roles'
    });
    
    // ❌ REMOVED: No forced logout from dashboard - route guard handles this
    
    try {
      // Test basic profile endpoint
      const profileTest = await api.get('/employee/profile');
      console.log('✅ [DEBUG] Profile API working:', profileTest.data);
      
      // Test attendance summary endpoint
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const attendanceTest = await api.get(`/employee/attendance/summary/${year}/${month}`);
      console.log('✅ [DEBUG] Attendance API working:', attendanceTest.data);
      
      // Test new company status endpoints (SAFE)
      try {
        const leaveTest = await api.get('/employee/company/leave-today');
        console.log('✅ [DEBUG] Leave API working:', leaveTest.data);
      } catch {
        console.warn('❌ [DEBUG] Leave API limited for employee');
      }
      
      try {
        const wfhTest = await api.get('/employee/company/wfh-today');
        console.log('✅ [DEBUG] WFH API working:', wfhTest.data);
      } catch {
        console.warn('❌ [DEBUG] WFH API limited for employee');
      }
      
      toast.success('All APIs are working correctly!');
    } catch (error) {
      console.error('❌ [DEBUG] API test failed:', error);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed - please login again');
        console.log('🔐 [DEBUG] Token appears to be invalid or expired');
        
        // Force logout on 401
        const { logout } = useAuthStore.getState();
        logout();
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('Access denied - insufficient permissions');
        console.log('🔐 [DEBUG] User role may not have required permissions');
        console.log('🔐 [DEBUG] Error details:', error.response?.data);
      } else {
        toast.error(`API test failed: ${error.message}`);
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      console.log("📊 [DASHBOARD] Starting fetchDashboardData...");
      
      // Debug authentication state
      const { user, token, isAuthenticated } = useAuthStore.getState();
      console.log("� [DASHBOARD] Auth state:", {
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
        
        // Check if it's an authentication error
        if (res.message?.includes('Authentication') || res.message?.includes('Unauthorized')) {
          toast.error("Session expired. Please login again.");
          // Force logout and redirect
          const { logout } = useAuthStore.getState();
          logout();
          return;
        }
        
        toast.warn("Some dashboard data may be limited");
        // Only set fallback if absolutely necessary
        setDashboardData({
          personalInfo: { firstName: "Employee", lastName: "" },
          employeeId: "EMP-001",
          jobInfo: { jobTitle: "Employee" },
          stats: { attendanceRate: 0, leaveRequests: 0 }
        });
      }
    } catch (error) {
      console.error('❌ [DASHBOARD] API error:', error);
      
      // Check if it's a network/server error vs authorization
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        // Force logout and redirect
        const { logout } = useAuthStore.getState();
        logout();
        return;
      } else if (error.response?.status === 403) {
        toast.error("Access denied. Contact administrator.");
        return;
      }
      
      toast.error("Failed to load dashboard data");
      // Only set minimal fallback for network errors
      setDashboardData({
        personalInfo: { firstName: "Employee", lastName: "" },
        employeeId: "EMP-001",
        jobInfo: { jobTitle: "Employee" },
        stats: { attendanceRate: 0, leaveRequests: 0 }
      });
    }
  };

  // Fetch team data (on leave and work from home)
  const fetchTeamData = async (silent = false) => {
    if (!silent) setTeamDataLoading(true);
    
    try {
      console.log('🏢 [DASHBOARD] Fetching team data...');
      
      // ✅ PERMISSION CHECK: Only fetch if user has permission
      if (!can.do(MODULES.COMPANY_STATUS?.VIEW)) {
        console.log('🔐 [DASHBOARD] No permission for company status - skipping team data');
        setTeamOnLeave([]);
        setTeamWFH([]);
        return;
      }
      
      // Fetch today's leave data using employee-safe endpoint
      const leaveResponse = await employeeDashboardService.getTodayLeaveData();
      
      if (leaveResponse.success) {
        console.log('✅ [DASHBOARD] Leave data loaded:', leaveResponse.data?.length || 0, 'employees');
        setTeamOnLeave(leaveResponse.data || []);
      } else {
        console.warn('❌ [DASHBOARD] Leave data failed:', leaveResponse.message);
        setTeamOnLeave([]);
      }

      // Fetch today's WFH data using employee-safe endpoint
      const wfhResponse = await employeeDashboardService.getTodayWFHData();
      
      if (wfhResponse.success) {
        console.log('✅ [DASHBOARD] WFH data loaded:', wfhResponse.data?.length || 0, 'employees');
        setTeamWFH(wfhResponse.data || []);
      } else {
        console.warn('❌ [DASHBOARD] WFH data failed:', wfhResponse.message);
        setTeamWFH([]);
      }
    } catch (error) {
      console.error('❌ [DASHBOARD] Team data API error:', error);
      
      // Handle specific error types
      if (error.response?.status === 403) {
        console.error('🔐 [DASHBOARD] 403 Forbidden - User does not have permission to view company status');
      } else if (error.response?.status === 401) {
        console.error('🔐 [DASHBOARD] 401 Unauthorized - Authentication issue');
        const { logout } = useAuthStore.getState();
        logout();
        navigate('/login');
        return;
      }
      
      // Fallback to empty arrays
      setTeamOnLeave([]);
      setTeamWFH([]);
    } finally {
      if (!silent) setTeamDataLoading(false);
    }
  };

  // Fetch upcoming birthdays from entire year (not just current month)
  const fetchUpcomingBirthdays = async (silent = false) => {
    if (!silent) setBirthdaysLoading(true);
    
    try {
      const response = await birthdayService.getUpcomingYearlyBirthdays(5); // Get 5 upcoming birthdays from entire year
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [DASHBOARD] Birthdays API response:', response);
      }
      
      if (response.success) {
        const birthdays = response.data || [];
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [DASHBOARD] Birthdays count:', birthdays.length);
        }
        setUpcomingBirthdays(birthdays);
      } else {
        console.warn('Birthdays API returned error:', response.message);
        setUpcomingBirthdays([]);
      }
    } catch (error) {
      console.error('Birthdays API error:', error);
      // Fallback to empty array if API is not available
      setUpcomingBirthdays([]);
    } finally {
      if (!silent) setBirthdaysLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const res = await leaveService.getMyLeaveBalance();
      if (res.success) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [DASHBOARD] Leave balance API response:', res.data);
        }
        
        // Transform leaveTypes array to flat structure for easier access
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
        // Set empty data instead of fallback
        setLeaveBalance({
          casual: { remaining: 0, allocated: 0, used: 0 },
          sick: { remaining: 0, allocated: 0, used: 0 },
          annual: { remaining: 0, allocated: 0, used: 0 }
        });
      }
    } catch (error) {
      console.error('Leave balance API error:', error);
      // Set empty data instead of fallback
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
        
        // Calculate required hours based on working days in current month
        const now = new Date();
        const workingDaysInMonth = 22; // Standard working days
        const standardHoursPerDay = 8;
        const requiredHours = workingDaysInMonth * standardHoursPerDay; // 176 hours
        
        // Normalize attendance summary after API call
        const normalizedData = {
          presentDays: res.data.presentDays ?? res.data.present ?? 0,
          absentDays: res.data.absentDays ?? res.data.absent ?? 0, // ✅ Add absent days
          leaveDays: res.data.leaveDays ?? res.data.leave ?? 0, // ✅ Backend uses leaveDays
          lateDays: res.data.lateDays ?? res.data.late ?? 0,
          totalHours: Math.round(res.data.totalWorkHours ?? res.data.totalHours ?? res.data.workedHours ?? 0),
          requiredHours: res.data.requiredHours ?? requiredHours,
          totalDays: res.data.totalDays ?? res.data.totalWorkingDays ?? workingDaysInMonth // ✅ Add total days
        };
        
        console.log('✅ [DASHBOARD] Normalized attendance data:', normalizedData);
        setAttendanceSummary(normalizedData);
      } else {
        console.warn('❌ [DASHBOARD] Attendance summary API error:', res.message);
        // Set empty data instead of fallback
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
      // Set empty data instead of fallback
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

  // Calendar helper functions
  const fetchCalendarEvents = async () => {
    try {
      const startDate = calendarView === CALENDAR_VIEW.WEEK 
        ? startOfWeek(calendarDate).toISOString().split('T')[0]
        : startOfMonth(calendarDate).toISOString().split('T')[0];
      
      const endDate = calendarView === CALENDAR_VIEW.WEEK
        ? endOfWeek(calendarDate).toISOString().split('T')[0]
        : endOfMonth(calendarDate).toISOString().split('T')[0];

      // ✅ FIX: Use employee-safe calendar endpoints
      const allEvents = [];
      
      try {
        // Try employee calendar endpoint first (safer)
        const eventsResponse = await calendarService.getEventsByDateRange(startDate, endDate);
        
        if (eventsResponse && eventsResponse.success) {
          const calendarData = eventsResponse.data || {};
          
          // Add regular events
          if (calendarData.events) {
            allEvents.push(...calendarData.events.map(e => ({
              ...e,
              eventType: e.eventType || 'event',
              color: e.color || '#3B82F6',
              startDate: e.startDate || e.date
            })));
          }
          
          // Add leaves
          if (calendarData.leaves) {
            allEvents.push(...calendarData.leaves.map(l => ({
              ...l,
              eventType: 'leave',
              title: l.title || `${l.employeeName} - ${l.leaveType}`,
              startDate: l.startDate || l.date,
              color: l.color || '#F59E0B'
            })));
          }
          
          // Add birthdays
          if (calendarData.birthdays) {
            allEvents.push(...calendarData.birthdays.map(b => ({
              ...b,
              eventType: 'birthday',
              title: b.title || `${b.employeeName}`,
              startDate: b.date || b.startDate,
              color: b.color || '#10B981'
            })));
          }
          
          // Add anniversaries
          if (calendarData.anniversaries) {
            allEvents.push(...calendarData.anniversaries.map(a => ({
              ...a,
              eventType: 'anniversary',
              title: a.title || `${a.employeeName}`,
              startDate: a.date || a.startDate,
              color: a.color || '#8B5CF6'
            })));
          }
          
          // Add holidays from calendar events if available
          if (calendarData.holidays) {
            allEvents.push(...calendarData.holidays.map(h => ({
              ...h,
              eventType: 'holiday',
              title: h.name || h.title,
              startDate: h.date || h.startDate,
              color: h.color || '#EF4444'
            })));
          }
        }
      } catch (calendarError) {
        console.warn('❌ [DASHBOARD] Calendar events limited for employee:', calendarError);
        // Don't break dashboard for calendar failures
      }

      // Try to fetch holidays separately (employee-safe)
      try {
        const holidaysResponse = await calendarService.getHolidays(calendarDate.getFullYear());
        
        if (holidaysResponse && holidaysResponse.success) {
          let holidayData = [];
          
          // Handle different response structures
          if (holidaysResponse.data?.data?.holidays && Array.isArray(holidaysResponse.data.data.holidays)) {
            holidayData = holidaysResponse.data.data.holidays;
          } else if (holidaysResponse.data?.holidays && Array.isArray(holidaysResponse.data.holidays)) {
            holidayData = holidaysResponse.data.holidays;
          } else if (Array.isArray(holidaysResponse.data)) {
            holidayData = holidaysResponse.data;
          }
          
          console.log('🎉 [DASHBOARD] Processing holidays:', holidayData.length);
          
          // Filter holidays for the current date range and add them
          const filteredHolidays = holidayData.filter(h => {
            const holidayDate = h.date || h.startDate;
            if (!holidayDate) return false;
            
            // Safe date comparison
            try {
              let holidayDateStr = holidayDate;
              
              // Handle different date formats
              if (holidayDate instanceof Date) {
                holidayDateStr = holidayDate.toISOString().split('T')[0];
              } else if (typeof holidayDate === 'string') {
                if (holidayDate.includes('T')) {
                  holidayDateStr = holidayDate.split('T')[0];
                } else if (/^\d{4}-\d{2}-\d{2}$/.test(holidayDate)) {
                  holidayDateStr = holidayDate;
                } else {
                  const parsed = new Date(holidayDate);
                  if (!isNaN(parsed.getTime())) {
                    holidayDateStr = parsed.toISOString().split('T')[0];
                  } else {
                    return false;
                  }
                }
              }
              
              return holidayDateStr >= startDate && holidayDateStr <= endDate;
            } catch (error) {
              console.warn('Date filtering error for holiday:', h.name, holidayDate, error);
              return false;
            }
          });
          
          console.log('🎉 [DASHBOARD] Filtered holidays for date range:', filteredHolidays.length);
          
          // Add filtered holidays, avoiding duplicates
          const existingHolidayNames = new Set(
            allEvents.filter(e => e.eventType === 'holiday').map(e => e.title || e.name)
          );
          
          filteredHolidays.forEach(h => {
            const holidayName = h.name || h.title;
            if (!existingHolidayNames.has(holidayName)) {
              allEvents.push({
                ...h,
                eventType: 'holiday',
                title: holidayName,
                startDate: h.date || h.startDate,
                color: h.color || '#EF4444'
              });
            }
          });
        }
      } catch (holidayError) {
        console.warn('❌ [DASHBOARD] Holidays limited for employee:', holidayError);
        // Don't break dashboard for holiday failures
      }
      
      console.log('📅 [DASHBOARD] Total calendar events:', allEvents.length);
      console.log('🎉 [DASHBOARD] Holiday events:', allEvents.filter(e => e.eventType === 'holiday').length);
      
      setCalendarEvents(allEvents);
    } catch (error) {
      console.error('❌ [DASHBOARD] Failed to fetch calendar events:', error);
      setCalendarEvents([]);
    }
  };

  const getWeekStart = (date) => {
    return startOfWeek(date, { weekStartsOn: 0 });
  };

  const getWeekDays = (date) => {
    const start = getWeekStart(date);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getMonthDays = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const startDate = startOfWeek(start, { weekStartsOn: 0 });
    const endDate = endOfWeek(end, { weekStartsOn: 0 });
    
    const days = [];
    let current = startDate;
    
    while (current <= endDate) {
      days.push(new Date(current));
      current = addDays(current, 1);
    }
    
    return days;
  };

  const navigateCalendar = (direction) => {
    if (calendarView === CALENDAR_VIEW.WEEK) {
      setCalendarDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    } else {
      setCalendarDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    }
  };

  const handleCalendarDateClick = (date) => {
    // Navigate to full calendar page with selected date
    navigate(`/employee/calendar?date=${date.toISOString().split('T')[0]}`);
  };

  // ✅ CALENDAR: Separate responsibility - only when calendar state changes
  useEffect(() => {
    fetchCalendarEvents();
  }, [calendarView, calendarDate]);

  // Debug calendar events in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && calendarEvents.length > 0) {
      console.log('📅 [DASHBOARD] Calendar events updated:', calendarEvents.length);
      const holidayEvents = calendarEvents.filter(e => e.eventType === 'holiday');
      console.log('🎉 [DASHBOARD] Holiday events in calendar:', holidayEvents.length);
      holidayEvents.forEach(h => {
        console.log(`   - ${h.title}: ${h.startDate || h.date}`);
      });
    }
  }, [calendarEvents]);

  // ✅ SIMPLIFIED REFRESH: No duplicate calls
  const refreshDashboard = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchLeaveBalance(),
        fetchAttendanceSummary(),
        fetchTodayRecord(true),
        fetchTeamData(true),
        fetchUpcomingBirthdays(true),
        getNotifications({ limit: 5 }),
        // ❌ REMOVED: fetchCalendarEvents() - handled by separate useEffect
      ]);
      toast.success('Dashboard refreshed successfully');
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      toast.error('Failed to refresh some data');
    } finally {
      setLoading(false);
    }
  };
  // Helper function to get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'leave':
        return <Palmtree className="w-4 h-4 text-green-500" />;
      case 'salary':
      case 'payroll':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'holiday':
        return <Gift className="w-4 h-4 text-red-500" />;
      case 'attendance':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'approval':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'system':
        return <Bell className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleClockIn = async () => {
    try {
      // Check current status first
      const { isClockedIn, status, canClockIn } = getAttendanceStatus();
      
      if (isClockedIn) {
        toast.info("You are already clocked in for today");
        return;
      }

      if (!canClockIn) {
        if (status === 'leave') {
          toast.warn("Cannot clock in - you are on leave today");
          return;
        }
        if (status === 'holiday') {
          toast.warn("Cannot clock in - today is a holiday");
          return;
        }
        if (status === 'pending_correction') {
          toast.warn("Cannot clock in - attendance correction pending");
          return;
        }
        if (status === 'absent') {
          toast.warn("Cannot clock in - attendance already finalized as absent");
          return;
        }
        toast.warn("Cannot clock in at this time");
        return;
      }

      const result = await clockIn({
        workLocation: workMode, // ✅ Use selected work mode
        locationDetails: workMode === 'office' ? 'Office' : workMode === 'wfh' ? 'Work From Home' : 'Field Work',
        notes: 'Clocked in from dashboard'
      });
      
      if (result.success) {
        toast.success("Good morning! Clocked in successfully.");
      } else {
        // If already clocked in, just refresh the data
        if (result.error?.includes('already clocked in')) {
          await fetchTodayRecord(true);
          toast.info("You are already clocked in for today");
        } else {
          toast.error(result.error || "Clock In failed");
        }
      }
    } catch (error) {
      toast.error("Clock In failed");
    }
  };

  const handleClockOut = async () => {
    try {
      const { canClockOut, status } = getAttendanceStatus();
      
      if (!canClockOut) {
        if (status === 'leave') {
          toast.warn("Cannot clock out - you are on leave today");
          return;
        }
        if (status === 'holiday') {
          toast.warn("Cannot clock out - today is a holiday");
          return;
        }
        if (status === 'absent') {
          toast.warn("Cannot clock out - attendance marked as absent");
          return;
        }
        toast.warn("Cannot clock out at this time");
        return;
      }

      const result = await clockOut();
      
      if (result.success) {
        toast.success("Have a great evening! Clocked out.");
      } else {
        toast.error(result.error || "Clock Out failed");
      }
    } catch (error) {
      toast.error("Clock Out failed");
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 font-medium animate-pulse">
            Loading your dashboard...
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-400 mt-2">
              <p>API URL: {import.meta.env.VITE_API_URL || "http://localhost:5000/api"}</p>
              <p>Check browser console for detailed logs</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Get attendance status from context
  const { isClockedIn, status, canClockIn, canClockOut } = getAttendanceStatus();
  const fullName = `${dashboardData?.personalInfo?.firstName || ""} ${
    dashboardData?.personalInfo?.lastName || ""
  }`.trim();

  // Calculate attendance stats from real data with safe fallbacks
  const attendanceStats = {
    present: attendanceSummary?.presentDays || 0,
    absent: attendanceSummary?.absentDays || 0, // ✅ FIX: Add absent field
    leave: attendanceSummary?.leaveDays || 0, // ✅ Backend uses leaveDays
    late: attendanceSummary?.lateDays || 0,
    workedHours: attendanceSummary?.totalHours || 0,
    requiredHours: attendanceSummary?.requiredHours || 160,
    totalDay: attendanceSummary?.totalDays || 0, // ✅ FIX: Correct case and source
  };

  const workProgress = attendanceStats.requiredHours > 0 
    ? Math.round((attendanceStats.workedHours / attendanceStats.requiredHours) * 100)
    : 0;

  // Real leave balance data with safe fallbacks - now using transformed data structure
  const leaveBalanceData = {
    casual: leaveBalance?.casual?.remaining ?? 0,
    sick: leaveBalance?.sick?.remaining ?? 0,
  };



  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
        
        {/* 🟢 SECTION 1: HEADER */}
        <Card className="bg-white shadow-sm rounded-xl border-0">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left side */}
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  Hello, {fullName || "Employee"}
                  <span className="ml-2 text-yellow-500">👋</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Employee ID: {dashboardData.employeeId || "EMP-1023"}
                </p>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  Current Time: {format(currentTime, "hh:mm a")}
                </div>
                <div className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  status === 'present' ? "bg-green-100 text-green-800" :
                  status === 'incomplete' || (isClockedIn && status !== 'leave' && status !== 'holiday') ? "bg-blue-100 text-blue-800" :
                  status === 'leave' ? "bg-yellow-100 text-yellow-800" :
                  status === 'holiday' ? "bg-purple-100 text-purple-800" :
                  status === 'pending_correction' ? "bg-orange-100 text-orange-800" :
                  status === 'absent' ? "bg-red-100 text-red-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'present' ? "bg-green-500" :
                    status === 'incomplete' || (isClockedIn && status !== 'leave' && status !== 'holiday') ? "bg-blue-500" :
                    status === 'leave' ? "bg-yellow-500" :
                    status === 'holiday' ? "bg-purple-500" :
                    status === 'pending_correction' ? "bg-orange-500" :
                    status === 'absent' ? "bg-red-500" :
                    "bg-gray-500"
                  }`} />
                  {status === 'present' && 'Present'}
                  {status === 'incomplete' && 'Working'}
                  {status === 'leave' && 'On Leave'}
                  {status === 'holiday' && 'Holiday'}
                  {status === 'pending_correction' && 'Pending Approval'}
                  {status === 'absent' && 'Absent'}
                  {(!status || status === 'not_marked') && (isClockedIn ? 'Clocked In' : 'Not Marked')}
                </div>
              </div>

              {/* Right side */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Action buttons row */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Debug button - only in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <button
                      onClick={testAPIConnectivity}
                      className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium hover:bg-yellow-200 transition-colors"
                      title="Test API connectivity"
                    >
                      🔧 <span className="hidden sm:inline">Test APIs</span>
                    </button>
                  )}
                  
                  {/* Refresh button */}
                  <button
                    onClick={refreshDashboard}
                    disabled={loading}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Refresh dashboard"
                  >
                    <Activity className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                {/* Clock In/Out section */}
                <div className="text-center space-y-1">
                  <button
                    onClick={isClockedIn ? handleClockOut : handleClockIn}
                    disabled={isLoading || (!canClockIn && !isClockedIn) || (isClockedIn && !canClockOut)}
                    className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-white transition-all duration-200 text-sm sm:text-base ${
                      // Show appropriate colors based on status
                      status === 'leave' || status === 'holiday' || status === 'pending_correction' || status === 'absent'
                        ? "bg-gray-400 cursor-not-allowed"
                        : isClockedIn
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : (status === 'leave' || status === 'holiday' || status === 'pending_correction' || status === 'absent') ? "" : "hover:scale-105"}`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="hidden sm:inline">Processing...</span>
                        <span className="sm:hidden">...</span>
                      </div>
                    ) : (
                      <>
                        {status === 'leave' && 'On Leave'}
                        {status === 'holiday' && 'Holiday'}
                        {status === 'pending_correction' && 'Pending Approval'}
                        {status === 'absent' && 'Marked Absent'}
                        {(!['leave', 'holiday', 'pending_correction', 'absent'].includes(status)) && (
                          isClockedIn ? "Clock Out" : "Clock In"
                        )}
                      </>
                    )}
                  </button>
                  {status === 'pending_correction' && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠ Attendance needs correction approval
                    </p>
                  )}
                  <div className="flex flex-col items-center gap-1 text-xs text-gray-500">
                    {/* Work Mode Selector */}
                    {!isClockedIn && canClockIn && (
                      <select 
                        value={workMode} 
                        onChange={(e) => setWorkMode(e.target.value)}
                        className="text-xs border rounded px-2 py-1 bg-white"
                      >
                        <option value="office"><Building2/>Office</option>
                        <option value="wfh"><Home/>Work From Home</option>
                        <option value="field"><Car/> Field Work</option>
                      </select>
                    )}
                    {isClockedIn && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="hidden sm:inline">
                          Location: {workMode === 'office' ? 'Office' : workMode === 'wfh' ? 'WFH' : 'Field'}
                        </span>
                        <span className="sm:hidden">
                          {workMode === 'office' ? 'Office' : workMode === 'wfh' ? 'WFH' : 'Field'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 🟢 SECTION 2: STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title={
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm sm:text-base">Attendance</span>
              </div>
            }
            content={
              <div className="space-y-1">
                <div className="text-xs sm:text-sm">Present: <span className="font-bold">{attendanceStats.present}</span></div>
                <div className="text-xs sm:text-sm">Absent: <span className="font-bold">{attendanceStats.absent}</span></div>
                <div className="text-xs sm:text-sm">Late: <span className="font-bold">{attendanceStats.late}</span></div>
                <div className="text-xs sm:text-sm">Total Day: <span className="font-bold">{attendanceStats.totalDay}</span></div>
              </div>
            }
            onClick={() => navigate("/employee/attendance")}
          />
          
          <StatCard
            title={
              <div className="flex items-center gap-2">
                <Palmtree className="w-4 h-4 text-green-600" />
                <span className="text-sm sm:text-base">Leave Balance</span>
              </div>
            }
            content={
              <div className="space-y-1">
                <div className="text-xs sm:text-sm">Casual: <span className="font-bold">{leaveBalanceData.casual}</span></div>
                <div className="text-xs sm:text-sm">Sick: <span className="font-bold">{leaveBalanceData.sick}</span></div>
              </div>
            }
            onClick={() => navigate("/employee/leave")}
          />
          
          <StatCard
            title={
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm sm:text-base">This Month</span>
              </div>
            }
            content={
              <div className="space-y-2">
                <div className="text-xs sm:text-sm">Worked: <span className="font-bold">{attendanceStats.workedHours} hrs</span></div>
                <div className="text-xs sm:text-sm">Required: <span className="font-bold">{attendanceStats.requiredHours} hrs</span></div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{width: `${Math.min(workProgress, 100)}%`}}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">{workProgress}% completed</div>
              </div>
            }
            onClick={() => navigate("/employee/attendance")}
          />
          
          <StatCard
            title={
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-600" />
                <span className="text-sm sm:text-base">Bank Details</span>
              </div>
            }
            content={
              <div className="space-y-2">
                <div className="font-medium text-xs sm:text-sm">Manage Details</div>
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs sm:text-sm font-medium hover:bg-blue-200 transition-colors">
                  View
                </button>
              </div>
            }
            onClick={() => navigate("/employee/bank-details")}
          />
        </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* 🟢 SECTION 3: TEAM ON LEAVE TODAY */}
          <div className="lg:col-span-1">
          <Card className="bg-white rounded-xl border shadow-sm">
            <CardHeader className="pb-2">
             <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
               <Palmtree className="w-4 h-4 text-green-600" />
                  <span>On Leave Today</span>
    </CardTitle>
  </CardHeader>

  <CardContent className="pt-0 space-y-3">
    {/* ✅ PERMISSION-AWARE EMPTY STATE */}
    {!can.do(MODULES.COMPANY_STATUS?.VIEW) ? (
      <EmptyState
        icon={Palmtree}
        title="Restricted Access"
        description="No permission to view company leave status"
      />
    ) : teamOnLeave.length > 0 ? (
      teamOnLeave.slice(0, 5).map((emp, i) => (
        <div
          key={emp.id || i}
          className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50"
        >
          <div className="p-2 rounded-full bg-green-100">
            <Palmtree className="w-3 h-3 text-green-600" />
          </div>

          <div className="flex-1">
            <p className="font-medium text-sm text-gray-900 leading-tight">
              {emp.employeeName}
            </p>
            <p className="text-xs text-gray-500">
              {emp.leaveType} Leave
            </p>
          </div>

          <span className="text-xs text-gray-600 whitespace-nowrap">
            {emp.duration || 'Full Day'}
          </span>
        </div>
      ))
    ) : (
      <EmptyState
        icon={Palmtree}
        title="No one on leave"
        description="Everyone is working today"
      />
    )}
  </CardContent>
</Card>

          </div>

          {/* 🟢 SECTION 4: WORK FROM HOME TODAY */}
          <div className="lg:col-span-1">
          <Card className="bg-white rounded-xl border shadow-sm">
  <CardHeader className="pb-2">
    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
      <Home className="w-4 h-4 text-blue-600" />
      <span>Work From Home</span>
    </CardTitle>
  </CardHeader>

  <CardContent className="pt-0 space-y-3">
    {/* ✅ PERMISSION-AWARE EMPTY STATE */}
    {!can.do(MODULES.COMPANY_STATUS?.VIEW) ? (
      <EmptyState
        icon={Home}
        title="Restricted Access"
        description="No permission to view company WFH status"
      />
    ) : teamWFH.length > 0 ? (
      teamWFH.slice(0, 5).map((emp, i) => (
        <div
          key={emp.id || i}
          className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50"
        >
          <div className="p-2 rounded-full bg-blue-100">
            <User className="w-3 h-3 text-blue-600" />
          </div>

          <div className="flex-1">
            <p className="font-medium text-sm text-gray-900">
              {emp.employeeName}
            </p>
            <p className="text-xs text-gray-500">
              {emp.department || 'Remote'}
            </p>
          </div>

          <span className="text-xs text-blue-600 font-medium">
            WFH
          </span>
        </div>
      ))
    ) : (
      <EmptyState
        icon={Home}
        title="No WFH today"
        description="All employees are in office"
      />
    )}
  </CardContent>
</Card>

          </div>

          {/* Right Column - Birthdays */}
          <div className="lg:col-span-1">
           <Card className="bg-white rounded-xl border shadow-sm">
  <CardHeader className="pb-2">
    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
      <Gift className="w-4 h-4 text-pink-600" />
      <span>Upcoming Birthdays</span>
    </CardTitle>
  </CardHeader>

  <CardContent className="pt-0 space-y-3">
    {upcomingBirthdays.length > 0 ? (
      upcomingBirthdays.slice(0, 5).map((b, i) => (
        <div
          key={b.id || i}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
        >
          <div className="p-2 rounded-full bg-pink-100">
            <CakeIcon className="w-3 h-3 text-pink-600" />
          </div>

          <div className="flex-1">
            <p className="font-medium text-sm text-gray-900">
              {b.employeeName}
            </p>
            <p className="text-xs text-gray-500">
              {format(new Date(b.date), 'dd MMM')}
            </p>
          </div>

          {b.isToday && (
            <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
              Today 🎉
            </span>
          )}
        </div>
      ))
    ) : (
      <EmptyState
        icon={Gift}
        title="No upcoming birthdays"
        description="Nothing to celebrate soon"
      />
    )}
  </CardContent>
</Card>

          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* 🟢 SECTION 5: QUICK ACTIONS */}
          <div className="xl:col-span-2">
            <Card className="bg-white shadow-sm rounded-xl border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  <QuickActionButton
                    icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6" />}
                    label="Apply Leave"
                    onClick={() => navigate("/employee/leave")}
                  />
                  <QuickActionButton
                    icon={<BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />}
                    label="Attendance History"
                    onClick={() => navigate("/employee/attendance")}
                  />
                  <QuickActionButton
                    icon={<CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />}
                    label="Bank Details"
                    onClick={() => navigate("/employee/bank-details")}
                  />
                  <QuickActionButton
                    icon={<User className="w-5 h-5 sm:w-6 sm:h-6" />}
                    label="My Profile"
                    onClick={() => navigate("/employee/profile")}
                  />
                  {/* Only show leads if user has permission */}
                  {can.do(MODULES.LEAD.VIEW) && (
                    <QuickActionButton
                      icon={<Target className="w-5 h-5 sm:w-6 sm:h-6" />}
                      label="My Leads"
                      onClick={() => navigate("/employee/leads")}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 🟢 SECTION 6: NOTIFICATIONS */}
            <Card className="bg-white shadow-sm rounded-xl border-0 mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Bell className="w-4 h-4 text-yellow-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {notificationsLoading ? (
                    <div className="text-center py-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-xs sm:text-sm text-gray-500">Loading notifications...</p>
                    </div>
                  ) : notificationsError ? (
                    <div className="text-center py-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-red-600">Failed to load notifications</p>
                    </div>
                  ) : notifications && notifications.length > 0 ? (
                    <>
                      {notifications.slice(0, 5).map((notification, index) => (
                        <div 
                          key={notification.id || index} 
                          className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            notification.read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
                          }`}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs sm:text-sm block ${notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                              {notification.message || notification.title}
                            </span>
                            {notification.createdAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                {format(new Date(notification.createdAt), 'MMM dd, hh:mm a')}
                              </p>
                            )}
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          )}
                        </div>
                      ))}
                      <button 
                        className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                        onClick={() => navigate('/notifications')}
                      >
                        View all →
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Bell className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-xs sm:text-sm">No notifications</p>
                      <p className="text-xs">You're all caught up!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Calendar */}
          <div className="space-y-4">
            <Card className="bg-white shadow-sm rounded-xl border-0">
              <CardHeader className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="hidden sm:inline">Calendar</span>
                    <span className="sm:hidden">Cal</span>
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCalendarView(CALENDAR_VIEW.WEEK)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        calendarView === CALENDAR_VIEW.WEEK 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className="hidden sm:inline">Week</span>
                      <span className="sm:hidden">W</span>
                    </button>
                    <button
                      onClick={() => setCalendarView(CALENDAR_VIEW.MONTH)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        calendarView === CALENDAR_VIEW.MONTH 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className="hidden sm:inline">Month</span>
                      <span className="sm:hidden">M</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => navigateCalendar('prev')}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-medium text-gray-900 text-xs sm:text-sm text-center">
                    {calendarView === CALENDAR_VIEW.WEEK 
                      ? `${format(getWeekStart(calendarDate), "MMM dd")}`
                      : format(calendarDate, "MMM yyyy")
                    }
                  </h3>
                  <button
                    onClick={() => navigateCalendar('next')}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                {calendarView === CALENDAR_VIEW.MONTH ? (
                  <>
                    <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-xs mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="font-medium text-gray-500 p-1 text-xs">
                          <span className="hidden sm:inline">{day}</span>
                          <span className="sm:hidden">{day.charAt(0)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                      {getMonthDays(calendarDate).map((day, i) => {
                        const isToday = day && isSameDay(day, new Date());
                        const isCurrentMonth = day && day.getMonth() === calendarDate.getMonth();
                        
                        // Safe event filtering with robust date comparison
                        const hasEvents = day && calendarEvents.some(event => {
                          const eventDate = event.startDate || event.date;
                          if (!eventDate) return false;
                          
                          try {
                            let eventDateStr = eventDate;
                            
                            // Handle different date formats
                            if (eventDate instanceof Date) {
                              eventDateStr = eventDate.toISOString().split('T')[0];
                            } else if (typeof eventDate === 'string') {
                              if (eventDate.includes('T')) {
                                eventDateStr = eventDate.split('T')[0];
                              } else if (/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
                                eventDateStr = eventDate;
                              } else {
                                const parsed = new Date(eventDate);
                                if (!isNaN(parsed.getTime())) {
                                  eventDateStr = parsed.toISOString().split('T')[0];
                                } else {
                                  return false;
                                }
                              }
                            }
                            
                            const dayStr = day.toISOString().split('T')[0];
                            return eventDateStr === dayStr;
                          } catch (error) {
                            console.warn('Date comparison error in calendar:', event.title, eventDate, error);
                            return false;
                          }
                        });
                        
                        return (
                          <div
                            key={i}
                            className={`aspect-square flex items-center justify-center text-xs rounded cursor-pointer relative transition-colors ${
                              isToday ? 'bg-blue-500 text-white font-bold' :
                              isCurrentMonth ? 'hover:bg-gray-100 text-gray-700' :
                              'text-gray-300'
                            }`}
                            onClick={() => day && handleCalendarDateClick(day)}
                          >
                            <span className="text-xs sm:text-sm">{day ? day.getDate() : ''}</span>
                            {hasEvents && (
                              <div className="absolute bottom-0.5 right-0.5 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-orange-400 rounded-full"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="space-y-1 sm:space-y-2">
                    {getWeekDays(calendarDate).map((day, i) => {
                      const isToday = isSameDay(day, new Date());
                      
                      // Safe event filtering with robust date comparison
                      const dayEvents = calendarEvents.filter(event => {
                        const eventDate = event.startDate || event.date;
                        if (!eventDate) return false;
                        
                        try {
                          let eventDateStr = eventDate;
                          
                          // Handle different date formats
                          if (eventDate instanceof Date) {
                            eventDateStr = eventDate.toISOString().split('T')[0];
                          } else if (typeof eventDate === 'string') {
                            if (eventDate.includes('T')) {
                              eventDateStr = eventDate.split('T')[0];
                            } else if (/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
                              eventDateStr = eventDate;
                            } else {
                              const parsed = new Date(eventDate);
                              if (!isNaN(parsed.getTime())) {
                                eventDateStr = parsed.toISOString().split('T')[0];
                              } else {
                                return false;
                              }
                            }
                          }
                          
                          const dayStr = day.toISOString().split('T')[0];
                          return eventDateStr === dayStr;
                        } catch (error) {
                          console.warn('Date comparison error in week view:', event.title, eventDate, error);
                          return false;
                        }
                      });
                      
                      return (
                        <div
                          key={i}
                          className={`p-2 rounded cursor-pointer transition-colors ${
                            isToday ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleCalendarDateClick(day)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <span className={`text-xs sm:text-sm font-medium ${
                                isToday ? 'text-blue-600' : 'text-gray-900'
                              }`}>
                                <span className="hidden sm:inline">{format(day, 'EEE dd')}</span>
                                <span className="sm:hidden">{format(day, 'dd')}</span>
                              </span>
                              {isToday && (
                                <span className="text-xs bg-blue-500 text-white px-1 sm:px-1.5 py-0.5 rounded">
                                  <span className="hidden sm:inline">Today</span>
                                  <span className="sm:hidden">•</span>
                                </span>
                              )}
                            </div>
                            {dayEvents.length > 0 && (
                              <div className="flex items-center gap-1">
                                {dayEvents.slice(0, 2).map((event, idx) => (
                                  <div
                                    key={idx}
                                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                                    style={{ backgroundColor: event.color || '#3B82F6' }}
                                    title={event.title}
                                  />
                                ))}
                                {dayEvents.length > 2 && (
                                  <span className="text-xs text-gray-500">+{dayEvents.length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>
                          {dayEvents.length > 0 && (
                            <div className="mt-1 space-y-1">
                              {dayEvents.slice(0, 1).map((event, idx) => (
                                <div key={idx} className="text-xs text-gray-600 truncate">
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 1 && (
                                <div className="text-xs text-gray-500">
                                  +{dayEvents.length - 1} more
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-200 rounded"></div>
                    <span className="text-gray-600">Holiday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-200 rounded"></div>
                    <span className="text-gray-600">On Leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-200 rounded"></div>
                    <span className="text-gray-600">Events</span>
                  </div>
                </div>
                
                <button 
                  className="w-full mt-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  onClick={() => navigate('/employee/calendar')}
                >
                  <span className="hidden sm:inline">View Full Calendar →</span>
                  <span className="sm:hidden">Full Calendar →</span>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---

const StatCard = ({ title, content, onClick }) => (
  <Card 
    className="bg-white shadow-sm rounded-xl border-0 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
    onClick={onClick}
  >
    <CardContent className="p-3 sm:p-4">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">{title}</h3>
      </div>
      <div className="text-xs sm:text-sm text-gray-600">
        {content}
      </div>
    </CardContent>
  </Card>
);

StatCard.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  content: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};

const QuickActionButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 group"
  >
    <div className="text-blue-600 mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">{label}</span>
  </button>
);

QuickActionButton.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default EmployeeDashboard;