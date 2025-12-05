import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Briefcase, Plus, Edit, Trash2, Users } from 'lucide-react';
import { toast } from 'react-toastify';

const DesignationPage = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: '',
  });

  useEffect(() => {
    fetchDesignations();
  }, []);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      // Mock data
      setDesignations([
        { _id: '1', title: 'Software Engineer', description: 'Develops software applications', level: 'Junior', employeeCount: 15 },
        { _id: '2', title: 'Senior Software Engineer', description: 'Leads development projects', level: 'Senior', employeeCount: 8 },
        { _id: '3', title: 'HR Manager', description: 'Manages HR operations', level: 'Manager', employeeCount: 3 },
      ]);
    } catch (error) {
      toast.error('Failed to load designations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      toast.success(editingDesignation ? 'Designation updated' : 'Designation created');
      setShowModal(false);
      setFormData({ title: '', description: '', level: '' });
      setEditingDesignation(null);
      fetchDesignations();
    } catch (error) {
      toast.error('Failed to save designation');
    }
  };

  const handleEdit = (designation) => {
    setEditingDesignation(designation);
    setFormData({ title: designation.title, description: designation.description, level: designation.level });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this designation?')) {
      try {
        toast.success('Designation deleted');
        fetchDesignations();
      } catch (error) {
        toast.error('Failed to delete designation');
      }
    }
  };

  if (loading) {
    return <div className="p-6"><p className="text-gray-500">Loading designations...</p></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Designations</h1>
          <p className="text-gray-500 text-sm mt-1">Manage job titles and positions</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Designation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {designations.map((designation) => (
          <Card key={designation._id} className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(designation)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(designation._id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{designation.title}</h3>
              {designation.description && <p className="text-sm text-gray-600 mb-4">{designation.description}</p>}
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded border text-blue-600 bg-blue-50 border-blue-200">
                  {designation.level}
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{designation.employeeCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {editingDesignation ? 'Edit Designation' : 'Add Designation'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select level</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                    <option value="Manager">Manager</option>
                    <option value="Director">Director</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => { setShowModal(false); setFormData({ title: '', description: '', level: '' }); setEditingDesignation(null); }} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">{editingDesignation ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DesignationPage;
