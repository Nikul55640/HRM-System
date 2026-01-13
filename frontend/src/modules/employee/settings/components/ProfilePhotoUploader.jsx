import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';
import { Button } from '../../../../shared/ui/button';
import { Card } from '../../../../shared/ui/card';
import { useToast } from '../../../../core/hooks/use-toast';
import employeeSettingsService from '../services/employeeSettingsService';

const ProfilePhotoUploader = ({ currentPhoto, onPhotoUpdate }) => {
  const [preview, setPreview] = useState(currentPhoto);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  // Update preview when currentPhoto changes
  useEffect(() => {
    setPreview(currentPhoto);
  }, [currentPhoto]);

  // Helper function to get full image URL
  const getImageUrl = (photoPath) => {
    if (!photoPath) return null;
    
    // If it's already a base64 data URL, return as is
    if (photoPath.startsWith('data:')) return photoPath;
    
    // If it's a full HTTP URL, return as is
    if (photoPath.startsWith('http')) return photoPath;
    
    // Normalize the path to always start with /
    const normalizedPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
    
    // Get base URL without /api suffix
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    const fullUrl = `${baseUrl}${normalizedPath}`;
    console.log('🖼️ Image URL construction:', {
      photoPath,
      normalizedPath,
      baseUrl,
      fullUrl,
      VITE_API_URL: import.meta.env.VITE_API_URL
    });
    
    return fullUrl;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a JPG or PNG image.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 2MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const response = await employeeSettingsService.uploadProfilePhoto(selectedFile);
      
      if (response.success) {
        const photoUrl = response.data.profilePhoto;
        setPreview(photoUrl);
        setSelectedFile(null);
        onPhotoUpdate?.(photoUrl);
        
        toast({
          title: 'Success',
          description: 'Profile photo updated successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || 'Failed to upload profile photo.',
        variant: 'destructive',
      });
      
      // Reset preview on error
      setPreview(currentPhoto);
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      const response = await employeeSettingsService.deleteProfilePhoto();
      
      if (response.success) {
        setPreview(null);
        setSelectedFile(null);
        onPhotoUpdate?.(null);
        
        toast({
          title: 'Success',
          description: 'Profile photo removed successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Remove failed',
        description: error.response?.data?.message || 'Failed to remove profile photo.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setPreview(currentPhoto);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
            {preview ? (
              <img
                src={getImageUrl(preview)}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('❌ Failed to load profile image:', preview);
                  console.error('❌ Attempted URL:', e.target.src);
                  e.target.style.display = 'none';
                  const fallbackDiv = e.target.parentNode.querySelector('.fallback-avatar');
                  if (fallbackDiv) {
                    fallbackDiv.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div className={`fallback-avatar w-full h-full flex items-center justify-center bg-gray-200 ${preview ? 'hidden' : ''}`}>
              <User className="w-16 h-16 text-gray-400" />
            </div>
          </div>
          
          {/* Camera icon overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors"
            disabled={uploading}
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
          <p className="text-sm text-gray-500 mt-1">
            JPG or PNG. Max size 2MB.
          </p>
          {preview?.startsWith('data:') && (
            <p className="text-xs text-amber-600 mt-1 bg-amber-50 px-2 py-1 rounded">
              ⚠️ Legacy photo format detected. Upload a new photo for better performance.
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2">
          {selectedFile ? (
            <>
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Uploading...' : 'Save Photo'}</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={uploading}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </Button>
              {preview && (
                <Button
                  variant="outline"
                  onClick={handleRemove}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                  <span>Remove</span>
                </Button>
              )}
            </>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </Card>
  );
};

export default ProfilePhotoUploader;