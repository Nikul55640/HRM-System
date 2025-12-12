import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { managerService } from '../../../../services';
import { toast } from 'react-toastify';
import { formatDate } from '../../../../core/utils/essHelpers';
import { usePermissions } from '../../../../core/hooks';
import { MODULES } from '../../../../core/utils/rolePermissions';

const ManagerApprovals = () => {
  const { can } = usePermissions();
  const [approvals, setApprovals] = useState({ leave: [], attendance: [], expense: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leave');
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchPendingApprovals = useCallback(async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from the service method
      const response = await managerService.getPendingApprovals();
      
      if (response.success) {
        setApprovals(response.data);
        setRetryCount(0); // Reset retry count on success
      } else {
        // Fallback to empty data if response is not successful
        setApprovals({
          leave: [],
          attendance: [],
          expense: []
        });
        if (!isRetry) {
          toast.info('No approval data available at the moment');
        }
      }
    } catch (error) {
      // Handle backend errors gracefully with fallback data
      const emptyData = { leave: [], attendance: [], expense: [] };
      
      // Check for specific backend error about 'find' method
      const errorMessage = error.response?.data?.error || error.message || '';
      const isBackendDataError = errorMessage.includes('Cannot read properties of undefined') || 
                                errorMessage.includes('find');
      
      setApprovals(emptyData);
      setError(error);
      
      if (!isRetry) {
        if (error.response?.status === 400) {
          toast.info('No manager permissions - you are not associated with an employee record');
        } else if (error.response?.status === 404) {
          toast.info('Manager approval system is not yet configured');
        } else if (error.response?.status === 500 && isBackendDataError) {
          toast.error('Database configuration issue - backend needs attention');
        } else if (error.response?.status === 500) {
          toast.error('Server error - the backend service needs to be fixed');
        } else {
          toast.error('Connection failed - check if the backend server is running');
        }
      }
      
      // Log detailed error for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn('Manager Approvals Error:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          error: error.response?.data?.error,
          url: error.config?.url,
          retryCount: retryCount
        });
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  const handleLeaveApproval = useCallback(async (id, action) => {
    try {
      if (action === 'approve') {
        await managerService.approveLeave(id, { comments: 'Approved by manager' });
        toast.success('Leave request approved');
      } else {
        await managerService.rejectLeave(id, { reason: 'Rejected by manager' });
        toast.success('Leave request rejected');
      }
      fetchPendingApprovals();
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Leave request not found');
      } else if (error.response?.status === 500) {
        toast.error('Server error - please try again');
      } else {
        toast.error(`Failed to ${action} leave request`);
      }
    }
  }, [fetchPendingApprovals]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    fetchPendingApprovals(true);
  }, [fetchPendingApprovals]);

  // Move useEffect before conditional return to fix React Hook rule
  useEffect(() => {
    // Only fetch if user has permissions
    if (can.doAny([MODULES.LEAVE.APPROVE_TEAM, MODULES.ATTENDANCE.APPROVE_CORRECTION])) {
      fetchPendingApprovals();
    }
  }, [can, fetchPendingApprovals]);

  // Check if user has approval permissions
  if (!can.doAny([MODULES.LEAVE.APPROVE_TEAM, MODULES.ATTENDANCE.APPROVE_CORRECTION])) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h3>
          <p className="text-red-700">You do not have permission to approve requests.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <p className="text-gray-500">Loading approvals...</p>
        </div>
      </div>
    );
  }

  const totalPending = (approvals.leave?.length || 0) + (approvals.attendance?.length || 0) + (approvals.expense?.length || 0);

  // Show error state with retry option
  if (error && totalPending === 0) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <XCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-1">
                Unable to Load Approvals
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                {error.response?.status === 400 
                  ? 'You are not associated with an employee record, so you cannot manage team approvals. Contact your administrator to set up your employee profile.'
                  : error.response?.status === 500 
                  ? 'The backend service has a database configuration issue that needs to be resolved.'
                  : 'There was a problem connecting to the approval system.'
                }
              </p>
              {error.response?.status !== 400 && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleRetry}
                  disabled={loading}
                >
                  {loading ? 'Retrying...' : 'Try Again'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Pending Approvals</h1>
        <p className="text-gray-500 text-sm mt-1">Review and approve team requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-800">{totalPending}</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-800">{approvals.leave?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-800">{approvals.attendance?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-800">{approvals.expense?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex gap-2 border-b border-gray-200 pb-4">
            <Button
              variant={activeTab === 'leave' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('leave')}
            >
              Leave Requests ({approvals.leave?.length || 0})
            </Button>
            <Button
              variant={activeTab === 'attendance' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('attendance')}
            >
              Attendance ({approvals.attendance?.length || 0})
            </Button>
            <Button
              variant={activeTab === 'expenses' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('expenses')}
            >
              Expenses ({approvals.expense?.length || 0})
            </Button>
          </div>

          <div className="mt-4">
            {activeTab === 'leave' && (
              <>
                {!approvals.leave || approvals.leave.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">No pending leave requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {approvals.leave.map((request) => (
                      <Card key={request._id} className="border-l-4 border-l-blue-500 border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-800">
                                  {request.employeeId?.personalInfo?.firstName} {request.employeeId?.personalInfo?.lastName}
                                </h3>
                                <span className="inline-block px-2 py-1 rounded text-xs font-medium border text-blue-600 bg-blue-50 border-blue-200">
                                  {request.type}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                <div>
                                  <span className="text-gray-500">Duration:</span>
                                  <div className="font-medium text-gray-800">
                                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                  </div>
                                  <div className="text-gray-500">{request.days} days</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Applied on:</span>
                                  <div className="font-medium text-gray-800">{formatDate(request.appliedAt)}</div>
                                </div>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Reason:</span>
                                <p className="mt-1 text-gray-700">{request.reason}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => handleLeaveApproval(request._id, 'approve')}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleLeaveApproval(request._id, 'reject')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'attendance' && (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">No pending attendance requests</p>
              </div>
            )}

            {activeTab === 'expenses' && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">No pending expense requests</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerApprovals;