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
import { Loader2 } from "lucide-react";
import useOrganizationStore from "../../../stores/useOrganizationStore";

const DesignationModal = ({ open, designation, onClose }) => {
  const { createDesignation, updateDesignation, fetchDesignations } = useOrganizationStore();

  // Validation Rules
  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().max(500, "Max 500 characters"),
    level: Yup.string().required("Level is required"),
  });

  const formik = useFormik({
    initialValues: {
      title: designation?.title || "",
      description: designation?.description || "",
      level: designation?.level || "",
    },
    enableReinitialize: true, // important when editing
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (designation) {
          await updateDesignation(designation._id, values);
        } else {
          await createDesignation(values);
        }

        await fetchDesignations();
        onClose();
      } catch (error) {
        console.error("Failed to save designation:", error);
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {designation ? "Edit Designation" : "Add Designation"}
          </DialogTitle>
          <DialogDescription>
            {designation
              ? "Update the designation details."
              : "Fill out the form to create a new job designation."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* TITLE FIELD */}
          <div className="space-y-1">
            <Label>Title *</Label>
            <Input
              name="title"
              placeholder="e.g., Senior Developer"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.title && formik.errors.title
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-sm text-red-500">{formik.errors.title}</p>
            )}
          </div>

          {/* DESCRIPTION FIELD */}
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              name="description"
              rows={3}
              placeholder="e.g., Responsible for leading the development team"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.description && formik.errors.description
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-sm text-red-500">
                {formik.errors.description}
              </p>
            )}
          </div>

          {/* LEVEL FIELD */}
          <div className="space-y-1">
            <Label>Level *</Label>
            <Input
              name="level"
              placeholder="e.g., Junior, Mid, Senior, Manager"
              value={formik.values.level}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.level && formik.errors.level
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.level && formik.errors.level && (
              <p className="text-sm text-red-500">{formik.errors.level}</p>
            )}
          </div>

          {/* FOOTER BUTTONS */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting && (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              )}
              {designation ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DesignationModal;
