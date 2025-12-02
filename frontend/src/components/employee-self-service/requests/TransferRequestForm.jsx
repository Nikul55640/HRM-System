import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transferRequestSchema }  from '../../../utils/essValidation';
import { Button } from '../../ui/button' ;
import { Input } from '../../ui/input' ;
import { Label } from  '../../ui/label' ;
import { Textarea } from '../../ui/textarea' ;
import { Calendar } from '../../ui/calendar' ;
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover' ;
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';


const TransferRequestForm = ({ onSubmit, isLoading, onCancel }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transferRequestSchema),
    defaultValues: {
      requestedDepartment: '',
      requestedLocation: '',
      reason: '',
      preferredDate: undefined,
    },
  });

  const preferredDate = watch('preferredDate');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="requestedDepartment">Requested Department</Label>
        <Input
          id="requestedDepartment"
          placeholder="e.g. Engineering, Marketing"
          {...register('requestedDepartment')}
        />
        {errors.requestedDepartment && <p className="text-sm text-red-500">{errors.requestedDepartment.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="requestedLocation">Requested Location</Label>
        <Input
          id="requestedLocation"
          placeholder="e.g. New York Office, Remote"
          {...register('requestedLocation')}
        />
        {errors.requestedLocation && <p className="text-sm text-red-500">{errors.requestedLocation.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredDate">Preferred Effective Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !preferredDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {preferredDate ? format(preferredDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={preferredDate}
              onSelect={(date) => setValue('preferredDate', date, { shouldValidate: true })}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
        {errors.preferredDate && <p className="text-sm text-red-500">{errors.preferredDate.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Transfer</Label>
        <Textarea
          id="reason"
          placeholder="Please explain why you are requesting this transfer..."
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

export default TransferRequestForm;
