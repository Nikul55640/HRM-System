import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../shared/ui/card";
import { Button } from "../../../../shared/ui/button";
import { Badge } from "../../../../shared/ui/badge";
import { Input } from "../../../../shared/ui/input";
import { Textarea } from "../../../../shared/ui/textarea";
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
    manager: "",
    parentDepartment: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/departments');
      
      // Debug: Log the actual response structure
      console.log('🔍 [DEPARTMENTS] API Response:', response);
      
      // Handle different response structures
      let departmentsData = [];
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        // Structure: { success: true, data: [...] }
        departmentsData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        // Structure: [...]
        departmentsData = response.data;
      } else if (response?.departments && Array.isArray(response.departments)) {
        // Structure: { success: true, departments: [...] }
        departmentsData = response.departments;
      }
      
      // Ensure each department has a valid employeeCount
      departmentsData = departmentsData.map(dept => ({
        ...dept,
        employeeCount: dept.employeeCount || 0
      }));
      
      console.log('✅ [DEPARTMENTS] Extracted departments:', departmentsData.length, 'departments');
      setDepartments(departmentsData);
      
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setDepartments([]); // Ensure empty array on error
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
      if (editingDepartment) {
        // TODO: Replace with actual API call
        // await api.put(`/admin/departments/${editingDepartment.id}`, formData);
        
        setDepartments(departments.map(dept => 
          dept.id === editingDepartment.id 
            ? { ...dept, ...formData }
            : dept
        ));
        
        toast({
          title: "Success",
          description: "Department updated successfully",
        });
      } else {
        // TODO: Replace with actual API call
        // const response = await api.post('/admin/departments', formData);
        
        const newDepartment = {
          id: Date.now(),
          ...formData,
          employeeCount: 0,
          isActive: true,
          createdAt: new Date().toISOString().split('T')[0]
        };
        
        setDepartments([...departments, newDepartment]);
        
        toast({
          title: "Success",
          description: "Department created successfully",
        });
      }
      
      setShowAddModal(false);
      setEditingDepartment(null);
      setFormData({ name: "", description: "", manager: "", parentDepartment: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save department",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description,
      manager: department.manager,
      parentDepartment: department.parentDepartment || ""
    });
    setShowAddModal(true);
  };

  const handleDelete = async (departmentId) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    
    try {
      // TODO: Replace with actual API call
      // await api.delete(`/admin/departments/${departmentId}`);
      
      setDepartments(departments.filter(dept => dept.id !== departmentId));
      
      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", manager: "", parentDepartment: "" });
    setEditingDepartment(null);
  };

  const parentDepartments = departments.filter(dept => !dept.parentDepartment);
  const childDepartments = departments.filter(dept => dept.parentDepartment);

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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDepartment ? "Edit Department" : "Add New Department"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter department name"
                  required
                />
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
              
              <div>
                <label className="block text-sm font-medium mb-1">Manager</label>
                <Input
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  placeholder="Enter manager name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Parent Department</label>
                <select
                  value={formData.parentDepartment}
                  onChange={(e) => setFormData({ ...formData, parentDepartment: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">None (Top Level)</option>
                  {parentDepartments.map(dept => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
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
                <p className="text-sm text-gray-600">Total Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
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
                <p className="text-2xl font-bold">
                  {departments.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0)}
                </p>
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
              <div className="p-2 bg-orange-100 rounded-lg">
                <Icon name="GitBranch" className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sub Departments</p>
                <p className="text-2xl font-bold">{childDepartments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Hierarchy */}
      <div className="space-y-4">
        {/* Parent Departments */}
        {parentDepartments.map((parentDept) => (
          <Card key={parentDept.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon name="Building2" className="w-6 h-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{parentDept.name}</CardTitle>
                    <p className="text-sm text-gray-600">{parentDept.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {parentDept.employeeCount || 0} employees
                  </Badge>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Manager</label>
                  <p className="font-medium">{parentDept.manager || "Not assigned"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="font-medium">{parentDept.createdAt}</p>
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
                              <h5 className="font-medium">{childDept.name}</h5>
                              <p className="text-sm text-gray-600">{childDept.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" size="sm">
                              {childDept.employeeCount || 0} employees
                            </Badge>
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

        {/* Standalone Child Departments (if any) */}
        {childDepartments.filter(child => !parentDepartments.find(parent => parent.id === child.parentDepartmentId)).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Other Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {childDepartments
                  .filter(child => !parentDepartments.find(parent => parent.id === child.parentDepartmentId))
                  .map((dept) => (
                    <div
                      key={dept.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Icon name="Building2" className="w-5 h-5 text-gray-500" />
                        <div>
                          <h5 className="font-medium">{dept.name}</h5>
                          <p className="text-sm text-gray-600">{dept.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {dept.employeeCount || 0} employees
                        </Badge>
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