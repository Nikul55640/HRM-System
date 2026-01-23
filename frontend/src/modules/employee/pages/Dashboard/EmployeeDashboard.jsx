
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../shared/ui/card";
import { DetailModal, EmptyState } from "../../../../shared/components";
import { useNotifications } from "../../../../services/useEmployeeSelfService";
import { usePermissions } from "../../../../core/hooks";
import { MODULES } from "../../../../core/utils/rolePermissions";
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
  Eye,
  Edit,
} from "lucide-react";
import useAuthStore from "../../../../stores/useAuthStore";
import useAttendanceSessionStore from "../../../../stores/useAttendanceSessionStore";
import { isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addWeeks, addMonths, subWeeks, subMonths } from "date-fns";

// Custom Hooks
import { useDashboardData } from "./hooks/useDashboardData";
import { useDashboardTeam } from "./hooks/useDashboardTeam";

// Services
import employeeCalendarService from "../../../../services/employeeCalendarService";
import api from "../../../../services/api";


// Constants for calendar views
const CALENDAR_VIEW = {
  WEEK: 'week', 
  MONTH: 'month',
  LIST: 'list' 
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  
  // Use custom hooks for data management
  const { 
    dashboardData, 
    leaveBalance, 
    attendanceSummary, 
    loading, 
    refreshDashboard 
  } = useDashboardData();
  
  const { 
    teamOnLeave, 
    teamWFH, 
    upcomingBirthdays, 
    teamDataLoading, 
    birthdaysLoading 
  } = useDashboardTeam();

  // Local state for UI
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workMode, setWorkMode] = useState('office');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  
  // Calendar state
  const [calendarView, setCalendarView] = useState(CALENDAR_VIEW.MONTH);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);

  // Use hooks
  const { notifications, loading: notificationsLoading, error: notificationsError, getNotifications, markAsRead } = useNotifications();
  const { can } = usePermissions();
  const { isLoading, clockIn, clockOut, getAttendanceStatus, fetchTodayRecord } = useAttendanceSessionStore();

  // ✅ SIMPLIFIED: Only essential timers and calendar logic
  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Refresh attendance every 2 minutes
    const attendanceRefreshTimer = setInterval(() => {
      fetchTodayRecord(true);
    }, 120000);

    return () => {
      clearInterval(timer);
      clearInterval(attendanceRefreshTimer);
    };
  }, []);

  // Fetch notifications on component mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const result = await getNotifications({ limit: 5 });
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

  // ✅ OPTIMIZED: Calendar helper functions - only fetch what's needed
  const fetchCalendarEvents = async () => {
    try {
      const startDate = calendarView === CALENDAR_VIEW.WEEK 
        ? startOfWeek(calendarDate).toISOString().split('T')[0]
        : startOfMonth(calendarDate).toISOString().split('T')[0];
      
      const endDate = calendarView === CALENDAR_VIEW.WEEK
        ? endOfWeek(calendarDate).toISOString().split('T')[0]
        : endOfMonth(calendarDate).toISOString().split('T')[0];

      console.log('📅 [DASHBOARD] Fetching optimized calendar events:', { 
        view: calendarView, 
        startDate, 
        endDate,
        range: calendarView === CALENDAR_VIEW.WEEK ? '7 days' : '~30 days'
      });

      // ✅ Use optimized employee calendar service - only fetch needed date range
      const eventsResponse = await employeeCalendarService.getEventsByDateRange(startDate, endDate);
      
      if (eventsResponse && eventsResponse.success) {
        const allEvents = eventsResponse.data.events || [];
        
        console.log('✅ [DASHBOARD] Optimized calendar events loaded:', {
          total: allEvents.length,
          holidays: allEvents.filter(e => e.eventType === 'holiday').length,
          leaves: allEvents.filter(e => e.eventType === 'leave').length,
          birthdays: allEvents.filter(e => e.eventType === 'birthday').length,
          anniversaries: allEvents.filter(e => e.eventType === 'anniversary').length,
          events: allEvents.filter(e => e.eventType === 'event').length
        });
        
        setCalendarEvents(allEvents);
      } else {
        console.warn('❌ [DASHBOARD] Calendar events failed:', eventsResponse);
        setCalendarEvents([]);
      }
    } catch (error) {
      console.error('❌ [DASHBOARD] Failed to fetch calendar events:', error);
      
      // Handle 403 errors gracefully for employees
      if (error.response?.status === 403) {
        console.warn('❌ [DASHBOARD] Limited calendar access for employee');
      }
      
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
      // For both MONTH and LIST views, navigate by month
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

  const handleViewProfile = async () => {
    try {
      setShowProfileModal(true);
      
      // Get current user data from auth store
      const { user } = useAuthStore.getState();
      
      // Combine dashboard data with user data for comprehensive profile view
      const combinedProfileData = {
        // Personal Information
        firstName: dashboardData?.personalInfo?.firstName || user?.firstName,
        lastName: dashboardData?.personalInfo?.lastName || user?.lastName,
        email: dashboardData?.contactInfo?.email || user?.email,
        phone: dashboardData?.contactInfo?.phoneNumber || dashboardData?.contactInfo?.phone,
        profilePhoto: dashboardData?.personalInfo?.profilePhoto,
        dateOfBirth: dashboardData?.personalInfo?.dateOfBirth,
        gender: dashboardData?.personalInfo?.gender,
        
        // Job Information
        employeeId: dashboardData?.jobInfo?.employeeId || user?.employeeId,
        designation: dashboardData?.jobInfo?.designation,
        department: dashboardData?.jobInfo?.department,
        joiningDate: dashboardData?.jobInfo?.joiningDate,
        employmentType: dashboardData?.jobInfo?.employmentType,
        workLocation: dashboardData?.jobInfo?.workLocation,
        reportingManager: dashboardData?.jobInfo?.reportingManager,
        
        // Contact Information
        address: dashboardData?.contactInfo?.address,
        emergencyContact: dashboardData?.contactInfo?.emergencyContact,
        
        // Bank Information
        bankName: dashboardData?.bankInfo?.bankName,
        accountNumber: dashboardData?.bankInfo?.accountNumber,
        ifscCode: dashboardData?.bankInfo?.ifscCode,
        
        // System Information
        role: user?.role,
        status: dashboardData?.status || 'Active',
        lastLogin: user?.lastLogin,
        createdAt: dashboardData?.createdAt,
        updatedAt: dashboardData?.updatedAt
      };
      
      setProfileData(combinedProfileData);
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error('Failed to load profile information');
    }
  };

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
                  <User className="ml-2 w-5 h-5 text-blue-500 inline" />
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
                      <Activity className="w-4 h-4 text-yellow-600" />
                      <span className="hidden sm:inline">Test APIs</span>
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
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      Attendance needs correction approval
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
                        <option value="office">Office</option>
                        <option value="wfh">Work From Home</option>
                        <option value="field">Field Work</option>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
    {!can.do(MODULES.ATTENDANCE?.VIEW_COMPANY_STATUS) ? (
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
    {!can.do(MODULES.ATTENDANCE?.VIEW_COMPANY_STATUS) ? (
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
    <CardTitle className="flex items-center justify-between text-sm sm:text-base">
      <div className="flex items-center gap-2">
        <Gift className="w-4 h-4 text-pink-600" />
        <span>Upcoming Birthdays</span>
      </div>
      {upcomingBirthdays.length > 0 && (
        <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
          {upcomingBirthdays.length} upcoming
        </span>
      )}
    </CardTitle>
  </CardHeader>

  <CardContent className="pt-0">
    {upcomingBirthdays.length > 0 ? (
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {upcomingBirthdays.map((b, i) => (
          <div
            key={b.id || i}
            className={`flex items-start gap-3 p-2 sm:p-3 rounded-lg transition-colors ${
              b.isToday 
                ? 'bg-pink-50 border border-pink-200 shadow-sm' 
                : 'hover:bg-gray-50'
            }`}
          >
            <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
              b.isToday ? 'bg-pink-200' : 'bg-pink-100'
            }`}>
              <CakeIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${
                b.isToday ? 'text-pink-700' : 'text-pink-600'
              }`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm leading-tight truncate ${
                    b.isToday ? 'text-pink-900' : 'text-gray-900'
                  }`}>
                    {b.employeeName || 'Unknown Employee'}
                  </p>
                  
                  {/* Birth Date Display */}
                  <div className="flex flex-col gap-0.5 mt-1">
                    <p className="text-xs text-gray-600">
                      {b.isToday ? (
                        <span className="font-medium text-pink-700 flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          Today is their birthday!
                        </span>
                      ) : (
                        `${b.daysUntil} day${b.daysUntil !== 1 ? 's' : ''} away`
                      )}
                    </p>
                    
                    {/* Show actual birth date */}
                    {b.nextBirthdayDate && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(b.nextBirthdayDate, 'MMM dd, yyyy')}
                      </p>
                    )}
                    
                    {/* Show department if available */}
                    {b.department && (
                      <p className="text-xs text-gray-400 truncate">
                        {b.department}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0 mt-1 sm:mt-0">
                  {b.isToday ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-pink-200 text-pink-800 px-2 py-1 rounded-full font-medium">
                      <CakeIcon className="w-3 h-3" />
                      Today
                    </span>
                  ) : b.daysUntil <= 7 ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      This Week
                    </span>
                  ) : b.daysUntil <= 30 ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      This Month
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {Math.ceil(b.daysUntil / 30)} month{Math.ceil(b.daysUntil / 30) !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={Gift}
        title="No upcoming birthdays"
        description="Nothing to celebrate soon"
      />
    )}
    
    {/* Show more button if there are many birthdays */}
    {upcomingBirthdays.length > 5 && (
      <div className="mt-3 pt-2 border-t border-gray-100">
        <button 
          className="w-full text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          onClick={() => navigate('/employee/calendar')}
        >
          View all birthdays in calendar →
        </button>
      </div>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-3">
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
                  <QuickActionButton
                    icon={<Eye className="w-5 h-5 sm:w-6 sm:h-6" />}
                    label="View Details"
                    onClick={handleViewProfile}
                  />
                  <QuickActionButton
                    icon={<Calendar className="w-5 h-5 sm:w-6 sm:h-6" />}
                    label="Calendar"
                    onClick={() => navigate("/employee/calendar")}
                  />
                  <QuickActionButton
                    icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
                    label="Attendance"
                    onClick={() => navigate("/employee/attendance")}
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
                  ) : (() => {
                    // Filter out read notifications - only show unread ones
                    const unreadNotifications = notifications?.filter(n => !n.read) || [];
                    
                    return unreadNotifications.length > 0 ? (
                      <>
                        {unreadNotifications.slice(0, 5).map((notification, index) => (
                          <div 
                            key={notification.id || index} 
                            className="flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors bg-blue-50 border border-blue-200 hover:bg-blue-100"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="mt-0.5 flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs sm:text-sm block text-gray-900 font-medium">
                                {notification.message || notification.title}
                              </span>
                              {notification.createdAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {format(new Date(notification.createdAt), 'MMM dd, hh:mm a')}
                                </p>
                              )}
                            </div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          </div>
                        ))}
                        <button 
                          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => navigate('/notifications')}
                        >
                          View all notifications →
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-400" />
                        <p className="text-xs sm:text-sm">No new notifications</p>
                        <p className="text-xs">You're all caught up!</p>
                      </div>
                    );
                  })()}
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
                    <button
                      onClick={() => setCalendarView(CALENDAR_VIEW.LIST)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        calendarView === CALENDAR_VIEW.LIST 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className="hidden sm:inline">List</span>
                      <span className="sm:hidden">L</span>
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
                      : calendarView === CALENDAR_VIEW.LIST
                      ? `${format(calendarDate, "MMM yyyy")} - Events`
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
                        
                        // ✅ FIX: Robust date comparison for calendar events
                        const hasEvents = day && calendarEvents.some(event => {
                          const eventDate = event.startDate || event.date;
                          if (!eventDate) return false;
                          
                          try {
                            // ✅ FIX: Proper date comparison without timezone issues
                            let eventDateObj;
                            
                            if (eventDate instanceof Date) {
                              eventDateObj = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
                            } else if (typeof eventDate === 'string') {
                              if (eventDate.includes('T')) {
                                const dateStr = eventDate.split('T')[0];
                                const [year, month, dayNum] = dateStr.split('-').map(Number);
                                eventDateObj = new Date(year, month - 1, dayNum);
                              } else if (/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
                                const [year, month, dayNum] = eventDate.split('-').map(Number);
                                eventDateObj = new Date(year, month - 1, dayNum);
                              } else {
                                return false;
                              }
                            } else {
                              return false;
                            }
                            
                            const dayObj = new Date(day.getFullYear(), day.getMonth(), day.getDate());
                            return eventDateObj.getTime() === dayObj.getTime();
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
                ) : calendarView === CALENDAR_VIEW.WEEK ? (
                  <div className="space-y-1 sm:space-y-2">
                    {getWeekDays(calendarDate).map((day, i) => {
                      const isToday = isSameDay(day, new Date());
                      
                      // ✅ FIX: Robust date comparison for week view
                      const dayEvents = calendarEvents.filter(event => {
                        const eventDate = event.startDate || event.date;
                        if (!eventDate) return false;
                        
                        try {
                          // ✅ FIX: Proper date comparison without timezone issues
                          let eventDateObj;
                          
                          if (eventDate instanceof Date) {
                            eventDateObj = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
                          } else if (typeof eventDate === 'string') {
                            if (eventDate.includes('T')) {
                              const dateStr = eventDate.split('T')[0];
                              const [year, month, dayNum] = dateStr.split('-').map(Number);
                              eventDateObj = new Date(year, month - 1, dayNum);
                            } else if (/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
                              const [year, month, dayNum] = eventDate.split('-').map(Number);
                              eventDateObj = new Date(year, month - 1, dayNum);
                            } else {
                              return false;
                            }
                          } else {
                            return false;
                          }
                          
                          const dayObj = new Date(day.getFullYear(), day.getMonth(), day.getDate());
                          return eventDateObj.getTime() === dayObj.getTime();
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
                ) : (
                  // ✅ LIST VIEW - Agenda Style (matches your screenshot)
                  <div className="space-y-4">
                    {(() => {
                      // Group events by date
                      const groupedEvents = calendarEvents.reduce((acc, event) => {
                        const eventDate = event.startDate || event.date;
                        if (!eventDate) return acc;
                        
                        let dateKey;
                        try {
                          if (eventDate instanceof Date) {
                            dateKey = eventDate.toISOString().split('T')[0];
                          } else if (typeof eventDate === 'string') {
                            if (eventDate.includes('T')) {
                              dateKey = eventDate.split('T')[0];
                            } else if (/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
                              dateKey = eventDate;
                            } else {
                              return acc;
                            }
                          } else {
                            return acc;
                          }
                        } catch (error) {
                          console.warn('Date parsing error in list view:', eventDate, error);
                          return acc;
                        }
                        
                        if (!acc[dateKey]) acc[dateKey] = [];
                        acc[dateKey].push(event);
                        return acc;
                      }, {});

                      // Sort dates
                      const sortedDates = Object.keys(groupedEvents).sort();
                      
                      if (sortedDates.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No events to display</p>
                            <p className="text-xs">Events will appear here when available</p>
                          </div>
                        );
                      }

                      return sortedDates.map(dateKey => {
                        const events = groupedEvents[dateKey];
                        const date = new Date(dateKey + 'T00:00:00');
                        const isToday = isSameDay(date, new Date());
                        
                        return (
                          <div key={dateKey} className="space-y-2">
                            {/* Date Header */}
                            <div className={`flex items-center justify-between text-sm font-semibold pb-1 border-b ${
                              isToday ? 'text-blue-600 border-blue-200' : 'text-gray-700 border-gray-200'
                            }`}>
                              <span className="flex items-center gap-2">
                                {format(date, 'EEEE')}
                                {isToday && (
                                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                    Today
                                  </span>
                                )}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-500">
                                {format(date, 'MMM dd, yyyy')}
                              </span>
                            </div>
                            
                            {/* Events */}
                            <div className="space-y-1">
                              {events.map((event, i) => (
                                <div
                                  key={i}
                                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                                    event.type === 'holiday' ? 'bg-red-50 hover:bg-red-100 border border-red-200' :
                                    event.type === 'leave' ? 'bg-yellow-50 hover:bg-yellow-100 border border-yellow-200' :
                                    event.type === 'birthday' ? 'bg-pink-50 hover:bg-pink-100 border border-pink-200' :
                                    'bg-green-50 hover:bg-green-100 border border-green-200'
                                  }`}
                                  onClick={() => handleCalendarDateClick(date)}
                                >
                                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                                    event.type === 'holiday' ? 'bg-red-100 text-red-700' :
                                    event.type === 'leave' ? 'bg-yellow-100 text-yellow-700' :
                                    event.type === 'birthday' ? 'bg-pink-100 text-pink-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {event.allDay || event.type === 'holiday' || event.type === 'leave' || event.type === 'birthday' 
                                      ? 'all-day' 
                                      : event.time || '12:00 AM'
                                    }
                                  </span>
                                  <span className={`font-medium text-sm flex-1 ${
                                    event.type === 'holiday' ? 'text-red-800' :
                                    event.type === 'leave' ? 'text-yellow-800' :
                                    event.type === 'birthday' ? 'text-pink-800' :
                                    'text-green-800'
                                  }`}>
                                    {event.title}
                                  </span>
                                  {event.type === 'birthday' && (
                                    <CakeIcon className="w-4 h-4 text-pink-600" />
                                  )}
                                  {event.type === 'holiday' && (
                                    <Calendar className="w-4 h-4 text-red-600" />
                                  )}
                                  {event.type === 'leave' && (
                                    <Palmtree className="w-4 h-4 text-yellow-600" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      });
                    })()}
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

      {/* Profile Details Modal */}
      {showProfileModal && profileData && (
        <DetailModal
          open={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setProfileData(null);
          }}
          title="My Profile Details"
          data={profileData}
          sections={[
            {
              label: 'Personal Information',
              fields: [
                { key: 'firstName', label: 'First Name', icon: 'user' },
                { key: 'lastName', label: 'Last Name', icon: 'user' },
                { key: 'email', label: 'Email Address', type: 'email', icon: 'user' },
                { key: 'phone', label: 'Phone Number', type: 'phone', icon: 'user' },
                { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', icon: 'date' },
                { key: 'gender', label: 'Gender', icon: 'user' }
              ]
            },
            {
              label: 'Job Information',
              fields: [
                { key: 'employeeId', label: 'Employee ID', icon: 'description' },
                { key: 'designation', label: 'Designation', icon: 'description' },
                { key: 'department', label: 'Department', icon: 'department' },
                { key: 'joiningDate', label: 'Joining Date', type: 'date', icon: 'date' },
                { key: 'employmentType', label: 'Employment Type', icon: 'description' },
                { key: 'workLocation', label: 'Work Location', icon: 'location' },
                { key: 'reportingManager', label: 'Reporting Manager', icon: 'user' }
              ]
            },
            {
              label: 'Contact Information',
              fields: [
                { key: 'address', label: 'Address', type: 'longtext', fullWidth: true, icon: 'location' },
                { key: 'emergencyContact', label: 'Emergency Contact', icon: 'user' }
              ]
            },
            {
              label: 'Bank Information',
              fields: [
                { key: 'bankName', label: 'Bank Name', icon: 'description' },
                { key: 'accountNumber', label: 'Account Number', icon: 'description' },
                { key: 'ifscCode', label: 'IFSC Code', icon: 'description' }
              ]
            },
            {
              label: 'System Information',
              fields: [
                { key: 'role', label: 'Role', type: 'badge', badgeClass: 'bg-blue-100 text-blue-800' },
                { key: 'status', label: 'Status', type: 'status' },
                { key: 'lastLogin', label: 'Last Login', type: 'date', icon: 'date' },
                { key: 'createdAt', label: 'Account Created', type: 'date', icon: 'date' },
                { key: 'updatedAt', label: 'Last Updated', type: 'date', icon: 'date' }
              ]
            }
          ]}
          actions={[
            {
              label: 'Edit Profile',
              icon: Edit,
              onClick: () => {
                setShowProfileModal(false);
                navigate('/employee/profile');
              },
              variant: 'default'
            },
            {
              label: 'Close',
              onClick: () => {
                setShowProfileModal(false);
                setProfileData(null);
              },
              variant: 'outline'
            }
          ]}
        />
      )}
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