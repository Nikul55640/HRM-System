import * as yup from 'yup';

export const personalInfoSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),
  gender: yup
    .string()
    .oneOf(['male', 'female', 'other'], 'Please select a valid gender'),
  dateOfBirth: yup
    .date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .test('age', 'Must be at least 16 years old', function(value) {
      if (!value) return true;
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 16;
      }
      return age >= 16;
    }),
  maritalStatus: yup
    .string()
    .oneOf(['single', 'married', 'divorced', 'widowed'], 'Please select a valid marital status'),
  about: yup
    .string()
    .max(500, 'About section must not exceed 500 characters')
});

export const contactInfoSchema = yup.object({
  phone: yup
    .string()
    .matches(/^[+]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  country: yup
    .string()
    .max(100, 'Country name must not exceed 100 characters'),
  address: yup
    .string()
    .max(500, 'Address must not exceed 500 characters')
});

export const profilePhotoSchema = yup.object({
  file: yup
    .mixed()
    .test('fileSize', 'File size must be less than 2MB', (value) => {
      if (!value) return true;
      return value.size <= 2 * 1024 * 1024; // 2MB
    })
    .test('fileType', 'Only JPG and PNG files are allowed', (value) => {
      if (!value) return true;
      return ['image/jpeg', 'image/jpg', 'image/png'].includes(value.type);
    })
});