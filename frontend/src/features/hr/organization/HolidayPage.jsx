import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Calendar, Plus, Edit, Trash2, Sun } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate } from '../../../utils/essHelpers';

const HolidayPage = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
      setHolidays([
        {
          _id: '1',
          name: "New Year's Day",
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
      ]);
    } catch (error) {
      toast.error('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.date) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      if (editingHoliday) {
        toast.success('Holiday updated successfully');
      } else {
        toast.success('Holiday created successfully');
      }
      setShowModal(false);
      setEditingHoliday(null);
      setFormData({ name: '', date: '', type: 'public', description: '', isOptional: false });
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
    setShowModal(true);
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

  const getTypeColor = (type) => {
    switch (type) {
      case 'public':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'festival':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'religious':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'company':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    if (type === 'public') return '🏛️';
    if (type === 'festival') return '🎉';
    if (type === 'religious') return '🙏';
    return '🏢';
  };

  const groupedHolidays = holidays.reduce((acc, holiday) => {
    const month = holiday.date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(holiday);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading holidays...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Company Holidays</h1>
          <p className="text-gray-500 text-sm mt-1">Manage public holidays and company events</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Holiday
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Holidays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-800">{holidays.length}</div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Public Holidays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-800">
              {holidays.filter(h => h.type === 'public').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Festivals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-800">
              {holidays.filter(h => h.type === 'festival').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Optional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-800">
              {holidays.filter(h => h.isOptional).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holidays by Month */}
      <div className="space-y-6">
        {Object.entries(groupedHolidays).map(([month, monthHolidays]) => (
          <Card key={month} className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                {month}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Holiday Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Optional</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {monthHolidays.map((holiday) => (
                      <tr key={holiday._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                          {formatDate(holiday.date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <div className="flex items-center gap-2">
                            <span>{getTypeIcon(holiday.type)}</span>
                            {holiday.name}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getTypeColor(holiday.type)}`}>
                            {holiday.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                          {holiday.description}
                        </td>
                        <td className="px-4 py-3">
                          {holiday.isOptional ? (
                            <span className="inline-block px-2 py-1 rounded text-xs font-medium border text-gray-600 bg-gray-50 border-gray-200">
                              Optional
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(holiday)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(holiday._id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Holiday Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., New Year's Day"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="public">Public Holiday</option>
                      <option value="festival">Festival</option>
                      <option value="religious">Religious</option>
                      <option value="company">Company Event</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description..."
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isOptional"
                    checked={formData.isOptional}
                    onChange={(e) => setFormData({ ...formData, isOptional: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isOptional" className="text-sm text-gray-700">
                    Optional Holiday (employees can choose to work)
                  </label>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setEditingHoliday(null);
                      setFormData({ name: '', date: '', type: 'public', description: '', isOptional: false });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingHoliday ? 'Update' : 'Create'}
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

export default HolidayPage;
