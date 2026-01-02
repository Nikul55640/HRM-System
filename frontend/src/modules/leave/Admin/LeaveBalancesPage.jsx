import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { Input } from "../../../shared/ui/input";
import { Icon, LoadingSpinner } from "../../../shared/components";
import { useToast } from "../../../core/hooks/use-toast";
import adminLeaveService from "../../../services/adminLeaveService";

const LeaveBalancesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    leaveType: 'casual',
    amount: ''
  });
  const [editForm, setEditForm] = useState({
    employeeId: '',
    leaveType: '',
    allocated: '',
    used: '',
    remaining: '',
    originalAllocated: 0,
    reason: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployeeBalances();
  }, []);

  const fetchEmployeeBalances = async () => {
    try {
      setLoading(true);
      const response = await adminLeaveService.getAllEmployeesLeaveBalances();
      
      // Debug: Log the actual response structure
      console.log('🔍 [LEAVE BALANCES] API Response:', response);
      console.log('🔍 [LEAVE BALANCES] Response type:', typeof response);
      console.log('🔍 [LEAVE BALANCES] Response keys:', Object.keys(response || {}));
      
      // Handle different response structures
      let employeesData = [];
      
      if (response?.success && response?.data?.employees) {
        // Structure: { success: true, data: { employees: [...] } }
        employeesData = response.data.employees;
        console.log('✅ [LEAVE BALANCES] Using response.data.employees structure');
      } else if (response?.data?.employees) {
        // Structure: { data: { employees: [...] } }
        employeesData = response.data.employees;
        console.log('✅ [LEAVE BALANCES] Using response.data.employees structure (no success flag)');
      } else if (response?.employees) {
        // Structure: { success: true, employees: [...] }
        employeesData = response.employees;
        console.log('✅ [LEAVE BALANCES] Using response.employees structure');
      } else if (Array.isArray(response?.data)) {
        // Structure: { success: true, data: [...] }
        employeesData = response.data;
        console.log('✅ [LEAVE BALANCES] Using response.data array structure');
      } else if (Array.isArray(response)) {
        // Structure: [...]
        employeesData = response;
        console.log('✅ [LEAVE BALANCES] Using direct array structure');
      } else {
        console.warn('⚠️ [LEAVE BALANCES] Unexpected response structure:', response);
        employeesData = [];
      }
      
      console.log('✅ [LEAVE BALANCES] Extracted employees:', employeesData.length, 'employees');
      console.log('🔍 [LEAVE BALANCES] First employee sample:', employeesData[0]);
      
      // Validate the data structure
      if (employeesData.length > 0) {
        const firstEmployee = employeesData[0];
        console.log('🔍 [LEAVE BALANCES] First employee structure:', {
          hasEmployee: !!firstEmployee.employee,
          hasBalances: !!firstEmployee.balances,
          balanceKeys: firstEmployee.balances ? Object.keys(firstEmployee.balances) : 'none'
        });
      }
      
      setEmployees(employeesData);
      
    } catch (error) {
      console.error('❌ [LEAVE BALANCES] Failed to fetch leave balances:', error);
      console.error('❌ [LEAVE BALANCES] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setEmployees([]); // Ensure empty array on error
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to load leave balances",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignLeaveBalance = async (employeeId, leaveType, amount) => {
    try {
      await adminLeaveService.assignLeaveBalance(employeeId, {
        leaveType,
        balance: parseInt(amount),
        year: new Date().getFullYear()
      });
      
      toast({
        title: "Success",
        description: "Leave balance assigned successfully",
      });
      
      fetchEmployeeBalances();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign leave balance",
        variant: "destructive",
      });
    }
  };

  const adjustLeaveBalance = async (employeeId, leaveType, adjustment, reason) => {
    try {
      await adminLeaveService.updateLeaveBalance(employeeId, {
        leaveType,
        adjustment: parseInt(adjustment),
        reason,
        year: new Date().getFullYear()
      });
      
      toast({
        title: "Success",
        description: "Leave balance adjusted successfully",
      });
      
      fetchEmployeeBalances();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to adjust leave balance",
        variant: "destructive",
      });
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.employeeId || !assignForm.leaveType || !assignForm.amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    await assignLeaveBalance(assignForm.employeeId, assignForm.leaveType, assignForm.amount);
    setShowAssignModal(false);
    setAssignForm({ employeeId: '', leaveType: 'casual', amount: '' });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.employeeId || !editForm.leaveType || !editForm.allocated) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const adjustment = parseInt(editForm.allocated) - (editForm.originalAllocated || 0);
    const reason = editForm.reason || "Manual adjustment via admin panel";
    
    await adjustLeaveBalance(editForm.employeeId, editForm.leaveType, adjustment, reason);
    setShowEditModal(false);
    setEditForm({ employeeId: '', leaveType: '', allocated: '', used: '', remaining: '', originalAllocated: 0, reason: '' });
  };

  const openEditModal = (employee, leaveType, balance) => {
    setEditForm({
      employeeId: employee.id,
      leaveType,
      allocated: balance.allocated.toString(),
      used: balance.used.toString(),
      remaining: balance.remaining.toString(),
      originalAllocated: balance.allocated,
      reason: ''
    });
    setShowEditModal(true);
  };

  const openDetailsModal = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      casual: 'bg-blue-100 text-blue-800',
      sick: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      annual: 'bg-purple-100 text-purple-800',
      maternity: 'bg-pink-100 text-pink-800',
      paternity: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getLeaveTypeIcon = (type) => {
    const icons = {
      casual: 'Calendar',
      sick: 'Heart',
      paid: 'Banknote',
      annual: 'Plane',
      maternity: 'Baby',
      paternity: 'Users'
    };
    return icons[type] || 'Calendar';
  };

  const filteredEmployees = (employees || []).filter(item => {
    const employee = item.employee || {};
    const fullName = `${employee.personalInfo?.firstName || employee.firstName || ''} ${employee.personalInfo?.lastName || employee.lastName || ''}`.trim();
    const employeeId = employee.employeeId || '';
    const department = employee.jobInfo?.departmentInfo?.name || employee.jobInfo?.department?.name || employee.department || '';
    
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           department.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getBalanceColor = (remaining, allocated) => {
    const percentage = allocated > 0 ? (remaining / allocated) * 100 : 0;
    if (percentage > 50) return "text-green-600";
    if (percentage > 25) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading leave balances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Balance Management</h1>
          <p className="text-gray-600">Assign and manage employee leave balances</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAssignModal(true)}>
            <Icon name="Plus" className="w-4 h-4 mr-2" />
            Assign Leave Balance
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon name="Users" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon name="Calendar" className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Casual Leave</p>
                <p className="text-2xl font-bold">
                  {employees.reduce((sum, emp) => {
                    const casualBalance = emp.balances?.casual;
                    return sum + (casualBalance?.allocated || 0);
                  }, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Icon name="Heart" className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sick Leave</p>
                <p className="text-2xl font-bold">
                  {employees.reduce((sum, emp) => {
                    const sickBalance = emp.balances?.sick;
                    return sum + (sickBalance?.allocated || 0);
                  }, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icon name="Banknote" className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Paid Leave</p>
                <p className="text-2xl font-bold">
                  {employees.reduce((sum, emp) => {
                    const paidBalance = emp.balances?.paid;
                    return sum + (paidBalance?.allocated || 0);
                  }, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Icon name="Download" className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee Leave Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Leave Balances ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length > 0 ? (
            <div className="space-y-4">
              {filteredEmployees.map((item) => {
                const employee = item.employee || {};
                const balances = item.balances || {};
                const fullName = `${employee.personalInfo?.firstName || employee.firstName || ''} ${employee.personalInfo?.lastName || employee.lastName || ''}`.trim();
                
                return (
                <div
                  key={employee.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{fullName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>ID: {employee.employeeId}</span>
                        <span>Department: {employee.jobInfo?.departmentInfo?.name || employee.jobInfo?.department?.name || employee.department || 'N/A'}</span>
                        <span>Designation: {employee.jobInfo?.designation || employee.jobInfo?.jobTitle || employee.designation || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetailsModal(employee)}
                      >
                        <Icon name="Eye" className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedEmployee(item)}
                      >
                        <Icon name="Edit" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Leave Balance Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(balances).length > 0 ? (
                      Object.entries(balances).map(([type, balance]) => (
                        <div key={type} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg ${getLeaveTypeColor(type).replace('text-', 'bg-').replace('-800', '-100')}`}>
                                <Icon name={getLeaveTypeIcon(type)} className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-medium capitalize text-gray-900">{type} Leave</h4>
                                <Badge variant="outline" className={getLeaveTypeColor(type)}>
                                  {balance.remaining}/{balance.allocated} days
                                </Badge>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditModal(employee, type, balance)}
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                            >
                              <Icon name="Edit" className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Allocated:</span>
                              <span className="font-medium text-gray-900">{balance.allocated} days</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Used:</span>
                              <span className="font-medium text-gray-900">{balance.used} days</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Pending:</span>
                              <span className="font-medium text-orange-600">{balance.pending || 0} days</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Remaining:</span>
                              <span className={`font-medium ${getBalanceColor(balance.remaining, balance.allocated)}`}>
                                {balance.remaining} days
                              </span>
                            </div>
                          </div>
                          
                          {/* Enhanced Progress Bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Usage</span>
                              <span>{balance.allocated > 0 ? Math.round((balance.used / balance.allocated) * 100) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div className="h-full flex">
                                {/* Used portion */}
                                <div
                                  className="bg-red-500 h-full transition-all duration-300"
                                  style={{
                                    width: `${balance.allocated > 0 ? (balance.used / balance.allocated) * 100 : 0}%`
                                  }}
                                ></div>
                                {/* Pending portion */}
                                <div
                                  className="bg-orange-400 h-full transition-all duration-300"
                                  style={{
                                    width: `${balance.allocated > 0 ? ((balance.pending || 0) / balance.allocated) * 100 : 0}%`
                                  }}
                                ></div>
                                {/* Remaining portion */}
                                <div
                                  className="bg-green-500 h-full transition-all duration-300"
                                  style={{
                                    width: `${balance.allocated > 0 ? (balance.remaining / balance.allocated) * 100 : 0}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                Used
                              </span>
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                Pending
                              </span>
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Available
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-8 text-gray-500">
                        <Icon name="Calendar" className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No leave balances assigned</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => {
                            setAssignForm({...assignForm, employeeId: employee.id});
                            setShowAssignModal(true);
                          }}
                        >
                          <Icon name="Plus" className="w-3 h-3 mr-1" />
                          Assign Leave Balance
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="Users" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No employees found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Details Modal */}
      {showDetailsModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {`${selectedEmployee.firstName || ''} ${selectedEmployee.lastName || ''}`.trim()}
                </h3>
                <p className="text-gray-600">Employee ID: {selectedEmployee.employeeId}</p>
                <p className="text-gray-600">Department: {selectedEmployee.department || 'N/A'}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailsModal(false)}
                className="h-8 w-8 p-0"
              >
                <Icon name="X" className="w-4 h-4" />
              </Button>
            </div>

            {/* Employee's Leave Balances */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Leave Balances</h4>
              
              {/* Find the employee's balances */}
              {(() => {
                const employeeData = employees.find(emp => emp.employee?.id === selectedEmployee.id);
                const balances = employeeData?.balances || {};
                
                return Object.entries(balances).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(balances).map(([type, balance]) => (
                      <Card key={type} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg ${getLeaveTypeColor(type).replace('text-', 'bg-').replace('-800', '-100')}`}>
                                <Icon name={getLeaveTypeIcon(type)} className="w-4 h-4" />
                              </div>
                              <h5 className="font-medium capitalize text-gray-900">{type} Leave</h5>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                openEditModal(selectedEmployee, type, balance);
                                setShowDetailsModal(false);
                              }}
                            >
                              <Icon name="Edit" className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Allocated:</span>
                                <span className="font-medium">{balance.allocated} days</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Used:</span>
                                <span className="font-medium text-red-600">{balance.used} days</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Pending:</span>
                                <span className="font-medium text-orange-600">{balance.pending || 0} days</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Remaining:</span>
                                <span className={`font-medium ${getBalanceColor(balance.remaining, balance.allocated)}`}>
                                  {balance.remaining} days
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress visualization */}
                          <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Usage Progress</span>
                              <span>{balance.allocated > 0 ? Math.round(((balance.used + (balance.pending || 0)) / balance.allocated) * 100) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div className="h-full flex">
                                <div
                                  className="bg-red-500 h-full"
                                  style={{ width: `${balance.allocated > 0 ? (balance.used / balance.allocated) * 100 : 0}%` }}
                                ></div>
                                <div
                                  className="bg-orange-400 h-full"
                                  style={{ width: `${balance.allocated > 0 ? ((balance.pending || 0) / balance.allocated) * 100 : 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Icon name="Calendar" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">No leave balances assigned</p>
                    <p className="text-sm mb-4">This employee doesn't have any leave balances set up yet.</p>
                    <Button
                      onClick={() => {
                        setAssignForm({...assignForm, employeeId: selectedEmployee.id});
                        setShowDetailsModal(false);
                        setShowAssignModal(true);
                      }}
                    >
                      <Icon name="Plus" className="w-4 h-4 mr-2" />
                      Assign Leave Balance
                    </Button>
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Leave Balance Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Assign Leave Balance</h3>
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee</label>
                <select 
                  className="w-full border rounded-md px-3 py-2"
                  value={assignForm.employeeId}
                  onChange={(e) => setAssignForm({...assignForm, employeeId: e.target.value})}
                  required
                >
                  <option value="">Select Employee</option>
                  {(employees || []).map((item) => {
                    const emp = item.employee || {};
                    const fullName = `${emp.personalInfo?.firstName || emp.firstName || ''} ${emp.personalInfo?.lastName || emp.lastName || ''}`.trim();
                    return (
                    <option key={emp.id} value={emp.id}>
                      {fullName} ({emp.employeeId})
                    </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Leave Type</label>
                <select 
                  className="w-full border rounded-md px-3 py-2"
                  value={assignForm.leaveType}
                  onChange={(e) => setAssignForm({...assignForm, leaveType: e.target.value})}
                  required
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="paid">Paid Leave</option>
                  <option value="annual">Annual Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (Days)</label>
                <Input 
                  type="number" 
                  placeholder="Enter leave days"
                  value={assignForm.amount}
                  onChange={(e) => setAssignForm({...assignForm, amount: e.target.value})}
                  min="0"
                  step="0.5"
                  required
                />
              </div>
              <div className="flex gap-2 mt-6">
                <Button type="submit" className="flex-1">Assign</Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowAssignModal(false);
                    setAssignForm({ employeeId: '', leaveType: 'casual', amount: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Edit Leave Balance Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Edit Leave Balance</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(false)}
                className="h-8 w-8 p-0"
              >
                <Icon name="X" className="w-4 h-4" />
              </Button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${getLeaveTypeColor(editForm.leaveType).replace('text-', 'bg-').replace('-800', '-100')}`}>
                    <Icon name={getLeaveTypeIcon(editForm.leaveType)} className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium capitalize">{editForm.leaveType} Leave</h4>
                    <p className="text-sm text-gray-600">Current allocation adjustment</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Current Allocated</label>
                  <Input 
                    type="number" 
                    value={editForm.originalAllocated}
                    disabled
                    className="bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Used Days</label>
                  <Input 
                    type="number" 
                    value={editForm.used}
                    disabled
                    className="bg-gray-100 text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">New Allocated Days</label>
                <Input 
                  type="number" 
                  placeholder="Enter new allocated days"
                  value={editForm.allocated}
                  onChange={(e) => setEditForm({...editForm, allocated: e.target.value})}
                  min="0"
                  step="0.5"
                  required
                  className="border-blue-300 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Adjustment: {editForm.allocated ? (parseInt(editForm.allocated) - editForm.originalAllocated) : 0} days
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Reason for Change</label>
                <Input 
                  type="text" 
                  placeholder="Enter reason for adjustment (optional)"
                  value={editForm.reason}
                  onChange={(e) => setEditForm({...editForm, reason: e.target.value})}
                  className="border-gray-300 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be logged for audit purposes
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <h5 className="text-sm font-medium text-blue-900 mb-2">New Balance Summary</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">New Allocated:</span>
                    <span className="font-medium text-blue-900">{editForm.allocated || 0} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Used:</span>
                    <span className="font-medium text-blue-900">{editForm.used} days</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-1">
                    <span className="text-blue-700 font-medium">New Remaining:</span>
                    <span className="font-bold text-blue-900">
                      {Math.max(0, parseInt(editForm.allocated || 0) - parseInt(editForm.used || 0))} days
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button type="submit" className="flex-1">
                  <Icon name="Save" className="w-4 h-4 mr-2" />
                  Update Balance
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditForm({ employeeId: '', leaveType: '', allocated: '', used: '', remaining: '', originalAllocated: 0, reason: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveBalancesPage;