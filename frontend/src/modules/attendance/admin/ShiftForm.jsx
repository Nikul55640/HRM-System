import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Textarea } from '../../../shared/ui/textarea';
import { Switch } from '../../../shared/ui/switch';
import { Badge } from '../../../shared/ui/badge';
import { 
  Save, 
  X, 
  Clock, 
  Settings, 
  Users, 
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../core/services/api';

const ShiftForm = ({ shift, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shiftName: '',
    shiftCode: '',
    shiftStartTime: '09:00',
    shiftEndTime: '17:00',
    fullDayHours: 8.00,
    halfDayHours: 4.00,
    gracePeriodMinutes: 10,
    lateThresholdMinutes: 15,
    earlyDepartureThresholdMinutes: 15,
    defaultBreakMinutes: 60,
    maxBreakMinutes: 120,
    overtimeEnabled: true,
    overtimeThresholdMinutes: 30,
    weeklyOffDays: [0, 6], // Sunday and Saturday
    isActive: true,
    isDefault: false,
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (shift) {
      setFormData({
        shiftName: shift.shiftName || '',
        shiftCode: shift.shiftCode || '',
        shiftStartTime: shift.shiftStartTime || '09:00',
        shiftEndTime: shift.shiftEndTime || '17:00',
        fullDayHours: shift.fullDayHours || 8.00,
        halfDayHours: shift.halfDayHours || 4.00,
        gracePeriodMinutes: shift.gracePeriodMinutes || 10,
        lateThresholdMinutes: shift.lateThresholdMinutes || 15,
        earlyDepartureThresholdMinutes: shift.earlyDepartureThresholdMinutes || 15,
        defaultBreakMinutes: shift.defaultBreakMinutes || 60,
        maxBreakMinutes: shift.maxBreakMinutes || 120,
        overtimeEnabled: shift.overtimeEnabled !== undefined ? shift.overtimeEnabled : true,
        overtimeThresholdMinutes: shift.overtimeThresholdMinutes || 30,
        weeklyOffDays: shift.weeklyOffDays || [0, 6],
        isActive: shift.isActive !== undefined ? shift.isActive : true,
        isDefault: shift.isDefault !== undefined ? shift.isDefault : false,
        description: shift.description || ''
      });
    }
  }, [shift]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.shiftName.trim()) {
      newErrors.shiftName = 'Shift name is required';
    }

    if (!formData.shiftCode.trim()) {
      newErrors.shiftCode = 'Shift code is required';
    }

    if (!formData.shiftStartTime) {
      newErrors.shiftStartTime = 'Start time is required';
    }

    if (!formData.shiftEndTime) {
      newErrors.shiftEndTime = 'End time is required';
    }

    if (formData.fullDayHours <= 0 || formData.fullDayHours > 24) {
      newErrors.fullDayHours = 'Full day hours must be between 0 and 24';
    }

    if (formData.halfDayHours <= 0 || formData.halfDayHours > formData.fullDayHours) {
      newErrors.halfDayHours = 'Half day hours must be between 0 and full day hours';
    }

    if (formData.gracePeriodMinutes < 0 || formData.gracePeriodMinutes > 120) {
      newErrors.gracePeriodMinutes = 'Grace period must be between 0 and 120 minutes';
    }

    if (formData.lateThresholdMinutes <= 0 || formData.lateThresholdMinutes > 240) {
      newErrors.lateThresholdMinutes = 'Late threshold must be between 1 and 240 minutes';
    }

    if (formData.maxBreakMinutes < formData.defaultBreakMinutes) {
      newErrors.maxBreakMinutes = 'Maximum break cannot be less than default break';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        fullDayHours: parseFloat(formData.fullDayHours),
        halfDayHours: parseFloat(formData.halfDayHours),
        gracePeriodMinutes: parseInt(formData.gracePeriodMinutes),
        lateThresholdMinutes: parseInt(formData.lateThresholdMinutes),
        earlyDepartureThresholdMinutes: parseInt(formData.earlyDepartureThresholdMinutes),
        defaultBreakMinutes: parseInt(formData.defaultBreakMinutes),
        maxBreakMinutes: parseInt(formData.maxBreakMinutes),
        overtimeThresholdMinutes: parseInt(formData.overtimeThresholdMinutes)
      };

      if (shift) {
        await api.put(`/admin/shifts/${shift.id}`, submitData);
        toast.success('Shift updated successfully');
      } else {
        await api.post('/admin/shifts', submitData);
        toast.success('Shift created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving shift:', error);
      toast.error(error.response?.data?.message || 'Failed to save shift');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleWeeklyOffDayToggle = (day) => {
    const newOffDays = formData.weeklyOffDays.includes(day)
      ? formData.weeklyOffDays.filter(d => d !== day)
      : [...formData.weeklyOffDays, day];
    
    handleChange('weeklyOffDays', newOffDays);
  };

  const weekDays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const getShiftDuration = () => {
    if (!formData.shiftStartTime || !formData.shiftEndTime) return 'N/A';
    
    const start = new Date(`2000-01-01T${formData.shiftStartTime}`);
    const end = new Date(`2000-01-01T${formData.shiftEndTime}`);
    
    if (end < start) {
      end.setDate(end.getDate() + 1); // Next day
    }
    
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shiftName">Shift Name *</Label>
              <Input
                id="shiftName"
                value={formData.shiftName}
                onChange={(e) => handleChange('shiftName', e.target.value)}
                placeholder="e.g., Morning Shift"
                className={errors.shiftName ? 'border-red-500' : ''}
              />
              {errors.shiftName && (
                <p className="text-sm text-red-600">{errors.shiftName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shiftCode">Shift Code *</Label>
              <Input
                id="shiftCode"
                value={formData.shiftCode}
                onChange={(e) => handleChange('shiftCode', e.target.value.toUpperCase())}
                placeholder="e.g., MS-001"
                className={errors.shiftCode ? 'border-red-500' : ''}
              />
              {errors.shiftCode && (
                <p className="text-sm text-red-600">{errors.shiftCode}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Optional description for this shift"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => handleChange('isDefault', checked)}
              />
              <Label htmlFor="isDefault">Set as Default Shift</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shift Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Shift Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shiftStartTime">Start Time *</Label>
              <Input
                id="shiftStartTime"
                type="time"
                value={formData.shiftStartTime}
                onChange={(e) => handleChange('shiftStartTime', e.target.value)}
                className={errors.shiftStartTime ? 'border-red-500' : ''}
              />
              {errors.shiftStartTime && (
                <p className="text-sm text-red-600">{errors.shiftStartTime}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shiftEndTime">End Time *</Label>
              <Input
                id="shiftEndTime"
                type="time"
                value={formData.shiftEndTime}
                onChange={(e) => handleChange('shiftEndTime', e.target.value)}
                className={errors.shiftEndTime ? 'border-red-500' : ''}
              />
              {errors.shiftEndTime && (
                <p className="text-sm text-red-600">{errors.shiftEndTime}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="h-10 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                <span className="text-sm font-medium">{getShiftDuration()}</span>
              </div>
            </div>
          </div>

          {/* Weekly Off Days */}
          <div className="space-y-2">
            <Label>Weekly Off Days</Label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => (
                <Badge
                  key={day.value}
                  variant={formData.weeklyOffDays.includes(day.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleWeeklyOffDayToggle(day.value)}
                >
                  {day.label}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Click to toggle weekly off days for this shift
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Work Hours Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Work Hours Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullDayHours">Full Day Hours *</Label>
              <Input
                id="fullDayHours"
                type="number"
                min="1"
                max="24"
                step="0.5"
                value={formData.fullDayHours}
                onChange={(e) => handleChange('fullDayHours', e.target.value)}
                className={errors.fullDayHours ? 'border-red-500' : ''}
              />
              {errors.fullDayHours && (
                <p className="text-sm text-red-600">{errors.fullDayHours}</p>
              )}
              <p className="text-sm text-gray-500">Minimum hours for full day attendance</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="halfDayHours">Half Day Hours *</Label>
              <Input
                id="halfDayHours"
                type="number"
                min="1"
                max="12"
                step="0.5"
                value={formData.halfDayHours}
                onChange={(e) => handleChange('halfDayHours', e.target.value)}
                className={errors.halfDayHours ? 'border-red-500' : ''}
              />
              {errors.halfDayHours && (
                <p className="text-sm text-red-600">{errors.halfDayHours}</p>
              )}
              <p className="text-sm text-gray-500">Minimum hours for half day attendance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Attendance Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gracePeriodMinutes">Grace Period (minutes)</Label>
              <Input
                id="gracePeriodMinutes"
                type="number"
                min="0"
                max="120"
                value={formData.gracePeriodMinutes}
                onChange={(e) => handleChange('gracePeriodMinutes', e.target.value)}
                className={errors.gracePeriodMinutes ? 'border-red-500' : ''}
              />
              {errors.gracePeriodMinutes && (
                <p className="text-sm text-red-600">{errors.gracePeriodMinutes}</p>
              )}
              <p className="text-sm text-gray-500">Allowed delay without marking late</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lateThresholdMinutes">Late Threshold (minutes)</Label>
              <Input
                id="lateThresholdMinutes"
                type="number"
                min="1"
                max="240"
                value={formData.lateThresholdMinutes}
                onChange={(e) => handleChange('lateThresholdMinutes', e.target.value)}
                className={errors.lateThresholdMinutes ? 'border-red-500' : ''}
              />
              {errors.lateThresholdMinutes && (
                <p className="text-sm text-red-600">{errors.lateThresholdMinutes}</p>
              )}
              <p className="text-sm text-gray-500">Minutes late to mark as "Late"</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="earlyDepartureThresholdMinutes">Early Departure (minutes)</Label>
              <Input
                id="earlyDepartureThresholdMinutes"
                type="number"
                min="1"
                max="240"
                value={formData.earlyDepartureThresholdMinutes}
                onChange={(e) => handleChange('earlyDepartureThresholdMinutes', e.target.value)}
              />
              <p className="text-sm text-gray-500">Minutes early to mark as early departure</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Break Time Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Break Time Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultBreakMinutes">Default Break (minutes)</Label>
              <Input
                id="defaultBreakMinutes"
                type="number"
                min="0"
                max="480"
                value={formData.defaultBreakMinutes}
                onChange={(e) => handleChange('defaultBreakMinutes', e.target.value)}
              />
              <p className="text-sm text-gray-500">Standard break duration</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxBreakMinutes">Maximum Break (minutes)</Label>
              <Input
                id="maxBreakMinutes"
                type="number"
                min="0"
                max="480"
                value={formData.maxBreakMinutes}
                onChange={(e) => handleChange('maxBreakMinutes', e.target.value)}
                className={errors.maxBreakMinutes ? 'border-red-500' : ''}
              />
              {errors.maxBreakMinutes && (
                <p className="text-sm text-red-600">{errors.maxBreakMinutes}</p>
              )}
              <p className="text-sm text-gray-500">Maximum allowed break time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overtime Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Overtime Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              id="overtimeEnabled"
              checked={formData.overtimeEnabled}
              onCheckedChange={(checked) => handleChange('overtimeEnabled', checked)}
            />
            <Label htmlFor="overtimeEnabled">Enable Overtime Tracking</Label>
          </div>

          {formData.overtimeEnabled && (
            <div className="space-y-2">
              <Label htmlFor="overtimeThresholdMinutes">Overtime Threshold (minutes)</Label>
              <Input
                id="overtimeThresholdMinutes"
                type="number"
                min="0"
                max="240"
                value={formData.overtimeThresholdMinutes}
                onChange={(e) => handleChange('overtimeThresholdMinutes', e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Minutes after shift end to start overtime calculation
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="w-5 h-5" />
            Shift Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Shift:</strong> {formData.shiftName} ({formData.shiftCode})</p>
              <p><strong>Timing:</strong> {formData.shiftStartTime} - {formData.shiftEndTime} ({getShiftDuration()})</p>
              <p><strong>Full Day:</strong> {formData.fullDayHours}h | <strong>Half Day:</strong> {formData.halfDayHours}h</p>
            </div>
            <div>
              <p><strong>Grace Period:</strong> {formData.gracePeriodMinutes} minutes</p>
              <p><strong>Late Threshold:</strong> {formData.lateThresholdMinutes} minutes</p>
              <p><strong>Overtime:</strong> {formData.overtimeEnabled ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : (shift ? 'Update Shift' : 'Create Shift')}
        </Button>
      </div>
    </form>
  );
};

export default ShiftForm;