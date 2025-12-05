import { useState, useEffect } from "react";
import PersonalInfoForm from "../../../components/employee-self-service/profile/PersonalInfoForm";
import ChangeHistoryList from "../../../components/employee-self-service/profile/ChangeHistoryList";
import { useProfile } from "../../admin/employees/useEmployeeSelfService";

const ProfilePage = () => {
  const { profile, loading, error, updateProfile } = useProfile();
  const [activeTab, setActiveTab] = useState("personal");

  const handleUpdateProfile = async (data) => {
    try {
      const result = await updateProfile(data);
      return result;
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="font-semibold text-red-900">Error loading profile</p>
          <p className="text-sm text-red-700 mt-1">
            {error.message || "Please try again later"}
          </p>
        </div>
      )}

      {/* Simple Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 p-4">
            <button
              onClick={() => setActiveTab("personal")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "personal"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "history"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Change History
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "personal" && (
            <PersonalInfoForm
              profile={profile}
              onSubmit={handleUpdateProfile}
              isLoading={loading}
            />
          )}
          {activeTab === "history" && (
            <ChangeHistoryList history={profile?.changeHistory} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
