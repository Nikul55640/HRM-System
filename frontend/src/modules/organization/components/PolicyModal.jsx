import React, { useRef, useState } from "react";
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
import { Loader2, Upload, X } from "lucide-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../../shared/ui/popover";
import { Calendar as ShadCalendar } from "../../../shared/ui/calendar";
import useOrganizationStore from "../../../stores/useOrganizationStore";
import { toast } from "react-toastify";

const PolicyModal = ({ open, policy, onClose }) => {
  const { createPolicy, updatePolicy, fetchPolicies } = useOrganizationStore();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required").max(200),
    effectiveDate: Yup.date().required("Effective date is required"),
    category: Yup.string().max(100),
    description: Yup.string().max(1000),
    file: Yup.mixed().nullable(),
    isActive: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues: {
      title: policy?.title || "",
      effectiveDate: policy?.effectiveDate
        ? new Date(policy.effectiveDate)
        : null,
      category: policy?.category || "",
      description: policy?.description || "",
      file: null,
      isActive: policy?.isActive ?? true,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = new FormData();
        payload.append("title", values.title);
        payload.append(
          "effectiveDate",
          values.effectiveDate?.toISOString() || ""
        );
        payload.append("category", values.category || "");
        payload.append("description", values.description || "");
        payload.append("isActive", values.isActive ? "true" : "false");

        // append file only if present (new upload)
        if (values.file) {
          payload.append("file", values.file);
        }

        if (policy && policy._id) {
          await updatePolicy(policy._id, payload);
          toast.success("Policy updated");
        } else {
          await createPolicy(payload);
          toast.success("Policy created");
        }

        await fetchPolicies();
        onClose();
      } catch (err) {
        
        toast.error("Failed to save policy");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSelectedFile(f);
    formik.setFieldValue("file", f, true);
  };

  const removeFile = () => {
    setSelectedFile(null);
    formik.setFieldValue("file", null, true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{policy ? "Edit Policy" : "Upload Policy"}</DialogTitle>
          <DialogDescription>
            {policy
              ? "Update policy details and replace file if needed."
              : "Upload a company policy document. PDF preferred."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-5 p-2">
          {/* Title */}
          <div className="space-y-1">
            <Label>Title *</Label>
            <Input
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g., Employee Code of Conduct"
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

          {/* Effective date */}
          <div className="space-y-1">
            <Label>Effective Date *</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className={`w-full justify-start text-left font-normal ${
                    formik.touched.effectiveDate && formik.errors.effectiveDate
                      ? "border-red-500"
                      : ""
                  }`}
                >
                  {formik.values.effectiveDate
                    ? new Date(formik.values.effectiveDate).toDateString()
                    : "Pick effective date"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0">
                <ShadCalendar
                  mode="single"
                  selected={formik.values.effectiveDate}
                  onSelect={(d) =>
                    formik.setFieldValue("effectiveDate", d, true)
                  }
                />
              </PopoverContent>
            </Popover>

            {formik.touched.effectiveDate && formik.errors.effectiveDate && (
              <p className="text-sm text-red-500">
                {formik.errors.effectiveDate}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label>Category</Label>
            <Input
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g., HR, Compliance, Security"
            />
            {formik.touched.category && formik.errors.category && (
              <p className="text-sm text-red-500">{formik.errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              name="description"
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Short summary (optional)"
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-sm text-red-500">
                {formik.errors.description}
              </p>
            )}
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <Label>
              Policy File{" "}
              {policy?.file || selectedFile ? "(will be replaced)" : "*"}
            </Label>

            <input
              id="policy-file"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={onFileChange}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                {selectedFile
                  ? "Change File"
                  : policy?.file
                  ? "Replace File"
                  : "Select File"}
              </Button>

              {(selectedFile || policy?.file) && (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-sm">
                  <div className="truncate max-w-[280px]">
                    {selectedFile?.name || policy?.fileName || "Existing file"}
                  </div>
                  {selectedFile ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              )}
            </div>

            {formik.touched.file && formik.errors.file && (
              <p className="text-sm text-red-500">{formik.errors.file}</p>
            )}
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="isActive"
              checked={formik.values.isActive}
              onCheckedChange={(c) =>
                formik.setFieldValue("isActive", c === true)
              }
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={formik.isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : policy ? (
                "Update Policy"
              ) : (
                "Create Policy"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyModal;
