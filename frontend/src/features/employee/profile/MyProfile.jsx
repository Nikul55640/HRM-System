import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate } from '../../../utils/essHelpers';

const MyProfile = () => {
  const user = useSelector((state) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const { personalInfo, contactInfo, jobInfo } = user;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage your personal information</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-semibold mb-4">
                {personalInfo?.firstName?.[0]}{personalInfo?.lastName?.[0]}
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                {personalInfo?.firstName} {personalInfo?.lastName}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{jobInfo?.jobTitle || 'Employee'}</p>
              <p className="text-xs text-gray-400 mt-1">{user.employeeId}</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-800">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">First Name</label>
                  <p className="text-sm text-gray-800 mt-1">{personalInfo?.firstName || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Last Name</label>
                  <p className="text-sm text-gray-800 mt-1">{personalInfo?.lastName || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Date of Birth</label>
                  <p className="text-sm text-gray-800 mt-1">
                    {personalInfo?.dateOfBirth ? formatDate(personalInfo.dateOfBirth) : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Gender</label>
                  <p className="text-sm text-gray-800 mt-1">{personalInfo?.gender || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-800">
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <p className="text-sm text-gray-800">{contactInfo?.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="text-xs text-gray-500">Phone</label>
                  <p className="text-sm text-gray-800">{contactInfo?.phoneNumber || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="text-xs text-gray-500">Address</label>
                  <p className="text-sm text-gray-800">{contactInfo?.address || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-800">
                Job Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Job Title</label>
                  <p className="text-sm text-gray-800 mt-1">{jobInfo?.jobTitle || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Department</label>
                  <p className="text-sm text-gray-800 mt-1">{jobInfo?.department?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Join Date</label>
                  <p className="text-sm text-gray-800 mt-1">
                    {jobInfo?.joiningDate ? formatDate(jobInfo.joiningDate) : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Employment Type</label>
                  <p className="text-sm text-gray-800 mt-1">{jobInfo?.employmentType || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;