import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalInfoSchema } from '../../../utils/essValidation';
import { Button } from '../../ui/button' ;
import { Input } from '../../ui/input' ;
import { Label } from '../../ui/label' ;
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card' ;
import { toast } from 'react-toastify';

const PersonalInfoForm = ({ profile, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: profile?.personalInfo || {
      email: '',
      phone: '',
      alternatePhone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
    },
  });

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Update your contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternatePhone">Alternate Phone</Label>
              <Input
                id="alternatePhone"
                type="tel"
                {...register('alternatePhone')}
                className={errors.alternatePhone ? 'border-red-500' : ''}
              />
              {errors.alternatePhone && (
                <p className="text-sm text-red-500">{errors.alternatePhone.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
          <CardDescription>Your residential address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              {...register('address.street')}
              className={errors.address?.street ? 'border-red-500' : ''}
            />
            {errors.address?.street && (
              <p className="text-sm text-red-500">{errors.address.street.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('address.city')}
                className={errors.address?.city ? 'border-red-500' : ''}
              />
              {errors.address?.city && (
                <p className="text-sm text-red-500">{errors.address.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                {...register('address.state')}
                className={errors.address?.state ? 'border-red-500' : ''}
              />
              {errors.address?.state && (
                <p className="text-sm text-red-500">{errors.address.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code *</Label>
              <Input
                id="zipCode"
                {...register('address.zipCode')}
                className={errors.address?.zipCode ? 'border-red-500' : ''}
              />
              {errors.address?.zipCode && (
                <p className="text-sm text-red-500">{errors.address.zipCode.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              {...register('address.country')}
              className={errors.address?.country ? 'border-red-500' : ''}
            />
            {errors.address?.country && (
              <p className="text-sm text-red-500">{errors.address.country.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
          <CardDescription>Person to contact in case of emergency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Name *</Label>
              <Input
                id="emergencyName"
                {...register('emergencyContact.name')}
                className={errors.emergencyContact?.name ? 'border-red-500' : ''}
              />
              {errors.emergencyContact?.name && (
                <p className="text-sm text-red-500">{errors.emergencyContact.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship *</Label>
              <Input
                id="relationship"
                {...register('emergencyContact.relationship')}
                className={errors.emergencyContact?.relationship ? 'border-red-500' : ''}
              />
              {errors.emergencyContact?.relationship && (
                <p className="text-sm text-red-500">{errors.emergencyContact.relationship.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Phone Number *</Label>
              <Input
                id="emergencyPhone"
                type="tel"
                {...register('emergencyContact.phone')}
                className={errors.emergencyContact?.phone ? 'border-red-500' : ''}
              />
              {errors.emergencyContact?.phone && (
                <p className="text-sm text-red-500">{errors.emergencyContact.phone.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default PersonalInfoForm;
