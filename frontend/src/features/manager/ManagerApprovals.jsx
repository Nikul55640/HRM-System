import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { CheckCircle, XCircle, Clock, Calendar, FileText } from 'lucide-react';
import { managerService } from '../../services';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/essHelpers';
import { PermissionGate } from '../../components/common';
import { usePermissions } from '../../hooks';
import { MODULES } from '../../utils/rolePermissions';

const ManagerApprovals = () => {
  const { can } = usePermissions();
  const [approvals, setApprovals] = useState({ leave: [], attendance: [], expense: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leave');

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

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await managerService.getPendingApprovals();
      
      if (response.success) {
        setApprovals(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveApproval = async (id, action) => {
    try {
      if (action === 'approve') {
        await managerService.approveLeave(id, { comments: 'Approved by manager' });
        toast.success('Leave request approved');
      } else {
        await managerService.rejectLeave(id, { reason: 'Rejected by manager' });
        toast.error('Leave request rejected');
      }
      fetchPendingApprovals();
    } catch (error) {
      toast.error(`Failed to ${action} leave request`);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading approvals...</p>
      </div>
    );
  }

  const totalPending = (approvals.leave?.length || 0) + (approvals.attendance?.length || 0) + (approvals.expense?.length || 0);

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
