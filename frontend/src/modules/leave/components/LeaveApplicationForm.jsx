import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leaveApplicationSchema } from '../../ess/validation/essValidation';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/ui/card';
import { toast } from 'react-toastify';

const LeaveApplicationForm = ({ onSubmit, isLoading, leaveBalance }) => {
  
  // Initialize form first (hooks must be called unconditionally)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(leaveApplicationSchema),
    defaultValues: {
      leaveType: '',
      startDate: undefined,
      endDate: undefined,
      reason: '',
      isHalfDay: false,
    },
  });

  // Extract available leave types from balance
  const availableLeaveTypes = leaveBalance?.leaveTypes?.filter(lt => lt.available > 0) || [];
  
  // If no leave types available, show message
  if (availableLeaveTypes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 font-medium">No leave balance available</p>
          <p className="text-sm text-gray-500 mt-2">
            Please contact HR to assign your leave balance or wait for your leave to be approved.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleFormSubmit = async (data) => {
    try {
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
      toast.success('Leave application submitted successfully');
      reset();
    } catch (error) {
      toast.error(error.message || 'Failed to submit leave application');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for Leave</CardTitle>
        <CardDescription>Submit a new leave request</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leaveType">Leave Type *</Label>
            <Select onValueChange={(value) => setValue('leaveType', value)}>
              <SelectTrigger className={errors.leaveType ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {availableLeaveTypes.map((leaveType) => (
                  <SelectItem key={leaveType.type} value={leaveType.type}>
                    {leaveType.type.charAt(0).toUpperCase() + leaveType.type.slice(1)} Leave ({leaveType.available} days available)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leaveType && (
              <p className="text-sm text-red-500">{errors.leaveType.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate', { valueAsDate: true })}
                className={errors.startDate ? 'border-red-500' : ''}
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
                {...register('endDate', { valueAsDate: true })}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isHalfDay" 
              onCheckedChange={(checked) => setValue('isHalfDay', checked)}
            />
            <Label htmlFor="isHalfDay">Half Day</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              {...register('reason')}
              className={errors.reason ? 'border-red-500' : ''}
              placeholder="Please provide a reason for your leave"
            />
            {errors.reason && (
              <p className="text-sm text-red-500">{errors.reason.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Apply Leave'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

LeaveApplicationForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  leaveBalance: PropTypes.shape({
    leaveTypes: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string.isRequired,
      available: PropTypes.number.isRequired,
    })),
  }),
};

LeaveApplicationForm.defaultProps = {
  isLoading: false,
  leaveBalance: null,
};

export default LeaveApplicationForm;
