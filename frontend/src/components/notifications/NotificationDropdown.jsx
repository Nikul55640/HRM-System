import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button'
import { ScrollArea } from '../../ui/scroll-area'
import { Separator } from '../../ui/separator'
import NotificationItem from './NotificationItem';
import {
  fetchNotifications,
  markAllNotificationsAsRead,
} from '../../store/thunks/employeeSelfServiceThunks';
import { CheckCheck, Inbox } from 'lucide-react';

const NotificationDropdown = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, loading, unreadCount } = useSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    // Fetch only unread notifications for dropdown
    dispatch(fetchNotifications({ isRead: false, limit: 5 }));
  }, [dispatch]);

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllNotificationsAsRead());
    dispatch(fetchNotifications({ isRead: false, limit: 5 }));
  };

  const handleViewAll = () => {
    navigate('/notifications');
    onClose();
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notification List */}
      <ScrollArea className="h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : unreadNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Inbox className="h-12 w-12 mb-2" />
            <p className="text-sm">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y">
            {unreadNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {unreadNotifications.length > 0 && (
        <>
          <Separator />
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleViewAll}
            >
              View all notifications
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
