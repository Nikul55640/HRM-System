import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Badge } from '../../../shared/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  Users,
  Settings,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import api from '../../../core/api/api';
import ShiftForm from './ShiftForm';
import ShiftDetails from './ShiftDetails';

const ShiftManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    isActive: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", pagination.page);
      queryParams.append("limit", pagination.limit);

      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/admin/shifts?${queryParams}`);
      setShifts(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      }));
    } catch (error) {
      toast.error("Failed to fetch shifts");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchShifts();
    fetchStats();
  }, [fetchShifts]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/shifts/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCreateShift = () => {
    setSelectedShift(null);
    setShowForm(true);
  };

  const handleEditShift = (shift) => {
    setSelectedShift(shift);
    setShowForm(true);
  };

  const handleViewShift = (shift) => {
    setSelectedShift(shift);
    setShowDetails(true);
  };

  const handleDeleteShift = async (shiftId) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;

    try {
      await api.delete(`/admin/shifts/${shiftId}`);
      toast.success('Shift deleted successfully');
      fetchShifts();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete shift');
    }
  };

  const handleSetDefault = async (shiftId) => {
    try {
      await api.patch(`/admin/shifts/${shiftId}/set-default`);
      toast.success('Default shift updated successfully');
      fetchShifts();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set default shift');
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return format(new Date(`2000-01-01T${timeString}`), 'h:mm a');
  };

  const getShiftDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    if (end < start) {
      end.setDate(end.getDate() + 1); // Next day
    }
    
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shift Management</h1>
          <p className="text-gray-600 mt-1">Manage work shifts and employee assignments</p>
        </div>
        <Button onClick={handleCreateShift} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create New Shift
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Shifts</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalShifts || 0}</p>
                <p className="text-blue-600 text-xs mt-1">All shifts</p>
              </div>
              <div className="bg-blue-600 p-3 rounded-full">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active Shifts</p>
                <p className="text-3xl font-bold text-green-900">{stats.activeShifts || 0}</p>
                <p className="text-green-600 text-xs mt-1">Currently active</p>
              </div>
              <div className="bg-green-600 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Assignments</p>
                <p className="text-3xl font-bold text-purple-900">{stats.totalAssignments || 0}</p>
                <p className="text-purple-600 text-xs mt-1">Employee assignments</p>
              </div>
              <div className="bg-purple-600 p-3 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Default Shift</p>
                <p className="text-lg font-bold text-yellow-900">
                  {stats.defaultShift?.name || 'None Set'}
                </p>
                <p className="text-yellow-600 text-xs mt-1">
                  {stats.defaultShift?.code || 'No default'}
                </p>
              </div>
              <div className="bg-yellow-600 p-3 rounded-full">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5 text-gray-600" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search shifts by name, code, or description..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 h-10"
              />
            </div>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
              className="h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Shifts</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Shifts Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              Shifts ({pagination.total})
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Showing {shifts.length} of {pagination.total} shifts</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Loading shifts...</span>
              </div>
            </div>
          ) : shifts.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts found</h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.isActive 
                  ? "Try adjusting your filters to see more results."
                  : "Get started by creating your first shift."
                }
              </p>
              {!filters.search && !filters.isActive && (
                <Button onClick={handleCreateShift} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Shift
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {shifts.map((shift) => (
                <Card key={shift.id} className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        {/* Shift Header */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {shift.shiftName}
                          </h3>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {shift.shiftCode}
                          </span>
                          <Badge className={shift.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {shift.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {shift.isDefault && (
                            <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Default
                            </Badge>
                          )}
                        </div>
                        
                        {/* Shift Timing */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Start Time</span>
                            <div className="text-sm font-medium text-gray-900">
                              {formatTime(shift.shiftStartTime)}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">End Time</span>
                            <div className="text-sm font-medium text-gray-900">
                              {formatTime(shift.shiftEndTime)}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Duration</span>
                            <div className="text-sm font-medium text-gray-900">
                              {getShiftDuration(shift.shiftStartTime, shift.shiftEndTime)}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Employees</span>
                            <div className="text-sm font-medium text-gray-900">
                              {shift.employeeCount || 0} assigned
                            </div>
                          </div>
                        </div>

                        {/* Shift Rules */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-100">
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Full Day</span>
                            <div className="text-sm font-medium text-gray-900">
                              {shift.fullDayHours}h
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Half Day</span>
                            <div className="text-sm font-medium text-gray-900">
                              {shift.halfDayHours}h
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Grace Period</span>
                            <div className="text-sm font-medium text-gray-900">
                              {shift.gracePeriodMinutes}m
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Overtime</span>
                            <div className="text-sm font-medium text-gray-900">
                              {shift.overtimeEnabled ? 'Enabled' : 'Disabled'}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {shift.description && (
                          <div className="pt-2 border-t border-gray-100">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Description</span>
                            <p className="text-sm text-gray-700 mt-1 line-clamp-2">{shift.description}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-6">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewShift(shift)}
                          className="hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditShift(shift)}
                          className="hover:bg-green-50 hover:border-green-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!shift.isDefault && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSetDefault(shift.id)}
                            className="hover:bg-yellow-50 hover:border-yellow-300"
                            title="Set as default shift"
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteShift(shift.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                          disabled={shift.employeeCount > 0}
                          title={shift.employeeCount > 0 ? 'Cannot delete shift with assigned employees' : 'Delete shift'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="flex items-center gap-2"
              >
                <span>Previous</span>
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="flex items-center gap-2"
              >
                <span>Next</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shift Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedShift ? 'Edit Shift' : 'Create New Shift'}
            </DialogTitle>
          </DialogHeader>
          <ShiftForm
            shift={selectedShift}
            onSuccess={() => {
              setShowForm(false);
              fetchShifts();
              fetchStats();
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Shift Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">Shift Details</DialogTitle>
          </DialogHeader>
          {selectedShift && (
            <ShiftDetails
              shiftId={selectedShift.id}
              onClose={() => setShowDetails(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShiftManagement;