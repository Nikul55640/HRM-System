import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shiftChangeSchema } from '../../../core/utils/essValidation';
import { Button } from '../../../shared/ui/button';
import { Label } from '../../../shared/ui/label';
import { Textarea } from '../../../shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Calendar } from '../../../shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shared/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

const ShiftChangeForm = ({ onSubmit, isLoading, onCancel }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(shiftChangeSchema),
    defaultValues: {
      requestedShift: '',
      reason: '',
      effectiveDate: undefined,
    },
  });

  const effectiveDate = watch('effectiveDate');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="requestedShift">Requested Shift</Label>
        <Select onValueChange={(value) => setValue('requestedShift', value, { shouldValidate: true })}>
          <SelectTrigger>
            <SelectValue placeholder="Select shift" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="morning">Morning (9:00 AM - 6:00 PM)</SelectItem>
            <SelectItem value="evening">Evening (2:00 PM - 11:00 PM)</SelectItem>
            <SelectItem value="night">Night (10:00 PM - 7:00 AM)</SelectItem>
            <SelectItem value="weekend">Weekend Shift</SelectItem>
          </SelectContent>
        </Select>
        {errors.requestedShift && <p className="text-sm text-red-500">{errors.requestedShift.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="effectiveDate">Effective Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !effectiveDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {effectiveDate ? format(effectiveDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={effectiveDate}
              onSelect={(date) => setValue('effectiveDate', date, { shouldValidate: true })}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
        {errors.effectiveDate && <p className="text-sm text-red-500">{errors.effectiveDate.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Change</Label>
        <Textarea
          id="reason"
          placeholder="Please explain why you need to change your shift..."
          {...register('reason')}
          className="min-h-[100px]"
        />
        {errors.reason && <p className="text-sm text-red-500">{errors.reason.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
};

export default ShiftChangeForm;