import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { advanceRequestSchema } from '../../../utils/essValidation';
import { Button } from '../../ui/button' ;
import { Input } from '../../ui/input' ;
import { Label } from '../../ui/label' ;
import { Textarea } from '../../ui/textarea' ;


const AdvanceRequestForm = ({ onSubmit, isLoading, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(advanceRequestSchema),
    defaultValues: {
      amount: '',
      reason: '',
      repaymentMonths: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Advance Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="repaymentMonths">Repayment Period (Months)</Label>
        <Input
          id="repaymentMonths"
          type="number"
          min="1"
          max="12"
          placeholder="1-12"
          {...register('repaymentMonths', { valueAsNumber: true })}
        />
        <p className="text-xs text-muted-foreground">Maximum 12 months repayment period.</p>
        {errors.repaymentMonths && <p className="text-sm text-red-500">{errors.repaymentMonths.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Advance</Label>
        <Textarea
          id="reason"
          placeholder="Please explain why you need this advance..."
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

export default AdvanceRequestForm;
