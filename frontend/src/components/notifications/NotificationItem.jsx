import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';
import { Badge } from '../../ui/badge';
import { Button } from  '../../ui/button'
import { X, Bell, CheckCircle, XCircle, FileText, DollarSign, Calendar, Users } from 'lucide-react';
import {
  markNotificationAsRead,
  deleteNotification,
} from '../../store/thunks/notificationThunks';
import { optimisticMarkAsRead } from '../../store/slices/notificationSlice';

const NotificationItem = ({ notification, onClose, showDelete = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getIcon = (type) => {
    const iconMap = {
      profile_update: Users,
      bank_details_update: DollarSign,
      document_upload: FileText,
      leave_request: Calendar,
      reimbursement_request: DollarSign,
      advance_request: DollarSign,
      transfer_request: Users,
      shift_change_request: Calendar,
      request_approved: CheckCircle,
      request_rejected: XCircle,
      payslip_available: FileText,
      system_announcement: Bell,
    };
    const Icon = iconMap[type] || Bell;
    return <Icon className="h-5 w-5" />;
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colorMap[priority] || colorMap.medium;
  };

  const handleClick = async () => {
    // Mark as read optimistically
    if (!notification.isRead) {
      dispatch(optimisticMarkAsRead(notification._id));
      dispatch(markNotificationAsRead(notification._id));
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      if (onClose) onClose();
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await dispatch(deleteNotification(notification._id));
  };

  return (
    <div
      className={cn(
        'p-4 hover:bg-accent cursor-pointer transition-colors relative group',
        !notification.isRead && 'bg-blue-50'
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            getPriorityColor(notification.priority)
          )}
        >
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm">{notification.title}</h4>
            {showDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleDelete}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
            {!notification.isRead && (
              <Badge variant="secondary" className="text-xs">
                New
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
