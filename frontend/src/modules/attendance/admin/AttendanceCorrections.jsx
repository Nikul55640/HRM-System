import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Badge } from '../../../shared/ui/badge';
import { Textarea } from '../../../shared/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../shared/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Calendar, Clock, User, AlertTriangle, CheckCircle, Edit3, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import DebugUserRole from '../../../components/DebugUserRole';

const AttendanceCorrections = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [processedRequests, setProcessedRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionForm, setActionForm] = useState({
    adminNotes: ''
  });
  const [filters, setFilters] = useState({
    employeeId: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  });
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingRequests();
    } else {
      fetchProcessedRequests();
    }
  }, [activeTab, filters]);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const params = { status: 'pending' };
      if (filters.employeeId) params.employeeId = filters.employeeId;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      const response = await api.get('/admin/attendance-corrections/requests', { params });
      
      if (response.data.success) {
        setPendingRequests(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch pending requests');
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      toast.error(error.message || 'Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchProcessedRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.employeeId) params.employeeId = filters.employeeId;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.status && filters.status !== 'pending') params.status = filters.status;

      const response = await api.get('/admin/attendance-corrections/requests', { params });
      
      if (response.data.success) {
        // Filter out pending requests for processed tab
        const processedData = response.data.data.filter(req => req.status !== 'pending');
        setProcessedRequests(processedData);
      } else {
        toast.error(response.data.message || 'Failed to fetch processed requests');
      }
    } catch (error) {
      console.error('Error fetching processed requests:', error);
      toast.error(error.message || 'Failed to fetch processed requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const response = await api.put(`/admin/attendance-corrections/requests/${requestId}/approve`, {
        adminNotes: actionForm.adminNotes
      });

      if (response.data.success) {
        toast.success('Correction request approved successfully');
        setSelectedRequest(null);
        setActionForm({ adminNotes: '' });
        fetchPendingRequests();
      } else {
        toast.error(response.data.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await api.put(`/admin/attendance-corrections/requests/${requestId}/reject`, {
        adminNotes: actionForm.adminNotes
      });

      if (response.data.success) {
        toast.success('Correction request rejected');
        setSelectedRequest(null);
        setActionForm({ adminNotes: '' });
        fetchPendingRequests();
      } else {
        toast.error(response.data.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error.message || 'Failed to reject request');
    }
  };

  const openActionModal = (request) => {
    setSelectedRequest(request);
    setActionForm({ adminNotes: '' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return format(parseISO(timeString), 'MMM dd, yyyy HH:mm');
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: Clock };
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <DebugUserRole />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Attendance Corrections</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Employee ID"
              value={filters.employeeId}
              onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
            />
            <Input
              type="date"
              placeholder="From Date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            />
            <Input
              type="date"
              placeholder="To Date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            />
            <Select 
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => activeTab === 'pending' ? fetchPendingRequests() : fetchProcessedRequests()}
              disabled={loading}
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="processed">Processed Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Pending Correction Requests ({pendingRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  <p className="mt-2">Loading...</p>
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending correction requests found
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-medium">
                              {request.employee?.firstName} {request.employee?.lastName}
                            </span>
                            <span className="text-gray-500">
                              ({request.employee?.employeeId})
                            </span>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Date:</span>
                              <div>{format(parseISO(request.date), 'MMM dd, yyyy')}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Requested Clock In:</span>
                              <div>{request.requestedClockIn ? format(parseISO(request.requestedClockIn), 'HH:mm') : 'N/A'}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Requested Clock Out:</span>
                              <div>{request.requestedClockOut ? format(parseISO(request.requestedClockOut), 'HH:mm') : 'N/A'}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Break Duration:</span>
                              <div>{formatDuration(request.requestedBreakMinutes)}</div>
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Reason:</span>
                            <div className="text-gray-800">{request.reason}</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Submitted: {formatTime(request.createdAt)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openActionModal(request)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Approve Correction Request</DialogTitle>
                              </DialogHeader>
                              {selectedRequest && (
                                <div className="space-y-4">
                                  <div className="bg-gray-50 p-3 rounded">
                                    <p><strong>Employee:</strong> {selectedRequest.employee?.firstName} {selectedRequest.employee?.lastName}</p>
                                    <p><strong>Date:</strong> {format(parseISO(selectedRequest.date), 'MMM dd, yyyy')}</p>
                                    <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Admin Notes (Optional)</label>
                                    <Textarea
                                      value={actionForm.adminNotes}
                                      onChange={(e) => setActionForm(prev => ({ 
                                        ...prev, 
                                        adminNotes: e.target.value 
                                      }))}
                                      placeholder="Add any notes about this approval..."
                                      rows={3}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      onClick={() => handleApproveRequest(selectedRequest?.id)}
                                      className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                      Approve Request
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openActionModal(request)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <AlertTriangle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Reject Correction Request</DialogTitle>
                              </DialogHeader>
                              {selectedRequest && (
                                <div className="space-y-4">
                                  <div className="bg-gray-50 p-3 rounded">
                                    <p><strong>Employee:</strong> {selectedRequest.employee?.firstName} {selectedRequest.employee?.lastName}</p>
                                    <p><strong>Date:</strong> {format(parseISO(selectedRequest.date), 'MMM dd, yyyy')}</p>
                                    <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Rejection Reason *</label>
                                    <Textarea
                                      value={actionForm.adminNotes}
                                      onChange={(e) => setActionForm(prev => ({ 
                                        ...prev, 
                                        adminNotes: e.target.value 
                                      }))}
                                      placeholder="Please explain why this request is being rejected..."
                                      rows={3}
                                      required
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      onClick={() => handleRejectRequest(selectedRequest?.id)}
                                      className="flex-1 bg-red-600 hover:bg-red-700"
                                      disabled={!actionForm.adminNotes.trim()}
                                    >
                                      Reject Request
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Processed Requests ({processedRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  <p className="mt-2">Loading...</p>
                </div>
              ) : processedRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No processed requests found
                </div>
              ) : (
                <div className="space-y-4">
                  {processedRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">
                            {request.employee?.firstName} {request.employee?.lastName}
                          </span>
                          <span className="text-gray-500">
                            ({request.employee?.employeeId})
                          </span>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Date:</span>
                            <div>{format(parseISO(request.date), 'MMM dd, yyyy')}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Requested Clock In:</span>
                            <div>{request.requestedClockIn ? format(parseISO(request.requestedClockIn), 'HH:mm') : 'N/A'}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Requested Clock Out:</span>
                            <div>{request.requestedClockOut ? format(parseISO(request.requestedClockOut), 'HH:mm') : 'N/A'}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Break Duration:</span>
                            <div>{formatDuration(request.requestedBreakMinutes)}</div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Employee Reason:</span>
                          <div className="text-gray-800">{request.reason}</div>
                        </div>
                        {request.adminNotes && (
                          <div className="text-sm">
                            <span className="text-gray-500">Admin Notes:</span>
                            <div className="text-blue-600">{request.adminNotes}</div>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 flex gap-4">
                          <span>Submitted: {formatTime(request.createdAt)}</span>
                          <span>Processed: {formatTime(request.processedAt)}</span>
                          {request.processor && (
                            <span>By: {request.processor.firstName} {request.processor.lastName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceCorrections;