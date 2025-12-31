import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Input } from '../../../../shared/ui/input';
import { Label } from '../../../../shared/ui/label';
import { Textarea } from '../../../../shared/ui/textarea';
import { Badge } from '../../../../shared/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../shared/ui/dialog';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Briefcase,
  Users,
  Building2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import employeeManagementService from '../../../../services/employeeManagementService';

const DesignationsPage = () => {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    level: 'junior',
    isActive: true
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    byDepartment: {}
  });

  const fetchDesignations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await employeeManagementService.getDesignations();
      
      if (result.success) {
        setDesignations(result.data);
        
        // Calculate stats
        const total = result.data.length;
        const active = result.data.filter(d => d.isActive).length;
        const byDepartment = result.data.reduce((acc, d) => {
          const deptName = d.department?.name || 'Unknown';
          acc[deptName] = (acc[deptName] || 0) + 1;
          return acc;
        }, {});
        
        setStats({ total, active, byDepartment });
      }
    } catch (error) {
      toast.error('Failed to fetch designations');
      console.error('Error fetching designations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFormData = useCallback(async () => {
    try {
      const result = await employeeManagementService.getFormData();
      if (result.success) {
        setDepartments(result.data.departments || []);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  }, []);

  const levels = [
    { value: 'intern', label: 'Intern' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid-Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' },
    { value: 'manager', label: 'Manager' },
    { value: 'director', label: 'Director' },
    { value: 'executive', label: 'Executive' }
  ];

  useEffect(() => {
    fetchDesignations();
    loadFormData();
  }, [fetchDesignations, loadFormData]);

  const handleCreateDesignation = () => {
    setSelectedDesignation(null);
    setFormData({
      title: '',
      description: '',
      department: '',
      level: 'junior',
      isActive: true
    });
    setShowForm(true);
  };

  const handleEditDesignation = (designation) => {
    setSelectedDesignation(designation);
    setFormData({
      title: designation.title,
      description: designation.description,
      department: designation.department?.id || designation.departmentId || '',
      level: designation.level,
      isActive: designation.isActive
    });
    setShowForm(true);
  };

  const handleSaveDesignation = async () => {
    try {
      if (!formData.title.trim()) {
        toast.error('Designation title is required');
        return;
      }

      if (!formData.department) {
        toast.error('Department is required');
        return;
      }

      const designationData = {
        title: formData.title,
        description: formData.description,
        level: formData.level,
        departmentId: parseInt(formData.department, 10),
        isActive: formData.isActive
      };

      if (selectedDesignation) {
        await employeeManagementService.updateDesignation(selectedDesignation.id, designationData);
      } else {
        await employeeManagementService.createDesignation(designationData);
      }

      setShowForm(false);
      fetchDesignations();
    } catch (error) {
      console.error('Error saving designation:', error);
    }
  };

  const handleDeleteDesignation = async (designationId) => {
    if (!confirm('Are you sure you want to delete this designation? This action cannot be undone.')) {
      return;
    }

    try {
      await employeeManagementService.deleteDesignation(designationId);
      fetchDesignations();
    } catch (error) {
      console.error('Error deleting designation:', error);
    }
  };

  const handleToggleStatus = async (designation) => {
    try {
      const updatedData = { 
        ...designation, 
        isActive: !designation.isActive,
        departmentId: designation.department?.id || designation.departmentId
      };
      await employeeManagementService.updateDesignation(designation.id, updatedData);
      fetchDesignations();
    } catch (error) {
      console.error('Error updating designation status:', error);
    }
  };

  const filteredDesignations = designations.filter(designation =>
    designation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (designation.department?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (designation.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelBadge = (level) => {
    const levelConfig = {
      intern: 'bg-gray-100 text-gray-800',
      junior: 'bg-blue-100 text-blue-800',
      mid: 'bg-green-100 text-green-800',
      senior: 'bg-purple-100 text-purple-800',
      lead: 'bg-orange-100 text-orange-800',
      manager: 'bg-red-100 text-red-800',
      director: 'bg-indigo-100 text-indigo-800',
      executive: 'bg-pink-100 text-pink-800'
    };

    const levelLabel = levels.find(l => l.value === level)?.label || level;
    
    return (
      <Badge className={levelConfig[level] || 'bg-gray-100 text-gray-800'}>
        {levelLabel}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Designation Management</h1>
        <Button onClick={handleCreateDesignation}>
          <Plus className="w-4 h-4 mr-2" />
          Add Designation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Designations</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Designations</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Departments</p>
                <p className="text-2xl font-bold">{Object.keys(stats.byDepartment).length}</p>
              </div>
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search designations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Designations List */}
      <Card>
        <CardHeader>
          <CardTitle>Designations ({filteredDesignations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredDesignations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No designations found matching your search' : 'No designations found'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDesignations.map((designation) => (
                <div key={designation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lg">{designation.title}</span>
                        {getLevelBadge(designation.level)}
                        <Badge 
                          className={designation.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }
                        >
                          {designation.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span>{designation.department?.name || 'Unknown Department'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{designation.employeeCount} employees</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span>{levels.find(l => l.value === designation.level)?.label}</span>
                        </div>
                      </div>

                      {designation.description && (
                        <div className="text-sm">
                          <span className="text-gray-500">Description:</span>
                          <div className="text-gray-700 mt-1">{designation.description}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleStatus(designation)}
                        className={designation.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {designation.isActive ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <Users className="w-4 h-4" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditDesignation(designation)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteDesignation(designation.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={designation.employeeCount > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDesignation ? 'Edit Designation' : 'Create New Designation'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Software Engineer"
              />
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <select
                id="department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="level">Level</Label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {levels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the role and responsibilities"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDesignation}>
              {selectedDesignation ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DesignationsPage;