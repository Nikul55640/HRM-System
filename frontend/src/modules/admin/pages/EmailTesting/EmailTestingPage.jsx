/**
 * Email Testing Page
 * 
 * Admin interface for testing all email providers
 * Test Mailtrap, Resend, and SMTP configurations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Input } from '../../../../shared/ui/input';
import { Label } from '../../../../shared/ui/label';
import { Badge } from '../../../../shared/ui/badge';
import { Alert, AlertDescription } from '../../../../shared/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../shared/ui/tabs';
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Send, 
  Settings, 
  Zap,
  Server,
  Globe,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../../../../core/hooks/use-toast';
import api from '../../../../services/api';

const EmailTestingPage = () => {
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [providerStatus, setProviderStatus] = useState(null);
  const [testResults, setTestResults] = useState({});
  const { toast } = useToast();

  // Load email provider status on mount
  useEffect(() => {
    loadProviderStatus();
  }, []);

  const loadProviderStatus = async () => {
    try {
      const response = await api.get('/admin/email-test/status');
      setProviderStatus(response.data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load email provider status',
        variant: 'destructive'
      });
    }
  };

  const testCurrentProvider = async () => {
    if (!testEmail) {
      toast({
        title: 'Error',
        description: 'Please enter a test email address',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/admin/email-test/current', {
        email: testEmail
      });

      setTestResults(prev => ({
        ...prev,
        current: response.data.data
      }));

      toast({
        title: 'Success',
        description: `Test email sent via ${providerStatus?.current?.provider}`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send test email',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const testSpecificProvider = async (provider) => {
    if (!testEmail) {
      toast({
        title: 'Error',
        description: 'Please enter a test email address',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/admin/email-test/provider', {
        provider: provider.toUpperCase(),
        email: testEmail
      });

      setTestResults(prev => ({
        ...prev,
        [provider]: response.data.data
      }));

      toast({
        title: 'Success',
        description: `${provider.toUpperCase()} test email sent successfully`,
        variant: 'default'
      });
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [provider]: { success: false, error: error.response?.data?.message || 'Test failed' }
      }));

      toast({
        title: 'Error',
        description: `${provider.toUpperCase()}: ${error.response?.data?.message || 'Test failed'}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const testAllProviders = async () => {
    if (!testEmail) {
      toast({
        title: 'Error',
        description: 'Please enter a test email address',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/admin/email-test/all', {
        email: testEmail
      });

      setTestResults(prev => ({
        ...prev,
        all: response.data.data
      }));

      const { successful, failed, total } = response.data.data;
      toast({
        title: 'Test Complete',
        description: `${successful}/${total} providers working. ${failed} failed.`,
        variant: successful === total ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to test all providers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider) => {
    switch (provider.toLowerCase()) {
      case 'mailtrap': return <Mail className="h-4 w-4" />;
      case 'resend': return <Zap className="h-4 w-4" />;
      case 'smtp': return <Server className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (configured, valid) => {
    if (configured && valid) {
      return <Badge variant="success" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Ready</Badge>;
    } else if (configured && !valid) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
    } else {
      return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Not Configured</Badge>;
    }
  };

  if (!providerStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading email provider status...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Testing</h1>
          <p className="text-gray-600">Test and verify email provider configurations</p>
        </div>
        <Button onClick={loadProviderStatus} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* Current Provider Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Current Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Active Provider</Label>
              <div className="flex items-center mt-1">
                {getProviderIcon(providerStatus.current.provider)}
                <span className="ml-2 font-semibold">{providerStatus.current.provider}</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">From Email</Label>
              <p className="text-sm text-gray-600 mt-1">{providerStatus.current.fromEmail}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="mt-1">
                {getStatusBadge(providerStatus.current.configured, true)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Email Input */}
      <Card>
        <CardHeader>
          <CardTitle>Test Email Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter email address to receive test emails"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <Button 
              onClick={testCurrentProvider} 
              disabled={loading || !testEmail}
              className="min-w-[120px]"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Test Current
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Provider Testing Tabs */}
      <Tabs defaultValue="individual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="individual">Individual Providers</TabsTrigger>
          <TabsTrigger value="all">Test All</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mailtrap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Mailtrap
                  </div>
                  {getStatusBadge(
                    providerStatus.providers.mailtrap.configured,
                    providerStatus.providers.mailtrap.status.valid
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    {providerStatus.providers.mailtrap.status.message || 
                     providerStatus.providers.mailtrap.status.error}
                  </div>
                  <Button 
                    onClick={() => testSpecificProvider('mailtrap')}
                    disabled={loading || !testEmail || !providerStatus.providers.mailtrap.configured}
                    className="w-full"
                    size="sm"
                  >
                    Test Mailtrap
                  </Button>
                  {testResults.mailtrap && (
                    <Alert className={testResults.mailtrap.success ? 'border-green-200' : 'border-red-200'}>
                      <AlertDescription className="text-sm">
                        {testResults.mailtrap.success ? '✅ Test email sent successfully' : `❌ ${testResults.mailtrap.error}`}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Resend
                  </div>
                  {getStatusBadge(
                    providerStatus.providers.resend.configured,
                    providerStatus.providers.resend.status.valid
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    {providerStatus.providers.resend.status.message || 
                     providerStatus.providers.resend.status.error}
                  </div>
                  <Button 
                    onClick={() => testSpecificProvider('resend')}
                    disabled={loading || !testEmail || !providerStatus.providers.resend.configured}
                    className="w-full"
                    size="sm"
                  >
                    Test Resend
                  </Button>
                  {testResults.resend && (
                    <Alert className={testResults.resend.success ? 'border-green-200' : 'border-red-200'}>
                      <AlertDescription className="text-sm">
                        {testResults.resend.success ? '✅ Test email sent successfully' : `❌ ${testResults.resend.error}`}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SMTP */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Server className="h-5 w-5 mr-2" />
                    SMTP
                  </div>
                  {getStatusBadge(
                    providerStatus.providers.smtp.configured,
                    providerStatus.providers.smtp.status.valid
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    {providerStatus.providers.smtp.status.message || 
                     providerStatus.providers.smtp.status.error}
                  </div>
                  {providerStatus.providers.smtp.status.host && (
                    <div className="text-xs text-gray-500">
                      Host: {providerStatus.providers.smtp.status.host}:{providerStatus.providers.smtp.status.port}
                    </div>
                  )}
                  <Button 
                    onClick={() => testSpecificProvider('smtp')}
                    disabled={loading || !testEmail || !providerStatus.providers.smtp.configured}
                    className="w-full"
                    size="sm"
                  >
                    Test SMTP
                  </Button>
                  {testResults.smtp && (
                    <Alert className={testResults.smtp.success ? 'border-green-200' : 'border-red-200'}>
                      <AlertDescription className="text-sm">
                        {testResults.smtp.success ? '✅ Test email sent successfully' : `❌ ${testResults.smtp.error}`}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Test All Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  This will send test emails from all configured providers to verify they're working correctly.
                </p>
                <Button 
                  onClick={testAllProviders}
                  disabled={loading || !testEmail}
                  className="w-full md:w-auto"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Test All Providers
                </Button>
                
                {testResults.all && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Test Results Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>Total: {testResults.all.total}</div>
                      <div className="text-green-600">Successful: {testResults.all.successful}</div>
                      <div className="text-red-600">Failed: {testResults.all.failed}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(testResults).length === 0 ? (
                <p className="text-gray-500 text-center py-8">No test results yet. Run some tests to see results here.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(testResults).map(([provider, result]) => (
                    <div key={provider} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold capitalize">{provider}</h4>
                        {result.success ? (
                          <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>
                        ) : (
                          <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.success ? (
                          <div>
                            <p>{result.message}</p>
                            {result.messageId && <p className="text-xs mt-1">Message ID: {result.messageId}</p>}
                            {result.emailId && <p className="text-xs mt-1">Email ID: {result.emailId}</p>}
                          </div>
                        ) : (
                          <p className="text-red-600">{result.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Help */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Help</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold">Environment Variables</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                <li><code>EMAIL_PROVIDER</code> - Set to MAILTRAP, RESEND, or SMTP</li>
                <li><code>EMAIL_FROM</code> - From email address and name</li>
                <li><code>MAILTRAP_API_TOKEN</code> - Mailtrap API token</li>
                <li><code>RESEND_API_KEY</code> - Resend API key</li>
                <li><code>SMTP_HOST, SMTP_USER, SMTP_PASS</code> - SMTP configuration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">SMTP Examples</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                <li>Gmail: smtp.gmail.com:587 (use App Password)</li>
                <li>Outlook: smtp-mail.outlook.com:587</li>
                <li>Office365: smtp.office365.com:587</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTestingPage;