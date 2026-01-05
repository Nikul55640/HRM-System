// frontend/src/modules/employee/pages/Dashboard/EmployeeDashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../shared/ui/card";
import employeeDashboardService from "../../../../services/employeeDashboardService";
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
  Coffee,
  Play,
  Timer,
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
} from "lucide-react";
import { leaveService } from "../../../../services";
import useAttendanceSessionStore from "../../../../stores/useAttendanceSessionStore";
import { calendarService } from "../../../../services";
import { isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addWeeks, addMonths, subWeeks, subMonths } from "date-fns";



const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [todayActivities, setTodayActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Calendar state
  const [calendarView, setCalendarView] = useState('month'); // 'week' or 'month'
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
   todayRecord,
   isLoading,
   clockIn,
   clockOut,
   getAttendanceStatus,
   fetchTodayRecord,
 } = useAttendanceSessionStore();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardData(),
        fetchLeaveBalance(),
        fetchAttendanceSummary(),
        fetchTodayRecord(), // Fetch attendance data
        fetchCalendarEvents(), // Fetch calendar events
      ]);
      setLoading(false);
    };

    // Initialize attendance store
    const initializeStore = async () => {
      await fetchTodayRecord(true); // Initialize attendance data
    };

    fetchAllData();
    initializeStore();
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Refresh attendance data every 30 seconds to keep it in sync
    const attendanceRefreshTimer = setInterval(() => {
      fetchTodayRecord(true); // Silent refresh
    }, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(attendanceRefreshTimer);
    };
  }, [fetchTodayRecord]);

  // Fetch notifications on component mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await getNotifications({ limit: 5 }); // Get latest 5 notifications
      } catch (error) {
        console.warn('Failed to load notifications:', error);
      }
    };
    
    loadNotifications();
  }, [getNotifications]);

  // Update today activities when todayRecord changes
  useEffect(() => {
    if (todayRecord) {
      updateTodayActivities(todayRecord);
    } else {
      setTodayActivities([]);
    }
  }, [todayRecord]);



  const fetchDashboardData = async () => {
    try {
      const res = await employeeDashboardService.getDashboardData();
      console.log("DASHBOARD API DATA 👉", res.data);
      if (res.success) {
        setDashboardData(res.data);
      } else {
        console.warn('Dashboard API returned error:', res.message);
        toast.warn("Some dashboard data may be limited");
        // Set minimal fallback data only if API fails
        setDashboardData({
          personalInfo: { firstName: "Employee", lastName: "" },
          employeeId: "EMP-001",
          jobInfo: { jobTitle: "Employee" },
          stats: { attendanceRate: 0, leaveRequests: 0 }
        });
      }
    } catch (error) {
      console.error('Dashboard API error:', error);
      toast.error("Failed to load dashboard data");
      // Set minimal fallback data only on error
      setDashboardData({
        personalInfo: { firstName: "Employee", lastName: "" },
        employeeId: "EMP-001",
        jobInfo: { jobTitle: "Employee" },
        stats: { attendanceRate: 0, leaveRequests: 0 }
      });
    }
  };

  // Helper function to update today's activities based on attendance record
  const updateTodayActivities = (record) => {
    const activities = [];

    // Handle both new session format and legacy format
    if (record.sessions && record.sessions.length > 0) {
      // New session format
      record.sessions.forEach(session => {
        if (session.checkIn) {
          activities.push({
            time: format(new Date(session.checkIn), "hh:mm a"),
            activity: "Clock In",
            icon: "CheckCircle",
            status: "completed"
          });
        }

        // Add break activities
        if (session.breaks && Array.isArray(session.breaks)) {
          session.breaks.forEach(breakItem => {
            if (breakItem.startTime) {
              activities.push({
                time: format(new Date(breakItem.startTime), "hh:mm a"),
                activity: "Break Start",
                icon: "Coffee",
                status: "completed"
              });
            }
            if (breakItem.endTime) {
              activities.push({
                time: format(new Date(breakItem.endTime), "hh:mm a"),
                activity: "Break End",
                icon: "Play",
                status: "completed"
              });
            }
          });
        }

        if (session.checkOut) {
          activities.push({
            time: format(new Date(session.checkOut), "hh:mm a"),
            activity: "Clock Out",
            icon: "CheckCircle",
            status: "completed"
          });
        } else if (session.status === 'active') {
          activities.push({
            time: "--",
            activity: "Working...",
            icon: "Timer",
            status: "current"
          });
        } else if (session.status === 'on_break') {
          activities.push({
            time: "--",
            activity: "On Break...",
            icon: "Coffee",
            status: "current"
          });
        }
      });
    } else if (record.checkIn) {
      // Legacy format
      activities.push({
        time: format(new Date(record.checkIn), "hh:mm a"),
        activity: "Clock In",
        icon: "CheckCircle",
        status: "completed"
      });

      if (record.checkOut) {
        activities.push({
          time: format(new Date(record.checkOut), "hh:mm a"),
          activity: "Clock Out",
          icon: "CheckCircle",
          status: "completed"
        });
      } else {
        activities.push({
          time: "--",
          activity: "Working...",
          icon: "Timer",
          status: "current"
        });
      }
    }

    setTodayActivities(activities);
  };

  const fetchLeaveBalance = async () => {
    try {
      const res = await leaveService.getMyLeaveBalance();
      if (res.success) {
        console.log('✅ [DASHBOARD] Leave balance API response:', res.data);
        
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
      if (res.success) {
        console.log('✅ [DASHBOARD] Attendance summary API response:', res.data);
        // Normalize attendance summary after API call
        setAttendanceSummary({
          presentDays: res.data.presentDays ?? res.data.present ?? 0,
          absentDays: res.data.absentDays ?? res.data.absent ?? 0,
          lateDays: res.data.lateDays ?? res.data.late ?? 0,
          totalHours: res.data.totalHours ?? res.data.workedHours ?? 0,
          requiredHours: res.data.requiredHours ?? 160
        });
      } else {
        console.warn('Attendance summary API returned error:', res.message);
        // Set empty data instead of fallback
        setAttendanceSummary({
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          totalHours: 0,
          requiredHours: 160
        });
      }
    } catch (error) {
      console.error('Attendance summary API error:', error);
      // Set empty data instead of fallback
      setAttendanceSummary({
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        totalHours: 0,
        requiredHours: 160
      });
    }
  };

  // Calendar helper functions
  const fetchCalendarEvents = async () => {
    try {
      const startDate = calendarView === 'week' 
        ? startOfWeek(calendarDate).toISOString().split('T')[0]
        : startOfMonth(calendarDate).toISOString().split('T')[0];
      
      const endDate = calendarView === 'week'
        ? endOfWeek(calendarDate).toISOString().split('T')[0]
        : endOfMonth(calendarDate).toISOString().split('T')[0];

      const response = await calendarService.getEventsByDateRange(startDate, endDate);
      
      if (response && response.success) {
        const calendarData = response.data || {};
        
        const allEvents = [
          ...(calendarData.events || []).map(e => ({
            ...e,
            eventType: e.eventType || 'event',
            color: e.color || '#3B82F6'
          })),
          ...(calendarData.holidays || []).map(h => ({
            ...h,
            eventType: 'holiday',
            title: h.name || h.title,
            startDate: h.date || h.startDate,
            color: h.color || '#EF4444'
          })),
          ...(calendarData.leaves || []).map(l => ({
            ...l,
            eventType: 'leave',
            title: l.title || `${l.employeeName} - ${l.leaveType}`,
            color: l.color || '#F59E0B'
          })),
          ...(calendarData.birthdays || []).map(b => ({
            ...b,
            eventType: 'birthday',
            title: b.title || `🎂 ${b.employeeName}`,
            startDate: b.date || b.startDate,
            color: b.color || '#10B981'
          })),
          ...(calendarData.anniversaries || []).map(a => ({
            ...a,
            eventType: 'anniversary',
            title: a.title || `🎊 ${a.employeeName}`,
            startDate: a.date || a.startDate,
            color: a.color || '#8B5CF6'
          }))
        ];
        
        setCalendarEvents(allEvents);
      } else {
        setCalendarEvents([]);
      }
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
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
    if (calendarView === 'week') {
      setCalendarDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    } else {
      setCalendarDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    }
  };

  const handleCalendarDateClick = (date) => {
    // Navigate to full calendar page with selected date
    navigate(`/employee/calendar?date=${date.toISOString().split('T')[0]}`);
  };

  // Fetch calendar events when view or date changes
  useEffect(() => {
    fetchCalendarEvents();
  }, [calendarView, calendarDate]);

  // Refresh all dashboard data
  const refreshDashboard = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchLeaveBalance(),
        fetchAttendanceSummary(),
        fetchTodayRecord(true),
        getNotifications({ limit: 5 }),
        fetchCalendarEvents()
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
      const { isClockedIn } = getAttendanceStatus();
      
      if (isClockedIn) {
        toast.info("You are already clocked in for today");
        return;
      }

      const result = await clockIn({
        workLocation: 'office',
        locationDetails: 'Office',
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
        </div>
      </div>
    );
  }

  // Get attendance status from context
  const { isClockedIn } = getAttendanceStatus();
  const fullName = `${dashboardData?.personalInfo?.firstName || ""} ${
    dashboardData?.personalInfo?.lastName || ""
  }`.trim();

  // Calculate attendance stats from real data with safe fallbacks
  const attendanceStats = {
    present: attendanceSummary?.presentDays || 0,
    absent: attendanceSummary?.absentDays || 0,
    late: attendanceSummary?.lateDays || 0,
    workedHours: attendanceSummary?.totalHours || 0,
    requiredHours: attendanceSummary?.requiredHours || 160,
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 🟢 SECTION 1: HEADER */}
        <Card className="bg-white shadow-sm rounded-xl border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Left side */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Hello, {fullName || "Employee"}
                  <span className="ml-2 text-yellow-500">👋</span>
                </h1>
                <p className="text-sm text-gray-500">
                  Employee ID: {dashboardData.employeeId || "EMP-1023"}
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4" />
                  Current Time: {format(currentTime, "hh:mm a")}
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  isClockedIn 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isClockedIn ? "bg-green-500" : "bg-red-500"
                  }`} />
                  {isClockedIn ? "Clocked In" : "Clocked Out"}
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-4">
                {/* Refresh button */}
                <button
                  onClick={refreshDashboard}
                  disabled={loading}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh dashboard"
                >
                  <Activity className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                
                <div className="text-center space-y-2">
                  <button
                    onClick={isClockedIn ? handleClockOut : handleClockIn}
                    disabled={isLoading}
                    className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                      isClockedIn
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        {isClockedIn ? "Clock Out" : "Clock In"}
                      </>
                    )}
                  </button>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    Location: Office
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 🟢 SECTION 2: STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Attendance
              </div>
            }
            content={
              <div className="space-y-1">
                <div>Present: <span className="font-bold">{attendanceStats.present}</span></div>
                <div>Absent: <span className="font-bold">{attendanceStats.absent}</span></div>
                <div>Late: <span className="font-bold">{attendanceStats.late}</span></div>
              </div>
            }
            onClick={() => navigate("/employee/attendance")}
          />
          
          <StatCard
            title={
              <div className="flex items-center gap-2">
                <Palmtree className="w-4 h-4 text-green-600" />
                Leave Balance
              </div>
            }
            content={
              <div className="space-y-1">
                <div>Casual: <span className="font-bold">{leaveBalanceData.casual}</span></div>
                <div>Sick: <span className="font-bold">{leaveBalanceData.sick}</span></div>
              </div>
            }
            onClick={() => navigate("/employee/leave")}
          />
          
          <StatCard
            title={
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                This Month
              </div>
            }
            content={
              <div className="space-y-2">
                <div>Worked: <span className="font-bold">{attendanceStats.workedHours} hrs</span></div>
                <div>Required: <span className="font-bold">{attendanceStats.requiredHours} hrs</span></div>
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
                Bank Details
              </div>
            }
            content={
              <div className="space-y-2">
                <div className="font-medium">Manage Details</div>
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors">
                  View
                </button>
              </div>
            }
            onClick={() => navigate("/employee/bank-details")}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 🟢 SECTION 3: TODAY'S ACTIVITY TIMELINE */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-sm rounded-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Today – {format(new Date(), "dd MMM")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayActivities.length > 0 ? (
                    todayActivities.map((activity, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          activity.status === 'completed' ? 'bg-green-100' :
                          activity.status === 'current' ? 'bg-orange-100' : 'bg-gray-100'
                        }`}>
                          {activity.icon === 'CheckCircle' && (
                            <CheckCircle className={`w-4 h-4 ${
                              activity.status === 'completed' ? 'text-green-600' :
                              activity.status === 'current' ? 'text-orange-600 animate-pulse' : 'text-gray-600'
                            }`} />
                          )}
                          {activity.icon === 'Coffee' && (
                            <Coffee className={`w-4 h-4 ${
                              activity.status === 'completed' ? 'text-green-600' :
                              activity.status === 'current' ? 'text-orange-600 animate-pulse' : 'text-gray-600'
                            }`} />
                          )}
                          {activity.icon === 'Play' && (
                            <Play className={`w-4 h-4 ${
                              activity.status === 'completed' ? 'text-green-600' :
                              activity.status === 'current' ? 'text-orange-600 animate-pulse' : 'text-gray-600'
                            }`} />
                          )}
                          {activity.icon === 'Timer' && (
                            <Timer className={`w-4 h-4 ${
                              activity.status === 'completed' ? 'text-green-600' :
                              activity.status === 'current' ? 'text-orange-600 animate-pulse' : 'text-gray-600'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{activity.activity}</span>
                            <span className="text-sm text-gray-500">{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">No activities recorded for today</p>
                      <p className="text-sm">Clock in to start tracking your day</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 🟢 SECTION 4: QUICK ACTIONS */}
            <Card className="bg-white shadow-sm rounded-xl border-0 mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <QuickActionButton
                    icon={<FileText className="w-6 h-6" />}
                    label="Apply Leave"
                    onClick={() => navigate("/employee/leave")}
                  />
                  <QuickActionButton
                    icon={<BarChart3 className="w-6 h-6" />}
                    label="Attendance History"
                    onClick={() => navigate("/employee/attendance")}
                  />
                  <QuickActionButton
                    icon={<CreditCard className="w-6 h-6" />}
                    label="Bank Details"
                    onClick={() => navigate("/employee/bank-details")}
                  />
                  <QuickActionButton
                    icon={<User className="w-6 h-6" />}
                    label="My Profile"
                    onClick={() => navigate("/employee/profile")}
                  />
                  {/* Only show leads if user has permission */}
                  {can.do(MODULES.LEAD.VIEW) && (
                    <QuickActionButton
                      icon={<Target className="w-6 h-6" />}
                      label="My Leads"
                      onClick={() => navigate("/employee/leads")}
                    />
                  )}
                  {/* <QuickActionButton
                    icon={<AlertCircle className="w-6 h-6" />}
                    label="API Test"
                    onClick={() => navigate("/api-test")}
                  /> */}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* 🟢 SECTION 5: NOTIFICATIONS */}
            <Card className="bg-white shadow-sm rounded-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="w-5 h-5 text-yellow-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notificationsLoading ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Loading notifications...</p>
                    </div>
                  ) : notificationsError ? (
                    <div className="text-center py-4">
                      <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-red-600">Failed to load notifications</p>
                    </div>
                  ) : notifications && notifications.length > 0 ? (
                    <>
                      {notifications.slice(0, 5).map((notification, index) => (
                        <div 
                          key={notification.id || index} 
                          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            notification.read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
                          }`}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                              {notification.message || notification.title}
                            </span>
                            {notification.createdAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                {format(new Date(notification.createdAt), 'MMM dd, hh:mm a')}
                              </p>
                            )}
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      ))}
                      <button 
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        onClick={() => navigate('/notifications')}
                      >
                        View all →
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No notifications</p>
                      <p className="text-xs">You're all caught up!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 🟢 ENHANCED CALENDAR */}
            <Card className="bg-white shadow-sm rounded-xl border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Calendar
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCalendarView('week')}
                      className={`px-2 py-1 text-xs rounded ${
                        calendarView === 'week' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setCalendarView('month')}
                      className={`px-2 py-1 text-xs rounded ${
                        calendarView === 'month' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Month
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => navigateCalendar('prev')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-medium text-gray-900">
                    {calendarView === 'week' 
                      ? `Week of ${format(getWeekStart(calendarDate), "MMM dd, yyyy")}`
                      : format(calendarDate, "MMMM yyyy")
                    }
                  </h3>
                  <button
                    onClick={() => navigateCalendar('next')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {calendarView === 'month' ? (
                  <>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="font-medium text-gray-500 p-1">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {getMonthDays(calendarDate).map((day, i) => {
                        const isToday = day && isSameDay(day, new Date());
                        const isCurrentMonth = day && day.getMonth() === calendarDate.getMonth();
                        const hasEvents = day && calendarEvents.some(event => 
                          isSameDay(new Date(event.startDate), day)
                        );
                        
                        return (
                          <div
                            key={i}
                            className={`aspect-square flex items-center justify-center text-xs rounded cursor-pointer relative ${
                              isToday ? 'bg-blue-500 text-white font-bold' :
                              isCurrentMonth ? 'hover:bg-gray-100 text-gray-700' :
                              'text-gray-300'
                            }`}
                            onClick={() => day && handleCalendarDateClick(day)}
                          >
                            {day ? day.getDate() : ''}
                            {hasEvents && (
                              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    {getWeekDays(calendarDate).map((day, i) => {
                      const isToday = isSameDay(day, new Date());
                      const dayEvents = calendarEvents.filter(event => 
                        isSameDay(new Date(event.startDate), day)
                      );
                      
                      return (
                        <div
                          key={i}
                          className={`p-2 rounded cursor-pointer transition-colors ${
                            isToday ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleCalendarDateClick(day)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${
                                isToday ? 'text-blue-600' : 'text-gray-900'
                              }`}>
                                {format(day, 'EEE dd')}
                              </span>
                              {isToday && (
                                <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                                  Today
                                </span>
                              )}
                            </div>
                            {dayEvents.length > 0 && (
                              <div className="flex items-center gap-1">
                                {dayEvents.slice(0, 2).map((event, idx) => (
                                  <div
                                    key={idx}
                                    className="w-2 h-2 rounded-full"
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
                              {dayEvents.slice(0, 2).map((event, idx) => (
                                <div key={idx} className="text-xs text-gray-600 truncate">
                                  {event.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-200 rounded"></div>
                    <span className="text-gray-600">Holiday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                    <span className="text-gray-600">On Leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-200 rounded"></div>
                    <span className="text-gray-600">Events</span>
                  </div>
                </div>
                
                <button 
                  className="w-full mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() => navigate('/employee/calendar')}
                >
                  View Full Calendar →
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
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="text-sm text-gray-600">
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
    className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 group"
  >
    <div className="text-blue-600 mb-2 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="text-sm font-medium text-gray-700 text-center">{label}</span>
  </button>
);

QuickActionButton.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default EmployeeDashboard;
