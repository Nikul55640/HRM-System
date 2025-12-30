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
  DollarSign,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate } from '../../ess/utils/essHelpers';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // Mock data - replace with actual API call
      const mockNotifications = [...Array(10)].map((_, i) => ({
        id: i + 1,
        title: `Notification ${i + 1}`,
        message: `This is notification ${i + 1}.`,
        type: 'leave',
        priority: 'low',
        status: 'unread',
        read: false,
        createdAt: new Date(),
      }));
      setNotifications(mockNotifications);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    const iconProps = { className: "w-5 h-5" };
    
    switch (type) {
      case 'leave':
        return <Calendar {...iconProps} className="w-5 h-5 text-blue-600" />;
      case 'attendance':
        return <CheckCircle {...iconProps} className="w-5 h-5 text-orange-600" />;
      case 'system':
        return <Info {...iconProps} className="w-5 h-5 text-gray-600" />;
      case 'announcement':
        return <FileText {...iconProps} className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell {...iconProps} className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const markAsRead = async (id) => {
    try {
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      // API call would go here
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      // API call would go here
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      setNotifications(notifications.filter(n => n.id !== id));
      // API call would go here
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'unread' && !notification.read) ||
                         (filterStatus === 'read' && notification.read);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

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
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Notifications
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Stay updated with important information and alerts
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              <Check className="w-4 h-4 mr-2" />
              Mark All Read ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
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
              <option value="all">All Types</option>
              <option value="leave">Leave</option>
              <option value="attendance">Attendance</option>
              <option value="system">System</option>
              <option value="announcement">Announcements</option>
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
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
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
                !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
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
                          className={`text-xs ${getPriorityColor(notification.priority)}`}
                        >
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {formatDate(notification.createdAt)}
                      </span>

                      <div className="flex items-center gap-2">
                        {notification.actionUrl && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.location.href = notification.actionUrl}
                          >
                            View
                          </Button>
                        )}
                        
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                          <Check className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-700"
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
    </div>
  );
};

export default NotificationsPage;