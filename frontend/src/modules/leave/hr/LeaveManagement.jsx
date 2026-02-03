import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../../../shared/ui/card';

import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Textarea } from '../../../shared/ui/textarea';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/select';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/ui/table';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../shared/ui/dropdown-menu';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../shared/ui/dialog';

import { Badge } from '../../../shared/ui/badge';
import { LoadingSpinner } from '../../../shared/components';

import useLeaveStore from '../../../stores/useLeaveStore';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  MoreHorizontal,
  Eye,
  ChevronUp,
  ChevronDown,
  Filter,
  Loader2
} from 'lucide-react';

const LeaveManagement = () => {
  const { 
    leaveRequests, 
    loading, 
    fetchLeaveRequests,
    approveLeaveRequest,
    rejectLeaveRequest
  } = useLeaveStore();

  const [filters, setFilters] = useState({
    status: 'all',
    leaveType: 'all',
    dateRange: 'all',
    search: ''
  });

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewRequest, setViewRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // ---------------------------------------------------------
  // ✅ FIXED: loadLeaveRequests must be declared BEFORE useEffect
  // ---------------------------------------------------------
  const loadLeaveRequests = useCallback(async () => {
    try {
      console.log('📋 [LeaveManagement] Loading leave requests with filters:', filters);
      await fetchLeaveRequests(filters);
    } catch (error) {
      console.error('❌ [LeaveManagement] Error loading leave requests:', error);
      // Errors handled inside store
    }
  }, [filters, fetchLeaveRequests]);

  // ---------------------------------------------------------
  // Load leave requests when filters change
  // ---------------------------------------------------------
  useEffect(() => {
    console.log('🔄 [LeaveManagement] useEffect triggered, loading requests...');
    loadLeaveRequests();
  }, [loadLeaveRequests]);


  // ---------------------------------------------------------
  // Approve Leave
  // ---------------------------------------------------------
  const handleApprove = async (requestId, comments = '') => {
    setActionLoading(true);
    try {
      await approveLeaveRequest(requestId, comments);
      setSelectedRequest(null);
      // No need to reload - store already updates the local state
    } catch (error) {
      // Error is already handled in the store with toast
      console.error('Approval failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Reject Leave
  // ---------------------------------------------------------
  const handleReject = async (requestId, comments) => {
    if (!comments?.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      await rejectLeaveRequest(requestId, comments);
      setSelectedRequest(null);
      // No need to reload - store already updates the local state
    } catch (error) {
      // Error is already handled in the store with toast
      
    } finally {
      setActionLoading(false);
    }
  };

  // Badge UI
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (startDate, endDate, isHalfDay) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (isHalfDay && diffDays === 1) {
      return '0.5 days';
    }

    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key || !data) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle nested employee data
      if (sortConfig.key === 'employee') {
        aValue = `${a.employee?.firstName} ${a.employee?.lastName}`;
        bValue = `${b.employee?.firstName} ${b.employee?.lastName}`;
      }

      // Handle date sorting
      if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate' || sortConfig.key === 'createdAt') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const SortableHeader = ({ children, sortKey, className = "" }) => (
    <TableHead 
      className={`cursor-pointer hover:bg-gray-50 ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'asc' ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  console.log('📊 [LeaveManagement] Rendering with leaveRequests:', leaveRequests);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Leave Management</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Review and manage employee leave requests
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-4 sm:mb-6 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div>
              <Label>Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Leave Type</Label>
              <Select 
                value={filters.leaveType} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, leaveType: value }))}
              >
                <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="paid">Paid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date Range</Label>
              <Select 
                value={filters.dateRange} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger><SelectValue placeholder="All Dates" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Search Employee</Label>
              <Input
                placeholder="Search by name or ID..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <LeaveRequestsTable
        loading={loading}
        data={getSortedData(leaveRequests)}
        onView={(request) => setViewRequest(request)}
        onApprove={(request) => handleApprove(request._id || request.id)}
        onReject={(request) => setSelectedRequest(request)}
        getStatusBadge={getStatusBadge}
        formatDate={formatDate}
        formatDateTime={formatDateTime}
        calculateDuration={calculateDuration}
        SortableHeader={SortableHeader}
        actionLoading={actionLoading}
      />

      {/* VIEW MODAL */}
      {viewRequest && (
        <Dialog open onOpenChange={() => setViewRequest(null)}>
          <DialogContent className="max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Leave Request Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Employee & Request Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Employee Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <div className="font-medium">
                        {viewRequest.employee?.firstName} {viewRequest.employee?.lastName}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Employee ID:</span>
                      <div className="font-medium">{viewRequest.employee?.employeeId}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Department:</span>
                      <div className="font-medium">{viewRequest.employee?.department?.name || 'N/A'}</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Request Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Leave Type:</span>
                      <div className="font-medium capitalize">
                        {viewRequest.leaveType || viewRequest.type}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <div className="mt-1">
                        {getStatusBadge(viewRequest.status)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Applied On:</span>
                      <div className="font-medium">
                        {formatDateTime(viewRequest.createdAt)}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Leave Duration */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Leave Duration
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 font-medium">Start Date:</span>
                    <div className="text-blue-800 font-semibold">
                      {formatDate(viewRequest.startDate)}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">End Date:</span>
                    <div className="text-blue-800 font-semibold">
                      {formatDate(viewRequest.endDate)}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Duration:</span>
                    <div className="text-blue-800 font-semibold">
                      {viewRequest.totalDays || calculateDuration(viewRequest.startDate, viewRequest.endDate, viewRequest.isHalfDay)}
                    </div>
                  </div>
                </div>

                {viewRequest.isHalfDay && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="text-xs text-blue-700 font-medium">
                      Half Day Leave
                    </div>
                  </div>
                )}
              </Card>

              {/* Employee Reason */}
              {viewRequest.reason && (
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Employee's Reason</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {viewRequest.reason}
                  </div>
                </Card>
              )}

              {/* HR Comments */}
              {viewRequest.hrComments && (
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">HR Comments</h4>
                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    {viewRequest.hrComments}
                  </div>
                </Card>
              )}

              {/* Processing History */}
              {viewRequest.status !== 'pending' && (
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Processing History</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className="font-medium capitalize">{viewRequest.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Processed at:</span>
                      <span className="font-medium">
                        {viewRequest.updatedAt ? formatDateTime(viewRequest.updatedAt) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* REJECTION MODAL */}
      {selectedRequest && (
        <Dialog open onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-lg flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Reject Leave Request
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Employee Info */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium">
                    {selectedRequest.employee?.firstName} {selectedRequest.employee?.lastName}
                  </div>
                  <div className="text-gray-600">
                    {formatDate(selectedRequest.startDate)} - {formatDate(selectedRequest.endDate)}
                  </div>
                  <div className="text-gray-600 capitalize">
                    {selectedRequest.leaveType || selectedRequest.type}
                  </div>
                </div>
              </div>

              {/* Rejection Reason */}
              <div>
                <Label className="text-sm font-medium">
                  Reason for Rejection <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  className="mt-1 text-sm"
                  rows="4"
                  placeholder="Please provide a reason for rejection..."
                  onChange={(e) =>
                    setSelectedRequest((prev) => ({
                      ...prev,
                      rejectionReason: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() => setSelectedRequest(null)}
                >
                  Cancel
                </Button>

                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={actionLoading || !selectedRequest.rejectionReason?.trim()}
                  onClick={() =>
                    handleReject(
                      selectedRequest._id || selectedRequest.id,
                      selectedRequest.rejectionReason
                    )
                  }
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};

/* ================= TABLE COMPONENT ================= */

const LeaveRequestsTable = ({
  loading,
  data,
  onView,
  onApprove,
  onReject,
  getStatusBadge,
  formatDate,
  formatDateTime,
  calculateDuration,
  SortableHeader,
  actionLoading,
}) => {
  if (loading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-12">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin w-6 h-6 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Loading leave requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <FileText className="mx-auto w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No leave requests found
            </h3>
            <p className="text-sm">
              No leave requests match your current filters.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Leave Requests
          </CardTitle>
          <div className="text-sm text-gray-500">
            {data.length} request{data.length !== 1 ? 's' : ''}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <SortableHeader sortKey="employee" className="min-w-[200px]">
                  Employee
                </SortableHeader>
                <SortableHeader sortKey="leaveType" className="min-w-[120px]">
                  Leave Type
                </SortableHeader>
                <SortableHeader sortKey="startDate" className="min-w-[120px]">
                  Start Date
                </SortableHeader>
                <SortableHeader sortKey="endDate" className="min-w-[120px]">
                  End Date
                </SortableHeader>
                <TableHead className="min-w-[100px]">Duration</TableHead>
                <SortableHeader sortKey="status" className="min-w-[100px]">
                  Status
                </SortableHeader>
                {/* <TableHead className="min-w-[100px]">Reason</TableHead> */}
                <SortableHeader sortKey="createdAt" className="min-w-[140px]">
                  Applied On
                </SortableHeader>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((request) => (
                <TableRow key={request._id || request.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">
                          {request.employee?.firstName} {request.employee?.lastName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          ID: {request.employee?.employeeId}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium capitalize">
                      {request.leaveType || request.type}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {formatDate(request.startDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {formatDate(request.endDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {request.totalDays || calculateDuration(request.startDate, request.endDate, request.isHalfDay)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(request.status)}
                  </TableCell>
                  {/* <TableCell>
                    <div className="text-sm text-gray-600 max-w-[200px] truncate">
                      {request.reason || 'No reason provided'}
                    </div>
                  </TableCell> */}
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {formatDate(request.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onView(request)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {request.status === 'pending' && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => onApprove(request)}
                              disabled={actionLoading}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onReject(request)}
                              disabled={actionLoading}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveManagement;
