import { useFormik } from "formik";
import * as Yup from "yup";

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
import { Calendar } from "lucide-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../../shared/ui/popover";

import { Calendar as ShadCalendar } from "../../../shared/ui/calendar";

import useOrganizationStore from "../../../stores/useOrganizationStore";

const HolidayModal = ({ open, holiday, onClose }) => {
  const { createHoliday, updateHoliday, fetchHolidays } = useOrganizationStore();

  /** ⬇ Validation Schema */
  const validationSchema = Yup.object({
    name: Yup.string().required("Holiday name is required"),
    date: Yup.date().required("Holiday date is required"),
    type: Yup.string().required("Holiday type is required"),
    description: Yup.string().max(300, "Max 300 characters"),
    isPaid: Yup.boolean(),
  });

  /** ⬇ Formik Setup */
  const formik = useFormik({
    initialValues: {
      name: holiday?.name || "",
      date: holiday?.date ? new Date(holiday.date) : null,
      type: holiday?.type || "",
      description: holiday?.description || "",
      isPaid: holiday?.isPaid ?? true,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        ...values,
        date: values.date?.toISOString(),
      };

      try {
        if (holiday) {
          await updateHoliday(holiday._id, payload);
        } else {
          await createHoliday(payload);
        }

        fetchHolidays();
        onClose();
      } catch (error) {
        console.error("Failed to save holiday:", error);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{holiday ? "Edit Holiday" : "Add Holiday"}</DialogTitle>
          <DialogDescription>
            {holiday
              ? "Update holiday details"
              : "Create a new company holiday"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* HOLIDAY NAME */}
          <div className="space-y-1">
            <Label>Holiday Name *</Label>
            <Input
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              className={formik.errors.name ? "border-red-500" : ""}
              placeholder="e.g., Diwali"
            />
            {formik.errors.name && (
              <p className="text-sm text-red-500">{formik.errors.name}</p>
            )}
          </div>

          {/* DATE PICKER */}
          <div className="space-y-1">
            <Label>Holiday Date *</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className={`w-full justify-start text-left font-normal ${
                    formik.errors.date ? "border-red-500" : ""
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {formik.values.date
                    ? formik.values.date.toDateString()
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0">
                <ShadCalendar
                  mode="single"
                  selected={formik.values.date}
                  onSelect={(d) => formik.setFieldValue("date", d)}
                />
              </PopoverContent>
            </Popover>

            {formik.errors.date && (
              <p className="text-sm text-red-500">{formik.errors.date}</p>
            )}
          </div>

          {/* HOLIDAY TYPE */}
          <div className="space-y-1">
            <Label>Holiday Type *</Label>
            <select
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
              className={`w-full border rounded-md px-3 py-2 ${
                formik.errors.type ? "border-red-500" : ""
              }`}
            >
              <option value="">Select type</option>
              <option value="public">Public Holiday</option>
              <option value="optional">Optional Holiday</option>
              <option value="national">National Holiday</option>
              <option value="religious">Religious Holiday</option>
            </select>

            {formik.errors.type && (
              <p className="text-sm text-red-500">{formik.errors.type}</p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              name="description"
              rows={3}
              placeholder="Add description (optional)"
              value={formik.values.description}
              onChange={formik.handleChange}
              className={formik.errors.description ? "border-red-500" : ""}
            />
            {formik.errors.description && (
              <p className="text-sm text-red-500">
                {formik.errors.description}
              </p>
            )}
          </div>

          {/* PAID OR UNPAID */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPaid"
              checked={formik.values.isPaid}
              onCheckedChange={(value) =>
                formik.setFieldValue("isPaid", value === true)
              }
            />
            <Label htmlFor="isPaid">Paid Holiday</Label>
          </div>

          {/* FOOTER */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit">
              {holiday ? "Update Holiday" : "Create Holiday"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HolidayModal;
