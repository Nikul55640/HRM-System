import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { useToast } from '../../../../core/hooks/use-toast';
import { LoadingSpinner } from '../../../../shared/components';
import { useProfile } from '../../../../services/useEmployeeSelfService';
import ProfilePhotoUploader from '../components/ProfilePhotoUploader';
import PersonalInfoForm from '../components/PersonalInfoForm';
import ContactInfoForm from '../components/ContactInfoForm';

const ProfileSettings = () => {
  const { profile, loading, error, getProfile, updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePersonalInfoSubmit = async (personalInfo) => {
    try {
      setSaving(true);
      await updateProfile({ personalInfo });
      
      toast({
        title: 'Success',
        description: 'Personal information updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update personal information.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleContactInfoSubmit = async (contactInfo) => {
    try {
      setSaving(true);
      await updateProfile({ contactInfo });
      
      toast({
        title: 'Success',
        description: 'Contact information updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update contact information.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpdate = async () => {
    try {
      // Refresh profile to get updated photo URL
      await getProfile();
      
      toast({
        title: 'Success',
        description: 'Profile photo updated successfully.',
      });
    } catch (error) {
      console.error('Error refreshing profile after photo update:', error);
      toast({
        title: 'Warning',
        description: 'Photo updated but failed to refresh profile data.',
        variant: 'default',
      });
    }
  };

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <p className="text-red-600 font-medium">Failed to load profile</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <Button onClick={getProfile}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Photo Section */}
          <ProfilePhotoUploader
            currentPhoto={profile?.profilePhoto || profile?.profilePicture}
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