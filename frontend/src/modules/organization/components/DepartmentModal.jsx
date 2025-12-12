import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Textarea } from "../../../shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/ui/select";
import { Checkbox } from "../../../shared/ui/checkbox";
import { Loader2 } from "lucide-react";

const DepartmentModal = ({
  open,
  department,
  departments,
  onSubmit,
  onClose,
  isSubmitting,
}) => {
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Department name is required")
      .max(100, "Name too long"),
    code: Yup.string().max(20, "Code too long"),
    description: Yup.string().max(500, "Description too long"),
    location: Yup.string().max(100, "Location too long"),
    parentDepartment: Yup.string(),
    isActive: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues: {
      name: department?.name || "",
      code: department?.code || "",
      description: department?.description || "",
      location: department?.location || "",
      parentDepartment: department?.parentDepartment?._id || "",
      isActive: department?.isActive !== undefined ? department.isActive : true,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        await onSubmit(values);
      } catch (error) {
        // Parent handles error
      }
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {department ? "Edit Department" : "Create Department"}
          </DialogTitle>
          <DialogDescription>
            {department
              ? "Update department information"
              : "Add a new department to your organization"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* NAME */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Department Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.name && formik.errors.name
                  ? "border-destructive"
                  : ""
              }
              placeholder="e.g., Human Resources"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-destructive">{formik.errors.name}</p>
            )}
          </div>

          {/* CODE */}
          <div className="space-y-2">
            <Label htmlFor="code">Department Code</Label>
            <Input
              id="code"
              name="code"
              value={formik.values.code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.code && formik.errors.code
                  ? "border-destructive"
                  : ""
              }
              placeholder="e.g., HR"
            />
            {formik.touched.code && formik.errors.code && (
              <p className="text-sm text-destructive">{formik.errors.code}</p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={3}
              className={
                formik.touched.description && formik.errors.description
                  ? "border-destructive"
                  : ""
              }
              placeholder="Brief description of the department"
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-sm text-destructive">
                {formik.errors.description}
              </p>
            )}
          </div>

          {/* LOCATION */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formik.values.location}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.location && formik.errors.location
                  ? "border-destructive"
                  : ""
              }
              placeholder="e.g., Building A, Floor 2"
            />
            {formik.touched.location && formik.errors.location && (
              <p className="text-sm text-destructive">
                {formik.errors.location}
              </p>
            )}
          </div>

          {/* PARENT DEPARTMENT */}
          <div className="space-y-2">
            <Label htmlFor="parentDepartment">Parent Department</Label>
            <Select
              value={formik.values.parentDepartment || ""}
              onValueChange={(value) =>
                formik.setFieldValue("parentDepartment", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="None (Top Level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (Top Level)</SelectItem>
                {departments
                  ?.filter((d) => d._id !== department?._id)
                  .map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* ACTIVE / INACTIVE */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formik.values.isActive}
              onCheckedChange={(checked) =>
                formik.setFieldValue("isActive", checked === true)
              }
            />
            <Label htmlFor="isActive" className="font-normal cursor-pointer">
              Active Department
            </Label>
          </div>

          {/* FOOTER BUTTONS */}
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Saving..." : department ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentModal;
