import { useEffect, useState } from "react";
import { LoadingSpinner } from "../../../shared/components";
import { useProfile } from "../../../modules/employees/useEmployeeSelfService";
import ProfileSettings from "../../ess/components/ProfileSettings";

const ProfilePage = () => {
  const {
    profile,
    loading: profileLoading,
    getProfile,
    updateProfile,
  } = useProfile();

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    getProfile(); // Load profile data from backend
  }, []);

  const handleSave = async (updatedData) => {
    try {
      await updateProfile(updatedData);
      setIsEditing(false);
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

  // Extract name if available
  const firstName = profile?.personalInfo?.firstName || "";
  const lastName = profile?.personalInfo?.lastName || "";

  const getInitials = () => {
    return `${firstName.charAt(0) || ""}${
      lastName.charAt(0) || ""
    }`.toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          {/* User info */}
          <div className="flex items-center gap-6">
            {/* Profile Photo */}
            {profile.personalInfo?.profilePhoto ? (
              <img
                src={profile.personalInfo.profilePhoto}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-semibold">
                {getInitials()}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {firstName} {lastName}
              </h1>
              <p className="text-gray-600">
                {profile.personalInfo?.designation || "Employee"}
              </p>
              <p className="text-sm text-gray-500">
                Email: {profile.personalInfo?.email}
              </p>
            </div>
          </div>

          {/* Edit Toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Profile Settings */}
      <ProfileSettings
        profile={profile}
        onSubmit={handleSave}
        isLoading={profileLoading}
      />
    </div>
  );
};

export default ProfilePage;
