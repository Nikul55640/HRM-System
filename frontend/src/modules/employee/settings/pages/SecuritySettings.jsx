import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { useToast } from '../../../../core/hooks/use-toast';
import PasswordChangeForm from '../components/PasswordChangeForm';
import employeeSettingsService from '../services/employeeSettingsService';

const SecuritySettings = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordChange = async (passwordData) => {
    try {
      setLoading(true);
      const response = await employeeSettingsService.changePassword(passwordData);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Password changed successfully. Please use your new password for future logins.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to change password.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm
            onSubmit={handlePasswordChange}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Additional Security Information */}
      <Card>
        <CardHeader>
          <CardTitle>Security Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Password Security</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use a unique password that you don't use elsewhere</li>
                <li>• Change your password regularly (every 3-6 months)</li>
                <li>• Never share your password with anyone</li>
                <li>• Use a password manager to generate and store strong passwords</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2">Account Security</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Always log out when using shared computers</li>
                <li>• Be cautious of phishing emails asking for your credentials</li>
                <li>• Report any suspicious account activity immediately</li>
                <li>• Keep your contact information up to date for security notifications</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;