import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { leaveService } from '../../../services';
import { toast } from 'react-toastify';
import { formatDate } from '../../../utils/essHelpers';

const HRLeaveApprovals = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getAllLeaveRequests({
        status: filterStatus === 'all' ? undefined : filterStatus,
      });
      
      if (response.success) {
        setLeaves(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await leaveService.approve(id, { comments: 'Approved by HR' });
      toast.success('Leave approved');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to approve leave');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await leaveService.reject(id, { rejectionReason: reason });
      toast.error('Leave rejected');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to reject leave');
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = leave.employeeId?.personalInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leave.employeeId?.personalInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Leave Approvals</h1>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by employee name..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('approved')}
              >
                Approved
              </Button>
              <Button
                variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('rejected')}
              >
                Rejected
              </Button>
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredLeaves.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No leave requests found
            </CardContent>
          </Card>
        ) : (
          filteredLeaves.map(leave => (
            <Card key={leave._id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {leave.employeeId?.personalInfo?.firstName} {leave.employeeId?.personalInfo?.lastName}
                    </h3>
                    <div className="flex gap-2 mt-2">
                      <Badge>{leave.type}</Badge>
                      <Badge variant="outline">{leave.days} days</Badge>
                      <Badge variant={leave.status === 'pending' ? 'secondary' : leave.status === 'approved' ? 'default' : 'destructive'}>
                        {leave.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                    </p>
                    <p className="text-sm mt-1">Reason: {leave.reason}</p>
                  </div>
                  {leave.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApprove(leave._id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(leave._id)}>
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default HRLeaveApprovals;
