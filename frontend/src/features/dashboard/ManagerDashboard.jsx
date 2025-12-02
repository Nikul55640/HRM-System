import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from  '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    presentToday: 0,
    onLeave: 0,
    pendingApprovals: 0,
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setTeamStats({
        totalMembers: 12,
        presentToday: 10,
        onLeave: 2,
        pendingApprovals: 5,
      });
      
      setPendingRequests([
        { id: 1, employee: 'John Doe', type: 'Leave', date: '2024-01-15', status: 'pending' },
        { id: 2, employee: 'Jane Smith', type: 'Reimbursement', amount: '$250', status: 'pending' },
        { id: 3, employee: 'Mike Johnson', type: 'Shift Change', date: '2024-01-20', status: 'pending' },
      ]);
    } catch (error) {
      toast.error('Failed to load manager dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (requestId) => {
    toast.success('Request approved successfully');
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleReject = (requestId) => {
    toast.info('Request rejected');
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.totalMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{teamStats.presentToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{teamStats.onLeave}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{teamStats.pendingApprovals}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pending approvals</p>
            ) : (
              pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{request.employee}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.type} {request.date && `• ${request.date}`} {request.amount && `• ${request.amount}`}
                        </p>
                      </div>
                      <Badge variant="outline">{request.status}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleApprove(request.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleReject(request.id)}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerDashboard;
