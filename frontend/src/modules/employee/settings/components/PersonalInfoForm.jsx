import React from 'react';
import { useFormik } from 'formik';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Input } from '../../../../shared/ui/input';
import { Label } from '../../../../shared/ui/label';
import { Textarea } from '../../../../shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../shared/ui/select';
import { personalInfoSchema } from '../schemas/profile.schema';

const PersonalInfoForm = ({ initialData, onSubmit, loading }) => {
  const formik = useFormik({
    initialValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      gender: initialData?.gender || '',
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
      maritalStatus: initialData?.maritalStatus || '',
      nationality: initialData?.nationality || '',
      bloodGroup: initialData?.bloodGroup || '',
      about: initialData?.about || '',
    },
    validationSchema: personalInfoSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
    enableReinitialize: true,
  });

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const maritalStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
  ];

  const bloodGroupOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
  ];

  return (
    <Card className="rounded-2xl border border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Enter your first name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.firstName && formik.errors.firstName ? 'border-red-500' : ''}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="text-sm text-red-500">{formik.errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Enter your last name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.lastName && formik.errors.lastName ? 'border-red-500' : ''}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="text-sm text-red-500">{formik.errors.lastName}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formik.values.gender}
                onValueChange={(value) => formik.setFieldValue('gender', value)}
              >
                <SelectTrigger className={formik.touched.gender && formik.errors.gender ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.gender && formik.errors.gender && (
                <p className="text-sm text-red-500">{formik.errors.gender}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formik.values.dateOfBirth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.dateOfBirth && formik.errors.dateOfBirth ? 'border-red-500' : ''}
              />
              {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                <p className="text-sm text-red-500">{formik.errors.dateOfBirth}</p>
              )}
            </div>

            {/* Marital Status */}
            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <Select
                value={formik.values.maritalStatus}
                onValueChange={(value) => formik.setFieldValue('maritalStatus', value)}
              >
                <SelectTrigger className={formik.touched.maritalStatus && formik.errors.maritalStatus ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  {maritalStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.maritalStatus && formik.errors.maritalStatus && (
                <p className="text-sm text-red-500">{formik.errors.maritalStatus}</p>
              )}
            </div>

            {/* Nationality */}
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                name="nationality"
                type="text"
                placeholder="Enter your nationality"
                value={formik.values.nationality}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.nationality && formik.errors.nationality ? 'border-red-500' : ''}
              />
              {formik.touched.nationality && formik.errors.nationality && (
                <p className="text-sm text-red-500">{formik.errors.nationality}</p>
              )}
            </div>

            {/* Blood Group */}
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select
                value={formik.values.bloodGroup}
                onValueChange={(value) => formik.setFieldValue('bloodGroup', value)}
              >
                <SelectTrigger className={formik.touched.bloodGroup && formik.errors.bloodGroup ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroupOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.bloodGroup && formik.errors.bloodGroup && (
                <p className="text-sm text-red-500">{formik.errors.bloodGroup}</p>
              )}
            </div>
          </div>

          {/* About Me */}
          <div className="space-y-2">
            <Label htmlFor="about">About Me</Label>
            <Textarea
              id="about"
              name="about"
              placeholder="Tell us about yourself..."
              rows={4}
              value={formik.values.about}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.about && formik.errors.about ? 'border-red-500' : ''}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>
                {formik.touched.about && formik.errors.about && (
                  <span className="text-red-500">{formik.errors.about}</span>
                )}
              </span>
              <span>{formik.values.about.length}/500</span>
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

export default PersonalInfoForm;