import React, { useEffect, useState } from 'react';
import { useAttendance } from '../../../features/employees/useEmployeeSelfService';
import AttendanceSummary from './AttendanceSummary';
import AttendanceCalendar from '../../../features/calendar/AttendanceCalendar';
import ClockInOut from '../../../components/employee-self-service/attendance/ClockInOut';
import { Button } from '../../../components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { getCurrentFinancialYear, getMonthName, downloadBlob } from '../../../utils/essHelpers';

const AttendancePage = () => {
  const { 
    attendanceRecords, 
    attendanceSummary, 
    loading, 
    error, 
    getAttendanceRecords, 
    getAttendanceSummary,
    exportReport
  } = useAttendance();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    getAttendanceRecords({ month: selectedMonth, year: selectedYear });
    getAttendanceSummary(selectedMonth, selectedYear);
  }, [getAttendanceRecords, getAttendanceSummary, selectedMonth, selectedYear]);

  const handleExport = async () => {
    try {
      toast.info('Exporting attendance report...');
      const result = await exportReport(selectedMonth, selectedYear);
      
      // Handle Redux Toolkit AsyncThunk result
      if (result.meta.requestStatus === 'fulfilled') {
        const blob = result.payload;
        downloadBlob(blob, `Attendance_Report_${getMonthName(selectedMonth)}_${selectedYear}.pdf`);
        toast.success('Attendance report exported successfully');
      } else {
        throw new Error(result.payload || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export attendance report');
    }
  };

  if (loading && !attendanceRecords) {
    return <div className="p-6 text-center">Loading attendance data...</div>;
  }

  if (error && !attendanceRecords) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = [2023, 2024, 2025]; // Should be dynamic in real app

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <div className="flex gap-4">
          <Select 
            value={selectedMonth.toString()} 
            onValueChange={(v) => setSelectedMonth(parseInt(v))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m} value={m.toString()}>{getMonthName(m)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={selectedYear.toString()} 
            onValueChange={(v) => setSelectedYear(parseInt(v))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <ClockInOut />
      <AttendanceSummary summary={attendanceSummary} />
      <AttendanceCalendar records={attendanceRecords} />
    </div>
  );
};

export default AttendancePage;
