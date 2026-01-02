import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../shared/ui/card";
import { Button } from "../../../../shared/ui/button";
import { Badge } from "../../../../shared/ui/badge";
import { Input } from "../../../../shared/ui/input";
import { Textarea } from "../../../../shared/ui/textarea";
import { Switch } from "../../../../shared/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../../shared/ui/dialog";
import { Icon, LoadingSpinner } from "../../../../shared/components";
import { useToast } from "../../../../core/hooks/use-toast";
import api from "../../../../services/api";

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-600">Manage organizational departments and structure</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Icon name="Plus" className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingDepartment ? "Edit Department" : "Add New Department"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Parent Department</label>
                  <select
                    value={formData.parentDepartmentId}
                    onChange={(e) => setFormData({ ...formData, parentDepartmentId: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
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
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingDepartment ? "Update" : "Create"} Department
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon name="Building2" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Departments</p>
                <p className="text-2xl font-bold">{activeDepartmentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon name="Users" className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold">{totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icon name="TreePine" className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Parent Departments</p>
                <p className="text-2xl font-bold">{parentDepartments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Icon name="XCircle" className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Inactive Departments</p>
                <p className="text-2xl font-bold">{inactiveDepartmentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Hierarchy */}
      <div className="space-y-4">
        {/* Active Parent Departments */}
        {parentDepartments.map((parentDept) => (
          <Card key={parentDept.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon name="Building2" className="w-6 h-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {parentDept.name}
                      {parentDept.code && (
                        <Badge variant="outline" className="text-xs">
                          {parentDept.code}
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{parentDept.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {parentDept.employeeCount || 0} employees
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={parentDept.isActive}
                      onCheckedChange={() => handleToggleStatus(parentDept.id, parentDept.isActive)}
                    />
                    <span className="text-xs text-gray-500">
                      {parentDept.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(parentDept)}
                  >
                    <Icon name="Edit" className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(parentDept.id)}
                  >
                    <Icon name="Trash2" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="font-medium">{parentDept.location || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Budget</label>
                  <p className="font-medium">
                    {parentDept.budget ? `$${parseFloat(parentDept.budget).toLocaleString()}` : "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="font-medium">
                    {new Date(parentDept.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge variant={parentDept.isActive ? "success" : "secondary"}>
                    {parentDept.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Sub Departments */}
              {childDepartments.filter(child => child.parentDepartmentId === parentDept.id).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Sub Departments</h4>
                  <div className="space-y-2">
                    {childDepartments
                      .filter(child => child.parentDepartmentId === parentDept.id)
                      .map((childDept) => (
                        <div
                          key={childDept.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg ml-6"
                        >
                          <div className="flex items-center gap-3">
                            <Icon name="GitBranch" className="w-4 h-4 text-gray-500" />
                            <div>
                              <h5 className="font-medium flex items-center gap-2">
                                {childDept.name}
                                {childDept.code && (
                                  <Badge variant="outline" className="text-xs">
                                    {childDept.code}
                                  </Badge>
                                )}
                              </h5>
                              <p className="text-sm text-gray-600">{childDept.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" size="sm">
                              {childDept.employeeCount || 0} employees
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Switch
                                checked={childDept.isActive}
                                onCheckedChange={() => handleToggleStatus(childDept.id, childDept.isActive)}
                                size="sm"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(childDept)}
                            >
                              <Icon name="Edit" className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(childDept.id)}
                            >
                              <Icon name="Trash2" className="w-3 h-3" />
                            </Button>
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
              <CardTitle className="text-lg text-gray-600">Inactive Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {departments
                  .filter(dept => !dept.isActive)
                  .map((dept) => (
                    <div
                      key={dept.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Icon name="Building2" className="w-5 h-5 text-gray-400" />
                        <div>
                          <h5 className="font-medium text-gray-600 flex items-center gap-2">
                            {dept.name}
                            {dept.code && (
                              <Badge variant="outline" className="text-xs">
                                {dept.code}
                              </Badge>
                            )}
                          </h5>
                          <p className="text-sm text-gray-500">{dept.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {dept.employeeCount || 0} employees
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={dept.isActive}
                            onCheckedChange={() => handleToggleStatus(dept.id, dept.isActive)}
                          />
                          <span className="text-xs text-gray-500">Inactive</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(dept)}
                        >
                          <Icon name="Edit" className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(dept.id)}
                        >
                          <Icon name="Trash2" className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {departments.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Icon name="Building2" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No departments found</p>
              <p className="text-sm text-gray-400">Create your first department to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DepartmentsPage;