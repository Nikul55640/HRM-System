import { Check, FileText, DollarSign, Calendar, AlertCircle, Info } from 'lucide-react';
import { Button } from '../../ui/button' ;
import { Badge } from '../../ui/badge' ;
import { formatDate } from '../../../utils/essHelpers';

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const getNotificationIcon = (type) => {
    const icons = {
      payslip: DollarSign,
      leave: Calendar,
      request: FileText,
      alert: AlertCircle,
      info: Info,
      default: Info,
    };
    
    const IconComponent = icons[type] || icons.default;
    return IconComponent;
  };

  const getNotificationColor = (type) => {
    const colors = {
      payslip: 'text-green-600 bg-green-50',
      leave: 'text-blue-600 bg-blue-50',
      request: 'text-yellow-600 bg-yellow-50',
      alert: 'text-red-600 bg-red-50',
      info: 'text-gray-600 bg-gray-50',
      default: 'text-gray-600 bg-gray-50',
    };
    
    return colors[type] || colors.default;
  };

  const IconComponent = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);

  return (
    <div 
      className={`p-4 hover:bg-muted/50 transition-colors ${
        !notification.read ? 'bg-blue-50/30' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${colorClass}`}>
          <IconComponent className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium">
                {notification.title || notification.message}
              </p>
              {notification.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {formatDate(notification.createdAt, 'medium')}
              </p>
            </div>
            
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification._id)}
                className="h-8 w-8 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {notification.actionUrl && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 mt-2 text-xs"
              onClick={() => {
                // Navigate to action URL
                window.location.href = notification.actionUrl;
              }}
            >
              View Details →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
