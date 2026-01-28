import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Textarea } from '../../../shared/ui/textarea';
import { Checkbox } from '../../../shared/ui/checkbox';
import { Badge } from '../../../shared/ui/badge';
import { X, Save, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { smartCalendarService } from '../../../services';

const WorkingRuleForm = ({ rule = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    ruleName: '',
    workingDays: [1, 2, 3, 4, 5], // Default Mon-Fri
    weekendDays: [0, 6], // Default Sun-Sat
    effectiveFrom: '',
    effectiveTo: '',
    isActive: true, // Default to active
    isDefault: false,
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rule) {
      setFormData({
        ruleName: rule.ruleName || '',
        workingDays: rule.workingDays || [1, 2, 3, 4, 5],
        weekendDays: rule.weekendDays || [0, 6],
        effectiveFrom: rule.effectiveFrom || '',
        effectiveTo: rule.effectiveTo || '',
        isActive: rule.isActive !== undefined ? rule.isActive : true,
        isDefault: rule.isDefault || false,
        description: rule.description || ''
      });
    }
  }, [rule]);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleDayToggle = (dayIndex, isWorking) => {
    if (isWorking) {
      // Add to working days, remove from weekend days
      setFormData(prev => ({
        ...prev,
        workingDays: [...new Set([...prev.workingDays, dayIndex])],
        weekendDays: prev.weekendDays.filter(d => d !== dayIndex)
      }));
    } else {
      // Add to weekend days, remove from working days
      setFormData(prev => ({
        ...prev,
        weekendDays: [...new Set([...prev.weekendDays, dayIndex])],
        workingDays: prev.workingDays.filter(d => d !== dayIndex)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = smartCalendarService.validateWorkingRule(formData);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    setLoading(true);
    try {
      let result;
      if (rule?.id) {
        result = await smartCalendarService.updateWorkingRule(rule.id, formData);
      } else {
        result = await smartCalendarService.createWorkingRule(formData);
      }

      if (result.success) {
        toast.success(rule?.id ? 'Working rule updated successfully' : 'Working rule created successfully');
        onSave(result.data);
      } else {
        toast.error(result.message || 'Failed to save working rule');
      }
    } catch (error) {
      console.error('Error saving working rule:', error);
      toast.error('Failed to save working rule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Calendar className="w-4 h-4 mr-2" />
            {rule?.id ? 'Edit Working Rule' : 'Create Working Rule'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Rule Name */}
          <div className="space-y-2">
            <Label htmlFor="ruleName" className="text-sm font-medium">Rule Name *</Label>
            <Input
              id="ruleName"
              value={formData.ruleName}
              onChange={(e) => setFormData(prev => ({ ...prev, ruleName: e.target.value }))}
              placeholder="e.g., Standard Monday-Friday"
              required
              className="w-full"
            />
          </div>

          {/* Working Days Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Working Days Configuration *</Label>
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map((day, index) => {
                const isWorking = formData.workingDays.includes(index);
                const isWeekend = formData.weekendDays.includes(index);
                
                return (
                  <div key={index} className="text-center">
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      {day.slice(0, 3)}
                    </div>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => handleDayToggle(index, true)}
                        className={`w-full px-1 py-1 text-xs rounded ${
                          isWorking 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : 'bg-gray-100 text-gray-600 border border-gray-300'
                        }`}
                      >
                        Work
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDayToggle(index, false)}
                        className={`w-full px-1 py-1 text-xs rounded ${
                          isWeekend 
                            ? 'bg-red-100 text-red-800 border border-red-300' 
                            : 'bg-gray-100 text-gray-600 border border-gray-300'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Summary */}
            <div className="flex flex-col sm:flex-row gap-2 text-sm">
              <div className="flex-1">
                <span className="font-medium text-gray-700">Working Days: </span>
                <div className="inline-flex gap-1 flex-wrap mt-1">
                  {formData.workingDays.map(day => (
                    <Badge key={day} variant="secondary" className="text-xs">
                      {dayNames[day].slice(0, 3)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <span className="font-medium text-gray-700">Weekends: </span>
                <div className="inline-flex gap-1 flex-wrap mt-1">
                  {formData.weekendDays.map(day => (
                    <Badge key={day} variant="outline" className="text-xs">
                      {dayNames[day].slice(0, 3)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="effectiveFrom" className="text-sm font-medium">Effective From *</Label>
              <Input
                id="effectiveFrom"
                type="date"
                value={formData.effectiveFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveTo" className="text-sm font-medium">Effective To (Optional)</Label>
              <Input
                id="effectiveTo"
                type="date"
                value={formData.effectiveTo}
                onChange={(e) => setFormData(prev => ({ ...prev, effectiveTo: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Active Rule */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive" className="text-sm">
              Set as active working rule
            </Label>
          </div>

          {/* Default Rule */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
            />
            <Label htmlFor="isDefault" className="text-sm">
              Set as default working rule
            </Label>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description for this working rule..."
              rows={3}
              className="w-full resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : (rule?.id ? 'Update Rule' : 'Create Rule')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WorkingRuleForm;