import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../../shared/ui/table';
import { Select } from '../../../shared/ui/select';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import Pagination from '../../../shared/components/Pagination';
import attendanceService from '../../attendance/services/attendanceService';

const AttendanceHistory = ({ employeeId }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchAttendanceHistory();
  }, [employeeId, filters, pagination.page]);

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getEmployeeAttendance(employeeId, {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      setAttendanceRecords(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages
      }));
    } catch (error) {
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      present: 'success',
      absent: 'destructive',
      late: 'warning',
      'half-day': 'info',
      holiday: 'secondary'
    };
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const calculateWorkingHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return '-';
    
    const start = new Date(`2000-01-01T${clockIn}`);
    const end = new Date(`2000-01-01T${clockOut}`);
    const diff = (end - start) / (1000 * 60 * 60); // Convert to hours
    
    return `${diff.toFixed(1)}h`;
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Attendance History</CardTitle>
          <div className="flex space-x-2">
            <Select
              value={filters.month}
              onValueChange={(value) => setFilters({ ...filters, month: parseInt(value) })}
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </Select>
            <Select
              value={filters.year}
              onValueChange={(value) => setFilters({ ...filters, year: parseInt(value) })}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {attendanceRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No attendance records found for the selected period</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Working Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="font-medium">
                        {formatDate(record.date)}
                      </div>
                    </TableCell>
                    <TableCell>{formatTime(record.clockIn)}</TableCell>
                    <TableCell>{formatTime(record.clockOut)}</TableCell>
                    <TableCell className="font-medium">
                      {calculateWorkingHours(record.clockIn, record.clockOut)}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {record.notes || '-'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {pagination.totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceHistory;