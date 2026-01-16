import React from 'react';
import { useFormik } from 'formik';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Input } from '../../../../shared/ui/input';
import { Label } from '../../../../shared/ui/label';
import { contactInfoSchema } from '../schemas/profile.schema';

// Track if we've already warned about broken address (prevent console spam)
let hasWarnedAboutBrokenAddress = false;

const ContactInfoForm = ({ initialData, onSubmit, loading }) => {
  // Parse address if it's a JSON string or object
  const parseAddress = (address) => {
    if (!address) return { street: '', city: '', state: '', zipCode: '', country: '' };
    
    // Handle broken backend value
    if (address === "[object Object]") {
      if (!hasWarnedAboutBrokenAddress) {
        console.warn('⚠️ Received invalid address format: [object Object] - Please re-enter your address');
        hasWarnedAboutBrokenAddress = true;
      }
      return { street: '', city: '', state: '', zipCode: '', country: '' };
    }
    
    // If already an object, return as-is
    if (typeof address === 'object') {
      return address;
    }
    
    // If string, try to parse as JSON
    if (typeof address === 'string') {
      try {
        return JSON.parse(address);
      } catch {
        // If parsing fails, treat as plain string (old format)
        return { street: address, city: '', state: '', zipCode: '', country: '' };
      }
    }
    
    return { street: '', city: '', state: '', zipCode: '', country: '' };
  };

  const addressData = parseAddress(initialData?.address);

  const formik = useFormik({
    initialValues: {
      phone: initialData?.phone || '',
      country: initialData?.country || '',
      street: addressData.street || '',
      city: addressData.city || '',
      state: addressData.state || '',
      zipCode: addressData.zipCode || '',
      addressCountry: addressData.country || '',
    },
    validationSchema: contactInfoSchema,
    onSubmit: (values) => {
      // Combine address fields into an object
      const { street, city, state, zipCode, addressCountry, ...rest } = values;
      const addressObject = {
        street,
        city,
        state,
        zipCode,
        country: addressCountry,
      };
      
      onSubmit({
        ...rest,
        address: addressObject,
      });
    },
    enableReinitialize: true,
  });

  return (
    <Card className="rounded-2xl border border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Contact Information</CardTitle>
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

          {/* Address Section */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Address Information</h3>
              
              {/* Street Address */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  name="street"
                  type="text"
                  placeholder="Enter street address"
                  value={formik.values.street}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={formik.touched.street && formik.errors.street ? 'border-red-500' : ''}
                />
                {formik.touched.street && formik.errors.street && (
                  <p className="text-sm text-red-500">{formik.errors.street}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="Enter city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={formik.touched.city && formik.errors.city ? 'border-red-500' : ''}
                  />
                  {formik.touched.city && formik.errors.city && (
                    <p className="text-sm text-red-500">{formik.errors.city}</p>
                  )}
                </div>

                {/* State/Province */}
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="Enter state or province"
                    value={formik.values.state}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={formik.touched.state && formik.errors.state ? 'border-red-500' : ''}
                  />
                  {formik.touched.state && formik.errors.state && (
                    <p className="text-sm text-red-500">{formik.errors.state}</p>
                  )}
                </div>

                {/* ZIP/Postal Code */}
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    placeholder="Enter ZIP or postal code"
                    value={formik.values.zipCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={formik.touched.zipCode && formik.errors.zipCode ? 'border-red-500' : ''}
                  />
                  {formik.touched.zipCode && formik.errors.zipCode && (
                    <p className="text-sm text-red-500">{formik.errors.zipCode}</p>
                  )}
                </div>

                {/* Address Country */}
                <div className="space-y-2">
                  <Label htmlFor="addressCountry">Country</Label>
                  <Input
                    id="addressCountry"
                    name="addressCountry"
                    type="text"
                    placeholder="Enter country"
                    value={formik.values.addressCountry}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={formik.touched.addressCountry && formik.errors.addressCountry ? 'border-red-500' : ''}
                  />
                  {formik.touched.addressCountry && formik.errors.addressCountry && (
                    <p className="text-sm text-red-500">{formik.errors.addressCountry}</p>
                  )}
                </div>
              </div>
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