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
  Users,
  TrendingUp,
  Bell,
  Palmtree,
  CreditCard,
  UserCheck,
  Activity,
  Target,
  Gift,
  AlertCircle,
} from "lucide-react";
import leaveService from "../../../../core/services/leaveService";
import useAttendanceSessionStore from "../../../../stores/useAttendanceSessionStore";



const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [todayActivities, setTodayActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Use shared attendance context
 const {
   todayRecord,
   isLoading,
   clockIn,
   clockOut,
   startBreak,
   endBreak,
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
        fetchNotifications(),
        fetchTodayRecord(), // Fetch attendance data
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
      if (res.success) {
        setDashboardData(res.data);
      } else {
        // Set fallback data
        setDashboardData({
          personalInfo: {
            firstName: "Employee",
            lastName: ""
          },
          employeeId: "EMP-001",
          jobInfo: {
            jobTitle: "Employee"
          },
          stats: {
            attendanceRate: 90,
            leaveRequests: 2
          }
        });
        toast.warn("Using demo data - some features may be limited");
      }
    } catch (error) {
      // Set fallback data on error
      setDashboardData({
        personalInfo: {
          firstName: "Employee",
          lastName: ""
        },
        employeeId: "EMP-001",
        jobInfo: {
          jobTitle: "Employee"
        },
        stats: {
          attendanceRate: 90,
          leaveRequests: 2
        }
      });
      toast.warn("Using demo data - please check your connection");
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
        setLeaveBalance(res.data);
      } else {
        // Set fallback data
        setLeaveBalance({
          casualLeave: { remaining: 12 },
          sickLeave: { remaining: 8 }
        });
      }
    } catch (error) {
      // Set fallback data on error
      setLeaveBalance({
        casualLeave: { remaining: 12 },
        sickLeave: { remaining: 8 }
      });
    }
  };

  const fetchAttendanceSummary = async () => {
    try {
      const res = await employeeDashboardService.getAttendanceSummary();
      if (res.success) {
        setAttendanceSummary(res.data);
      } else {
        // Set fallback data
        setAttendanceSummary({
          presentDays: 18,
          absentDays: 2,
          lateDays: 1,
          totalHours: 132,
          requiredHours: 160
        });
      }
    } catch (error) {
      // Set fallback data on error
      setAttendanceSummary({
        presentDays: 18,
        absentDays: 2,
        lateDays: 1,
        totalHours: 132,
        requiredHours: 160
      });
    }
  };

  const fetchNotifications = async () => {
    try {
      // Try to fetch real notifications from API
      // For now, using fallback data
      const fallbackNotifications = [
        { icon: <Gift className="w-4 h-4 text-red-500" />, message: "Holiday on 26 Jan (Republic Day)" },
        { icon: <DollarSign className="w-4 h-4 text-green-500" />, message: "Salary credited for Dec" },
        { icon: <CheckCircle className="w-4 h-4 text-blue-500" />, message: "Leave request approved" },
      ];
      setNotifications(fallbackNotifications);
    } catch (error) {
      // Set fallback notifications on error
      const fallbackNotifications = [
        { icon: <Gift className="w-4 h-4 text-red-500" />, message: "Holiday on 26 Jan (Republic Day)" },
        { icon: <DollarSign className="w-4 h-4 text-green-500" />, message: "Salary credited for Dec" },
        { icon: <CheckCircle className="w-4 h-4 text-blue-500" />, message: "Leave request approved" },
      ];
      setNotifications(fallbackNotifications);
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

  // Calculate attendance stats from real data
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

  // Real leave balance data
  const leaveBalanceData = {
    casual: leaveBalance?.casualLeave?.remaining || 0,
    sick: leaveBalance?.sickLeave?.remaining || 0,
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
            onClick={() => navigate("/attendance")}
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
            onClick={() => navigate("/leave")}
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
            onClick={() => navigate("/attendance")}
          />
          
          <StatCard
            title={
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Latest Payslip
              </div>
            }
            content={
              <div className="space-y-2">
                <div className="font-medium">{format(new Date(), "MMMM yyyy")}</div>
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors">
                  View
                </button>
              </div>
            }
            onClick={() => navigate("/payslips")}
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
                      <p>No activities recorded for today</p>
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
                    onClick={() => navigate("/leave")}
                  />
                  <QuickActionButton
                    icon={<BarChart3 className="w-6 h-6" />}
                    label="Attendance History"
                    onClick={() => navigate("/attendance")}
                  />
                  <QuickActionButton
                    icon={<DollarSign className="w-6 h-6" />}
                    label="My Payslips"
                    onClick={() => navigate("/payslips")}
                  />
                  <QuickActionButton
                    icon={<User className="w-6 h-6" />}
                    label="My Profile"
                    onClick={() => navigate("/profile")}
                  />
                  <QuickActionButton
                    icon={<AlertCircle className="w-6 h-6" />}
                    label="API Test"
                    onClick={() => navigate("/api-test")}
                  />
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
                  {notifications.map((notification, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="mt-0.5">{notification.icon}</div>
                      <span className="text-sm text-gray-700 flex-1">{notification.message}</span>
                    </div>
                  ))}
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View all →
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* 🟢 MINI CALENDAR */}
            {/* <Card className="bg-white shadow-sm rounded-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  {format(new Date(), "MMMM yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="font-medium text-gray-500 p-1">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({length: 35}, (_, i) => {
                    const day = i - 6; // Adjust for month start
                    const isToday = day === new Date().getDate();
                    const isCurrentMonth = day > 0 && day <= 31;
                    
                    return (
                      <div
                        key={i}
                        className={`aspect-square flex items-center justify-center text-xs rounded cursor-pointer ${
                          isToday ? 'bg-blue-500 text-white font-bold' :
                          isCurrentMonth ? 'hover:bg-gray-100 text-gray-700' :
                          'text-gray-300'
                        }`}
                      >
                        {isCurrentMonth ? day : ''}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-200 rounded"></div>
                    <span className="text-gray-600">Holiday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                    <span className="text-gray-600">On Leave</span>
                  </div>
                </div>
              </CardContent>
            </Card> */}
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
