import { useState, useEffect } from "react";
import { Card, CardContent } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Icon, LoadingSpinner, EmptyState } from "../../../shared/components";
import { useToast } from "../../../core/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Label } from "../../../shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/ui/select";
import { Badge } from "../../../shared/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../../shared/ui/table";
import adminLeaveService from "../../../services/adminLeaveService";

const LeaveBalancesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [viewMode, setViewMode] = useState("summary"); // "summary" or "detailed"

  // Define standard leave types for consistent columns
  const LEAVE_TYPES = [
    { key: "casual", label: "Casual", icon: "Calendar" },
    { key: "sick", label: "Sick", icon: "Heart" },
    { key: "paid", label: "Paid", icon: "Banknote" }
  ];

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
      // Backend returns { success: true, message: "...", data: { summary: {...}, employees: [...] } }
      setEmployees(response?.data?.employees || []);
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
      
      // Find the employee and check if they already have this leave type
      const employee = employees.find(emp => emp.employee.id === assignForm.employeeId);
      const existingBalance = employee?.balances?.[assignForm.leaveType];
      
      if (existingBalance) {
        // If leave type exists, add to existing balance using adjustment
        const additionalAmount = parseInt(assignForm.amount);
        await adminLeaveService.updateLeaveBalance(assignForm.employeeId, {
          leaveType: assignForm.leaveType,
          adjustment: additionalAmount, // This adds to existing balance
          reason: `Added ${additionalAmount} days to existing ${assignForm.leaveType} leave balance`,
          year: new Date().getFullYear()
        });
        
        toast({ 
          title: "Success", 
          description: `Added ${additionalAmount} days to existing ${assignForm.leaveType} leave balance. New total: ${existingBalance.allocated + additionalAmount} days` 
        });
      } else {
        // If leave type doesn't exist, create new balance
        await adminLeaveService.assignLeaveBalance(assignForm.employeeId, {
          leaveType: assignForm.leaveType,
          balance: parseInt(assignForm.amount),
          year: new Date().getFullYear()
        });
        
        toast({ 
          title: "Success", 
          description: `Assigned ${assignForm.amount} days of ${assignForm.leaveType} leave` 
        });
      }
      
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
      casual: "bg-blue-100 text-blue-800 border-blue-200",
      sick: "bg-red-100 text-red-800 border-red-200",
      paid: "bg-green-100 text-green-800 border-green-200",
      annual: "bg-purple-100 text-purple-800 border-purple-200",
      maternity: "bg-pink-100 text-pink-800 border-pink-200",
      paternity: "bg-indigo-100 text-indigo-800 border-indigo-200",
      emergency: "bg-orange-100 text-orange-800 border-orange-200",
      compensatory: "bg-yellow-100 text-yellow-800 border-yellow-200"
    }[type] || "bg-gray-100 text-gray-800 border-gray-200");

  const getProgressColor = (used, allocated) => {
    if (allocated === 0) return "bg-gray-300";
    const percentage = used / allocated;
    if (percentage > 0.8) return "bg-red-500";
    if (percentage > 0.6) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getProgressPercentage = (used, allocated) => {
    if (allocated === 0) return 0;
    return Math.min((used / allocated) * 100, 100);
  };

  // Filter employees based on search term
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

  // Summary data: One row per employee with all leave types as columns
  const summaryData = filteredEmployees.map((item) => {
    const emp = item.employee;
    const balances = item.balances || {};
    
    return {
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeCode: emp.employeeId,
      department: emp.department || "N/A",
      leaves: LEAVE_TYPES.map(leaveType => ({
        type: leaveType.key,
        label: leaveType.label,
        icon: leaveType.icon,
        data: balances[leaveType.key] || null
      })),
      hasAnyLeave: Object.keys(balances).length > 0
    };
  });

  // Detailed data: Flatten the data for table display (current design)
  const detailedData = filteredEmployees.flatMap((item) => {
    const emp = item.employee;
    const balances = item.balances || {};
    
    if (Object.keys(balances).length === 0) {
      return [{
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        employeeCode: emp.employeeId,
        department: emp.department || "N/A",
        leaveType: null,
        balance: null,
        isEmpty: true
      }];
    }
    
    return Object.entries(balances).map(([type, balance]) => ({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeCode: emp.employeeId,
      department: emp.department || "N/A",
      leaveType: type,
      balance: balance,
      isEmpty: false
    }));
  });

  // Use appropriate data based on view mode
  const tableData = viewMode === "summary" ? summaryData : detailedData;

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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Input
            placeholder="Search by name, employee ID, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <div className="text-sm text-gray-500">
            {viewMode === "summary" 
              ? `${summaryData.length} employees` 
              : `${detailedData.length} leave balance records from ${filteredEmployees.length} employees`
            }
          </div>
        </div>
        
        {/* VIEW MODE TOGGLE */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <Button
            size="sm"
            variant={viewMode === "summary" ? "default" : "ghost"}
            onClick={() => setViewMode("summary")}
            className="text-xs"
          >
            <Icon name="LayoutGrid" className="w-4 h-4 mr-1" />
            Summary View
          </Button>
          <Button
            size="sm"
            variant={viewMode === "detailed" ? "default" : "ghost"}
            onClick={() => setViewMode("detailed")}
            className="text-xs"
          >
            <Icon name="List" className="w-4 h-4 mr-1" />
            Detailed View
          </Button>
        </div>
      </div>

      {/* EMPLOYEE LIST */}
      {tableData.length === 0 ? (
        <EmptyState
          icon="Users"
          title="No employees found"
          description={searchTerm ? "No employees match your search criteria" : "No employees with leave balances found"}
        />
      ) : (
        <Card className="rounded-2xl border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Employee</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    
                    {viewMode === "summary" ? (
                      // Summary View Headers - One column per leave type
                      <>
                        {LEAVE_TYPES.map((leaveType) => (
                          <TableHead key={leaveType.key} className="font-semibold text-center min-w-[120px]">
                            <div className="flex items-center justify-center gap-1">
                              <Icon name={leaveType.icon} className="w-4 h-4" />
                              <span>{leaveType.label}</span>
                            </div>
                          </TableHead>
                        ))}
                        <TableHead className="font-semibold text-center">Actions</TableHead>
                      </>
                    ) : (
                      // Detailed View Headers - Current design
                      <>
                        <TableHead className="font-semibold">Leave Type</TableHead>
                        <TableHead className="font-semibold text-center">Allocated</TableHead>
                        <TableHead className="font-semibold text-center">Used</TableHead>
                        <TableHead className="font-semibold text-center">Remaining</TableHead>
                        <TableHead className="font-semibold text-center">Pending</TableHead>
                        <TableHead className="font-semibold text-center">Usage</TableHead>
                        <TableHead className="font-semibold text-center">Actions</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewMode === "summary" ? (
                    // SUMMARY VIEW - One row per employee
                    summaryData.map((employee) => (
                      <TableRow key={employee.employeeId} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{employee.employeeName}</div>
                            <div className="text-sm text-gray-500">{employee.employeeCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{employee.department}</span>
                        </TableCell>
                        
                        {/* Leave Type Columns */}
                        {employee.leaves.map((leave) => (
                          <TableCell key={leave.type} className="text-center">
                            {leave.data ? (
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  <span className="text-green-600">{leave.data.remaining}</span>
                                  <span className="text-gray-400 mx-1">/</span>
                                  <span>{leave.data.allocated}</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${getProgressColor(leave.data.used, leave.data.allocated)}`}
                                    style={{
                                      width: `${getProgressPercentage(leave.data.used, leave.data.allocated)}%`
                                    }}
                                  />
                                </div>
                                {/* <div className="text-xs text-gray-500">
                                  {Math.round(getProgressPercentage(leave.data.used, leave.data.allocated))}% used
                                </div> */}
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm">
                                <span>—</span>
                                <div className="mt-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => {
                                      setAssignForm({
                                        employeeId: employee.employeeId,
                                        leaveType: leave.type,
                                        amount: ""
                                      });
                                      setShowAssignModal(true);
                                    }}
                                  >
                                    <Icon name="Plus" className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </TableCell>
                        ))}
                        
                        {/* Actions Column */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setAssignForm({
                                  employeeId: employee.employeeId,
                                  leaveType: "casual",
                                  amount: ""
                                });
                                setShowAssignModal(true);
                              }}
                              title="Assign new leave"
                            >
                              <Icon name="Plus" className="w-4 h-4" />
                            </Button>
                            {employee.hasAnyLeave && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setViewMode("detailed")}
                                title="View details"
                              >
                                <Icon name="Eye" className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // DETAILED VIEW - Current design
                    detailedData.map((row, index) => (
                      <TableRow key={`${row.employeeId}-${row.leaveType || 'empty'}-${index}`} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{row.employeeName}</div>
                            <div className="text-sm text-gray-500">{row.employeeCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{row.department}</span>
                        </TableCell>
                        <TableCell>
                          {row.isEmpty ? (
                            <span className="text-gray-400 text-sm">No leave assigned</span>
                          ) : (
                            <Badge 
                              variant="outline" 
                              className={`${getLeaveTypeColor(row.leaveType)} border`}
                            >
                              <Icon
                                name={getLeaveIcon(row.leaveType)}
                                className="w-3 h-3 mr-1"
                              />
                              {row.leaveType.charAt(0).toUpperCase() + row.leaveType.slice(1)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.isEmpty ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            <span className="font-medium">{row.balance.allocated}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.isEmpty ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            <span className="font-medium text-red-600">{row.balance.used}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.isEmpty ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            <span className="font-bold text-lg">{row.balance.remaining}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.isEmpty ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            <span className="font-medium text-orange-600">{row.balance.pending || 0}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.isEmpty ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${getProgressColor(row.balance.used, row.balance.allocated)}`}
                                  style={{
                                    width: `${getProgressPercentage(row.balance.used, row.balance.allocated)}%`
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 min-w-[2rem]">
                                {Math.round(getProgressPercentage(row.balance.used, row.balance.allocated))}%
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.isEmpty ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAssignForm({
                                  employeeId: row.employeeId,
                                  leaveType: "casual",
                                  amount: ""
                                });
                                setShowAssignModal(true);
                              }}
                            >
                              <Icon name="Plus" className="w-4 h-4 mr-1" />
                              Assign
                            </Button>
                          ) : (
                            <div className="flex items-center justify-center space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditForm({
                                    employeeId: row.employeeId,
                                    leaveType: row.leaveType,
                                    allocated: row.balance.allocated,
                                    used: row.balance.used,
                                    originalAllocated: row.balance.allocated,
                                    reason: ""
                                  });
                                  setShowEditModal(true);
                                }}
                              >
                                <Icon name="Edit" className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setAssignForm({
                                    employeeId: row.employeeId,
                                    leaveType: "casual",
                                    amount: ""
                                  });
                                  setShowAssignModal(true);
                                }}
                              >
                                <Icon name="Plus" className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
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
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="paid">Paid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show current balance if exists */}
            {assignForm.employeeId && assignForm.leaveType && (() => {
              const employee = employees.find(emp => emp.employee.id === assignForm.employeeId);
              const existingBalance = employee?.balances?.[assignForm.leaveType];
              
              if (existingBalance) {
                return (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Current Balance</p>
                    <p className="text-sm text-blue-600">
                      {existingBalance.allocated} days allocated, {existingBalance.used} used, {existingBalance.remaining} remaining
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      Adding days will increase the total allocation
                    </p>
                  </div>
                );
              }
              return null;
            })()}

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
              <p className="text-xs text-gray-500">
                {(() => {
                  const employee = employees.find(emp => emp.employee.id === assignForm.employeeId);
                  const existingBalance = employee?.balances?.[assignForm.leaveType];
                  
                  if (existingBalance && assignForm.amount) {
                    const newTotal = existingBalance.allocated + parseInt(assignForm.amount);
                    return `New total will be: ${newTotal} days`;
                  } else if (assignForm.amount) {
                    return `Will create new balance with ${assignForm.amount} days`;
                  }
                  return "Enter the number of days to assign";
                })()}
              </p>
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
                  (() => {
                    const employee = employees.find(emp => emp.employee.id === assignForm.employeeId);
                    const existingBalance = employee?.balances?.[assignForm.leaveType];
                    return existingBalance ? "Add to Balance" : "Assign Leave";
                  })()
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
