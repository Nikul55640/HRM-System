import { useEffect } from 'react';
import useAuth from '../core/hooks/useAuth';
import useNotificationStore from '../stores/useNotificationStore';
import notificationService from '../services/notificationService';

/**
 * Hook to manage notification connection lifecycle
 * Automatically connects/disconnects based on auth state
 */
const useNotifications = () => {
  const { isAuthenticated, user } = useAuth();
  const { isConnected, isConnecting, lastError, setError } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load initial data and connect to SSE
      const initializeNotifications = async () => {
        try {
          // Load initial notifications and unread count
          await notificationService.loadInitialData();
          
          // Connect to SSE stream
          notificationService.connectToSSE();
        } catch (error) {
          console.error('Failed to initialize notifications:', error);
          // Set a user-friendly error message
          if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
            setError('Please login to receive notifications');
          } else {
            setError('Failed to load notifications');
          }
        }
      };

      initializeNotifications();
    } else {
      // Disconnect when user logs out
      notificationService.resetConnection();
    }

    // Cleanup on unmount
    return () => {
      if (!isAuthenticated) {
        notificationService.resetConnection();
      }
    };
  }, [isAuthenticated, user, setError]);

  // Reconnect on page visibility change (when user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && !isConnected && !isConnecting) {
        console.log('🔄 Page became visible, reconnecting notifications...');
        // Add a small delay to avoid immediate reconnection
        setTimeout(() => {
          const { isConnected: currentConnected, isConnecting: currentConnecting } = useNotificationStore.getState();
          if (!currentConnected && !currentConnecting) {
            notificationService.connectToSSE();
          }
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, isConnected, isConnecting]);

  // Reconnect on network status change
  useEffect(() => {
    const handleOnline = () => {
      if (isAuthenticated && !isConnected && !isConnecting) {
        console.log('🌐 Network came back online, reconnecting notifications...');
        // Add a delay to ensure network is stable
        setTimeout(() => {
          const { isConnected: currentConnected, isConnecting: currentConnecting } = useNotificationStore.getState();
          if (!currentConnected && !currentConnecting) {
            notificationService.connectToSSE();
          }
        }, 2000);
      }
    };

    const handleOffline = () => {
      console.log('🌐 Network went offline');
      setError('Network connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, isConnected, isConnecting, setError]);

  return {
    isConnected,
    isConnecting,
    lastError,
    reconnect: () => {
      if (isAuthenticated) {
        notificationService.connectToSSE();
      } else {
        setError('Please login to receive notifications');
      }
    },
    disconnect: () => {
      notificationService.disconnectFromSSE();
    },
  };
};

export default useNotifications;