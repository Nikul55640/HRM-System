import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { documentUploadSchema } from '../../../utils/essValidation';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { toast } from 'react-toastify';
import { Upload, X } from 'lucide-react';

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
      type: '',
      file: undefined,
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setValue('file', file, { shouldValidate: true });
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValue('file', undefined, { shouldValidate: true });
    // Reset file input value
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleFormSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('type', data.type);
      formData.append('file', data.file);
      
      await onUpload(formData);
      toast.success('Document uploaded successfully');
      reset();
      setSelectedFile(null);
    } catch (error) {
      toast.error(error.message || 'Failed to upload document');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>Upload ID proofs, certificates, and other documents (Max 5MB)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Document Type *</Label>
              <Select onValueChange={(value) => setValue('type', value, { shouldValidate: true })}>
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id_proof">ID Proof</SelectItem>
                  <SelectItem value="address_proof">Address Proof</SelectItem>
                  <SelectItem value="education">Education Certificate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">File *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className={`hidden ${errors.file ? 'border-red-500' : ''}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload').click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {selectedFile ? 'Change File' : 'Select File'}
                </Button>
              </div>
              {selectedFile && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="h-6 w-6 p-0"
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

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || !selectedFile}>
              {isLoading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
