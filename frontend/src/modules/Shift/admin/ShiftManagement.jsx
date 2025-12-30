import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Badge } from '../../../shared/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  Users,
  Star,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import ShiftForm from './ShiftForm';
import ShiftDetails from './ShiftDetails';
import AssignShiftForm from './AssignShiftForm';

const ShiftManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/shifts');
      
      // Debug: Log the actual response structure
      console.log('🔍 [SHIFT MANAGEMENT] API Response:', response);
      
      // Handle different response structures
      let shiftsData = [];
      
      if (response?.data?.data) {
        // Structure: { success: true, data: { data: [...] } }
        shiftsData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        // Structure: { success: true, data: [...] }
        shiftsData = response.data;
      } else if (response?.shifts) {
        // Structure: { success: true, shifts: [...] }
        shiftsData = response.shifts;
      } else if (Array.isArray(response)) {
        // Structure: [...]
        shiftsData = response;
      }
      
      console.log('✅ [SHIFT MANAGEMENT] Extracted shifts:', shiftsData.length, 'shifts');
      setShifts(shiftsData);
      
    } catch (error) {
      console.error('Failed to fetch shifts:', error);
      setShifts([]); // Ensure empty array on error
      toast.error("Failed to fetch shifts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
    fetchStats();
  }, [fetchShifts]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/shifts/stats');
      setStats(response.data.data || {});
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

  const getFilteredShifts = () => {
    return shifts.filter(shift => {
      const matchesSearch = shift.shiftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           shift.shiftCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || 
                           (filterStatus === 'active' && shift.isActive) ||
                           (filterStatus === 'inactive' && !shift.isActive);
      return matchesSearch && matchesFilter;
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shift Management</h1>
          <p className="text-gray-600 mt-1">Create and manage work shifts</p>
        </div>
        <Button onClick={handleCreateShift} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create New Shift
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Shifts</p>
                <p className="text-2xl font-bold">{stats.totalShifts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Shifts</p>
                <p className="text-2xl font-bold">{stats.activeShifts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold">{stats.totalAssignments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Default Shift</p>
                <p className="text-sm font-bold">{stats.defaultShift?.name || 'None'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search by shift name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Shifts</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Shifts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Shifts ({getFilteredShifts().length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Loading shifts...</span>
              </div>
            </div>
          ) : getFilteredShifts().length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first shift.</p>
              <Button onClick={handleCreateShift} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create First Shift
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {getFilteredShifts().map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{shift.shiftName}</h3>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                        {shift.shiftCode}
                      </span>
                      <Badge className={shift.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {shift.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {shift.isDefault && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {shift.shiftStartTime} - {shift.shiftEndTime}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewShift(shift)}
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedShift(shift);
                        setShowAssignForm(true);
                      }}
                      title="Assign employees"
                      className="bg-purple-50 hover:bg-purple-100 text-purple-600"
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditShift(shift)}
                      title="Edit shift"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {!shift.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefault(shift.id)}
                        title="Set as default"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteShift(shift.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete shift"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

      {/* Assign Shift Dialog */}
      <Dialog open={showAssignForm} onOpenChange={setShowAssignForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Assign Employees to Shift</DialogTitle>
          </DialogHeader>
          {selectedShift && (
            <AssignShiftForm
              shift={selectedShift}
              onSuccess={() => {
                setShowAssignForm(false);
                fetchShifts();
              }}
              onCancel={() => setShowAssignForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShiftManagement;
