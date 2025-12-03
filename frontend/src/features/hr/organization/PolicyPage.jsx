import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { FileText, Plus, Edit, Trash2, Download, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate } from '../../../utils/essHelpers';

const PolicyPage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    effectiveDate: '',
    version: '1.0',
    status: 'active',
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      setPolicies([
        {
          _id: '1',
          title: 'Leave Policy',
          category: 'Leave Management',
          description: 'Annual leave, sick leave, and other leave types policy',
          effectiveDate: new Date('2024-01-01'),
          version: '2.0',
          status: 'active',
          lastUpdated: new Date('2024-01-01'),
          updatedBy: 'HR Admin',
        },
        {
          _id: '2',
          title: 'Work From Home Policy',
          category: 'Work Arrangement',
          description: 'Guidelines for remote work and hybrid work arrangements',
          effectiveDate: new Date('2024-03-01'),
          version: '1.5',
          status: 'active',
          lastUpdated: new Date('2024-03-01'),
          updatedBy: 'HR Manager',
        },
        {
          _id: '3',
          title: 'Code of Conduct',
          category: 'Ethics & Compliance',
          description: 'Employee behavior and ethical standards',
          effectiveDate: new Date('2024-01-01'),
          version: '3.0',
          status: 'active',
          lastUpdated: new Date('2024-01-01'),
          updatedBy: 'Legal Team',
        },
        {
          _id: '4',
          title: 'Expense Reimbursement Policy',
          category: 'Finance',
          description: 'Guidelines for business expense claims and reimbursements',
          effectiveDate: new Date('2024-02-01'),
          version: '1.0',
          status: 'active',
          lastUpdated: new Date('2024-02-01'),
          updatedBy: 'Finance Team',
        },
        {
          _id: '5',
          title: 'Data Security Policy',
          category: 'IT & Security',
          description: 'Information security and data protection guidelines',
          effectiveDate: new Date('2024-01-15'),
          version: '2.5',
          status: 'active',
          lastUpdated: new Date('2024-01-15'),
          updatedBy: 'IT Security',
        },
        {
          _id: '6',
          title: 'Old Attendance Policy',
          category: 'Attendance',
          description: 'Previous attendance tracking policy (superseded)',
          effectiveDate: new Date('2023-01-01'),
          version: '1.0',
          status: 'archived',
          lastUpdated: new Date('2023-12-31'),
          updatedBy: 'HR Admin',
        },
      ]);
    } catch (error) {
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPolicy) {
        toast.success('Policy updated successfully');
      } else {
        toast.success('Policy created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchPolicies();
    } catch (error) {
      toast.error('Failed to save policy');
    }
  };

  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setFormData({
      title: policy.title,
      category: policy.category,
      description: policy.description,
      effectiveDate: policy.effectiveDate.toISOString().split('T')[0],
      version: policy.version,
      status: policy.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        toast.success('Policy deleted successfully');
        fetchPolicies();
      } catch (error) {
        toast.error('Failed to delete policy');
      }
    }
  };

  const handleArchive = async (id) => {
    try {
      toast.success('Policy archived successfully');
      fetchPolicies();
    } catch (error) {
      toast.error('Failed to archive policy');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      description: '',
      effectiveDate: '',
      version: '1.0',
      status: 'active',
    });
    setEditingPolicy(null);
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'default' : 'secondary';
  };

  const activePolicies = policies.filter(p => p.status === 'active');
  const archivedPolicies = policies.filter(p => p.status === 'archived');

  if (loading) {
    return <div className="p-6 text-center">Loading policies...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Company Policies</h1>
          <p className="text-muted-foreground mt-1">Manage organizational policies and guidelines</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPolicy ? 'Edit Policy' : 'Add New Policy'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Policy Title *</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-md p-2"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Leave Policy"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Category *</label>
                  <select
                    required
                    className="w-full border rounded-md p-2"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    <option value="Leave Management">Leave Management</option>
                    <option value="Attendance">Attendance</option>
                    <option value="Work Arrangement">Work Arrangement</option>
                    <option value="Ethics & Compliance">Ethics & Compliance</option>
                    <option value="Finance">Finance</option>
                    <option value="IT & Security">IT & Security</option>
                    <option value="HR">HR</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Effective Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full border rounded-md p-2"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Version *</label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded-md p-2"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="e.g., 1.0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Status *</label>
                  <select
                    required
                    className="w-full border rounded-md p-2"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description *</label>
                <textarea
                  required
                  className="w-full border rounded-md p-2"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the policy..."
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
                  {editingPolicy ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePolicies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Archived Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archivedPolicies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(policies.map(p => p.category)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Policies */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Active Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activePolicies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active policies found
              </div>
            ) : (
              activePolicies.map((policy) => (
                <Card key={policy._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{policy.title}</h3>
                          <Badge variant={getStatusColor(policy.status)}>
                            v{policy.version}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {policy.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Category: {policy.category}</span>
                          <span>Effective: {formatDate(policy.effectiveDate)}</span>
                          <span>Updated by: {policy.updatedBy}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(policy)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArchive(policy._id)}
                          title="Archive"
                        >
                          <FileText className="h-4 w-4 text-orange-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(policy._id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Archived Policies */}
      {archivedPolicies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Archived Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {archivedPolicies.map((policy) => (
                <div
                  key={policy._id}
                  className="flex justify-between items-center p-3 border rounded-md bg-muted/50"
                >
                  <div>
                    <span className="font-medium">{policy.title}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      v{policy.version}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolicyPage;