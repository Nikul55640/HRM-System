import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Wifi,
  WifiOff,
  RefreshCw,
  Calendar,
  Clock,
  Users,
  Settings,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import useNotificationStore from '../stores/useNotificationStore';
import notificationService from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

/**
 * Notification Bell Component (Responsive)
 */
const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const {
    notifications,
    unreadCount,
    isConnected,
    isConnecting,
    lastError,
  } = useNotificationStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, event) => {
    event.stopPropagation();
    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (id, event) => {
    event.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type, category) => {
    switch (category || type) {
      case 'leave':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'attendance':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'shift':
        return <Users className="w-5 h-5 text-purple-600" />;
      case 'system':
        return <Settings className="w-5 h-5 text-gray-600" />;
      case 'audit':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const ConnectionStatus = () => {
    if (isConnecting) {
      return (
        <div className="flex items-center gap-1 text-xs text-yellow-600">
          <RefreshCw className="animate-spin w-3 h-3" />
          <span>Connecting...</span>
        </div>
      );
    }

    if (!isConnected) {
      return (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-xs text-green-600">
        <Wifi className="w-3 h-3" />
        <span>Live</span>
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        <div
          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
            isConnected
              ? 'bg-green-500'
              : isConnecting
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
        />
      </button>

      {/* Dropdown / Bottom Sheet */}
      {isOpen && (
        <div
          className="
            fixed inset-x-0 bottom-0
            sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2
            w-full sm:w-96
            bg-white rounded-t-xl sm:rounded-lg
            shadow-lg border border-gray-200
            z-50 max-h-[80vh] sm:max-h-96
            overflow-hidden
          "
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <ConnectionStatus />
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
            </div>

            {lastError && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                {lastError}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="overflow-y-auto max-h-[60vh] sm:max-h-80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
                <p className="text-sm">You'll see new notifications here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 20).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 sm:p-3 hover:bg-gray-50 ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {getNotificationIcon(
                        notification.type,
                        notification.category
                      )}

                      <div className="flex-1">
                        <h4 className="text-sm font-medium">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true }
                          )}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs border ${getNotificationColor(
                              notification.type
                            )}`}
                          >
                            {notification.category}
                          </span>

                          <div className="flex gap-1">
                            {!notification.isRead && (
                              <button
                                onClick={(e) =>
                                  handleMarkAsRead(notification.id, e)
                                }
                                className="p-2 sm:p-1 hover:text-blue-600"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) =>
                                handleDelete(notification.id, e)
                              }
                              className="p-2 sm:p-1 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 text-center"
          onClick={() => setIsOpen(false)}>
            <Link
              to="/notifications"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
