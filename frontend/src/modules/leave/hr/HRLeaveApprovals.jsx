import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { CheckCircle, XCircle, Search, Clock } from 'lucide-react';
import { leaveService } from '../../../services';
import { toast } from 'react-toastify';
import { formatDate } from '../../ess/utils/essHelpers';

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading leave requests...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Leave Approvals</h1>
        <p className="text-gray-500 text-sm mt-1">Review and manage employee leave requests</p>
      </div>

      {/* Filters */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by employee name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('approved')}
              >
                Approved
              </Button>
              <Button
                variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('rejected')}
              >
                Rejected
              </Button>
              <Button
                variant={filterStatus === 'cancelled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('cancelled')}
              >
                Cancelled
              </Button>
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests */}
      <div className="space-y-4">
        {filteredLeaves.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="py-12 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">No leave requests found</p>
            </CardContent>
          </Card>
        ) : (
          filteredLeaves.map(leave => (
            <Card key={leave._id} className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {leave.employeeId?.personalInfo?.firstName} {leave.employeeId?.personalInfo?.lastName}
                      </h3>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Leave Type</p>
                        <p className="text-sm font-medium text-gray-800">{leave.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-medium text-gray-800">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Days</p>
                        <p className="text-sm font-medium text-gray-800">{leave.days} days</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Reason</p>
                      <p className="text-sm text-gray-700 mt-1">{leave.reason}</p>
                    </div>
                  </div>
                  
                  {leave.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" onClick={() => handleApprove(leave._id)}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(leave._id)}>
                        <XCircle className="w-4 h-4 mr-1" />
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
