import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { CheckCircle, XCircle, Clock, Calendar, FileText } from 'lucide-react';
import { managerService } from '../../services';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/essHelpers';

const ManagerApprovals = () => {
  const [approvals, setApprovals] = useState({ leave: [], attendance: [], expense: [] });
  const [loading, setLoading] = useState(true);

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

  const handleAttendanceApproval = async (id, action) => {
    try {
      if (action === 'approve') {
        await managerService.approveAttendance(id, { comments: 'Approved' });
        toast.success('Attendance approved');
      } else {
        await managerService.rejectAttendance(id, { reason: 'Rejected' });
        toast.error('Attendance rejected');
      }
      fetchPendingApprovals();
    } catch (error) {
      toast.error(`Failed to ${action} attendance`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const totalPending = (approvals.leave?.length || 0) + (approvals.attendance?.length || 0) + (approvals.expense?.length || 0);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Pending Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and approve team requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvals.leave?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvals.attendance?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvals.expense?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leave" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leave">
            Leave Requests ({approvals.leave?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="attendance">
            Attendance ({approvals.attendance?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="expenses">
            Expenses ({approvals.expense?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leave">
          <Card>
            <CardContent className="p-6">
              {!approvals.leave || approvals.leave.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No pending leave requests
                </div>
              ) : (
                <div className="space-y-4">
                  {approvals.leave.map((request) => (
                    <Card key={request._id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">
                                {request.employeeId?.personalInfo?.firstName} {request.employeeId?.personalInfo?.lastName}
                              </h3>
                              <Badge>{request.type}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-muted-foreground">Duration:</span>
                                <div className="font-medium">
                                  {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                </div>
                                <div className="text-muted-foreground">{request.days} days</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Applied on:</span>
                                <div className="font-medium">{formatDate(request.appliedAt)}</div>
                              </div>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Reason:</span>
                              <p className="mt-1">{request.reason}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => handleLeaveApproval(request._id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleLeaveApproval(request._id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12 text-muted-foreground">
                No pending attendance requests
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12 text-muted-foreground">
                No pending expense requests
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerApprovals;
