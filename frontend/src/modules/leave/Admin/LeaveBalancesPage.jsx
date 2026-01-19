import { useState, useEffect } from "react";
import { Card, CardContent } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Icon, LoadingSpinner, EmptyState } from "../../../shared/components";
import { useToast } from "../../../core/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Label } from "../../../shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import adminLeaveService from "../../../services/adminLeaveService";

const LeaveBalancesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [assignForm, setAssignForm] = useState({
    employeeId: "",
    leaveType: "casual",
    amount: ""
  });

  const [editForm, setEditForm] = useState({
    employeeId: "",
    leaveType: "",
    allocated: "",
    used: "",
    originalAllocated: 0,
    reason: ""
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchEmployeeBalances();
  }, []);

  const fetchEmployeeBalances = async () => {
    try {
      setLoading(true);
      const response = await adminLeaveService.getAllEmployeesLeaveBalances();
      setEmployees(response?.data?.employees || response || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load leave balances",
        variant: "destructive"
      });
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const assignLeaveBalance = async () => {
    if (!assignForm.employeeId || !assignForm.amount) {
      toast({
        title: "Validation Error",
        description: "Please select an employee and enter amount",
        variant: "destructive"
      });
      return;
    }

    try {
      setAssignLoading(true);
      await adminLeaveService.assignLeaveBalance(assignForm.employeeId, {
        leaveType: assignForm.leaveType,
        balance: parseInt(assignForm.amount),
        year: new Date().getFullYear()
      });
      
      toast({ 
        title: "Success", 
        description: "Leave balance assigned successfully" 
      });
      
      // Reset form and close modal
      setAssignForm({
        employeeId: "",
        leaveType: "casual",
        amount: ""
      });
      setShowAssignModal(false);
      
      // Refresh data
      await fetchEmployeeBalances();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign leave balance",
        variant: "destructive"
      });
    } finally {
      setAssignLoading(false);
    }
  };

  const adjustLeaveBalance = async () => {
    if (!editForm.allocated || !editForm.reason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter allocated days and reason",
        variant: "destructive"
      });
      return;
    }

    try {
      setEditLoading(true);
      const adjustment = parseInt(editForm.allocated) - editForm.originalAllocated;

      await adminLeaveService.updateLeaveBalance(editForm.employeeId, {
        leaveType: editForm.leaveType,
        adjustment,
        reason: editForm.reason,
        year: new Date().getFullYear()
      });

      toast({ 
        title: "Success", 
        description: "Leave balance updated successfully" 
      });
      
      // Reset form and close modal
      setEditForm({
        employeeId: "",
        leaveType: "",
        allocated: "",
        used: "",
        originalAllocated: 0,
        reason: ""
      });
      setShowEditModal(false);
      
      // Refresh data
      await fetchEmployeeBalances();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update leave balance",
        variant: "destructive"
      });
    } finally {
      setEditLoading(false);
    }
  };

  const getLeaveIcon = (type) =>
    ({
      casual: "Calendar",
      sick: "Heart",
      paid: "Banknote",
      annual: "Plane",
      maternity: "Baby",
      paternity: "Users",
      emergency: "AlertTriangle",
      compensatory: "Clock"
    }[type] || "Calendar");

  const getLeaveTypeColor = (type) =>
    ({
      casual: "bg-blue-100 text-blue-800",
      sick: "bg-red-100 text-red-800",
      paid: "bg-green-100 text-green-800",
      annual: "bg-purple-100 text-purple-800",
      maternity: "bg-pink-100 text-pink-800",
      paternity: "bg-indigo-100 text-indigo-800",
      emergency: "bg-orange-100 text-orange-800",
      compensatory: "bg-yellow-100 text-yellow-800"
    }[type] || "bg-gray-100 text-gray-800");

  const filteredEmployees = employees.filter((item) => {
    const emp = item.employee || {};
    const name = `${emp.firstName || ""} ${emp.lastName || ""}`.toLowerCase();
    const employeeId = (emp.employeeId || "").toLowerCase();
    const department = (emp.department || "").toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return name.includes(searchLower) || 
           employeeId.includes(searchLower) || 
           department.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Leave Balance Management</h1>
          <p className="text-gray-500 text-sm">
            Manage employee leave allocations
          </p>
        </div>
        <Button onClick={() => setShowAssignModal(true)}>
          <Icon name="Plus" className="w-4 h-4 mr-2" />
          Assign Leave
        </Button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Input
          placeholder="Search by name, employee ID, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <div className="text-sm text-gray-500">
          {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>

      {/* EMPLOYEE LIST */}
      {filteredEmployees.length === 0 ? (
        <EmptyState
          icon="Users"
          title="No employees found"
          description={searchTerm ? "No employees match your search criteria" : "No employees with leave balances found"}
        />
      ) : (
        <div className="space-y-6">
          {filteredEmployees.map((item) => {
            const emp = item.employee;
            const balances = item.balances || {};

            return (
              <Card key={emp.id} className="rounded-2xl border">
                <CardContent className="p-6 space-y-5">

                  {/* EMPLOYEE HEADER */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {emp.firstName} {emp.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {emp.employeeId} • {emp.department || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* LEAVE CARDS */}
                  {Object.keys(balances).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Icon name="Calendar" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No leave balances assigned</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {Object.entries(balances).map(([type, balance]) => (
                        <div
                          key={type}
                          className="rounded-xl border bg-gray-50 p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <Icon
                                name={getLeaveIcon(type)}
                                className="w-5 h-5 text-gray-600"
                              />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(type)}`}>
                                {type.charAt(0).toUpperCase() + type.slice(1)} Leave
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditForm({
                                  employeeId: emp.id,
                                  leaveType: type,
                                  allocated: balance.allocated,
                                  used: balance.used,
                                  originalAllocated: balance.allocated,
                                  reason: ""
                                });
                                setShowEditModal(true);
                              }}
                            >
                              <Icon name="Edit" className="w-4 h-4" />
                            </Button>
                          </div>

                          <p className="text-3xl font-bold">
                            {balance.remaining}
                            <span className="text-sm font-normal text-gray-500 ml-1">
                              days left
                            </span>
                          </p>

                          <div className="mt-3">
                            <div className="w-full h-2 bg-gray-200 rounded-full">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  balance.allocated > 0 
                                    ? balance.used / balance.allocated > 0.8 
                                      ? 'bg-red-500' 
                                      : balance.used / balance.allocated > 0.6 
                                        ? 'bg-yellow-500' 
                                        : 'bg-green-500'
                                    : 'bg-gray-300'
                                }`}
                                style={{
                                  width: `${
                                    balance.allocated > 0 
                                      ? Math.min((balance.used / balance.allocated) * 100, 100)
                                      : 0
                                  }%`
                                }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 text-sm text-center mt-3">
                            <div>
                              <p className="text-gray-500">Allocated</p>
                              <p className="font-semibold">{balance.allocated}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Used</p>
                              <p className="font-semibold text-red-600">
                                {balance.used}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Pending</p>
                              <p className="font-semibold text-orange-500">
                                {balance.pending || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ASSIGN MODAL */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Leave Balance</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select
                value={assignForm.employeeId}
                onValueChange={(value) =>
                  setAssignForm({ ...assignForm, employeeId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.employee.id} value={e.employee.id}>
                      {e.employee.firstName} {e.employee.lastName} ({e.employee.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="leaveType">Leave Type</Label>
              <Select
                value={assignForm.leaveType}
                onValueChange={(value) =>
                  setAssignForm({ ...assignForm, leaveType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="paid">Paid Leave</SelectItem>

                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Number of Days</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                max="365"
                placeholder="Enter number of days"
                value={assignForm.amount}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, amount: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                onClick={assignLeaveBalance}
                disabled={assignLoading}
              >
                {assignLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Assigning...
                  </>
                ) : (
                  "Assign Leave"
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAssignModal(false)}
                disabled={assignLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Leave Balance</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="allocated">Allocated Days</Label>
              <Input
                id="allocated"
                type="number"
                min="0"
                max="365"
                value={editForm.allocated}
                onChange={(e) =>
                  setEditForm({ ...editForm, allocated: e.target.value })
                }
              />
              <p className="text-sm text-gray-500">
                Current: {editForm.originalAllocated} days
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Change</Label>
              <Input
                id="reason"
                placeholder="Enter reason for adjustment"
                value={editForm.reason}
                onChange={(e) =>
                  setEditForm({ ...editForm, reason: e.target.value })
                }
              />
            </div>

            {editForm.allocated && editForm.originalAllocated && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Adjustment Summary:</p>
                <p className="text-sm text-gray-600">
                  {parseInt(editForm.allocated) - editForm.originalAllocated > 0 ? "+" : ""}
                  {parseInt(editForm.allocated) - editForm.originalAllocated} days
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                onClick={adjustLeaveBalance}
                disabled={editLoading}
              >
                {editLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Balance"
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveBalancesPage;
