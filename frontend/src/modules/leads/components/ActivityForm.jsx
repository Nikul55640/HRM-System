import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Textarea } from '../../../shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { toast } from 'react-hot-toast';
import api from '../../../core/api/api';

const ActivityForm = ({ leadId, activity, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'call',
    subject: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    scheduledDate: '',
    assignedTo: '',
    duration: ''
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    if (activity) {
      setFormData({
        type: activity.type || 'call',
        subject: activity.subject || '',
        description: activity.description || '',
        status: activity.status || 'pending',
        priority: activity.priority || 'medium',
        scheduledDate: activity.scheduledDate ? activity.scheduledDate.split('T')[0] + 'T' + activity.scheduledDate.split('T')[1].substring(0, 5) : '',
        assignedTo: activity.assignedTo || '',
        duration: activity.duration || ''
      });
    }
  }, [activity]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/admin/employees?role=sales,manager');
      setEmployees(response.data.data || []);
    } catch (error) {
      // Employees are optional, don't show error toast
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        scheduledDate: formData.scheduledDate || null,
        assignedTo: formData.assignedTo || null,
        duration: formData.duration ? parseInt(formData.duration) : null
      };

      if (activity) {
        await api.put(`/admin/leads/activities/${activity.id}`, submitData);
      } else {
        await api.post(`/admin/leads/${leadId}/activities`, submitData);
      }

      toast.success(`Activity ${activity ? 'updated' : 'created'} successfully`);
      onSuccess();
    } catch (error) {
      toast.error(error.message || `Failed to ${activity ? 'update' : 'create'} activity`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {activity ? 'Edit Activity' : 'Create New Activity'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <Select 
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select 
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject *</label>
            <Input
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <Select 
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Scheduled Date</label>
            <Input
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Assign To</label>
            <Select 
              value={formData.assignedTo}
              onValueChange={(value) => handleInputChange('assignedTo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.firstName} {employee.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : (activity ? 'Update Activity' : 'Create Activity')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityForm;