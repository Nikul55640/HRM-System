import { useEffect } from "react";
import { useProfile } from "../../../../../services/useEmployeeSelfService";
import { LoadingSpinner } from "../../../../../shared/components";
import ProfileSettingsForm from "./ProfileSettingsForm";

const ProfileSettings = () => {
  const {
    profile,
    loading: profileLoading,
    getProfile,
    updateProfile,
  } = useProfile();

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const handleSave = async (updatedData) => {
    try {
      await updateProfile(updatedData);
    } catch (error) {
      // Error handled in hook
    }
  };

  if (profileLoading || !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ProfileSettingsForm
      profile={profile}
      onSubmit={handleSave}
      isLoading={profileLoading}
    />
  );
};

export default ProfileSettings;