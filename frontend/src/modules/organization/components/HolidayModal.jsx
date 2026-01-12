import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from 'react-toastify';

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
import { Calendar, Info } from "lucide-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../../shared/ui/popover";

import { Calendar as ShadCalendar } from "../../../shared/ui/calendar";

import { api } from "../../../services";

const HolidayModal = ({ open, holiday, onClose, onSuccess }) => {
  /** ⬇ Validation Schema */
  const validationSchema = Yup.object({
    name: Yup.string().required("Holiday name is required"),
    holidayType: Yup.string().required("Holiday type is required"),
    date: Yup.date().when('holidayType', {
      is: 'ONE_TIME',
      then: (schema) => schema.required("Holiday date is required for one-time holidays"),
      otherwise: (schema) => schema.nullable()
    }),
    recurringDate: Yup.string().when('holidayType', {
      is: 'RECURRING',
      then: (schema) => schema
        .required("Recurring date is required for recurring holidays")
        .matches(/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, "Date must be in MM-DD format"),
      otherwise: (schema) => schema.nullable()
    }),
    category: Yup.string().required("Holiday category is required"),
    description: Yup.string().max(300, "Max 300 characters"),
    isPaid: Yup.boolean(),
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
      const payload = {
        name: values.name,
        type: values.holidayType,
        category: values.category,
        description: values.description,
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
        payload.recurringDate = values.recurringDate;
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
          toast.success(holiday ? 'Holiday updated successfully!' : 'Holiday created successfully!');
          if (onSuccess) onSuccess();
          onClose();
        } else {
          console.error("Failed to save holiday:", result.data.message);
          // Show specific validation errors if available
          if (result.data.errors && Array.isArray(result.data.errors)) {
            const errorMessages = result.data.errors.map(err => `${err.field}: ${err.message}`);
            errorMessages.forEach(msg => toast.error(msg));
          } else {
            toast.error(result.data.message || 'Failed to save holiday');
          }
        }
      } catch (error) {
        console.error("Failed to save holiday:", error);
        
        // Handle validation errors from server
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          const errorMessages = error.response.data.errors.map(err => `${err.field}: ${err.message}`);
          errorMessages.forEach(msg => toast.error(msg));
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Failed to save holiday. Please try again.');
        }
      }
    },
  });

  // Helper function to format recurring date for display
  const formatRecurringDate = (mmdd) => {
    if (!mmdd || !mmdd.match(/^\d{2}-\d{2}$/)) return "";
    const [month, day] = mmdd.split('-');
    const date = new Date(2024, parseInt(month) - 1, parseInt(day)); // Use 2024 as example year
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            {holiday ? "Edit Holiday" : "Add Holiday"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {holiday
              ? "Update holiday details"
              : "Create a new company holiday"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4 sm:space-y-5">
          {/* HOLIDAY NAME */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Holiday Name *</Label>
            <Input
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              className={`w-full h-10 sm:h-11 text-sm ${formik.errors.name ? "border-red-500" : ""}`}
              placeholder="e.g., Diwali, Christmas, Independence Day"
            />
            {formik.errors.name && (
              <p className="text-xs sm:text-sm text-red-500">{formik.errors.name}</p>
            )}
          </div>

          {/* HOLIDAY TYPE (ONE_TIME vs RECURRING) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Holiday Type *</Label>
            <select
              name="holidayType"
              value={formik.values.holidayType}
              onChange={formik.handleChange}
              className={`w-full h-10 sm:h-11 border rounded-md px-3 py-2 text-sm bg-white ${
                formik.errors.holidayType ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="ONE_TIME">One-Time Holiday (specific year)</option>
              <option value="RECURRING">Recurring Holiday (every year)</option>
            </select>
            {formik.errors.holidayType && (
              <p className="text-xs sm:text-sm text-red-500">{formik.errors.holidayType}</p>
            )}
            <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 rounded-md">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-blue-800">
                <p className="font-medium mb-1">
                  {formik.values.holidayType === 'ONE_TIME' ? 'One-Time Holiday' : 'Recurring Holiday'}
                </p>
                <p className="leading-relaxed">
                  {formik.values.holidayType === 'ONE_TIME' 
                    ? 'This holiday will only occur on the specific date you choose.'
                    : 'This holiday will occur every year on the same month and day (e.g., December 25 for Christmas).'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* DATE PICKER - Only for ONE_TIME holidays */}
          {formik.values.holidayType === 'ONE_TIME' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Holiday Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className={`w-full h-10 sm:h-11 justify-start text-left font-normal ${
                      formik.errors.date ? "border-red-500" : ""
                    }`}
                  >
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {formik.values.date
                        ? formik.values.date.toDateString()
                        : "Pick a specific date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <ShadCalendar
                    mode="single"
                    selected={formik.values.date}
                    onSelect={(d) => formik.setFieldValue("date", d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formik.errors.date && (
                <p className="text-xs sm:text-sm text-red-500">{formik.errors.date}</p>
              )}
            </div>
          )}

          {/* RECURRING DATE INPUT - Only for RECURRING holidays */}
          {formik.values.holidayType === 'RECURRING' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Recurring Date (MM-DD) *</Label>
              <Input
                name="recurringDate"
                value={formik.values.recurringDate}
                onChange={formik.handleChange}
                className={`w-full h-10 sm:h-11 text-sm ${formik.errors.recurringDate ? "border-red-500" : ""}`}
                placeholder="e.g., 12-25 for December 25th"
                maxLength={5}
              />
              {formik.values.recurringDate && formik.values.recurringDate.match(/^\d{2}-\d{2}$/) && (
                <p className="text-xs sm:text-sm text-green-600 bg-green-50 p-2 rounded">
                  Preview: {formatRecurringDate(formik.values.recurringDate)} (every year)
                </p>
              )}
              {formik.errors.recurringDate && (
                <p className="text-xs sm:text-sm text-red-500">{formik.errors.recurringDate}</p>
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
              className={`w-full h-10 sm:h-11 border rounded-md px-3 py-2 text-sm bg-white ${
                formik.errors.category ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="public">Public Holiday</option>
              <option value="optional">Optional Holiday</option>
              <option value="national">National Holiday</option>
              <option value="religious">Religious Holiday</option>
              <option value="company">Company Holiday</option>
            </select>
            {formik.errors.category && (
              <p className="text-xs sm:text-sm text-red-500">{formik.errors.category}</p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              name="description"
              rows={3}
              placeholder="Add description (optional)"
              value={formik.values.description}
              onChange={formik.handleChange}
              className={`w-full text-sm resize-none ${formik.errors.description ? "border-red-500" : ""}`}
            />
            {formik.errors.description && (
              <p className="text-xs sm:text-sm text-red-500">
                {formik.errors.description}
              </p>
            )}
          </div>

          {/* COLOR PICKER */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Holiday Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="color"
                value={formik.values.color}
                onChange={formik.handleChange}
                className="w-12 h-10 sm:h-11 border rounded cursor-pointer flex-shrink-0"
              />
              <Input
                name="color"
                value={formik.values.color}
                onChange={formik.handleChange}
                className="flex-1 h-10 sm:h-11 text-sm"
                placeholder="#dc2626"
              />
            </div>
            <p className="text-xs text-gray-500">
              This color will be used to display the holiday in calendars
            </p>
          </div>

          {/* PAID OR UNPAID */}
          <div className="flex items-center space-x-3 py-2">
            <Checkbox
              id="isPaid"
              checked={formik.values.isPaid}
              onCheckedChange={(value) =>
                formik.setFieldValue("isPaid", value === true)
              }
              className="w-4 h-4"
            />
            <Label htmlFor="isPaid" className="text-sm font-medium cursor-pointer">
              Paid Holiday
            </Label>
          </div>

          {/* FOOTER */}
          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>

            <Button 
              type="submit"
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {holiday ? "Update Holiday" : "Create Holiday"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HolidayModal;
