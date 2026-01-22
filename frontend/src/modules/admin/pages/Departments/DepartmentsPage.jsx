import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../shared/ui/card";
import { Button } from "../../../../shared/ui/button";
import { Badge } from "../../../../shared/ui/badge";
import { Input } from "../../../../shared/ui/input";
import { Textarea } from "../../../../shared/ui/textarea";
import { Switch } from "../../../../shared/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../../shared/ui/dialog";
import { Icon, LoadingSpinner, DetailModal } from "../../../../shared/components";
import { useToast } from "../../../../core/hooks/use-toast";
import api from "../../../../services/api";
import { Eye } from "lucide-react";

import { formatIndianCurrency } from '../../../../utils/indianFormatters';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingDepartment, setViewingDepartment] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    managerId: "",
    parentDepartmentId: "",
    location: "",
    budget: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/departments?includeInactive=true');
      
      console.log('🔍 [DEPARTMENTS] API Response:', response);
      
      // Handle different response structures
      let departmentsData = [];
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        departmentsData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        departmentsData = response.data;
      }
      
      console.log('✅ [DEPARTMENTS] Extracted departments:', departmentsData.length, 'departments');
      setDepartments(departmentsData);
      
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setDepartments([]);
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        managerId: formData.managerId || null,
        parentDepartmentId: formData.parentDepartmentId || null
      };

      if (editingDepartment) {
        const response = await api.put(`/admin/departments/${editingDepartment.id}`, submitData);
        
        // Update local state
        setDepartments(departments.map(dept => 
          dept.id === editingDepartment.id 
            ? { ...dept, ...response.data.data }
            : dept
        ));
        
        toast({
          title: "Success",
          description: "Department updated successfully",
        });
      } else {
        const response = await api.post('/admin/departments', submitData);
        
        // Add new department to local state
        setDepartments([...departments, response.data.data]);
        
        toast({
          title: "Success",
          description: "Department created successfully",
        });
      }
      
      setShowAddModal(false);
      setEditingDepartment(null);
      resetForm();
    } catch (error) {
      console.error('Error saving department:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save department",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name || "",
      description: department.description || "",
      code: department.code || "",
      managerId: department.managerId || "",
      parentDepartmentId: department.parentDepartmentId || "",
      location: department.location || "",
      budget: department.budget || ""
    });
    setShowAddModal(true);
  };

  const handleDelete = async (departmentId) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    
    try {
      await api.delete(`/admin/departments/${departmentId}`);
      
      // Remove from local state
      setDepartments(departments.filter(dept => dept.id !== departmentId));
      
      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete department",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (departmentId, currentStatus) => {
    try {
      const response = await api.patch(`/admin/departments/${departmentId}/toggle-status`);
      
      // Update local state
      setDepartments(departments.map(dept => 
        dept.id === departmentId 
          ? { ...dept, isActive: response.data.data.isActive }
          : dept
      ));
      
      toast({
        title: "Success",
        description: `Department ${response.data.data.isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling department status:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update department status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      code: "",
      managerId: "",
      parentDepartmentId: "",
      location: "",
      budget: ""
    });
    setEditingDepartment(null);
  };

  const handleViewDepartment = (department) => {
    setViewingDepartment(department);
    setShowViewModal(true);
  };

  // Filter departments for hierarchy display
  const activeDepartments = departments.filter(dept => dept.isActive);
  const parentDepartments = activeDepartments.filter(dept => !dept.parentDepartmentId);
  const childDepartments = activeDepartments.filter(dept => dept.parentDepartmentId);

  // Calculate totals
  const totalEmployees = departments.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0);
  const activeDepartmentCount = activeDepartments.length;
  const inactiveDepartmentCount = departments.filter(dept => !dept.isActive).length;

  if (loading) {
    return <LoadingSpinner message="Loading departments..." />;
  }

  return (
    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Department Management</h1>
          <p className="text-sm text-gray-600">Manage organizational departments and structure</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="w-full sm:w-auto">
              <Icon name="Plus" className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                {editingDepartment ? "Edit Department" : "Add New Department"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 ">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Department Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter department name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Department Code</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., IT, HR, FIN"
                    maxLength={10}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter department description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Parent Department</label>
                  <select
                    value={formData.parentDepartmentId}
                    onChange={(e) => setFormData({ ...formData, parentDepartmentId: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">None (Top Level)</option>
                    {parentDepartments
                      .filter(dept => dept.id !== editingDepartment?.id)
                      .map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Department location"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Budget</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="Department budget"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-3">
                <Button type="submit" className="flex-1 order-2 sm:order-1">
                  {editingDepartment ? "Update" : "Create"} Department
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 order-1 sm:order-2"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Icon name="Building2" className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Active Departments</p>
                <p className="text-lg font-bold">{activeDepartmentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <Icon name="Users" className="w-4 h-4 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Total Employees</p>
                <p className="text-lg font-bold">{totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Icon name="TreePine" className="w-4 h-4 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Parent Departments</p>
                <p className="text-lg font-bold">{parentDepartments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-100 rounded-lg">
                <Icon name="XCircle" className="w-4 h-4 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 truncate">Inactive Departments</p>
                <p className="text-lg font-bold">{inactiveDepartmentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Hierarchy */}
      <div className="space-y-3 sm:space-y-4">
        {/* Active Parent Departments */}
        {parentDepartments.map((parentDept) => (
          <Card key={parentDept.id}>
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <Icon name="Building2" className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="truncate">{parentDept.name}</span>
                      {parentDept.code && (
                        <Badge variant="outline" className="text-xs w-fit">
                          {parentDept.code}
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{parentDept.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-2">
                  <Badge variant="outline" className="text-xs">
                    {parentDept.employeeCount || 0} employees
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={parentDept.isActive}
                      onCheckedChange={() => handleToggleStatus(parentDept.id, parentDept.isActive)}
                    />
                    <span className="text-xs text-gray-500 hidden sm:inline">
                      {parentDept.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDepartment(parentDept)}
                      className="h-8 w-8 p-0"
                      title="View Details"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(parentDept)}
                      className="h-8 w-8 p-0"
                    >
                      <Icon name="Edit" className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(parentDept.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Icon name="Trash2" className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Location</label>
                  <p className="font-medium text-sm sm:text-base truncate">{parentDept.location || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Budget</label>
                  <p className="font-medium text-sm sm:text-base truncate">
                    {parentDept.budget ? formatIndianCurrency(parseFloat(parentDept.budget)) : "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Created</label>
                  <p className="font-medium text-sm sm:text-base">
                    {new Date(parentDept.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Status</label>
                  <Badge variant={parentDept.isActive ? "success" : "secondary"} className="text-xs">
                    {parentDept.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Sub Departments */}
              {childDepartments.filter(child => child.parentDepartmentId === parentDept.id).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 text-sm sm:text-base">Sub Departments</h4>
                  <div className="space-y-2">
                    {childDepartments
                      .filter(child => child.parentDepartmentId === parentDept.id)
                      .map((childDept) => (
                        <div
                          key={childDept.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 rounded-lg ml-0 sm:ml-6"
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <Icon name="GitBranch" className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <h5 className="font-medium flex flex-col sm:flex-row sm:items-center gap-2 text-sm sm:text-base">
                                <span className="truncate">{childDept.name}</span>
                                {childDept.code && (
                                  <Badge variant="outline" className="text-xs w-fit">
                                    {childDept.code}
                                  </Badge>
                                )}
                              </h5>
                              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{childDept.description}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-2">
                            <Badge variant="outline" size="sm" className="text-xs">
                              {childDept.employeeCount || 0} employees
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Switch
                                checked={childDept.isActive}
                                onCheckedChange={() => handleToggleStatus(childDept.id, childDept.isActive)}
                                size="sm"
                              />
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDepartment(childDept)}
                                className="h-7 w-7 p-0"
                                title="View Details"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(childDept)}
                                className="h-7 w-7 p-0"
                              >
                                <Icon name="Edit" className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(childDept.id)}
                                className="h-7 w-7 p-0"
                              >
                                <Icon name="Trash2" className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Inactive Departments */}
        {inactiveDepartmentCount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-gray-600">Inactive Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {departments
                  .filter(dept => !dept.isActive)
                  .map((dept) => (
                    <div
                      key={dept.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <Icon name="Building2" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-medium text-gray-600 flex flex-col sm:flex-row sm:items-center gap-2 text-sm sm:text-base">
                            <span className="truncate">{dept.name}</span>
                            {dept.code && (
                              <Badge variant="outline" className="text-xs w-fit">
                                {dept.code}
                              </Badge>
                            )}
                          </h5>
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{dept.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {dept.employeeCount || 0} employees
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={dept.isActive}
                            onCheckedChange={() => handleToggleStatus(dept.id, dept.isActive)}
                          />
                          <span className="text-xs text-gray-500">Inactive</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDepartment(dept)}
                            className="h-8 w-8 p-0"
                            title="View Details"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(dept)}
                            className="h-8 w-8 p-0"
                          >
                            <Icon name="Edit" className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(dept.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Icon name="Trash2" className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {departments.length === 0 && (
          <Card>
            <CardContent className="text-center py-6 sm:py-8">
              <Icon name="Building2" className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">No departments found</p>
              <p className="text-xs sm:text-sm text-gray-400">Create your first department to get started</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Details Modal */}
      {showViewModal && viewingDepartment && (
        <DetailModal
          open={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setViewingDepartment(null);
          }}
          title="Department Details"
          data={viewingDepartment}
          sections={[
            {
              label: 'Basic Information',
              fields: [
                { key: 'name', label: 'Department Name', icon: 'department' },
                { key: 'code', label: 'Department Code', icon: 'description' },
                { key: 'isActive', label: 'Status', type: 'status' },
                { key: 'employeeCount', label: 'Employee Count', icon: 'user', type: 'number' }
              ]
            },
            {
              label: 'Details',
              fields: [
                { key: 'description', label: 'Description', type: 'longtext', fullWidth: true },
                { key: 'location', label: 'Location', icon: 'location' },
                { key: 'budget', label: 'Budget', type: 'currency' },
                { key: 'createdAt', label: 'Created Date', type: 'date', icon: 'date' },
                { key: 'updatedAt', label: 'Last Updated', type: 'date', icon: 'date' }
              ]
            },
            {
              label: 'Hierarchy & Management',
              fields: [
                { key: 'parentDepartment.name', label: 'Parent Department', icon: 'department' },
                { key: 'manager.name', label: 'Department Manager', icon: 'user' },
                { key: 'manager.email', label: 'Manager Email', type: 'email', icon: 'user' },
                { key: 'managerId', label: 'Manager ID', icon: 'user' }
              ]
            },
            ...(viewingDepartment.childDepartments && viewingDepartment.childDepartments.length > 0 ? [{
              label: 'Child Departments',
              fields: [
                { key: 'childDepartments', label: 'Sub-departments', type: 'list', fullWidth: true }
              ]
            }] : [])
          ]}
          actions={[
            {
              label: 'Edit',
              icon: Icon,
              onClick: () => {
                handleEdit(viewingDepartment);
                setShowViewModal(false);
              },
              variant: 'default'
            },
            {
              label: 'Close',
              onClick: () => {
                setShowViewModal(false);
                setViewingDepartment(null);
              },
              variant: 'outline'
            }
          ]}
        />
      )}
    </div>
  );
};

export default DepartmentsPage;