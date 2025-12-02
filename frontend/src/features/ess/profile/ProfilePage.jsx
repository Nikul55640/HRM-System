import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import PersonalInfoForm from '../../../components/employee-self-service/profile/PersonalInfoForm';
import ChangeHistoryList from '../../../components/employee-self-service/profile/ChangeHistoryList';
  import { useProfile } from '../../../features/employees/useEmployeeSelfService'; 
import { Card, CardContent } from '../../../components/ui/card';

const ProfilePage = () => {
  console.log('👤 [PROFILE PAGE] Component rendering');
  
  const { profile, loading, error, updateProfile } = useProfile();

  useEffect(() => {
    console.log('👤 [PROFILE PAGE] Component mounted');
    console.log('👤 [PROFILE PAGE] Loading state:', loading);
    console.log('👤 [PROFILE PAGE] Profile data:', profile);
    console.log('👤 [PROFILE PAGE] Error:', error);
    
    return () => {
      console.log('👤 [PROFILE PAGE] Component unmounting');
    };
  }, []);

  useEffect(() => {
    if (loading) {
      console.log('⏳ [PROFILE PAGE] Loading profile data...');
    } else if (error) {
      console.error('❌ [PROFILE PAGE] Error loading profile:', error);
    } else if (profile) {
      console.log('✅ [PROFILE PAGE] Profile loaded successfully:', {
        name: `${profile?.personalInfo?.firstName} ${profile?.personalInfo?.lastName}`,
        email: profile?.contactInfo?.email,
        employeeId: profile?.employeeId,
        hasData: !!profile
      });
    }
  }, [loading, error, profile]);

  const handleTabChange = (value) => {
    console.log('📑 [PROFILE PAGE] Tab changed to:', value);
  };

  const handleUpdateProfile = async (data) => {
    console.log('📝 [PROFILE PAGE] Update profile initiated:', data);
    try {
      const result = await updateProfile(data);
      console.log('✅ [PROFILE PAGE] Profile updated successfully:', result);
      return result;
    } catch (err) {
      console.error('❌ [PROFILE PAGE] Profile update failed:', err);
      throw err;
    }
  };

  if (loading) {
    console.log('⏳ [PROFILE PAGE] Rendering loading state');
  }

  if (error) {
    console.log('❌ [PROFILE PAGE] Rendering error state:', error);
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Error loading profile</p>
          <p className="text-sm">{error.message || 'Please try again later'}</p>
        </div>
      )}
      
      <Tabs defaultValue="personal" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="history">Change History</TabsTrigger>
        </TabsList>
        <TabsContent value="personal">
          <PersonalInfoForm 
            profile={profile} 
            onSubmit={handleUpdateProfile} 
            isLoading={loading} 
          />
        </TabsContent>
        <TabsContent value="history">
          <ChangeHistoryList history={profile?.changeHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
