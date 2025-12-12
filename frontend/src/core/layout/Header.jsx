import { Link } from 'react-router-dom';
import { Bell, Search, Settings, User, LogOut, ChevronDown, HelpCircle, Mail } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '../../shared/ui/button';
import { Icon } from '../../shared/components';
import useAuth from '../hooks/useAuth';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Sample notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'leave',
      title: 'Leave Request Approved',
      message: 'Your leave request for Dec 10-12 has been approved',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'payroll',
      title: 'Payslip Available',
      message: 'Your November payslip is now available',
      time: '1 day ago',
      read: false,
    },
    {
      id: 3,
      type: 'announcement',
      title: 'Company Holiday',
      message: 'Office will be closed on Dec 25th',
      time: '2 days ago',
      read: true,
    },
  ]);

  const notificationCount = notifications.filter(n => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    const iconProps = "w-5 h-5";
    switch (type) {
      case 'leave':
        return <Icon name="Palmtree" className={`${iconProps} text-blue-600`} />;
      case 'payroll':
        return <Icon name="DollarSign" className={`${iconProps} text-green-600`} />;
      case 'announcement':
        return <Icon name="Megaphone" className={`${iconProps} text-orange-600`} />;
      default:
        return <Bell className={iconProps} />;
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0].substring(0, 2).toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  // Avatar color based on role
  const getAvatarColor = (role) => {
    switch (role) {
      case 'SuperAdmin':
        return 'bg-purple-600';
      case 'HR Manager':
        return 'bg-blue-600';
      case 'HR Administrator':
        return 'bg-green-600';
      case 'Manager':
        return 'bg-orange-600';
      case 'Employee':
        return 'bg-gray-600';
      default:
        return 'bg-blue-600';
    }
  };

  // Role badge color
  const getRoleBadge = (role) => {
    const badges = {
      'SuperAdmin': 'bg-purple-100 text-purple-700',
      'HR Manager': 'bg-blue-100 text-blue-700',
      'HR Administrator': 'bg-green-100 text-green-700',
      'Manager': 'bg-orange-100 text-orange-700',
      'Employee': 'bg-gray-100 text-gray-700',
    };
    return badges[role] || badges['Employee'];
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Search */}
          <div className="flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Right Section - Actions */}
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              {/* Help */}
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <Link to="/help">
                  <HelpCircle className="w-5 h-5" />
                </Link>
              </Button>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowNotifications(false)}
                    ></div>
                    
                    {/* Notification Panel */}
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                        {notificationCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      {/* Notification List */}
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                !notification.read ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-sm font-medium text-gray-800">
                                      {notification.title}
                                    </h4>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-400">
                                      {notification.time}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                      }}
                                      className="text-xs text-red-600 hover:text-red-700"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-3 border-t border-gray-200">
                        <Link
                          to="/notifications"
                          className="text-sm text-blue-600 hover:text-blue-700 block text-center"
                          onClick={() => setShowNotifications(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Settings (Admin/Manager only) */}
              {(user?.role === 'SuperAdmin' || user?.role === 'HR Manager') && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden sm:flex"
                >
                  <Link to="/settings">
                    <Settings className="w-5 h-5" />
                  </Link>
                </Button>
              )}

              {/* Divider */}
              <div className="h-8 w-px bg-gray-200 mx-2"></div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 rounded-lg"
                >
                  {/* User Avatar with Initials */}
                  <div className={`w-9 h-9 ${getAvatarColor(user?.role)} rounded-lg flex items-center justify-center`}>
                    <span className="text-white font-medium text-sm">{getUserInitials()}</span>
                  </div>
                  
                  {/* User Info */}
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-medium text-gray-800">
                      {user?.fullName || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded inline-block ${getRoleBadge(user?.role)}`}>
                      {user?.role}
                    </div>
                  </div>
                  
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg py-2 z-20">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${getAvatarColor(user?.role)} rounded-lg flex items-center justify-center`}>
                            <span className="text-white font-medium">{getUserInitials()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">
                              {user?.fullName || 'User'}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {user?.email}
                            </div>
                            {user?.employeeNumber && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                ID: {user.employeeNumber}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded inline-block mt-2 ${getRoleBadge(user?.role)}`}>
                          {user?.role}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>
                        
                        <Link
                          to="/notifications"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Mail className="w-4 h-4" />
                          <span>Messages</span>
                          {notificationCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {notificationCount}
                            </span>
                          )}
                        </Link>
                        
                        {(user?.role === 'SuperAdmin' || user?.role === 'HR Manager') && (
                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </Link>
                        )}

                        <Link
                          to="/help"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Help & Support</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-200 pt-1 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
