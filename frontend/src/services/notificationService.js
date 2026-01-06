import api from './api';
import useNotificationStore from '../stores/useNotificationStore';
import useAuthStore from '../stores/useAuthStore';

/**
 * Notification Service
 * Handles SSE connection and notification API calls
 */
class NotificationService {
  constructor() {
    this.eventSource = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.heartbeatInterval = null;
    this.connectionTimeout = null;
    this.lastConnectionAttempt = 0;
    this.connectionDebounceMs = 2000; // Prevent connections within 2 seconds
  }

  /**
   * Connect to SSE stream
   */
  connectToSSE() {
    const { setConnectionStatus, setError, addNotification, clearError, isConnecting } = useNotificationStore.getState();
    
    // Debounce connection attempts
    const now = Date.now();
    if (now - this.lastConnectionAttempt < this.connectionDebounceMs) {
      console.log('🔄 SSE connection debounced, too soon since last attempt');
      return;
    }
    this.lastConnectionAttempt = now;
    
    // Don't connect if already connected or connecting
    if (this.eventSource && this.eventSource.readyState !== EventSource.CLOSED) {
      console.log('🔄 SSE already connected or connecting, skipping...');
      return;
    }

    // Don't connect if already in connecting state
    if (isConnecting) {
      console.log('🔄 SSE connection already in progress, skipping...');
      return;
    }

    const token = useAuthStore.getState().token;
    if (!token) {
      setError('Please login to receive notifications');
      setConnectionStatus(false, false);
      return;
    }

    setConnectionStatus(false, true); // isConnecting = true
    clearError();

    try {
      // Use cookie-based authentication for SSE
      const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const sseUrl = `${baseURL}/api/employee/notifications/stream`;
      
      console.log('🔗 Connecting to SSE with credentials:', sseUrl);
      
      // Create EventSource with credentials (cookies)
      this.eventSource = new EventSource(sseUrl, {
        withCredentials: true
      });

      this.eventSource.onopen = () => {
        console.log('✅ SSE connection established');
        setConnectionStatus(true, false);
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        clearError();
        
        // Clear connection timeout
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          switch (data.type) {
            case 'connection':
              console.log('🔔 SSE connection confirmed:', data.message);
              break;
            case 'heartbeat':
              // Just log heartbeat, no action needed
              console.log('💓 SSE heartbeat received');
              break;
            default:
              // Regular notification
              console.log('🔔 New notification received:', data);
              addNotification(data);
              break;
          }
        } catch (error) {
          console.error('❌ Failed to parse SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        console.log('EventSource readyState:', this.eventSource.readyState);
        console.log('EventSource CONNECTING:', EventSource.CONNECTING);
        console.log('EventSource OPEN:', EventSource.OPEN);
        console.log('EventSource CLOSED:', EventSource.CLOSED);
        
        setConnectionStatus(false, false);
        
        // Clear connection timeout
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        
        // Check if it's an authentication error
        if (this.eventSource.readyState === EventSource.CLOSED) {
          // Try to determine if it's an auth error
          const currentToken = useAuthStore.getState().token;
          if (!currentToken) {
            setError('Authentication required - please login again');
          } else {
            setError('Connection failed - retrying...');
            this.handleReconnect();
          }
        }
      };

      // Set connection timeout (10 seconds)
      this.connectionTimeout = setTimeout(() => {
        if (this.eventSource && this.eventSource.readyState === EventSource.CONNECTING) {
          console.log('⏰ SSE connection timeout, closing...');
          this.eventSource.close();
          setError('Connection timeout - retrying...');
          this.handleReconnect();
        }
      }, 10000);

    } catch (error) {
      console.error('❌ Failed to create SSE connection:', error);
      setError('Failed to establish notification connection');
      setConnectionStatus(false, false);
    }
  }

  /**
   * Handle reconnection with exponential backoff
   */
  handleReconnect() {
    const { setError } = useNotificationStore.getState();
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      setError('Failed to reconnect to notifications after multiple attempts');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
    
    console.log(`🔄 Attempting to reconnect SSE in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connectToSSE();
    }, delay);
  }

  /**
   * Disconnect from SSE stream
   */
  disconnectFromSSE() {
    const { setConnectionStatus, reset } = useNotificationStore.getState();
    
    console.log('🔌 Disconnecting SSE...');
    
    // Clear connection timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('🔌 EventSource closed');
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    setConnectionStatus(false, false);
    console.log('🔌 SSE connection closed');
  }

  /**
   * Reset connection (disconnect and clear store)
   */
  resetConnection() {
    this.disconnectFromSSE();
    const { reset } = useNotificationStore.getState();
    reset();
    this.reconnectAttempts = 0;
  }

  // ===================================================
  // REST API METHODS
  // ===================================================

  /**
   * Fetch notifications from API
   */
  async fetchNotifications(params = {}) {
    try {
      const response = await api.get('/employee/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/employee/notifications/unread-count');
      return response.data.data.count;
    } catch (error) {
      console.error('❌ Failed to get unread count:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id) {
    try {
      const response = await api.put(`/employee/notifications/${id}/read`);
      
      // Update store
      const { markAsRead } = useNotificationStore.getState();
      markAsRead(id);
      
      return response.data;
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markManyAsRead(notificationIds) {
    try {
      const response = await api.put('/employee/notifications/read-many', {
        notificationIds,
      });
      
      // Update store
      const { markAsRead } = useNotificationStore.getState();
      notificationIds.forEach(id => markAsRead(id));
      
      return response.data;
    } catch (error) {
      console.error('❌ Failed to mark notifications as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const response = await api.put('/employee/notifications/read-all');
      
      // Update store
      const { markAllAsRead } = useNotificationStore.getState();
      markAllAsRead();
      
      return response.data;
    } catch (error) {
      console.error('❌ Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(id) {
    try {
      const response = await api.delete(`/employee/notifications/${id}`);
      
      // Update store
      const { removeNotification } = useNotificationStore.getState();
      removeNotification(id);
      
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete notification:', error);
      throw error;
    }
  }

  /**
   * Load initial notifications and unread count
   */
  async loadInitialData() {
    try {
      const { setNotifications, setUnreadCount } = useNotificationStore.getState();
      
      // Load recent notifications
      const notificationsResponse = await this.fetchNotifications({ 
        page: 1, 
        limit: 50 
      });
      
      setNotifications(notificationsResponse.data.notifications);
      
      // Load unread count
      const unreadCount = await this.getUnreadCount();
      setUnreadCount(unreadCount);
      
      console.log('✅ Initial notification data loaded');
    } catch (error) {
      console.error('❌ Failed to load initial notification data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new NotificationService();