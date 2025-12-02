import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { removeNotification } from '../../store/slices/uiSlice'
    ;
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * NotificationManager component that listens to Redux notifications
 * and displays them using react-toastify
 */
const NotificationManager = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.ui.notifications);

  useEffect(() => {
    notifications.forEach((notification) => {
      // Show toast based on notification type
      const toastOptions = {
        autoClose: notification.duration,
        onClose: () => dispatch(removeNotification(notification.id)),
      };

      switch (notification.type) {
        case 'success':
          toast.success(
            <NotificationContent
              icon={<CheckCircle className="w-5 h-5" />}
              message={notification.message}
            />,
            toastOptions
          );
          break;
        case 'error':
          toast.error(
            <NotificationContent
              icon={<XCircle className="w-5 h-5" />}
              message={notification.message}
            />,
            toastOptions
          );
          break;
        case 'warning':
          toast.warning(
            <NotificationContent
              icon={<AlertTriangle className="w-5 h-5" />}
              message={notification.message}
            />,
            toastOptions
          );
          break;
        case 'info':
        default:
          toast.info(
            <NotificationContent
              icon={<Info className="w-5 h-5" />}
              message={notification.message}
            />,
            toastOptions
          );
          break;
      }

      // Remove from Redux store after showing
      dispatch(removeNotification(notification.id));
    });
  }, [notifications, dispatch]);

  return null;
};

/**
 * Custom notification content component
 */
const NotificationContent = ({ icon, message }) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 mt-0.5">{icon}</div>
    <div className="flex-1">
      <p className="text-sm font-medium">{message}</p>
    </div>
  </div>
);

export default NotificationManager;
