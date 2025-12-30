import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Calendar, Download, Filter, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AttendanceSummary from '../employee/AttendanceSummary';
import api from '../../../services/api';

const AttendanceSummaryPage = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    department: 'all',
    employeeId: 'all'
  });

  useEffect(() => {
    fetchAttendanceSummary();
    fetchEmployeeList();
  }, [filters.month, filters.year, filters.department, filters.employeeId]);

  const fetchAttendanceSummary = async () => {
    try {
      setLoading(true);
      const params = {
        month: filters.month,
        year: filters.year,
        ...(filters.department !== 'all' && { department: filters.department }),
        ...(filters.employeeId !== 'all' && { employeeId: filters.employeeId })
      };

      const response = await api.get('/admin/attendance/summary', { params });
      
      if (response.data.success) {
        setSummaryData(response.data.data);
      } else {
        // Fallback demo data for testing
        setSummaryData({
          presentDays: 18,
          absentDays: 2,
          lateDays: 3,
          earlyDepartures: 1,
          totalWorkedMinutes: 8640, // 144 hours
          averageWorkHours: 8.0,
          totalDays: 20
        });
        toast.info('Showing demo data - API endpoint not fully implemented');
      }
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      // Fallback demo data
      setSummaryData({
        presentDays: 18,
        absentDays: 2,
        lateDays: 3,
        earlyDepartures: 1,
        totalWorkedMinutes: 8640,
        averageWorkHours: 8.0,
        totalDays: 20
      });
      toast.error('Failed to load attendance summary. Showing demo data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeList = async () => {
    try {
      const response = await api.get('/employees', { params: { limit: 100 } });
      if (response.data.success) {
        setEmployeeList(response.data.data.employees || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleExport = async () => {
    try {
      toast.info('Exporting attendance summary...');
      const params = {
        month: filters.month,
        year: filters.year,
        format: 'xlsx',
        ...(filters.department !== 'all' && { department: filters.department }),
        ...(filters.employeeId !== 'all' && { employeeId: filters.employeeId })
      };

      const response = await api.get('/admin/attendance/export', { 
        params,
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Attendance_Summary_${getMonthName(filters.month)}_${filters.year}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Attendance summary exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export attendance summary');
    }
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const departments = ['Engineering', 'HR', 'Sales', 'Marketing', 'Finance'];
  const years = [2023, 2024, 2025];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Summary</h1>
          <p className="text-gray-600 mt-1">
            Overview of attendance metrics and trends
          </p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Month */}
            <Select
              value={filters.month.toString()}
              onValueChange={(value) => setFilters(prev => ({ ...prev, month: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {getMonthName(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year */}
            <Select
              value={filters.year.toString()}
              onValueChange={(value) => setFilters(prev => ({ ...prev, year: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department */}
            <Select
              value={filters.department}
              onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Employee */}
            <Select
              value={filters.employeeId}
              onValueChange={(value) => setFilters(prev => ({ ...prev, employeeId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employeeList.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.personalInfo?.firstName} {emp.personalInfo?.lastName} ({emp.employeeId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary Component */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading attendance summary...</span>
          </div>
        </div>
      ) : (
        <AttendanceSummary 
          summary={summaryData} 
          period={`${getMonthName(filters.month)} ${filters.year}`}
        />
      )}

      {/* Additional Insights */}
      {summaryData && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Department Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Department breakdown will be available when backend API is implemented</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Trend analysis will be available when historical data is implemented</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AttendanceSummaryPage;