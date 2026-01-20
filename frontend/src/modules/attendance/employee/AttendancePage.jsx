import React, { useEffect, useState } from "react";
import { useAttendance } from "../../../services/useEmployeeSelfService";
import AttendanceSummary from "./AttendanceSummary";
import EnhancedClockInOut from "./EnhancedClockInOut";
import SessionHistoryView from "./SessionHistoryView";
import AttendanceStatsWidget from "./AttendanceStatsWidget";
import ShiftStatusWidget from "../components/ShiftStatusWidget";
import { Download, AlertTriangle, Clock, CheckCircle, Calendar, BarChart3, History } from "lucide-react";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/ui/tabs";
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
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 rounded-xl ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 py-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Attendance Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your attendance and manage your work schedule</p>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {getMonthName(m)}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <Button onClick={handleExport} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Alerts */}
        <div className="space-y-3 mb-6">
          {todayStats.isLate && (
            <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
              <CardContent className="py-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
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

          {todayStats.hasIncompleteRecords && (
            <Card className="border-l-4 border-l-orange-500 bg-orange-50">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-800">
                        Incomplete attendance record detected
                      </p>
                      <p className="text-sm text-orange-600">
                        You have an incomplete attendance record. Please submit a correction request if needed.
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                    Incomplete
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {!todayStats.isLate && !todayStats.hasIncompleteRecords && todayStats.status === 'present' && (
            <Card className="border-l-4 border-l-green-500 bg-green-50">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">
                        Great job! You're on time today
                      </p>
                      <p className="text-sm text-green-600">
                        Keep up the excellent attendance record.
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    On Time
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Clock In/Out & Shift Status */}
          <div className="xl:col-span-1 space-y-4">
            <ShiftStatusWidget />
            <EnhancedClockInOut />
          </div>

          {/* Right Column - Tabbed Content */}
          <div className="xl:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <AttendanceSummary 
                  summary={attendanceSummary} 
                  period={`${getMonthName(selectedMonth)} ${selectedYear}`}
                />
              </TabsContent>

              <TabsContent value="history" className="space-y-4 mt-4">
                <SessionHistoryView />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4 mt-4">
                <AttendanceStatsWidget 
                  todayRecord={Array.isArray(attendanceRecords) ? attendanceRecords.find(r => r.date === new Date().toISOString().split('T')[0]) : null} 
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;