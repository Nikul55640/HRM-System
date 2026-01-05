import React, { useEffect, useState } from "react";
import { useAttendance } from "../../../services/useEmployeeSelfService";
import AttendanceSummary from "./AttendanceSummary";
import EnhancedClockInOut from "./EnhancedClockInOut";
import SessionHistoryView from "./SessionHistoryView";
import AttendanceStatsWidget from "./AttendanceStatsWidget";
import ShiftStatusWidget from "../components/ShiftStatusWidget";
import { Download, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Badge } from "../../../shared/ui/badge";
import {
  getMonthName,
  downloadBlob,
} from "../../ess/utils/essHelpers";

const AttendancePage = () => {
  const {
    attendanceRecords,
    attendanceSummary,
    loading,
    error,
    getAttendanceRecords,
    getAttendanceSummary,
    exportReport,
  } = useAttendance();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [todayStats, setTodayStats] = useState({
    isLate: false,
    lateMinutes: 0,
    status: null,
    hasIncompleteRecords: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('📊 [ATTENDANCE PAGE] Fetching data for:', { month: selectedMonth, year: selectedYear });
        
        const records = await getAttendanceRecords({ month: selectedMonth, year: selectedYear });
        console.log('📊 [ATTENDANCE PAGE] Records result:', records);
        
        const summary = await getAttendanceSummary(selectedMonth, selectedYear);
        console.log('📊 [ATTENDANCE PAGE] Summary result:', summary);

        // ✅ NEW: Check for today's attendance status
        if (records && Array.isArray(records)) {
          const today = new Date().toISOString().split('T')[0];
          const todayRecord = records.find(record => record.date === today);
          
          if (todayRecord) {
            setTodayStats({
              isLate: todayRecord.isLate || false,
              lateMinutes: todayRecord.lateMinutes || 0,
              status: todayRecord.status,
              hasIncompleteRecords: todayRecord.status === 'incomplete'
            });
          }
        } else if (records && records.data && Array.isArray(records.data)) {
          // Handle case where records is wrapped in a data object
          const today = new Date().toISOString().split('T')[0];
          const todayRecord = records.data.find(record => record.date === today);
          
          if (todayRecord) {
            setTodayStats({
              isLate: todayRecord.isLate || false,
              lateMinutes: todayRecord.lateMinutes || 0,
              status: todayRecord.status,
              hasIncompleteRecords: todayRecord.status === 'incomplete'
            });
          }
        }
        
      } catch (error) {
        console.error('📊 [ATTENDANCE PAGE] Error fetching data:', error);
        console.warn('Error fetching attendance data:', error);
      }
    };
    
    fetchData();
  }, [getAttendanceRecords, getAttendanceSummary, selectedMonth, selectedYear]);

  const handleExport = async () => {
    try {
      toast.info("Exporting attendance report...");
      const result = await exportReport(selectedMonth, selectedYear);

      if (result.meta.requestStatus === "fulfilled") {
        const blob = result.payload;
        downloadBlob(
          blob,
          `Attendance_Report_${getMonthName(selectedMonth)}_${selectedYear}.pdf`
        );
        toast.success("Attendance report exported successfully");
      } else {
        throw new Error(result.payload || "Export failed");
      }
    } catch (error) {
      // Log error for debugging
      console.warn('Export error:', error);
      toast.error("Failed to export attendance report");
    }
  };
  if (loading && !attendanceRecords) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-600">Loading attendance data...</p>
      </div>
    );
  }

  if (error && !attendanceRecords) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900 font-semibold">Error: {error}</p>
        </div>
      </div>
    );
  }

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = [2023, 2024, 2025];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Attendance</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Month Select */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {getMonthName(m)}
              </option>
            ))}
          </select>

          {/* Year Select */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 w-full sm:w-auto btn-touch"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
      <Card className="rounded-2xl shadow-sm border border-gray-100 mb-6">
  <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <h1 className="text-2xl font-semibold text-gray-900">
      Attendance
    </h1>

    <div className="flex flex-wrap gap-3">
      {/* Month */}
 <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {getMonthName(m)}
              </option>
            ))}
          </select>
      {/* Year */}
      <select className="px-4 py-2 rounded-full border bg-white text-sm">
        ...
      </select>

      {/* Export */}
      <button className="px-4 py-2 bg-blue-600 text-white rounded-full flex items-center gap-2">
        <Download className="w-4 h-4" />
        Export
      </button>
    </div>
  </CardContent>
</Card>


      <div className="space-y-6">
        {/* ✅ NEW: Today's Status Alert */}
        {todayStats.isLate && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">
                    You were late today by {todayStats.lateMinutes} minutes
                  </p>
                  <p className="text-sm text-yellow-600">
                    Please ensure to clock in on time to maintain good attendance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ✅ NEW: Incomplete Records Alert */}
        {todayStats.hasIncompleteRecords && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">
                    Incomplete attendance record detected
                  </p>
                  <p className="text-sm text-orange-600">
                    You have an incomplete attendance record. Please submit a correction request if needed.
                  </p>
                </div>
                <Badge className="bg-orange-100 text-orange-800">
                  Incomplete
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ✅ NEW: Good Attendance Recognition */}
        {!todayStats.isLate && !todayStats.hasIncompleteRecords && todayStats.status === 'present' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    Great job! You're on time today
                  </p>
                  <p className="text-sm text-green-600">
                    Keep up the excellent attendance record.
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  On Time
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shift Status Notifications and Progress */}
        <ShiftStatusWidget />

        {/* Enhanced Clock In/Out with Location Selection and Breaks */}
        <EnhancedClockInOut />

        {/* Attendance Summary */}
        <AttendanceSummary 
          summary={attendanceSummary} 
          period={`${getMonthName(selectedMonth)} ${selectedYear}`}
        />
        
        <AttendanceStatsWidget 
          summary={attendanceSummary} 
        />
        
        {/* Session History with Filters */}
        <SessionHistoryView />
        
      </div>
    </div>
  );
};

export default AttendancePage;