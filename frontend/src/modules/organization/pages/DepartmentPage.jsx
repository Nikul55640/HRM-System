import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Building2, Plus, Edit, Trash2, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import useOrganizationStore from '../../../stores/useOrganizationStore';

const DepartmentPage = () => {
  const {
    departments,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
  } = useOrganizationStore();

  // Ensure departments is always an array
  const safeDepartments = Array.isArray(departments) ? departments : [];

  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headOfDepartment: '',
  });

  useEffect(() => {
    fetchDepartments().catch(error => {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to load departments');
    });
  }, [fetchDepartments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Department name is required');
      return;
    }

    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment._id, formData);
        toast.success('Department updated successfully');
      } else {
        await createDepartment(formData);
        toast.success('Department created successfully');
      }
      
      setShowModal(false);
      setEditingDepartment(null);
      setFormData({ name: '', description: '', headOfDepartment: '' });
    } catch (error) {
      toast.error(editingDepartment ? 'Failed to update department' : 'Failed to create department');
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      headOfDepartment: department.headOfDepartment || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (departmentId) => {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }

    try {
      await deleteDepartment(departmentId);
      toast.success('Department deleted successfully');
    } catch (error) {
      toast.error('Failed to delete department');
    }
  };

  if (loading?.departments) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading departments...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Departments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage company departments and structure</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Error Display */}
      {error?.departments && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading departments: {error.departments}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchDepartments()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {safeDepartments.length === 0 && !loading?.departments && !error?.departments ? (
          <div className="col-span-full text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No departments found</p>
            <p className="text-gray-400 text-sm mb-4">Get started by creating your first department</p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </div>
        ) : (
          safeDepartments.map((department) => (
          <Card key={department._id} className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(department)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(department._id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{department.name}</h3>
              
              {department.description && (
                <p className="text-sm text-gray-600 mb-4">{department.description}</p>
              )}
              
              {department.headOfDepartment && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500">Head of Department</p>
                  <p className="text-sm font-medium text-gray-800">{department.headOfDepartment}</p>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{department.employeeCount || 0} employees</span>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {editingDepartment ? 'Edit Department' : 'Add New Department'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department description"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Head of Department
                  </label>
                  <input
                    type="text"
                    value={formData.headOfDepartment}
                    onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter head of department name"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setEditingDepartment(null);
                      setFormData({ name: '', description: '', headOfDepartment: '' });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingDepartment ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DepartmentPage;
