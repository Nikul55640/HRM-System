import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Textarea } from '../../../shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { toast } from 'react-hot-toast';

const LeadForm = ({ lead, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    source: 'website',
    status: 'new',
    priority: 'medium',
    estimatedValue: '',
    expectedCloseDate: '',
    assignedTo: '',
    description: '',
    tags: []
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    if (lead) {
      setFormData({
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        position: lead.position || '',
        source: lead.source || 'website',
        status: lead.status || 'new',
        priority: lead.priority || 'medium',
        estimatedValue: lead.estimatedValue || '',
        expectedCloseDate: lead.expectedCloseDate ? lead.expectedCloseDate.split('T')[0] : '',
        assignedTo: lead.assignedTo || '',
        description: lead.description || '',
        tags: lead.tags || []
      });
    }
  }, [lead]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/admin/employees?role=sales,manager', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = lead ? `/api/admin/leads/${lead.id}` : '/api/admin/leads';
      const method = lead ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
        expectedCloseDate: formData.expectedCloseDate || null,
        assignedTo: formData.assignedTo || null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast.success(`Lead ${lead ? 'updated' : 'created'} successfully`);
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${lead ? 'update' : 'create'} lead`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(`Failed to ${lead ? 'update' : 'create'} lead`);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name *</label>
          <Input
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name *</label>
          <Input
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <Input
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Company</label>
          <Input
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Position</label>
          <Input
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Source</label>
          <Select 
            value={formData.source}
            onValueChange={(value) => handleInputChange('source', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="social_media">Social Media</SelectItem>
              <SelectItem value="email_campaign">Email Campaign</SelectItem>
              <SelectItem value="cold_call">Cold Call</SelectItem>
              <SelectItem value="trade_show">Trade Show</SelectItem>
              <SelectItem value="other">Other</SelectItem>
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
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closed_won">Closed Won</SelectItem>
              <SelectItem value="closed_lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Estimated Value ($)</label>
          <Input
            type="number"
            step="0.01"
            value={formData.estimatedValue}
            onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expected Close Date</label>
          <Input
            type="date"
            value={formData.expectedCloseDate}
            onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
          />
        </div>
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

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          placeholder="Additional notes about this lead..."
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : (lead ? 'Update Lead' : 'Create Lead')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default LeadForm;