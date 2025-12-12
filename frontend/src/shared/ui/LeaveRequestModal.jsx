import { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { Checkbox } from './checkbox';
import { toast } from 'react-toastify';
import { employeeSelfService } from '../../services';

const LeaveRequestModal = ({ isOpen, onClose, onSuccess, leaveBalance }) => {
  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
    halfDayPeriod: 'morning',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Auto-set end date to start date for half day
    if (field === 'isHalfDay' && value) {
      setFormData(prev => ({
        ...prev,
        endDate: prev.startDate,
      }));
    }

    // Auto-set end date when start date changes for half day
    if (field === 'startDate' && formData.isHalfDay) {
      setFormData(prev => ({
        ...prev,
        endDate: value,
      }));
    }
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (formData.isHalfDay && start.getTime() === end.getTime()) {
      return 0.5;
    }
    
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const getAvailableBalance = () => {
    if (!formData.type || !leaveBalance?.leaveTypes) return 0;
    const typeBalance = leaveBalance.leaveTypes.find(t => t.type === formData.type);
    return typeBalance ? typeBalance.available : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.type || !formData.startDate || !formData.endDate || !formData.reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const days = calculateDays();
    const availableBalance = getAvailableBalance();

    if (days > availableBalance) {
      toast.error(`Insufficient ${formData.type} leave balance. Available: ${availableBalance} days, Requested: ${days} days`);
      return;
    }

    if (formData.isHalfDay && formData.startDate !== formData.endDate) {
      toast.error('Half day leave must have the same start and end date');
      return;
    }

    setIsSubmitting(true);
    try {
      await employeeSelfService.leave.apply({
        ...formData,
        reason: formData.reason.trim(),
      });
      
      toast.success('Leave request submitted successfully');
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: '',
      startDate: '',
      endDate: '',
      reason: '',
      isHalfDay: false,
      halfDayPeriod: 'morning',
    });
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];
  const days = calculateDays();
  const availableBalance = getAvailableBalance();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Leave Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Leave Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveBalance?.leaveTypes?.map((type) => (
                  <SelectItem key={type.type} value={type.type}>
                    {type.type.charAt(0).toUpperCase() + type.type.slice(1)} 
                    ({type.available} days available)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Half Day Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isHalfDay"
              checked={formData.isHalfDay}
              onCheckedChange={(checked) => handleInputChange('isHalfDay', checked)}
            />
            <Label htmlFor="isHalfDay">Half Day Leave</Label>
          </div>

          {/* Half Day Period */}
          {formData.isHalfDay && (
            <div className="space-y-2">
              <Label htmlFor="halfDayPeriod">Half Day Period</Label>
              <Select 
                value={formData.halfDayPeriod} 
                onValueChange={(value) => handleInputChange('halfDayPeriod', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              min={today}
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              required
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              type="date"
              min={formData.startDate || today}
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              disabled={formData.isHalfDay}
              required
            />
          </div>

          {/* Duration Display */}
          {formData.startDate && formData.endDate && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Duration:</span>
                <span className="text-sm">{days} day{days !== 1 ? 's' : ''}</span>
              </div>
              {formData.type && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">Available Balance:</span>
                  <span className={`text-sm ${days > availableBalance ? 'text-red-600' : 'text-green-600'}`}>
                    {availableBalance} days
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for your leave request..."
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              rows={3}
              maxLength={500}
              required
            />
            <div className="text-xs text-gray-500 text-right">
              {formData.reason.length}/500 characters
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || days > availableBalance}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveRequestModal;