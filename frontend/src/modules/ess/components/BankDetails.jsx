import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bankDetailsSchema } from '../../../core/utils/essValidation';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/ui/card';
import { toast } from 'react-toastify';

const BankDetailsForm = ({ bankDetails, onSubmit, onCancel, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: bankDetails || {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      accountNumberConfirm: '',
      ifscCode: '',
    },
  });

  const handleFormSubmit = async (data) => {
    try {
      // Remove confirmation field before submitting
      const { accountNumberConfirm, ...submitData } = data;
      await onSubmit(submitData);
      toast.success('Bank details submitted for approval');
    } catch (error) {
      toast.error(error.message || 'Failed to update bank details');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{bankDetails ? 'Update Bank Details' : 'Add Bank Details'}</CardTitle>
        <CardDescription>
          Please provide accurate bank information. Changes will require approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountHolderName">Account Holder Name *</Label>
            <Input
              id="accountHolderName"
              {...register('accountHolderName')}
              className={errors.accountHolderName ? 'border-red-500' : ''}
              placeholder="As per bank records"
            />
            {errors.accountHolderName && (
              <p className="text-sm text-red-500">{errors.accountHolderName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name *</Label>
            <Input
              id="bankName"
              {...register('bankName')}
              className={errors.bankName ? 'border-red-500' : ''}
            />
            {errors.bankName && (
              <p className="text-sm text-red-500">{errors.bankName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                type="password"
                {...register('accountNumber')}
                className={errors.accountNumber ? 'border-red-500' : ''}
              />
              {errors.accountNumber && (
                <p className="text-sm text-red-500">{errors.accountNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumberConfirm">Confirm Account Number *</Label>
              <Input
                id="accountNumberConfirm"
                type="text"
                {...register('accountNumberConfirm')}
                className={errors.accountNumberConfirm ? 'border-red-500' : ''}
              />
              {errors.accountNumberConfirm && (
                <p className="text-sm text-red-500">{errors.accountNumberConfirm.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifscCode">IFSC Code *</Label>
            <Input
              id="ifscCode"
              {...register('ifscCode')}
              className={errors.ifscCode ? 'border-red-500' : ''}
              placeholder="ABCD0123456"
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
              }}
            />
            {errors.ifscCode && (
              <p className="text-sm text-red-500">{errors.ifscCode.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BankDetailsForm;