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
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployeeBalances();
  }, []);

  const fetchEmployeeBalances = async () => {
    try {
      setLoading(true);
      const response = await adminLeaveService.getAllEmployeesLeaveBalances();
      setEmployees(response.data?.employees || []);
    } catch (error) {
      console.error('Failed to fetch leave balances:', error);
      toast({
        title: "Error",
        description: "Failed to load leave balances",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignLeaveBalance = async (employeeId, leaveType, amount) => {
    try {
      // TODO: Replace with actual API call
      // await api.post('/admin/leave-balances', { employeeId, leaveType, amount });
      
      toast({
        title: "Success",
        description: "Leave balance assigned successfully",
      });
      
      fetchEmployeeBalances();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign leave balance",
        variant: "destructive",
      });
    }
  };

  const adjustLeaveBalance = async (employeeId, leaveType, adjustment, reason) => {
    try {
      // TODO: Replace with actual API call
      // await api.put(`/admin/leave-balances/${employeeId}`, { leaveType, adjustment, reason });
      
      toast({
        title: "Success",
        description: "Leave balance adjusted successfully",
      });
      
      fetchEmployeeBalances();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to adjust leave balance",
        variant: "destructive",
      });
    }
  };

  const filteredEmployees = (employees || []).filter(item => {
    const employee = item.employee || {};
    const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    const employeeId = employee.employeeId || '';
    const department = employee.department || '';
    
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           department.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getBalanceColor = (remaining, allocated) => {
    const percentage = (remaining / allocated) * 100;
    if (percentage > 50) return "text-green-600";
    if (percentage > 25) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return <LoadingSpinner message="Loading leave balances..." />;
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
                const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
                
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
                        <span>Department: {employee.department}</span>
                        <span>Designation: {employee.designation}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
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
                    {Object.entries(balances).map(([type, balance]) => (
                      <div key={type} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium capitalize">{type} Leave</h4>
                          <Badge variant="outline">
                            {balance.remaining}/{balance.allocated}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Allocated:</span>
                            <span className="font-medium">{balance.allocated}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Used:</span>
                            <span className="font-medium">{balance.used}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Remaining:</span>
                            <span className={`font-medium ${getBalanceColor(balance.remaining, balance.allocated)}`}>
                              {balance.remaining}
                            </span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(balance.remaining / balance.allocated) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
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

      {/* Assign Leave Balance Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Assign Leave Balance</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee</label>
                <select className="w-full border rounded-md px-3 py-2">
                  <option value="">Select Employee</option>
                  {(employees || []).map((item) => {
                    const emp = item.employee || {};
                    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
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
                <select className="w-full border rounded-md px-3 py-2">
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="paid">Paid Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <Input type="number" placeholder="Enter leave days" />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button className="flex-1">Assign</Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveBalancesPage;