import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Badge } from '../../../shared/ui/badge';
import { Textarea } from '../../../shared/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../shared/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Calendar, Clock, User, AlertTriangle, CheckCircle, Edit3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

const AttendanceCorrections = () => {
  const [pendingCorrections, setPendingCorrections] = useState([]);
  const [correctionHistory, setCorrectionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState(null);
  const [correctionForm, setCorrectionForm] = useState({
    clockInTime: '',
    clockOutTime: '',
    breakDuration: '',
    reason: '',
    correctionType: 'manual'
  });
  const [filters, setFilters] = useState({
    employeeId: '',
    dateFrom: '',
    dateTo: ''
  });
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingCorrections();
    } else {
      fetchCorrectionHistory();
    }
  }, [activeTab, filters]);

  const fetchPendingCorrections = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.employeeId) queryParams.append('employeeId', filters.employeeId);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

      const response = await fetch(`/api/admin/attendance-corrections/pending?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingCorrections(data.data);
      }
    } catch (error) {
      console.error('Error fetching pending corrections:', error);
      toast.error('Failed to fetch pending corrections');
    } finally {
      setLoading(false);
    }
  };

  const fetchCorrectionHistory = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.employeeId) queryParams.append('employeeId', filters.employeeId);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

      const response = await fetch(`/api/admin/attendance-corrections/history?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCorrectionHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching correction history:', error);
      toast.error('Failed to fetch correction history');
    } finally {
      setLoading(false);
    }
  };

  const handleCorrection = async (sessionId) => {
    try {
      const response = await fetch(`/api/admin/attendance-corrections/${sessionId}/correct`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(correctionForm)
      });

      if (response.ok) {
        toast.success('Attendance correction applied successfully');
        setSelectedCorrection(null);
        setCorrectionForm({
          clockInTime: '',
          clockOutTime: '',
          breakDuration: '',
          reason: '',
          correctionType: 'manual'
        });
        fetchPendingCorrections();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to apply correction');
      }
    } catch (error) {
      console.error('Error applying correction:', error);
      toast.error('Failed to apply correction');
    }
  };

  const openCorrectionModal = (session) => {
    setSelectedCorrection(session);
    setCorrectionForm({
      clockInTime: session.clockInTime ? format(parseISO(session.clockInTime), "yyyy-MM-dd'T'HH:mm") : '',
      clockOutTime: session.clockOutTime ? format(parseISO(session.clockOutTime), "yyyy-MM-dd'T'HH:mm") : '',
      breakDuration: session.breakDuration || '',
      reason: '',
      correctionType: 'manual'
    });
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
      pending_correction: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      corrected: { color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: Clock };
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <Button 
              onClick={() => activeTab === 'pending' ? fetchPendingCorrections() : fetchCorrectionHistory()}
              disabled={loading}
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending Corrections</TabsTrigger>
          <TabsTrigger value="history">Correction History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Pending Corrections ({pendingCorrections.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : pendingCorrections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending corrections found
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingCorrections.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-medium">
                              {session.Employee?.firstName} {session.Employee?.lastName}
                            </span>
                            <span className="text-gray-500">
                              ({session.Employee?.employeeId})
                            </span>
                            {getStatusBadge(session.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Clock In:</span>
                              <div>{formatTime(session.clockInTime)}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Clock Out:</span>
                              <div>{formatTime(session.clockOutTime)}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Break:</span>
                              <div>{formatDuration(session.breakDuration)}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Total Hours:</span>
                              <div>{session.totalHours?.toFixed(2) || '0.00'}h</div>
                            </div>
                          </div>
                          {session.flaggedReason && (
                            <div className="text-sm">
                              <span className="text-gray-500">Reason:</span>
                              <div className="text-red-600">{session.flaggedReason}</div>
                            </div>
                          )}
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openCorrectionModal(session)}
                            >
                              <Edit3 className="w-4 h-4 mr-1" />
                              Correct
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Apply Attendance Correction</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Clock In Time</label>
                                <Input
                                  type="datetime-local"
                                  value={correctionForm.clockInTime}
                                  onChange={(e) => setCorrectionForm(prev => ({ 
                                    ...prev, 
                                    clockInTime: e.target.value 
                                  }))}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Clock Out Time</label>
                                <Input
                                  type="datetime-local"
                                  value={correctionForm.clockOutTime}
                                  onChange={(e) => setCorrectionForm(prev => ({ 
                                    ...prev, 
                                    clockOutTime: e.target.value 
                                  }))}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Break Duration (minutes)</label>
                                <Input
                                  type="number"
                                  value={correctionForm.breakDuration}
                                  onChange={(e) => setCorrectionForm(prev => ({ 
                                    ...prev, 
                                    breakDuration: e.target.value 
                                  }))}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Correction Type</label>
                                <Select 
                                  value={correctionForm.correctionType}
                                  onValueChange={(value) => setCorrectionForm(prev => ({ 
                                    ...prev, 
                                    correctionType: value 
                                  }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="manual">Manual Correction</SelectItem>
                                    <SelectItem value="system_error">System Error</SelectItem>
                                    <SelectItem value="employee_request">Employee Request</SelectItem>
                                    <SelectItem value="manager_approval">Manager Approval</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Reason for Correction</label>
                                <Textarea
                                  value={correctionForm.reason}
                                  onChange={(e) => setCorrectionForm(prev => ({ 
                                    ...prev, 
                                    reason: e.target.value 
                                  }))}
                                  placeholder="Explain why this correction is needed..."
                                  rows={3}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => handleCorrection(selectedCorrection?.id)}
                                  className="flex-1"
                                  disabled={!correctionForm.reason}
                                >
                                  Apply Correction
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Correction History ({correctionHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : correctionHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No correction history found
                </div>
              ) : (
                <div className="space-y-4">
                  {correctionHistory.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">
                            {session.Employee?.firstName} {session.Employee?.lastName}
                          </span>
                          <span className="text-gray-500">
                            ({session.Employee?.employeeId})
                          </span>
                          {getStatusBadge(session.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Clock In:</span>
                            <div>{formatTime(session.clockInTime)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Clock Out:</span>
                            <div>{formatTime(session.clockOutTime)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Break:</span>
                            <div>{formatDuration(session.breakDuration)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Total Hours:</span>
                            <div>{session.totalHours?.toFixed(2) || '0.00'}h</div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Corrected:</span>
                          <div>{formatTime(session.correctedAt)}</div>
                        </div>
                        {session.correctionReason && (
                          <div className="text-sm">
                            <span className="text-gray-500">Correction Reason:</span>
                            <div className="text-blue-600">{session.correctionReason}</div>
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

export default AttendanceCorrections;