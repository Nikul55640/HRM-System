import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Input } from '../../../../shared/ui/input';
import { Label } from '../../../../shared/ui/label';
import { Switch } from '../../../../shared/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../shared/ui/tabs';
import { Separator } from '../../../../shared/ui/separator';
import { Badge } from '../../../../shared/ui/badge';
import { Alert, AlertDescription } from '../../../../shared/ui/alert';
import { useToast } from '../../../../core/hooks/use-toast';
import configService from '../../../../services/configService';
import Icon from '../../../../shared/components/Icon';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';

const AdminSettingsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('system');

  // Settings state
  const [systemSettings, setSystemSettings] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    timezone: 'UTC',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'USD',
    language: 'en'
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: true,
    fromEmail: '',
    fromName: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    leaveRequestNotifications: true,
    attendanceAlerts: true,
    systemAlerts: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorAuth: false,
    ipWhitelist: ''
  });

  const [attendanceSettings, setAttendanceSettings] = useState({
    shiftStartTime: '09:00',
    shiftEndTime: '17:00',
    fullDayHours: 8,
    halfDayHours: 4,
    lateThresholdMinutes: 15,
    gracePeriodMinutes: 10,
    earlyDepartureThresholdMinutes: 15,
    overtimeEnabled: true,
    overtimeThresholdMinutes: 30,
    defaultBreakMinutes: 60,
    maxBreakMinutes: 120
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    backupLocation: 'local',
    lastBackup: null
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading admin settings...');
      
      // Load only the settings for active tabs
      const [
        systemConfig,
        notificationConfig,
        securityConfig,
        backupConfig
      ] = await Promise.allSettled([
        configService.getSystemConfig(),
        configService.getNotificationSettings(),
        configService.getSecuritySettings(),
        configService.getBackupSettings()
      ]);

      console.log('📊 Settings loaded:', {
        systemConfig: systemConfig.status,
        notificationConfig: notificationConfig.status,
        securityConfig: securityConfig.status,
        backupConfig: backupConfig.status
      });

      // Update state with loaded settings
      if (systemConfig.status === 'fulfilled' && systemConfig.value.success) {
        console.log('✅ System config loaded:', systemConfig.value.data);
        setSystemSettings(prev => ({ ...prev, ...systemConfig.value.data }));
      } else if (systemConfig.status === 'rejected') {
        console.error('❌ System config failed:', systemConfig.reason);
      }

      if (notificationConfig.status === 'fulfilled' && notificationConfig.value.success) {
        console.log('✅ Notification config loaded:', notificationConfig.value.data);
        setNotificationSettings(prev => ({ ...prev, ...notificationConfig.value.data }));
      } else if (notificationConfig.status === 'rejected') {
        console.error('❌ Notification config failed:', notificationConfig.reason);
      }

      if (securityConfig.status === 'fulfilled' && securityConfig.value.success) {
        console.log('✅ Security config loaded:', securityConfig.value.data);
        setSecuritySettings(prev => ({ ...prev, ...securityConfig.value.data }));
      } else if (securityConfig.status === 'rejected') {
        console.error('❌ Security config failed:', securityConfig.reason);
      }

      if (backupConfig.status === 'fulfilled' && backupConfig.value.success) {
        console.log('✅ Backup config loaded:', backupConfig.value.data);
        setBackupSettings(prev => ({ ...prev, ...backupConfig.value.data }));
      } else if (backupConfig.status === 'rejected') {
        console.error('❌ Backup config failed:', backupConfig.reason);
      }

    } catch (error) {
      console.error('❌ Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (settingsType, settings) => {
    setSaving(true);
    try {
      console.log(`💾 Saving ${settingsType} settings:`, settings);
      
      let response;
      
      switch (settingsType) {
        case 'system':
          response = await configService.updateSystemConfig(settings);
          break;
        case 'email':
          response = await configService.updateEmailSettings(settings);
          break;
        case 'notifications':
          response = await configService.updateNotificationSettings(settings);
          break;
        case 'security':
          response = await configService.updateSecuritySettings(settings);
          break;
        case 'backup':
          response = await configService.updateBackupSettings(settings);
          break;
        default:
          throw new Error('Invalid settings type');
      }

      console.log(`✅ ${settingsType} settings saved:`, response);

      if (response.success) {
        toast({
          title: "Success",
          description: "Settings updated successfully",
        });
      } else {
        throw new Error(response.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error(`❌ Error saving ${settingsType} settings:`, error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      console.log('🔗 Testing backend connection...');
      const response = await configService.getSystemConfig();
      console.log('✅ Connection test result:', response);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Backend connection is working!",
        });
      } else {
        toast({
          title: "Warning",
          description: "Backend responded but with an error: " + response.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      toast({
        title: "Error",
        description: "Backend connection failed: " + error.message,
        variant: "destructive"
      });
    }
  };

  const testEmailSettings = async () => {
    setSaving(true);
    try {
      const response = await configService.testEmailSettings();
      if (response.success) {
        toast({
          title: "Success",
          description: "Email test sent successfully",
        });
      } else {
        throw new Error(response.message || 'Email test failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Email test failed",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const createBackup = async () => {
    setSaving(true);
    try {
      const response = await configService.createBackup();
      if (response.success) {
        toast({
          title: "Success",
          description: "Backup created successfully",
        });
        // Reload backup settings to get updated last backup time
        const backupConfig = await configService.getBackupSettings();
        if (backupConfig.success) {
          setBackupSettings(prev => ({ ...prev, ...backupConfig.data }));
        }
      } else {
        throw new Error(response.message || 'Backup creation failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Backup creation failed",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-2 text-muted-foreground">Loading admin settings...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={testConnection}
            disabled={saving}
          >
            <Icon name="Wifi" className="w-4 h-4 mr-1" />
            Test Connection
          </Button>
          <Badge variant="outline" className="text-sm">
            <Icon name="Settings" className="w-4 h-4 mr-1" />
            System Configuration
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Building2" className="w-5 h-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Basic company information and system preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={systemSettings.companyName}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={systemSettings.companyEmail}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, companyEmail: e.target.value }))}
                    placeholder="company@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    value={systemSettings.companyPhone}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, companyPhone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="w-full p-2 border border-input rounded-md"
                    value={systemSettings.timezone}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, timezone: e.target.value }))}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Asia/Kolkata">India Standard Time</option>
                    <option value="Europe/London">London</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <select
                    id="dateFormat"
                    className="w-full p-2 border border-input rounded-md"
                    value={systemSettings.dateFormat}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <select
                    id="timeFormat"
                    className="w-full p-2 border border-input rounded-md"
                    value={systemSettings.timeFormat}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, timeFormat: e.target.value }))}
                  >
                    <option value="12h">12 Hour (AM/PM)</option>
                    <option value="24h">24 Hour</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    className="w-full p-2 border border-input rounded-md"
                    value={systemSettings.currency}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, currency: e.target.value }))}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    className="w-full p-2 border border-input rounded-md"
                    value={systemSettings.language}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, language: e.target.value }))}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <textarea
                  id="companyAddress"
                  className="w-full p-2 border border-input rounded-md"
                  rows={3}
                  value={systemSettings.companyAddress}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, companyAddress: e.target.value }))}
                  placeholder="Enter company address"
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => saveSettings('system', systemSettings)}
                  disabled={saving}
                >
                  {saving ? <LoadingSpinner className="w-4 h-4 mr-2" /> : null}
                  Save System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        {/* <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Mail" className="w-5 h-5" />
                SMTP Configuration
              </CardTitle>
              <CardDescription>
                Configure email server settings for system notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                    placeholder="587"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={emailSettings.smtpUser}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                    placeholder="username@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                    placeholder="noreply@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                    placeholder="Company HRM System"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="smtpSecure"
                  checked={emailSettings.smtpSecure}
                  onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, smtpSecure: checked }))}
                />
                <Label htmlFor="smtpSecure">Use SSL/TLS</Label>
              </div>
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={testEmailSettings}
                  disabled={saving}
                >
                  {saving ? <LoadingSpinner className="w-4 h-4 mr-2" /> : null}
                  Test Email
                </Button>
                <Button 
                  onClick={() => saveSettings('email', emailSettings)}
                  disabled={saving}
                >
                  {saving ? <LoadingSpinner className="w-4 h-4 mr-2" /> : null}
                  Save Email Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Bell" className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure system-wide notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Leave Request Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify managers about leave requests
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.leaveRequestNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, leaveRequestNotifications: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Attendance Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Send alerts for attendance issues
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.attendanceAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, attendanceAlerts: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Send system maintenance and error alerts
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => saveSettings('notifications', notificationSettings)}
                  disabled={saving}
                >
                  {saving ? <LoadingSpinner className="w-4 h-4 mr-2" /> : null}
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Shield" className="w-5 h-5" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                Configure security policies and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="6"
                    max="32"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="480"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    min="3"
                    max="10"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Password Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="passwordRequireUppercase"
                      checked={securitySettings.passwordRequireUppercase}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, passwordRequireUppercase: checked }))}
                    />
                    <Label htmlFor="passwordRequireUppercase">Require Uppercase</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="passwordRequireLowercase"
                      checked={securitySettings.passwordRequireLowercase}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, passwordRequireLowercase: checked }))}
                    />
                    <Label htmlFor="passwordRequireLowercase">Require Lowercase</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="passwordRequireNumbers"
                      checked={securitySettings.passwordRequireNumbers}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, passwordRequireNumbers: checked }))}
                    />
                    <Label htmlFor="passwordRequireNumbers">Require Numbers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="passwordRequireSymbols"
                      checked={securitySettings.passwordRequireSymbols}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, passwordRequireSymbols: checked }))}
                    />
                    <Label htmlFor="passwordRequireSymbols">Require Symbols</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => saveSettings('security', securitySettings)}
                  disabled={saving}
                >
                  {saving ? <LoadingSpinner className="w-4 h-4 mr-2" /> : null}
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Settings */}
        {/* <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Clock" className="w-5 h-5" />
                Attendance Configuration
              </CardTitle>
              <CardDescription>
                Configure attendance tracking and calculation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shiftStartTime">Default Shift Start Time</Label>
                  <Input
                    id="shiftStartTime"
                    type="time"
                    value={attendanceSettings.shiftStartTime}
                    onChange={(e) => setAttendanceSettings(prev => ({ ...prev, shiftStartTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shiftEndTime">Default Shift End Time</Label>
                  <Input
                    id="shiftEndTime"
                    type="time"
                    value={attendanceSettings.shiftEndTime}
                    onChange={(e) => setAttendanceSettings(prev => ({ ...prev, shiftEndTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullDayHours">Full Day Hours</Label>
                  <Input
                    id="fullDayHours"
                    type="number"
                    min="1"
                    max="24"
                    value={attendanceSettings.fullDayHours}
                    onChange={(e) => setAttendanceSettings(prev => ({ ...prev, fullDayHours: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="halfDayHours">Half Day Hours</Label>
                  <Input
                    id="halfDayHours"
                    type="number"
                    min="1"
                    max="12"
                    value={attendanceSettings.halfDayHours}
                    onChange={(e) => setAttendanceSettings(prev => ({ ...prev, halfDayHours: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateThresholdMinutes">Late Threshold (minutes)</Label>
                  <Input
                    id="lateThresholdMinutes"
                    type="number"
                    min="0"
                    max="120"
                    value={attendanceSettings.lateThresholdMinutes}
                    onChange={(e) => setAttendanceSettings(prev => ({ ...prev, lateThresholdMinutes: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gracePeriodMinutes">Grace Period (minutes)</Label>
                  <Input
                    id="gracePeriodMinutes"
                    type="number"
                    min="0"
                    max="60"
                    value={attendanceSettings.gracePeriodMinutes}
                    onChange={(e) => setAttendanceSettings(prev => ({ ...prev, gracePeriodMinutes: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="overtimeEnabled"
                  checked={attendanceSettings.overtimeEnabled}
                  onCheckedChange={(checked) => setAttendanceSettings(prev => ({ ...prev, overtimeEnabled: checked }))}
                />
                <Label htmlFor="overtimeEnabled">Enable Overtime Tracking</Label>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => saveSettings('attendance', attendanceSettings)}
                  disabled={saving}
                >
                  {saving ? <LoadingSpinner className="w-4 h-4 mr-2" /> : null}
                  Save Attendance Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* Backup Settings */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Download" className="w-5 h-5" />
                Backup Configuration
              </CardTitle>
              <CardDescription>
                Configure automatic backups and data retention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <select
                    id="backupFrequency"
                    className="w-full p-2 border border-input rounded-md"
                    value={backupSettings.backupFrequency}
                    onChange={(e) => setBackupSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupRetention">Retention Period (days)</Label>
                  <Input
                    id="backupRetention"
                    type="number"
                    min="1"
                    max="365"
                    value={backupSettings.backupRetention}
                    onChange={(e) => setBackupSettings(prev => ({ ...prev, backupRetention: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoBackup"
                  checked={backupSettings.autoBackup}
                  onCheckedChange={(checked) => setBackupSettings(prev => ({ ...prev, autoBackup: checked }))}
                />
                <Label htmlFor="autoBackup">Enable Automatic Backups</Label>
              </div>

              {backupSettings.lastBackup && (
                <Alert>
                  <Icon name="Info" className="h-4 w-4" />
                  <AlertDescription>
                    Last backup: {new Date(backupSettings.lastBackup).toLocaleString()}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={createBackup}
                  disabled={saving}
                >
                  {saving ? <LoadingSpinner className="w-4 h-4 mr-2" /> : null}
                  Create Backup Now
                </Button>
                <Button 
                  onClick={() => saveSettings('backup', backupSettings)}
                  disabled={saving}
                >
                  {saving ? <LoadingSpinner className="w-4 h-4 mr-2" /> : null}
                  Save Backup Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettingsPage;