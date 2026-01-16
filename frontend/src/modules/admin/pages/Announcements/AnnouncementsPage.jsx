import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Plus, Edit, Trash2, Megaphone } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatIndianDate } from '../../../../utils/indianFormatters';
import { PermissionGate } from '../../../../core/guards';
import { MODULES } from '../../../../core/utils/rolePermissions';
import { LoadingSpinner } from '../../../../shared/components';
import useAuth from '../../../../core/hooks/useAuth';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
  });

  const { user } = useAuth();

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call when backend is ready
      // const response = await api.get('/admin/announcements');
      // setAnnouncements(response.data.data);
      
      // Mock data with Indian date formatting
      setAnnouncements([
        {
          _id: '1',
          title: 'Company Holiday - New Year',
          content: 'Office will be closed on January 1st for New Year celebration.',
          priority: 'high',
          createdAt: new Date(),
          author: user?.firstName ? `${user.firstName} ${user.lastName}` : 'HR Department',
        },
        {
          _id: '2',
          title: 'New Policy Update',
          content: 'Please review the updated leave policy in the HR portal.',
          priority: 'normal',
          createdAt: new Date(Date.now() - 86400000),
          author: 'Admin',
        },
      ]);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      // TODO: Replace with actual API call when backend is ready
      // if (editingAnnouncement) {
      //   await api.put(`/admin/announcements/${editingAnnouncement._id}`, formData);
      //   toast.success('Announcement updated successfully');
      // } else {
      //   await api.post('/admin/announcements', formData);
      //   toast.success('Announcement created successfully');
      // }
      
      if (editingAnnouncement) {
        toast.success('Announcement updated successfully');
      } else {
        toast.success('Announcement created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Failed to save announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (_id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      // TODO: Replace with actual API call when backend is ready
      // await api.delete(`/admin/announcements/${_id}`);
      
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', priority: 'normal' });
    setEditingAnnouncement(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'normal':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Announcements</h1>
          <p className="text-gray-500 text-sm mt-1">Manage company-wide announcements</p>
        </div>
        <PermissionGate permission={MODULES.ANNOUNCEMENT?.CREATE}>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </Button>
        </PermissionGate>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="py-8 text-center">
              <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No announcements yet</p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement._id} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-gray-800">
                        {announcement.title}
                      </h3>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{announcement.content}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>By {announcement.author}</span>
                      <span>•</span>
                      <span>{formatIndianDate(announcement.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3">
                    <PermissionGate permission={MODULES.ANNOUNCEMENT?.EDIT}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingAnnouncement(announcement);
                          setFormData({
                            title: announcement.title,
                            content: announcement.content,
                            priority: announcement.priority,
                          });
                          setShowModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </PermissionGate>
                    <PermissionGate permission={MODULES.ANNOUNCEMENT?.DELETE}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(announcement._id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </PermissionGate>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-800">
                {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter announcement title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Enter announcement content"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? 'Saving...' : (editingAnnouncement ? 'Update' : 'Create')}
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

export default AnnouncementsPage;