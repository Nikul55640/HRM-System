import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { Input } from "../../../shared/ui/input";
import { Icon, LoadingSpinner } from "../../../shared/components";
import { useToast } from "../../../core/hooks/use-toast";
import api from "../../../core/services/api";

const ShiftsPage = () => {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchShifts();
    fetchEmployees();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/shifts');
      setShifts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch shifts:', error);
      toast({
        title: "Error",
        description: "Failed to load shifts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const createShift = async (shiftData) => {
    try {
      // TODO: Replace with actual API call
      // await api.post('/admin/shifts', shiftData);
      
      toast({
        title: "Success",
        description: "Shift created successfully",
      });
      
      fetchShifts();
      setShowCreateModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shift",
        variant: "destructive",
      });
    }
  };

  const assignShift = async (shiftId, employeeIds) => {
    try {
      // TODO: Replace with actual API call
      // await api.post('/admin/shifts/assign', { shiftId, employeeIds });
      
      toast({
        title: "Success",
        description: "Shift assigned successfully",
      });
      
      fetchShifts();
      setShowAssignModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign shift",
        variant: "destructive",
      });
    }
  };

  const toggleShiftStatus = async (shiftId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      // TODO: Replace with actual API call
      // await api.put(`/admin/shifts/${shiftId}`, { isActive: newStatus });
      
      setShifts((shifts || []).map(shift => 
        shift.id === shiftId ? { ...shift, isActive: newStatus } : shift
      ));
      
      toast({
        title: "Success",
        description: `Shift ${newStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update shift status",
        variant: "destructive",
      });
    }
  };

  const calculateShiftDuration = (startTime, endTime) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let startMinutes = startHour * 60 + startMinute;
    let endMinutes = endHour * 60 + endMinute;
    
    // Handle overnight shifts
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    
    const durationMinutes = endMinutes - startMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return <LoadingSpinner message="Loading shifts..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shift Management</h1>
          <p className="text-gray-600">Create and manage work shifts with rules and assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAssignModal(true)}
          >
            <Icon name="UserPlus" className="w-4 h-4 mr-2" />
            Assign Shifts
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Icon name="Plus" className="w-4 h-4 mr-2" />
            Create Shift
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon name="Clock" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Shifts</p>
                <p className="text-2xl font-bold">{shifts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon name="CheckCircle" className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Shifts</p>
                <p className="text-2xl font-bold">
                  {(shifts || []).filter(s => s.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icon name="Users" className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Assigned Employees</p>
                <p className="text-2xl font-bold">
                  {shifts.reduce((sum, shift) => sum + shift.assignedEmployees, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Icon name="Clock4" className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold">8h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shifts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          {(shifts || []).length > 0 ? (
            <div className="space-y-4">
              {(shifts || []).map((shift) => (
                <div
                  key={shift.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{shift.name}</h3>
                        <Badge variant={shift.isActive ? "success" : "secondary"}>
                          {shift.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {shift.overtimeEnabled && (
                          <Badge variant="outline">Overtime Enabled</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Time:</span> {shift.shiftStartTime} - {shift.shiftEndTime}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {calculateShiftDuration(shift.shiftStartTime, shift.shiftEndTime)}
                        </div>
                        <div>
                          <span className="font-medium">Grace Period:</span> {shift.gracePeriodMinutes} min
                        </div>
                        <div>
                          <span className="font-medium">Break Time:</span> {shift.breakDurationMinutes} min
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-600">Working Days: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(shift.workingDays || []).map((day) => (
                            <Badge key={day} variant="outline" className="text-xs">
                              {day.substring(0, 3)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm">
                        <p className="font-medium">{shift.assignedEmployees}</p>
                        <p className="text-gray-500">Employees</p>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedShift(shift);
                          setShowAssignModal(true);
                        }}
                      >
                        <Icon name="UserPlus" className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Icon name="Edit" className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant={shift.isActive ? "destructive" : "default"}
                        onClick={() => toggleShiftStatus(shift.id, shift.isActive)}
                      >
                        {shift.isActive ? (
                          <Icon name="Pause" className="w-4 h-4" />
                        ) : (
                          <Icon name="Play" className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Shift Rules */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2">Shift Rules</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Late Arrival Grace:</span> {shift.gracePeriodMinutes} minutes
                      </div>
                      <div>
                        <span className="font-medium">Break Duration:</span> {shift.breakDurationMinutes} minutes
                      </div>
                      {shift.overtimeEnabled && (
                        <div>
                          <span className="font-medium">Overtime After:</span> {shift.overtimeThresholdMinutes} minutes
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="Clock" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No shifts created yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Shift Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Create New Shift</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Shift Name</label>
                <Input placeholder="e.g., Morning Shift" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <Input type="time" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <Input type="time" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Grace Period (minutes)</label>
                <Input type="number" placeholder="15" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Break Duration (minutes)</label>
                <Input type="number" placeholder="60" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Overtime Threshold (minutes)</label>
                <Input type="number" placeholder="30" />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Working Days</label>
              <div className="flex flex-wrap gap-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <label key={day} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button className="flex-1" onClick={() => setShowCreateModal(false)}>
                Create Shift
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Shift Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Assign Shift to Employees</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Shift</label>
                <select className="w-full border rounded-md px-3 py-2">
                  {(shifts || []).map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name} ({shift.shiftStartTime} - {shift.shiftEndTime})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Select Employees</label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                  {(employees || []).map((employee) => (
                    <label key={employee.id} className="flex items-center gap-2 p-1">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">
                        {employee.name} ({employee.employeeId}) - {employee.department}
                      </span>
                    </label>
                  ))}
                </div>
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

export default ShiftsPage;