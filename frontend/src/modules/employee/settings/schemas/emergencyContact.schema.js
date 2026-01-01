import * as yup from 'yup';

export const emergencyContactSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  relationship: yup
    .string()
    .required('Relationship is required')
    .oneOf(
      ['spouse', 'parent', 'child', 'sibling', 'friend', 'colleague', 'other'],
      'Please select a valid relationship'
    ),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[+]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  alternatePhone: yup
    .string()
    .matches(/^[+]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .nullable(),
  address: yup
    .string()
    .max(500, 'Address must not exceed 500 characters'),
  isPrimary: yup
    .boolean()
    .default(false)
});