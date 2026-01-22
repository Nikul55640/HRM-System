import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../shared/ui/dialog";

import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Textarea } from "../../../shared/ui/textarea";
import { Label } from "../../../shared/ui/label";
import { Checkbox } from "../../../shared/ui/checkbox";
import { Calendar, Info, AlertCircle, CheckCircle2, Loader2, Palette, Eye } from "lucide-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../../shared/ui/popover";

import { Calendar as ShadCalendar } from "../../../shared/ui/calendar";
import { Badge } from "../../../shared/ui/badge";
import { Alert, AlertDescription } from "../../../shared/ui/alert";

import { api } from "../../../services";

const HolidayModal = ({ open, holiday, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Predefined holiday colors for quick selection
  const predefinedColors = [
    { name: 'Red', value: '#dc2626', description: 'National holidays' },
    { name: 'Orange', value: '#ea580c', description: 'Cultural events' },
    { name: 'Yellow', value: '#ca8a04', description: 'Optional holidays' },
    { name: 'Green', value: '#16a34a', description: 'Company events' },
    { name: 'Blue', value: '#2563eb', description: 'Public holidays' },
    { name: 'Purple', value: '#9333ea', description: 'Religious holidays' },
    { name: 'Pink', value: '#db2777', description: 'Special occasions' },
    { name: 'Gray', value: '#6b7280', description: 'Other holidays' }
  ];

  /** ⬇ Validation Schema */
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, "Holiday name must be at least 2 characters")
      .max(100, "Holiday name must be less than 100 characters")
      .required("Holiday name is required"),
    holidayType: Yup.string()
      .oneOf(['ONE_TIME', 'RECURRING'], "Invalid holiday type")
      .required("Holiday type is required"),
    date: Yup.date().when('holidayType', {
      is: 'ONE_TIME',
      then: (schema) => schema
        .required("Holiday date is required for one-time holidays")
        .min(new Date(new Date().setHours(0, 0, 0, 0)), "Holiday date cannot be in the past"),
      otherwise: (schema) => schema.nullable()
    }),
    recurringDate: Yup.string().when('holidayType', {
      is: 'RECURRING',
      then: (schema) => schema
        .required("Recurring date is required for recurring holidays")
        .matches(/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, "Date must be in MM-DD format")
        .test('valid-date', 'Invalid date', function(value) {
          if (!value) return true;
          const [month, day] = value.split('-').map(Number);
          const date = new Date(2024, month - 1, day);
          return date.getMonth() === month - 1 && date.getDate() === day;
        }),
      otherwise: (schema) => schema.nullable()
    }),
    category: Yup.string()
      .oneOf(['public', 'optional', 'national', 'religious', 'company'], "Invalid category")
      .required("Holiday category is required"),
    description: Yup.string().max(300, "Description must be less than 300 characters"),
    isPaid: Yup.boolean(),
    color: Yup.string()
      .matches(/^#[0-9A-F]{6}$/i, "Color must be a valid hex code")
      .required("Holiday color is required"),
  });

  /** ⬇ Formik Setup */
  const formik = useFormik({
    initialValues: {
      name: holiday?.name || "",
      holidayType: holiday?.type || "ONE_TIME",
      date: holiday?.date && holiday.type === 'ONE_TIME' ? new Date(holiday.date) : null,
      recurringDate: holiday?.recurringDate || "",
      category: holiday?.category || "public",
      description: holiday?.description || "",
      isPaid: holiday?.isPaid ?? true,
      color: holiday?.color || "#dc2626",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setValidationErrors({});
      
      // Additional client-side validation before submission
      if (values.holidayType === 'RECURRING' && (!values.recurringDate || values.recurringDate.trim() === '')) {
        setValidationErrors({ recurringDate: 'Recurring date is required for recurring holidays' });
        setIsSubmitting(false);
        toast.error('Please provide a recurring date in MM-DD format for recurring holidays');
        return;
      }
      
      if (values.holidayType === 'ONE_TIME' && !values.date) {
        setValidationErrors({ date: 'Date is required for one-time holidays' });
        setIsSubmitting(false);
        toast.error('Please select a date for one-time holidays');
        return;
      }
      
      const payload = {
        name: values.name.trim(),
        type: values.holidayType,
        category: values.category,
        description: values.description.trim(),
        isPaid: values.isPaid,
        color: values.color,
        appliesEveryYear: values.holidayType === 'RECURRING',
        isActive: true
      };

      // Add date fields based on holiday type
      if (values.holidayType === 'ONE_TIME') {
        payload.date = values.date?.toISOString().split('T')[0]; // YYYY-MM-DD format
        payload.recurringDate = null;
      } else {
        payload.recurringDate = values.recurringDate.trim();
        payload.date = null;
      }

      console.log('🔍 Holiday form submission:', {
        isEditing: !!holiday,
        holidayId: holiday?._id || holiday?.id,
        payload: payload
      });

      try {
        let result;
        if (holiday) {
          result = await api.put(`/admin/holidays/${holiday._id || holiday.id}`, payload);
        } else {
          result = await api.post('/admin/holidays', payload);
        }

        if (result.data.success) {
          toast.success(
            holiday ? 'Holiday updated successfully!' : 'Holiday created successfully!',
            { 
              position: 'top-right',
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
            }
          );
          if (onSuccess) onSuccess();
          onClose();
          formik.resetForm();
        } else {
          console.error("Failed to save holiday:", result.data.message);
          // Show specific validation errors if available
          if (result.data.errors && Array.isArray(result.data.errors)) {
            const errors = {};
            result.data.errors.forEach(err => {
              errors[err.field] = err.message;
            });
            setValidationErrors(errors);
          } else {
            toast.error(result.data.message || 'Failed to save holiday', { 
              position: 'top-right',
              autoClose: 5000,
            });
          }
        }
      } catch (error) {
        console.error("Failed to save holiday:", error);
        
        // Handle validation errors from server
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          const errors = {};
          error.response.data.errors.forEach(err => {
            errors[err.field] = err.message;
          });
          setValidationErrors(errors);
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message, { 
            position: 'top-right',
            autoClose: 5000,
          });
        } else {
          toast.error('Failed to save holiday. Please check your connection and try again.', { 
            position: 'top-right',
            autoClose: 5000,
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Clear validation errors when form values change
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors({});
    }
  }, [validationErrors]);

  // Helper function to get category badge color and info
  const getCategoryInfo = (category) => {
    const categoryMap = {
      public: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        description: 'Government declared public holidays',
        icon: '🏛️'
      },
      optional: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        description: 'Optional holidays employees can choose',
        icon: '⚡'
      },
      national: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        description: 'National holidays and independence days',
        icon: '🇮🇳'
      },
      religious: { 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        description: 'Religious festivals and observances',
        icon: '🕉️'
      },
      company: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        description: 'Company-specific holidays and events',
        icon: '🏢'
      }
    };
    return categoryMap[category] || { 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      description: 'Other holidays',
      icon: '📅'
    };
  };

  // Helper function to validate and format recurring date
  const validateAndFormatRecurringDate = (value) => {
    if (!value) return { isValid: false, formatted: '', preview: '' };
    
    const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (!regex.test(value)) {
      return { isValid: false, formatted: value, preview: 'Invalid format' };
    }
    
    const [month, day] = value.split('-').map(Number);
    const date = new Date(2024, month - 1, day);
    const isValidDate = date.getMonth() === month - 1 && date.getDate() === day;
    
    if (!isValidDate) {
      return { isValid: false, formatted: value, preview: 'Invalid date' };
    }
    
    const preview = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    return { isValid: true, formatted: value, preview: `${preview} (every year)` };
  };

  // Helper function to get form field error (client or server)
  const getFieldError = (fieldName) => {
    return formik.errors[fieldName] || validationErrors[fieldName];
  };

  // Helper function to check if field has error
  const hasFieldError = (fieldName) => {
    return !!(formik.errors[fieldName] || validationErrors[fieldName]);
  };

  const recurringDateInfo = validateAndFormatRecurringDate(formik.values.recurringDate);
  const categoryInfo = getCategoryInfo(formik.values.category);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {holiday ? "Edit Holiday" : "Add Holiday"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {holiday
              ? "Update holiday details and settings"
              : "Create a new company holiday with all necessary details"}
          </DialogDescription>
        </DialogHeader>

        {/* Show server validation errors */}
        {Object.keys(validationErrors).length > 0 && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Please fix the following errors:
              <ul className="mt-2 list-disc list-inside space-y-1">
                {Object.entries(validationErrors).map(([field, message]) => (
                  <li key={field} className="text-sm">{message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* HOLIDAY NAME */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              Holiday Name *
              {formik.values.name && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
            </Label>
            <Input
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full h-10 text-sm transition-colors ${
                hasFieldError('name') 
                  ? "border-red-500 focus:border-red-500" 
                  : formik.values.name 
                    ? "border-green-500 focus:border-green-500" 
                    : ""
              }`}
              placeholder="e.g., Diwali, Christmas, Independence Day"
              disabled={isSubmitting}
            />
            {getFieldError('name') && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {getFieldError('name')}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Enter a clear, descriptive name for the holiday
            </p>
          </div>

          {/* HOLIDAY TYPE (ONE_TIME vs RECURRING) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Holiday Type *</Label>
            <select
              name="holidayType"
              value={formik.values.holidayType}
              onChange={(e) => {
                formik.handleChange(e);
                // Clear the opposite field when switching types
                if (e.target.value === 'ONE_TIME') {
                  formik.setFieldValue('recurringDate', '');
                } else {
                  formik.setFieldValue('date', null);
                }
              }}
              onBlur={formik.handleBlur}
              disabled={isSubmitting}
              className={`w-full h-10 border rounded-md px-3 py-2 text-sm bg-white transition-colors ${
                hasFieldError('holidayType') ? "border-red-500" : "border-gray-300 focus:border-primary"
              }`}
            >
              <option value="ONE_TIME">One-Time Holiday (specific year)</option>
              <option value="RECURRING">Recurring Holiday (every year)</option>
            </select>
            {getFieldError('holidayType') && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {getFieldError('holidayType')}
              </p>
            )}
            <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">
                  {formik.values.holidayType === 'ONE_TIME' ? 'One-Time Holiday' : 'Recurring Holiday'}
                </p>
                <p className="leading-relaxed">
                  {formik.values.holidayType === 'ONE_TIME' 
                    ? 'This holiday will only occur on the specific date you choose (e.g., Company Anniversary 2024).'
                    : 'This holiday will occur every year on the same month and day (e.g., December 25 for Christmas).'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* DATE PICKER - Only for ONE_TIME holidays */}
          {formik.values.holidayType === 'ONE_TIME' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                Holiday Date *
                {formik.values.date && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isSubmitting}
                    className={`w-full h-10 justify-start text-left font-normal transition-colors ${
                      hasFieldError('date') 
                        ? "border-red-500 hover:border-red-500" 
                        : formik.values.date 
                          ? "border-green-500 hover:border-green-500" 
                          : ""
                    }`}
                  >
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {formik.values.date
                        ? formik.values.date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : "Pick a specific date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <ShadCalendar
                    mode="single"
                    selected={formik.values.date}
                    onSelect={(d) => formik.setFieldValue("date", d)}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {getFieldError('date') && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError('date')}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Select the specific date when this holiday will occur
              </p>
            </div>
          )}

          {/* RECURRING DATE INPUT - Only for RECURRING holidays */}
          {formik.values.holidayType === 'RECURRING' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                Recurring Date (MM-DD) *
                {recurringDateInfo.isValid && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
              </Label>
              <Input
                name="recurringDate"
                value={formik.values.recurringDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isSubmitting}
                className={`w-full h-10 text-sm transition-colors ${
                  hasFieldError('recurringDate') 
                    ? "border-red-500 focus:border-red-500" 
                    : recurringDateInfo.isValid 
                      ? "border-green-500 focus:border-green-500" 
                      : ""
                }`}
                placeholder="e.g., 12-25 for December 25th"
                maxLength={5}
              />
              {recurringDateInfo.isValid && (
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="font-medium">Preview: {recurringDateInfo.preview}</span>
                  </div>
                </div>
              )}
              {getFieldError('recurringDate') && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError('recurringDate')}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Format: MM-DD (e.g., 01-01 for New Year, 12-25 for Christmas)
              </p>
            </div>
          )}

          {/* HOLIDAY CATEGORY */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Holiday Category *</Label>
            <select
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isSubmitting}
              className={`w-full h-10 border rounded-md px-3 py-2 text-sm bg-white transition-colors ${
                hasFieldError('category') ? "border-red-500" : "border-gray-300 focus:border-primary"
              }`}
            >
              <option value="public">🏛️ Public Holiday</option>
              <option value="optional">⚡ Optional Holiday</option>
              <option value="national">🇮🇳 National Holiday</option>
              <option value="religious">🕉️ Religious Holiday</option>
              <option value="company">🏢 Company Holiday</option>
            </select>
            {getFieldError('category') && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {getFieldError('category')}
              </p>
            )}
            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
              <span className="text-lg">{categoryInfo.icon}</span>
              <div className="text-xs text-gray-700">
                <p className="font-medium">{formik.values.category.charAt(0).toUpperCase() + formik.values.category.slice(1)} Holiday</p>
                <p>{categoryInfo.description}</p>
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Description 
              <span className="text-gray-400 font-normal">
                ({formik.values.description.length}/300)
              </span>
            </Label>
            <Textarea
              name="description"
              rows={3}
              placeholder="Add description, significance, or special instructions (optional)"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isSubmitting}
              className={`w-full text-sm resize-none transition-colors ${
                hasFieldError('description') ? "border-red-500 focus:border-red-500" : ""
              }`}
              maxLength={300}
            />
            {getFieldError('description') && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {getFieldError('description')}
              </p>
            )}
          </div>

          {/* COLOR PICKER */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Palette className="w-4 h-4" />
              Holiday Color
            </Label>
            <div className="space-y-3">
              {/* Quick color selection */}
              <div className="grid grid-cols-4 gap-2">
                {predefinedColors.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => formik.setFieldValue('color', colorOption.value)}
                    className={`flex items-center gap-2 p-2 rounded border text-xs transition-all hover:scale-105 ${
                      formik.values.color === colorOption.value 
                        ? 'border-gray-800 bg-gray-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={colorOption.description}
                  >
                    <div 
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: colorOption.value }}
                    />
                    <span className="truncate">{colorOption.name}</span>
                  </button>
                ))}
              </div>
              
              {/* Custom color input */}
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="color"
                  value={formik.values.color}
                  onChange={formik.handleChange}
                  disabled={isSubmitting}
                  className="w-12 h-10 border rounded cursor-pointer flex-shrink-0 disabled:opacity-50"
                />
                <Input
                  name="color"
                  value={formik.values.color}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isSubmitting}
                  className={`flex-1 h-10 text-sm transition-colors ${
                    hasFieldError('color') ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  placeholder="#dc2626"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </Button>
              </div>
              
              {showPreview && (
                <div className="p-3 border rounded bg-gray-50">
                  <p className="text-xs text-gray-600 mb-2">Calendar Preview:</p>
                  <div 
                    className="inline-block px-3 py-1 rounded text-white text-sm font-medium"
                    style={{ backgroundColor: formik.values.color }}
                  >
                    {formik.values.name || 'Holiday Name'}
                  </div>
                </div>
              )}
            </div>
            {getFieldError('color') && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {getFieldError('color')}
              </p>
            )}
            <p className="text-xs text-gray-500">
              This color will be used to display the holiday in calendars and schedules
            </p>
          </div>

          {/* PAID OR UNPAID */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3 p-3 border rounded bg-gray-50">
              <Checkbox
                id="isPaid"
                checked={formik.values.isPaid}
                onCheckedChange={(value) =>
                  formik.setFieldValue("isPaid", value === true)
                }
                disabled={isSubmitting}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <Label htmlFor="isPaid" className="text-sm font-medium cursor-pointer">
                  Paid Holiday
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  {formik.values.isPaid 
                    ? "Employees will receive regular pay for this holiday" 
                    : "This is an unpaid holiday - employees won't receive regular pay"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>

            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto order-1 sm:order-2 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting 
                ? (holiday ? "Updating..." : "Creating...") 
                : (holiday ? "Update Holiday" : "Create Holiday")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HolidayModal;