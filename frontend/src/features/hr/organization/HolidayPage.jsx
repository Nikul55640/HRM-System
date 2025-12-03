import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Calendar, Plus, Edit, Trash2, Sun } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate } from '../../../utils/essHelpers';

const HolidayPage = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'public',
    description: '',
    isOptional: false,
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      setHolidays([
        {
          _id: '1',
          name: 'New Year\'s Day',
          date: new Date('2025-01-01'),
          type: 'public',
          description: 'First day of the year',
          isOptional: false,
        },
        {
          _id: '2',
          name: 'Republic Day',
          date: new Date('2025-01-26'),
          type: 'public',
          description: 'National holiday',
          isOptional: false,
        },
        {
          _id: '3',
          name: 'Holi',
          date: new Date('2025-03-14'),
          type: 'festival',
          description: 'Festival of colors',
          isOptional: false,
        },
        {
          _id: '4',
          name: 'Good Friday',
          date: new Date('2025-04-18'),
          type: 'religious',
          description: 'Christian holiday',
          isOptional: true,
        },
        {
          _id: '5',
          name: 'Independence Day',
          date: new Date('2025-08-15'),
          type: 'public',
          description: 'National holiday',
          isOptional: false,
        },
        {
          _id: '6',
          name: 'Gandhi Jayanti',
          date: new Date('2025-10-02'),
          type: 'public',
          description: 'Birth anniversary of Mahatma Gandhi',
          isOptional: false,
        },
        {
          _id: '7',
          name: 'Diwali',
          date: new Date('2025-10-20'),
          type: 'festival',
          description: 'Festival of lights',
          isOptional: false,
        },
        {
          _id: '8',
          name: 'Christmas',
          date: new Date('2025-12-25'),
          type: 'religious',
          description: 'Christian holiday',
          isOptional: false,
        },
      ]);
    } catch (error) {
      toast.error('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHoliday) {
        toast.success('Holiday updated successfully');
      } else {
        toast.success('Holiday created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchHolidays();
    } catch (error) {
      toast.error('Failed to save holiday');
    }
  };

  const handleEdit = (holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: holiday.date.toISOString().split('T')[0],
      type: holiday.type,
      description: holiday.description,
      isOptional: holiday.isOptional,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        toast.success('Holiday deleted successfully');
        fetchHolidays();
      } catch (error) {
        toast.error('Failed to delete holiday');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      type: 'public',
      description: '',
      isOptional: false,
    });
    setEditingHoliday(null);
  };

  const getTypeColor = (type) => {
    const colors = {
      public: 'default',
      festival: 'default',
      religious: 'secondary',
      company: 'default',
    };
    return colors[type] || 'default';
  };

  const getTypeIcon = (type) => {
    if (type === 'public') return '🏛️';
    if (type === 'festival') return '🎉';
    if (type === 'religious') return '🙏';
    return '🏢';
  };

  // Group holidays by month
  const groupedHolidays = holidays.reduce((acc, holiday) => {
    const month = holiday.date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(holiday);
    return acc;
  }, {});

  if (loading) {
    return <div className="p-6 text-center">Loading holidays...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Company Holidays</h1>
          <p className="text-muted-foreground mt-1">Manage public holidays and company events</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Holiday
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Holiday Name *</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-md p-2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., New Year's Day"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full border rounded-md p-2"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Type *</label>
                  <select
                    required
                    className="w-full border rounded-md p-2"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="public">Public Holiday</option>
                    <option value="festival">Festival</option>
                    <option value="religious">Religious</option>
                    <option value="company">Company Event</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea
                  className="w-full border rounded-md p-2"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isOptional"
                  checked={formData.isOptional}
                  onChange={(e) => setFormData({ ...formData, isOptional: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isOptional" className="text-sm">
                  Optional Holiday (employees can choose to work)
                </label>
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
                  {editingHoliday ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Holidays</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{holidays.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Public Holidays</CardTitle>
            <Sun className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {holidays.filter(h => h.type === 'public').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Festivals</CardTitle>
            <span className="text-2xl">🎉</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {holidays.filter(h => h.type === 'festival').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Optional</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {holidays.filter(h => h.isOptional).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holidays by Month */}
      <div className="space-y-6">
        {Object.entries(groupedHolidays).map(([month, monthHolidays]) => (
          <Card key={month}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {month}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Holiday Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Optional</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthHolidays.map((holiday) => (
                    <TableRow key={holiday._id}>
                      <TableCell className="font-medium">
                        {formatDate(holiday.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getTypeIcon(holiday.type)}</span>
                          {holiday.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeColor(holiday.type)}>
                          {holiday.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {holiday.description}
                      </TableCell>
                      <TableCell>
                        {holiday.isOptional ? (
                          <Badge variant="secondary">Optional</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(holiday)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(holiday._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      {holidays.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No holidays found. Click "Add Holiday" to create one.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HolidayPage;
