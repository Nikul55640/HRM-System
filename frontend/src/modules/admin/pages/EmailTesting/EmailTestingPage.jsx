import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Mail, Send, CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react';
import { useToast } from '@/core/hooks/use-toast';
import api from '@/services/api';

const EmailTestingPage = () => {
  const [emailConfig, setEmailConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testForm, setTestForm] = useState({
    email: 'np425771@gmail.com',
    type: 'attendance_absent',
    data: {
      employeeName: 'Test Employee',
      date: new Date().toISOString().split('T')[0],
      reason: 'Test email - No clock-in recorded',
      issue: 'Test email - Missing clock-out',
      leaveType: 'Annual Leave',
      startDate: '2026-02-01',
      endDate: '2026-02-03',
      days: 3,
      approverName: 'Test Manager'
    }
  });
  const [testResults, setTestResults] = useState([]);
  const { toast } = useToast();

  // Load email configuration
  const loadEmailConfig = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/email/status');
      setEmailConfig(response.data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load email configuration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Send test email
  const sendTestEmail = async () => {
    setLoading(true);
    try {
      const response = await api.post('/admin/email/test', testForm);
      
      const result = {
        id: Date.now(),
        type: testForm.type,
        email: testForm.email,
        success: response.data.success,
        emailId: response.data.data?.emailId,
        error: response.data.error,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTestResults(prev => [result, ...prev]);
      
      if (response.data.success) {
        toast({
          title: 'Email Sent',
          description: `Test email sent successfully to ${testForm.email}`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Email Failed',
          description: response.data.error || 'Failed to send email',
          variant: 'destructive'
        });
      }
    } catch (error) {
      const result = {
        id: Date.now(),
        type: testForm.type,
        email: testForm.email,
        success: false,
        error: error.response?.data?.message || error.message,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTestResults(prev => [result, ...prev]);
      
      toast({
        title: 'Error',
        description: 'Failed to send test email',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Send all email types
  const sendAllEmailTypes = async () => {
    const emailTypes = ['attendance_absent', 'correction_required', 'leave_approved'];
    
    for (const type of emailTypes) {
      setTestForm(prev => ({ ...prev, type }));
      await sendTestEmail();
      // Wait 2 seconds between emails
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  React.useEffect(() => {
    loadEmailConfig();
  }, []);

  const getEmailTypeLabel = (type) => {
    const labels = {
      attendance_absent: 'Attendance Absent',
      correction_required: 'Correction Required',
      leave_approved: 'Leave Approved'
    };
    return labels[type] || type;
  };

  const getEmailTypeIcon = (type) => {
    const icons = {
      attendance_absent: '❌',
      correction_required: '⚠️',
      leave_approved: '✅'
    };
    return icons[type] || '📧';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Testing</h1>
          <p className="text-muted-foreground">
            Test email notifications and verify delivery
          </p>
        </div>
        <Button onClick={loadEmailConfig} variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Refresh Config
        </Button>
      </div>

      {/* Email Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !emailConfig ? (
            <div className="text-center py-4">Loading configuration...</div>
          ) : emailConfig ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  {emailConfig.isConfigured ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Not Configured
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Service</Label>
                <p className="text-sm text-muted-foreground mt-1">{emailConfig.service}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">From Email</Label>
                <p className="text-sm text-muted-foreground mt-1">{emailConfig.fromEmail}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Base URL</Label>
                <p className="text-sm text-muted-foreground mt-1">{emailConfig.baseUrl}</p>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load email configuration. Please check your settings.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Email Test Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Test Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                value={testForm.email}
                onChange={(e) => setTestForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="type">Email Type</Label>
              <Select
                value={testForm.type}
                onValueChange={(value) => setTestForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance_absent">
                    ❌ Attendance Absent
                  </SelectItem>
                  <SelectItem value="correction_required">
                    ⚠️ Correction Required
                  </SelectItem>
                  <SelectItem value="leave_approved">
                    ✅ Leave Approved
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeName">Employee Name</Label>
              <Input
                id="employeeName"
                value={testForm.data.employeeName}
                onChange={(e) => setTestForm(prev => ({
                  ...prev,
                  data: { ...prev.data, employeeName: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={testForm.data.date}
                onChange={(e) => setTestForm(prev => ({
                  ...prev,
                  data: { ...prev.data, date: e.target.value }
                }))}
              />
            </div>
          </div>

          {testForm.type === 'attendance_absent' && (
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={testForm.data.reason}
                onChange={(e) => setTestForm(prev => ({
                  ...prev,
                  data: { ...prev.data, reason: e.target.value }
                }))}
                placeholder="Reason for absence"
              />
            </div>
          )}

          {testForm.type === 'correction_required' && (
            <div>
              <Label htmlFor="issue">Issue</Label>
              <Textarea
                id="issue"
                value={testForm.data.issue}
                onChange={(e) => setTestForm(prev => ({
                  ...prev,
                  data: { ...prev.data, issue: e.target.value }
                }))}
                placeholder="Issue description"
              />
            </div>
          )}

          {testForm.type === 'leave_approved' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="leaveType">Leave Type</Label>
                <Input
                  id="leaveType"
                  value={testForm.data.leaveType}
                  onChange={(e) => setTestForm(prev => ({
                    ...prev,
                    data: { ...prev.data, leaveType: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="approverName">Approver Name</Label>
                <Input
                  id="approverName"
                  value={testForm.data.approverName}
                  onChange={(e) => setTestForm(prev => ({
                    ...prev,
                    data: { ...prev.data, approverName: e.target.value }
                  }))}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={sendTestEmail} disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Send Test Email'}
            </Button>
            <Button onClick={sendAllEmailTypes} variant="outline" disabled={loading}>
              <Mail className="h-4 w-4 mr-2" />
              Send All Types
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-4 rounded-lg border ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getEmailTypeIcon(result.type)}</span>
                      <span className="font-medium">{getEmailTypeLabel(result.type)}</span>
                      <Badge variant={result.success ? 'success' : 'destructive'}>
                        {result.success ? 'Sent' : 'Failed'}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{result.timestamp}</span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>To: {result.email}</p>
                    {result.success && result.emailId && (
                      <p>Email ID: {result.emailId}</p>
                    )}
                    {!result.success && result.error && (
                      <p className="text-red-600">Error: {result.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. Verify email configuration is valid before sending tests</p>
            <p>2. Enter the recipient email address (default: np425771@gmail.com)</p>
            <p>3. Select email type and customize the data as needed</p>
            <p>4. Click "Send Test Email" to send a single email or "Send All Types" for all templates</p>
            <p>5. Check your inbox and spam folder for the test emails</p>
            <p>6. Monitor delivery status at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Resend Dashboard</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTestingPage;