import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus, Search, Edit, Users, Calendar, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import leaveService from '../../services/leaveService';
import employeeService from '../../services/employeeService';
import { formatDate } from '../../utils/essHelpers';
import { PermissionGate } from '../../components/common';
import { usePermissions } from '../../hooks';
import { MODULES } from '../../utils/rolePermissions';

const LeaveManagement = () => {
  const { can } = usePermissions();
  const [activeTab, setActiveTab] = useState('balances'); // 'balances' or 'requests'
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    annualLeave: 20,
    sickLeave: 10,
    casualLeave: 5,
    unpaidLeave: 0,
  });

  useEffect(() => {
    if (activeTab === 'balances') {
      fetchBalances();
    } else {
      fetchRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getEmployees({ status: 'active' });
      setEmployees(response.data || []);
    } catch (error) {
      console.error('❌ [LEAVE MANAGEMENT] Failed to fetch employees:', error);
    }
  };

  const fetchBalances = async () => {
    console.log('🔄 [LEAVE MANAGEMENT] Fetching leave balances...');
    try {
      setLoading(true);
      const response = await leaveService.getAllLeaveBalances();
      console.log('✅ [LEAVE MANAGEMENT] Balances loaded:', response);
      setBalances(response.data || []);
    } catch (error) {
      console.error('❌ [LEAVE MANAGEMENT] Failed to fetch balances:', error);
      toast.error('Failed to load leave balances');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    
    try {
      setLoading(true);
      const response = await leaveService.getAllLeaveRequests();
      
      setRequests(response.data || []);
    } catch (error) {
      
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLeave = async (e) => {
    e.preventDefault();
    
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    try {
      const employeeId = typeof selectedEmployee === 'string' ? selectedEmployee : selectedEmployee._id;
      await leaveService.assignLeaveBalance(employeeId, formData);
      toast.success('Leave balance assigned successfully');
      setShowAssignModal(false);
      setSelectedEmployee(null);
      setFormData({ annualLeave: 20, sickLeave: 10, casualLeave: 5, unpaidLeave: 0 });
      fetchBalances();
    } catch (error) {
      toast.error('Failed to assign leave balance');
    }
  };

  const handleApprove = async (id) => {
    try {
      await leaveService.approveLeave(id);
      toast.success('Leave request approved');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to approve leave request');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await leaveService.rejectLeave(id, { reason });
      toast.success('Leave request rejected');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to reject leave request');
    }
  };

  const filteredBalances = balances.filter(balance =>
    balance.employee?.personalInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    balance.employee?.personalInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    balance.employee?.employeeNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = requests.filter(request =>
    request.employee?.personalInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.employee?.personalInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Calculate statistics
  const totalAllocated = balances.reduce((sum, b) => {
    return sum + 
      (b.annualLeave?.total || 0) + 
      (b.sickLeave?.total || 0) + 
      (b.casualLeave?.total || 0);
  }, 0);

  const totalAvailable = balances.reduce((sum, b) => {
    return sum + 
      (b.annualLeave?.available || 0) + 
      (b.sickLeave?.available || 0) + 
      (b.casualLeave?.available || 0);
  }, 0);

  const totalUsed = balances.reduce((sum, b) => {
    return sum + 
      (b.annualLeave?.used || 0) + 
      (b.sickLeave?.used || 0) + 
      (b.casualLeave?.used || 0);
  }, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Leave Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage employee leave balances and requests</p>
        </div>
        {activeTab === 'balances' && (
          <PermissionGate permission={MODULES.LEAVE.MANAGE_BALANCE}>
            <Button onClick={() => setShowAssignModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Assign Leave
            </Button>
          </PermissionGate>
        )}
      </div>

      {/* Statistics Cards - Only show on balances tab */}
      {activeTab === 'balances' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Leave</p>
                  <p className="text-3xl font-bold text-gray-800">{totalAllocated}</p>
                  <p className="text-xs text-gray-400 mt-1">days per year</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Available</p>
                  <p className="text-3xl font-bold text-green-600">{totalAvailable}</p>
                  <p className="text-xs text-gray-400 mt-1">days remaining</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Used</p>
                  <p className="text-3xl font-bold text-orange-600">{totalUsed}</p>
                  <p className="text-xs text-gray-400 mt-1">days taken</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {can.doAny([MODULES.LEAVE.VIEW_ALL, MODULES.LEAVE.MANAGE_BALANCE]) && (
          <button
            onClick={() => setActiveTab('balances')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'balances'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Leave Balances
          </button>
        )}
        {can.doAny([MODULES.LEAVE.VIEW_ALL, MODULES.LEAVE.APPROVE_ANY, MODULES.LEAVE.APPROVE_TEAM]) && (
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Leave Requests
          </button>
        )}
      </div>

      {/* Search */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {activeTab === 'balances' ? (
        <Card className="border-gray-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Annual Leave</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Sick Leave</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Casual Leave</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Unpaid Leave</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBalances.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                        No leave balances found
                      </td>
                    </tr>
                  ) : (
                    filteredBalances.map((balance) => (
                      <tr key={balance._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {balance.employee?.personalInfo?.firstName} {balance.employee?.personalInfo?.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {balance.employee?.employeeNumber}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">
                              {balance.annualLeave?.available || 0}
                            </span>
                            <span className="text-xs text-gray-400">/</span>
                            <span className="text-sm text-gray-500">
                              {balance.annualLeave?.total || 0}
                            </span>
                          </div>
                          {(balance.annualLeave?.used || 0) > 0 && (
                            <span className="text-xs text-gray-400">
                              ({balance.annualLeave?.used || 0} used)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">
                              {balance.sickLeave?.available || 0}
                            </span>
                            <span className="text-xs text-gray-400">/</span>
                            <span className="text-sm text-gray-500">
                              {balance.sickLeave?.total || 0}
                            </span>
                          </div>
                          {(balance.sickLeave?.used || 0) > 0 && (
                            <span className="text-xs text-gray-400">
                              ({balance.sickLeave?.used || 0} used)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">
                              {balance.casualLeave?.available || 0}
                            </span>
                            <span className="text-xs text-gray-400">/</span>
                            <span className="text-sm text-gray-500">
                              {balance.casualLeave?.total || 0}
                            </span>
                          </div>
                          {(balance.casualLeave?.used || 0) > 0 && (
                            <span className="text-xs text-gray-400">
                              ({balance.casualLeave?.used || 0} used)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">
                              {balance.unpaidLeave?.available || 0}
                            </span>
                            <span className="text-xs text-gray-400">/</span>
                            <span className="text-sm text-gray-500">
                              {balance.unpaidLeave?.total || 0}
                            </span>
                          </div>
                          {(balance.unpaidLeave?.used || 0) > 0 && (
                            <span className="text-xs text-gray-400">
                              ({balance.unpaidLeave?.used || 0} used)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <PermissionGate permission={MODULES.LEAVE.MANAGE_BALANCE}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedEmployee(balance.employee);
                                setFormData({
                                  annualLeave: balance.annualLeave?.total || 0,
                                  sickLeave: balance.sickLeave?.total || 0,
                                  casualLeave: balance.casualLeave?.total || 0,
                                  unpaidLeave: balance.unpaidLeave?.total || 0,
                                });
                                setShowAssignModal(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </PermissionGate>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Start Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">End Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Days</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                        No leave requests found
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {request.employee?.personalInfo?.firstName} {request.employee?.personalInfo?.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {request.employee?.employeeNumber}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{request.type}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(request.startDate)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(request.endDate)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{request.days}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {request.status === 'pending' && (
                            <PermissionGate anyPermissions={[MODULES.LEAVE.APPROVE_ANY, MODULES.LEAVE.APPROVE_TEAM]}>
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(request._id)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReject(request._id)}
                                >
                                  Reject
                                </Button>
                              </div>
                            </PermissionGate>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assign Leave Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {selectedEmployee ? 'Update' : 'Assign'} Leave Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAssignLeave} className="space-y-4">
                {selectedEmployee && typeof selectedEmployee === 'object' ? (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-800">
                      {selectedEmployee.personalInfo?.firstName} {selectedEmployee.personalInfo?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{selectedEmployee.employeeNumber}</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Employee *
                    </label>
                    <select
                      value={selectedEmployee || ''}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Choose an employee...</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.personalInfo?.firstName} {emp.personalInfo?.lastName} ({emp.employeeNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Leave (days)
                  </label>
                  <input
                    type="number"
                    value={formData.annualLeave}
                    onChange={(e) => setFormData({ ...formData, annualLeave: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sick Leave (days)
                  </label>
                  <input
                    type="number"
                    value={formData.sickLeave}
                    onChange={(e) => setFormData({ ...formData, sickLeave: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Casual Leave (days)
                  </label>
                  <input
                    type="number"
                    value={formData.casualLeave}
                    onChange={(e) => setFormData({ ...formData, casualLeave: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unpaid Leave (days)
                  </label>
                  <input
                    type="number"
                    value={formData.unpaidLeave}
                    onChange={(e) => setFormData({ ...formData, unpaidLeave: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedEmployee(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {selectedEmployee ? 'Update' : 'Assign'}
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

export default LeaveManagement;
