import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Badge } from '../../../shared/ui/badge';
import { 
  Bell, 
  Search,  
  Trash2, 
  CheckCircle, 
  Info, 
  Calendar, 
  Users, 
  Clock, 
  AlertCircle,
  Check,
  FileText,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import useNotificationStore from '../../../stores/useNotificationStore';
import notificationService from '../../../services/notificationService';

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    isConnected,
    isConnecting,
    lastError,
    markAsRead,
    removeNotification,
    markAllAsRead,
  } = useNotificationStore();

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      await notificationService.loadInitialData();
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type, category) => {
    const iconProps = { className: "w-5 h-5" };
    
    // Use category first, then fallback to type
    switch (category || type) {
      case 'leave':
        return <Calendar {...iconProps} className="w-5 h-5 text-blue-600" />;
      case 'attendance':
        return <Clock {...iconProps} className="w-5 h-5 text-orange-600" />;
      case 'shift':
        return <Users {...iconProps} className="w-5 h-5 text-purple-600" />;
      case 'system':
        return <Info {...iconProps} className="w-5 h-5 text-gray-600" />;
      case 'audit':
        return <FileText {...iconProps} className="w-5 h-5 text-green-600" />;
      default:
        return <Bell {...iconProps} className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleReconnect = () => {
    notificationService.connectToSSE();
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.category === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'unread' && !notification.isRead) ||
                         (filterStatus === 'read' && notification.isRead);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            Notifications
            {/* Connection Status */}
            <div className="flex items-center gap-2 ml-3">
              {isConnecting ? (
                <div className="flex items-center gap-1 text-xs text-yellow-600">
                  <RefreshCw className="animate-spin w-3 h-3" />
                  <span>Connecting...</span>
                </div>
              ) : isConnected ? (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Wifi className="w-3 h-3" />
                  <span>Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <WifiOff className="w-3 h-3" />
                  <span>Offline</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReconnect}
                    className="ml-1 h-6 px-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Stay updated with real-time alerts and important information
          </p>
          {lastError && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {lastError}
                {lastError.includes('login') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/login'}
                    className="ml-2 h-6 px-2 text-xs"
                  >
                    Login
                  </Button>
                )}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
              <Check className="w-4 h-4 mr-2" />
              Mark All Read ({unreadCount})
            </Button>
          )}
          <Button onClick={loadNotifications} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              <option value="leave">Leave</option>
              <option value="attendance">Attendance</option>
              <option value="shift">Shifts</option>
              <option value="system">System</option>
              <option value="audit">Audit</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Bell className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters to see more notifications.'
                  : 'You\'re all caught up! No new notifications at this time.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all hover:shadow-md ${
                !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
              }`}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="mt-1">
                    {getNotificationIcon(notification.type, notification.category)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getTypeColor(notification.type)}`}
                        >
                          {notification.type}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-gray-100 text-gray-700"
                        >
                          {notification.category}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>

                    {/* Metadata */}
                    {notification.metadata && (
                      <div className="text-xs text-gray-400 mb-2">
                        {notification.metadata.employeeId && (
                          <span>Employee ID: {notification.metadata.employeeId} • </span>
                        )}
                        {notification.metadata.date && (
                          <span>Date: {notification.metadata.date} • </span>
                        )}
                        {notification.metadata.leaveRequestId && (
                          <span>Leave Request: #{notification.metadata.leaveRequestId} • </span>
                        )}
                        {notification.metadata.correctionRequestId && (
                          <span>Correction Request: #{notification.metadata.correctionRequestId} • </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>

                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More Button */}
      {notifications.length > 0 && notifications.length % 20 === 0 && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => {
              // Load more notifications - implement pagination
              toast.info('Load more functionality can be implemented here');
            }}
          >
            Load More Notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;