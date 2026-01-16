import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Users, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import { formatIndianTime } from '../../../utils/indianFormatters';

const ShiftDetails = ({ shiftId, onClose }) => {
  const [shift, setShift] = useState(null);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShiftDetails();
    fetchAssignedEmployees();
  }, [shiftId]);

  const fetchShiftDetails = async () => {
    try {
      const response = await api.get(`/admin/shifts/${shiftId}`);
      setShift(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch shift details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedEmployees = async () => {
    try {
      const response = await api.get('/admin/shifts/assignments/list', {
        params: { shiftId, limit: 100, isActive: true }
      });
      
      console.log('🔍 [SHIFT DETAILS] Assignments Response:', response);
      
      // Handle different response structures
      let assignmentsData = [];
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        assignmentsData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        assignmentsData = response.data;
      }
      
      console.log('✅ [SHIFT DETAILS] Extracted assignments:', assignmentsData.length, 'assignments');
      setAssignedEmployees(assignmentsData);
      
    } catch (error) {
      console.error('Failed to fetch assigned employees:', error);
      setAssignedEmployees([]); // Ensure empty array on error
      // Don't show toast error for this as it's not critical
    }
  };

  const handleRemoveEmployee = async (assignmentId) => {
    if (!confirm('Remove this employee from the shift?')) return;

    try {
      await api.patch(`/admin/shifts/assignments/${assignmentId}/end`, {
        endDate: new Date().toISOString().split('T')[0]
      });
      toast.success('Employee removed successfully');
      fetchAssignedEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove employee');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Shift not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Shift Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Shift Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-600">Shift Name</p>
              <p className="text-lg font-semibold">{shift.shiftName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Shift Code</p>
              <p className="text-lg font-semibold">{shift.shiftCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Start Time</p>
              <p className="text-lg font-semibold">{shift.shiftStartTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">End Time</p>
              <p className="text-lg font-semibold">{shift.shiftEndTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge className={shift.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {shift.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Default Shift</p>
              <Badge className={shift.isDefault ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>
                {shift.isDefault ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>

          {shift.description && (
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-gray-900">{shift.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Hours Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Work Hours Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-600">Full Day Hours</p>
              <p className="text-lg font-semibold">{shift.fullDayHours}h</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Half Day Hours</p>
              <p className="text-lg font-semibold">{shift.halfDayHours}h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Attendance Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <p className="text-sm text-gray-600">Grace Period</p>
              <p className="text-lg font-semibold">{shift.gracePeriodMinutes} min</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Late Threshold</p>
              <p className="text-lg font-semibold">{shift.lateThresholdMinutes} min</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Early Departure</p>
              <p className="text-lg font-semibold">{shift.earlyDepartureThresholdMinutes} min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Break Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Break Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-600">Default Break</p>
              <p className="text-lg font-semibold">{shift.defaultBreakMinutes} min</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Maximum Break</p>
              <p className="text-lg font-semibold">{shift.maxBreakMinutes} min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overtime Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Overtime Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-600">Overtime Enabled</p>
              <Badge className={shift.overtimeEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {shift.overtimeEnabled ? 'Yes' : 'No'}
              </Badge>
            </div>
            {shift.overtimeEnabled && (
              <div>
                <p className="text-sm text-gray-600">Overtime Threshold</p>
                <p className="text-lg font-semibold">{formatIndianTime(shift.overtimeThresholdMinutes)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assigned Employees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Assigned Employees ({assignedEmployees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedEmployees.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No employees assigned to this shift</p>
          ) : (
            <div className="space-y-2">
              {assignedEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {emp.employee?.firstName || 'N/A'} {emp.employee?.lastName || ''}
                    </p>
                    <p className="text-sm text-gray-600">{emp.employee?.user?.email || emp.employee?.email || 'No email'}</p>
                    <p className="text-xs text-gray-500">ID: {emp.employee?.employeeId || 'N/A'}</p>
                  </div>
                  {/* Only show remove button if assignment is active and not ended */}
                  {(!emp.endDate || new Date(emp.endDate) > new Date()) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveEmployee(emp.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Remove employee from shift"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Close Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default ShiftDetails;
