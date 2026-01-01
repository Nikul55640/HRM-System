import React from 'react';
import { useFormik } from 'formik';
import { X } from 'lucide-react';
import { Button } from '../../../../shared/ui/button';
import { Input } from '../../../../shared/ui/input';
import { Label } from '../../../../shared/ui/label';
import { Textarea } from '../../../../shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../shared/ui/select';
import { Checkbox } from '../../../../shared/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../shared/ui/dialog';
import { emergencyContactSchema } from '../schemas/emergencyContact.schema';

const EmergencyContactForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading, 
  initialData = null,
  mode = 'create' // 'create' or 'edit'
}) => {
  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      relationship: initialData?.relationship || '',
      phone: initialData?.phone || '',
      alternatePhone: initialData?.alternatePhone || '',
      address: initialData?.address || '',
      isPrimary: initialData?.isPrimary || false,
    },
    validationSchema: emergencyContactSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
    enableReinitialize: true,
  });

  const relationshipOptions = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'friend', label: 'Friend' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'other', label: 'Other' },
  ];

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{mode === 'create' ? 'Add Emergency Contact' : 'Edit Emergency Contact'}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter contact name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.name && formik.errors.name ? 'border-red-500' : ''}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-red-500">{formik.errors.name}</p>
            )}
          </div>

          {/* Relationship */}
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship *</Label>
            <Select
              value={formik.values.relationship}
              onValueChange={(value) => formik.setFieldValue('relationship', value)}
            >
              <SelectTrigger className={formik.touched.relationship && formik.errors.relationship ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {relationshipOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.relationship && formik.errors.relationship && (
              <p className="text-sm text-red-500">{formik.errors.relationship}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
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

          {/* Alternate Phone */}
          <div className="space-y-2">
            <Label htmlFor="alternatePhone">Alternate Phone</Label>
            <Input
              id="alternatePhone"
              name="alternatePhone"
              type="tel"
              placeholder="+1 (555) 987-6543"
              value={formik.values.alternatePhone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.alternatePhone && formik.errors.alternatePhone ? 'border-red-500' : ''}
            />
            {formik.touched.alternatePhone && formik.errors.alternatePhone && (
              <p className="text-sm text-red-500">{formik.errors.alternatePhone}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Enter full address..."
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

          {/* Primary Contact */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPrimary"
              checked={formik.values.isPrimary}
              onCheckedChange={(checked) => formik.setFieldValue('isPrimary', checked)}
            />
            <Label htmlFor="isPrimary" className="text-sm font-medium">
              Set as primary emergency contact
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formik.isValid}
              className="min-w-[100px]"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Add Contact' : 'Update Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyContactForm;