import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Textarea } from '../../../shared/ui/textarea';
import { Switch } from '../../../shared/ui/switch';
import { Badge } from '../../../shared/ui/badge';
import { Save, X, Clock, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';

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
    weeklyOffDays: [0, 6],
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
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' }
  ];

  const getShiftDuration = () => {
    if (!formData.shiftStartTime || !formData.shiftEndTime) return 'N/A';
    
    const start = new Date(`2000-01-01T${formData.shiftStartTime}`);
    const end = new Date(`2000-01-01T${formData.shiftEndTime}`);
    
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }
    
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="w-4 h-4" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="shiftName" className="text-sm">Shift Name *</Label>
              <Input
                id="shiftName"
                value={formData.shiftName}
                onChange={(e) => handleChange('shiftName', e.target.value)}
                placeholder="e.g., Morning Shift"
                className={`text-sm ${errors.shiftName ? 'border-red-500' : ''}`}
              />
              {errors.shiftName && <p className="text-xs text-red-600">{errors.shiftName}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="shiftCode" className="text-sm">Shift Code *</Label>
              <Input
                id="shiftCode"
                value={formData.shiftCode}
                onChange={(e) => handleChange('shiftCode', e.target.value.toUpperCase())}
                placeholder="e.g., MS-001"
                className={`text-sm ${errors.shiftCode ? 'border-red-500' : ''}`}
              />
              {errors.shiftCode && <p className="text-xs text-red-600">{errors.shiftCode}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-sm">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Optional description"
              rows={2}
              className="text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange('isActive', checked)}
              />
              <Label htmlFor="isActive" className="text-sm">Active</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => handleChange('isDefault', checked)}
              />
              <Label htmlFor="isDefault" className="text-sm">Default Shift</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shift Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-4 h-4" />
            Shift Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label htmlFor="shiftStartTime" className="text-sm">Start Time *</Label>
              <Input
                id="shiftStartTime"
                type="time"
                value={formData.shiftStartTime}
                onChange={(e) => handleChange('shiftStartTime', e.target.value)}
                className={`text-sm ${errors.shiftStartTime ? 'border-red-500' : ''}`}
              />
              {errors.shiftStartTime && <p className="text-xs text-red-600">{errors.shiftStartTime}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="shiftEndTime" className="text-sm">End Time *</Label>
              <Input
                id="shiftEndTime"
                type="time"
                value={formData.shiftEndTime}
                onChange={(e) => handleChange('shiftEndTime', e.target.value)}
                className={`text-sm ${errors.shiftEndTime ? 'border-red-500' : ''}`}
              />
              {errors.shiftEndTime && <p className="text-xs text-red-600">{errors.shiftEndTime}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-sm">Duration</Label>
              <div className="h-9 px-3 py-1 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                <span className="text-sm font-medium">{getShiftDuration()}</span>
              </div>
            </div>
          </div>

          {/* Weekly Off Days */}
          <div className="space-y-2">
            <Label className="text-sm">Weekly Off Days</Label>
            <div className="flex flex-wrap gap-1">
              {weekDays.map((day) => (
                <Badge
                  key={day.value}
                  variant={formData.weeklyOffDays.includes(day.value) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => handleWeeklyOffDayToggle(day.value)}
                >
                  {day.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Work Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="fullDayHours" className="text-sm">Full Day Hours *</Label>
              <Input
                id="fullDayHours"
                type="number"
                min="1"
                max="24"
                step="0.5"
                value={formData.fullDayHours}
                onChange={(e) => handleChange('fullDayHours', e.target.value)}
                className={`text-sm ${errors.fullDayHours ? 'border-red-500' : ''}`}
              />
              {errors.fullDayHours && <p className="text-xs text-red-600">{errors.fullDayHours}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="halfDayHours" className="text-sm">Half Day Hours *</Label>
              <Input
                id="halfDayHours"
                type="number"
                min="1"
                max="12"
                step="0.5"
                value={formData.halfDayHours}
                onChange={(e) => handleChange('halfDayHours', e.target.value)}
                className={`text-sm ${errors.halfDayHours ? 'border-red-500' : ''}`}
              />
              {errors.halfDayHours && <p className="text-xs text-red-600">{errors.halfDayHours}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attendance Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label htmlFor="gracePeriodMinutes" className="text-sm">Grace Period (min)</Label>
              <Input
                id="gracePeriodMinutes"
                type="number"
                min="0"
                max="120"
                value={formData.gracePeriodMinutes}
                onChange={(e) => handleChange('gracePeriodMinutes', e.target.value)}
                className={`text-sm ${errors.gracePeriodMinutes ? 'border-red-500' : ''}`}
              />
              {errors.gracePeriodMinutes && <p className="text-xs text-red-600">{errors.gracePeriodMinutes}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="lateThresholdMinutes" className="text-sm">Late Threshold (min)</Label>
              <Input
                id="lateThresholdMinutes"
                type="number"
                min="1"
                max="240"
                value={formData.lateThresholdMinutes}
                onChange={(e) => handleChange('lateThresholdMinutes', e.target.value)}
                className={`text-sm ${errors.lateThresholdMinutes ? 'border-red-500' : ''}`}
              />
              {errors.lateThresholdMinutes && <p className="text-xs text-red-600">{errors.lateThresholdMinutes}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="earlyDepartureThresholdMinutes" className="text-sm">Early Departure (min)</Label>
              <Input
                id="earlyDepartureThresholdMinutes"
                type="number"
                min="1"
                max="240"
                value={formData.earlyDepartureThresholdMinutes}
                onChange={(e) => handleChange('earlyDepartureThresholdMinutes', e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Break Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Break Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="defaultBreakMinutes" className="text-sm">Default Break (min)</Label>
              <Input
                id="defaultBreakMinutes"
                type="number"
                min="0"
                max="480"
                value={formData.defaultBreakMinutes}
                onChange={(e) => handleChange('defaultBreakMinutes', e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="maxBreakMinutes" className="text-sm">Maximum Break (min)</Label>
              <Input
                id="maxBreakMinutes"
                type="number"
                min="0"
                max="480"
                value={formData.maxBreakMinutes}
                onChange={(e) => handleChange('maxBreakMinutes', e.target.value)}
                className={`text-sm ${errors.maxBreakMinutes ? 'border-red-500' : ''}`}
              />
              {errors.maxBreakMinutes && <p className="text-xs text-red-600">{errors.maxBreakMinutes}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overtime */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overtime</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Switch
              id="overtimeEnabled"
              checked={formData.overtimeEnabled}
              onCheckedChange={(checked) => handleChange('overtimeEnabled', checked)}
            />
            <Label htmlFor="overtimeEnabled" className="text-sm">Enable Overtime Tracking</Label>
          </div>

          {formData.overtimeEnabled && (
            <div className="space-y-1">
              <Label htmlFor="overtimeThresholdMinutes" className="text-sm">Overtime Threshold (min)</Label>
              <Input
                id="overtimeThresholdMinutes"
                type="number"
                min="0"
                max="240"
                value={formData.overtimeThresholdMinutes}
                onChange={(e) => handleChange('overtimeThresholdMinutes', e.target.value)}
                className="text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-3 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="text-sm"
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-sm"
        >
          <Save className="w-4 h-4 mr-1" />
          {loading ? 'Saving...' : (shift ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
};

export default ShiftForm;
