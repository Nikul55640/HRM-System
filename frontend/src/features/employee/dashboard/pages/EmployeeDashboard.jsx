import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import attendanceService from "../../../../services/attendanceService";
import dashboardService from "../../../dashboard/services/dashboardService";
import {
  LogIn,
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
      const data = await dashboardService.getDashboardData();
      setDashboardData(data.data);
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const res = await attendanceService.getAttendanceRecords({
        startDate: today,
        endDate: today,
      });
      if (res.data?.length > 0) setAttendanceStatus(res.data[0]);
    } catch (error) {
      console.error("Attendance Error:", error);
    }
  };

  const handleClockIn = async () => {
    try {
      setClockingIn(true);
      await attendanceService.clockIn({ location: "Office" });
      toast.success("Good morning! Clocked in successfully.");
      fetchAttendanceStatus();
    } catch (e) {
      toast.error("Clock In failed");
    } finally {
      setClockingIn(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setClockingOut(true);
      await attendanceService.clockOut({ location: "Office" });
      toast.success("Have a great evening! Clocked out.");
      fetchAttendanceStatus();
    } catch (e) {
      toast.error("Clock Out failed");
    } finally {
      setClockingOut(false);
    }
  };

  if (loading) {
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
    attendanceStatus?.checkInTime && !attendanceStatus?.checkOutTime;

  // Helper for greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto bg-gray-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {getGreeting()},{dashboardData?.personalInfo?.name || "Employee"}
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {format(new Date(), "EEEE, MMMM dd, yyyy")}
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-full border shadow-sm flex items-center gap-2 text-sm font-medium text-gray-600">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>{format(new Date(), "hh:mm a")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Attendance & Stats */}
        <div className="lg:col-span-2 space-y-8">
          {/* Attendance Action Card */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-900 to-indigo-700 text-white overflow-hidden  relative">
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
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
                        isClockedIn ? "bg-green-400 animate-pulse" : "bg-gray-400"
                      }`}
                    ></div>
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
                attendanceStatus?.checkInTime
                  ? format(new Date(attendanceStatus.checkInTime), "hh:mm a")
                  : "--:--"
              }
              bg="bg-blue-50"
            />
            <StatsCard
              icon={<TrendingUp className="text-green-600" />}
              label="Attendance Rate"
              value={`${dashboardData?.stats?.attendanceRate || 0}%`}
              bg="bg-green-50"
            />
            <StatsCard
              icon={<Briefcase className="text-purple-600" />}
              label="Pending Leaves"
              value={dashboardData?.stats?.leaveRequests || 0}
              bg="bg-purple-50"
            />
          </div>
        </div>

        {/* Right Column: Quick Actions & Navigation */}
        <div className="space-y-6">
          <Card className="shadow-sm border-gray-200 h-full">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">
                Quick Actions
              </CardTitle>
              <CardDescription>
                Manage your profile and requests
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <ActionButton
                icon={<CalendarDays size={20} />}
                label="Apply for Leave"
                desc="Request days off"
                color="text-orange-600 bg-orange-50"
                onClick={() => navigate("/ess/leave")}
              />
              <ActionButton
                icon={<FileText size={20} />}
                label="My Payslips"
                desc="View salary history"
                color="text-emerald-600 bg-emerald-50"
                onClick={() => navigate("/ess/payslips")}
              />
              <ActionButton
                icon={<User size={20} />}
                label="My Profile"
                desc="Update personal info"
                color="text-blue-600 bg-blue-50"
                onClick={() => navigate("/ess/profile")}
              />
            </CardContent>
          </Card>
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

// --- Sub Components for cleaner JSX ---

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