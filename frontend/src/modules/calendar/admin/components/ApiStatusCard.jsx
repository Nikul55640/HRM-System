/**
 * API Status Card Component
 * Displays Calendarific API connection status with detailed error messages
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Badge } from '../../../../shared/ui/badge';
import { Alert, AlertDescription } from '../../../../shared/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Settings } from 'lucide-react';

const ApiStatusCard = ({ apiStatus, loading, onTestConnection }) => {
  const getStatusIcon = (success) => {
    if (success) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          API Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {apiStatus ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(apiStatus.success)}
                <div>
                  <p className="font-medium">
                    {apiStatus.success ? 'Connected' : 'Disconnected'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {apiStatus.message}
                  </p>
                </div>
                {apiStatus.success && apiStatus.data?.holidayCount && (
                  <Badge variant="secondary">
                    {apiStatus.data.holidayCount} holidays available
                  </Badge>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onTestConnection}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Test Connection
              </Button>
            </div>

            {/* Show detailed error message if API failed */}
            {!apiStatus.success && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Calendarific API is not connected.</strong>
                  <br />
                  <span className="text-sm">
                    Please check:
                  </span>
                  <ul className="text-sm mt-2 ml-4 list-disc space-y-1">
                    <li>API key is configured in backend .env file (CALENDARIFIC_API_KEY)</li>
                    <li>Backend server is running</li>
                    <li>Network connection is stable</li>
                    <li>API quota is not exceeded</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          // Idle state - API not tested yet
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="font-medium">Not Tested</p>
                  <p className="text-sm text-muted-foreground">
                    Click "Test Connection" to verify API status
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onTestConnection}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Test Connection
              </Button>
            </div>
            
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Testing connection...</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiStatusCard;
