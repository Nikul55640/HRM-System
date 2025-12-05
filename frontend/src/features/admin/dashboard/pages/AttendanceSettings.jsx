import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Clock, Save, Settings, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { configService } from '../../../../services';

const AttendanceSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // Shift Timings
    shiftStartTime: '09:00',
    shiftEndTime: '17:00',
    
    // Work Hours
    fullDayHours: 8,
    halfDayHours: 4,
    
    // Late/Early Rules
    lateThresholdMinutes: 15,
    gracePeriodMinutes: 10,
    earlyDepartureThresholdMinutes: 15,
    
    // Overtime
    overtimeEnabled: true,
    overtimeThresholdMinutes: 30,
    
    // Break Time
    defaultBreakMinutes: 60,
    maxBreakMinutes: 120,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Try to get existing config
      const response = await configService.getConfig('attendance_settings');
      if (response.success && response.data && response.data.value) {
        setSettings({ ...settings, ...response.data.value });
      }
    } catch (error) {
      console.error('Failed to fetch attendance settings:', error);
      // If config doesn't exist yet, that's okay - we'll use defaults
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Use setSystemConfig endpoint
      const response = await configService.updateConfig('attendance_settings', settings);
      if (response.success) {
        toast.success('Attendance settings saved successfully');
      } else {
        toast.error(response.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save attendance settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Attendance Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure shift timings, late rules, and work hour thresholds
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">
              These settings apply to all employees
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Changes will take effect immediately for new attendance records.
            </p>
          </div>
        </div>
      </div>

      {/* Shift Timings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Shift Timings
          </CardTitle>
          <CardDescription>
            Set the standard work shift start and end times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shiftStartTime">Shift Start Time</Label>
              <Input
                id="shiftStartTime"
                type="time"
                value={settings.shiftStartTime}
                onChange={(e) => handleChange('shiftStartTime', e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Employees should clock in by this time
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shiftEndTime">Shift End Time</Label>
              <Input
                id="shiftEndTime"
                type="time"
                value={settings.shiftEndTime}
                onChange={(e) => handleChange('shiftEndTime', e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Standard shift end time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Hours Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Work Hours Thresholds</CardTitle>
          <CardDescription>
            Define minimum hours for full day and half day attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullDayHours">Full Day Hours</Label>
              <Input
                id="fullDayHours"
                type="number"
                min="1"
                max="24"
                step="0.5"
                value={settings.fullDayHours}
                onChange={(e) => handleChange('fullDayHours', parseFloat(e.target.value))}
              />
              <p className="text-xs text-gray-500">
                Minimum hours to mark as "Present"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="halfDayHours">Half Day Hours</Label>
              <Input
                id="halfDayHours"
                type="number"
                min="1"
                max="12"
                step="0.5"
                value={settings.halfDayHours}
                onChange={(e) => handleChange('halfDayHours', parseFloat(e.target.value))}
              />
              <p className="text-xs text-gray-500">
                Minimum hours to mark as "Half Day"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Late Arrival & Early Departure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Late Arrival & Early Departure</CardTitle>
          <CardDescription>
            Configure grace period and late/early thresholds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gracePeriodMinutes">Grace Period (minutes)</Label>
              <Input
                id="gracePeriodMinutes"
                type="number"
                min="0"
                max="60"
                value={settings.gracePeriodMinutes}
                onChange={(e) => handleChange('gracePeriodMinutes', parseInt(e.target.value))}
              />
              <p className="text-xs text-gray-500">
                Allowed delay without marking as late
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lateThresholdMinutes">Late Threshold (minutes)</Label>
              <Input
                id="lateThresholdMinutes"
                type="number"
                min="1"
                max="120"
                value={settings.lateThresholdMinutes}
                onChange={(e) => handleChange('lateThresholdMinutes', parseInt(e.target.value))}
              />
              <p className="text-xs text-gray-500">
                Minutes late to mark as "Late"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="earlyDepartureThresholdMinutes">Early Departure Threshold (minutes)</Label>
              <Input
                id="earlyDepartureThresholdMinutes"
                type="number"
                min="1"
                max="120"
                value={settings.earlyDepartureThresholdMinutes}
                onChange={(e) => handleChange('earlyDepartureThresholdMinutes', parseInt(e.target.value))}
              />
              <p className="text-xs text-gray-500">
                Minutes early to mark as early departure
              </p>
            </div>
          </div>

          {/* Example */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
            <p className="text-sm font-medium text-gray-800 mb-2">Example:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Shift starts at {settings.shiftStartTime}</li>
              <li>• Grace period: {settings.gracePeriodMinutes} minutes</li>
              <li>• Clock in by {
                (() => {
                  const [h, m] = settings.shiftStartTime.split(':');
                  const date = new Date();
                  date.setHours(parseInt(h), parseInt(m) + settings.gracePeriodMinutes);
                  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                })()
              } = On Time ✓</li>
              <li>• Clock in after {
                (() => {
                  const [h, m] = settings.shiftStartTime.split(':');
                  const date = new Date();
                  date.setHours(parseInt(h), parseInt(m) + settings.gracePeriodMinutes);
                  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                })()
              } = Late ⚠️</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Overtime Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overtime Settings</CardTitle>
          <CardDescription>
            Configure overtime calculation rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="overtimeEnabled"
              checked={settings.overtimeEnabled}
              onChange={(e) => handleChange('overtimeEnabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <Label htmlFor="overtimeEnabled" className="cursor-pointer">
              Enable Overtime Tracking
            </Label>
          </div>

          {settings.overtimeEnabled && (
            <div className="space-y-2">
              <Label htmlFor="overtimeThresholdMinutes">Overtime Threshold (minutes)</Label>
              <Input
                id="overtimeThresholdMinutes"
                type="number"
                min="0"
                max="240"
                value={settings.overtimeThresholdMinutes}
                onChange={(e) => handleChange('overtimeThresholdMinutes', parseInt(e.target.value))}
              />
              <p className="text-xs text-gray-500">
                Minimum minutes after shift end to count as overtime
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Break Time Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Break Time Settings</CardTitle>
          <CardDescription>
            Configure default and maximum break durations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultBreakMinutes">Default Break Duration (minutes)</Label>
              <Input
                id="defaultBreakMinutes"
                type="number"
                min="0"
                max="240"
                value={settings.defaultBreakMinutes}
                onChange={(e) => handleChange('defaultBreakMinutes', parseInt(e.target.value))}
              />
              <p className="text-xs text-gray-500">
                Standard lunch/break time
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxBreakMinutes">Maximum Break Duration (minutes)</Label>
              <Input
                id="maxBreakMinutes"
                type="number"
                min="0"
                max="480"
                value={settings.maxBreakMinutes}
                onChange={(e) => handleChange('maxBreakMinutes', parseInt(e.target.value))}
              />
              <p className="text-xs text-gray-500">
                Maximum allowed break time per day
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
};

export default AttendanceSettings;
