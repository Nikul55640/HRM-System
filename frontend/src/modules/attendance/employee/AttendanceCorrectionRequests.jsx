import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Badge } from '../../../shared/ui/badge';
import { Textarea } from '../../../shared/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../shared/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Send, Loader2, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const AttendanceCorrectionRequests = () => {
  const [attendanceIssues, setAttendanceIssues] = useState([]);
  const [correctionRequests, setCorrectionRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestForm, setRequestForm] = useState({
    date: '',
    expectedClockIn: '',
    expectedClockOut: '',
    breakDuration: '',
    reason: '',
    issueType: 'missed_punch'
  });
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState('issues');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'issues') {
      fetchAttendanceIssues();
    } else {
      fetchCorrectionRequests();
    }
  }, [activeTab]);

  const fetchAttendanceIssues = async () => {
    setLoading(true);
    try {
      const response = await api.get('/employee/attendance/issues');
      
      if (response.data.success) {
        setAttendanceIssues(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch attendance issues');
      }
    } catch (error) {
      console.error('Error fetching attendance issues:', error);
      toast.error(error.message || 'Failed to fetch attendance issues');
    } finally {
      setLoading(false);
    }
  };
  const fetchCorrectionRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/employee/attendance-correction-requests');
      
      if (response.data.success) {
        setCorrectionRequests(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch correction requests');
      }
    } catch (error) {
      console.error('Error fetching correction requests:', error);
      toast.error(error.message || 'Failed to fetch correction requests');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!requestForm.reason || requestForm.reason.trim().length < 10) {
      errors.reason = 'Reason must be at least 10 characters long';
    }
    
    if (requestForm.reason && requestForm.reason.length > 500) {
      errors.reason = 'Reason must not exceed 500 characters';
    }
    
    if (requestForm.breakDuration && requestForm.breakDuration.toString().trim()) {
      const breakDurationNum = parseInt(requestForm.breakDuration);
      if (isNaN(breakDurationNum) || breakDurationNum < 0 || breakDurationNum > 480) {
        errors.breakDuration = 'Break duration must be between 0 and 480 minutes';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitRequest = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    try {
      if (!requestForm.reason.trim()) {
        toast.error('Please provide a reason for the correction');
        return;
      }

      const requestData = {
        date: requestForm.date,
        reason: requestForm.reason,
        issueType: requestForm.issueType
      };

      // Only include optional fields if they have valid values
      if (requestForm.expectedClockIn && requestForm.expectedClockIn.trim()) {
        requestData.expectedClockIn = requestForm.expectedClockIn.trim();
      }
      
      if (requestForm.expectedClockOut && requestForm.expectedClockOut.trim()) {
        requestData.expectedClockOut = requestForm.expectedClockOut.trim();
      }
      
      if (requestForm.breakDuration && requestForm.breakDuration.toString().trim()) {
        const breakDurationNum = parseInt(requestForm.breakDuration);
        if (!isNaN(breakDurationNum) && breakDurationNum >= 0 && breakDurationNum <= 480) {
          requestData.breakDuration = breakDurationNum;
        }
      }

      const response = await api.post('/employee/attendance-correction-requests', requestData);

      if (response.data.success) {
        toast.success('Correction request submitted successfully');
        setIsModalOpen(false);
        setRequestForm({
          date: '',
          expectedClockIn: '',
          expectedClockOut: '',
          breakDuration: '',
          reason: '',
          issueType: 'missed_punch'
        });
        setFormErrors({});
        fetchCorrectionRequests();
        fetchAttendanceIssues();
      } else {
        toast.error(response.data.message || 'Failed to submit correction request');
      }
    } catch (error) {
      console.error('Error submitting correction request:', error);
      toast.error(error.message || 'Failed to submit correction request');
    }
  };
  const openRequestModal = (issue = null) => {
    setFormErrors({}); // Clear any previous form errors
    
    if (issue) {
      setRequestForm({
        date: format(parseISO(issue.date), 'yyyy-MM-dd'),
        expectedClockIn: issue.clockIn ? format(parseISO(issue.clockIn), "HH:mm") : '',
        expectedClockOut: issue.clockOut ? format(parseISO(issue.clockOut), "HH:mm") : '',
        breakDuration: issue.totalBreakMinutes || '',
        reason: '',
        issueType: issue.issueType || 'missed_punch'
      });
    } else {
      setRequestForm({
        date: '',
        expectedClockIn: '',
        expectedClockOut: '',
        breakDuration: '',
        reason: '',
        issueType: 'missed_punch'
      });
    }
    setIsModalOpen(true);
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
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' },
      corrected: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Corrected' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: Clock, text: status };
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };
  const getIssueTypeBadge = (issueType) => {
    const typeConfig = {
      missed_punch: { color: 'bg-red-100 text-red-800', text: 'Missed Punch' },
      incorrect_time: { color: 'bg-orange-100 text-orange-800', text: 'Incorrect Time' },
      system_error: { color: 'bg-purple-100 text-purple-800', text: 'System Error' },
      other: { color: 'bg-gray-100 text-gray-800', text: 'Other' }
    };

    const config = typeConfig[issueType] || { color: 'bg-gray-100 text-gray-800', text: issueType };

    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Attendance Correction Requests</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openRequestModal()}>
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Attendance Correction Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input
                  type="date"
                  value={requestForm.date}
                  onChange={(e) => setRequestForm(prev => ({ 
                    ...prev, 
                    date: e.target.value 
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Issue Type</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={requestForm.issueType}
                  onChange={(e) => setRequestForm(prev => ({ 
                    ...prev, 
                    issueType: e.target.value 
                  }))}
                >
                  <option value="missed_punch">Missed Punch</option>
                  <option value="incorrect_time">Incorrect Time</option>
                  <option value="system_error">System Error</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expected Clock In Time</label>
                <Input
                  type="time"
                  value={requestForm.expectedClockIn}
                  onChange={(e) => setRequestForm(prev => ({ 
                    ...prev, 
                    expectedClockIn: e.target.value 
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expected Clock Out Time</label>
                <Input
                  type="time"
                  value={requestForm.expectedClockOut}
                  onChange={(e) => setRequestForm(prev => ({ 
                    ...prev, 
                    expectedClockOut: e.target.value 
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Break Duration (minutes)</label>
                <Input
                  type="number"
                  min="0"
                  max="480"
                  value={requestForm.breakDuration}
                  onChange={(e) => {
                    setRequestForm(prev => ({ 
                      ...prev, 
                      breakDuration: e.target.value 
                    }));
                    // Clear error when user starts typing
                    if (formErrors.breakDuration) {
                      setFormErrors(prev => ({ ...prev, breakDuration: undefined }));
                    }
                  }}
                  placeholder="e.g., 30 (0-480 minutes)"
                  className={formErrors.breakDuration ? 'border-red-500' : ''}
                />
                {formErrors.breakDuration && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.breakDuration}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason for Correction *</label>
                <Textarea
                  value={requestForm.reason}
                  onChange={(e) => {
                    setRequestForm(prev => ({ 
                      ...prev, 
                      reason: e.target.value 
                    }));
                    // Clear error when user starts typing
                    if (formErrors.reason) {
                      setFormErrors(prev => ({ ...prev, reason: undefined }));
                    }
                  }}
                  placeholder="Please explain why this correction is needed..."
                  rows={3}
                  className={formErrors.reason ? 'border-red-500' : ''}
                />
                {formErrors.reason && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.reason}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  {requestForm.reason.length}/500 characters (minimum 10 required)
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitRequest}
                  className="flex-1"
                  disabled={!requestForm.reason.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="issues">Attendance Issues</TabsTrigger>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Attendance Issues ({attendanceIssues.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  <p className="mt-2">Loading...</p>
                </div>
              ) : attendanceIssues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No attendance issues found
                </div>
              ) : (
                <div className="space-y-4">
                  {attendanceIssues.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">
                              {format(parseISO(issue.date), 'MMM dd, yyyy')}
                            </span>
                            {getIssueTypeBadge(issue.issueType)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Clock In:</span>
                              <div>{formatTime(issue.clockIn)}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Clock Out:</span>
                              <div>{formatTime(issue.clockOut)}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Break:</span>
                              <div>{formatDuration(issue.totalBreakMinutes)}</div>
                            </div>
                          </div>
                          {issue.description && (
                            <div className="text-sm">
                              <span className="text-gray-500">Issue:</span>
                              <div className="text-red-600">{issue.description}</div>
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openRequestModal(issue)}
                        >
                          Request Correction
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                My Correction Requests ({correctionRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  <p className="mt-2">Loading...</p>
                </div>
              ) : correctionRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No correction requests found
                </div>
              ) : (
                <div className="space-y-4">
                  {correctionRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">
                              {format(parseISO(request.date), 'MMM dd, yyyy')}
                            </span>
                            {getIssueTypeBadge(request.issueType)}
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
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
                          <div className="text-blue-600">{request.reason}</div>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Submitted:</span>
                          <div>{formatTime(request.createdAt)}</div>
                        </div>
                        {request.adminRemarks && (
                          <div className="text-sm">
                            <span className="text-gray-500">Admin Remarks:</span>
                            <div className="text-purple-600">{request.adminRemarks}</div>
                          </div>
                        )}
                        {request.processedAt && (
                          <div className="text-sm">
                            <span className="text-gray-500">Processed:</span>
                            <div>{formatTime(request.processedAt)}</div>
                          </div>
                        )}
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

export default AttendanceCorrectionRequests;
    