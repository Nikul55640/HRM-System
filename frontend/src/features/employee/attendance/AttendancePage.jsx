import React, { useEffect, useState } from "react";
import { useAttendance } from "../../admin/employees/useEmployeeSelfService";
import AttendanceSummary from "./AttendanceSummary";
import AttendanceCalendar from "../../calendar/AttendanceCalendar";
import EnhancedClockInOut from "./EnhancedClockInOut";
import SessionHistoryView from "./SessionHistoryView";
import { Download } from "lucide-react";
import { toast } from "react-toastify";
import {
  getCurrentFinancialYear,
  getMonthName,
  downloadBlob,
} from "../../../utils/essHelpers";

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

  useEffect(() => {
    getAttendanceRecords({ month: selectedMonth, year: selectedYear });
    getAttendanceSummary(selectedMonth, selectedYear);
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
      console.error("Export error:", error);
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <div className="flex gap-3">
          {/* Month Select */}
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

          {/* Year Select */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Enhanced Clock In/Out with Location Selection and Breaks */}
        <EnhancedClockInOut />

        {/* Attendance Summary */}
        <AttendanceSummary summary={attendanceSummary} />

        {/* Session History with Filters */}
        <SessionHistoryView />

        {/* Calendar View */}
        <AttendanceCalendar records={attendanceRecords} />
      </div>
    </div>
  );
};

export default AttendancePage;
