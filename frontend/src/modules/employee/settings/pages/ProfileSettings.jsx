import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { useToast } from '../../../../core/hooks/use-toast';
import ProfilePhotoUploader from '../components/ProfilePhotoUploader';
import PersonalInfoForm from '../components/PersonalInfoForm';
import ContactInfoForm from '../components/ContactInfoForm';
import employeeSettingsService from '../services/employeeSettingsService';

const ProfileSettings = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await employeeSettingsService.getProfile();
      
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load profile data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalInfoSubmit = async (personalInfo) => {
    try {
      setSaving(true);
      const response = await employeeSettingsService.updateProfile({
        personalInfo
      });

      if (response.success) {
        setProfile(prev => ({
          ...prev,
          ...response.data
        }));
        
        toast({
          title: 'Success',
          description: 'Personal information updated successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update personal information.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleContactInfoSubmit = async (contactInfo) => {
    try {
      setSaving(true);
      const response = await employeeSettingsService.updateProfile({
        contactInfo
      });

      if (response.success) {
        setProfile(prev => ({
          ...prev,
          ...response.data
        }));
        
        toast({
          title: 'Success',
          description: 'Contact information updated successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update contact information.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpdate = (newPhotoUrl) => {
    setProfile(prev => ({
      ...prev,
      profilePhoto: newPhotoUrl
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Photo Section */}
          <ProfilePhotoUploader
            currentPhoto={profile?.profilePhoto}
            onPhotoUpdate={handlePhotoUpdate}
          />

          {/* Personal Information Section */}
          <PersonalInfoForm
            initialData={profile}
            onSubmit={handlePersonalInfoSubmit}
            loading={saving}
          />

          {/* Contact Information Section */}
          <ContactInfoForm
            initialData={profile}
            onSubmit={handleContactInfoSubmit}
            loading={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;