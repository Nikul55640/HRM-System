import React, { useState } from 'react';
import { Button } from '../../../shared/ui/button';
import { Textarea } from '../../../shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

const NoteForm = ({ leadId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    content: '',
    type: 'general',
    isPrivate: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/admin/leads/${leadId}/notes`, formData);
      toast.success('Note added successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to add note');
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
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Note Type</label>
            <Select 
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="call_log">Call Log</SelectItem>
                <SelectItem value="meeting_notes">Meeting Notes</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="important">Important</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content *</label>
            <Textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={5}
              placeholder="Enter your note here..."
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isPrivate" className="text-sm">
              Make this note private
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Add Note'}
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

export default NoteForm;