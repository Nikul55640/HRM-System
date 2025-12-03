import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { payrollService } from '../../services';
import { toast } from 'react-toastify';

const PayrollStructures = () => {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    basic: 0,
    hra: 0,
    allowances: 0,
  });

  useEffect(() => {
    fetchStructures();
  }, []);

  const fetchStructures = async () => {
    try {
      setLoading(true);
      const response = await payrollService.getSalaryStructures();
      
      if (response.success) {
        setStructures(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch structures:', error);
      toast.error('Failed to load salary structures');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStructure) {
        await payrollService.updateSalaryStructure(editingStructure._id, formData);
        toast.success('Structure updated');
      } else {
        await payrollService.createSalaryStructure(formData);
        toast.success('Structure created');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchStructures();
    } catch (error) {
      toast.error('Failed to save structure');
    }
  };

  const handleEdit = (structure) => {
    setEditingStructure(structure);
    setFormData({
      name: structure.name,
      basic: structure.basic,
      hra: structure.hra,
      allowances: structure.allowances,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this structure?')) {
      try {
        await payrollService.deleteSalaryStructure(id);
        toast.success('Structure deleted');
        fetchStructures();
      } catch (error) {
        toast.error('Failed to delete structure');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', basic: 0, hra: 0, allowances: 0 });
    setEditingStructure(null);
  };

  const calculateTotal = (structure) => {
    return (structure.basic || 0) + (structure.hra || 0) + (structure.allowances || 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Salary Structures</h1>
          <p className="text-muted-foreground mt-1">Manage salary templates</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Structure
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStructure ? 'Edit Structure' : 'Add Structure'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Structure Name *</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-md p-2 mt-1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Basic Salary *</label>
                <input
                  type="number"
                  required
                  className="w-full border rounded-md p-2 mt-1"
                  value={formData.basic}
                  onChange={(e) => setFormData({ ...formData, basic: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">HRA *</label>
                <input
                  type="number"
                  required
                  className="w-full border rounded-md p-2 mt-1"
                  value={formData.hra}
                  onChange={(e) => setFormData({ ...formData, hra: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Allowances *</label>
                <input
                  type="number"
                  required
                  className="w-full border rounded-md p-2 mt-1"
                  value={formData.allowances}
                  onChange={(e) => setFormData({ ...formData, allowances: Number(e.target.value) })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingStructure ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {structures.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              No salary structures found. Click "Add Structure" to create one.
            </CardContent>
          </Card>
        ) : (
          structures.map(structure => (
            <Card key={structure._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{structure.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Basic:</span>
                    <span className="font-medium">₹{structure.basic?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">HRA:</span>
                    <span className="font-medium">₹{structure.hra?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Allowances:</span>
                    <span className="font-medium">₹{structure.allowances?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>₹{calculateTotal(structure).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(structure)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(structure._id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PayrollStructures;
