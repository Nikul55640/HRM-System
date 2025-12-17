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

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    email: {
      leaveApproval: true,
      payslipGenerated: true,
      attendanceReminder: false,
      systemUpdates: true,
    },
    push: {
      leaveApproval: true,
      payslipGenerated: false,
      attendanceReminder: true,
      systemUpdates: false,
    },
    sms: {
      leaveApproval: false,
      payslipGenerated: false,
      attendanceReminder: false,
      systemUpdates: false,
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = (type, setting) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [setting]: !prev[type][setting],
      },
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement notification settings API call
      console.log("Notification settings:", settings);
      toast.success("Notification settings updated successfully");
    } catch (error) {
      toast.error("Failed to update notification settings");
    } finally {
      setIsLoading(false);
    }
  };

  const notificationTypes = [
    {
      key: "leaveApproval",
      label: "Leave Approval",
      description: "When your leave request is approved or rejected",
    },
    {
      key: "payslipGenerated",
      label: "Payslip Generated",
      description: "When your monthly payslip is ready",
    },
    {
      key: "attendanceReminder",
      label: "Attendance Reminder",
      description: "Daily reminders to mark attendance",
    },
    {
      key: "systemUpdates",
      label: "System Updates",
      description: "Important system announcements and updates",
    },
  ];

  const Switch = ({ checked, onChange }) => (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-gray-200"
      }`}
      onClick={onChange}
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
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 pb-4 border-b">
              <div className="font-medium">Notification Type</div>
              <div className="text-center font-medium">Email</div>
              <div className="text-center font-medium">Push</div>
              <div className="text-center font-medium">SMS</div>
            </div>

            {/* Notification Settings */}
            {notificationTypes.map((notification) => (
              <div key={notification.key} className="grid grid-cols-4 gap-4 items-center">
                <div>
                  <Label className="font-medium">{notification.label}</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    {notification.description}
                  </p>
                </div>
                <div className="flex justify-center">
                  <Switch
                    checked={settings.email[notification.key]}
                    onChange={() => handleToggle("email", notification.key)}
                  />
                </div>
                <div className="flex justify-center">
                  <Switch
                    checked={settings.push[notification.key]}
                    onChange={() => handleToggle("push", notification.key)}
                  />
                </div>
                <div className="flex justify-center">
                  <Switch
                    checked={settings.sms[notification.key]}
                    onChange={() => handleToggle("sms", notification.key)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>
            Set times when you don't want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Switch
                checked={false}
                onChange={() => {}}
              />
              <Label>Enable quiet hours</Label>
            </div>
            <div className="grid grid-cols-2 gap-4 opacity-50">
              <div>
                <Label>Start Time</Label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue="22:00"
                  disabled
                />
              </div>
              <div>
                <Label>End Time</Label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue="08:00"
                  disabled
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;