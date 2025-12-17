import { useState } from "react";
import { Button } from "../../../../../shared/ui/button";
import { Label } from "../../../../../shared/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../../shared/ui/card";
import { toast } from "react-toastify";
import { Shield, Smartphone, Globe, Clock } from "lucide-react";

const SecuritySettings = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleTwoFactor = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement 2FA toggle API call
      setTwoFactorEnabled(!twoFactorEnabled);
      toast.success(
        twoFactorEnabled 
          ? "Two-factor authentication disabled" 
          : "Two-factor authentication enabled"
      );
    } catch (error) {
      toast.error("Failed to update security settings");
    } finally {
      setIsLoading(false);
    }
  };

  const Switch = ({ checked, onChange, disabled = false }) => (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={disabled ? undefined : onChange}
      disabled={disabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Enable 2FA</Label>
              <p className="text-sm text-gray-500 mt-1">
                Require a verification code in addition to your password
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onChange={handleToggleTwoFactor}
              disabled={isLoading}
            />
          </div>

          {twoFactorEnabled && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">
                Two-factor authentication is enabled. You'll need your phone to sign in.
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                View Recovery Codes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage your active login sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Session */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Smartphone className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-gray-500">
                    Chrome on Windows • New York, US
                  </p>
                  <p className="text-xs text-gray-400">
                    Last active: Now
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Current
              </span>
            </div>

            {/* Other Sessions */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Mobile App</p>
                  <p className="text-sm text-gray-500">
                    iPhone • New York, US
                  </p>
                  <p className="text-xs text-gray-400">
                    Last active: 2 hours ago
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Revoke
              </Button>
            </div>

            <Button variant="outline" className="w-full">
              Sign Out All Other Sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Login Activity
          </CardTitle>
          <CardDescription>
            Review your recent login attempts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                time: "2 minutes ago",
                location: "New York, US",
                device: "Chrome on Windows",
                status: "success",
              },
              {
                time: "2 hours ago",
                location: "New York, US",
                device: "iPhone App",
                status: "success",
              },
              {
                time: "1 day ago",
                location: "New York, US",
                device: "Chrome on Windows",
                status: "success",
              },
            ].map((login, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="text-sm font-medium">{login.device}</p>
                  <p className="text-xs text-gray-500">
                    {login.location} • {login.time}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  login.status === "success" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {login.status === "success" ? "Success" : "Failed"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Control your privacy and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Profile Visibility</Label>
              <p className="text-sm text-gray-500 mt-1">
                Allow other employees to see your profile information
              </p>
            </div>
            <Switch checked={true} onChange={() => {}} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Activity Status</Label>
              <p className="text-sm text-gray-500 mt-1">
                Show when you're online or active
              </p>
            </div>
            <Switch checked={false} onChange={() => {}} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Data Analytics</Label>
              <p className="text-sm text-gray-500 mt-1">
                Help improve the platform by sharing usage data
              </p>
            </div>
            <Switch checked={true} onChange={() => {}} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;