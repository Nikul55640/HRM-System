import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Briefcase, Plus, Edit, Trash2, Users } from 'lucide-react';
import { toast } from 'react-toastify';

const DesignationPage = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    level: '',
    description: '',
  });

  useEffect(() => {
    fetchDesignations();
  }, []);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      setDesignations([
        {
          _id: '1',
          title: 'Software Engineer',
          department: 'Engineering',
          level: 'Mid-Level',
          description: 'Develops and maintains software applications',
          employeeCount: 15,
          createdAt: new Date('2024-01-15'),
        },
        {
          _id: '2',
          title: 'Senior Software Engineer',
          department: 'Engineering',
          level: 'Senior',
          description: 'Leads technical projects and mentors junior engineers',
          employeeCount: 8,
          createdAt: new Date('2024-01-15'),
        },
        {
          _id: '3',
          title: 'HR Manager',
          department: 'Human Resources',
          level: 'Manager',
          description: 'Manages HR operations and employee relations',
          employeeCount: 3,
          createdAt: new Date('2024-01-15'),
        },
        {
          _id: '4',
          title: 'Marketing Specialist',
          department: 'Marketing',
          level: 'Mid-Level',
          description: 'Plans and executes marketing campaigns',
          employeeCount: 6,
          createdAt: new Date('2024-02-01'),
        },
        {
          _id: '5',
          title: 'Product Manager',
          department: 'Product',
          level: 'Manager',
          description: 'Defines product strategy and roadmap',
          employeeCount: 4,
          createdAt: new Date('2024-02-15'),
        },
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
      if (editingDesignation) {
        // Update designation
        toast.success('Designation updated successfully');
      } else {
        // Create new designation
        toast.success('Designation created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchDesignations();
    } catch (error) {
      toast.error('Failed to save designation');
    }
  };

  const handleEdit = (designation) => {
    setEditingDesignation(designation);
    setFormData({
      title: designation.title,
      department: designation.department,
      level: designation.level,
      description: designation.description,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this designation?')) {
      try {
        // API call to delete
        toast.success('Designation deleted successfully');
        fetchDesignations();
      } catch (error) {
        toast.error('Failed to delete designation');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      department: '',
      level: '',
      description: '',
    });
    setEditingDesignation(null);
  };

  const getLevelColor = (level) => {
    const colors = {
      'Entry-Level': 'secondary',
      'Mid-Level': 'default',
      'Senior': 'default',
      'Manager': 'default',
      'Director': 'default',
      'Executive': 'destructive',
    };
    return colors[level] || 'default';
  };

  if (loading) {
    return <div className="p-6 text-center">Loading designations...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Job Designations</h1>
          <p className="text-muted-foreground mt-1">Manage job titles and positions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Designation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDesignation ? 'Edit Designation' : 'Add New Designation'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Job Title *</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-md p-2"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Department *</label>
                <select
                  required
                  className="w-full border rounded-md p-2"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="Product">Product</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Level *</label>
                <select
                  required
                  className="w-full border rounded-md p-2"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                >
                  <option value="">Select Level</option>
                  <option value="Entry-Level">Entry-Level</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Manager">Manager</option>
                  <option value="Director">Director</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea
                  className="w-full border rounded-md p-2"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the role..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDesignation ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Designations</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{designations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {designations.reduce((sum, d) => sum + d.employeeCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(designations.map(d => d.department)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Designations Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {designations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No designations found. Click "Add Designation" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                designations.map((designation) => (
                  <TableRow key={designation._id}>
                    <TableCell className="font-medium">{designation.title}</TableCell>
                    <TableCell>{designation.department}</TableCell>
                    <TableCell>
                      <Badge variant={getLevelColor(designation.level)}>
                        {designation.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {designation.employeeCount}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {designation.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(designation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(designation._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignationPage;