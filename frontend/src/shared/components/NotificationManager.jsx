import { useEffect } from 'react';
import { toast } from 'react-toastify';
import useUIStore from '../../stores/useUIStore';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * NotificationManager component that listens to Zustand notifications
 * and displays them using react-toastify
 */
const NotificationManager = () => {
  const { notifications, removeNotification } = useUIStore();

  useEffect(() => {
    notifications.forEach((notification) => {
      // Show toast based on notification type
      const toastOptions = {
        autoClose: notification.duration,
        onClose: () => removeNotification(notification.id),
      };

      switch (notification.type) {
        case 'success':
          toast.success(
            <NotificationContent
              icon={<CheckCircle className="w-4 h-4" />}
              message={notification.message}
            />,
            toastOptions
          );
          break;
        case 'error':
          toast.error(
            <NotificationContent
              icon={<XCircle className="w-4 h-4" />}
              message={notification.message}
            />,
            toastOptions
          );
          break;
        case 'warning':
          toast.warning(
            <NotificationContent
              icon={<AlertTriangle className="w-4 h-4" />}
              message={notification.message}
            />,
            toastOptions
          );
          break;
        case 'info':
        default:
          toast.info(
            <NotificationContent
              icon={<Info className="w-4 h-4" />}
              message={notification.message}
            />,
            toastOptions
          );
          break;
      }

      // Remove from Zustand store after showing
      removeNotification(notification.id);
    });
  }, [notifications, removeNotification]);

  return null;
};

/**
 * Custom notification content component
 */
const NotificationContent = ({ icon, message }) => (
  <div className="flex items-start gap-2">
    <div className="flex-shrink-0 mt-0.5">{icon}</div>
    <div className="flex-1">
      <p className="text-sm font-medium">{message}</p>
    </div>
  </div>
);

export default NotificationManager;