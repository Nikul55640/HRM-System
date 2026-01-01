import React from 'react';
import { useFormik } from 'formik';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Input } from '../../../../shared/ui/input';
import { Label } from '../../../../shared/ui/label';
import { Textarea } from '../../../../shared/ui/textarea';
import { contactInfoSchema } from '../schemas/profile.schema';

const ContactInfoForm = ({ initialData, onSubmit, loading }) => {
  const formik = useFormik({
    initialValues: {
      phone: initialData?.phone || '',
      country: initialData?.country || '',
      address: initialData?.address || '',
    },
    validationSchema: contactInfoSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
    enableReinitialize: true,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.phone && formik.errors.phone ? 'border-red-500' : ''}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-sm text-red-500">{formik.errors.phone}</p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                type="text"
                placeholder="Enter your country"
                value={formik.values.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.country && formik.errors.country ? 'border-red-500' : ''}
              />
              {formik.touched.country && formik.errors.country && (
                <p className="text-sm text-red-500">{formik.errors.country}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address (Optional)</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Enter your full address..."
              rows={3}
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.address && formik.errors.address ? 'border-red-500' : ''}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>
                {formik.touched.address && formik.errors.address && (
                  <span className="text-red-500">{formik.errors.address}</span>
                )}
              </span>
              <span>{formik.values.address.length}/500</span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || !formik.isValid}
              className="min-w-[120px]"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactInfoForm;