import { useEffect } from "react";
import { useProfile } from "../../../../../services/useEmployeeSelfService";
import { LoadingSpinner } from "../../../../../shared/components";
import { Input } from "../../../../../shared/ui/input";
import { Label } from "../../../../../shared/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../../shared/ui/card";

const WorkDetailsSettings = () => {
  const {
    profile,
    loading: profileLoading,
    getProfile,
  } = useProfile();

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  if (profileLoading || !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job Information */}
      <Card>
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
          <CardDescription>
            Your employment details (read-only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Employee ID</Label>
              <Input
                value={profile?.employeeId || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                value={profile?.jobInfo?.jobTitle || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={profile?.jobInfo?.department || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Input
                value={profile?.jobInfo?.employmentType || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Work Location</Label>
              <Input
                value={profile?.jobInfo?.workLocation || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Joining Date</Label>
              <Input
                value={profile?.jobInfo?.joiningDate || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Reporting Manager</Label>
              <Input
                value={profile?.jobInfo?.reportingManager || "Not Assigned"}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Input
                value={profile?.status || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Work Schedule</CardTitle>
          <CardDescription>
            Your working hours and schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Schedule Type</Label>
              <Input
                value={profile?.jobInfo?.workSchedule?.type || "Standard"}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Hours Per Week</Label>
              <Input
                value={profile?.jobInfo?.workSchedule?.hoursPerWeek || "40"}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Working Days</Label>
            <div className="flex flex-wrap gap-2">
              {profile?.jobInfo?.workSchedule?.workingDays?.map((day, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {day}
                </span>
              )) || (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  Monday - Friday
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Information */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Information</CardTitle>
          <CardDescription>
            Your compensation details (confidential)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Base Salary</Label>
              <Input
                value={profile?.salaryInfo?.baseSalary ? `${profile.salaryInfo.currency} ${profile.salaryInfo.baseSalary}` : "Not Available"}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Pay Frequency</Label>
              <Input
                value={profile?.salaryInfo?.payFrequency || "Monthly"}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Effective Date</Label>
              <Input
                value={profile?.salaryInfo?.effectiveDate || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkDetailsSettings;