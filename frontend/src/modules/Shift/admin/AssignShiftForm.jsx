import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Badge } from '../../../shared/ui/badge';
import { Search, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const AssignShiftForm = ({ shift, onSuccess, onCancel }) => {
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shift) {
      fetchAssignedEmployees();
      fetchAvailableEmployees();
    }
  }, [shift]);

  const fetchAvailableEmployees = async () => {
    try {
      const response = await api.get('/employees', { params: { limit: 100 } });
      console.log('📊 [AssignShiftForm] Employees response:', response.data);
      const employees = response.data.data || response.data || [];
      console.log('📊 [AssignShiftForm] Extracted employees:', employees);
      setAvailableEmployees(employees);
    } catch (error) {
      console.error('❌ [AssignShiftForm] Failed to load employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const fetchAssignedEmployees = async () => {
    try {
      console.log('🔄 [AssignShiftForm] Fetching assigned employees for shift:', shift.id);
      
      const response = await api.get('/admin/shifts/assignments/list', {
        params: { shiftId: shift.id, limit: 100, isActive: true }
      });
      
      console.log('📊 [AssignShiftForm] Assigned employees response:', response.data);
      
      // Handle different response structures
      let assignmentsData = [];
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        assignmentsData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        assignmentsData = response.data;
      }
      
      console.log('✅ [AssignShiftForm] Extracted assignments:', assignmentsData.length, 'assignments');
      setAssignedEmployees(assignmentsData);
      
    } catch (error) {
      console.error('❌ [AssignShiftForm] Failed to fetch assigned employees:', error);
      console.error('❌ [AssignShiftForm] Error response:', error.response?.data);
      // If endpoint doesn't exist, just set empty
      setAssignedEmployees([]);
    }
  };

  const handleAssignEmployee = async (employeeId) => {
    setLoading(true);
    try {
      console.log('🔄 [AssignShiftForm] Assigning employee:', { employeeId, shiftId: shift.id });
      
      const assignmentData = { 
        employeeId,
        shiftId: shift.id,
        effectiveDate: new Date().toISOString().split('T')[0]
      };
      
      console.log('� [AssignShiftForm] Assignment data:', assignmentData);
      
      const response = await api.post('/admin/shifts/assignments', assignmentData);
      
      console.log('✅ [AssignShiftForm] Assignment response:', response.data);
      
      toast.success('Employee assigned successfully');
      fetchAssignedEmployees();
      setEmployeeSearch('');
    } catch (error) {
      console.error('❌ [AssignShiftForm] Assignment error:', error);
      console.error('❌ [AssignShiftForm] Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to assign employee');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEmployee = async (assignmentId) => {
    if (!confirm('Remove this employee from the shift?')) return;

    setLoading(true);
    try {
      await api.patch(`/admin/shifts/assignments/${assignmentId}/end`, {
        endDate: new Date().toISOString().split('T')[0]
      });
      toast.success('Employee removed successfully');
      fetchAssignedEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove employee');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEmployees = () => {
    const assignedIds = assignedEmployees.map(e => e.employee?.id || e.employeeId);
    return availableEmployees.filter(emp => {
      const isAssigned = assignedIds.includes(emp.id);
      const matchesSearch = employeeSearch === '' || 
        `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        (emp.email || emp.user?.email || '').toLowerCase().includes(employeeSearch.toLowerCase()) ||
        (emp.employeeId || '').toLowerCase().includes(employeeSearch.toLowerCase());
      return !isAssigned && matchesSearch;
    });
  };

  return (
    <div className="space-y-4">
      {/* Shift Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Assigning to Shift</p>
              <p className="text-lg font-semibold text-blue-900">
                {shift.shiftName} ({shift.shiftCode})
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {shift.shiftStartTime} - {shift.shiftEndTime}
              </p>
            </div>
            <Badge className="bg-blue-600 text-white text-lg px-3 py-1">
              {assignedEmployees.length} assigned
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Available Employees */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Employees ({getFilteredEmployees().length})</CardTitle>
        </CardHeader>
        <CardContent>
          {getFilteredEmployees().length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              {availableEmployees.length === 0 ? 'No employees available' : 'All employees are already assigned'}
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {getFilteredEmployees().map((emp) => (
                <div
                  key={emp.id || emp._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {emp.firstName || 'N/A'} {emp.lastName || ''}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{emp.email || emp.user?.email || 'No email'}</p>
                    <p className="text-xs text-gray-500">ID: {emp.employeeId || 'N/A'}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAssignEmployee(emp.id || emp._id)}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 ml-2 flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assigned Employees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5" />
            Assigned Employees ({assignedEmployees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedEmployees.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No employees assigned yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {assignedEmployees.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {assignment.employee?.firstName || 'N/A'} {assignment.employee?.lastName || ''}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{assignment.employee?.email || assignment.employee?.user?.email || 'No email'}</p>
                    <p className="text-xs text-gray-500">ID: {assignment.employee?.employeeId || 'N/A'}</p>
                    <p className="text-xs text-gray-400">Effective: {assignment.effectiveDate || 'N/A'}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveEmployee(assignment.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="text-sm"
        >
          Close
        </Button>
        <Button
          onClick={onSuccess}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-sm"
        >
          Done
        </Button>
      </div>
    </div>
  );
};

export default AssignShiftForm;