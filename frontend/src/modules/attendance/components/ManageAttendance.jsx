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
import AttendanceForm from './AttendanceForm';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'on-leave', label: 'On Leave' },
  { value: 'holiday', label: 'Holiday' },
];

const statusVariant = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-yellow-100 text-yellow-800',
  'on-leave': 'bg-blue-100 text-blue-800',
  holiday: 'bg-purple-100 text-purple-800',
};

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
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(1)),
    to: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);

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
      // For now, we'll just update the record status
      await updateAttendanceRecord(recordId, {
        correctionStatus: 'approved',
        correctionNotes: 'Correction approved by admin'
      });
      // Refresh the list
      fetchAttendanceRecords({});
    } catch (error) {
      alert('Failed to approve correction');
    }
  };

  const handleRejectCorrection = async (recordId) => {
    try {
      // For now, we'll just update the record status
      await updateAttendanceRecord(recordId, {
        correctionStatus: 'rejected',
        correctionNotes: 'Correction rejected by admin'
      });
      // Refresh the list
      fetchAttendanceRecords({});
    } catch (error) {
      alert('Failed to reject correction');
    }
  };

  const getStatusBadge = (status) => (
    <Badge className={cn('capitalize', statusVariant[status] || 'bg-gray-100 text-gray-800')}>
      {status.replace('-', ' ')}
    </Badge>
  );

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return format(parseISO(timeString), 'hh:mm a');
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <div className="text-sm font-medium">Error loading attendance data</div>
            </div>
            <div className="text-sm text-red-600 mt-1">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                View and manage employee attendance records
              </CardDescription>
            </div>
            <div className="mt-4 flex space-x-2 md:mt-0">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button size="sm" onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Record
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
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
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
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
      <div className="grid gap-4 md:grid-cols-4">
        {statistics && Object.entries(statistics).map(([key, value]) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                <BarChart2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">
                {key === 'present' ? 'Employees present today' : ''}
                {key === 'absent' ? 'Employees absent today' : ''}
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
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Working Hours</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                      <p className="mt-2">Loading attendance records...</p>
                    </TableCell>
                  </TableRow>
                ) : safeAttendance.length > 0 ? (
                  safeAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            {record.employee?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium">{record.employee?.name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">
                              {record.employee?.employeeId || '--'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{format(parseISO(record.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{formatTime(record.clockIn)}</TableCell>
                      <TableCell>{formatTime(record.clockOut)}</TableCell>
                      <TableCell>{record.workingHours || '--:--'}</TableCell>
                      <TableCell>
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowActionMenu(showActionMenu === record.id ? null : record.id)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          {showActionMenu === record.id && (
                            <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <div className="py-1">
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
                                {record.correctionRequested && (
                                  <>
                                    <button
                                      onClick={() => {
                                        handleApproveCorrection(record._id || record.id);
                                        setShowActionMenu(null);
                                      }}
                                      className="block w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50"
                                    >
                                      Approve Correction
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleRejectCorrection(record._id || record.id);
                                        setShowActionMenu(null);
                                      }}
                                      className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                                    >
                                      Reject Correction
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this record?')) {
                                      deleteAttendanceRecord(record._id || record.id);
                                    }
                                    setShowActionMenu(null);
                                  }}
                                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{(safePagination.page - 1) * safePagination.limit + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(safePagination.page * safePagination.limit, safePagination.total)}
          </span>{' '}
          of <span className="font-medium">{safePagination.total}</span> records
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(safePagination.page - 1)}
            disabled={safePagination.page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(safePagination.page + 1)}
            disabled={safePagination.page * safePagination.limit >= safePagination.total}
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
                await updateAttendanceRecord(selectedRecord._id || selectedRecord.id, data);
              } else {
                // For creating new records, we'll need to implement this in the store
                alert('Creating new records is not yet implemented');
              }
              setShowAddModal(false);
              setSelectedRecord(null);
            } catch (error) {
              alert('Failed to save record');
            }
          }}
        />
      )}
    </div>
  );
};

export default ManageAttendance;
