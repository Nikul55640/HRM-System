// frontend/src/modules/employee/pages/Dashboard/EmployeeDashboard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../shared/ui/card";
// Zustand stores imported but not used directly in this component
// Data is fetched via services instead
import employeeDashboardService from "../../../../services/employeeDashboardService";
import attendanceService from "../../../../core/services/attendanceService";
import {
  LogOut,
  CalendarDays,
  FileText,
  User,
  Clock,
  TrendingUp,
  Briefcase,
  HelpCircle,
  ChevronRight,
  Timer,
} from "lucide-react";
import { format } from "date-fns";

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockingIn, setClockingIn] = useState(false);
  const [clockingOut, setClockingOut] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchAttendanceStatus();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if employeeDashboardService is available
      if (typeof employeeDashboardService === 'undefined') {
        toast.error("Dashboard service not available");
        setLoading(false);
        return;
      }
      
      const res = await employeeDashboardService.getDashboardData();
      
      if (res.success) {
        setDashboardData(res.data);
      } else {
        toast.error(res.message || "Failed to load dashboard");
      }
    } catch (error) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      
      const res = await attendanceService.getMyAttendance({
        startDate: today,
        endDate: today,
      });
      
      // Backend returns {success: true, data: [...]}
      if (res.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setAttendanceStatus(res.data[0]);
      } else {
        setAttendanceStatus(null);
      }
    } catch (error) {
      // Silent error handling for attendance status
    }
  };

  const handleClockIn = async () => {
    try {
      setClockingIn(true);
      
      await attendanceService.checkIn("Office");
      
      toast.success("Good morning! Clocked in successfully.");
      
      // Wait a bit for backend to process, then fetch status
      setTimeout(() => {
        fetchAttendanceStatus();
      }, 500);
    } catch (e) {
      const errorMessage = e.message || "Clock In failed";
      if (errorMessage.includes("Already checked in")) {
        toast.info("You're already clocked in for today!");
        // Refresh status to show current state
        fetchAttendanceStatus();
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setClockingIn(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setClockingOut(true);
      
      await attendanceService.checkOut("Office");
      
      toast.success("Have a great evening! Clocked out.");
      
      // Wait a bit for backend to process, then fetch status
      setTimeout(() => {
        fetchAttendanceStatus();
      }, 500);
    } catch (e) {
      const errorMessage = e.message || "Clock Out failed";
      if (errorMessage.includes("Already checked out")) {
        toast.info("You've already clocked out for today!");
        fetchAttendanceStatus();
      } else if (errorMessage.includes("No check-in found")) {
        toast.warning("Please clock in first before clocking out.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setClockingOut(false);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 font-medium animate-pulse">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  const isClockedIn =
    attendanceStatus?.checkIn && !attendanceStatus?.checkOut;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const fullName = `${dashboardData.personalInfo?.firstName || ""} ${
    dashboardData.personalInfo?.lastName || ""
  }`.trim();

  return (
    <div className="p-6 md:p-10 space-y-5 max-w-7xl mx-auto bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {getGreeting()},{fullName || " Employee"}
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {format(new Date(), "EEEE, MMMM dd, yyyy")}
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded border shadow-sm flex items-center gap-2 text-sm font-medium text-gray-600">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>{format(new Date(), "hh:mm a")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Right Column: Quick Profile & Actions */}
        <div className="space-y-6">
          <Card className="shadow-sm border-gray-200 h-full">
            <CardHeader className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded  bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow">
                {(
                  dashboardData.personalInfo?.firstName?.[0] || ""
                ).toUpperCase()}
                {(
                  dashboardData.personalInfo?.lastName?.[0] || ""
                ).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900 leading-tight">
                  {dashboardData.personalInfo?.firstName || "Employee"}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {dashboardData.jobInfo?.jobTitle || "Employee"}
                </CardDescription>
                <p className="text-xs text-gray-400">
                  ID: {dashboardData.employeeId || "--"}
                </p>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 mt-4">
              <ActionButton
                icon={<CalendarDays size={20} />}
                label="Apply for Leave"
                desc="Request days off"
                color="text-orange-600 bg-orange-50"
                onClick={() => navigate("/leave")}
              />
              <ActionButton
                icon={<FileText size={20} />}
                label="My Payslips"
                desc="View salary history"
                color="text-emerald-600 bg-emerald-50"
                onClick={() => navigate("/payslips")}
              />
              <ActionButton
                icon={<User size={20} />}
                label="My Profile"
                desc="Update personal info"
                color="text-blue-600 bg-blue-50"
                onClick={() => navigate("/profile")}
              />
            </CardContent>
          </Card>
        </div>

        {/* Left Column: Attendance, Stats & People/Events */}
        <div className="lg:col-span-2 space-y-8">
          {/* Attendance Card */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-900 to-indigo-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-10 translate-x-10" />
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div>
                <h2 className="text-2xl font-bold mb-2">Attendance Tracker</h2>
                <p className="text-indigo-100 mb-6 max-w-sm">
                  {isClockedIn
                    ? "You are currently clocked in. Don't forget to clock out before you leave."
                    : "Ready to start your day? Clock in to begin tracking your attendance."}
                </p>
                <div className="flex items-center gap-4">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${
                      isClockedIn
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isClockedIn
                          ? "bg-green-400 animate-pulse"
                          : "bg-gray-400"
                      }`}
                    />
                    {isClockedIn ? "Currently Active" : "Currently Inactive"}
                  </div>
                </div>
              </div>

              <button
                onClick={isClockedIn ? handleClockOut : handleClockIn}
                disabled={clockingIn || clockingOut}
                className={`group relative flex items-center justify-center w-32 h-32 rounded-full border-4 transition-all duration-300 shadow-xl ${
                  isClockedIn
                    ? "bg-red-500 border-red-400 hover:bg-red-600 hover:scale-105"
                    : "bg-white text-indigo-900 border-indigo-200 hover:scale-105"
                }`}
              >
                <div className="flex flex-col items-center">
                  {isClockedIn ? (
                    <LogOut className="w-8 h-8 mb-1" />
                  ) : (
                    <Timer className="w-8 h-8 mb-1" />
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isClockedIn ? "Clock Out" : "Clock In"}
                  </span>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard
              icon={<Clock className="text-blue-600" />}
              label="Check In Time"
              value={
                attendanceStatus?.checkIn
                  ? format(new Date(attendanceStatus.checkIn), "hh:mm a")
                  : "--:--"
              }
              bg="bg-blue-50"
            />
            <StatsCard
              icon={<TrendingUp className="text-green-600" />}
              label="Attendance Rate"
              value={`${dashboardData.stats?.attendanceRate || 0}%`}
              bg="bg-green-50"
            />
            <StatsCard
              icon={<Briefcase className="text-purple-600" />}
              label="Approved Leaves (30d)"
              value={dashboardData.stats?.leaveRequests || 0}
              bg="bg-purple-50"
            />
          </div>

          {/* People & Events Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Birthdays */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-md text-gray-900 flex items-center gap-2">
                  🎂 Birthdays
                </CardTitle>
                <CardDescription>Today & upcoming 7 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.birthdays?.length > 0 ? (
                  dashboardData.birthdays.map((emp, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {emp.name}
                        {emp.isToday && (
                          <span className="ml-2 text-xs text-pink-500 font-semibold">
                            Today 🎉
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(emp.date), "MMM dd")}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">
                    No birthdays in the next week
                  </p>
                )}
              </CardContent>
            </Card>

            {/* On Leave Today */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-md text-gray-900 flex items-center gap-2">
                  🏖️ On Leave Today
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.leaveToday?.length > 0 ? (
                  dashboardData.leaveToday.map((emp, i) => (
                    <div key={i} className="text-sm text-gray-700">
                      • {emp.name} — {emp.type}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">
                    No one is on leave today
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Work From Home */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-md text-gray-900 flex items-center gap-2">
                  🏡 Working From Home
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.wfhToday?.length > 0 ? (
                  dashboardData.wfhToday.map((emp, i) => (
                    <div key={i} className="text-sm text-gray-700">
                      • {emp.name} {emp.type ? `— ${emp.type}` : ""}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">
                    No one is working from home today
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Weekly Calendar */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-md text-gray-900 flex items-center gap-2">
                  📅 This Week
                </CardTitle>
                <CardDescription>
                  Leaves, Holidays & Half Days (for you)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.weekEvents?.length > 0 ? (
                  dashboardData.weekEvents.map((day, i) => (
                    <div
                      key={i}
                      className="rounded bg-gray-50 p-2 flex justify-between text-sm"
                    >
                      <span>{format(new Date(day.date), "EEE dd")}</span>
                      <span className={`font-medium ${day.color}`}>
                        {day.event}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">
                    No events scheduled this week
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer / Help */}
      <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="p-3 bg-gray-100 rounded-full">
            <HelpCircle className="text-gray-600 w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Need Assistance?</h3>
            <p className="text-sm text-gray-500">
              Contact HR regarding attendance or payroll issues.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/help")}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          Go to Support Center <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// --- Sub Components ---

const StatsCard = ({ icon, label, value, bg }) => (
  <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <h3 className="text-xl font-bold text-gray-900">{value}</h3>
      </div>
    </CardContent>
  </Card>
);

const ActionButton = ({ icon, label, desc, color, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center w-full p-3 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-gray-50 transition-all group text-left"
  >
    <div
      className={`p-3 rounded-lg ${color} mr-4 group-hover:scale-110 transition-transform`}
    >
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
        {label}
      </h4>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400" />
  </button>
);

export default EmployeeDashboard;