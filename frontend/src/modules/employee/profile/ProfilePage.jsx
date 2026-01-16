import { useEffect } from "react";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "../../../shared/components";
import { useProfile, useAttendance } from "../../../services/useEmployeeSelfService";
import { Button } from "../../../shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card";
import { Settings } from "lucide-react";

// Track if we've already warned about broken address (prevent console spam)
let hasWarnedAboutBrokenAddress = false;

const ProfilePage = () => {
  const { profile, loading, error, getProfile } = useProfile();
  const { 
    attendanceSummary, 
    loading: attendanceLoading, 
    getAttendanceSummary 
  } = useAttendance();

  useEffect(() => {
    getProfile();
    // Fetch current month's attendance summary
    const now = new Date();
    getAttendanceSummary(now.getMonth() + 1, now.getFullYear());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load profile</p>
          <p className="text-gray-500 text-sm mt-2">{error}</p>
          <Button onClick={getProfile} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  /* ================= DATA ================= */

  const {
    firstName,
    lastName,
    gender,
    dateOfBirth,
    phone,
    nationality,
    maritalStatus,
    bloodGroup,
    country,
    about,
    address: rawAddress,
    employeeId,
    profilePicture,
    user,
  } = profile;

  // Parse address if it's a JSON string (backward compatibility)
  const parseAddress = (addr) => {
    if (!addr) return null;
    
    // Handle broken backend value
    if (addr === "[object Object]") {
      if (!hasWarnedAboutBrokenAddress) {
        console.warn('⚠️ Received invalid address format: [object Object] - Please re-enter your address in settings');
        hasWarnedAboutBrokenAddress = true;
      }
      return null;
    }
    
    // If already an object, return as-is
    if (typeof addr === 'object') {
      return addr;
    }
    
    // If string, try to parse as JSON
    if (typeof addr === 'string') {
      try {
        return JSON.parse(addr);
      } catch {
        // If parsing fails, treat as plain string (old format)
        return { street: addr };
      }
    }
    
    return null;
  };

  const address = parseAddress(rawAddress);

  const email = user?.email || "Not provided";
  const role = user?.role || "Employee";
  const status = user?.isActive ? "Active" : "Inactive";

  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  // Safer profile image handling - check if URL is already absolute
  const profileImage = profilePicture
    ? profilePicture.startsWith("http")
      ? profilePicture
      : `${import.meta.env.VITE_API_BASE_URL}/${profilePicture}`
    : null;

  // Better full name display
  const fullName = firstName || lastName
    ? `${firstName || ""} ${lastName || ""}`.trim()
    : "Not provided";

  const safeValue = (value) =>
    value === null || value === undefined || value === ""
      ? "Not provided"
      : value;

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "Not provided";

  /* ================= COMPONENTS ================= */

  const InfoRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 border-b border-gray-100 pb-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 sm:text-right break-words">
        {safeValue(value)}
      </span>
    </div>
  );

  const StatMiniCard = ({ title, value }) => (
    <div className="bg-white border border-gray-100 rounded-lg px-4 sm:px-5 py-4 shadow-sm hover:shadow-md transition">
      <div className="text-sm text-gray-500 flex items-center gap-2">
        {title}
        <span className="text-gray-400 cursor-help">?</span>
      </div>
      <div className="text-xl font-semibold text-blue-600 mt-2">
        {value}
      </div>
    </div>
  );

  /* ================= UI ================= */

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

      {/* ================= HEADER ================= */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row md:justify-between md:items-start gap-4">

          {/* Left */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-start">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-blue-100"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg sm:text-xl font-semibold ring-4 ring-blue-100">
                {initials}
              </div>
            )}

            <div className="text-center sm:text-left">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                {fullName}
              </h1>
              <p className="text-gray-600 capitalize">{safeValue(gender)}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-gray-500 mt-2">
                <span>ID: {employeeId}</span>
                <span className="hidden sm:inline">•</span>
                <span>{email}</span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
            <span
              className={`px-4 py-1 rounded-full text-xs font-semibold ${
                status === "Active"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {status}
            </span>

            <Link to="/employee/settings" className="w-full sm:w-auto">
              <Button className="rounded-full px-5 flex items-center gap-2 w-full sm:w-auto">
                <Settings className="w-4 h-4" />
                Manage Settings
              </Button>
            </Link>
          </div>

        </CardContent>
      </Card>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {attendanceLoading ? (
          <>
            <div className="bg-white border border-gray-100 rounded-lg px-4 sm:px-5 py-4 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg px-4 sm:px-5 py-4 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg px-4 sm:px-5 py-4 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg px-4 sm:px-5 py-4 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
          </>
        ) : (
          <>
            <StatMiniCard 
              title="Late Attendance" 
              value={attendanceSummary?.lateDays || 0} 
            />
            <StatMiniCard 
              title="Leaves Taken" 
              value={attendanceSummary?.leaveDays || 0} 
            />
            <StatMiniCard 
              title="Present Days" 
              value={attendanceSummary?.presentDays || 0} 
            />
            <StatMiniCard 
              title="Leave Days" 
              value={attendanceSummary?.leaveDays || 0} 
            />
          </>
        )}
      </div>

      {/* ================= DETAILS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Personal Info */}
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Full Name" value={`${firstName} ${lastName}`} />
            <InfoRow label="Email" value={email} />
            <InfoRow label="Phone" value={phone} />
            <InfoRow label="Date of Birth" value={formatDate(dateOfBirth)} />
            <InfoRow label="Gender" value={gender} />
            <InfoRow label="Marital Status" value={maritalStatus} />
            <InfoRow label="Nationality" value={nationality} />
            <InfoRow label="Country" value={country} />
            <InfoRow label="Blood Group" value={bloodGroup} />
            <InfoRow label="About" value={about} />
          </CardContent>
        </Card>

        {/* Work Info */}
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Work & Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Employee ID" value={employeeId} />
            <InfoRow label="Role" value={role} />
            <InfoRow label="Account Status" value={status} />
          </CardContent>
        </Card>

      </div>

      {/* ================= ADDRESS ================= */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {address && Object.keys(address).length > 0 ? (
            (() => {
              // Whitelist address fields to prevent internal keys from showing
              const addressFields = ["street", "city", "state", "zipCode", "country"];
              const formatLabel = (key) => {
                const labelMap = {
                  street: "Street Address",
                  city: "City",
                  state: "State/Province",
                  zipCode: "ZIP/Postal Code",
                  country: "Country"
                };
                return labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              };

              return addressFields.map((key) => (
                <InfoRow
                  key={key}
                  label={formatLabel(key)}
                  value={address[key]}
                />
              ));
            })()
          ) : (
            <p className="text-sm text-gray-500">
              No address information provided
            </p>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default ProfilePage;
