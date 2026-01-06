import React from 'react';
import { Button } from '../shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/card';
import { Badge } from '../shared/ui/badge';
import { 
  Bell, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  User, 
  Key,
  Database,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import useNotificationStore from '../stores/useNotificationStore';
import notificationService from '../services/notificationService';
import useAuthStore from '../stores/useAuthStore';
import useAuth from '../core/hooks/useAuth';

/**
 * Debug component for testing notification system
 * Only visible in development mode
 */
const NotificationDebug = () => {
  const { user, isAuthenticated } = useAuth();
  const {
    notifications,
    unreadCount,
    isConnected,
    isConnecting,
    lastError,
  } = useNotificationStore();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleTestNotification = () => {
    // Add a test notification directly to the store for testing UI
    const testNotification = {
      id: Date.now(),
      title: 'Test Notification (Frontend)',
      message: 'This is a test notification for debugging purposes (added directly to store)',
      type: 'info',
      category: 'system',
      isRead: false,
      createdAt: new Date().toISOString(),
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      }
    };

    const { addNotification } = useNotificationStore.getState();
    addNotification(testNotification);
  };

  const handleTestBackendNotification = async () => {
    try {
      const response = await fetch('/api/employee/notifications/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ Test notification sent from backend');
      } else {
        console.error('❌ Failed to send test notification from backend');
      }
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
    }
  };

  const handleReconnect = () => {
    notificationService.connectToSSE();
  };

  const handleLoadData = async () => {
    try {
      await notificationService.loadInitialData();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const token = useAuthStore.getState().token;
  const hasToken = !!token;

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 border-2 border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notification Debug
          <Badge variant="outline" className="text-xs">
            DEV
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {/* Authentication Status */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="w-3 h-3" />
            <span className="font-medium">Auth Status:</span>
            {isAuthenticated ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : (
              <AlertCircle className="w-3 h-3 text-red-600" />
            )}
            <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
              {isAuthenticated ? 'Logged In' : 'Not Logged In'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Key className="w-3 h-3" />
            <span className="font-medium">Token:</span>
            {hasToken ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : (
              <AlertCircle className="w-3 h-3 text-red-600" />
            )}
            <span className={hasToken ? 'text-green-600' : 'text-red-600'}>
              {hasToken ? 'Present' : 'Missing'}
            </span>
          </div>

          {user && (
            <div className="text-gray-600">
              User: {user.email} ({user.role})
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {isConnecting ? (
              <RefreshCw className="w-3 h-3 animate-spin text-yellow-600" />
            ) : isConnected ? (
              <Wifi className="w-3 h-3 text-green-600" />
            ) : (
              <WifiOff className="w-3 h-3 text-red-600" />
            )}
            <span className="font-medium">SSE:</span>
            <span className={
              isConnecting ? 'text-yellow-600' : 
              isConnected ? 'text-green-600' : 'text-red-600'
            }>
              {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {lastError && (
            <div className="text-red-600 text-xs bg-red-100 p-1 rounded">
              Error: {lastError}
            </div>
          )}
        </div>

        {/* Notification Stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Database className="w-3 h-3" />
            <span className="font-medium">Notifications:</span>
            <span>{notifications.length} total</span>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="w-3 h-3" />
            <span className="font-medium">Unread:</span>
            <span className={unreadCount > 0 ? 'text-blue-600 font-medium' : ''}>
              {unreadCount}
            </span>
          </div>
        </div>

        {/* Debug Actions */}
        <div className="space-y-2 pt-2 border-t">
          <Button
            onClick={handleTestNotification}
            size="sm"
            variant="outline"
            className="w-full text-xs h-7"
          >
            Add Test Notification (Frontend)
          </Button>

          <Button
            onClick={handleTestBackendNotification}
            size="sm"
            variant="outline"
            className="w-full text-xs h-7"
          >
            Send Test Notification (Backend)
          </Button>
          
          <Button
            onClick={handleReconnect}
            size="sm"
            variant="outline"
            className="w-full text-xs h-7"
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Reconnect SSE'}
          </Button>
          
          <Button
            onClick={handleLoadData}
            size="sm"
            variant="outline"
            className="w-full text-xs h-7"
          >
            Load Initial Data
          </Button>

          <Button
            onClick={() => {
              console.log('🔍 Debug Info:');
              console.log('Auth Store Token:', useAuthStore.getState().token ? 'Present' : 'Missing');
              console.log('User:', useAuthStore.getState().user);
              console.log('Is Authenticated:', useAuthStore.getState().isAuthenticated);
              console.log('LocalStorage auth-storage:', localStorage.getItem('auth-storage'));
            }}
            size="sm"
            variant="outline"
            className="w-full text-xs h-7"
          >
            Debug Token Info
          </Button>
        </div>

        {/* Token Info (truncated) */}
        {token && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            <div className="font-medium">Token (first 20 chars):</div>
            <div className="font-mono bg-gray-100 p-1 rounded text-xs break-all">
              {token.substring(0, 20)}...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationDebug;