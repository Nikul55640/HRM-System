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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/select';

import { Badge } from '../../../shared/ui/badge';
import { LoadingSpinner } from '../../../shared/components';

import useLeaveStore from '../../../stores/useLeaveStore';
import { Calendar, Clock, User, FileText, CheckCircle, XCircle } from 'lucide-react';

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
  const [actionLoading, setActionLoading] = useState(false);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  console.log('📊 [LeaveManagement] Rendering with leaveRequests:', leaveRequests);

  return (
    <div className="container mx-auto px-4 py-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Leave Management</h1>
        <p className="text-gray-600 mt-1">
          Review and manage employee leave requests
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

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
                  <SelectItem value="annual">Annual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal Leave</SelectItem>
                  <SelectItem value="maternity">Maternity Leave</SelectItem>
                  <SelectItem value="paternity">Paternity Leave</SelectItem>
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

      {/* Leave Requests List */}
      <div className="grid gap-4">
        {!leaveRequests || leaveRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No leave requests found
              </h3>
              <p className="text-gray-500">
                No leave requests match your current filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          leaveRequests.map((request) => (
            <Card key={request._id || request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">

                <div className="flex items-start justify-between">

                  {/* Left Section */}
                  <div className="flex-1">

                    {/* Employee info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-500" />
                        <span className="font-medium text-gray-800">
                          {request.employee?.firstName} {request.employee?.lastName}
                        </span>
                      </div>

                      <span className="text-sm text-gray-500">
                        ID: {request.employee?.employeeId}
                      </span>

                      {getStatusBadge(request.status)}
                    </div>

                    {/* Leave Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Leave Type</p>
                          <p className="font-medium capitalize">{request.leaveType || request.type}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-medium">
                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </p>
                          <p className="text-sm text-gray-500">
                            ({request.totalDays || calculateDuration(request.startDate, request.endDate, request.isHalfDay)} day{(request.totalDays || 1) !== 1 ? 's' : ''})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Applied On</p>
                          <p className="font-medium">{formatDate(request.createdAt)}</p>
                        </div>
                      </div>

                    </div>

                    {/* Reason */}
                    {request.reason && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Reason:</p>
                        <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                          {request.reason}
                        </p>
                      </div>
                    )}

                    {/* HR Comments */}
                    {request.hrComments && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">HR Comments:</p>
                        <p className="text-gray-800 bg-blue-50 p-3 rounded-lg">
                          {request.hrComments}
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Actions */}
                  {request.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleApprove(request._id || request.id)}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {actionLoading ? 'Approving...' : 'Approve'}
                      </Button>

                      <Button
                        onClick={() => setSelectedRequest(request)}
                        disabled={actionLoading}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {/* Status indicator for non-pending requests */}
                  {request.status !== 'pending' && (
                    <div className="ml-4 text-sm text-gray-500">
                      {request.status === 'approved' && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Approved
                        </div>
                      )}
                      {request.status === 'rejected' && (
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle className="w-4 h-4" />
                          Rejected
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* -----------------------------------------------------
         Rejection Modal
      ------------------------------------------------------ */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reject Leave Request</CardTitle>
            </CardHeader>

            <CardContent>

              {/* Employee Info */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Employee: {selectedRequest.employee?.firstName} {selectedRequest.employee?.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  Leave: {formatDate(selectedRequest.startDate)} - {formatDate(selectedRequest.endDate)}
                </p>
              </div>

              {/* Rejection Reason */}
              <div className="mb-4">
                <Label>Reason for Rejection *</Label>
                <textarea
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg resize-none"
                  rows="4"
                  placeholder="Please provide a reason..."
                  onChange={(e) =>
                    setSelectedRequest((prev) => ({
                      ...prev,
                      rejectionReason: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end">
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
                  {actionLoading ? "Rejecting..." : "Reject Request"}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
};

export default LeaveManagement;
