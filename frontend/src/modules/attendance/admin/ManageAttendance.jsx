import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Button } from '../../../shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/ui/table';
import { Badge } from '../../../shared/ui/badge';
import { Input } from '../../../shared/ui/input';
import { Search, Download, Plus, Loader2, Calendar as CalendarIcon, BarChart2, MoreHorizontal } from 'lucide-react';
import useAttendanceStore from '../../../stores/useAttendanceStore';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shared/ui/popover';
import { Calendar } from '../../../shared/ui/calendar';
import { cn } from '../../../lib/utils';
import { formatDate } from '../../../lib/date-utils.js';
import AttendanceForm from '../components/AttendanceForm';
import AttendanceViewModal from './AttendanceViewModal'; // ✅ NEW: Import view modal
import api from '../../../services/api';
import { getEmployeeFullName, getEmployeeInitials } from '../../../utils/employeeDataMapper';
import { mapAttendanceRecord, getStatusDisplay, getStatusColor, formatTime } from '../../../utils/attendanceDataMapper';

/**
 * ManageAttendance Component
 * 
 * Attendance Logic Summary:
 * 1. Working Day: Clock-in/out required. No clock-in = ABSENT (not leave)
 * 2. Holiday/Festival: No clock-in/out required. System skips finalization
 * 3. Leave Day: Approved leave = No clock-in required, marked as LEAVE
 * 4. Status Types:
 *    - present: Full attendance with proper clock-in/out
 *    - half_day: Partial attendance (less than full day hours)
 *    - absent: No clock-in on working day OR insufficient hours
 *    - leave: Approved leave request (protected status)
 *    - incomplete: Pending finalization (temporary status)
 *    - pending_correction: Missed clock-out, requires correction
 *    - holiday: System-detected holiday (auto-status) ✅ NOW DISPLAYED
 * 
 * ✅ HOLIDAY RECORDS:
 * - Holiday records are now included in the attendance table
 * - Holiday rows have blue background highlighting
 * - Clock In/Out columns show "Holiday" instead of times
 * - Late Minutes shows "N/A" for holidays
 * - Working Hours shows "Holiday" for holiday records
 * - Edit/Delete actions are disabled for holiday records (view-only)
 */

const ManageAttendance = () => {
  const { 
    attendanceRecords: attendance, 
    loading, 
    pagination, 
    error,
    fetchAttendanceRecords,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    exportAttendanceReport,
    setPagination
  } = useAttendanceStore();

  // Initialize default values to prevent undefined errors
  const safeAttendance = attendance || [];
  const safePagination = pagination || { currentPage: 1, itemsPerPage: 10, totalItems: 0 };
  const statistics = null; // We'll need to implement this separately
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusOptions, setStatusOptions] = useState([]);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    to: new Date(), // Today
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false); // ✅ NEW: View modal state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);

  useEffect(() => {
    loadStatusOptions();
  }, []);

  const loadStatusOptions = async () => {
    try {
      const response = await api.get('/admin/attendance-status/filters');
      if (response.data.success) {
        setStatusOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error loading status options:', error);
      // Fallback to hardcoded options - aligned with backend status values
      setStatusOptions([
        { value: 'all', label: 'All Status' },
        { value: 'present', label: 'Present' },
        { value: 'leave', label: 'On Leave' }, // ✅ FIXED: Use 'leave' instead of 'on-leave'
        { value: 'half_day', label: 'Half Day' }, // ✅ ADDED: Half day status
        { value: 'incomplete', label: 'Incomplete' }, // ✅ Missing clock-out
        { value: 'holiday', label: 'Holiday' }, // ✅ Include holiday records
        { value: 'absent', label: 'Absent' }, // ✅ ADDED: Absent status
        { value: 'pending_correction', label: 'Pending Correction' },
      ]);
    } finally {
      // Remove setLoadingOptions since we removed the variable
    }
  };

  // Fetch attendance data on component mount and when filters change
  useEffect(() => {
    const params = {
      page: safePagination.page || 1,
      limit: safePagination.limit || 10,
      search: searchQuery,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      startDate: formatDate(dateRange.from),
      endDate: formatDate(dateRange.to),
    };

    fetchAttendanceRecords(params);
  }, [fetchAttendanceRecords, safePagination.page, safePagination.limit, searchQuery, statusFilter, dateRange]);

  const handlePageChange = (page) => {
    setPagination({ page });
    const params = {
      page: page,
      limit: safePagination.limit || 10,
      search: searchQuery,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      startDate: formatDate(dateRange.from),
      endDate: formatDate(dateRange.to),
    };
    fetchAttendanceRecords(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ page: 1 });
    const params = {
      page: 1,
      limit: safePagination.limit || 10,
      search: searchQuery,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      startDate: formatDate(dateRange.from),
      endDate: formatDate(dateRange.to),
    };
    fetchAttendanceRecords(params);
  };

  const handleExport = async () => {
    try {
      const params = {
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        startDate: formatDate(dateRange.from),
        endDate: formatDate(dateRange.to),
      };

      await exportAttendanceReport(params);
    } catch (error) {
      alert('Export failed');
    }
  };

  const handleApproveCorrection = async (recordId) => {
    try {
      // ✅ FIXED: Use correction request endpoint with correct path
      const response = await api.put(`/admin/attendance-corrections/requests/${recordId}/approve`, {
        adminNotes: 'Correction approved by admin'
      });
      
      if (response.data.success) {
        // Refresh the list to show updated status
        const params = {
          page: safePagination.page || 1,
          limit: safePagination.limit || 10,
          search: searchQuery,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          startDate: formatDate(dateRange.from),
          endDate: formatDate(dateRange.to),
        };
        fetchAttendanceRecords(params);
      } else {
        alert('Failed to approve correction: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error approving correction:', error);
      alert('Failed to approve correction: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRejectCorrection = async (recordId) => {
    try {
      // ✅ FIXED: Use correction request endpoint with correct path
      const response = await api.put(`/admin/attendance-corrections/requests/${recordId}/reject`, {
        adminNotes: 'Correction rejected by admin'
      });
      
      if (response.data.success) {
        // Refresh the list to show updated status
        const params = {
          page: safePagination.page || 1,
          limit: safePagination.limit || 10,
          search: searchQuery,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          startDate: formatDate(dateRange.from),
          endDate: formatDate(dateRange.to),
        };
        fetchAttendanceRecords(params);
      } else {
        alert('Failed to reject correction: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error rejecting correction:', error);
      alert('Failed to reject correction: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusBadge = (record) => {
    const mappedRecord = mapAttendanceRecord(record);
    const statusDisplay = getStatusDisplay(record.status, record.isLate, record.lateMinutes);
    const statusColor = getStatusColor(record.status, record.isLate);
    
    return (
      <Badge className={cn('capitalize', statusColor)}>
        {statusDisplay}
      </Badge>
    );
  };

  const formatTimeDisplay = (timeString) => {
    return formatTime(timeString);
  };

  return (
    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 text-red-800">
              <div className="text-sm font-medium">Error loading attendance data</div>
            </div>
            <div className="text-sm text-red-600 mt-1">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg">Attendance Records</CardTitle>
              <CardDescription className="text-sm">
                View and manage employee attendance records
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" size="sm" onClick={handleExport} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button size="sm" onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Record
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-2">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search employees..."
                  className="w-full appearance-none bg-background pl-8 shadow-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
            <div>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span className="truncate">
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          <span className="hidden sm:inline">
                            {format(dateRange.from, 'LLL dd, y')} -{' '}
                            {format(dateRange.to, 'LLL dd, y')}
                          </span>
                          <span className="sm:hidden">
                            {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                          </span>
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    setShowDatePicker(false);
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        {statistics && Object.entries(statistics).map(([key, value]) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium capitalize truncate">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </CardTitle>
              <div className="h-3 w-3 text-muted-foreground flex-shrink-0">
                <BarChart2 className="h-3 w-3" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-lg font-bold">{value}</div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {key === 'present' ? 'Employees present today' : ''}
                {key === 'leave' ? 'Employees on leave today' : ''}
                {key === 'absent' ? 'Employees absent today' : ''}
                {key === 'holiday' ? 'Employees on holiday today' : ''}
                {key === 'late' ? 'Employees late today' : ''}
                {key === 'onLeave' ? 'Employees on leave' : ''}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendance Table */}
      <Card>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Employee</TableHead>
                  <TableHead className="min-w-[100px]">Date</TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
                  <TableHead className="min-w-[80px]">Clock In</TableHead>
                  <TableHead className="min-w-[80px]">Clock Out</TableHead>
                  <TableHead className="min-w-[80px] hidden sm:table-cell">Late Minutes</TableHead>
                  <TableHead className="min-w-[100px] hidden md:table-cell">Working Hours</TableHead>
                  <TableHead className="w-[60px] sm:w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                      <p className="mt-2 text-sm">Loading attendance records...</p>
                    </TableCell>
                  </TableRow>
                ) : safeAttendance.length > 0 ? (
                  safeAttendance.map((record) => {
                    return (
                      <TableRow key={record.id} className={
                        record.status === 'incomplete' ? 'bg-orange-50' : 
                        record.status === 'holiday' ? 'bg-blue-50' : 
                        record.isLate ? 'bg-red-50' : ''
                      }>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center font-semibold text-xs flex-shrink-0">
                              {getEmployeeInitials(record.employee)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm truncate">
                                {getEmployeeFullName(record.employee)}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {record.employee?.employeeId || '--'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{format(parseISO(record.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{getStatusBadge(record)}</TableCell>
                        <TableCell>
                          <div className={record.isLate ? 'text-red-600 font-medium' : ''}>
                            <div className="text-sm">
                              {record.status === 'holiday' ? (
                                <span className="text-blue-600">Holiday</span>
                              ) : (
                                formatTimeDisplay(record.clockIn)
                              )}
                            </div>
                            {record.isLate && record.status !== 'holiday' && (
                              <div className="text-xs text-red-500">
                                {record.lateMinutes}m late
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={record.status === 'incomplete' ? 'text-orange-600 font-medium' : ''}>
                            <div className="text-sm">
                              {record.status === 'holiday' ? (
                                <span className="text-blue-600">Holiday</span>
                              ) : record.clockOut ? (
                                formatTimeDisplay(record.clockOut)
                              ) : record.status === 'incomplete' ? (
                                <span className="text-orange-600">Missing</span>
                              ) : (
                                '--:--'
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {record.status === 'holiday' ? (
                            <span className="text-blue-600 text-sm">N/A</span>
                          ) : record.isLate ? (
                            <span className="text-red-600 font-medium text-sm">{record.lateMinutes}m</span>
                          ) : (
                            <span className="text-green-600 text-sm">0m</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {record.status === 'holiday' ? (
                            <span className="text-blue-600">Holiday</span>
                          ) : record.workHours ? (
                            `${record.workHours}h`
                          ) : (
                            '--'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowActionMenu(showActionMenu === record.id ? null : record.id)}
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            {showActionMenu === record.id && (
                              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                  {/* ✅ NEW: View Details Action */}
                                  <button
                                    onClick={() => {
                                      setSelectedRecord(record);
                                      setShowActionMenu(null);
                                      setShowViewModal(true);
                                    }}
                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    View Details
                                  </button>
                                  {/* Only show edit/delete for non-holiday records or allow holiday editing */}
                                  {record.status !== 'holiday' && (
                                    <button
                                      onClick={() => {
                                        setSelectedRecord(record);
                                        setShowActionMenu(null);
                                        setShowAddModal(true);
                                      }}
                                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      Edit
                                    </button>
                                  )}
                                  {record.correctionRequested && (
                                    <>
                                      <button
                                        onClick={() => {
                                          handleApproveCorrection(record.id);
                                          setShowActionMenu(null);
                                        }}
                                        className="block w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50"
                                      >
                                        Approve Correction
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleRejectCorrection(record.id);
                                          setShowActionMenu(null);
                                        }}
                                        className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                                      >
                                        Reject Correction
                                      </button>
                                    </>
                                  )}
                                  {/* Only allow deletion of non-holiday records */}
                                  {record.status !== 'holiday' && (
                                    <button
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this record?')) {
                                          deleteAttendanceRecord(record.id);
                                        }
                                        setShowActionMenu(null);
                                      }}
                                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No attendance records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-2">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          Showing <span className="font-medium">{(safePagination.page - 1) * safePagination.limit + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(safePagination.page * safePagination.limit, safePagination.total)}
          </span>{' '}
          of <span className="font-medium">{safePagination.total}</span> records
        </div>
        <div className="flex items-center justify-center sm:justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(safePagination.page - 1)}
            disabled={safePagination.page === 1}
            className="w-20"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(safePagination.page + 1)}
            disabled={safePagination.page * safePagination.limit >= safePagination.total}
            className="w-16"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AttendanceForm
          record={selectedRecord}
          onClose={() => {
            setShowAddModal(false);
            setSelectedRecord(null);
          }}
          onSubmit={async (data) => {
            try {
              if (selectedRecord) {
                await updateAttendanceRecord(selectedRecord.id, data);
              } else {
                // For creating new records, we'll need to implement this in the store
                alert('Creating new records is not yet implemented');
              }
              setShowAddModal(false);
              setSelectedRecord(null);
              // Refresh the data
              const params = {
                page: safePagination.page || 1,
                limit: safePagination.limit || 10,
                search: searchQuery,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                startDate: formatDate(dateRange.from),
                endDate: formatDate(dateRange.to),
              };
              fetchAttendanceRecords(params);
            } catch (error) {
              alert('Failed to save record');
            }
          }}
        />
      )}

      {/* ✅ NEW: View Modal */}
      {showViewModal && (
        <AttendanceViewModal
          record={selectedRecord}
          onClose={() => {
            setShowViewModal(false);
            setSelectedRecord(null);
          }}
        />
      )}
    </div>
  );
};

export default ManageAttendance;
