import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentUploadSchema } from "../../../core/utils/essValidation";

import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/ui/select";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card";

import { toast } from "react-toastify";
import { Upload, X } from "lucide-react";

const DocumentUpload = ({ onUpload, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      type: "",
      file: undefined,
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Save in state + react-hook-form
    setSelectedFile(file);
    setValue("file", file, { shouldValidate: true });
  };

  const removeFile = () => {
    setSelectedFile(null);
    setValue("file", undefined, { shouldValidate: true });

    // Reset file input manually
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = "";
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("type", data.type);
      formData.append("file", data.file);

      await onUpload(formData);
      toast.success("Document uploaded successfully");

      reset();
      setSelectedFile(null);
    } catch (error) {
      toast.error(error.message || "Failed to upload document");
    }
  };

  return (
    <Card className="mb-6 border-gray-200">
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Upload ID proofs, certificates, and other documents — Max size 5MB.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* GRID FIELDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TYPE SELECT */}
            <div className="space-y-2">
              <Label>Document Type *</Label>
              <Select
                onValueChange={(value) =>
                  setValue("type", value, { shouldValidate: true })
                }
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="id_proof">ID Proof</SelectItem>
                  <SelectItem value="address_proof">Address Proof</SelectItem>
                  <SelectItem value="education">
                    Education Certificate
                  </SelectItem>
                  <SelectItem value="experience">
                    Experience Certificate
                  </SelectItem>
                  <SelectItem value="resume">Resume</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            {/* FILE UPLOAD */}
            <div className="space-y-2">
              <Label>File *</Label>

              {/* Hidden File Input */}
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Visible Button */}
              <Button
                type="button"
                variant="outline"
                className={`w-full ${errors.file ? "border-red-500" : ""}`}
                onClick={() => document.getElementById("file-upload").click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {selectedFile ? "Change File" : "Select File"}
              </Button>

              {/* FILE PREVIEW */}
              {selectedFile && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                  <span className="truncate max-w-[230px]">
                    {selectedFile.name}
                  </span>

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={removeFile}
                    className="h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {errors.file && (
                <p className="text-sm text-red-500">{errors.file.message}</p>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="min-w-[150px]"
            >
              {isLoading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
