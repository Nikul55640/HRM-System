import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Calendar, Plus, Clock, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import leaveService from '../services/leaveService';
import { formatDate } from '../../../core/utils/essHelpers';
import useAuth from '../../../core/hooks/useAuth';

const MyLeave = () => {
  const { user } = useAuth();
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Check if user is an employee
  if (!user?.employeeId) {
    return (
      <div className="p-6">
        <Card className="border-gray-200">
          <CardContent className="py-12 text-center">
            <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Employee Access Only</p>
            <p className="text-sm text-gray-500 mt-2">
              This feature is only available for employees with an employee profile.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Please contact HR if you need access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    console.log('🔄 [LEAVE] Fetching leave data...');
    try {
      setLoading(true);
      const [balanceRes, historyRes] = await Promise.all([
        leaveService.getLeaveBalance(),
        leaveService.getMyLeaveHistory(),
      ]);
      console.log('✅ [LEAVE] Balance response:', balanceRes);
      console.log('✅ [LEAVE] History response:', historyRes);

      if (balanceRes.success) setLeaveBalance(balanceRes.data);
      if (historyRes.success) setLeaveHistory(historyRes.data || []);
      console.log('✅ [LEAVE] Data loaded - Balance:', balanceRes.data, 'History count:', historyRes.data?.length || 0);
    } catch (error) {
      
      toast.error('Failed to load leave information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await leaveService.applyLeave(formData);
      if (response.success) {
        toast.success('Leave application submitted successfully');
        setShowApplyForm(false);
        setFormData({ type: 'annual', startDate: '', endDate: '', reason: '' });
        fetchLeaveData();
      }
    } catch (error) {
      toast.error('Failed to submit leave application');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading leave information...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">My Leave</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your leave applications and balance</p>
        </div>
        <Button onClick={() => setShowApplyForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Apply Leave
        </Button>
      </div>

      {/* Leave Balance by Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveBalance?.leaveTypes?.map((leaveType) => (
          <Card key={leaveType.type} className="border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 capitalize">
                {leaveType.type} Leave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Allocated:</span>
                  <span className="text-sm font-semibold text-gray-800">{leaveType.allocated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Used:</span>
                  <span className="text-sm font-semibold text-blue-600">{leaveType.used}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Pending:</span>
                  <span className="text-sm font-semibold text-orange-600">{leaveType.pending}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-xs font-medium text-gray-600">Available:</span>
                  <span className="text-lg font-bold text-green-600">{leaveType.available}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leave History */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-800">
            Leave History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaveHistory.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No leave applications found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Start Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">End Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Days</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaveHistory.map((leave) => (
                    <tr key={leave._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{leave.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(leave.startDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(leave.endDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{leave.days}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{leave.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply Leave Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Apply for Leave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="annual">Annual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="personal">Personal Leave</option>
                    <option value="emergency">Emergency Leave</option>
                    <option value="maternity">Maternity Leave</option>
                    <option value="paternity">Paternity Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter reason for leave"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowApplyForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Submit
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyLeave;
