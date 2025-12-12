/**
 * Employee Self-Service Validation Schemas
 * Using Zod for form validation
 */

import { z } from 'zod';

// Personal Information Schema
export const personalInfoSchema = z.object({
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  alternatePhone: z.string().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal('')),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(5, 'Valid zip code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  }),
});

// Bank Details Schema
export const bankDetailsSchema = z.object({
  accountNumber: z.string().min(8, 'Account number must be at least 8 digits'),
  accountNumberConfirm: z.string().min(8, 'Please confirm account number'),
  bankName: z.string().min(1, 'Bank name is required'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  accountHolderName: z.string().min(1, 'Account holder name is required'),
}).refine((data) => data.accountNumber === data.accountNumberConfirm, {
  message: 'Account numbers do not match',
  path: ['accountNumberConfirm'],
});

// Document Upload Schema
export const documentUploadSchema = z.object({
  type: z.enum(['id_proof', 'address_proof', 'education', 'other'], {
    required_error: 'Document type is required',
  }),
  file: z.instanceof(File, { message: 'File is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type),
      'Only PDF, JPG, and PNG files are allowed'
    ),
});

// Reimbursement Request Schema
export const reimbursementSchema = z.object({
  expenseType: z.string().min(1, 'Expense type is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  expenseDate: z.date({ required_error: 'Expense date is required' }),
  receipts: z.array(z.instanceof(File))
    .min(1, 'At least one receipt is required')
    .refine(
      (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
      'Each file must be less than 5MB'
    )
    .refine(
      (files) => files.every((file) => 
        ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
      ),
      'Only PDF, JPG, and PNG files are allowed'
    ),
});

// Advance Request Schema
export const advanceRequestSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  reason: z.string().min(20, 'Reason must be at least 20 characters'),
  repaymentMonths: z.number().int().min(1).max(12, 'Repayment period must be between 1 and 12 months'),
});

// Transfer Request Schema
export const transferRequestSchema = z.object({
  requestedDepartment: z.string().min(1, 'Department is required'),
  requestedLocation: z.string().min(1, 'Location is required'),
  reason: z.string().min(20, 'Reason must be at least 20 characters'),
  preferredDate: z.date({ required_error: 'Preferred date is required' }),
});

// Shift Change Request Schema
export const shiftChangeSchema = z.object({
  requestedShift: z.string().min(1, 'Shift is required'),
  reason: z.string().min(20, 'Reason must be at least 20 characters'),
  effectiveDate: z.date({ required_error: 'Effective date is required' }),
});

// Leave Application Schema
export const leaveApplicationSchema = z.object({
  leaveType: z.string().min(1, 'Leave type is required'),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  reason: z.string().min(5, 'Reason is required'),
  isHalfDay: z.boolean().optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
});

// Export all schemas
export const essSchemas = {
  personalInfo: personalInfoSchema,
  bankDetails: bankDetailsSchema,
  documentUpload: documentUploadSchema,
  reimbursement: reimbursementSchema,
  advanceRequest: advanceRequestSchema,
  transferRequest: transferRequestSchema,
  shiftChange: shiftChangeSchema,
  leaveApplication: leaveApplicationSchema,
};
