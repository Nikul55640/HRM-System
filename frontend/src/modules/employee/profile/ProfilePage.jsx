import { useEffect } from "react";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "../../../shared/components";
import { useProfile } from "../../../services/useEmployeeSelfService";
import { Button } from "../../../shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card";
import { Settings, User, Briefcase, CreditCard, FileText } from "lucide-react";

const ProfilePage = () => {
  const {
    profile,
    loading: profileLoading,
    getProfile,
  } = useProfile();

  useEffect(() => {
    getProfile(); // Load profile data from backend
  }, [getProfile]);

  if (profileLoading || !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Extract name and info from backend structure
  const firstName = profile?.personalInfo?.firstName || "";
  const lastName = profile?.personalInfo?.lastName || "";
  const jobTitle = profile?.jobInfo?.jobTitle || "Employee";
  const email = profile?.personalInfo?.personalEmail || profile?.contactInfo?.email || "";
  const employeeId = profile?.employeeId || "";
  const department = profile?.jobInfo?.department || "";
  const joiningDate = profile?.jobInfo?.joiningDate || "";

  const getInitials = () => {
    return `${firstName.charAt(0) || ""}${
      lastName.charAt(0) || ""
    }`.toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
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
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-semibold">
                {getInitials()}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {firstName} {lastName}
              </h1>
              <p className="text-xl text-gray-600">{jobTitle}</p>
              <p className="text-gray-500">{department}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                <span>ID: {employeeId}</span>
                <span>•</span>
                <span>{email}</span>
                {joiningDate && (
                  <>
                    <span>•</span>
                    <span>Joined: {new Date(joiningDate).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-end gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              profile.status === 'Active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {profile.status}
            </span>
            <Link to="/employee/settings">
              <Button className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Manage Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Link to="/employee/settings?tab=profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-blue-600" />
                Personal Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Update your personal information, contact details, and address
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/employee/settings?tab=work">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="w-5 h-5 text-green-600" />
                Work Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                View your job information, schedule, and employment details
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/employee/settings?tab=bank">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Manage your banking information for salary payments
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/employee/settings?tab=documents">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-orange-600" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Upload and manage your personal documents
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Profile Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Full Name:</span>
              <span className="font-medium">{firstName} {lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{profile?.personalInfo?.phoneNumber || "Not provided"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date of Birth:</span>
              <span className="font-medium">
                {profile?.personalInfo?.dateOfBirth 
                  ? new Date(profile.personalInfo.dateOfBirth).toLocaleDateString()
                  : "Not provided"
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nationality:</span>
              <span className="font-medium">{profile?.personalInfo?.nationality || "Not provided"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Work Information Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Work Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Employee ID:</span>
              <span className="font-medium">{employeeId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Job Title:</span>
              <span className="font-medium">{jobTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Department:</span>
              <span className="font-medium">{department || "Not assigned"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Employment Type:</span>
              <span className="font-medium">{profile?.jobInfo?.employmentType || "Not specified"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Work Location:</span>
              <span className="font-medium">{profile?.jobInfo?.workLocation || "Not specified"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
