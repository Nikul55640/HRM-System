import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Textarea } from '../../../shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { toast } from 'react-toastify';
import { calendarService } from '../../../services';

const HolidayModal = ({ open, holiday, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    type: 'public',
    isPaid: true,
    isRecurring: false,
    recurrencePattern: 'yearly',
    color: '#dc2626',
    isActive: true
  });

  useEffect(() => {
    if (holiday) {
      setFormData({
        name: holiday.name || '',
        description: holiday.description || '',
        date: holiday.date || '',
        type: holiday.type || 'public',
        isPaid: holiday.isPaid !== undefined ? holiday.isPaid : true,
        isRecurring: holiday.isRecurring || false,
        recurrencePattern: holiday.recurrencePattern || 'yearly',
        color: holiday.color || '#dc2626',
        isActive: holiday.isActive !== undefined ? holiday.isActive : true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        date: '',
        type: 'public',
        isPaid: true,
        isRecurring: false,
        recurrencePattern: 'yearly',
        color: '#dc2626',
        isActive: true
      });
    }
  }, [holiday, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.date) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      
      if (holiday) {
        await calendarService.updateHoliday(holiday.id, formData);
        toast.success('Holiday updated successfully');
      } else {
        await calendarService.createHoliday(formData);
        toast.success('Holiday created successfully');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving holiday:', error);
      toast.error(error.response?.data?.message || 'Failed to save holiday');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {holiday ? 'Edit Holiday' : 'Create New Holiday'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Holiday Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter holiday name"
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Holiday Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public Holiday</SelectItem>
                <SelectItem value="national">National Holiday</SelectItem>
                <SelectItem value="religious">Religious Holiday</SelectItem>
                <SelectItem value="company">Company Holiday</SelectItem>
                <SelectItem value="optional">Optional Holiday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="w-16 h-10"
              />
              <Input
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                placeholder="#dc2626"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPaid"
                checked={formData.isPaid}
                onChange={(e) => handleChange('isPaid', e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="isPaid">Paid Holiday</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => handleChange('isRecurring', e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="isRecurring">Recurring Holiday</Label>
            </div>

            {formData.isRecurring && (
              <div>
                <Label htmlFor="recurrencePattern">Recurrence Pattern</Label>
                <Select value={formData.recurrencePattern} onValueChange={(value) => handleChange('recurrencePattern', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="isActive">Active Holiday</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter holiday description (optional)"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (holiday ? 'Update Holiday' : 'Create Holiday')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HolidayModal;