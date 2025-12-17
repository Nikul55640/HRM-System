import { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { X, Calendar, Clock, FileText } from 'lucide-react';

import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Textarea } from '../../../shared/ui/textarea';
import { Checkbox } from '../../../shared/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/select';

// Validation schema
const leaveRequestSchema = z.object({
  leaveType: z.string().min(1, 'Leave type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  isHalfDay: z.boolean().optional(),
  halfDayPeriod: z.enum(['morning', 'afternoon']).optional(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
});

const LeaveRequestModal = ({ open, onClose, onSubmit, leaveBalance }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      isHalfDay: false,
      halfDayPeriod: 'morning',
    },
  });

  const watchIsHalfDay = watch('isHalfDay');
  const watchLeaveType = watch('leaveType');

  // Get available leave types from balance
  const availableLeaveTypes = leaveBalance?.leaveTypes?.filter(lt => lt.available > 0) || [];

  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Transform data to match backend expectations
      const submitData = {
        type: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        isHalfDay: data.isHalfDay,
        halfDayPeriod: data.isHalfDay ? data.halfDayPeriod : null,
      };

      await onSubmit(submitData);
      reset();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDuration = () => {
    const startDate = watch('startDate');
    const endDate = watch('endDate');
    const isHalfDay = watch('isHalfDay');

    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) return 0;

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (isHalfDay && diffDays === 1) {
      return 0.5;
    }

    return diffDays;
  };

  const getAvailableBalance = () => {
    if (!watchLeaveType || !leaveBalance?.leaveTypes) return 0;
    const leaveType = leaveBalance.leaveTypes.find(lt => lt.type === watchLeaveType);
    return leaveType?.available || 0;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Apply for Leave</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Leave Type */}
          <div className="space-y-2">
            <Label htmlFor="leaveType">Leave Type *</Label>
            <Select onValueChange={(value) => setValue('leaveType', value)}>
              <SelectTrigger className={errors.leaveType ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {availableLeaveTypes.length === 0 ? (
                  <SelectItem value="" disabled>
                    No leave types available
                  </SelectItem>
                ) : (
                  availableLeaveTypes.map((leaveType) => (
                    <SelectItem key={leaveType.type} value={leaveType.type}>
                      {leaveType.type.charAt(0).toUpperCase() + leaveType.type.slice(1)} Leave 
                      ({leaveType.available} days available)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.leaveType && (
              <p className="text-sm text-red-500">{errors.leaveType.message}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
                className={errors.startDate ? 'border-red-500' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate')}
                className={errors.endDate ? 'border-red-500' : ''}
                min={watch('startDate') || new Date().toISOString().split('T')[0]}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Half Day Option */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isHalfDay" 
                onCheckedChange={(checked) => setValue('isHalfDay', checked)}
              />
              <Label htmlFor="isHalfDay">Half Day Leave</Label>
            </div>

            {watchIsHalfDay && (
              <div className="ml-6 space-y-2">
                <Label>Half Day Period</Label>
                <Select 
                  defaultValue="morning"
                  onValueChange={(value) => setValue('halfDayPeriod', value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (First Half)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (Second Half)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Duration & Balance Info */}
          {watchLeaveType && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Leave Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Duration:</span>
                  <span className="ml-2 font-medium">{calculateDuration()} day(s)</span>
                </div>
                <div>
                  <span className="text-blue-700">Available Balance:</span>
                  <span className="ml-2 font-medium">{getAvailableBalance()} day(s)</span>
                </div>
              </div>
              {calculateDuration() > getAvailableBalance() && getAvailableBalance() > 0 && (
                <p className="text-red-600 text-sm mt-2">
                  ⚠️ Requested duration exceeds available balance
                </p>
              )}
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              {...register('reason')}
              className={errors.reason ? 'border-red-500' : ''}
              placeholder="Please provide a detailed reason for your leave request..."
              rows={4}
            />
            {errors.reason && (
              <p className="text-sm text-red-500">{errors.reason.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || availableLeaveTypes.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

LeaveRequestModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  leaveBalance: PropTypes.shape({
    leaveTypes: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string.isRequired,
      available: PropTypes.number.isRequired,
    })),
  }),
};

LeaveRequestModal.defaultProps = {
  leaveBalance: null,
};

export default LeaveRequestModal;